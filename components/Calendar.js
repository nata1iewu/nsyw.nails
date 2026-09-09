"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// A minimal month-grid calendar. `slots` should be the already-filtered list
// (e.g. removal-eligible only) so the dots/enabled days reflect what's
// actually bookable right now.
export default function Calendar({ slots, selectedDate, onSelectDate }) {
  const datesWithSlots = useMemo(() => {
    const set = new Set();
    (slots || []).forEach((s) => set.add(s.date));
    return set;
  }, [slots]);

  const initial = useMemo(() => {
    const first = [...datesWithSlots].sort()[0];
    const d = first ? new Date(`${first}T00:00:00`) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [datesWithSlots]);

  const [view, setView] = useState(initial);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstOfMonth = new Date(view.year, view.month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = firstOfMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(delta) {
    setView((v) => {
      let month = v.month + delta;
      let year = v.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  }

  return (
    <div className="rounded-2xl ring-1 ring-line/70 bg-mist/60 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
          className="h-8 w-8 rounded-full text-ink/60 hover:bg-mist transition"
        >
          ‹
        </button>
        <p className="font-display text-lg text-inkDeep">{monthLabel}</p>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
          className="h-8 w-8 rounded-full text-ink/60 hover:bg-mist transition"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-xs uppercase tracking-wide text-ink/40 py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`blank-${i}`} />;
          const key = toKey(view.year, view.month, d);
          const hasSlots = datesWithSlots.has(key);
          const isSelected = selectedDate === key;
          const cellDate = new Date(view.year, view.month, d);
          const isPast = cellDate < today;

          return (
            <button
              type="button"
              key={key}
              disabled={!hasSlots || isPast}
              onClick={() => onSelectDate(key)}
              className={`relative aspect-square rounded-lg text-sm transition flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-inkDeep text-mist"
                  : hasSlots && !isPast
                  ? "text-ink hover:bg-stoneDeep/60 cursor-pointer"
                  : "text-ink/25 cursor-default"
              }`}
            >
              {d}
              {hasSlots && !isPast && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-umber" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
