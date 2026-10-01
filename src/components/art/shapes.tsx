import { mix } from "@/lib/color";
import { cssVars } from "@/lib/css-vars";
import type { Product } from "@/lib/types";
import { Cylinder, Drop, Label, MOTION_LOOP, SANS, SERIF, Sparkle, Splash } from "./kit";

/*
 * Every shape draws into a 200 x 300 box, resting on y = 284.
 * Parts with an `m-*` class move when an ancestor has `.play`
 * (see styles/motion.css). Extra parts (pipette, cream, drops)
 * stay hidden until then, so still renders look untouched.
 */

interface ShapeProps {
  product: Product;
  uid: string;
}

const url = (id: string) => `url(#${id})`;

/** Serum: dropper lifts out, bulb squeezes, a drop falls and splashes. */
export function Dropper({ product, uid, glass }: ShapeProps & { glass: string }) {
  const g = `${uid}g`;
  const drop = mix(glass, "#FFC060", 0.35);
  return (
    <>
      <defs>
        <Cylinder id={g} color={glass} dark={0.6} light={0.3} />
        <Cylinder id={`${uid}r`} color="#2b2b2b" dark={0.7} light={0.5} />
        <Cylinder id={`${uid}o`} color="#C9A24A" dark={0.55} light={0.45} />
      </defs>
      <g className="m-drp">
        <rect x="95" y="112" width="10" height="40" rx="5" fill={mix(glass, "#ffffff", 0.5)} opacity=".85" />
        <rect x="97" y="116" width="2" height="30" rx="1" fill="#fff" opacity=".6" />
        <g className="m-bulb">
          <rect x="80" y="12" width="40" height="78" rx="19" fill={url(`${uid}r`)} />
          <rect x="87" y="20" width="5" height="52" rx="2.5" fill="#fff" opacity=".18" />
        </g>
        <rect x="74" y="86" width="52" height="30" rx="5" fill={url(`${uid}o`)} />
        <rect x="74" y="99" width="52" height="1" fill="#000" opacity=".25" />
      </g>
      <rect x="84" y="114" width="32" height="14" fill={url(g)} />
      <rect x="46" y="124" width="108" height="160" rx="24" fill={url(g)} />
      <rect x="49" y="152" width="102" height="129" rx="21" fill={mix(glass, "#FFB347", 0.3)} opacity=".38" />
      <Label x={58} y={176} w={84} h={88} product={product} ink="#22170f" />
      <rect x="51" y="136" width="6" height="130" rx="3" fill="#fff" opacity=".32" />
      <rect x="144" y="140" width="3" height="120" rx="1.5" fill="#fff" opacity=".2" />
      <Splash x={162} y={282} color={drop} at={MOTION_LOOP * 0.52} />
      <Drop x={162} y={110} color={drop} motion={["m-fall"]} />
    </>
  );
}

/** Cream: lid swings open, the cream wobbles, sparkles, lid settles back. */
export function Jar({ product, uid, cream = "#FFFDF8" }: ShapeProps & { cream?: string }) {
  const g = `${uid}g`;
  const groove = mix(cream, "#000000", 0.1);
  const sparkles: [number, number, number][] = [
    [62, 128, 0.8],
    [138, 122, 1],
    [102, 108, 0.6],
    [46, 112, 0.55],
    [156, 104, 0.7],
  ];
  return (
    <>
      <defs>
        <Cylinder id={g} color="#F1ECE3" dark={0.38} light={0.12} />
        <Cylinder id={`${uid}k`} color="#1a1a1a" dark={0.7} light={0.5} />
        <Cylinder id={`${uid}o`} color="#C9A24A" dark={0.55} light={0.45} />
      </defs>
      <rect x="28" y="166" width="144" height="118" rx="18" fill={url(g)} />
      <rect x="32" y="156" width="136" height="14" rx="4" fill={url(g)} />
      <rect x="32" y="161" width="136" height="1" fill="#000" opacity=".12" />
      <g className="m-dome">
        <path d="M38 160C50 145 74 140 100 140S150 145 162 160Z" fill={cream} />
        <path d="M91 141C92 127 110 124 112 133C108 129 101 131 103 141Z" fill={cream} />
        <path d="M58 152C72 146 86 145 98 146" fill="none" stroke={groove} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M110 147C124 146 136 149 146 154" fill="none" stroke={groove} strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <g className="m-lid">
        <rect x="24" y="124" width="152" height="46" rx="9" fill={url(`${uid}k`)} />
        <rect x="24" y="166" width="152" height="6" fill={url(`${uid}o`)} />
        <rect x="34" y="132" width="132" height="5" rx="2.5" fill="#fff" opacity=".14" />
      </g>
      <text x="100" y="204" textAnchor="middle" style={SANS} fontWeight="700" fontSize="5.5" letterSpacing="1.8" fill="#2a2622">
        SKINCARE
      </text>
      <text x="100" y="231" textAnchor="middle" style={SERIF} fontWeight="600" fontSize="22" fill="#2a2622">
        {product.label[0]}
      </text>
      <text x="100" y="248" textAnchor="middle" style={SERIF} fontStyle="italic" fontSize="14" fill="#2a2622">
        {product.label[1]}
      </text>
      <text x="100" y="270" textAnchor="middle" style={SANS} fontSize="5.6" letterSpacing=".8" fill="#2a2622" opacity=".7">
        {product.size.toUpperCase()}
      </text>
      <rect x="36" y="180" width="8" height="92" rx="4" fill="#fff" opacity=".7" />
      {sparkles.map(([x, y, s], i) => (
        <Sparkle key={i} x={x} y={y} scale={s} index={i} />
      ))}
    </>
  );
}

