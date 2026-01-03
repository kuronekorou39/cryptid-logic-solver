/**
 * データモジュール
 *
 * クリプティッドのゲームデータをエクスポート
 */

// ヒントデータ
export { hintsNormal } from './hints-normal';
export { hintsAdvanced } from './hints-advanced';

// マップデータ
export { MAP_TILES, rotateTile180, type MapConfig } from './map-tiles';

// プレイヤーカラー
export { PLAYER_COLORS, PLAYER_COLOR_MAP } from './constants';
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
