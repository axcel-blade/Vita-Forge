/* src/apps/cover-letter/pages/CoverLetterHome.jsx */

import React, { useEffect, useMemo, useRef, useState } from "react";
import CoverLetterForm from "../components/CoverLetterForm";
import CoverLetterPreview from "../components/CoverLetterPreview";
import { buildCoverLetter } from "../services/buildCoverLetter";
import { exportCoverLetterPdf } from "../services/exportCoverLetterPdf";
import {
  buildProfileExport,
  normalizeImportedProfile,
  readProfileBundle,
  writeProfileBundle,
} from "../../shared/services/profileBundle";
import { defaultCoverLetterData, defaultData } from "../../../constants/defaultData";
import { useAuth } from "../../../services/auth-context";
import { pullRemoteProfile, pushRemoteProfile } from "../../../services/profile-sync";
import { createCoverLetterVersion } from "../../../services/user";

const initialForm = defaultCoverLetterData;

const sanitizeLine = (value) => (value || "").replace(/\s+/g, " ").trim();

const extractResumeIdentity = (resume) => {
  const profile = resume?.profile || {};
  return {
    fullName: profile.fullName || "",
    email: profile.email || "",
    phone: profile.phone || "",
  };
};

const deriveFromResume = (resume) => {
  const profile = resume?.profile || {};
  const skillTitles = (resume?.skillGroups || [])
    .map((group) => sanitizeLine(group.title))
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");
  const topBullets = (resume?.experience || [])
    .flatMap((exp) => exp?.bullets || [])
    .map((bullet) => sanitizeLine(bullet))
    .filter(Boolean);

  return {
    ...initialForm,
    ...extractResumeIdentity(resume),
    jobTitle: sanitizeLine(profile.title || ""),
    topSkills: skillTitles,
    achievements: topBullets.slice(0, 2).join("; "),
  };
};

export default function CoverLetterHome() {
  const [formData, setFormData] = useState(initialForm);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [hasResumeIdentity, setHasResumeIdentity] = useState(false);
  const [syncError, setSyncError] = useState("");
  const fileInputRef = useRef(null);
  const skipNextPush = useRef(true);
  const lastGoodRef = useRef(initialForm);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const letter = useMemo(() => buildCoverLetter(formData), [formData]);

  useEffect(() => {
    const bundle = readProfileBundle();
    const resumeIdentity = bundle.resume ? extractResumeIdentity(bundle.resume) : null;
    setHasResumeIdentity(
      Boolean(resumeIdentity?.fullName || resumeIdentity?.email || resumeIdentity?.phone),
    );
    if (bundle.coverLetter) {
      const next = { ...initialForm, ...bundle.coverLetter, ...resumeIdentity };
      setFormData(next);
      lastGoodRef.current = next;
      return;
    }
    if (bundle.resume) {
      const next = deriveFromResume(bundle.resume);
      setFormData(next);
      lastGoodRef.current = next;
      return;
    }
    setFormData(defaultCoverLetterData);
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }
    let cancelled = false;
    pullRemoteProfile().then((result) => {
      if (cancelled) {
        return;
      }
      if (result.coverLetter) {
        skipNextPush.current = true;
        setFormData((prev) => ({ ...prev, ...result.coverLetter }));
        lastGoodRef.current = { ...lastGoodRef.current, ...result.coverLetter };
      }
      if (result.error) {
        setSyncError(result.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    writeProfileBundle({ coverLetter: formData });
    if (!isAuthenticated) {
      return;
    }
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    const snapshot = formData;
    const timer = window.setTimeout(() => {
      pushRemoteProfile(readProfileBundle().resume, snapshot).then((result) => {
        if (result.error) {
          setSyncError(result.error);
          skipNextPush.current = true;
          setFormData(lastGoodRef.current);
          return;
        }
        lastGoodRef.current = snapshot;
        setSyncError("");
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [formData, isAuthenticated]);

  const handleSaveVersion = async () => {
    setIsSavingVersion(true);
    try {
      const result = await pushRemoteProfile(readProfileBundle().resume, formData);
      if (result.error) {
        setSyncError(result.error);
        return;
      }
      await createCoverLetterVersion(`Cover letter ${new Date().toLocaleString()}`);
      setSyncError("");
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Could not save cover letter");
    } finally {
      setIsSavingVersion(false);
    }
  };

  const handleSavePdf = () => {
    try {
      setIsSavingPdf(true);
      exportCoverLetterPdf({
        letter,
        fullName: formData.fullName,
      });
    } catch (error) {
      console.error("Cover letter PDF export failed:", error);
      alert(`Failed to generate PDF:\n${error.message}`);
    } finally {
      setIsSavingPdf(false);
    }
  };

  const handleExportJson = () => {
    const bundle = readProfileBundle();
    const payload = buildProfileExport({
      resume: bundle.resume || defaultData,
      coverLetter: formData,
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(formData.fullName || "cover_letter").replace(/\s+/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const normalized = normalizeImportedProfile(parsed);
        if (normalized.resume) {
          writeProfileBundle({ resume: normalized.resume });
          const resumeIdentity = extractResumeIdentity(normalized.resume);
          setHasResumeIdentity(
            Boolean(resumeIdentity.fullName || resumeIdentity.email || resumeIdentity.phone),
          );
        }
        if (normalized.coverLetter) {
          const resumeIdentity = normalized.resume ? extractResumeIdentity(normalized.resume) : {};
          setFormData((prev) => ({ ...prev, ...normalized.coverLetter, ...resumeIdentity }));
        } else if (normalized.resume) {
          setFormData(deriveFromResume(normalized.resume));
        }
      } catch (error) {
        alert(`Invalid JSON file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("Reset cover letter details?")) {
      const bundle = readProfileBundle();
      if (bundle.resume) {
        setFormData(deriveFromResume(bundle.resume));
        return;
      }
      setFormData(initialForm);
    }
  };

  return (
    <section className="mx-auto max-w-[1700px] p-4">
      <h1 className="text-3xl font-bold text-gray-900">Cover Letter Writer</h1>
      <p className="mt-2 max-w-3xl text-gray-600">
        Create a focused, role-specific draft letter by filling in your details and experience highlights.
      </p>
      {syncError ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {syncError}
        </p>
      ) : null}
      <div className="sticky top-0 z-40 mt-4 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm print:hidden">
        <button
          type="button"
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-50"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          type="button"
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-50"
          onClick={handleExportJson}
        >
          Export JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleImportJson(file);
          }}
        />
        <button
          type="button"
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          Import JSON
        </button>
        {isAuthenticated ? (
          <button
            type="button"
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={handleSaveVersion}
            disabled={isSavingVersion}
          >
            {isSavingVersion ? "Saving..." : "Save to dashboard"}
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
          onClick={handleSavePdf}
          disabled={isSavingPdf}
        >
          {isSavingPdf ? "Saving PDF..." : "Save as PDF"}
        </button>
      </div>
      <div className="mx-auto mt-4 flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-4 py-2">
              <p className="text-sm font-semibold text-gray-700">Your Details</p>
            </div>
            <div className="max-h-[calc(100vh-160px)] overflow-y-auto bg-gray-100 p-4">
              <CoverLetterForm
                formData={formData}
                setFormData={setFormData}
                hasResumeIdentity={hasResumeIdentity}
              />
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-4 py-2">
              <p className="text-sm font-semibold text-gray-700">Cover Letter Preview (A4)</p>
            </div>
            <div className="max-h-[calc(100vh-160px)] overflow-y-auto bg-gray-100 p-4">
              <CoverLetterPreview letter={letter} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
