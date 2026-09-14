/* src/features/resume-builder/components/Toolbar.jsx */

import React, { useRef } from "react";
import jsPDF from "jspdf";
import {
  formatDate,
  formatDateRange,
  sortByRecencyDesc,
  normalizeBullets,
  formatInstitutionName,
} from "../../../utils/format";
import { getSectionOrder } from "../../../components/TemplateSharedParts";
import {
  buildProfileExport,
  normalizeImportedProfile,
  readProfileBundle,
  writeProfileBundle,
} from "../../shared/services/profileBundle";
import { defaultCoverLetterData, defaultData } from "../../../constants/defaultData";

// ─── Layout (mm) ────────────────────────────────────────────────────────────
// Community checkers measure *visual* whitespace to the glyph, not the jsPDF
// text baseline. 0.9" (22.86mm) left/right/bottom sits in the 0.75–1" band.
// Top uses extra offset so the 22pt name cap-height still clears 0.75".
const PAGE_W    = 210;
const PAGE_H    = 297;
const SIDE_MM   = 22.86;          // 0.90 inch
const ML        = SIDE_MM;
const MR        = SIDE_MM;
const MB        = SIDE_MM;
const MT        = 29.5;           // 0.90" visual + ~6.6mm name ascent
const CONTENT_W = PAGE_W - ML - MR;
const BULLET_INDENT = 6;
const BULLET_HANG   = 4;

const FS = {
  name:        16,
  title:       11,
  contact:     11,
  sectionHead: 11,
  body:        11,
};

// Headings + section order match the on-screen templates exactly so the PDF
// is a faithful copy of what the user sees in the preview.
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

// jsPDF only ships with three built-in fonts: helvetica, times, courier.
// We standardise on helvetica everywhere since the on-screen templates use a
// sans-serif stack (Helvetica Neue → Arial fallback) and the workbook
// recommends sans-serif for resumes (Resume Workbook p.24).
const BODY_FONT = "helvetica";

// ─── Helpers ────────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function ensureSpace(pdf, y, neededMM) {
  if (y + neededMM > PAGE_H - MB) {
    pdf.addPage();
    return MT;
  }
  return y;
}

function drawSectionHead(pdf, label, y, accent) {
  const [r, g, b] = hexToRgb(accent);
  pdf.setFontSize(FS.sectionHead);
  pdf.setFont(BODY_FONT, "bold");
  pdf.setTextColor(r, g, b);
  pdf.text(label.toUpperCase(), ML, y);
  y += 1.5;
  pdf.setDrawColor(r, g, b);
  pdf.setLineWidth(0.3);
  pdf.line(ML, y, ML + CONTENT_W, y);
  pdf.setTextColor(0, 0, 0);
  y += 4;
  return y;
}

function drawBullet(pdf, text, y) {
  const bulletX = ML + BULLET_INDENT;
  const textX   = bulletX + BULLET_HANG;
  const wrapW   = CONTENT_W - BULLET_INDENT - BULLET_HANG;
  const lineH   = 4.2;
  const lines   = pdf.splitTextToSize(text, wrapW);

  y = ensureSpace(pdf, y, lines.length * lineH + 1);
  lines.forEach((line, i) => {
    if (i === 0) pdf.text("\u2022", bulletX, y);
    pdf.text(line, textX, y);
    y += lineH;
  });
  return y;
}

function drawBullets(pdf, bullets, y, { period = true } = {}) {
  if (!bullets?.length) return y;
  const items = normalizeBullets(bullets, { period });
  pdf.setFontSize(FS.body);
  pdf.setFont(BODY_FONT, "normal");
  pdf.setTextColor(50, 50, 50);
  items.forEach((b) => { y = drawBullet(pdf, b, y); });
  return y;
}

