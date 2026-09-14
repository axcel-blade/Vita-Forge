/* src/features/resume-builder/components/editors/ResumeEditor.jsx */

import React, { useState } from "react";
import ProfileEditor from "./ProfileEditor";
import ExperienceEditor from "./ExperienceEditor";
import EducationEditor from "./EducationEditor";
import ProjectsEditor from "./ProjectsEditor";
import SkillsEditor from "./SkillsEditor";
import AchievementsEditor from "./AchievementsEditor";
import VoluntaryEditor from "./VoluntaryEditor";
import CertificatesEditor from "./CertificatesEditor";
import InterestsEditor from "./InterestsEditor";
import ReferencesEditor from "./ReferencesEditor";
import { IconButton, SectionCard } from "../SharedInputs";
import { getSectionOrder } from "../../../../components/TemplateSharedParts";
import { applyMarketplaceTemplate, MARKETPLACE_TEMPLATES } from "../../../../constants/templates";

// ─── Section maps ──────────────────────────────────────────────────────────
// Labels match the headings rendered on the resume itself, so the editor
// reads the same as the document the user is producing.
const SECTION_LABELS = {
  experience:   "Professional Experience",
  education:    "Education",
  projects:     "Projects",
  skills:       "Key Skills",
  achievements: "Achievements and Awards",
  voluntary:    "Volunteer Work",
  certificates: "Certificates & Licenses",
  interests:    "Interests",
};

const SECTION_EDITORS = {
  experience:   ExperienceEditor,
  education:    EducationEditor,
  projects:     ProjectsEditor,
  skills:       SkillsEditor,
  achievements: AchievementsEditor,
  voluntary:    VoluntaryEditor,
  certificates: CertificatesEditor,
  interests:    InterestsEditor,
};

export default function ResumeEditor({ data, set }) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const templates = MARKETPLACE_TEMPLATES;

  const selectTemplate = (templateId) => {
    set({ meta: applyMarketplaceTemplate(data.meta, templateId) });
    setShowTemplateSelector(false);
  };

  // ── Section reordering ────────────────────────────────────────────────────
  const sectionOrder = getSectionOrder(data.meta);

  const moveSection = (index, delta) => {
    const next = sectionOrder.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set({ meta: { ...data.meta, sectionOrder: next } });
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Resume Template"
        action={
          <IconButton onClick={() => setShowTemplateSelector(!showTemplateSelector)}>
            {showTemplateSelector ? "Close" : "Change"}
          </IconButton>
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Current: </span>
          <span className="text-sm font-semibold text-sky-600">
            {templates.find((t) => t.id === data.meta.template)?.name || "Modern"}
          </span>
        </div>

        {showTemplateSelector && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template.id)}
                className={`rounded-xl p-4 border-2 transition ${
                  data.meta.template === template.id
                    ? "border-sky-600 bg-sky-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-3xl mb-2">{template.icon}</div>
                <div className="text-sm font-semibold text-gray-700">{template.name}</div>
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Section Order ─────────────────────────────────────────────────────
          Lets the user reorder the moveable body sections. Profile (header
          + Career Objective) and References stay fixed at the top and
          bottom of the resume respectively, so they're not listed here. */}
      <SectionCard title="Section Order">
        <p className="text-xs text-gray-500 italic mb-3">
          Reorder how sections appear on your resume. Profile (top) and References
          (bottom) are fixed.
        </p>
        <ul className="space-y-1.5">
          {sectionOrder.map((id, i) => (
            <li
              key={id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-600">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {SECTION_LABELS[id] || id}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => moveSection(i, -1)}
                  disabled={i === 0}
                  title="Move up"
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(i, +1)}
                  disabled={i === sectionOrder.length - 1}
                  title="Move down"
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Profile is fixed at the top */}
      <ProfileEditor data={data} set={set} />

      {/* Moveable editors — rendered in the user-defined order so the editor
          mirrors the resume layout. */}
      {sectionOrder.map((id) => {
        const Editor = SECTION_EDITORS[id];
        return Editor ? <Editor key={id} data={data} set={set} /> : null;
      })}

      {/* References is fixed at the bottom */}
      <ReferencesEditor data={data} set={set} />
    </div>
  );
}