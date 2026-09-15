/* src/features/resume-builder/pages/Builder.jsx */

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import { useToast } from "../../../components/Toast";
import { useKeyboardShortcuts } from "../../../utils/keyboardShortcuts";
import ResumeEditor from "../components/editors/ResumeEditor";
import A4PaginatedPreview from "../components/preview/A4PaginatedPreview";
import TemplateModern from "../components/templates/TemplateModern";
import TemplateBasic from "../components/templates/TemplateBasic";
import { defaultData } from "../../../constants/defaultData";
import { applyMarketplaceTemplate } from "../../../constants/templates";
import { readProfileBundle, writeProfileBundle } from "../../shared/services/profileBundle";
import { useAuth } from "../../../services/auth-context";
import { pullRemoteProfile, pushRemoteProfile } from "../../../services/profile-sync";

export default function Builder() {
  const [data, setData] = useState(defaultData);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [searchParams] = useSearchParams();
  const previewRef = useRef(null);
  const skipNextPush = useRef(true);
  const lastGoodRef = useRef(defaultData);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const set = (patch) => setData((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    const bundle = readProfileBundle();
    let next = bundle.resume || defaultData;
    const templateId = searchParams.get("template");
    if (templateId) {
      next = { ...next, meta: applyMarketplaceTemplate(next.meta, templateId) };
    }
    setData(next);
    lastGoodRef.current = next;
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    let cancelled = false;
    setSyncing(true);
    setSyncError("");
    pullRemoteProfile().then((result) => {
      if (cancelled) {
        return;
      }
      if (result.resume) {
        skipNextPush.current = true;
        setData(result.resume);
        lastGoodRef.current = result.resume;
      }
      if (result.error) {
        setSyncError(result.error);
      }
      setSyncing(false);
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    writeProfileBundle({ resume: data });
    if (!isAuthenticated) {
      return;
    }
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }

    const snapshot = data;
    const timer = window.setTimeout(() => {
      setSyncing(true);
      pushRemoteProfile(snapshot, readProfileBundle().coverLetter).then((result) => {
        setSyncing(false);
        if (result.error) {
          setSyncError(result.error);
          toast.error(result.error);
          skipNextPush.current = true;
          setData(lastGoodRef.current);
          writeProfileBundle({ resume: lastGoodRef.current });
          return;
        }
        lastGoodRef.current = snapshot;
        setSyncError("");
      });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [data, isAuthenticated]);

  useKeyboardShortcuts(
    {
      "ctrl+s": () => {
        if (!isAuthenticated) {
          toast.info("Sign in to save your changes");
        }
      },
    },
    [isAuthenticated, data]
  );

  const getTemplateComponent = () => {
    const layout = data.meta?.layout || data.meta?.template || "modern";
    if (layout === "basic") return TemplateBasic;
    return TemplateModern;
  };

  return (
    <section className="mx-auto max-w-[1700px] p-4">
      {authLoading || syncing ? (
        <p className="mt-2 text-sm text-sky-700">Saving…</p>
      ) : null}
      {syncError ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {syncError}
        </p>
      ) : null}
      <Toolbar data={data} set={set} />
      <div className="mx-auto flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-4 py-2">
              <p className="text-sm font-semibold text-gray-700">Profile</p>
            </div>
            <div className="max-h-[calc(100vh-160px)] overflow-y-auto bg-gray-100 p-4">
              <ResumeEditor data={data} set={set} />
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-4 py-2">
              <p className="text-sm font-semibold text-gray-700">Resume Preview (A4 Pages)</p>
            </div>
            <div className="max-h-[calc(100vh-160px)] overflow-y-auto bg-gray-100 p-4">
              <A4PaginatedPreview
                ref={previewRef}
                data={data}
                templateComponent={getTemplateComponent()}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
