import type { Hint } from '../types';

/**
 * ノーマルモードのヒント一覧（24種類）
 */
export const hintsNormal: Hint[] = [
  // ========================================
  // 指定の2つの地域のうちのどちらか（10種類）
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
    text: '森林か水辺にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['forest', 'water'], range: 0 },
  },
  {
    id: 'n-terrain-03',
    text: '森林か沼地にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['forest', 'swamp'], range: 0 },
  },
  {
    id: 'n-terrain-04',
    text: '森林か山岳にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['forest', 'mountain'], range: 0 },
  },
  {
    id: 'n-terrain-05',
    text: '砂漠か水辺にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['desert', 'water'], range: 0 },
  },
  {
    id: 'n-terrain-06',
    text: '砂漠か沼地にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['desert', 'swamp'], range: 0 },
  },
  {
    id: 'n-terrain-07',
    text: '砂漠か山岳にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['desert', 'mountain'], range: 0 },
  },
  {
    id: 'n-terrain-08',
    text: '水辺か沼地にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['water', 'swamp'], range: 0 },
  },
  {
    id: 'n-terrain-09',
    text: '水辺か山岳にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['water', 'mountain'], range: 0 },
  },
  {
    id: 'n-terrain-10',
    text: '沼地か山岳にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['swamp', 'mountain'], range: 0 },
  },

  // ========================================
  // 特定の種類の地域、野生動物の縄張りから1マス以内（6種類）
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
    text: '水辺から1マス以内にいる',
    mode: 'normal',
    category: 'terrain',
    condition: { terrains: ['water'], range: 1 },
  },
  {
    id: 'n-animal-any-1',
    text: '動物の縄張りから1マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { anyAnimal: true, range: 1 },
  },

  // ========================================
  // 巨石、廃墟、ワシの縄張り、クマの縄張りから2マス以内（4種類）
  // ========================================
  {
    id: 'n-structure-stone-2',
    text: '巨石から2マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['green', 'blue'], range: 2 },
  },
  {
    id: 'n-structure-shack-2',
    text: '廃墟から2マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['white', 'black'], range: 2 },
  },
  {
    id: 'n-animal-cougar-2',
    text: 'ワシの縄張りから2マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['cougar'], range: 2 },
  },
  {
    id: 'n-animal-bear-2',
    text: 'クマの縄張りから2マス以内にいる',
    mode: 'normal',
    category: 'animal',
    condition: { animals: ['bear'], range: 2 },
  },

  // ========================================
  // 指定の色の建造物から3マス以内（3種類）※黒は上級のみ
  // ========================================
  {
    id: 'n-structure-blue-3',
    text: '青の建造物から3マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['blue'], range: 3 },
  },
  {
    id: 'n-structure-white-3',
    text: '白の建造物から3マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['white'], range: 3 },
  },
  {
    id: 'n-structure-green-3',
    text: '緑の建造物から3マス以内にいる',
    mode: 'normal',
    category: 'structure',
    condition: { structureColors: ['green'], range: 3 },
  },
];

/** ノーマルモードのヒント総数 */
export const NORMAL_HINT_COUNT = hintsNormal.length;
