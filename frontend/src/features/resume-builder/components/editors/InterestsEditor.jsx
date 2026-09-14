/* src/features/resume-builder/components/editors/InterestsEditor.jsx */

import React from "react";
import { SectionCard } from "../SharedInputs";
import BulletsEditor from "./BulletsEditor";

export default function InterestsEditor({ data, set }) {
  const items = data.interests || [];

  return (
    <SectionCard title="Interests">
      <p className="text-xs text-gray-500 italic mb-2">
        Optional section — only shown on the resume when at least one interest is added.
        Add short labels like "Trail running", "Open-source contribution", "Chess".
      </p>
      <BulletsEditor
        items={items}
        onChange={(interests) => set({ interests })}
      />
    </SectionCard>
  );
}