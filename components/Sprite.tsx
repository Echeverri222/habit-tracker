import type { CSSProperties } from "react";

// Pixel sprites drawn from ASCII grids. Each char maps to a fill (any CSS
// color or var()); "." is transparent. Horizontal runs merge into one rect.

export type SpriteDef = { rows: string[]; palette: Record<string, string> };

export function Sprite({
  sprite,
  scale = 3,
  className,
  style,
}: {
  sprite: SpriteDef;
  scale?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const w = Math.max(...sprite.rows.map((r) => r.length));
  const h = sprite.rows.length;
  const rects: React.ReactNode[] = [];
  sprite.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== "." && sprite.palette[ch]) {
        rects.push(
          <rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} style={{ fill: sprite.palette[ch] }} />,
        );
      }
      x = end;
    }
  });
  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden
    >
      {rects}
    </svg>
  );
}