// Renders bullets joined into a single paragraph (Skills section). Mirrors
// the on-screen SkillsBlock which uses paragraph form rather than bullets.
function drawParagraph(pdf, bullets, y, { period = true } = {}) {
  const items = (bullets || []).filter((b) => b && String(b).trim().length > 0);
  if (!items.length) return y;
  const paragraph = normalizeBullets(items, { period }).join(" ");

  pdf.setFontSize(FS.body);
  pdf.setFont(BODY_FONT, "normal");
  pdf.setTextColor(50, 50, 50);

  const lineH = 4.5;
  const lines = pdf.splitTextToSize(paragraph, CONTENT_W);
  lines.forEach((line) => {
    y = ensureSpace(pdf, y, lineH + 1);
    pdf.text(line, ML, y);
    y += lineH;
  });
  return y;
}

// Title (and optional org) left, date range bold-italic right — same 11pt.
// Left text is wrapped to CONTENT_W minus the measured date width so long
// degrees/schools cannot overwrite the date.
function drawEntryHeader(pdf, title, secondary, date, y) {
  pdf.setFontSize(FS.body);
  const dateStr = date || "";
  const gapMm = 3.5;
  const lineH = 4.5;

  pdf.setFont(BODY_FONT, "bolditalic");
  const dateW = dateStr ? pdf.getTextWidth(dateStr) : 0;
  const leftW = Math.max(20, CONTENT_W - (dateW ? dateW + gapMm : 0));

  const titleStr = title || "";
  const secondaryStr = secondary ? ` | ${secondary}` : "";

  pdf.setFont(BODY_FONT, "bold");
  const titleW = pdf.getTextWidth(titleStr);
  pdf.setFont(BODY_FONT, "normal");
  const secW = secondaryStr ? pdf.getTextWidth(secondaryStr) : 0;
  const fitsOneLine = titleW + secW <= leftW;

  const drawDate = (atY) => {
    if (!dateStr) return;
    pdf.setFont(BODY_FONT, "bolditalic");
    pdf.setTextColor(30, 30, 30);
    pdf.text(dateStr, ML + CONTENT_W, atY, { align: "right" });
  };

  if (fitsOneLine) {
    y = ensureSpace(pdf, y, lineH + 1);
    pdf.setFont(BODY_FONT, "bold");
    pdf.setTextColor(30, 30, 30);
    pdf.text(titleStr, ML, y);
    if (secondaryStr) {
      pdf.setFont(BODY_FONT, "normal");
      pdf.setTextColor(90, 90, 90);
      pdf.text(secondaryStr, ML + titleW, y);
    }
    drawDate(y);
    return y + lineH;
  }

  // Wrap title (bold) and secondary (regular) separately so school/company
  // names never switch from regular to bold when a line wraps.
  let first = true;
  const emitLines = (lines, bold) => {
    lines.forEach((line) => {
      y = ensureSpace(pdf, y, lineH + 1);
      pdf.setFont(BODY_FONT, bold ? "bold" : "normal");
      pdf.setTextColor(bold ? 30 : 90, bold ? 30 : 90, bold ? 30 : 90);
      pdf.text(line, ML, y);
      if (first) {
        drawDate(y);
        first = false;
      }
      y += lineH;
    });
  };

  pdf.setFont(BODY_FONT, "bold");
  emitLines(titleStr ? pdf.splitTextToSize(titleStr, leftW) : [], true);
  if (secondary) {
    pdf.setFont(BODY_FONT, "normal");
    emitLines(pdf.splitTextToSize(String(secondary), leftW), false);
  }
  return y;
}

function drawMetaLine(pdf, text, y) {
  if (!text) return y;
  pdf.setFontSize(FS.body);
  pdf.setFont(BODY_FONT, "normal");
  pdf.setTextColor(80, 80, 80);
  const lineH = 4.2;
  const lines = pdf.splitTextToSize(String(text), CONTENT_W);
  lines.forEach((line) => {
    y = ensureSpace(pdf, y, lineH + 1);
    pdf.text(line, ML, y);
    y += lineH;
  });
  return y;
}

