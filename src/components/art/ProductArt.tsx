import Image from "next/image";
import { lighten } from "@/lib/color";
import { Cylinder } from "./kit";
import { cssVars } from "@/lib/css-vars";
import type { Product } from "@/lib/types";
import { Dropper, Jar, Pump, SupplementBottle, Tube } from "./shapes";

/** Product artwork in its 200 x 300 box. */
function Artwork({ product, uid }: { product: Product; uid: string }) {
  const { art } = product;
  switch (art.shape) {
    case "dropper":
      return <Dropper product={product} uid={uid} glass={art.glass} />;
    case "pump":
      return <Pump product={product} uid={uid} glass={art.glass} />;
    case "jar":
      return <Jar product={product} uid={uid} cream={art.cream} />;
    case "tube":
      return <Tube product={product} uid={uid} tube={art.tube} />;
    case "capsules":
    case "softgels":
      return <SupplementBottle product={product} uid={uid} />;
  }
}

/* ---------- loose capsules / softgels ---------- */

function CapsuleBody({ uid, sheen, colors }: { uid: string; sheen: string; colors: readonly [string, string] }) {
  return (
    <g transform="translate(-24,-10) scale(1.1)">
      <clipPath id={uid}>
        <rect width="44" height="18" rx="9" />
      </clipPath>
      <g clipPath={`url(#${uid})`}>
        <rect width="23" height="18" fill={colors[0]} />
        <rect x="22" width="22" height="18" fill={colors[1]} />
        <rect width="44" height="18" fill={`url(#${sheen})`} />
      </g>
      <rect x="22" width="1.2" height="18" fill="#000" opacity=".18" />
    </g>
  );
}

function SoftgelBody({ uid }: { uid: string }) {
  return (
    <>
      <ellipse rx="22" ry="13" fill={`url(#${uid}gel)`} />
      <ellipse cx="-6" cy="-5" rx="9" ry="3.4" fill="#fff" opacity=".55" />
    </>
  );
}

function Pill({ product, uid, n }: { product: Product; uid: string; n: string }) {
  return product.art.shape === "capsules" ? (
    <CapsuleBody uid={`${uid}c${n}`} sheen={`${uid}sheen`} colors={product.art.capsule} />
  ) : (
    <SoftgelBody uid={uid} />
  );
}

const RESTING: Record<"capsules" | "softgels", [number, number, number][]> = {
  capsules: [
    [408, 518, -18],
    [362, 531, 24],
    [196, 525, 10],
  ],
  softgels: [
    [404, 517, -14],
    [452, 500, 22],
    [196, 522, 10],
  ],
};

/** Where poured pills land, how high they fly, and how far they spin. */
const POUR: Record<"capsules" | "softgels", { land: [number, number]; up: number; rot: string }[]> = {
  capsules: [
    { land: [292, 533], up: -62, rot: "192deg" },
    { land: [150, 506], up: -48, rot: "-340deg" },
    { land: [455, 502], up: -72, rot: "380deg" },
  ],
  softgels: [
    { land: [300, 534], up: -62, rot: "200deg" },
    { land: [146, 506], up: -48, rot: "-330deg" },
    { land: [352, 522], up: -72, rot: "370deg" },
  ],
};
const MOUTH: [number, number] = [300, 278];
const STAND_SIDE = "M110 500 V560 A190 34 0 0 0 490 560 V500 Z";

