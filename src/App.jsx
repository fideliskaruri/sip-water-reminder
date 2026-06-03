import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import WaterGauge from "./components/WaterGauge.jsx";
import QuickAdd from "./components/QuickAdd.jsx";
import DrinkLog from "./components/DrinkLog.jsx";
import SettingsSheet from "./components/SettingsSheet.jsx";
import Tour from "./components/Tour.jsx";
import { usePersistentState } from "./hooks/usePersistentState.js";
import { todayKey, prevKey } from "./utils/date.js";
import { playSip } from "./utils/sound.js";
import { burstConfetti } from "./utils/confetti.js";
import { applyTheme, DEFAULT_THEME } from "./utils/theme.js";

const EMOJI = { 150: "🥃", 250: "🥤", 350: "🧉", 500: "🍶" };

const TOUR_STEPS = [
  {
    title: "Welcome to Sip 👋",
    body: "A calm little tracker to help you stay hydrated. Here's a quick 20-second tour.",
  },
  {
    selector: '[data-tour="progress"]',
    title: "Your daily progress",
    body: "This ring fills as you drink. The stats show how much you have left, cups, and your day streak.",
  },
  {
    selector: '[data-tour="quickadd"]',
    title: "Log a drink",
    body: "Tap a preset to log it instantly, or type a custom amount. Made a mistake? Hit the undo button.",
  },
  {
    selector: '[data-tour="reminders"]',
    title: "Gentle reminders",
    body: "Tap the bell to get nudged every hour. Turn it off anytime with the same button.",
  },
  {
    selector: '[data-tour="settings"]',
    title: "Make it yours",
    body: "Set your goal, pick a primary color, switch to dark mode — and replay this tour whenever you like.",
  },
];

function getSystemDark() {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;
}

function sumDay(entries) {
  return (entries || []).reduce((t, e) => t + e.amount, 0);
}

function computeStreak(days, goal) {
  let streak = 0;
  let key = todayKey();
  if (sumDay(days[key]) < goal) key = prevKey(key); // don't penalise an incomplete today
  while (sumDay(days[key]) >= goal && goal > 0) {
    streak++;
    key = prevKey(key);
  }
  return streak;
}

