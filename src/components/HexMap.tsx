import { useMemo } from 'react';
import { MAP_TILES, rotateTile180, type MapConfig } from '../data/map-tiles';
import type { TerrainType, AnimalType, StructureColor, PlayerMarkers, MarkerType, PlayerColor } from '../types';

// 地形の色（実際のボドゲに近づけて調整）
const TERRAIN_COLORS: Record<TerrainType, string> = {
  forest: '#166534',   // green-800（深い緑）
  desert: '#fde047',   // yellow-300（明るい黄）
  swamp: '#7e22ce',    // purple-700（深い紫）
  mountain: '#d1d5db', // gray-300（明るいグレー）
  water: '#7dd3fc',    // sky-300（明るい水色）
};

// 構造物の色（地形と区別しやすいように調整）
const STRUCTURE_COLORS: Record<StructureColor, string> = {
  green: '#0d9488',  // teal-600（森と区別するため青緑系）
  blue: '#4f46e5',   // indigo-600（水辺と区別するため紫寄り）
  white: '#f5f5f5',  // gray-100
  black: '#1f2937',  // gray-800
};

// プレイヤーマーカーの色
const PLAYER_MARKER_COLORS: Record<PlayerColor, string> = {
  red: '#dc2626',      // red-600
  green: '#059669',    // emerald-600
  blue: '#4f46e5',     // indigo-600
  yellow: '#d97706',   // amber-600
  purple: '#c026d3',   // fuchsia-600
};

// プレイヤーIDから色を取得するマッピング
const PLAYER_ID_TO_COLOR: Record<string, PlayerColor> = {
  'α': 'red',
  'β': 'green',
  'γ': 'blue',
  'δ': 'yellow',
  'ε': 'purple',
};

interface HexMapProps {
  config: MapConfig;
  highlightedCells?: Set<string>; // "col-row" 形式のセット
  onCellClick?: (col: number, row: number) => void;
  rotation?: 0 | 90 | 180 | 270;
  playerMarkers?: PlayerMarkers;  // プレイヤーマーカー
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
  terrain: TerrainType | null;  // null = 未設定タイル
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
    const pos = tilePositions[posIndex];

    if (tileConfig.tileId === null) {
      // 未設定タイル: 空のセルを生成
      for (let tileRow = 0; tileRow < 3; tileRow++) {
        for (let tileCol = 0; tileCol < 6; tileCol++) {
          const col = pos.startCol + tileCol;
          const row = pos.startRow + tileRow;
          cells.push({
            col,
            row,
            terrain: null,
          });
        }
      }
      return;
    }

    const baseTile = MAP_TILES[tileConfig.tileId];
    if (!baseTile) return;

