import type { Hint, CellInfo, GameMode } from '../types'
import { getHintsByMode, getHintById } from '../data'

/**
 * ヒントがそのマスで成立するかを評価する
 *
 * @param hint - 評価するヒント
 * @param cellInfo - マスの情報
 * @returns true = このマスでヒント成立（UMAがいる可能性あり）
 */
export function evaluateHint(hint: Hint, cellInfo: CellInfo): boolean {
  const { condition } = hint
  let result = false

  // 地形条件の評価
  if (condition.terrains && condition.terrains.length > 0) {
    if (condition.range === 0) {
      // その地形上にいる
      result = condition.terrains.includes(cellInfo.terrain)
    } else {
      // range マス以内にその地形がある（簡易実装：入力で指定された地形と比較）
      // 注意：実際にはマップデータが必要だが、MVPでは入力された地形情報のみで判定
      result = condition.terrains.includes(cellInfo.terrain)
    }
  }

  // 構造物条件の評価（色による条件）
  if (condition.structureColors && condition.structureColors.length > 0) {
    // 特定色の構造物
    if (condition.range === 0) {
      // 構造物の上にいる
      result = cellInfo.structureColor !== null && condition.structureColors.includes(cellInfo.structureColor)
    } else {
      // range マス以内に構造物がある
      const matchingStructure = cellInfo.nearStructures.find(
        (s) => condition.structureColors!.includes(s.color) && s.distance <= condition.range
      )
      result = matchingStructure !== undefined
    }
  }

  // 構造物条件の評価（タイプによる条件：巨石/廃墟）
  if (condition.structureTypes && condition.structureTypes.length > 0) {
    if (condition.range === 0) {
      // 構造物の上にいる
      result = cellInfo.structureType !== null && condition.structureTypes.includes(cellInfo.structureType)
    } else {
      // range マス以内に構造物がある
      const matchingStructure = cellInfo.nearStructures.find(
        (s) => condition.structureTypes!.includes(s.type) && s.distance <= condition.range
      )
      result = matchingStructure !== undefined
    }
  }

  if (condition.anyStructure) {
    // いずれかの構造物
    if (condition.range === 0) {
      result = cellInfo.structureColor !== null
    } else {
      const matchingStructure = cellInfo.nearStructures.find((s) => s.distance <= condition.range)
      result = matchingStructure !== undefined
    }
  }

  // 動物条件の評価
  if (condition.animals && condition.animals.length > 0) {
    if (condition.range === 0) {
      // その動物の縄張り内にいる
      result = cellInfo.animalTerritory !== null && condition.animals.includes(cellInfo.animalTerritory)
    } else {
      // range マス以内に動物の縄張りがある
      const matchingAnimal = cellInfo.nearAnimals.find(
        (a) => condition.animals!.includes(a.animal) && a.distance <= condition.range
      )
      result = matchingAnimal !== undefined
    }
  }

  if (condition.anyAnimal) {
    // いずれかの動物
    if (condition.range === 0) {
      result = cellInfo.animalTerritory !== null
    } else {
      const matchingAnimal = cellInfo.nearAnimals.find((a) => a.distance <= condition.range)
      result = matchingAnimal !== undefined
    }
  }

  // 否定条件の適用
  if (condition.negated) {
    result = !result
  }

  return result
}

/**
 * プレイヤーのアクションに基づいてヒント候補を消去する
 *
 * @param currentHintIds - 現在のヒント候補IDリスト
 * @param actionType - アクションタイプ（cube = NO, disc = YES）
 * @param cellInfo - マスの情報
 * @param mode - ゲームモード
 * @returns 消去後のヒント候補IDリスト
 */
export function eliminateHints(
  currentHintIds: string[],
  actionType: 'cube' | 'disc',
  cellInfo: CellInfo,
  mode: GameMode
): string[] {
  const allHints = getHintsByMode(mode)

  return currentHintIds.filter((hintId) => {
    const hint = allHints.find((h) => h.id === hintId)
    if (!hint) return false

    const isMatch = evaluateHint(hint, cellInfo)

    if (actionType === 'cube') {
      // キューブ（NO）: このマスにUMAはいない
      // → このマスで成立するヒントは除外
      // （そのヒントを持っていたらYESと答えるはず）
      return !isMatch
    } else {
      // ディスク（YES）: このマスにUMAがいる可能性あり
      // → このマスで成立しないヒントは除外
      // （そのヒントを持っていたらNOと答えるはず）
      return isMatch
    }
  })
}

/**
 * 指定したヒントIDからHintオブジェクトを取得
 */
export function getHint(hintId: string): Hint | undefined {
  return getHintById(hintId)
}
