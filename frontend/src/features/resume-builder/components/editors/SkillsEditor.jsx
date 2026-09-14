/* src/features/resume-builder/components/editors/SkillsEditor.jsx */

import React from "react";
import { SectionCard, IconButton, Text } from "../SharedInputs";
import BulletsEditor from "./BulletsEditor";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const swap = (arr, i, j) => {
  const a = arr.slice();
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export default function SkillsEditor({ data, set }) {
  const add = () =>
    set({
      skillGroups: [...(data.skillGroups || []), { id: uid(), title: "", bullets: [] }],
    });

  const upd = (i, patch) =>
    set({
      skillGroups: data.skillGroups.map((g, idx) =>
        idx === i ? { ...g, ...patch } : g
      ),
    });

  const del = (i) =>
    set({
      skillGroups: data.skillGroups.filter((_, idx) => idx !== i),
    });

  const up = (i) =>
    i > 0 && set({ skillGroups: swap(data.skillGroups, i, i - 1) });

  const dn = (i) =>
    i < data.skillGroups.length - 1 &&
    set({ skillGroups: swap(data.skillGroups, i, i + 1) });

  return (
    <SectionCard
      title="Key Skills"
      action={<IconButton onClick={add}>+ Add Group</IconButton>}
    >
      <div className="space-y-4">
        {(data.skillGroups || []).map((g, i) => (
          <div key={g.id} className="rounded-xl border border-gray-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">Skill Group {i + 1}</div>
              <div className="space-x-1">
                <IconButton onClick={() => up(i)}>↑</IconButton>
                <IconButton onClick={() => dn(i)}>↓</IconButton>
                <IconButton onClick={() => del(i)}>Remove</IconButton>
              </div>
            </div>

            <Text
              value={g.title}
              onChange={(v) => upd(i, { title: v })}
              placeholder="Group Title"
            />

            <div className="mt-2">
              <BulletsEditor
                items={g.bullets}
                onChange={(bullets) => upd(i, { bullets })}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}