const BUBBLES: [number, number, number, number][] = [
  [70, 3.6, 3.8, 0],
  [86, 2.2, 3.1, -1.1],
  [104, 3, 4.4, -2.6],
  [121, 2, 3.4, -0.5],
  [131, 3.2, 4.1, -3.2],
  [96, 1.8, 2.9, -1.9],
];
const MIST: [number, number][] = [
  [-2, -7],
  [5, -9],
  [8, -3],
  [3, 4],
];

/** Pump: bubbles drift up, the head presses, a drop arcs out and splashes. */
export function Pump({ product, uid, glass }: ShapeProps & { glass: string }) {
  const g = `${uid}g`;
  const s = `${uid}s`;
  const drop = mix(glass, "#DCE8FF", 0.6);
  return (
    <>
      <defs>
        <Cylinder id={g} color={glass} dark={0.6} light={0.3} />
        <Cylinder id={s} color="#B9BDC4" dark={0.55} light={0.5} />
        <clipPath id={`${uid}lq`}>
          <rect x="57" y="132" width="86" height="149" rx="19" />
        </clipPath>
      </defs>
      <g className="m-head">
        <rect x="93" y="46" width="14" height="36" fill={url(s)} />
        <rect x="72" y="26" width="56" height="24" rx="7" fill={url(s)} />
        <rect x="120" y="32" width="30" height="9" rx="4.5" fill={url(s)} />
      </g>
      <rect x="76" y="78" width="48" height="26" rx="4" fill={url(s)} />
      <rect x="76" y="90" width="48" height="1" fill="#000" opacity=".25" />
      <rect x="54" y="98" width="92" height="186" rx="22" fill={url(g)} />
      <rect x="57" y="132" width="86" height="149" rx="19" fill={mix(glass, "#9CC0FF", 0.3)} opacity=".3" />
      <g clipPath={url(`${uid}lq`)}>
        {BUBBLES.map(([x, r, d, delay]) => (
          <circle
            key={x}
            className="m-bub"
            cx={x}
            cy="276"
            r={r}
            fill="#fff"
            style={cssVars({ "--d": `${d}s`, "--dl": `${delay}s`, "--bx": `${x % 2 ? 3 : -3}px` })}
          />
        ))}
      </g>
      <Label x={64} y={164} w={72} h={92} product={product} ink="#14213f" />
      <rect x="58" y="112" width="6" height="150" rx="3" fill="#fff" opacity=".32" />
      <rect x="138" y="116" width="3" height="140" rx="1.5" fill="#fff" opacity=".2" />
      {MIST.map(([mx, my]) => (
        <g key={`${mx}${my}`} transform="translate(151,45)">
          <circle className="m-mist" r="1.1" fill={drop} style={cssVars({ "--mx": `${mx * 2}px`, "--my": `${my * 1.6}px` })} />
        </g>
      ))}
      <Splash x={199} y={282} color={drop} at={MOTION_LOOP * 0.38} />
      <Drop x={153} y={40} color={drop} motion={["m-jx", "m-jy"]} />
    </>
  );
}

