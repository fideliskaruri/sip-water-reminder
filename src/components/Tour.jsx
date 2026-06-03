import { useEffect, useRef, useState } from "react";

const CARD_W = 320;

// A lightweight guided tour: dims the screen, spotlights the current target
// element, and shows a tooltip card with Back / Next / Skip controls.
export default function Tour({ steps, onClose }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const [, force] = useState(0);
  const step = steps[i];
  const last = i === steps.length - 1;

  // Track the target element's position (and keep it in sync during scroll /
  // resize / layout animations via a light polling loop).
  useEffect(() => {
    let raf;
    const measure = () => {
      if (!step.selector) {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.selector);
      setRect(el ? el.getBoundingClientRect() : null);
    };

    const el = step.selector && document.querySelector(step.selector);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });

    measure();
    const tick = () => {
      measure();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => force((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [step]);

  const finish = () => onClose();
  const next = () => (last ? finish() : setI((n) => n + 1));
  const back = () => setI((n) => Math.max(0, n - 1));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const vw = typeof window !== "undefined" ? window.innerWidth : 360;
  const vh = typeof window !== "undefined" ? window.innerHeight : 640;
  const cardW = Math.min(CARD_W, vw - 24);

  const pad = 6;
  const spot = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  let cardStyle;
  if (!rect) {
    cardStyle = { top: vh / 2, left: vw / 2, width: cardW, transform: "translate(-50%, -50%)" };
  } else {
    const cx = rect.left + rect.width / 2;
    const left = Math.min(Math.max(cx - cardW / 2, 12), vw - cardW - 12);
    const placeBelow = rect.bottom < vh * 0.58;
    cardStyle = placeBelow
      ? { top: rect.bottom + 14, left, width: cardW }
      : { top: rect.top - 14, left, width: cardW, transform: "translateY(-100%)" };
  }

  return (
    <div className="fixed inset-0 z-[90]">
      {/* click catcher — blocks interaction with the app behind the tour */}
      <div
        className="absolute inset-0"
        onClick={(e) => e.stopPropagation()}
        aria-hidden="true"
      />

      {/* dim layer: full screen when no target, otherwise the spotlight cut-out */}
      {spot ? (
        <div
          className="absolute rounded-[14px] pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: "0 0 0 9999px rgba(8, 18, 34, 0.62), 0 0 0 3px var(--color-accent)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#081222]/65" />
      )}

      <div
        className="absolute bg-card border border-line rounded-[18px] p-4 shadow-card text-ink animate-pop-in transition-[top,left] duration-300"
        style={cardStyle}
        role="dialog"
        aria-modal="true"
        aria-label="App tour"
      >
        <div className="flex items-center gap-1.5 mb-2">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-5 bg-accent" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>

        <h3 className="text-[15px] font-extrabold">{step.title}</h3>
        <p className="text-muted text-[13px] font-bold leading-snug mt-1">{step.body}</p>

        <div className="flex items-center justify-between mt-3.5">
          <button
            onClick={finish}
            className="text-muted text-[12.5px] font-bold underline hover:text-accent transition"
          >
            {last ? "Close" : "Skip"}
          </button>
          <div className="flex items-center gap-2">
            {i > 0 && (
              <button
                onClick={back}
                className="bg-soft2 border border-line text-ink rounded-[11px] py-2 px-3.5 font-extrabold text-[13px] hover:bg-soft active:scale-95 transition"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="bg-gradient-to-br from-accent to-accent2 text-white rounded-[11px] py-2 px-4 font-extrabold text-[13px] shadow-[0_8px_18px_var(--accent-glow)] hover:brightness-105 active:scale-95 transition"
            >
              {last ? "Done 🎉" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
