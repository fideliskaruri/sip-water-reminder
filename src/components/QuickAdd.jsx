import { useState } from "react";

const PRESETS = [
  { amt: 150, emo: "🥃", label: "Small" },
  { amt: 250, emo: "🥤", label: "Cup" },
  { amt: 350, emo: "🧉", label: "Mug" },
  { amt: 500, emo: "🍶", label: "Bottle" },
];

export default function QuickAdd({ onAdd, onUndo, canUndo }) {
  const [custom, setCustom] = useState("");
  const [popped, setPopped] = useState(null);

  const fireAdd = (amt) => {
    setPopped(amt);
    setTimeout(() => setPopped(null), 400);
    onAdd(amt);
  };

  const addCustom = () => {
    const v = parseInt(custom, 10);
    if (!Number.isFinite(v) || v <= 0) return;
    onAdd(Math.min(v, 3000));
    setCustom("");
  };

  return (
    <section className="flex flex-col gap-3">
      <span className="text-sm font-extrabold text-ink tracking-[0.3px]">Quick add</span>
      <div className="grid grid-cols-4 md:grid-cols-2 min-[1100px]:grid-cols-4 gap-2.5 max-[360px]:gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.amt}
            className={`group bg-soft2 border border-line text-ink rounded-2xl py-3.5 px-1.5 max-[360px]:py-3 max-[360px]:px-1 flex flex-col items-center gap-[3px] font-extrabold text-[13px] max-[360px]:text-xs transition hover:-translate-y-[3px] hover:bg-[#eaf3ff] hover:border-[#cfe2ff] hover:shadow-soft active:scale-95 ${
              popped === p.amt ? "animate-pop" : ""
            }`}
            onClick={() => fireAdd(p.amt)}
          >
            <span className="text-2xl max-[360px]:text-[22px] transition group-hover:scale-110 group-hover:-rotate-6">{p.emo}</span>
            <span>{p.amt} ml</span>
            <small className="text-muted font-bold text-[10.5px] max-[360px]:hidden">{p.label}</small>
          </button>
        ))}
      </div>
      <div className="flex gap-2.5">
        <input
          type="number"
          min="1"
          max="3000"
          inputMode="numeric"
          placeholder="Custom ml"
          className="flex-1 min-w-0 bg-soft2 border border-line rounded-[14px] py-3 px-4 text-ink text-[15px] placeholder:text-[#9fb3cd] focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
        />
        <button
          className="bg-gradient-to-br from-accent to-accent2 text-white border-none rounded-[14px] py-3 px-5 font-extrabold text-[15px] shadow-[0_8px_20px_var(--accent-glow)] transition hover:brightness-105 hover:-translate-y-px active:scale-95"
          onClick={addCustom}
        >
          Add
        </button>
        <button
          className="bg-soft2 border border-line text-muted rounded-[14px] px-4 font-extrabold text-base transition enabled:hover:bg-soft enabled:hover:text-ink active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last"
          aria-label="Undo last"
        >
          ↩
        </button>
      </div>
    </section>
  );
}