    const tile = tileConfig.reversed ? rotateTile180(baseTile) : baseTile;

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

// 内側六角形の頂点を計算（動物縄張り用）
function getInnerHexPoints(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

// 動物縄張りマーカー（内側六角形）
function AnimalMarker({ animal, x, y }: { animal: AnimalType; x: number; y: number }) {
  // クマ: 黒に近いダークグレー、ワシ: 赤（明確に区別）
  const color = animal === 'bear' ? '#292524' : '#dc2626'; // stone-800 / red-600
  const innerSize = HEX_SIZE * 0.6; // 外側の60%サイズ
  return (
    <polygon
      points={getInnerHexPoints(x, y, innerSize)}
      fill={color}
      opacity={0.7}
      stroke={color}
      strokeWidth={2}
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

// マーカー位置の計算（1-5個のマーカーを適切に配置）
function getMarkerPositions(count: number): { dx: number; dy: number }[] {
  const offset = 7; // 中心からのオフセット
  switch (count) {
    case 1:
      return [{ dx: 0, dy: 0 }];
    case 2:
      return [
        { dx: -offset, dy: 0 },
        { dx: offset, dy: 0 },
      ];
    case 3:
      return [
        { dx: 0, dy: -offset },
        { dx: -offset, dy: offset * 0.6 },
        { dx: offset, dy: offset * 0.6 },
      ];
    case 4:
      return [
        { dx: -offset, dy: -offset * 0.6 },
        { dx: offset, dy: -offset * 0.6 },
        { dx: -offset, dy: offset * 0.6 },
        { dx: offset, dy: offset * 0.6 },
      ];
    case 5:
    default:
      return [
        { dx: -offset, dy: -offset * 0.6 },
        { dx: offset, dy: -offset * 0.6 },
        { dx: 0, dy: 0 },
        { dx: -offset, dy: offset * 0.6 },
        { dx: offset, dy: offset * 0.6 },
      ];
  }
}

// プレイヤーマーカーアイコン
function PlayerMarkerIcon({
  markerType,
  color,
  x,
  y,
}: {
  markerType: MarkerType;
  color: string;
  x: number;
  y: number;
}) {
  if (markerType === 'disc') {
    // disc = 〇 (いる可能性あり)
    const radius = 5;
    return (
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        stroke="#fff"
        strokeWidth={1}
      />
    );
  } else {
    // cube = × (いない)
    const size = 3;
    return (
      <g>
        {/* 白い枠線（背景） */}
        <line
          x1={x - size}
          y1={y - size}
          x2={x + size}
          y2={y + size}
          stroke="#fff"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <line
          x1={x + size}
          y1={y - size}
          x2={x - size}
          y2={y + size}
          stroke="#fff"
          strokeWidth={4}
          strokeLinecap="round"
        />
        {/* 色付き線（前面） */}
        <line
          x1={x - size}
          y1={y - size}
          x2={x + size}
          y2={y + size}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <line
          x1={x + size}
          y1={y - size}
          x2={x - size}
          y2={y + size}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    );
  }
}

// セルのマーカーを描画
function CellMarkers({
  cellKey,
  x,
  y,
  playerMarkers,
}: {
  cellKey: string;
  x: number;
  y: number;
  playerMarkers: PlayerMarkers;
}) {
  // このセルにあるマーカーを収集（プレイヤー順に）
  const playerOrder = ['α', 'β', 'γ', 'δ', 'ε'];
  const markers: { playerId: string; markerType: MarkerType }[] = [];

  for (const playerId of playerOrder) {
    const playerData = playerMarkers[playerId];
    if (playerData && playerData[cellKey]) {
      markers.push({ playerId, markerType: playerData[cellKey] });
    }
  }

  if (markers.length === 0) return null;

  const positions = getMarkerPositions(markers.length);

  return (
    <>
      {markers.map((marker, index) => {
        const pos = positions[index];
        const playerColor = PLAYER_ID_TO_COLOR[marker.playerId];
        const color = PLAYER_MARKER_COLORS[playerColor];
        return (
          <PlayerMarkerIcon
            key={marker.playerId}
            markerType={marker.markerType}
            color={color}
            x={x + pos.dx}
            y={y + pos.dy}
          />
        );
      })}
    </>
  );
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
    const labelText = tile.tileId === null ? '-' : (tile.reversed ? `${tile.tileId}↻` : `${tile.tileId}`);
    labels.push({ x, y, label: labelText, position: pos.side });
  });

  return labels;
}

export function HexMap({ config, highlightedCells, onCellClick, rotation = 0, playerMarkers }: HexMapProps) {
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
          const isEmpty = cell.terrain === null;

          return (
            <g
              key={cellKey}
              onClick={() => onCellClick?.(cell.col, cell.row)}
              className={onCellClick ? 'cursor-pointer' : ''}
            >
              {/* ヘックス本体 */}
              <polygon
                points={getHexPoints(x, y)}
                fill={isEmpty ? '#e5e7eb' : TERRAIN_COLORS[cell.terrain!]}
                stroke={isHighlighted ? '#fbbf24' : (isEmpty ? '#d1d5db' : '#fff')}
                strokeWidth={isHighlighted ? 3 : 1}
                opacity={isHighlighted === false && highlightedCells ? 0.4 : 1}
              />

              {/* 座標ラベル（デバッグ用、小さく表示） */}
              <text
                x={x}
                y={y - HEX_SIZE * 0.4}
                textAnchor="middle"
                fontSize={8}
                fill={isEmpty ? '#9ca3af' : '#fff'}
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

              {/* プレイヤーマーカー */}
              {playerMarkers && (
                <CellMarkers
                  cellKey={cellKey}
                  x={x}
                  y={y}
                  playerMarkers={playerMarkers}
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
