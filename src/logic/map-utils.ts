import type { TerrainType, AnimalType, StructureColor, StructureType, CellInfo, TileConfig, StructureCoord } from '../types'
import { MAP_TILES, rotateTile180 } from '../data/map-tiles'

// ========================================
// マップグリッドの型定義
// ========================================

export interface MapCell {
  key: string           // "col-row" 形式のキー
  col: number           // 0-11 (12列)
  row: number           // 0-8 (9行)
  terrain: TerrainType | null
  animal: AnimalType | null
  structure: { type: StructureType; color: StructureColor } | null
}

export interface MapGrid {
  cells: Map<string, MapCell>
  width: number   // 12
  height: number  // 9
}

// ========================================
// ヘックス座標のユーティリティ
// ========================================

/**
 * セルキーを生成
 */
export function cellKey(col: number, row: number): string {
  return `${col}-${row}`
}

/**
 * ヘックスグリッドでの隣接セルを取得
 * オフセット座標系（odd-q: 奇数列がずれる、flat-top hexagon）
 */
export function getNeighbors(col: number, row: number): { col: number; row: number }[] {
  const isOddCol = col % 2 === 1

  // 奇数列と偶数列で上下のオフセットが異なる
  if (isOddCol) {
    // 奇数列（下にずれている）
    return [
      { col: col - 1, row: row     }, // 左上
      { col: col + 1, row: row     }, // 右上
      { col: col - 1, row: row + 1 }, // 左下
      { col: col + 1, row: row + 1 }, // 右下
      { col: col,     row: row - 1 }, // 上
      { col: col,     row: row + 1 }, // 下
    ]
  } else {
    // 偶数列
    return [
      { col: col - 1, row: row - 1 }, // 左上
      { col: col + 1, row: row - 1 }, // 右上
      { col: col - 1, row: row     }, // 左下
      { col: col + 1, row: row     }, // 右下
      { col: col,     row: row - 1 }, // 上
      { col: col,     row: row + 1 }, // 下
    ]
  }
}

/**
 * 2点間のヘックス距離を計算
 * オフセット座標をキューブ座標に変換して計算
 */
export function hexDistance(col1: number, row1: number, col2: number, row2: number): number {
  // オフセット座標からキューブ座標へ変換
  const cube1 = offsetToCube(col1, row1)
  const cube2 = offsetToCube(col2, row2)

  // キューブ座標でのマンハッタン距離 / 2
  return Math.max(
    Math.abs(cube1.x - cube2.x),
    Math.abs(cube1.y - cube2.y),
    Math.abs(cube1.z - cube2.z)
  )
}

/**
 * オフセット座標をキューブ座標に変換
 * 奇数列がずれる（odd-q）オフセット座標系（flat-top hexagon）
 */
function offsetToCube(col: number, row: number): { x: number; y: number; z: number } {
  const x = col
  const z = row - Math.floor((col - (col & 1)) / 2)
  const y = -x - z
  return { x, y, z }
}

// ========================================
// マップグリッドの構築
// ========================================

/**
 * タイル配置と構造物座標からマップグリッドを構築
 */
export function buildMapGrid(
  tiles: TileConfig[],
  structureCoords: Record<string, StructureCoord | null>
): MapGrid {
  const cells = new Map<string, MapCell>()
  const width = 12  // 6列 × 2
  const height = 9  // 3行 × 3

  // 空のグリッドを初期化
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const key = cellKey(col, row)
      cells.set(key, {
        key,
        col,
        row,
        terrain: null,
        animal: null,
        structure: null,
      })
    }
  }

  // タイル配置（6枚）
  // 位置: [0]=左上, [1]=右上, [2]=左中, [3]=右中, [4]=左下, [5]=右下
  const tilePositions = [
    { colOffset: 0, rowOffset: 0 },  // 位置0: 左上
    { colOffset: 6, rowOffset: 0 },  // 位置1: 右上
    { colOffset: 0, rowOffset: 3 },  // 位置2: 左中
    { colOffset: 6, rowOffset: 3 },  // 位置3: 右中
    { colOffset: 0, rowOffset: 6 },  // 位置4: 左下
    { colOffset: 6, rowOffset: 6 },  // 位置5: 右下
  ]

  tiles.forEach((tileConfig, posIndex) => {
    if (tileConfig.tileId === null) return

    const baseTile = MAP_TILES[tileConfig.tileId]
    if (!baseTile) return

    const tile = tileConfig.reversed ? rotateTile180(baseTile) : baseTile
    const { colOffset, rowOffset } = tilePositions[posIndex]

    // タイルの各ヘックスをグリッドに配置
    for (let tileRow = 0; tileRow < 3; tileRow++) {
      for (let tileCol = 0; tileCol < 6; tileCol++) {
        const hex = tile.hexes[tileRow][tileCol]
        const gridCol = colOffset + tileCol
        const gridRow = rowOffset + tileRow
        const key = cellKey(gridCol, gridRow)

        const cell = cells.get(key)
        if (cell) {
          cell.terrain = hex.terrain
          cell.animal = hex.animal || null
        }
      }
    }
  })

  // 構造物を配置
  Object.entries(structureCoords).forEach(([id, coord]) => {
    if (!coord) return

    const key = cellKey(coord.col, coord.row)
    const cell = cells.get(key)
    if (cell) {
      // IDからタイプと色を抽出（例: "stone-green" → type="standing_stone", color="green"）
      const [typeStr, colorStr] = id.split('-')
      const type: StructureType = typeStr === 'stone' ? 'standing_stone' : 'shack'
      const color = colorStr as StructureColor
      cell.structure = { type, color }
    }
  })

  return { cells, width, height }
}

