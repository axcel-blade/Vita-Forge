/* src/features/resume-builder/components/editors/ExperienceEditor.jsx */

import React from "react";
import { SectionCard, IconButton, Text } from "../SharedInputs";
import BulletsEditor from "./BulletsEditor";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const swap = (arr, i, j) => {
  const a = arr.slice();
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export default function ExperienceEditor({ data, set }) {
  const add = () =>
    set({
      experience: [
        ...data.experience,
        { id: uid(), role: "", company: "", location: "", start: "", end: "", bullets: [] },
      ],
    });

  const upd = (i, patch) =>
    set({
      experience: data.experience.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    });

  const del = (i) => set({ experience: data.experience.filter((_, idx) => idx !== i) });

  const up = (i) => i > 0 && set({ experience: swap(data.experience, i, i - 1) });
  const dn = (i) =>
    i < data.experience.length - 1 && set({ experience: swap(data.experience, i, i + 1) });

  return (
    <SectionCard title="Professional Experience" action={<IconButton onClick={add}>+ Add</IconButton>}>
      <div className="space-y-4">
        {data.experience.map((e, i) => (
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
                value={e.role}
                onChange={(v) => upd(i, { role: v })}
                placeholder="Role"
              />
              <Text
                value={e.company}
                onChange={(v) => upd(i, { company: v })}
                placeholder="Company"
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