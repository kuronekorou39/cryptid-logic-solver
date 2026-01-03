import type {
  TerrainType,
  StructureColor,
  AnimalType,
  PlayerColor,
  PlayerSymbol,
  TerrainInfo,
  StructureInfo,
  AnimalInfo,
} from '../types';

// ========================================
// 地形データ
// ========================================

export const TERRAINS: TerrainInfo[] = [
  { type: 'forest', label: '森林', color: 'bg-green-600' },
  { type: 'desert', label: '砂漠', color: 'bg-yellow-500' },
  { type: 'swamp', label: '沼地', color: 'bg-purple-600' },
  { type: 'mountain', label: '山岳', color: 'bg-gray-500' },
  { type: 'water', label: '水域', color: 'bg-blue-500' },
];

export const TERRAIN_MAP: Record<TerrainType, TerrainInfo> = {
  forest: TERRAINS[0],
  desert: TERRAINS[1],
  swamp: TERRAINS[2],
  mountain: TERRAINS[3],
  water: TERRAINS[4],
};

// ========================================
// 構造物データ
// ========================================

export const STRUCTURES: StructureInfo[] = [
  { color: 'white', label: '白（廃墟）', cssColor: '#FFFFFF' },
  { color: 'black', label: '黒（廃墟）', cssColor: '#1F2937' },
  { color: 'green', label: '緑（巨石）', cssColor: '#10B981' },
  { color: 'blue', label: '青（巨石）', cssColor: '#3B82F6' },
];

export const STRUCTURE_MAP: Record<StructureColor, StructureInfo> = {
  white: STRUCTURES[0],
  black: STRUCTURES[1],
  green: STRUCTURES[2],
  blue: STRUCTURES[3],
};

// ========================================
// 動物データ
// ========================================

export const ANIMALS: AnimalInfo[] = [
  { type: 'bear', label: 'クマ', emoji: '🐻' },
  { type: 'cougar', label: 'ワシ', emoji: '🦅' },
];

export const ANIMAL_MAP: Record<AnimalType, AnimalInfo> = {
  bear: ANIMALS[0],
  cougar: ANIMALS[1],
};

// ========================================
// プレイヤーカラー
// ========================================

export interface PlayerColorInfo {
  symbol: PlayerSymbol;
  color: PlayerColor;
  label: string;
  bgClass: string;
  textClass: string;
}

// プレイヤー定義（固定の5種類）
// α:赤, β:緑, γ:青, δ:黄, ε:紫（地形色と区別しやすいように調整）
export const PLAYER_COLORS: PlayerColorInfo[] = [
  { symbol: 'α', color: 'red', label: '赤', bgClass: 'bg-red-600', textClass: 'text-red-600' },
  { symbol: 'β', color: 'green', label: '緑', bgClass: 'bg-emerald-600', textClass: 'text-emerald-600' },
  { symbol: 'γ', color: 'blue', label: '青', bgClass: 'bg-indigo-500', textClass: 'text-indigo-500' },
  { symbol: 'δ', color: 'yellow', label: '黄', bgClass: 'bg-amber-500', textClass: 'text-amber-500' },
  { symbol: 'ε', color: 'purple', label: '紫', bgClass: 'bg-fuchsia-500', textClass: 'text-fuchsia-500' },
];

export const PLAYER_COLOR_MAP: Record<PlayerColor, PlayerColorInfo> = {
  red: PLAYER_COLORS[0],
  green: PLAYER_COLORS[1],
  blue: PLAYER_COLORS[2],
  yellow: PLAYER_COLORS[3],
  purple: PLAYER_COLORS[4],
};

// ========================================
// 座標関連
// ========================================

/** 列のラベル（A-I = 9列） */
export const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const;

/** 行のラベル（1-6 = 6行） */
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6'] as const;

/** 列数 */
export const COLUMN_COUNT = COLUMN_LABELS.length;

/** 行数 */
export const ROW_COUNT = ROW_LABELS.length;

/** マス総数 */
export const CELL_COUNT = COLUMN_COUNT * ROW_COUNT;

// ========================================
// ゲーム設定
// ========================================

/** プレイヤー数の範囲 */
export const PLAYER_COUNT = {
  MIN: 3,
  MAX: 5,
} as const;

/** 距離の最大値（ヒントで使用） */
export const MAX_DISTANCE = 3;
