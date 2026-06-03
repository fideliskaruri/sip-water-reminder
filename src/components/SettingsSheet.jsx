import { useEffect, useState } from "react";
import { THEMES, themeFromAccent } from "../utils/theme.js";

export default function SettingsSheet({
  open,
  onClose,
  goal,
  setGoal,
  interval,
  setInterval,
  sound,
  setSound,
  theme,
  setTheme,
  onTestReminder,
}) {
  const [perm, setPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const enableNotifs = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPerm(p);
  };

  if (!open) return null;

  const notifHint =
    perm === "granted"
      ? "Notifications are enabled ✅"
      : perm === "denied"
      ? "Blocked — enable them in your browser site settings."
      : perm === "unsupported"
      ? "This browser doesn't support notifications."
      : "Allow notifications to get reminded.";

  return (
    <div
      className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-sm flex items-end justify-center md:items-center md:p-6"
      onClick={onClose}
    >
      <aside
        className="relative z-50 w-full max-w-[460px] bg-white rounded-t-[26px] md:rounded-[24px] md:max-w-[440px] p-5 flex flex-col gap-4 shadow-[0_-16px_50px_rgba(20,50,88,0.25)] max-h-[88vh] overflow-y-auto animate-slide-up md:animate-pop-in"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-extrabold">Settings</h2>
          <button
            className="w-[42px] h-[42px] rounded-[13px] border border-line bg-soft2 text-ink text-[17px] hover:bg-soft active:scale-90 transition"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <label className="flex flex-col gap-[7px] font-extrabold text-sm">
          <span>Daily goal (ml)</span>
          <input
            type="number"
            min="200"
            max="8000"
            step="50"
            className="bg-soft2 border border-line rounded-xl py-3 px-3.5 text-ink text-[15px] font-bold focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15"
            value={goal}
            onChange={(e) => setGoal(Math.max(200, Math.min(8000, parseInt(e.target.value, 10) || 200)))}
          />
        </label>

        <label className="flex flex-col gap-[7px] font-extrabold text-sm">
          <span>Reminder interval</span>
          <select
            className="bg-soft2 border border-line rounded-xl py-3 px-3.5 text-ink text-[15px] font-bold focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value, 10))}
          >
            <option value={0}>Off</option>
            <option value={30}>Every 30 min</option>
            <option value={45}>Every 45 min</option>
            <option value={60}>Every 1 hour</option>
            <option value={90}>Every 1.5 hours</option>
            <option value={120}>Every 2 hours</option>
          </select>
        </label>

        <div className="flex flex-col gap-2.5 font-extrabold text-sm">
          <span>Primary color</span>
          <div className="flex flex-wrap items-center gap-2.5">
            {THEMES.map((t) => {
              const selected = (theme?.accent || "").toLowerCase() === t.accent.toLowerCase();
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t)}
                  aria-label={t.name}
                  aria-pressed={selected}
                  title={t.name}
                  className={`w-9 h-9 rounded-full transition active:scale-90 ${
                    selected ? "ring-[3px] ring-ink/40 ring-offset-2 ring-offset-white scale-110" : "hover:scale-105"
                  }`}
                  style={{ background: `linear-gradient(135deg, ${t.accent2}, ${t.accent})` }}
                />
              );
            })}
            <label
              className="relative w-9 h-9 rounded-full grid place-items-center cursor-pointer border-2 border-dashed border-line text-[15px] hover:bg-soft2 transition overflow-hidden"
              title="Custom color"
            >
              🎨
              <input
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={theme?.accent || "#2f8fff"}
                onChange={(e) => setTheme(themeFromAccent(e.target.value))}
                aria-label="Pick a custom primary color"
              />
            </label>
          </div>
        </div>

        <button
          onClick={enableNotifs}
          disabled={perm === "granted"}
        >
          {perm === "granted" ? "Notifications enabled" : "Enable notifications"}
        </button>
        <p className="text-muted text-[13px] font-bold">{notifHint}</p>

        <div className="flex items-center justify-between font-extrabold text-sm">
          <span>Sound on add</span>
          <label className="relative inline-flex w-[50px] h-7 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              aria-label="Sound on add"
            />
            <span className="absolute inset-0 rounded-full bg-[#d6e2f2] transition-colors peer-checked:bg-accent" />
            <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform peer-checked:translate-x-[22px]" />
          </label>
        </div>

        <button
          className="w-full bg-soft2 border border-line text-ink rounded-[14px] py-3 px-4 font-extrabold transition hover:bg-soft active:scale-[0.97]"
          onClick={onTestReminder}
        >
          Send a test reminder
        </button>
      </aside>
    </div>
  );
}
