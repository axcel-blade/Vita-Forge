/* src/features/resume-builder/components/editors/VoluntaryEditor.jsx */

import React from "react";
import { SectionCard, IconButton, Text } from "../SharedInputs";
import BulletsEditor from "./BulletsEditor";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const swap = (arr, i, j) => {
  const a = arr.slice();
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export default function VoluntaryEditor({ data, set }) {
  const list = data.voluntary || [];

  const add = () =>
    set({
      voluntary: [
        ...list,
        { id: uid(), role: "", organization: "", location: "", start: "", end: "", bullets: [] },
      ],
    });

  const upd = (i, patch) =>
    set({ voluntary: list.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) });

  const del = (i) => set({ voluntary: list.filter((_, idx) => idx !== i) });
  const up = (i) => i > 0 && set({ voluntary: swap(list, i, i - 1) });
  const dn = (i) => i < list.length - 1 && set({ voluntary: swap(list, i, i + 1) });

  return (
    <SectionCard title="Volunteer Work" action={<IconButton onClick={add}>+ Add</IconButton>}>
      {list.length === 0 ? (
        <p className="text-xs text-gray-500 italic">
          Optional section — only shown on the resume when at least one entry is added.
        </p>
      ) : (
        <div className="space-y-4">
          {list.map((v, i) => (
            <div key={v.id} className="rounded-xl border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs text-gray-500">Item {i + 1}</div>
                <div className="space-x-1">
                  <IconButton onClick={() => up(i)}>↑</IconButton>
                  <IconButton onClick={() => dn(i)}>↓</IconButton>
                  <IconButton onClick={() => del(i)}>Remove</IconButton>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Text value={v.role} onChange={(x) => upd(i, { role: x })} placeholder="Role (e.g. Mentor)" />
                <Text value={v.organization} onChange={(x) => upd(i, { organization: x })} placeholder="Organization" />
                <Text value={v.location} onChange={(x) => upd(i, { location: x })} placeholder="Location" />
                <div className="grid grid-cols-2 gap-2">
                  <Text value={v.start} onChange={(x) => upd(i, { start: x })} placeholder="Start (YYYY-MM)" />
                  <Text value={v.end} onChange={(x) => upd(i, { end: x })} placeholder="End (YYYY-MM)" />
                </div>
              </div>
              <div className="mt-2">
                <BulletsEditor items={v.bullets} onChange={(bullets) => upd(i, { bullets })} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}