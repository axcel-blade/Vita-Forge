/* src/features/resume-builder/components/editors/ProjectsEditor.jsx */

import React from "react";
import { SectionCard, IconButton, Text } from "../SharedInputs";
import BulletsEditor from "./BulletsEditor";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const swap = (arr, i, j) => {
  const a = arr.slice();
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export default function ProjectsEditor({ data, set }) {
  const add = () =>
    set({
      projects: [
        ...data.projects,
        { id: uid(), title: "", organization: "", start: "", end: "", bullets: [] },
      ],
    });

  const upd = (i, patch) =>
    set({
      projects: data.projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    });

  const del = (i) => set({ projects: data.projects.filter((_, idx) => idx !== i) });

  const up = (i) => i > 0 && set({ projects: swap(data.projects, i, i - 1) });
  const dn = (i) =>
    i < data.projects.length - 1 && set({ projects: swap(data.projects, i, i + 1) });

  return (
    <SectionCard title="Projects" action={<IconButton onClick={add}>+ Add</IconButton>}>
      <div className="space-y-4">
        {data.projects.map((p, i) => (
          <div key={p.id} className="rounded-xl border border-gray-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">Project {i + 1}</div>
              <div className="space-x-1">
                <IconButton onClick={() => up(i)}>↑</IconButton>
                <IconButton onClick={() => dn(i)}>↓</IconButton>
                <IconButton onClick={() => del(i)}>Remove</IconButton>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Text
                value={p.title}
                onChange={(v) => upd(i, { title: v })}
                placeholder="Title"
              />
              <Text
                value={p.organization}
                onChange={(v) => upd(i, { organization: v })}
                placeholder="Organization"
              />
              <div className="grid grid-cols-2 gap-2">
                <Text
                  value={p.start}
                  onChange={(v) => upd(i, { start: v })}
                  placeholder="Start (YYYY-MM)"
                />
                <Text
                  value={p.end}
                  onChange={(v) => upd(i, { end: v })}
                  placeholder="End (YYYY-MM)"
                />
              </div>
            </div>
            <div className="mt-2">
              <BulletsEditor
                items={p.bullets}
                onChange={(bullets) => upd(i, { bullets })}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}