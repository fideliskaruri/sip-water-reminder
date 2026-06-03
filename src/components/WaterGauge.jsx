import { useEffect, useRef, useState } from "react";
import { wavePath } from "../utils/wave.js";

const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 116; // water circle radius
const RING_R = 121; // progress ring radius (kept inside the viewBox to avoid edge clipping)
const TOP = CY - R;
const SPAN = R * 2;
const C = 2 * Math.PI * RING_R;

export default function WaterGauge({ amount, goal }) {
  const target = Math.max(0, Math.min(1, goal > 0 ? amount / goal : 0));
  const fracRef = useRef(target);
  const phaseRef = useRef(0);
  const [frac, setFrac] = useState(target);
  const [w1, setW1] = useState("");
  const [w2, setW2] = useState("");
  const [hasWater, setHasWater] = useState(target > 0.004);

  useEffect(() => {
    let raf;
    const loop = () => {
      fracRef.current += (target - fracRef.current) * 0.07;
      if (Math.abs(target - fracRef.current) < 0.0004) fracRef.current = target;
      setFrac(fracRef.current);

      phaseRef.current += 0.05;
      const f = fracRef.current;
      const filling = Math.abs(target - f) > 0.01;
      // ease amplitude to zero at the extremes so 0% shows no water and 100% looks full
      const edge = Math.min(f, 1 - f);
      const ampScale = Math.max(0, Math.min(1, edge / 0.05));
      const amp = (filling ? 6 : 3.5) * ampScale;
      // push the surface slightly past the circle at the extremes for a clean fill
      const surface = TOP + (1 - f) * SPAN - amp;
      const clamped = Math.max(TOP - 8, Math.min(CY + R + 8, surface));
      setW1(wavePath(clamped, amp, 150, phaseRef.current, SIZE, SIZE));
      setW2(wavePath(clamped + 3, amp * 0.7, 120, phaseRef.current + Math.PI / 2, SIZE, SIZE));
      setHasWater(f > 0.004);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const pct = Math.round(frac * 100);
  const dashoffset = C - target * C;

  return (
    <div className="relative aspect-square w-[min(260px,66vw,42vh)] [container-type:inline-size] [@media(max-height:560px)_and_(orientation:landscape)]:w-[min(46vh,220px)] md:w-[min(280px,30vw)]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block w-full h-full" role="img" aria-label={`${pct}% of daily goal`}>
        <defs>
          <clipPath id="waterClip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent2)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>

        {/* track */}
        <circle cx={CX} cy={CY} r={RING_R} className="fill-none stroke-soft [stroke-width:12]" />

        {/* water */}
        <circle cx={CX} cy={CY} r={R} className="[fill:#eef6ff]" />
        {hasWater && (
          <g clipPath="url(#waterClip)">
            <path d={w2} fill="url(#waterGrad)" opacity="0.5" />
            <path d={w1} fill="url(#waterGrad)" />
            <path d={w1} fill="rgba(255,255,255,.35)" transform="translate(0,-2.5)" />
          </g>
        )}

        {/* progress ring */}
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          className="fill-none [stroke:url(#waterGrad)] [stroke-width:12] [stroke-linecap:round] origin-center [transform:rotate(-90deg)] transition-[stroke-dashoffset] duration-700 ease-out"
          style={{ strokeDasharray: C, strokeDashoffset: dashoffset }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center bg-white/75 backdrop-blur-sm border border-white/70 rounded-[8cqw] px-[8cqw] py-[4cqw] text-ink shadow-soft">
          <span className="text-[17cqw] font-extrabold leading-none tracking-tight">{pct}%</span>
          <span className="text-[5.4cqw] font-extrabold opacity-85 mt-[2cqw] whitespace-nowrap">
            {Math.round(amount)} / {goal} ml
          </span>
        </div>
      </div>
    </div>
  );
}
