/* src/features/resume-builder/components/editors/ReferencesEditor.jsx */

import React from "react";
import { SectionCard, IconButton, Text } from "../SharedInputs";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const swap = (arr, i, j) => {
  const a = arr.slice();
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export default function ReferencesEditor({ data, set }) {
  const refs = data.references || [];

  const add = () =>
    set({
      references: [
        ...refs,
        { id: uid(), name: "", title: "", organization: "", email: "", phone: "" },
      ],
    });

  const upd = (i, patch) =>
    set({
      references: refs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    });

  const del = (i) => set({ references: refs.filter((_, idx) => idx !== i) });

  const up = (i) => i > 0 && set({ references: swap(refs, i, i - 1) });
  const dn = (i) =>
    i < refs.length - 1 && set({ references: swap(refs, i, i + 1) });

  return (
    <SectionCard title="References" action={<IconButton onClick={add}>+ Add Referee</IconButton>}>
      {refs.length === 0 ? (
        <p className="text-xs text-gray-500 italic">
          No referees added — your resume will display{" "}
          <span className="font-semibold">"References available on request."</span>{" "}
          Click <span className="font-semibold">+ Add Referee</span> to list one or more
          contactable referees instead.
        </p>
      ) : (
        <div className="space-y-4">
          {refs.map((r, i) => (
            <div key={r.id} className="rounded-xl border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs text-gray-500">Referee {i + 1}</div>
                <div className="space-x-1">
                  <IconButton onClick={() => up(i)}>↑</IconButton>
                  <IconButton onClick={() => dn(i)}>↓</IconButton>
                  <IconButton onClick={() => del(i)}>Remove</IconButton>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Text
                  value={r.name}
                  onChange={(v) => upd(i, { name: v })}
                  placeholder="Full name"
                />
                <Text
                  value={r.title}
                  onChange={(v) => upd(i, { title: v })}
                  placeholder="Job title (e.g. Engineering Manager)"
                />
                <Text
                  value={r.organization}
                  onChange={(v) => upd(i, { organization: v })}
                  placeholder="Organization"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Text
                    value={r.email}
                    onChange={(v) => upd(i, { email: v })}
                    placeholder="Email"
                  />
                  <Text
                    value={r.phone}
                    onChange={(v) => upd(i, { phone: v })}
                    placeholder="Phone"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}