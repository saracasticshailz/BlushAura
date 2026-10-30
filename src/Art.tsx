import { useId } from 'react';
export function ProductArt({
  kind = 'wand',
  color = '#b56a7d',
  hero = false,
}: {
  kind?: string;
  color?: string;
  hero?: boolean;
}) {
  const id = useId().replaceAll(':', '');
  return (
    <svg
      viewBox={hero ? '0 0 640 610' : '0 0 400 360'}
      role="img"
      aria-label={
        hero
          ? 'Blush Aura massage wand and botanical oil on sculptural blush plinths'
          : `${kind} product illustration`
      }
      className="product-art"
    >
      <defs>
        <linearGradient id={id + 'body'} x1="0" x2="1">
          <stop stopColor={color} />
          <stop offset=".45" stopColor={color} />
          <stop offset=".65" stopColor="#fff" stopOpacity=".28" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
        <linearGradient id={id + 'glass'} x1="0" x2="1">
          <stop stopColor="#623c1c" />
          <stop offset=".3" stopColor="#c6984d" />
          <stop offset=".65" stopColor="#9d692b" />
          <stop offset="1" stopColor="#59351b" />
        </linearGradient>
        <linearGradient id={id + 'plinth'}>
          <stop stopColor="#d8aaa0" />
          <stop offset=".5" stopColor="#efd3c8" />
          <stop offset="1" stopColor="#cea093" />
        </linearGradient>
        <filter id={id + 'shadow'} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={id + 'texture'}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".7"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".035" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
      {hero ? (
        <>
          <rect width="640" height="610" fill="#e4bdb0" />
          <path d="M58 610V242a260 260 0 0 1 520 0v368" fill="#eac9bd" />
          <path d="M78 610V248a240 240 0 0 1 480 0v362" fill="#e1b5a8" />
          <ellipse
            cx="368"
            cy="550"
            rx="233"
            ry="31"
            fill="#a97363"
            opacity=".22"
            filter={`url(#${id}shadow)`}
          />
          <path d="M117 404h260v206H117z" fill={`url(#${id}plinth)`} />
          <ellipse cx="247" cy="404" rx="130" ry="39" fill="#f0d8cd" />
          <path d="M360 490h230v120H360z" fill={`url(#${id}plinth)`} />
          <ellipse cx="475" cy="490" rx="115" ry="31" fill="#f1d4c8" />
          <g transform="translate(72 55) rotate(-15 200 250)">
            <Wand id={id} color={color} />
          </g>
          <g transform="translate(285 199) scale(.85)">
            <Oil id={id} />
          </g>
          <path
            d="M529 551c-24-74-6-153 38-235M549 400c-49-12-47-42-51-58 40 10 49 30 51 58M551 377c34-2 47-26 54-43-39 1-49 21-54 43M535 447c-35-6-49-25-59-45 38-3 53 17 59 45"
            fill="#777756"
            opacity=".8"
          />
          <text x="485" y="94" textAnchor="middle" fill="#743c45" fontSize="11" letterSpacing="3">
            MADE FOR
          </text>
          <text
            x="485"
            y="118"
            textAnchor="middle"
            fill="#743c45"
            fontSize="19"
            fontFamily="Georgia"
            fontStyle="italic"
          >
            your kind of calm.
          </text>
          <rect
            width="640"
            height="610"
            filter={`url(#${id}texture)`}
            opacity=".5"
            fill="transparent"
          />
        </>
      ) : (
        <>
          <ellipse
            cx="200"
            cy="309"
            rx="86"
            ry="10"
            fill="#673c3c"
            opacity=".15"
            filter={`url(#${id}shadow)`}
          />
          {kind === 'wand' ? (
            <g transform="translate(0 -33) rotate(-18 200 200)">
              <Wand id={id} color={color} />
            </g>
          ) : kind === 'oil' ? (
            <g transform="translate(5 -18)">
              <Oil id={id} />
            </g>
          ) : kind === 'pebble' ? (
            <g transform="rotate(-25 200 190)">
              <rect x="130" y="92" width="140" height="208" rx="70" fill={`url(#${id}body)`} />
              <ellipse
                cx="200"
                cy="218"
                rx="14"
                ry="18"
                fill="none"
                stroke="#f3d6ca"
                opacity=".7"
              />
              <path d="M200 201v15" stroke="#f3d6ca" />
              <text
                x="200"
                y="265"
                textAnchor="middle"
                fontSize="10"
                letterSpacing="2"
                fill="#f7e8df"
              >
                blush aura
              </text>
            </g>
          ) : kind === 'candle' ? (
            <>
              <rect x="127" y="129" width="146" height="171" rx="13" fill="#c7ad91" />
              <ellipse cx="200" cy="129" rx="73" ry="19" fill="#e9d7b9" />
              <path d="M200 124v-20" stroke="#554237" strokeWidth="3" />
              <path d="M200 105c-20-22 6-29 0-44 27 25 16 37 0 44" fill="#e5a34f" />
              <rect x="144" y="171" width="112" height="89" fill="#f9f0df" />
              <text
                x="200"
                y="202"
                textAnchor="middle"
                fontFamily="Georgia"
                fontSize="16"
                fill="#733747"
              >
                blush aura
              </text>
              <text x="200" y="228" textAnchor="middle" fontSize="9" letterSpacing="2">
                SLOW SUNDAYS
              </text>
            </>
          ) : (
            <>
              <path d="M65 134l193-35 76 56-192 36z" fill="#e8c1b9" />
              <path d="M65 134l77 57v119l-77-57z" fill="#b77d7e" />
              <path d="M142 191l192-36v119l-192 36z" fill="#d19b9d" />
              <path d="M207 110l20-4 77 55v119l-20 4V165z" fill="#743747" />
              <text
                x="237"
                y="223"
                textAnchor="middle"
                transform="rotate(-10 237 223)"
                fill="#fff1e9"
                fontSize="20"
                fontFamily="Georgia"
              >
                blush aura
              </text>
            </>
          )}
        </>
      )}
    </svg>
  );
}
function Wand({ id, color }: { id: string; color: string }) {
  return (
    <>
      <rect x="170" y="172" width="58" height="170" rx="29" fill={`url(#${id}body)`} />
      <rect x="181" y="143" width="36" height="61" rx="18" fill={color} />
      <rect x="144" y="80" width="110" height="103" rx="48" fill={`url(#${id}body)`} />
      <path d="M150 144c26 14 71 15 98-1" fill="none" stroke="#fff" opacity=".2" />
      <circle cx="199" cy="249" r="11" fill="none" stroke="#f5c9cf" strokeWidth="1.5" />
      <path d="M199 239v10" stroke="#f5c9cf" strokeWidth="1.5" />
      <text x="199" y="308" textAnchor="middle" fontFamily="Georgia" fontSize="8" fill="#f9dbdd">
        blush aura
      </text>
    </>
  );
}
function Oil({ id }: { id: string }) {
  return (
    <>
      <rect x="156" y="79" width="78" height="61" rx="8" fill="#3b302b" />
      <path
        d="M164 83v53m9-53v53m9-53v53m9-53v53m9-53v53m9-53v53m9-53v53m9-53v53"
        stroke="#5f5047"
      />
      <rect x="137" y="132" width="116" height="174" rx="23" fill={`url(#${id}glass)`} />
      <rect x="145" y="175" width="100" height="102" rx="1" fill="#f6e8cc" />
      <text x="195" y="200" textAnchor="middle" fontFamily="Georgia" fill="#633643" fontSize="17">
        blush aura
      </text>
      <text x="195" y="226" textAnchor="middle" fontSize="10" letterSpacing="1.3" fill="#633643">
        GOLDEN HOUR
      </text>
      <text x="195" y="244" textAnchor="middle" fontSize="7" letterSpacing="1.4" fill="#633643">
        BODY & MASSAGE OIL
      </text>
      <text x="195" y="262" textAnchor="middle" fontSize="7" fill="#633643">
        100 ml / 3.4 fl oz
      </text>
    </>
  );
}

export function ProductVisual({ product }: { product: import('./catalog').Product }) {
  return product.imageUrl ? (
    <img className="product-photo" src={product.imageUrl} alt={product.name} />
  ) : (
    <ProductArt kind={product.kind} color={product.color} />
  );
}
