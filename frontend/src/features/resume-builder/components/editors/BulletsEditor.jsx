/* src/features/resume-builder/components/editors/BulletsEditor.jsx
 *
 * Shared bullet list used by Experience, Education, Projects, Skills,
 * Achievements, Volunteer Work, Certificates, and Interests. New lines
 * are appended via the input below; existing lines can be reordered
 * with ↑ / ↓ so the resume preview matches the user's intended order.
 */

import React, { useState } from "react";
import { IconButton } from "../SharedInputs";

const swap = (arr, i, j) => {
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

export default function BulletsEditor({ items = [], onChange }) {
  const [val, setVal] = useState("");
  const list = items || [];

  const add = () => {
    if (!val.trim()) return;
    onChange([...list, val.trim()]);
    setVal("");
  };

  const del = (i) => onChange(list.filter((_, idx) => idx !== i));

  const move = (i, delta) => {
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    onChange(swap(list, i, j));
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add bullet and press Enter"
        />
        <IconButton onClick={add}>+ Add</IconButton>
      </div>

      <ul className="mt-2 space-y-2">
        {list.map((b, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-2 break-words whitespace-pre-wrap rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
          >
            <span className="flex-1 text-gray-800 leading-snug pt-0.5">{b}</span>
            <div className="flex shrink-0 gap-1">
              <IconButton title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                ↑
              </IconButton>
              <IconButton
                title="Move down"
                disabled={i === list.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </IconButton>
              <IconButton title="Remove" onClick={() => del(i)}>
                ✕
              </IconButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