// Renders all profile links on a single row of clickable labels separated by
// bullets, e.g.  LinkedIn  •  GitHub  •  Portfolio. Greedy-packs onto extra
// lines if the row exceeds the content width. Each label gets its own
// pdf.link() hotspot so the click target is exactly the visible text.
function drawLinksInline(pdf, links, y, accentRgb, align = "left") {
  if (!links?.length) return y;
  const [ar, ag, ab] = accentRgb;
  const sep   = "  •  ";
  const lineH = 4.5;
  const capH  = 4.2;
  const maxW  = CONTENT_W;

  pdf.setFontSize(FS.contact);

  // Pre-measure separator (regular weight) and each label (bold weight).
  pdf.setFont(BODY_FONT, "normal");
  const sepW = pdf.getTextWidth(sep);

  pdf.setFont(BODY_FONT, "bold");
  const items = links.map((l) => {
    const text = l.label || l.url || "";
    const url  = l.url || "";
    return {
      text,
      href: url.startsWith("http") ? url : `https://${url}`,
      w:    pdf.getTextWidth(text),
    };
  });

  // Greedy line packing.
  const lines = [];
  let line = [];
  let lineW = 0;
  items.forEach((it) => {
    const need = line.length === 0 ? it.w : sepW + it.w;
    if (lineW + need > maxW && line.length > 0) {
      lines.push({ items: line, w: lineW });
      line = [it];
      lineW = it.w;
    } else {
      line.push(it);
      lineW += need;
    }
  });
  if (line.length > 0) lines.push({ items: line, w: lineW });

  // Render each packed line, centering or left-aligning per template.
  lines.forEach(({ items: row, w }) => {
    y = ensureSpace(pdf, y, lineH);
    let x = align === "center" ? (PAGE_W - w) / 2 : ML;

    row.forEach((it, i) => {
      if (i > 0) {
        pdf.setFont(BODY_FONT, "normal");
        pdf.setTextColor(80, 80, 80);
        pdf.text(sep, x, y);
        x += sepW;
      }
      pdf.setFont(BODY_FONT, "bold");
      pdf.setTextColor(ar, ag, ab);
      pdf.text(it.text, x, y);
      pdf.link(x, y - capH + 1, it.w, capH, { url: it.href });
      x += it.w;
    });

    y += lineH;
  });

  return y;
}

// Each referee renders with every field on its own row.
function drawReferee(pdf, r, y) {
  if (r.name) {
    y = ensureSpace(pdf, y, 6);
    pdf.setFontSize(FS.body);
    pdf.setFont(BODY_FONT, "bold");
    pdf.setTextColor(30, 30, 30);
    pdf.text(r.name, ML, y);
    y += 4.5;
  }

  const lineH = 4.2;
  const drawRow = (label, value) => {
    y = ensureSpace(pdf, y, lineH + 1);
    pdf.setFontSize(FS.body);
    pdf.setFont(BODY_FONT, "normal");
    if (label) {
      pdf.setTextColor(120, 120, 120);
      pdf.text(label, ML, y);
      const labelW = pdf.getTextWidth(label);
      pdf.setTextColor(50, 50, 50);
      pdf.text(value, ML + labelW, y);
    } else {
      pdf.setTextColor(50, 50, 50);
      pdf.text(value, ML, y);
    }
    y += lineH;
  };

  if (r.title)        drawRow(null, r.title);
  if (r.organization) drawRow(null, r.organization);
  if (r.phone)        drawRow("Tel: ", r.phone);
  if (r.email)        drawRow("Email: ", r.email);

  return y;
}

// ─── Headers ────────────────────────────────────────────────────────────────

