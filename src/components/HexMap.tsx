import { useMemo } from 'react';
import { MAP_TILES, rotateTile180, type MapConfig } from '../data/map-tiles';
import type { TerrainType, AnimalType, StructureColor } from '../types';

// 地形の色
const TERRAIN_COLORS: Record<TerrainType, string> = {
  forest: '#22c55e',   // green-500
  desert: '#eab308',   // yellow-500
  swamp: '#a855f7',    // purple-500
  mountain: '#6b7280', // gray-500
  water: '#3b82f6',    // blue-500
};

// 構造物の色
const STRUCTURE_COLORS: Record<StructureColor, string> = {
  green: '#15803d',  // green-700
  blue: '#1d4ed8',   // blue-700
  white: '#f5f5f5',  // gray-100
  black: '#1f2937',  // gray-800
};

interface HexMapProps {
  config: MapConfig;
  highlightedCells?: Set<string>; // "col-row" 形式のセット
  onCellClick?: (col: number, row: number) => void;
  rotation?: 0 | 90 | 180 | 270;
}

// ヘックスのサイズ（flat-top）
const HEX_SIZE = 20;
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;

// ヘックスの頂点を計算（flat-top hexagon）
function getHexPoints(cx: number, cy: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // flat-top: 0°から開始
    const x = cx + HEX_SIZE * Math.cos(angle);
    const y = cy + HEX_SIZE * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

// グリッド座標からピクセル座標へ変換（flat-top offset coordinates, odd-q）
function hexToPixel(col: number, row: number): { x: number; y: number } {
  const x = col * HEX_SIZE * 1.5 + HEX_SIZE + 30;
  const y = row * HEX_HEIGHT + (col % 2 === 1 ? HEX_HEIGHT / 2 : 0) + HEX_HEIGHT / 2 + 10;
  return { x, y };
}

// マップ全体のセルデータを生成
interface CellData {
  col: number;
  row: number;
  terrain: TerrainType;
  animal?: AnimalType;
  structure?: { type: 'stone' | 'shack'; color: StructureColor };
}

function generateMapCells(config: MapConfig): CellData[] {
  const cells: CellData[] = [];

  // タイル配置: 2列 × 3行 = 6タイル
  // [位置0, 位置1]  上段
  // [位置2, 位置3]  中段
  // [位置4, 位置5]  下段
  // 各タイルは6列×3行、全体で12列×9行
  const tilePositions = [
    { startCol: 0, startRow: 0 },   // 位置0: 上段左
    { startCol: 6, startRow: 0 },   // 位置1: 上段右
    { startCol: 0, startRow: 3 },   // 位置2: 中段左
    { startCol: 6, startRow: 3 },   // 位置3: 中段右
    { startCol: 0, startRow: 6 },   // 位置4: 下段左
    { startCol: 6, startRow: 6 },   // 位置5: 下段右
  ];

  config.tiles.forEach((tileConfig, posIndex) => {
    if (tileConfig.tileId === null) return;
    const baseTile = MAP_TILES[tileConfig.tileId];
    if (!baseTile) return;

    const tile = tileConfig.reversed ? rotateTile180(baseTile) : baseTile;
    const pos = tilePositions[posIndex];

    for (let tileRow = 0; tileRow < 3; tileRow++) {
      for (let tileCol = 0; tileCol < 6; tileCol++) {
        const hex = tile.hexes[tileRow][tileCol];
        const col = pos.startCol + tileCol;
        const row = pos.startRow + tileRow;

        cells.push({
          col,
          row,
          terrain: hex.terrain,
          animal: hex.animal,
        });
      }
    }
  });

  // 構造物を追加
  config.structures.forEach((structure) => {
    const cell = cells.find((c) => c.col === structure.col && c.row === structure.row);
    if (cell) {
      cell.structure = { type: structure.type, color: structure.color };
    }
  });

  return cells;
}

// 動物アイコン
function AnimalMarker({ animal, x, y }: { animal: AnimalType; x: number; y: number }) {
  const color = animal === 'bear' ? '#92400e' : '#ea580c'; // amber-800 / orange-600
  return (
    <circle
      cx={x}
      cy={y + HEX_SIZE * 0.3}
      r={6}
      fill={color}
      stroke="#fff"
      strokeWidth={1}
    />
  );
}

// 構造物アイコン
function StructureMarker({
  type,
  color,
  x,
  y,
}: {
  type: 'stone' | 'shack';
  color: StructureColor;
  x: number;
  y: number;
}) {
  const fillColor = STRUCTURE_COLORS[color];
  const strokeColor = color === 'white' ? '#9ca3af' : '#fff';

  if (type === 'stone') {
    // 巨石: 菱形
    return (
      <polygon
        points={`${x},${y - 8} ${x + 6},${y} ${x},${y + 8} ${x - 6},${y}`}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
      />
    );
  } else {
    // 廃墟: 三角形
    return (
      <polygon
        points={`${x},${y - 8} ${x + 7},${y + 6} ${x - 7},${y + 6}`}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
      />
    );
  }
}

// タイル番号ラベルの位置（セットアップカード風）
function getTileLabels(config: MapConfig): { x: number; y: number; label: string; position: string }[] {
  const labels: { x: number; y: number; label: string; position: string }[] = [];

  // タイル位置: [上段左, 上段右, 中段左, 中段右, 下段左, 下段右]
  // 左側のタイル（位置0,2,4）のラベルは左に、右側のタイル（位置1,3,5）のラベルは右に
  const positions = [
    { col: -1, row: 1, side: 'left' },   // 位置0: 上段左
    { col: 12, row: 1, side: 'right' },  // 位置1: 上段右
    { col: -1, row: 4, side: 'left' },   // 位置2: 中段左
    { col: 12, row: 4, side: 'right' },  // 位置3: 中段右
    { col: -1, row: 7, side: 'left' },   // 位置4: 下段左
    { col: 12, row: 7, side: 'right' },  // 位置5: 下段右
  ];

  config.tiles.forEach((tile, index) => {
    const pos = positions[index];
    const { x, y } = hexToPixel(pos.col, pos.row);
    const labelText = tile.reversed ? `${tile.tileId}↻` : `${tile.tileId}`;
    labels.push({ x, y, label: labelText, position: pos.side });
  });

  return labels;
}

export function HexMap({ config, highlightedCells, onCellClick, rotation = 0 }: HexMapProps) {
  const cells = useMemo(() => generateMapCells(config), [config]);
  const tileLabels = useMemo(() => getTileLabels(config), [config]);

  // マップサイズ計算（12列×9行 + 余白）flat-top
  const baseWidth = 12 * HEX_SIZE * 1.5 + HEX_SIZE * 0.5 + 60;
  const baseHeight = 9 * HEX_HEIGHT + HEX_HEIGHT / 2 + 20;

  // 90度/270度回転時は幅と高さを入れ替え
  const isRotated90or270 = rotation === 90 || rotation === 270;
  const svgWidth = isRotated90or270 ? baseHeight : baseWidth;
  const svgHeight = isRotated90or270 ? baseWidth : baseHeight;

  // 回転の中心点と変換
  const centerX = baseWidth / 2;
  const centerY = baseHeight / 2;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="max-w-full select-none"
      style={{ background: '#1f2937', userSelect: 'none' }}
    >
      <g transform={`
        translate(${svgWidth / 2}, ${svgHeight / 2})
        rotate(${rotation})
        translate(${-centerX}, ${-centerY})
      `}>
        {/* 背景 */}
        <rect x="25" y="5" width={baseWidth - 50} height={baseHeight - 10} fill="#f5f5dc" rx="8" />

        {/* タイル番号ラベル */}
        {tileLabels.map((label, i) => (
          <text
            key={i}
            x={label.position === 'left' ? 15 : baseWidth - 15}
            y={label.y}
            textAnchor="middle"
            fontSize={14}
            fontWeight="bold"
            fill="#fff"
          >
            {label.label}
          </text>
        ))}

        {/* ヘックスセル */}
        {cells.map((cell) => {
          const { x, y } = hexToPixel(cell.col, cell.row);
          const cellKey = `${cell.col}-${cell.row}`;
          const isHighlighted = highlightedCells?.has(cellKey);

          return (
            <g
              key={cellKey}
              onClick={() => onCellClick?.(cell.col, cell.row)}
              className={onCellClick ? 'cursor-pointer' : ''}
            >
              {/* ヘックス本体 */}
              <polygon
                points={getHexPoints(x, y)}
                fill={TERRAIN_COLORS[cell.terrain]}
                stroke={isHighlighted ? '#fbbf24' : '#fff'}
                strokeWidth={isHighlighted ? 3 : 1}
                opacity={isHighlighted === false && highlightedCells ? 0.4 : 1}
              />

              {/* 座標ラベル（デバッグ用、小さく表示） */}
              <text
                x={x}
                y={y - HEX_SIZE * 0.4}
                textAnchor="middle"
                fontSize={8}
                fill="#fff"
                opacity={0.7}
              >
                {String.fromCharCode(65 + cell.col)}{cell.row + 1}
              </text>

              {/* 動物マーカー */}
              {cell.animal && <AnimalMarker animal={cell.animal} x={x} y={y} />}

              {/* 構造物マーカー */}
              {cell.structure && (
                <StructureMarker
                  type={cell.structure.type}
                  color={cell.structure.color}
                  x={x}
                  y={y}
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// 座標ラベルを取得 (A-L, 1-9)
export function getCellLabel(col: number, row: number): string {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}

// ラベルから座標を取得
export function parseCellLabel(label: string): { col: number; row: number } | null {
  const match = label.match(/^([A-L])([1-9])$/i);
  if (!match) return null;
  const col = match[1].toUpperCase().charCodeAt(0) - 65;
  const row = parseInt(match[2], 10) - 1;
  if (col > 11 || row > 8) return null;
  return { col, row };
}