const RAYS: [number, number, number, number][] = [
  [133, 42, 108, 4],
  [151, 73, 197, 76],
  [162, 114, 200, 142],
];

/** Sunscreen: the sun sends rays, a shield flashes round the tube, rays bounce off. */
export function Tube({ product, uid, tube }: ShapeProps & { tube: string }) {
  const g = `${uid}g`;
  return (
    <>
      <defs>
        <Cylinder id={g} color={tube} dark={0.35} light={0.15} />
        <Cylinder id={`${uid}m`} color={mix(tube, "#000000", 0.1)} dark={0.4} light={0.15} />
        <Cylinder id={`${uid}c`} color={mix(product.palette.to, "#000000", 0.15)} dark={0.6} light={0.35} />
      </defs>
      <rect x="66" y="238" width="68" height="46" rx="7" fill={url(`${uid}c`)} />
      <rect x="66" y="251" width="68" height="1.2" fill="#000" opacity=".3" />
      <path d="M72 244C70 236 68 228 66 220L50 62H150L134 220C132 228 130 236 128 244Z" fill={url(g)} />
      <rect x="48" y="34" width="104" height="30" rx="3" fill={url(`${uid}m`)} />
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={(52 + i * 7.7).toFixed(1)} y="37" width="1" height="24" fill="#000" opacity=".12" />
      ))}
      <path d="M50.9 70H149.1L147.5 86H52.5Z" fill={product.palette.to} />
      <Label x={66} y={104} w={68} h={92} product={product} ink="#3a1d12" bg="none" />
      <path d="M56 70H62L72 228H68Z" fill="#fff" opacity=".45" />
      <ellipse
        className="m-shd"
        cx="100"
        cy="160"
        rx="66"
        ry="136"
        fill="#fff"
        fillOpacity=".07"
        stroke="#fff"
        strokeOpacity=".75"
        strokeWidth="1.5"
      />
      {RAYS.map(([hx, hy, ex, ey], i) => (
        <g key={i} style={cssVars({ "--i": i })}>
          <line className="m-ray" pathLength={100} x1="178" y1="24" x2={hx} y2={hy} stroke="#FFF1C2" strokeWidth="2.4" strokeLinecap="round" />
          <line className="m-ref" pathLength={100} x1={hx} y1={hy} x2={ex} y2={ey} stroke="#FFF1C2" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      <g transform="translate(178,24)">
        <g className="m-sun">
          <circle r="16" fill="#FFE7A0" opacity=".3" />
          <circle r="10" fill="#FFE08A" />
          <g className="m-sunr">
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x="-1.2" y="-21" width="2.4" height="6" rx="1.2" fill="#FFE7A0" transform={`rotate(${i * 45})`} />
            ))}
          </g>
        </g>
      </g>
    </>
  );
}

/** Supplement tub: the cap twists and pops (capsules are poured by the scene). */
export function SupplementBottle({ product, uid }: ShapeProps) {
  const g = `${uid}g`;
  const w = `${uid}w`;
  return (
    <>
      <defs>
        <Cylinder id={g} color="#F2EEE8" dark={0.38} light={0.1} />
        <Cylinder id={w} color={mix(product.palette.from, "#000000", 0.12)} dark={0.5} light={0.3} />
      </defs>
      <rect x="54" y="122" width="92" height="20" rx="5" fill={url(g)} />
      <rect x="54" y="128" width="92" height="1.2" fill="#000" opacity=".12" />
      <rect x="54" y="133" width="92" height="1.2" fill="#000" opacity=".12" />
      <rect x="38" y="136" width="124" height="148" rx="18" fill={url(g)} />
      <g className="m-cap">
        <rect x="42" y="92" width="116" height="50" rx="8" fill={url(w)} />
        {Array.from({ length: 15 }, (_, i) => (
          <rect key={i} x={(48 + i * 7.4).toFixed(1)} y="96" width="1.2" height="42" fill="#000" opacity=".1" />
        ))}
      </g>
      <Label x={38} y={172} w={124} h={92} product={product} ink="#ffffff" bg={product.palette.from} />
      <rect x="44" y="144" width="7" height="128" rx="3.5" fill="#fff" opacity=".4" />
    </>
  );
}