// ========================================
// CellInfo の計算
// ========================================

/**
 * 指定セルのCellInfoを計算
 */
export function getCellInfo(grid: MapGrid, col: number, row: number): CellInfo | null {
  const key = cellKey(col, row)
  const cell = grid.cells.get(key)

  if (!cell || !cell.terrain) {
    return null
  }

  // 周辺の構造物を収集
  const nearStructures: { type: StructureType; color: StructureColor; distance: number }[] = []
  // 周辺の動物を収集
  const nearAnimals: { animal: AnimalType; distance: number }[] = []

  // 全セルをスキャンして距離3以内の構造物・動物を収集
  grid.cells.forEach((otherCell) => {
    if (!otherCell.terrain) return

    const dist = hexDistance(col, row, otherCell.col, otherCell.row)
    if (dist > 3) return  // 距離3より遠いものは無視

    // 構造物
    if (otherCell.structure && dist > 0) {
      nearStructures.push({
        type: otherCell.structure.type,
        color: otherCell.structure.color,
        distance: dist,
      })
    }

    // 動物
    if (otherCell.animal && dist > 0) {
      nearAnimals.push({ animal: otherCell.animal, distance: dist })
    }
  })

  return {
    terrain: cell.terrain,
    structureColor: cell.structure?.color || null,
    structureType: cell.structure?.type || null,
    nearStructures,
    animalTerritory: cell.animal,
    nearAnimals,
  }
}

/**
 * 指定範囲内に特定の地形があるかチェック
 */
export function hasTerrainWithinRange(
  grid: MapGrid,
  col: number,
  row: number,
  terrain: TerrainType,
  range: number
): boolean {
  if (range === 0) {
    const cell = grid.cells.get(cellKey(col, row))
    return cell?.terrain === terrain
  }

  // 範囲内の全セルをチェック
  for (const [, cell] of grid.cells) {
    if (!cell.terrain) continue
    if (cell.terrain !== terrain) continue

    const dist = hexDistance(col, row, cell.col, cell.row)
    if (dist <= range) {
      return true
    }
  }

  return false
}

/**
 * 指定範囲内に特定の構造物があるかチェック
 */
export function hasStructureWithinRange(
  grid: MapGrid,
  col: number,
  row: number,
  colors: StructureColor[],
  range: number
): boolean {
  if (range === 0) {
    const cell = grid.cells.get(cellKey(col, row))
    return cell?.structure !== null && cell?.structure !== undefined && colors.includes(cell.structure.color)
  }

  for (const [, cell] of grid.cells) {
    if (!cell.structure) continue
    if (!colors.includes(cell.structure.color)) continue

    const dist = hexDistance(col, row, cell.col, cell.row)
    if (dist <= range) {
      return true
    }
  }

  return false
}

/**
 * 指定範囲内にいずれかの構造物があるかチェック
 */
export function hasAnyStructureWithinRange(
  grid: MapGrid,
  col: number,
  row: number,
  range: number
): boolean {
  if (range === 0) {
    const cell = grid.cells.get(cellKey(col, row))
    return cell?.structure !== null
  }

  for (const [, cell] of grid.cells) {
    if (!cell.structure) continue

    const dist = hexDistance(col, row, cell.col, cell.row)
    if (dist <= range) {
      return true
    }
  }

  return false
}

/**
 * 指定範囲内に特定タイプの構造物があるかチェック
 */
export function hasStructureTypeWithinRange(
  grid: MapGrid,
  col: number,
  row: number,
  types: StructureType[],
  range: number
): boolean {
  if (range === 0) {
    const cell = grid.cells.get(cellKey(col, row))
    return cell?.structure !== null && cell?.structure !== undefined && types.includes(cell.structure.type)
  }

  for (const [, cell] of grid.cells) {
    if (!cell.structure) continue
    if (!types.includes(cell.structure.type)) continue

    const dist = hexDistance(col, row, cell.col, cell.row)
    if (dist <= range) {
      return true
    }
  }

  return false
}

/**
 * 指定範囲内に特定の動物がいるかチェック
 */
export function hasAnimalWithinRange(
  grid: MapGrid,
  col: number,
  row: number,
  animals: AnimalType[],
  range: number
): boolean {
  if (range === 0) {
    const cell = grid.cells.get(cellKey(col, row))
    return cell?.animal !== null && cell?.animal !== undefined && animals.includes(cell.animal)
  }

  for (const [, cell] of grid.cells) {
    if (!cell.animal) continue
    if (!animals.includes(cell.animal)) continue

    const dist = hexDistance(col, row, cell.col, cell.row)
    if (dist <= range) {
      return true
    }
  }

  return false
}

/**
 * 指定範囲内にいずれかの動物がいるかチェック
 */
export function hasAnyAnimalWithinRange(
  grid: MapGrid,
  col: number,
  row: number,
  range: number
): boolean {
  if (range === 0) {
    const cell = grid.cells.get(cellKey(col, row))
    return cell?.animal !== null
  }

  for (const [, cell] of grid.cells) {
    if (!cell.animal) continue

    const dist = hexDistance(col, row, cell.col, cell.row)
    if (dist <= range) {
      return true
    }
  }

  return false
}
