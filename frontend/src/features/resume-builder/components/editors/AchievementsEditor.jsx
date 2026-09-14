/* src/features/resume-builder/components/editors/AchievementsEditor.jsx */

import React from "react";
import { SectionCard, IconButton, Text } from "../SharedInputs";
import BulletsEditor from "./BulletsEditor";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const swap = (arr, i, j) => {
  const a = arr.slice();
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export default function AchievementsEditor({ data, set }) {
  const add = () =>
    set({
      achievements: [
        ...data.achievements,
        { id: uid(), title: "", organization: "", year: "", bullets: [] },
      ],
    });

  const upd = (i, patch) =>
    set({
      achievements: data.achievements.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    });

  const del = (i) => set({ achievements: data.achievements.filter((_, idx) => idx !== i) });

  const up = (i) => i > 0 && set({ achievements: swap(data.achievements, i, i - 1) });
  const dn = (i) =>
    i < data.achievements.length - 1 && set({ achievements: swap(data.achievements, i, i + 1) });

  return (
    <SectionCard title="Achievements and Awards" action={<IconButton onClick={add}>+ Add</IconButton>}>
      <div className="space-y-4">
        {data.achievements.map((a, i) => (
          <div key={a.id} className="rounded-xl border border-gray-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">Achievement {i + 1}</div>
              <div className="space-x-1">
                <IconButton onClick={() => up(i)}>↑</IconButton>
                <IconButton onClick={() => dn(i)}>↓</IconButton>
                <IconButton onClick={() => del(i)}>Remove</IconButton>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Text
                value={a.title}
                onChange={(v) => upd(i, { title: v })}
                placeholder="Title"
              />
              <Text
                value={a.organization}
                onChange={(v) => upd(i, { organization: v })}
                placeholder="Organization"
              />
              <Text
                value={a.year}
                onChange={(v) => upd(i, { year: v })}
                placeholder="Date (YYYY-MM)"
              />
            </div>
            <div className="mt-2">
              <BulletsEditor
                items={a.bullets}
                onChange={(bullets) => upd(i, { bullets })}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}