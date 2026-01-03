import type { PlayerColor, PlayerSymbol } from '../types';

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
// α:赤, β:緑, γ:水色, δ:黄, ε:紫（地形色と区別しやすいように調整）
export const PLAYER_COLORS: PlayerColorInfo[] = [
  { symbol: 'α', color: 'red', label: '赤', bgClass: 'bg-red-600', textClass: 'text-red-600' },
  { symbol: 'β', color: 'green', label: '緑', bgClass: 'bg-emerald-600', textClass: 'text-emerald-600' },
  { symbol: 'γ', color: 'blue', label: '水色', bgClass: 'bg-cyan-400', textClass: 'text-cyan-500' },
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