export default function App() {
  const [goal, setGoal] = usePersistentState("sip.goal", 2000);
  const [interval, setIntervalMins] = usePersistentState("sip.interval", 0);
  const [sound, setSound] = usePersistentState("sip.sound", true);
  const [theme, setTheme] = usePersistentState("sip.theme", DEFAULT_THEME);
  const [dark, setDark] = usePersistentState("sip.dark", getSystemDark());
  const [tourDone, setTourDone] = usePersistentState("sip.tourDone", false);
  const [days, setDays] = usePersistentState("sip.days", {});

  const [tourOpen, setTourOpen] = useState(false);
  const tourInit = useRef(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Show the tour once, on the very first visit.
  useEffect(() => {
    if (tourInit.current) return;
    tourInit.current = true;
    if (!tourDone) {
      const t = setTimeout(() => setTourOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [tourDone]);

  const closeTour = useCallback(() => {
    setTourOpen(false);
    setTourDone(true);
  }, [setTourDone]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [today, setToday] = useState(() => todayKey());
  const confettiRef = useRef(null);
  const toastTimer = useRef(null);
  const goalRef = useRef(goal);
  goalRef.current = goal;
  const daysRef = useRef(days);
  daysRef.current = days;

  // Keep "today" accurate across midnight and when the tab regains focus.
  useEffect(() => {
    let timer;
    const schedule = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
      timer = setTimeout(() => {
        setToday(todayKey());
        schedule();
      }, next - now);
    };
    schedule();
    const onFocus = () => setToday(todayKey());
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const tKey = today;
  const entries = useMemo(
    () => [...(days[tKey] || [])].sort((a, b) => b.ts - a.ts),
    [days, tKey]
  );
  const total = useMemo(() => sumDay(days[tKey]), [days, tKey]);
  const streak = useMemo(() => computeStreak(days, goal), [days, goal]);

  const remaining = Math.max(0, goal - total);
  const cups = Math.round(total / 250);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const addDrink = useCallback(
    (amount) => {
      if (!amount || amount <= 0) return;
      const k = todayKey();
      const prevTotal = sumDay(daysRef.current[k]);
      const entry = { id: Date.now() + Math.random(), amount, emo: EMOJI[amount] || "💧", ts: Date.now() };
      setDays((d) => ({ ...d, [k]: [...(d[k] || []), entry] }));

      if (sound) playSip();

      const newTotal = prevTotal + amount;
      if (prevTotal < goalRef.current && newTotal >= goalRef.current) {
        burstConfetti(confettiRef.current);
        showToast("🎉 Goal reached! Amazing hydration!");
      } else {
        showToast(`+${amount} ml logged 💧`);
      }
    },
    [setDays, sound, showToast]
  );

  const undoLast = useCallback(() => {
    const k = todayKey();
    setDays((d) => {
      const list = d[k] || [];
      if (list.length === 0) return d;
      const newest = list.reduce((a, b) => (b.ts > a.ts ? b : a), list[0]);
      return { ...d, [k]: list.filter((e) => e.id !== newest.id) };
    });
    showToast("Removed last drink");
  }, [setDays, showToast]);

  const deleteEntry = useCallback(
    (id) => {
      const k = todayKey();
      setDays((d) => ({ ...d, [k]: (d[k] || []).filter((e) => e.id !== id) }));
    },
    [setDays]
  );

  const resetDay = useCallback(() => {
    const k = todayKey();
    setDays((d) => ({ ...d, [k]: [] }));
    showToast("Today's log cleared");
  }, [setDays, showToast]);

  const toggleReminders = useCallback(() => {
    if (interval > 0) {
      setIntervalMins(0);
      showToast("Reminders turned off");
      return;
    }
    setIntervalMins(60);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    showToast("🔔 Reminders on — every 60 min");
  }, [interval, setIntervalMins, showToast]);

  const notify = useCallback(
    (body) => {
      const title = "💧 Time to hydrate!";
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(title, { body, icon: undefined });
          return;
        } catch {
          /* fall through to toast */
        }
      }
      showToast(body);
    },
    [showToast]
  );

  // Reminder scheduler — stable interval that reads the latest data via ref.
  useEffect(() => {
    if (!interval || interval <= 0) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, goalRef.current - sumDay(daysRef.current[todayKey()]));
      notify(left > 0 ? `You have ${left} ml left today. Take a sip! 🥤` : "You hit your goal — keep it up! 🎉");
    }, interval * 60 * 1000);
    return () => window.clearInterval(id);
  }, [interval, notify]);

  return (
    <div className="min-h-[100dvh] flex justify-center items-start md:items-center px-0 sm:px-4 py-0 sm:py-6">
      <main className="w-full max-w-[460px] md:max-w-[880px] min-[1100px]:max-w-[940px] bg-card shadow-card rounded-none sm:rounded-card p-4 sm:p-5 md:p-7 min-h-[100dvh] sm:min-h-0 flex flex-col gap-4 sm:gap-5 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-6 md:items-start">
        <header className="flex items-center justify-between md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 grid place-items-center rounded-[14px] text-[22px] bg-gradient-to-br from-accent2 to-accent shadow-[0_8px_18px_var(--accent-glow)] animate-bob">
              💧
            </span>
            <div>
              <h1 className="text-[22px] font-extrabold tracking-[0.2px]">Sip</h1>
              <p className="text-muted text-[12.5px] mt-px">Stay hydrated, feel great</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleReminders}
              data-tour="reminders"
              aria-label={interval > 0 ? "Turn off reminders" : "Turn on reminders"}
              aria-pressed={interval > 0}
              title={interval > 0 ? `Reminders on — every ${interval} min` : "Turn on reminders"}
              className={`w-[42px] h-[42px] rounded-[13px] border text-[17px] active:scale-90 transition ${
                interval > 0
                  ? "bg-accent text-white border-transparent shadow-[0_8px_18px_var(--accent-glow)]"
                  : "border-line bg-soft2 text-ink hover:bg-soft"
              }`}
            >
              {interval > 0 ? "🔔" : "🔕"}
            </button>
            <button
              className="w-[42px] h-[42px] rounded-[13px] border border-line bg-soft2 text-ink text-[17px] hover:bg-soft active:scale-90 transition"
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <button
              className="w-[42px] h-[42px] rounded-[13px] border border-line bg-soft2 text-ink text-[17px] hover:bg-soft active:scale-90 transition"
              onClick={() => setSettingsOpen(true)}
              data-tour="settings"
              aria-label="Settings"
            >
              ⚙️
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-4 sm:gap-5">
          <section data-tour="progress" className="flex flex-col items-center gap-3 sm:gap-4">
            <WaterGauge amount={total} goal={goal} />
            <div className="grid grid-cols-3 w-full bg-soft2 border border-line rounded-[18px] overflow-hidden">
              <div className="py-3.5 px-1.5 text-center">
                <span className="block text-xl font-extrabold text-accent">
                  {remaining}
                  <span className="text-xs text-muted font-bold"> ml</span>
                </span>
                <span className="text-muted text-xs font-bold">to go</span>
              </div>
              <div className="py-3.5 px-1.5 text-center border-l border-line">
                <span className="block text-xl font-extrabold text-accent">{cups}</span>
                <span className="text-muted text-xs font-bold">cups</span>
              </div>
              <div className="py-3.5 px-1.5 text-center border-l border-line">
                <span className="block text-xl font-extrabold text-accent">{streak}</span>
                <span className="text-muted text-xs font-bold">day streak</span>
              </div>
            </div>
          </section>

          <div data-tour="quickadd">
            <QuickAdd onAdd={addDrink} onUndo={undoLast} canUndo={entries.length > 0} />
          </div>
        </div>

        <DrinkLog entries={entries} onDelete={deleteEntry} onReset={resetDay} />

        <footer className="md:col-span-2 text-center text-muted text-[12.5px] font-bold">
          {interval > 0 ? `🔔 Reminding you every ${interval} min` : "Reminders are off — tap 🔕 to turn on"}
        </footer>
      </main>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        goal={goal}
        setGoal={setGoal}
        interval={interval}
        setInterval={setIntervalMins}
        sound={sound}
        setSound={setSound}
        theme={theme}
        setTheme={setTheme}
        dark={dark}
        setDark={setDark}
        onReplayTour={() => {
          setSettingsOpen(false);
          setTourOpen(true);
        }}
        onTestReminder={() => notify("This is what a reminder looks like 🥛")}
      />

      <div
        className={`fixed bottom-[22px] left-1/2 z-[60] bg-ink text-white dark:bg-[#1c2c47] dark:border dark:border-line px-5 py-3 rounded-[14px] font-extrabold text-sm shadow-card pointer-events-none transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          toast ? "opacity-100 -translate-x-1/2 translate-y-0" : "opacity-0 -translate-x-1/2 translate-y-[60px]"
        }`}
      >
        {toast}
      </div>
      <canvas ref={confettiRef} className="fixed inset-0 z-[55] pointer-events-none" />

      {tourOpen && <Tour steps={TOUR_STEPS} onClose={closeTour} />}
    </div>
  );
}
