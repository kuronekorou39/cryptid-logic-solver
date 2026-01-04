import type { Hint, TileConfig, StructureCoord, Player } from '../types'
import { getHintById } from '../data'
import { buildMapGrid } from './map-utils'
import { evaluateHintOnMap } from './possible-cells'

/**
 * 単一のヒントが成立するセルを計算
 */
function getCellsForHint(
  grid: ReturnType<typeof buildMapGrid>,
  hint: Hint
): Set<string> {
  const cells = new Set<string>()

  grid.cells.forEach((cell) => {
    if (!cell.terrain) return
    if (evaluateHintOnMap(hint, grid, cell.col, cell.row)) {
      cells.add(cell.key)
    }
  })

  return cells
}

/**
 * ソルバー結果
 */
export interface SolverResult {
  answerCell: string  // 答えのセル（例: "4-2" = E3）
  answerLabel: string // 答えのラベル（例: "E3"）
  hints: { playerId: string; hintId: string; hintText: string }[]
}

/**
 * ヒントの組み合わせを探索して、答えが1マスになるものを見つける
 */
export function findValidCombinations(
  tiles: TileConfig[],
  structureCoords: Record<string, StructureCoord | null>,
  players: Player[]
): SolverResult[] {
  // マップグリッドを構築
  const grid = buildMapGrid(tiles, structureCoords)

  // 有効なプレイヤーのみ対象
  const enabledPlayers = players.filter(p => p.enabled)
  if (enabledPlayers.length < 2) {
    return []
  }

  // 各プレイヤーのヒント候補を取得
  // confirmedHintIdがあればそれだけ、なければpossibleHintIds
  const playerHintOptions: { player: Player; hintIds: string[] }[] = enabledPlayers.map(player => ({
    player,
    hintIds: player.confirmedHintId
      ? [player.confirmedHintId]
      : player.possibleHintIds
  }))

  // 全組み合わせを生成して評価
  const results: SolverResult[] = []

  // 各ヒントの可能セルをキャッシュ
  const hintCellsCache = new Map<string, Set<string>>()
  const getHintCells = (hintId: string): Set<string> => {
    if (!hintCellsCache.has(hintId)) {
      const hint = getHintById(hintId)
      if (hint) {
        hintCellsCache.set(hintId, getCellsForHint(grid, hint))
      } else {
        hintCellsCache.set(hintId, new Set())
      }
    }
    return hintCellsCache.get(hintId)!
  }

  // 再帰的に組み合わせを生成
  function generateCombinations(
    playerIndex: number,
    currentCombination: { playerId: string; hintId: string }[]
  ): void {
    if (playerIndex >= playerHintOptions.length) {
      // 全プレイヤー分のヒントが決まった
      evaluateCombination(currentCombination)
      return
    }

    const { player, hintIds } = playerHintOptions[playerIndex]
    for (const hintId of hintIds) {
      generateCombinations(playerIndex + 1, [
        ...currentCombination,
        { playerId: player.id, hintId }
      ])
    }
  }

  function evaluateCombination(
    combination: { playerId: string; hintId: string }[]
  ): void {
    // 同じヒントが重複していたらスキップ（各プレイヤーは異なるヒントを持つ）
    const hintIds = combination.map(c => c.hintId)
    if (new Set(hintIds).size !== hintIds.length) {
      return
    }

    // 全ヒントの交差を計算
    const allCells = combination.map(c => getHintCells(c.hintId))
    if (allCells.length === 0) return

    let intersection = new Set(allCells[0])
    for (let i = 1; i < allCells.length; i++) {
      const cells = allCells[i]
      intersection = new Set([...intersection].filter(key => cells.has(key)))
      // 早期終了: 交差が空になったら無駄
      if (intersection.size === 0) {
        return
      }
    }

    // 交差がちょうど1マスなら結果に追加
    if (intersection && intersection.size === 1) {
      const answerCell = [...intersection][0]
      const [col, row] = answerCell.split('-').map(Number)
      const answerLabel = `${String.fromCharCode(65 + col)}${row + 1}`

      results.push({
        answerCell,
        answerLabel,
        hints: combination.map(c => {
          const hint = getHintById(c.hintId)
          return {
            playerId: c.playerId,
            hintId: c.hintId,
            hintText: hint?.text || ''
          }
        })
      })
    }
  }

  generateCombinations(0, [])

  // 答えのセルでソート、同じセルなら最初のプレイヤーのヒントでソート
  results.sort((a, b) => {
    if (a.answerLabel !== b.answerLabel) {
      return a.answerLabel.localeCompare(b.answerLabel)
    }
    return a.hints[0].hintText.localeCompare(b.hints[0].hintText)
  })

  return results
}

/**
 * ソルバーが実行可能かチェック
 * - 自分が設定されている
 * - 自分のヒントが確定している
 * - マップが完成している
 */
export function canRunSolver(
  tiles: TileConfig[],
  selfPlayerId: string | null,
  players: Player[]
): { canRun: boolean; reason?: string } {
  // マップが完成しているか
  const allTilesSet = tiles.every(t => t.tileId !== null)
  if (!allTilesSet) {
    return { canRun: false, reason: 'マップが未完成' }
  }

  // 自分が設定されているか
  if (!selfPlayerId) {
    return { canRun: false, reason: '「自分」を設定してください' }
  }

  // 自分のヒントが確定しているか
  const selfPlayer = players.find(p => p.id === selfPlayerId)
  if (!selfPlayer || !selfPlayer.confirmedHintId) {
    return { canRun: false, reason: '自分のヒントを確定してください' }
  }

  // 有効なプレイヤーが2人以上いるか
  const enabledCount = players.filter(p => p.enabled).length
  if (enabledCount < 2) {
    return { canRun: false, reason: '2人以上のプレイヤーが必要' }
  }

  return { canRun: true }
}
