/* src/features/resume-builder/components/editors/EducationEditor.jsx */

import React from "react";
import { SectionCard, IconButton, Text } from "../SharedInputs";
import BulletsEditor from "./BulletsEditor";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const swap = (arr, i, j) => {
  const a = arr.slice();
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export default function EducationEditor({ data, set }) {
  const add = () =>
    set({
      education: [
        ...data.education,
        { id: uid(), degree: "", school: "", location: "", start: "", end: "", bullets: [] },
      ],
    });

  const upd = (i, patch) =>
    set({
      education: data.education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    });

  const del = (i) => set({ education: data.education.filter((_, idx) => idx !== i) });

  const up = (i) => i > 0 && set({ education: swap(data.education, i, i - 1) });
  const dn = (i) =>
    i < data.education.length - 1 && set({ education: swap(data.education, i, i + 1) });

  return (
    <SectionCard title="Education" action={<IconButton onClick={add}>+ Add</IconButton>}>
      <div className="space-y-4">
        {data.education.map((e, i) => (
          <div key={e.id} className="rounded-xl border border-gray-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">Item {i + 1}</div>
              <div className="space-x-1">
                <IconButton onClick={() => up(i)}>↑</IconButton>
                <IconButton onClick={() => dn(i)}>↓</IconButton>
                <IconButton onClick={() => del(i)}>Remove</IconButton>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Text
                value={e.degree}
                onChange={(v) => upd(i, { degree: v })}
                placeholder="Degree"
              />
              <Text
                value={e.school}
                onChange={(v) => upd(i, { school: v })}
                placeholder="School"
              />
              <Text
                value={e.location}
                onChange={(v) => upd(i, { location: v })}
                placeholder="Location"
              />
              <div className="grid grid-cols-2 gap-2">
                <Text
                  value={e.start}
                  onChange={(v) => upd(i, { start: v })}
                  placeholder="Start (YYYY-MM)"
                />
                <Text
                  value={e.end}
                  onChange={(v) => upd(i, { end: v })}
                  placeholder="End (YYYY-MM)"
                />
              </div>
            </div>
            <div className="mt-2">
              <BulletsEditor
                items={e.bullets}
                onChange={(bullets) => upd(i, { bullets })}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}