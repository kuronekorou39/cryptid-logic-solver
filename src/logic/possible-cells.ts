import type { Hint, TileConfig, StructureCoord } from '../types'
import { getHintById } from '../data'
import {
  buildMapGrid,
  cellKey,
  hasTerrainWithinRange,
  hasStructureWithinRange,
  hasAnyStructureWithinRange,
  hasAnimalWithinRange,
  hasAnyAnimalWithinRange,
  type MapGrid,
} from './map-utils'

/**
 * ヒントがマップ上のセルで成立するかを評価
 */
export function evaluateHintOnMap(
  hint: Hint,
  grid: MapGrid,
  col: number,
  row: number
): boolean {
  const { condition } = hint
  const cell = grid.cells.get(cellKey(col, row))

  if (!cell || !cell.terrain) {
    return false
  }

  let result = false

  // 地形条件の評価
  if (condition.terrains && condition.terrains.length > 0) {
    result = condition.terrains.some((terrain) =>
      hasTerrainWithinRange(grid, col, row, terrain, condition.range)
    )
  }

  // 構造物条件の評価
  if (condition.structureColors && condition.structureColors.length > 0) {
    result = hasStructureWithinRange(grid, col, row, condition.structureColors, condition.range)
  }

  if (condition.anyStructure) {
    result = hasAnyStructureWithinRange(grid, col, row, condition.range)
  }

  // 動物条件の評価
  if (condition.animals && condition.animals.length > 0) {
    result = hasAnimalWithinRange(grid, col, row, condition.animals, condition.range)
  }

  if (condition.anyAnimal) {
    result = hasAnyAnimalWithinRange(grid, col, row, condition.range)
  }

  // 否定条件の適用
  if (condition.negated) {
    result = !result
  }

  return result
}

/**
 * プレイヤーのONヒントに基づいて可能セルを計算
 * ONヒント = まだ可能性が残っているヒント
 * いずれかのONヒントを満たすセルが可能（OR条件）
 * ヒントをOFFにするほど、可能セルが絞られていく
 */
export function calculatePossibleCells(
  tiles: TileConfig[],
  structureCoords: Record<string, StructureCoord | null>,
  onHintIds: string[]
): Set<string> {
  const grid = buildMapGrid(tiles, structureCoords)
  const possibleCells = new Set<string>()

  // ヒントを取得
  const hints = onHintIds
    .map((id) => getHintById(id))
    .filter((h): h is Hint => h !== undefined)

  // ヒントがない場合は可能セルなし
  if (hints.length === 0) {
    return possibleCells
  }

  // 各セルをチェック
  grid.cells.forEach((cell) => {
    if (!cell.terrain) return // 未設定のセルはスキップ

    // いずれかのヒントを満たすかチェック（OR条件）
    const anyMatch = hints.some((hint) =>
      evaluateHintOnMap(hint, grid, cell.col, cell.row)
    )

    if (anyMatch) {
      possibleCells.add(cell.key)
    }
  })

  return possibleCells
}

/**
 * 複数プレイヤーの可能セルを合算（交差）
 * 全プレイヤーの条件を満たすセルのみが最終候補
 */
export function calculateIntersectedPossibleCells(
  tiles: TileConfig[],
  structureCoords: Record<string, StructureCoord | null>,
  playerHintIds: { playerId: string; hintIds: string[] }[]
): Set<string> {
  if (playerHintIds.length === 0) {
    return new Set()
  }

  // 最初のプレイヤーの可能セルを取得
  let result = calculatePossibleCells(
    tiles,
    structureCoords,
    playerHintIds[0].hintIds
  )

  // 残りのプレイヤーと交差を取る
  for (let i = 1; i < playerHintIds.length; i++) {
    const playerPossible = calculatePossibleCells(
      tiles,
      structureCoords,
      playerHintIds[i].hintIds
    )

    // 交差（両方に含まれるセルのみ残す）
    result = new Set([...result].filter((key) => playerPossible.has(key)))
  }

  return result
}

/**
 * マップグリッドを構築するラッパー（外部から使用）
 */
export function getMapGrid(
  tiles: TileConfig[],
  structureCoords: Record<string, StructureCoord | null>
): MapGrid {
  return buildMapGrid(tiles, structureCoords)
}
