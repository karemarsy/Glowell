import { darken, lighten } from "@/lib/color";
import { cssVars } from "@/lib/css-vars";
import type { Product } from "@/lib/types";

export const SANS = { fontFamily: "var(--font-sans), Arial, sans-serif" };
export const SERIF = { fontFamily: "var(--font-serif), Georgia, serif" };

/** Horizontal gradient that makes a flat rect read as a lit cylinder. */
export function Cylinder({ id, color, dark = 0.55, light = 0.28 }: { id: string; color: string; dark?: number; light?: number }) {
  return (
    <linearGradient id={id} x1="0" x2="1">
      <stop offset="0" stopColor={darken(color, dark)} />
      <stop offset=".15" stopColor={darken(color, dark * 0.33)} />
      <stop offset=".38" stopColor={lighten(color, light)} />
      <stop offset=".66" stopColor={color} />
      <stop offset="1" stopColor={darken(color, dark * 1.05)} />
    </linearGradient>
  );
}

interface LabelProps {
  x: number;
  y: number;
  w: number;
  h: number;
  product: Product;
  ink: string;
  bg?: string;
}

/** Printed product label, with text sized to fit the label width. */
export function Label({ x, y, w, h, product, ink, bg = "#F8F4EC" }: LabelProps) {
  const [l1, l2] = product.label;
  const cx = x + w / 2;
  const fs = Math.min(15, (w - 12) / (l1.length * 0.56));
  const f2 = Math.min(fs * 0.82, (w - 12) / (l2.length * 0.5));
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="2.5" fill={bg} />
      <text x={cx} y={y + 15} textAnchor="middle" style={SANS} fontWeight="700" fontSize="4.6" letterSpacing="1.2" fill={ink} opacity=".85">
        {product.kind === "vitamin" ? "DIETARY SUPPLEMENT" : "SKINCARE"}
      </text>
      <text x={cx} y={y + h * 0.52} textAnchor="middle" style={SERIF} fontWeight="600" fontSize={fs.toFixed(1)} fill={ink}>
        {l1}
      </text>
      <text x={cx} y={y + h * 0.52 + fs * 0.95} textAnchor="middle" style={SERIF} fontStyle="italic" fontSize={f2.toFixed(1)} fill={ink}>
        {l2}
      </text>
      <rect x={cx - 10} y={y + h - 19} width="20" height=".7" fill={ink} opacity=".5" />
      <text x={cx} y={y + h - 9} textAnchor="middle" style={SANS} fontSize="5" letterSpacing=".7" fill={ink} opacity=".75">
        {product.size.toUpperCase()}
      </text>
    </>
  );
}

/** A liquid drop, nested inside one wrapper group per motion class. */
export function Drop({ x, y, color, motion }: { x: number; y: number; color: string; motion: string[] }) {
  const inner = (
    <>
      <path d="M0 0C3 5 6 9 6 12.5A6 6 0 0 1-6 12.5C-6 9-3 5 0 0Z" fill={color} />
      <ellipse cx="-2.2" cy="12" rx="1.4" ry="2.4" fill="#fff" opacity=".75" />
    </>
  );
  return <g transform={`translate(${x},${y})`}>{motion.reduceRight((child, cls) => <g className={cls}>{child}</g>, inner)}</g>;
}

/** Ripples and droplets where a drop lands. `at` is the landing time in seconds. */
export function Splash({ x, y, color, at }: { x: number; y: number; color: string; at: number }) {
  const bits: [number, number, number][] = [
    [-10, -12, 2.2],
    [9, -15, 1.8],
    [2, -9, 1],
  ];
  return (
    <g transform={`translate(${x},${y})`} style={cssVars({ "--at": `${at.toFixed(2)}s` })}>
      <ellipse className="m-pud" rx="9" ry="2" fill={color} />
      <ellipse className="m-rip" rx="16" ry="3.4" fill="none" stroke={color} strokeWidth="1.8" />
      <ellipse className="m-rip m-rip2" rx="16" ry="3.4" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.1" />
      {bits.map(([sx, sy, r]) => (
        <circle key={sx} className="m-sp" r={r} fill={color} style={cssVars({ "--sx": `${sx}px`, "--sy": `${sy}px` })} />
      ))}
    </g>
  );
}

export function Sparkle({ x, y, scale, index }: { x: number; y: number; scale: number; index: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <g className="m-spk" style={cssVars({ "--i": index })}>
        <path d="M0-7L1.5-1.5 7 0 1.5 1.5 0 7-1.5 1.5-7 0-1.5-1.5Z" fill="#fff" />
      </g>
    </g>
  );
}

/** Seconds per motion loop. Keep in sync with --mt in styles/motion.css. */
export const MOTION_LOOP = 6.5;
