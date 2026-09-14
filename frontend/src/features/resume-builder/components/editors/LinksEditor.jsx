/* src/features/resume-builder/components/editors/LinksEditor.jsx */

import React from "react";
import { SectionCard, IconButton, Text } from "../SharedInputs";

const uid = () => (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2));

export default function LinksEditor({ data, set }) {
    const add = () =>
        set({
        links: [...data.links, { id: uid(), label: "", url: "" }],
        });

    const upd = (i, patch) =>
        set({
        links: data.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
        });

    const del = (i) =>
        set({
        links: data.links.filter((_, idx) => idx !== i),
        });

    const handleKey = (e, i) => {
        if (e.key === "Enter") {
        e.preventDefault();
        if (i === data.links.length - 1) add(); // auto add new row at end
        }
    };

    return (
        <SectionCard title="Links" action={<IconButton onClick={add}>+ Add</IconButton>}>
        <div className="space-y-2">
            {data.links.map((l, i) => (
            <div key={l.id} className="grid grid-cols-5 items-center gap-2">
                <Text
                value={l.label}
                onChange={(v) => upd(i, { label: v })}
                onKeyDown={(e) => handleKey(e, i)}
                placeholder="Label (e.g. LinkedIn)"
                />
                <Text
                value={l.url}
                onChange={(v) => upd(i, { url: v })}
                onKeyDown={(e) => handleKey(e, i)}
                placeholder="URL (e.g. linkedin.com/in/janedoe)"
                className="col-span-3"
                />
                <IconButton title="Remove" onClick={() => del(i)}>
                ✕
                </IconButton>
            </div>
            ))}
        </div>
        </SectionCard>
    );
}