import { formatTime } from "../utils/date.js";

export default function DrinkLog({ entries, onDelete, onReset }) {
  return (
    <section className="flex flex-col gap-3 md:self-stretch">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-ink tracking-[0.3px]">Today's log</span>
        {entries.length > 0 && (
          <button className="text-muted text-[13px] font-bold underline hover:text-accent" onClick={onReset}>
            Clear day
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-muted text-center py-[22px] px-3.5 font-bold bg-soft2 border border-dashed border-line rounded-2xl">
          No drinks yet — take a sip! 💦
        </p>
      ) : (
        <ul className="list-none flex flex-col gap-2 max-h-[320px] md:max-h-[min(60vh,460px)] overflow-y-auto">
          {entries.map((e) => (
            <li
              className="flex items-center justify-between bg-soft2 border border-line rounded-[14px] py-[11px] px-3.5 animate-slide-in"
              key={e.id}
            >
              <div className="flex items-center gap-[11px]">
                <span className="w-[34px] h-[34px] rounded-[10px] bg-[#eaf3ff] dark:bg-[#1d3052] grid place-items-center text-[17px]">
                  {e.emo || "💧"}
                </span>
                <span className="font-extrabold text-ink">{e.amount} ml</span>
                <span className="text-muted text-[13px] font-bold">{formatTime(e.ts)}</span>
              </div>
              <button
                className="text-[#b9c8dd] dark:text-[#5e7390] text-base p-1 rounded-lg hover:text-danger hover:bg-[#fff0f2] dark:hover:bg-[#3a1f28]"
                onClick={() => onDelete(e.id)}
                aria-label="Delete entry"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
