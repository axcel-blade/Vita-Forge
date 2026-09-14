/* src/features/resume-builder/components/editors/CertificatesEditor.jsx */

import React from "react";
import { SectionCard, IconButton, Text } from "../SharedInputs";
import BulletsEditor from "./BulletsEditor";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const swap = (arr, i, j) => {
  const a = arr.slice();
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export default function CertificatesEditor({ data, set }) {
  const list = data.certificates || [];

  const add = () =>
    set({
      certificates: [
        ...list,
        { id: uid(), title: "", issuer: "", year: "", expiry: "", credentialId: "", bullets: [] },
      ],
    });

  const upd = (i, patch) =>
    set({ certificates: list.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });

  const del = (i) => set({ certificates: list.filter((_, idx) => idx !== i) });
  const up = (i) => i > 0 && set({ certificates: swap(list, i, i - 1) });
  const dn = (i) => i < list.length - 1 && set({ certificates: swap(list, i, i + 1) });

  return (
    <SectionCard title="Certificates & Licenses" action={<IconButton onClick={add}>+ Add</IconButton>}>
      {list.length === 0 ? (
        <p className="text-xs text-gray-500 italic">
          Optional section — only shown on the resume when at least one credential is added.
        </p>
      ) : (
        <div className="space-y-4">
          {list.map((c, i) => (
            <div key={c.id} className="rounded-xl border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs text-gray-500">Credential {i + 1}</div>
                <div className="space-x-1">
                  <IconButton onClick={() => up(i)}>↑</IconButton>
                  <IconButton onClick={() => dn(i)}>↓</IconButton>
                  <IconButton onClick={() => del(i)}>Remove</IconButton>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Text value={c.title} onChange={(x) => upd(i, { title: x })} placeholder="Certificate name" />
                <Text value={c.issuer} onChange={(x) => upd(i, { issuer: x })} placeholder="Issuer (e.g. AWS)" />
                <div className="grid grid-cols-2 gap-2">
                  <Text value={c.year} onChange={(x) => upd(i, { year: x })} placeholder="Issued (YYYY-MM)" />
                  <Text value={c.expiry} onChange={(x) => upd(i, { expiry: x })} placeholder="Expires (optional)" />
                </div>
                <Text value={c.credentialId} onChange={(x) => upd(i, { credentialId: x })} placeholder="Credential ID (optional)" />
              </div>
              <div className="mt-2">
                <BulletsEditor items={c.bullets} onChange={(bullets) => upd(i, { bullets })} />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}