function Supplements({ product, uid }: { product: Product; uid: string }) {
  if (product.art.shape !== "capsules" && product.art.shape !== "softgels") return null;
  const shape = product.art.shape;
  return (
    <>
      {RESTING[shape].map(([x, y, rot], i) => (
        <g key={`r${i}`} transform={`translate(${x},${y}) rotate(${rot})`}>
          <ellipse cx="0" cy="11" rx={shape === "capsules" ? 26 : 22} ry="5" fill="#000" opacity=".28" filter={`url(#${uid}blur)`} />
          <Pill product={product} uid={uid} n={`r${i}`} />
        </g>
      ))}
      {POUR[shape].map(({ land: [x, y], up, rot }, i) => {
        const vars = cssVars({ "--i": i, "--dx": `${x - MOUTH[0]}px`, "--dy": `${y - MOUTH[1]}px`, "--up": `${up}px`, "--rot": rot });
        return (
          <g key={`p${i}`}>
            <g transform={`translate(${x},${y + 11})`} style={vars}>
              <ellipse className="m-psh" rx={shape === "capsules" ? 26 : 22} ry="5" fill="#000" filter={`url(#${uid}blur)`} />
            </g>
            <g transform={`translate(${MOUTH[0]},${MOUTH[1]})`} style={vars}>
              <g className="m-px">
                <g className="m-py">
                  <g className="m-pr">
                    <Pill product={product} uid={uid} n={`p${i}`} />
                  </g>
                </g>
              </g>
            </g>
          </g>
        );
      })}
    </>
  );
}

/* ---------- public components ---------- */

interface ArtProps {
  product: Product;
  /** Unique per render on a page, so SVG gradient ids never collide. */
  uid: string;
  priority?: boolean;
}

/**
 * The product on its stand: the large artwork used by the hero, the
 * collection cards and the product page. Animates when an ancestor has `.play`.
 */
export function ProductScene({ product, uid, priority }: ArtProps) {
  if (product.image) {
    return (
      <Image src={product.image} alt={product.name} fill sizes="(max-width: 900px) 100vw, 50vw" priority={priority} style={{ objectFit: "contain", objectPosition: "50% 100%" }} />
    );
  }
  const { from, to } = product.palette;
  return (
    <svg viewBox="0 0 600 620" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <filter id={`${uid}blur`} x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <Cylinder id={`${uid}stand`} color={lighten(to, 0.14)} dark={0.5} light={0.22} />
        <linearGradient id={`${uid}sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".6" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
        <linearGradient id={`${uid}glint`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}side`}>
          <path d={STAND_SIDE} />
        </clipPath>
        <radialGradient id={`${uid}gel`} cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="#FFD27A" />
          <stop offset=".6" stopColor="#E69A2E" />
          <stop offset="1" stopColor="#9A5A10" />
        </radialGradient>
      </defs>
      <ellipse cx="300" cy="586" rx="250" ry="24" fill="#000" opacity=".3" filter={`url(#${uid}blur)`} />
      <path d={STAND_SIDE} fill={`url(#${uid}stand)`} />
      <g clipPath={`url(#${uid}side)`}>
        <rect className="m-glint" x="20" y="480" width="110" height="130" fill={`url(#${uid}glint)`} />
      </g>
      <ellipse cx="300" cy="500" rx="190" ry="34" fill={lighten(from, 0.3)} />
      <ellipse cx="300" cy="500" rx="190" ry="34" fill="none" stroke="#fff" strokeOpacity=".35" />
      {/* turntable: dots travel round the rim, light pulses out from the product */}
      <ellipse
        className="m-rim"
        cx="300"
        cy="500"
        rx="176"
        ry="29"
        fill="none"
        stroke="#fff"
        strokeOpacity=".85"
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={480}
        strokeDasharray="0.1 23.9"
      />
      <ellipse className="m-pulse" cx="300" cy="502" rx="88" ry="13" fill="none" stroke="#fff" strokeWidth="1.6" />
      <ellipse className="m-pulse m-pulse2" cx="300" cy="502" rx="88" ry="13" fill="none" stroke="#fff" strokeWidth="1.2" />
      <ellipse cx="300" cy="504" rx="86" ry="11" fill="#000" opacity=".32" filter={`url(#${uid}blur)`} />
      <g transform="translate(155,91) scale(1.45)">
        <Artwork product={product} uid={`${uid}a`} />
      </g>
      <Supplements product={product} uid={uid} />
    </svg>
  );
}

/** Just the bottle, for small places (bag lines, pair tiles). Never animates. */
export function ProductThumb({ product, uid }: ArtProps) {
  if (product.image) {
    return <Image src={product.image} alt="" fill sizes="160px" style={{ objectFit: "contain" }} />;
  }
  return (
    <svg viewBox="0 0 200 300" aria-hidden="true" focusable="false">
      <Artwork product={product} uid={uid} />
    </svg>
  );
}
