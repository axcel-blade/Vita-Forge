/* src/features/resume-builder/components/editors/ProfileEditor.jsx */

import React, { useState } from "react";
import { SectionCard, Label, Text, TextArea, IconButton } from "../SharedInputs";

const uid = () => (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2));

async function generateSummary(data, existingSummary) {
    const p = data.profile;
    const experienceText = data.experience?.length
        ? data.experience.map((e) => `${e.role} at ${e.company} (${e.start}–${e.end || "Present"})`).join("; ")
        : "";
    const projectsText = data.projects?.length
        ? data.projects.map((proj) => proj.title).join(", ")
        : "";
    const educationText = data.education?.length
        ? data.education.map((e) => `${e.degree} from ${e.school}`).join("; ")
        : "";
    const skillsText = data.skillGroups?.length
        ? data.skillGroups.map((g) => `${g.title}: ${g.bullets?.join(", ")}`).join("; ")
        : "";
    const achievementsText = data.achievements?.length
        ? data.achievements.map((a) => a.title).join(", ")
        : "";

    const rewriteInstruction = existingSummary
        ? `The user has an existing summary they want rewritten and improved:\n"${existingSummary}"\n\nRewrite it to be more compelling and impactful using the resume data below.`
        : `Generate a compelling professional summary based on this resume data.`;

    const prompt = `You are a professional resume writer. ${rewriteInstruction}

    Resume data:
    - Name: ${p.fullName || ""}
    - Title: ${p.title || ""}
    - Location: ${p.location || ""}
    ${experienceText ? `- Experience: ${experienceText}` : ""}
    ${educationText ? `- Education: ${educationText}` : ""}
    ${projectsText ? `- Projects: ${projectsText}` : ""}
    ${skillsText ? `- Skills: ${skillsText}` : ""}
    ${achievementsText ? `- Achievements: ${achievementsText}` : ""}

    Write a concise, powerful professional summary in 2-4 sentences. Use first person implicitly (no "I"). Focus on the candidate's value proposition, key strengths, and what makes them stand out. Return only the summary text, no labels or extra formatting.`;

    // Calls our Vercel serverless function — works both locally and in production
    const response = await fetch("/api/generate_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "API request failed");
    }
    const result = await response.json();
    return result.content?.find((b) => b.type === "text")?.text?.trim() || "";
    }

    export default function ProfileEditor({ data, set }) {
    const p = data.profile;
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");

    const addLink = () =>
        set({ links: [...data.links, { id: uid(), label: "", url: "" }] });

    const updateLink = (i, patch) =>
        set({ links: data.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) });

    const removeLink = (i) =>
        set({ links: data.links.filter((_, idx) => idx !== i) });

    const handleKey = (e, i) => {
        if (e.key === "Enter") {
        e.preventDefault();
        if (i === data.links.length - 1) addLink();
        }
    };

    const handleAiSummary = async () => {
        setAiError("");
        alert("Rewrite with AI is coming soon.");
    };

    const hasSummary = p.summary && p.summary.trim().length > 0;

    const btnStyle = {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        borderRadius: "8px",
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: "500",
        cursor: aiLoading ? "not-allowed" : "pointer",
        border: "1px solid",
        transition: "background 0.15s",
        ...(aiLoading
        ? { background: "#f3f4f6", color: "#9ca3af", borderColor: "#d1d5db" }
        : hasSummary
        ? { background: "#fffbeb", color: "#b45309", borderColor: "#fcd34d" }
        : { background: "#f0f9ff", color: "#0369a1", borderColor: "#7dd3fc" }),
    };

    return (
        <SectionCard title="Profile">
        <div className="grid grid-cols-2 gap-3">
            <div>
            <Label>Full Name</Label>
            <Text value={p.fullName} onChange={(v) => set({ profile: { ...p, fullName: v } })} />
            </div>
            <div>
            <Label>Title</Label>
            <Text value={p.title} onChange={(v) => set({ profile: { ...p, title: v } })} />
            </div>
            <div>
            <Label>Email</Label>
            <Text value={p.email} onChange={(v) => set({ profile: { ...p, email: v } })} />
            </div>
            <div>
            <Label>Phone</Label>
            <Text value={p.phone} onChange={(v) => set({ profile: { ...p, phone: v } })} />
            </div>
            <div>
            <Label>Location</Label>
            <Text value={p.location} onChange={(v) => set({ profile: { ...p, location: v } })} />
            </div>
            <div>
            <Label>Website</Label>
            <Text value={p.website} onChange={(v) => set({ profile: { ...p, website: v } })} />
            </div>
        </div>

        {/* Summary with AI */}
        <div className="mt-3">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <Label>Summary</Label>
            <button onClick={handleAiSummary} disabled={aiLoading} style={btnStyle}>
                {aiLoading ? (
                <>
                    <svg style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                    <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Generating…</span>
                </>
                ) : (
                <span>{hasSummary ? "✦ Rewrite with AI" : "✦ Generate with AI"}</span>
                )}
            </button>
            </div>

            <TextArea
            value={p.summary}
            onChange={(v) => set({ profile: { ...p, summary: v } })}
            placeholder="Write a professional summary, or use AI to generate one from your resume data…"
            rows={4}
            />

            {aiError && (
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#ef4444" }}>⚠ {aiError}</p>
            )}
            {aiLoading && (
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#0284c7" }}>✦ AI is writing your summary…</p>
            )}
        </div>

        {/* Embedded link editor */}
        <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
            <Label>Profile Links</Label>
            <IconButton onClick={addLink}>+ Add</IconButton>
            </div>
            {data.links?.length > 0 ? (
            <div className="space-y-2">
                {data.links.map((l, i) => (
                <div key={l.id} className="grid grid-cols-5 items-center gap-2">
                    <Text
                    value={l.label}
                    onChange={(v) => updateLink(i, { label: v })}
                    onKeyDown={(e) => handleKey(e, i)}
                    placeholder="Label (e.g. LinkedIn)"
                    />
                    <Text
                    value={l.url}
                    onChange={(v) => updateLink(i, { url: v })}
                    onKeyDown={(e) => handleKey(e, i)}
                    placeholder="URL (e.g. linkedin.com/in/janedoe)"
                    className="col-span-3"
                    />
                    <IconButton title="Remove" onClick={() => removeLink(i)}>✕</IconButton>
                </div>
                ))}
            </div>
            ) : (
            <p className="text-xs text-gray-400 italic">No links added. Click "+ Add" to create one.</p>
            )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </SectionCard>
    );
}