function drawHeaderModern(pdf, data, y, accent) {
  const [ar, ag, ab] = hexToRgb(accent);
  const accentRgb = [ar, ag, ab];
  const p = data.profile;

  pdf.setFontSize(FS.name);
  pdf.setFont(BODY_FONT, "bold");
  pdf.setTextColor(ar, ag, ab);
  pdf.text(p.fullName || "", ML, y);
  y += 8;

  if (p.title) {
    pdf.setFontSize(FS.title);
    pdf.setFont(BODY_FONT, "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text(p.title, ML, y);
    y += 5.5;
  }

  pdf.setFontSize(FS.contact);
  pdf.setFont(BODY_FONT, "normal");
  pdf.setTextColor(80, 80, 80);
  const contact = [p.email, p.phone, p.location, p.website].filter(Boolean).join("   ");
  if (contact) { pdf.text(contact, ML, y); y += 4.5; }

  if (data.links?.length) {
    y = drawLinksInline(pdf, data.links, y, accentRgb, "left");
  }

  return y + 3;
}

function drawHeaderBasic(pdf, data, y, accent) {
  const [ar, ag, ab] = hexToRgb(accent);
  const accentRgb = [ar, ag, ab];
  const p = data.profile;
  const cx = PAGE_W / 2;

  pdf.setFontSize(FS.name);
  pdf.setFont(BODY_FONT, "bold");
  pdf.setTextColor(ar, ag, ab);
  pdf.text(p.fullName || "", cx, y, { align: "center" });
  y += 8;

  if (p.title) {
    pdf.setFontSize(FS.title);
    pdf.setFont(BODY_FONT, "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text(p.title, cx, y, { align: "center" });
    y += 5.5;
  }

  pdf.setFontSize(FS.contact);
  pdf.setFont(BODY_FONT, "normal");
  pdf.setTextColor(80, 80, 80);
  const contact = [p.email, p.phone, p.location, p.website].filter(Boolean).join("   |   ");
  if (contact) { pdf.text(contact, cx, y, { align: "center" }); y += 4.5; }

  if (data.links?.length) {
    y = drawLinksInline(pdf, data.links, y, accentRgb, "center");
  }

  return y + 3;
}

// ─── Section drawers (one per moveable body section) ────────────────────────
// Keyed by section id so we can dispatch through `data.meta.sectionOrder`
// and produce a PDF whose section ordering exactly matches the live preview.

const SECTION_DRAWERS = {
  experience(pdf, data, y, accent, ctx) {
    if (!ctx.experience.length) return y;
    y = ensureSpace(pdf, y, 14);
    y = drawSectionHead(pdf, HEADINGS.experience, y, accent);
    ctx.experience.forEach((e) => {
      y = ensureSpace(pdf, y, 10);
      y = drawEntryHeader(pdf, e.role, e.company, formatDateRange(e.start, e.end), y);
      y = drawMetaLine(pdf, e.location, y);
      y = drawBullets(pdf, e.bullets, y, { period: true });
      y += 3;
    });
    return y;
  },

  education(pdf, data, y, accent, ctx) {
    if (!ctx.education.length) return y;
    y = ensureSpace(pdf, y, 14);
    y = drawSectionHead(pdf, HEADINGS.education, y, accent);
    ctx.education.forEach((e) => {
      y = ensureSpace(pdf, y, 10);
      y = drawEntryHeader(pdf, formatInstitutionName(e.school), null, formatDateRange(e.start, e.end), y);
      y = drawMetaLine(pdf, e.degree, y);
      y = drawMetaLine(pdf, e.location, y);
      y = drawBullets(pdf, e.bullets, y, { period: true });
      y += 3;
    });
    return y;
  },

  projects(pdf, data, y, accent, ctx) {
    if (!ctx.projects.length) return y;
    y = ensureSpace(pdf, y, 14);
    y = drawSectionHead(pdf, HEADINGS.projects, y, accent);
    ctx.projects.forEach((p) => {
      y = ensureSpace(pdf, y, 10);
      y = drawEntryHeader(pdf, p.title, null, formatDateRange(p.start, p.end), y);
      y = drawMetaLine(pdf, p.organization, y);
      y = drawBullets(pdf, p.bullets, y, { period: true });
      y += 3;
    });
    return y;
  },

  skills(pdf, data, y, accent /*, ctx */) {
    if (!data.skillGroups?.length) return y;
    y = ensureSpace(pdf, y, 14);
    y = drawSectionHead(pdf, HEADINGS.skills, y, accent);
    data.skillGroups.forEach((g) => {
      y = ensureSpace(pdf, y, 8);
      y = drawEntryHeader(pdf, g.title, null, "", y);
      y = drawParagraph(pdf, g.bullets, y, { period: true });
      y += 3;
    });
    return y;
  },

  achievements(pdf, data, y, accent, ctx) {
    if (!ctx.achievements.length) return y;
    y = ensureSpace(pdf, y, 14);
    y = drawSectionHead(pdf, HEADINGS.achievements, y, accent);
    ctx.achievements.forEach((a) => {
      y = ensureSpace(pdf, y, 10);
      y = drawEntryHeader(pdf, a.title, a.organization, formatDate(a.year), y);
      y = drawBullets(pdf, a.bullets, y, { period: true });
      y += 3;
    });
    return y;
  },

  voluntary(pdf, data, y, accent, ctx) {
    if (!ctx.voluntary.length) return y;
    y = ensureSpace(pdf, y, 14);
    y = drawSectionHead(pdf, HEADINGS.voluntary, y, accent);
    ctx.voluntary.forEach((v) => {
      y = ensureSpace(pdf, y, 10);
      y = drawEntryHeader(pdf, v.role, v.organization, formatDateRange(v.start, v.end), y);
      y = drawMetaLine(pdf, v.location, y);
      y = drawBullets(pdf, v.bullets, y, { period: true });
      y += 3;
    });
    return y;
  },

  certificates(pdf, data, y, accent, ctx) {
    if (!ctx.certificates.length) return y;
    y = ensureSpace(pdf, y, 14);
    y = drawSectionHead(pdf, HEADINGS.certificates, y, accent);
    ctx.certificates.forEach((c) => {
      y = ensureSpace(pdf, y, 10);
      y = drawEntryHeader(pdf, c.title, c.issuer, formatDateRange(c.year, c.expiry, { presentIfEmpty: false }), y);
      y = drawMetaLine(pdf, c.credentialId ? `Credential ID: ${c.credentialId}` : "", y);

      y = drawBullets(pdf, c.bullets, y, { period: true });
      y += 3;
    });
    return y;
  },

  interests(pdf, data, y, accent, ctx) {
    if (!ctx.interests.length) return y;
    y = ensureSpace(pdf, y, 12);
    y = drawSectionHead(pdf, HEADINGS.interests, y, accent);
    pdf.setFontSize(FS.body);
    pdf.setFont(BODY_FONT, "normal");
    pdf.setTextColor(50, 50, 50);
    const line = ctx.interests.join("  •  ");
    const lines = pdf.splitTextToSize(line, CONTENT_W);
    lines.forEach((l) => {
      y = ensureSpace(pdf, y, 5);
      pdf.text(l, ML, y);
      y += 4.5;
    });
    return y + 3;
  },
};

// ─── Body ───────────────────────────────────────────────────────────────────

function drawBody(pdf, data, y, accent) {
  // Career Objective and References are pinned (top + bottom respectively).
  // Everything between them is rendered in the order stored in
  // data.meta.sectionOrder so the PDF matches the on-screen preview.

  const ctx = {
    experience:   sortByRecencyDesc(data.experience   || []),
    voluntary:    sortByRecencyDesc(data.voluntary    || []),
    projects:     sortByRecencyDesc(data.projects     || []),
    education:    sortByRecencyDesc(data.education    || []),
    certificates: sortByRecencyDesc(data.certificates || [], { startKey: "year", endKey: "expiry" }),
    achievements: sortByRecencyDesc(data.achievements || [], { startKey: "year", endKey: "year" }),
    interests:    (data.interests || []).filter((s) => String(s).trim()),
  };

  // Career Objective — always first
  if (data.profile?.summary) {
    y = ensureSpace(pdf, y, 14);
    y = drawSectionHead(pdf, HEADINGS.summary, y, accent);
    pdf.setFontSize(FS.body);
    pdf.setFont(BODY_FONT, "normal");
    pdf.setTextColor(50, 50, 50);
    const lines = pdf.splitTextToSize(data.profile.summary, CONTENT_W);
    lines.forEach((line) => {
      y = ensureSpace(pdf, y, 5);
      pdf.text(line, ML, y);
      y += 4.5;
    });
    y += 3;
  }

  // Moveable sections — iterate user-defined order
  const sectionOrder = getSectionOrder(data.meta);
  sectionOrder.forEach((id) => {
    const drawer = SECTION_DRAWERS[id];
    if (drawer) y = drawer(pdf, data, y, accent, ctx);
  });

  // References — always last
  y = ensureSpace(pdf, y, 14);
  y = drawSectionHead(pdf, HEADINGS.references, y, accent);
  const refs = (data.references || []).filter((r) => r && (r.name || r.title));

  if (!refs.length) {
    pdf.setFontSize(FS.body);
    pdf.setFont(BODY_FONT, "normal");
    pdf.setTextColor(50, 50, 50);
    pdf.text("References available on request.", ML, y);
    y += 5;
  } else {
    refs.forEach((r) => {
      // Reserve enough space for a worst-case 5-row referee block.
      y = ensureSpace(pdf, y, 24);
      y = drawReferee(pdf, r, y);
      y += 3;
    });
  }

  return y;
}

// ─── Main builder ───────────────────────────────────────────────────────────

function buildPDF(data) {
  const pdf      = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const accent   = data.meta?.accent || "#0ea5e9";
  const template = data.meta?.template || "modern";

  let y = MT;
  y = template === "basic"
    ? drawHeaderBasic(pdf, data, y, accent)
    : drawHeaderModern(pdf, data, y, accent);

  drawBody(pdf, data, y, accent);
  return pdf;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Toolbar({ data, set }) {
  const fileInputRef = useRef(null);

  const exportJson = () => {
    const bundle = readProfileBundle();
    const payload = buildProfileExport({
      resume: data,
      coverLetter: bundle.coverLetter || defaultCoverLetterData,
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${(data.profile.fullName || "resume").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const normalized = normalizeImportedProfile(parsed);
        if (normalized.resume) set(normalized.resume);
        if (normalized.coverLetter) {
          writeProfileBundle({ coverLetter: normalized.coverLetter });
        }
      }
      catch (err) { alert("Invalid JSON file: " + err.message); }
    };
    reader.readAsText(file);
  };

  const reset = () => {
    if (!confirm("Reset to starter content?")) return;
    // Avoid full-page reload because static hosts can return 404 on nested routes.
    set(defaultData);
    writeProfileBundle({ resume: defaultData });
  };

  const savePDF = (event) => {
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = "Generating PDF...";
    btn.disabled = true;
    try {
      buildPDF(data).save(
        `${(data.profile.fullName || "resume").replace(/\s+/g, "_")}.pdf`
      );
    } catch (err) {
      console.error("PDF error:", err);
      alert("Failed to generate PDF:\n" + err.message);
    } finally {
      btn.textContent = orig;
      btn.disabled = false;
    }
  };

  return (
    <div className="sticky top-0 z-40 mb-4 mt-4 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm print:hidden">
      <div className="flex flex-wrap items-center gap-2">
        <button className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition" onClick={reset}>Reset</button>
        <button className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition" onClick={exportJson}>Export JSON</button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden"
          onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        <button className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 transition"
          onClick={() => fileInputRef.current?.click()}>Import JSON</button>
        <button className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition"
          onClick={savePDF}>Save as PDF</button>
      </div>
    </div>
  );
}