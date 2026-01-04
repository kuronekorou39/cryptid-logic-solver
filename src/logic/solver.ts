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

/** 同じマスの最大パターン数 */
const MAX_PATTERNS_PER_CELL = 3
/** 最大マス数（これ以上のマスが見つかったら終了） */
const MAX_UNIQUE_CELLS = 50

/**
 * ソルバー結果の1件
 */
export interface SolverResultItem {
  answerCell: string  // 答えのセル（例: "4-2" = E3）
  answerLabel: string // 答えのラベル（例: "E3"）
  hintIds: string[]   // ヒントIDのリスト（自分のヒントを除く、ソート済み）
  hintTexts: string[] // ヒントテキストのリスト（自分のヒントを除く）
}

/**
 * 確定ヒント情報
 */
export interface ConfirmedHintInfo {
  playerId: string
  playerSymbol: string
  playerColor: string
  hintText: string
  isSelf: boolean
}

/**
 * ソルバー結果
 */
export interface SolverResult {
  items: SolverResultItem[]
  confirmedHints: ConfirmedHintInfo[]  // 確定済みヒント一覧
  hasMore: boolean
}

/**
 * ヒントの組み合わせを探索して、答えが1マスになるものを見つける
 */
export function findValidCombinations(
  tiles: TileConfig[],
  structureCoords: Record<string, StructureCoord | null>,
  players: Player[],
  selfPlayerId: string | null
): SolverResult {
  // マップグリッドを構築
  const grid = buildMapGrid(tiles, structureCoords)

  // 有効なプレイヤーのみ対象
  const enabledPlayers = players.filter(p => p.enabled)
  if (enabledPlayers.length < 2) {
    return { items: [], confirmedHints: [], hasMore: false }
  }

  // 確定ヒント一覧を収集
  const confirmedHints: ConfirmedHintInfo[] = enabledPlayers
    .filter(p => p.confirmedHintId)
    .map(p => {
      const hint = getHintById(p.confirmedHintId!)
      return {
        playerId: p.id,
        playerSymbol: p.symbol,
        playerColor: p.color,
        hintText: hint?.text || '',
        isSelf: p.id === selfPlayerId
      }
    })
    .sort((a, b) => {
      // 自分を最初に、それ以外はシンボル順
      if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1
      return a.playerSymbol.localeCompare(b.playerSymbol)
    })

  // 各プレイヤーのヒント候補を取得
  // confirmedHintIdがあればそれだけ、なければpossibleHintIds
  const playerHintOptions: { player: Player; hintIds: string[] }[] = enabledPlayers.map(player => ({
    player,
    hintIds: player.confirmedHintId
      ? [player.confirmedHintId]
      : player.possibleHintIds
  }))

  // 確定済みヒントIDの集合（結果から除外用）
  const confirmedHintIds = new Set(confirmedHints.map(h => {
    const player = enabledPlayers.find(p => p.id === h.playerId)
    return player?.confirmedHintId
  }).filter((id): id is string => !!id))

  // 全組み合わせを生成して評価
  const results: SolverResultItem[] = []
  let hasMore = false

  // 各セルごとの結果数をトラック
  const cellPatternCount = new Map<string, number>()
  // 各セルごとに見たヒント組み合わせを記録（重複排除用）
  const seenCombinations = new Map<string, Set<string>>()

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
  ): boolean {
    // 上限に達したら終了（ユニークセル数が上限を超えた）
    if (cellPatternCount.size >= MAX_UNIQUE_CELLS) {
      hasMore = true
      return false
    }

    if (playerIndex >= playerHintOptions.length) {
      // 全プレイヤー分のヒントが決まった
      evaluateCombination(currentCombination)
      return true
    }

    const { player, hintIds } = playerHintOptions[playerIndex]
    for (const hintId of hintIds) {
      const shouldContinue = generateCombinations(playerIndex + 1, [
        ...currentCombination,
        { playerId: player.id, hintId }
      ])
      if (!shouldContinue) return false
    }
    return true
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

      // 確定済みヒントを除いたヒントIDリスト（ソート済み）
      const otherHintIds = combination
        .map(c => c.hintId)
        .filter(id => !confirmedHintIds.has(id))
        .sort()

      // この組み合わせがすでに見られたかチェック
      const fingerprint = otherHintIds.join(',')
      if (!seenCombinations.has(answerCell)) {
        seenCombinations.set(answerCell, new Set())
      }
      const seenForCell = seenCombinations.get(answerCell)!
      if (seenForCell.has(fingerprint)) {
        return // すでに同じヒント組み合わせがある
      }

      // このセルのパターン数をチェック
      const currentCount = cellPatternCount.get(answerCell) || 0
      if (currentCount >= MAX_PATTERNS_PER_CELL) {
        return // このセルはすでに上限に達している
      }

      const [col, row] = answerCell.split('-').map(Number)
      const answerLabel = `${String.fromCharCode(65 + col)}${row + 1}`

      // ヒントテキストを取得
      const hintTexts = otherHintIds.map(id => {
        const hint = getHintById(id)
        return hint?.text || ''
      })

      results.push({
        answerCell,
        answerLabel,
        hintIds: otherHintIds,
        hintTexts
      })

      // 記録を更新
      seenForCell.add(fingerprint)
      cellPatternCount.set(answerCell, currentCount + 1)
    }
  }

  generateCombinations(0, [])

  // 答えのセルでソート、同じセルなら最初のヒントでソート
  results.sort((a, b) => {
    if (a.answerLabel !== b.answerLabel) {
      return a.answerLabel.localeCompare(b.answerLabel)
    }
    return (a.hintTexts[0] || '').localeCompare(b.hintTexts[0] || '')
  })

  return { items: results, confirmedHints, hasMore }
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
