// Generic sine-wave surface path filling down to `height`.
export function wavePath(surfaceY, amp, len, phase, width, height) {
  let d = `M -20 ${surfaceY.toFixed(2)}`;
  const step = 10;
  for (let x = -20; x <= width + 20; x += step) {
    const y = surfaceY + Math.sin((x / len) * Math.PI * 2 + phase) * amp;
    d += ` L ${x} ${y.toFixed(2)}`;
  }
  d += ` L ${width + 20} ${height} L -20 ${height} Z`;
  return d;
}
