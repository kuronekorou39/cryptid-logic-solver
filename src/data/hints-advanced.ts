import type { Hint } from '../types';

/**
 * アドバンスト（上級）モードの追加ヒント一覧
 *
 * 上級モードでは、ノーマルモードの23種に加えて:
 * - 黒の建造物（1種）
 * - 全24種の否定形（24種）
 * 合計: 23 + 1 + 24 = 48種
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
  // 否定形: 指定の2つの地域のうちのどちらでもない（10種類）
  // ========================================
  {
    id: 'a-terrain-01-not',
    text: '森林にも砂漠にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'desert'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-02-not',
    text: '森林にも水辺にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'water'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-03-not',
    text: '森林にも沼地にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'swamp'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-04-not',
    text: '森林にも山岳にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest', 'mountain'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-05-not',
    text: '砂漠にも水辺にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['desert', 'water'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-06-not',
    text: '砂漠にも沼地にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['desert', 'swamp'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-07-not',
    text: '砂漠にも山岳にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['desert', 'mountain'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-08-not',
    text: '水辺にも沼地にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['water', 'swamp'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-09-not',
    text: '水辺にも山岳にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['water', 'mountain'], range: 0, negated: true },
  },
  {
    id: 'a-terrain-10-not',
    text: '沼地にも山岳にもいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['swamp', 'mountain'], range: 0, negated: true },
  },

  // ========================================
  // 否定形: 特定の地域から1マス以内にいない（5種類）
  // ========================================
  {
    id: 'a-terrain-forest-1-not',
    text: '森林から1マス以内にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['forest'], range: 1, negated: true },
  },
  {
    id: 'a-terrain-desert-1-not',
    text: '砂漠から1マス以内にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['desert'], range: 1, negated: true },
  },
  {
    id: 'a-terrain-swamp-1-not',
    text: '沼地から1マス以内にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['swamp'], range: 1, negated: true },
  },
  {
    id: 'a-terrain-mountain-1-not',
    text: '山岳から1マス以内にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['mountain'], range: 1, negated: true },
  },
  {
    id: 'a-terrain-water-1-not',
    text: '水辺から1マス以内にいない',
    mode: 'advanced',
    category: 'terrain',
    condition: { terrains: ['water'], range: 1, negated: true },
  },

  // ========================================
  // 否定形: 動物の縄張りから1マス以内にいない（1種類）
  // ========================================
  {
    id: 'a-animal-any-1-not',
    text: '動物の縄張りから1マス以内にいない',
    mode: 'advanced',
    category: 'animal',
    condition: { anyAnimal: true, range: 1, negated: true },
  },

  // ========================================
  // 否定形: 巨石、廃墟から2マス以内にいない（2種類）
  // ========================================
  {
    id: 'a-structure-stone-2-not',
    text: '巨石から2マス以内にいない',
    mode: 'advanced',
    category: 'structure',
    condition: { structureTypes: ['standing_stone'], range: 2, negated: true },
  },
  {
    id: 'a-structure-shack-2-not',
    text: '廃墟から2マス以内にいない',
    mode: 'advanced',
    category: 'structure',
    condition: { structureTypes: ['shack'], range: 2, negated: true },
  },

  // ========================================
  // 否定形: ワシ、クマの縄張りから2マス以内にいない（2種類）
  // ========================================
  {
    id: 'a-animal-cougar-2-not',
    text: 'ワシの縄張りから2マス以内にいない',
    mode: 'advanced',
    category: 'animal',
    condition: { animals: ['cougar'], range: 2, negated: true },
  },
  {
    id: 'a-animal-bear-2-not',
    text: 'クマの縄張りから2マス以内にいない',
    mode: 'advanced',
    category: 'animal',
    condition: { animals: ['bear'], range: 2, negated: true },
  },

  // ========================================
  // 否定形: 指定の色の建造物から3マス以内にいない（4種類）
  // ========================================
  {
    id: 'a-structure-blue-3-not',
    text: '青の建造物から3マス以内にいない',
    mode: 'advanced',
    category: 'structure',
    condition: { structureColors: ['blue'], range: 3, negated: true },
  },
  {
    id: 'a-structure-white-3-not',
    text: '白の建造物から3マス以内にいない',
    mode: 'advanced',
    category: 'structure',
    condition: { structureColors: ['white'], range: 3, negated: true },
  },
  {
    id: 'a-structure-green-3-not',
    text: '緑の建造物から3マス以内にいない',
    mode: 'advanced',
    category: 'structure',
    condition: { structureColors: ['green'], range: 3, negated: true },
  },
  {
    id: 'a-structure-black-3-not',
    text: '黒の建造物から3マス以内にいない',
    mode: 'advanced',
    category: 'structure',
    condition: { structureColors: ['black'], range: 3, negated: true },
  },
];
