import type { Hint } from '../types';

/**
 * アドバンスト（ハード）モードの追加ヒント一覧
 *
 * アドバンストモードでは、ノーマルモードのヒントに加えて
 * 以下のヒントが追加されます:
 * - 単一地形ヒント（特定の1地形にいる）
 * - 否定形ヒント（〜にいない）
 * - 3地形の組み合わせ
 */
export const hintsAdvanced: Hint[] = [
  // ========================================
  // 単一地形系ヒント（その地形上）: 5種類
  // ========================================
  {
    id: 'a-terrain-forest-0',
    text: '森林にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest'], range: 0 },
  },
  {
    id: 'a-terrain-desert-0',
    text: '砂漠にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['desert'], range: 0 },
  },
  {
    id: 'a-terrain-swamp-0',
    text: '沼地にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['swamp'], range: 0 },
  },
  {
    id: 'a-terrain-mountain-0',
    text: '山岳にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['mountain'], range: 0 },
  },
  {
    id: 'a-terrain-water-0',
    text: '水域にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['water'], range: 0 },
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
    text: 'クーガーの縄張り内にいない',
    mode: 'advanced',
    category: 'animal',
    condition: { animals: ['cougar'], range: 0, negated: true },
  },

  // ========================================
  // 3地形の組み合わせ（いずれかにいる）: 10種類
  // ========================================
  {
    id: 'a-terrain-3-fds',
    text: '森林か砂漠か沼地にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'desert', 'swamp'], range: 0 },
  },
  {
    id: 'a-terrain-3-fdm',
    text: '森林か砂漠か山岳にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'desert', 'mountain'], range: 0 },
  },
  {
    id: 'a-terrain-3-fdw',
    text: '森林か砂漠か水域にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'desert', 'water'], range: 0 },
  },
  {
    id: 'a-terrain-3-fsm',
    text: '森林か沼地か山岳にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'swamp', 'mountain'], range: 0 },
  },
  {
    id: 'a-terrain-3-fsw',
    text: '森林か沼地か水域にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'swamp', 'water'], range: 0 },
  },
  {
    id: 'a-terrain-3-fmw',
    text: '森林か山岳か水域にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'mountain', 'water'], range: 0 },
  },
  {
    id: 'a-terrain-3-dsm',
    text: '砂漠か沼地か山岳にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['desert', 'swamp', 'mountain'], range: 0 },
  },
  {
    id: 'a-terrain-3-dsw',
    text: '砂漠か沼地か水域にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['desert', 'swamp', 'water'], range: 0 },
  },
  {
    id: 'a-terrain-3-dmw',
    text: '砂漠か山岳か水域にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['desert', 'mountain', 'water'], range: 0 },
  },
  {
    id: 'a-terrain-3-smw',
    text: '沼地か山岳か水域にいる',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['swamp', 'mountain', 'water'], range: 0 },
  },
];

/** アドバンストモード追加ヒント総数 */
export const ADVANCED_HINT_COUNT = hintsAdvanced.length;
