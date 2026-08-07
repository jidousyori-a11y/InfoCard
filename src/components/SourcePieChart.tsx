import { useId } from "react";
import type { Cat1Stat } from "../lib/sourceStats";

interface SourcePieChartProps {
  data: Cat1Stat[];
  colorSlot: Map<string, number>;
  total: number;
}

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 92;
const INNER_RADIUS = 54; // ドーナツ化(中央に合計件数を表示するため)
const GAP_DEG = 1.6; // セグメント間の隙間(サーフェス色の2px相当をSVG角度で確保)

function polarToXY(angleDeg: number, r: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
}

function donutSlicePath(startDeg: number, endDeg: number): string {
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const [x1, y1] = polarToXY(startDeg, RADIUS);
  const [x2, y2] = polarToXY(endDeg, RADIUS);
  const [x3, y3] = polarToXY(endDeg, INNER_RADIUS);
  const [x4, y4] = polarToXY(startDeg, INNER_RADIUS);
  return [
    `M ${x1} ${y1}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

/**
 * 第一カテゴリの割合を示すドーナツ円グラフ。件数の表は別途あるため、
 * ここでは大きいセグメントにだけ直接ラベルを置き、小さいものは凡例(+ホバー)に任せる。
 */
export function SourcePieChart({ data, colorSlot, total }: SourcePieChartProps) {
  const uid = useId();
  if (total === 0) return null;

  let cursor = 0;
  const slices = data.map((d) => {
    const fraction = d.count / total;
    const startDeg = cursor * 360;
    const endDeg = (cursor + fraction) * 360;
    cursor += fraction;
    const midDeg = (startDeg + endDeg) / 2;
    const pct = Math.round(fraction * 1000) / 10;
    return {
      ...d,
      startDeg: startDeg + GAP_DEG / 2,
      endDeg: Math.max(startDeg + GAP_DEG / 2, endDeg - GAP_DEG / 2),
      midDeg,
      pct,
    };
  });

  return (
    <div className="source-pie">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={`第一カテゴリ別の割合(全${total}件)`}
      >
        {slices.map((s) => {
          const slot = colorSlot.get(s.cat1) ?? 0;
          const labelR = (RADIUS + INNER_RADIUS) / 2;
          const [lx, ly] = polarToXY(s.midDeg, labelR);
          const showInlineLabel = s.pct >= 8; // 小さいセグメントは凡例+ホバーに任せる
          return (
            <g key={`${uid}-${s.cat1}`} className="source-pie__slice-group">
              <path
                className="source-pie__slice"
                d={donutSlicePath(s.startDeg, s.endDeg)}
                style={{ fill: `var(--cat-color-${slot})` }}
              >
                <title>
                  {s.cat1}: {s.count}件 ({s.pct}%)
                </title>
              </path>
              {showInlineLabel && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="source-pie__label"
                >
                  {s.pct}%
                </text>
              )}
            </g>
          );
        })}
        <text x={CENTER} y={CENTER - 6} textAnchor="middle" className="source-pie__total-value">
          {total}
        </text>
        <text x={CENTER} y={CENTER + 14} textAnchor="middle" className="source-pie__total-label">
          件
        </text>
      </svg>

      <ul className="source-pie__legend">
        {slices.map((s) => {
          const slot = colorSlot.get(s.cat1) ?? 0;
          return (
            <li key={`legend-${s.cat1}`} className="source-pie__legend-item">
              <span className="source-pie__legend-swatch" style={{ background: `var(--cat-color-${slot})` }} />
              <span className="source-pie__legend-label">{s.cat1}</span>
              <span className="source-pie__legend-value">
                {s.count}件({s.pct}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
