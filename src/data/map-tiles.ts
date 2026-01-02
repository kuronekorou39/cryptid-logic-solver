import type { TerrainType, AnimalType } from '../types';

/**
 * マップタイルのヘックスデータ
 * 各タイルは 幅6マス × 高さ3マス = 18ヘックス
 */
export interface TileHex {
  terrain: TerrainType;
  animal?: AnimalType; // クマまたはワシの縄張り
}

/**
 * マップタイル定義
 * 6枚のタイル（1〜6）、それぞれ正位置と180°回転で使用可能
 */
export interface MapTile {
  id: number; // 1-6
  // 3行 × 6列 のデータ（row, col）
  // row 0 = 上段, row 2 = 下段
  // col 0 = 左端, col 5 = 右端
  hexes: TileHex[][];
}

/**
 * 地形の略称
 * F = Forest (森林)
 * D = Desert (砂漠)
 * S = Swamp (沼地)
 * M = Mountain (山岳)
 * W = Water (水辺)
 */
type TerrainCode = 'F' | 'D' | 'S' | 'M' | 'W';

const terrainMap: Record<TerrainCode, TerrainType> = {
  F: 'forest',
  D: 'desert',
  S: 'swamp',
  M: 'mountain',
  W: 'water',
};

/**
 * 動物の略称
 * B = Bear (クマ)
 * C = Cougar/Eagle (ワシ)
 * - = なし
 */
type AnimalCode = 'B' | 'C' | '-';

const animalMap: Record<AnimalCode, AnimalType | undefined> = {
  B: 'bear',
  C: 'cougar',
  '-': undefined,
};

/**
 * タイルデータをパースする
 * 入力形式:
 * terrain: "FDMSWD/WSFFDM/DMWSFD" (3行を/で区切り)
 * animals: "B-----/---C--/------" (3行を/で区切り、動物がいる位置のみB/C)
 */
function parseTileData(
  id: number,
  terrainStr: string,
  animalStr: string
): MapTile {
  const terrainRows = terrainStr.split('/');
  const animalRows = animalStr.split('/');

  const hexes: TileHex[][] = [];

  for (let row = 0; row < 3; row++) {
    const hexRow: TileHex[] = [];
    for (let col = 0; col < 6; col++) {
      const t = terrainRows[row][col] as TerrainCode;
      const a = animalRows[row][col] as AnimalCode;
      hexRow.push({
        terrain: terrainMap[t],
        animal: animalMap[a],
      });
    }
    hexes.push(hexRow);
  }

  return { id, hexes };
}

/**
 * タイル1〜6のデータ
 * TODO: 実際のゲームボードに合わせて入力が必要
 *
 * 入力形式の例:
 * - terrain: 各行6文字、3行を/で区切り (F=森林, D=砂漠, S=沼地, M=山岳, W=水辺)
 * - animals: 各行6文字、3行を/で区切り (B=クマ, C=ワシ, -=なし)
 */

// タイル1
const TILE_1 = parseTileData(
  1,
  'WWWWFF/SSWDFF/SSDDDF',
  '------/------/---BBB'
);

// タイル2
// SC FC FC F F F
// S S F D D D
// S M M M M D
const TILE_2 = parseTileData(
  2,
  'SFFFFF/SSFDDD/SMMMMD',
  'CCC---/------/------'
);

// タイル3
// S S F F F W
// SC SC F M W W
// MC M M M W W
const TILE_3 = parseTileData(
  3,
  'SSFFFW/SSFMWW/MMMMWW',
  '------/CC----/C-----'
);

// タイル4
// D D M M M M
// D D M W W WC
// D D D F F FC
const TILE_4 = parseTileData(
  4,
  'DDMMMM/DDMWWW/DDDFFF',
  '------/-----C/-----C'
);

// タイル5
// S S S M M M
// S D D W M MB
// D D W W WB WB
const TILE_5 = parseTileData(
  5,
  'SSSMMM/SDDWMM/DDWWWW',
  '------/-----B/----BB'
);

// タイル6
// DB D S S S F
// MB M S S F F
// M W W W W F
const TILE_6 = parseTileData(
  6,
  'DDSSSF/MMSSFF/MWWWWF',
  'B-----/B-----/------'
);

export const MAP_TILES: Record<number, MapTile> = {
  1: TILE_1,
  2: TILE_2,
  3: TILE_3,
  4: TILE_4,
  5: TILE_5,
  6: TILE_6,
};

/**
 * タイルを180度回転させる
 */
export function rotateTile180(tile: MapTile): MapTile {
  const rotatedHexes: TileHex[][] = [];

  // 180度回転: 行も列も逆順
  for (let row = 2; row >= 0; row--) {
    const newRow: TileHex[] = [];
    for (let col = 5; col >= 0; col--) {
      newRow.push({ ...tile.hexes[row][col] });
    }
    rotatedHexes.push(newRow);
  }

  return {
    id: tile.id,
    hexes: rotatedHexes,
  };
}

/**
 * マップ配置設定
 */
export interface MapConfig {
  // 6つのタイル配置 [上段左, 上段中, 上段右, 下段左, 下段中, 下段右]
  tiles: {
    tileId: number;    // 1-6
    reversed: boolean; // true = 180度回転
  }[];
  // 構造物配置
  structures: {
    type: 'stone' | 'shack';
    color: 'green' | 'blue' | 'white' | 'black';
    col: number; // 0-17 (全体座標)
    row: number; // 0-5 (全体座標)
  }[];
}

/**
 * デフォルトのマップ設定（画像の配置）
 */
export const DEFAULT_MAP_CONFIG: MapConfig = {
  tiles: [
    { tileId: 5, reversed: true },  // 上段左
    { tileId: 3, reversed: true },  // 上段中
    { tileId: 6, reversed: true },  // 上段右
    { tileId: 4, reversed: true },  // 下段左
    { tileId: 2, reversed: false }, // 下段中
    { tileId: 1, reversed: false }, // 下段右
  ],
  structures: [], // TODO: 構造物配置を追加
};
