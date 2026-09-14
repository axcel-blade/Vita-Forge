/* src/features/resume-builder/components/templates/TemplateModern.jsx */

import React from "react";
import {
  Section,
  ExperienceBlock,
  EducationBlock,
  AchievementsBlock,
  ProjectsBlock,
  SkillsBlock,
  VoluntaryBlock,
  CertificateBlock,
  InterestsBlock,
  ReferencesBlock,
  sortByRecencyDesc,
  getSectionOrder,
  RESUME_FONT_STACK,
  RESUME_TEXT_SIZE,
} from "../../../../components/TemplateSharedParts";

/* Headings used both on the rendered resume and in the editor labels. */
const HEADINGS = {
  summary:      "Career Objective",
  experience:   "Professional Experience",
  education:    "Education",
  projects:     "Projects",
  skills:       "Key Skills",
  achievements: "Achievements and Awards",
  voluntary:    "Volunteer Work",
  certificates: "Certificates & Licenses",
  interests:    "Interests",
  references:   "References",
};

export default function TemplateModern({ data }) {
  const accent = data.meta?.accent || "#0ea5e9";
  const fontFamily = RESUME_FONT_STACK;
  const p = data.profile;

  const experience   = sortByRecencyDesc(data.experience   || []);
  const voluntary    = sortByRecencyDesc(data.voluntary    || []);
  const projects     = sortByRecencyDesc(data.projects     || []);
  const education    = sortByRecencyDesc(data.education    || []);
  const certificates = sortByRecencyDesc(data.certificates || [], { startKey: "year", endKey: "expiry" });
  const achievements = sortByRecencyDesc(data.achievements || [], { startKey: "year", endKey: "year" });
  const interests    = (data.interests || []).filter(Boolean);

  // ── Body sections, keyed by id so we can render them in user-defined order ──
  const renderSection = (id) => {
    switch (id) {
      case "experience":
        return experience.length > 0 && (
          <Section title={HEADINGS.experience} accent={accent}>
            {experience.map((e) => <ExperienceBlock key={e.id} e={e} />)}
          </Section>
        );
      case "education":
        return education.length > 0 && (
          <Section title={HEADINGS.education} accent={accent}>
            {education.map((e) => <EducationBlock key={e.id} e={e} />)}
          </Section>
        );
      case "projects":
        return projects.length > 0 && (
          <Section title={HEADINGS.projects} accent={accent}>
            {projects.map((proj) => <ProjectsBlock key={proj.id} p={proj} />)}
          </Section>
        );
      case "skills":
        return data.skillGroups?.length > 0 && (
          <Section title={HEADINGS.skills} accent={accent}>
            {data.skillGroups.map((g) => <SkillsBlock key={g.id} group={g} />)}
          </Section>
        );
      case "achievements":
        return achievements.length > 0 && (
          <Section title={HEADINGS.achievements} accent={accent}>
            {achievements.map((a) => <AchievementsBlock key={a.id} a={a} />)}
          </Section>
        );
      case "voluntary":
        return voluntary.length > 0 && (
          <Section title={HEADINGS.voluntary} accent={accent}>
            {voluntary.map((v) => <VoluntaryBlock key={v.id} v={v} />)}
          </Section>
        );
      case "certificates":
        return certificates.length > 0 && (
          <Section title={HEADINGS.certificates} accent={accent}>
            {certificates.map((c) => <CertificateBlock key={c.id} c={c} />)}
          </Section>
        );
      case "interests":
        return interests.length > 0 && (
          <Section title={HEADINGS.interests} accent={accent}>
            <InterestsBlock interests={interests} />
          </Section>
        );
      default:
        return null;
    }
  };

  const sectionOrder = getSectionOrder(data.meta);

  return (
    <div
      style={{
        fontFamily,
        fontSize: RESUME_TEXT_SIZE,
        lineHeight: 1.45,
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        padding: "0",
        width: "100%",
        boxSizing: "border-box",
        wordWrap: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {/* ── NAME ── */}
      <div style={{ fontSize: "16pt", fontWeight: "700", color: accent, lineHeight: 1.1, marginBottom: "4px", fontFamily }}>
        {p.fullName}
      </div>

      {/* ── TITLE — same 11pt as section text (VMock Title size check) ── */}
      {p.title && (
        <div style={{ fontSize: RESUME_TEXT_SIZE, fontWeight: "400", color: "#3c3c3c", marginBottom: "5px", fontFamily }}>
          {p.title}
        </div>
      )}

      {/* ── CONTACT ── */}
      <div style={{ fontSize: RESUME_TEXT_SIZE, color: "#505050", marginBottom: "4px", fontFamily }}>
        {[p.email, p.phone, p.location, p.website].filter(Boolean).join("   ")}
      </div>

      {/* ── LINKS ── single row of clickable labels, separated by bullets ── */}
      {data.links?.length > 0 && (
        <div style={{ fontSize: RESUME_TEXT_SIZE, lineHeight: 1.6, fontFamily, marginBottom: "10px" }}>
          {data.links.map((l, i) => (
            <React.Fragment key={l.id}>
              {i > 0 && <span style={{ color: "#505050" }}>  •  </span>}
              <a
                href={(l.url || "").startsWith("http") ? l.url : `https://${l.url || ""}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: accent, textDecoration: "none", fontWeight: "700" }}
              >
                {l.label || l.url}
              </a>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Career Objective — always pinned to the top of the body */}
      {p.summary && (
        <Section title={HEADINGS.summary} accent={accent}>
          <div style={{ fontSize: RESUME_TEXT_SIZE, color: "#323232", lineHeight: 1.6, fontFamily, wordBreak: "break-word" }}>
            {p.summary}
          </div>
        </Section>
      )}

      {/* Moveable sections, rendered in user-defined order */}
      {sectionOrder.map((id) => (
        <React.Fragment key={id}>{renderSection(id)}</React.Fragment>
      ))}

      {/* References — always pinned to the bottom */}
      <Section title={HEADINGS.references} accent={accent}>
        <ReferencesBlock references={data.references} />
      </Section>
    </div>
  );
}