/**
 * データモジュール
 *
 * クリプティッドのゲームデータをエクスポート
 */

// ヒントデータ
export { hintsNormal, NORMAL_HINT_COUNT } from './hints-normal';
export { hintsAdvanced, ADVANCED_HINT_COUNT } from './hints-advanced';

// マップデータ
export {
  MAP_TILES,
  rotateTile180,
  DEFAULT_MAP_CONFIG,
  type MapTile,
  type TileHex,
  type MapConfig,
} from './map-tiles';

// 定数データ
export {
  // 地形
  TERRAINS,
  TERRAIN_MAP,
  // 構造物
  STRUCTURES,
  STRUCTURE_MAP,
  // 動物
  ANIMALS,
  ANIMAL_MAP,
  // プレイヤーカラー
  PLAYER_COLORS,
  PLAYER_COLOR_MAP,
  // 座標
  COLUMN_LABELS,
  ROW_LABELS,
  COLUMN_COUNT,
  ROW_COUNT,
  CELL_COUNT,
  // ゲーム設定
  PLAYER_COUNT,
  MAX_DISTANCE,
} from './constants';

export type { PlayerColorInfo } from './constants';

// ========================================
// ユーティリティ関数
// ========================================

import { hintsNormal } from './hints-normal';
import { hintsAdvanced } from './hints-advanced';
import type { Hint, GameMode } from '../types';

/**
 * 指定モードで使用可能なヒントを取得
 */
export function getHintsByMode(mode: GameMode): Hint[] {
  if (mode === 'normal') {
    return hintsNormal;
  }
  // advancedモードはノーマル + アドバンスト
  return [...hintsNormal, ...hintsAdvanced];
}

/**
 * ヒントIDから Hint を取得
 */
export function getHintById(id: string): Hint | undefined {
  return hintsNormal.find((h) => h.id === id) || hintsAdvanced.find((h) => h.id === id);
}

/**
 * 全ヒントのIDリストを取得
 */
export function getAllHintIds(mode: GameMode): string[] {
  return getHintsByMode(mode).map((h) => h.id);
}
