import type { Hint } from '../types';

/**
 * ノーマルモードのヒント一覧
 *
 * カテゴリ:
 * - terrain: 地形系（2種類の地形のいずれか）
 * - structure: 構造物系（特定色または任意の構造物から一定距離以内）
 * - animal: 動物系（特定または任意の動物の縄張りから一定距離以内）
 */
export const hintsNormal: Hint[] = [
  // ========================================
  // 地形系ヒント（2地形の組み合わせ）: 10種類
  // range: 0 = その地形上にいる
  // ========================================
  {
    id: 'n-terrain-01',
    text: '森林か砂漠にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['forest', 'desert'], range: 0 },
  },
  {
    id: 'n-terrain-02',
    text: '森林か沼地にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['forest', 'swamp'], range: 0 },
  },
  {
    id: 'n-terrain-03',
    text: '森林か山岳にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['forest', 'mountain'], range: 0 },
  },
  {
    id: 'n-terrain-04',
    text: '森林か水域にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['forest', 'water'], range: 0 },
  },
  {
    id: 'n-terrain-05',
    text: '砂漠か沼地にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['desert', 'swamp'], range: 0 },
  },
  {
    id: 'n-terrain-06',
    text: '砂漠か山岳にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['desert', 'mountain'], range: 0 },
  },
  {
    id: 'n-terrain-07',
    text: '砂漠か水域にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['desert', 'water'], range: 0 },
  },
  {
    id: 'n-terrain-08',
    text: '沼地か山岳にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['swamp', 'mountain'], range: 0 },
  },
  {
    id: 'n-terrain-09',
    text: '沼地か水域にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['swamp', 'water'], range: 0 },
  },
  {
    id: 'n-terrain-10',
    text: '山岳か水域にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['mountain', 'water'], range: 0 },
  },

  // ========================================
  // 単一地形系ヒント（1マス以内）: 5種類
  // ========================================
  {
    id: 'n-terrain-forest-1',
    text: '森林から1マス以内にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['forest'], range: 1 },
  },
  {
    id: 'n-terrain-desert-1',
    text: '砂漠から1マス以内にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['desert'], range: 1 },
  },
  {
    id: 'n-terrain-swamp-1',
    text: '沼地から1マス以内にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['swamp'], range: 1 },
  },
  {
    id: 'n-terrain-mountain-1',
    text: '山岳から1マス以内にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['mountain'], range: 1 },
  },
  {
    id: 'n-terrain-water-1',
    text: '水域から1マス以内にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['water'], range: 1 },
  },

  // ========================================
  // 構造物系ヒント: 15種類
  // 特定色: 4色 × 3距離(1,2,3) = 12種類
  // いずれかの構造物: 3距離(1,2,3) = 3種類 + 1種類(構造物上)
  // ========================================

  // 白の構造物（廃墟）
  {
    id: 'n-structure-white-1',
    text: '白い構造物から1マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['white'], range: 1 },
  },
  {
    id: 'n-structure-white-2',
    text: '白い構造物から2マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['white'], range: 2 },
  },
  {
    id: 'n-structure-white-3',
    text: '白い構造物から3マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['white'], range: 3 },
  },

  // 黒の構造物（廃墟）
  {
    id: 'n-structure-black-1',
    text: '黒い構造物から1マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['black'], range: 1 },
  },
  {
    id: 'n-structure-black-2',
    text: '黒い構造物から2マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['black'], range: 2 },
  },
  {
    id: 'n-structure-black-3',
    text: '黒い構造物から3マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['black'], range: 3 },
  },

  // 緑の構造物（巨石）
  {
    id: 'n-structure-green-1',
    text: '緑の構造物から1マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['green'], range: 1 },
  },
  {
    id: 'n-structure-green-2',
    text: '緑の構造物から2マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['green'], range: 2 },
  },
  {
    id: 'n-structure-green-3',
    text: '緑の構造物から3マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['green'], range: 3 },
  },

  // 青の構造物（巨石）
  {
    id: 'n-structure-blue-1',
    text: '青い構造物から1マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['blue'], range: 1 },
  },
  {
    id: 'n-structure-blue-2',
    text: '青い構造物から2マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['blue'], range: 2 },
  },
  {
    id: 'n-structure-blue-3',
    text: '青い構造物から3マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['blue'], range: 3 },
  },

  // いずれかの構造物
  {
    id: 'n-structure-any-1',
    text: 'いずれかの構造物から1マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { anyStructure: true, range: 1 },
  },
  {
    id: 'n-structure-any-2',
    text: 'いずれかの構造物から2マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { anyStructure: true, range: 2 },
  },
  {
    id: 'n-structure-any-3',
    text: 'いずれかの構造物から3マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { anyStructure: true, range: 3 },
  },

  // ========================================
  // 動物系ヒント: 12種類
  // 特定動物: 2種 × 3距離(1,2,3) = 6種類
  // いずれかの動物: 3距離(1,2,3) = 3種類
  // 縄張り上: 2種 + 1(いずれか) = 3種類
  // ========================================

  // クマの縄張り
  {
    id: 'n-animal-bear-0',
    text: 'クマの縄張り内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['bear'], range: 0 },
  },
  {
    id: 'n-animal-bear-1',
    text: 'クマの縄張りから1マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['bear'], range: 1 },
  },
  {
    id: 'n-animal-bear-2',
    text: 'クマの縄張りから2マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['bear'], range: 2 },
  },
  {
    id: 'n-animal-bear-3',
    text: 'クマの縄張りから3マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['bear'], range: 3 },
  },

  // クーガーの縄張り
  {
    id: 'n-animal-cougar-0',
    text: 'クーガーの縄張り内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['cougar'], range: 0 },
  },
  {
    id: 'n-animal-cougar-1',
    text: 'クーガーの縄張りから1マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['cougar'], range: 1 },
  },
  {
    id: 'n-animal-cougar-2',
    text: 'クーガーの縄張りから2マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['cougar'], range: 2 },
  },
  {
    id: 'n-animal-cougar-3',
    text: 'クーガーの縄張りから3マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['cougar'], range: 3 },
  },

  // いずれかの動物
  {
    id: 'n-animal-any-0',
    text: 'いずれかの動物の縄張り内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { anyAnimal: true, range: 0 },
  },
  {
    id: 'n-animal-any-1',
    text: 'いずれかの動物の縄張りから1マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { anyAnimal: true, range: 1 },
  },
  {
    id: 'n-animal-any-2',
    text: 'いずれかの動物の縄張りから2マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { anyAnimal: true, range: 2 },
  },
  {
    id: 'n-animal-any-3',
    text: 'いずれかの動物の縄張りから3マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { anyAnimal: true, range: 3 },
  },
];

/** ノーマルモードのヒント総数 */
export const NORMAL_HINT_COUNT = hintsNormal.length;
