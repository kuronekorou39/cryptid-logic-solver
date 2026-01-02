import type { Hint } from '../types';

/**
 * アドバンスト（上級）モードの追加ヒント一覧
 *
 * 上級モードでは、ノーマルモードのヒントに加えて
 * 以下のヒントが追加されます:
 * - 否定形ヒント（〜にいない）
 * - 黒の建造物
 */
export const hintsAdvanced: Hint[] = [
  // ========================================
  // 黒の建造物（上級で追加）
  // ========================================
  {
    id: 'a-structure-black-3',
    text: '黒の建造物から3マス以内にいる',
    mode: 'advanced',
    category: 'structure',
    condition: { structureColors: ['black'], range: 3 },
  },

  // ========================================
  // 否定形ヒント - 地形系: 5種類
  // ========================================
  {
    id: 'a-terrain-not-forest',
    text: '森林にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-not-desert',
    text: '砂漠にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['desert'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-not-swamp',
    text: '沼地にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['swamp'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-not-mountain',
    text: '山岳にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['mountain'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-not-water',
    text: '水域にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['water'], range: 0, negated: true },
  },

  // ========================================
  // 否定形ヒント - 動物系: 2種類
  // ========================================
  {
    id: 'a-animal-not-bear',
    text: 'クマの縄張り内にいない',
    mode: 'advanced',
    category: 'animal',
    condition: { animals: ['bear'], range: 0, negated: true },
  },
  {
    id: 'a-animal-not-cougar',
    text: 'ワシの縄張り内にいない',
    mode: 'advanced',
    category: 'animal',
    condition: { animals: ['cougar'], range: 0, negated: true },
  },
];

/** アドバンストモード追加ヒント総数 */
export const ADVANCED_HINT_COUNT = hintsAdvanced.length;
