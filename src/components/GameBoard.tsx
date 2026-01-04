import { useState, useMemo } from 'react'
import { useGame } from '../hooks/useGame'
import { getHintsByMode, PLAYER_COLOR_MAP } from '../data'
import { findValidCombinations, canRunSolver, type SolverResult } from '../logic/solver'
import {
  ForestIcon, DesertIcon, SwampIcon, MountainIcon, WaterIcon,
  BearIcon, EagleIcon, AnimalIcon,
  GreenStoneIcon, BlueStoneIcon, WhiteShackIcon, BlackShackIcon, StructureIcon
} from './Icons'
import type { Hint, TerrainType, StructureColor, AnimalType } from '../types'

// 地形アイコンマップ
const terrainIcons: Record<TerrainType, { icon: React.ReactNode; color: string }> = {
  forest: { icon: <ForestIcon />, color: 'text-green-600' },
  desert: { icon: <DesertIcon />, color: 'text-yellow-600' },
  swamp: { icon: <SwampIcon />, color: 'text-purple-600' },
  mountain: { icon: <MountainIcon />, color: 'text-gray-600' },
  water: { icon: <WaterIcon />, color: 'text-blue-600' },
}

// 動物アイコンマップ
const animalIcons: Record<AnimalType, { icon: React.ReactNode; color: string }> = {
  bear: { icon: <BearIcon />, color: 'text-amber-700' },
  cougar: { icon: <EagleIcon />, color: 'text-orange-600' },
}

// 構造物アイコンマップ
const structureIcons: Record<StructureColor, { icon: React.ReactNode; color: string }> = {
  white: { icon: <WhiteShackIcon />, color: 'text-gray-500' },
  black: { icon: <BlackShackIcon />, color: 'text-gray-800' },
  green: { icon: <GreenStoneIcon />, color: 'text-green-700' },
  blue: { icon: <BlueStoneIcon />, color: 'text-blue-700' },
}

// ヒントからアイコン群を取得
function getHintIcons(hint: Hint): React.ReactNode[] {
  const { condition } = hint
  const icons: React.ReactNode[] = []

  if (condition.terrains) {
    condition.terrains.forEach((t, i) => {
      const info = terrainIcons[t]
      icons.push(
        <span key={`terrain-${i}`} className={info.color}>
          {info.icon}
        </span>
      )
    })
  }

  if (condition.animals) {
    condition.animals.forEach((a, i) => {
      const info = animalIcons[a]
      icons.push(
        <span key={`animal-${i}`} className={info.color}>
          {info.icon}
        </span>
      )
    })
  }
  if (condition.anyAnimal) {
    icons.push(
      <span key="any-animal" className="text-amber-600">
        <AnimalIcon />
      </span>
    )
  }

  if (condition.structureTypes) {
    const types = condition.structureTypes
    if (types.includes('standing_stone')) {
      icons.push(
        <span key="stone" className="text-teal-600">
          <GreenStoneIcon />
        </span>
      )
    }
    if (types.includes('shack')) {
      icons.push(
        <span key="shack" className="text-gray-600">
          <WhiteShackIcon />
        </span>
      )
    }
  }

  if (condition.structureColors) {
    const colors = condition.structureColors
    colors.forEach((c, i) => {
      const info = structureIcons[c]
      icons.push(
        <span key={`structure-${i}`} className={info.color}>
          {info.icon}
        </span>
      )
    })
  }
  if (condition.anyStructure) {
    icons.push(
      <span key="any-structure" className="text-gray-600">
        <StructureIcon />
      </span>
    )
  }

  return icons
}

// ヒントが地形フィルターにマッチするか判定
function hintMatchesTerrain(hint: Hint, terrain: TerrainType): boolean {
  return hint.condition.terrains?.includes(terrain) ?? false
}

// ヒントテキストをスタイル付きで表示
function StyledHintText({ text, isOn }: { text: string; isOn: boolean }) {
  // パターンと対応するスタイル
  const patterns: { pattern: RegExp; className: string }[] = [
    // 「いない」を赤に
    { pattern: /いない/g, className: 'text-red-500 font-medium' },
    // 数字を太字に
    { pattern: /[0-9]+/g, className: 'font-bold' },
    // 地形名を各色に
    { pattern: /森林/g, className: 'text-green-700 font-medium' },
    { pattern: /砂漠/g, className: 'text-yellow-600 font-medium' },
    { pattern: /沼地/g, className: 'text-purple-600 font-medium' },
    { pattern: /山岳/g, className: 'text-gray-600 font-medium' },
    { pattern: /水辺/g, className: 'text-cyan-600 font-medium' },
    // 構造物
    { pattern: /巨石/g, className: 'text-teal-600 font-medium' },
    { pattern: /廃墟/g, className: 'text-orange-700 font-medium' },
    // 構造物の色
    { pattern: /青の/g, className: 'text-indigo-600 font-medium' },
    { pattern: /緑の/g, className: 'text-teal-600 font-medium' },
    { pattern: /白の/g, className: 'text-gray-500 font-medium' },
    { pattern: /黒の/g, className: 'text-gray-800 font-medium' },
    // 動物
    { pattern: /クマ/g, className: 'text-stone-700 font-medium' },
    { pattern: /ワシ/g, className: 'text-red-600 font-medium' },
    { pattern: /動物/g, className: 'text-amber-600 font-medium' },
  ]

  // テキストを分割してスタイル適用
  type Part = { text: string; className?: string }
  let parts: Part[] = [{ text }]

  for (const { pattern, className } of patterns) {
    const newParts: Part[] = []
    for (const part of parts) {
      if (part.className) {
        // 既にスタイル適用済みならそのまま
        newParts.push(part)
      } else {
        // パターンで分割
        const matches = part.text.matchAll(pattern)
        let lastIndex = 0
        for (const match of matches) {
          if (match.index! > lastIndex) {
            newParts.push({ text: part.text.slice(lastIndex, match.index) })
          }
          newParts.push({ text: match[0], className })
          lastIndex = match.index! + match[0].length
        }
        if (lastIndex < part.text.length) {
          newParts.push({ text: part.text.slice(lastIndex) })
        }
      }
    }
    parts = newParts.length > 0 ? newParts : parts
  }

  return (
    <span className={!isOn ? 'line-through opacity-60' : ''}>
      {parts.map((part, i) => (
        <span key={i} className={isOn ? part.className : ''}>
          {part.text}
        </span>
      ))}
    </span>
  )
}

// ヒントのソートキーを取得（肯定形と否定形をペアにする）
function getHintSortKey(hint: Hint): string {
  // IDから n- または a- プレフィックスと -not サフィックスを除去してベースIDを取得
  let baseId = hint.id.replace(/^[na]-/, '').replace(/-not$/, '')
  // 否定形は後に来るように z を付加
  const negatedSuffix = hint.condition.negated ? 'z' : 'a'
  return `${baseId}-${negatedSuffix}`
}

interface GameBoardProps {
  selectedPlayerId: string
  onSelectPlayer: (playerId: string) => void
  showPossibleCells: boolean
  onToggleShowPossibleCells: () => void
}

export function GameBoard({ selectedPlayerId, onSelectPlayer, showPossibleCells, onToggleShowPossibleCells }: GameBoardProps) {
  const { state, toggleHint, togglePlayer, toggleAutoMode, setSelfPlayer, confirmHint, unconfirmHint, getConfirmedHintOwner } = useGame()
  const [terrainFilters, setTerrainFilters] = useState<TerrainType[]>([])
  const [hideOffItems, setHideOffItems] = useState(false)
  const [solverResults, setSolverResults] = useState<SolverResult | null>(null)
  const [showSolver, setShowSolver] = useState(false)
  const [solverViewMode, setSolverViewMode] = useState<'summary' | 'detail'>('summary')

  const allHints = getHintsByMode(state.mode)
  const selectedPlayer = state.players.find((p) => p.id === selectedPlayerId)

  // フィルター適用（地形カテゴリのみ、OR条件）
  let filteredHints = allHints.filter((hint) => {
    // 地形カテゴリ以外は常に表示
    if (hint.category !== 'terrain') return true
    // 地形フィルターが未選択なら全て表示
    if (terrainFilters.length === 0) return true
    // 選択した地形のいずれかを含む
    return terrainFilters.some((t) => hintMatchesTerrain(hint, t))
  })

  // OFFの項目を非表示
  if (hideOffItems && selectedPlayer) {
    filteredHints = filteredHints.filter((hint) =>
      selectedPlayer.possibleHintIds.includes(hint.id)
    )
  }

  const toggleTerrainFilter = (terrain: TerrainType) => {
    setTerrainFilters((prev) =>
      prev.includes(terrain)
        ? prev.filter((t) => t !== terrain)
        : [...prev, terrain]
    )
  }

  // タブクリック時: 無効なプレイヤーなら有効化してから選択
  const handleTabClick = (playerId: string) => {
    const player = state.players.find(p => p.id === playerId)
    if (player && !player.enabled) {
      togglePlayer(playerId)
    }
    onSelectPlayer(playerId)
  }

  // ソルバーが実行可能かチェック
  const solverStatus = useMemo(() => {
    return canRunSolver(state.mapSettings.tiles, state.selfPlayerId, state.players)
  }, [state.mapSettings.tiles, state.selfPlayerId, state.players])

  // ソルバー実行
  const runSolver = () => {
    const results = findValidCombinations(
      state.mapSettings.tiles,
      state.mapSettings.structureCoords,
      state.players,
      state.selfPlayerId
    )
    setSolverResults(results)
    setShowSolver(true)
  }

  // カテゴリ別にヒントを分類し、肯定形と否定形をペアでソート
  const sortHints = (hints: Hint[]) =>
    [...hints].sort((a, b) => getHintSortKey(a).localeCompare(getHintSortKey(b)))

  const hintsByCategory = {
    terrain: sortHints(filteredHints.filter((h) => h.category === 'terrain')),
    structure: sortHints(filteredHints.filter((h) => h.category === 'structure')),
    animal: sortHints(filteredHints.filter((h) => h.category === 'animal')),
  }

  const categoryLabels = {
    terrain: '地形',
    structure: '構造物',
    animal: '動物',
  }

  return (
    <div>
      {/* 固定5タブ */}
      <div className="sticky top-0 z-10 bg-gray-100 pb-2">
        <div className="flex border-b border-gray-300 bg-white rounded-t-lg overflow-hidden">
          {state.players.map((player) => {
            const colorInfo = PLAYER_COLOR_MAP[player.color]
            const isSelected = selectedPlayerId === player.id
            const remainingCount = player.possibleHintIds.length
            const isSelf = state.selfPlayerId === player.id
            const hasConfirmedHint = player.confirmedHintId !== null

            return (
              <button
                key={player.id}
                onClick={() => handleTabClick(player.id)}
                className={`relative flex-1 min-w-0 py-2 px-1 text-center transition-all border-b-2 ${
                  isSelected
                    ? `${colorInfo.bgClass} text-white border-transparent`
                    : player.enabled
                      ? `bg-white ${colorInfo.textClass} border-transparent hover:opacity-80`
                      : 'bg-gray-100 text-gray-400 border-transparent hover:bg-gray-200'
                }`}
              >
                <div className="truncate text-sm font-medium flex items-center justify-center gap-0.5">
                  {isSelf && player.enabled && <span title="自分">👤</span>}
                  {player.symbol}
                  {hasConfirmedHint && <span title="ヒント確定済み">✓</span>}
                </div>
                {player.enabled ? (
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'opacity-60'}`}>
                    {remainingCount}/{allHints.length}
                  </div>
                ) : (
                  <div className="text-xs opacity-50">+参加</div>
                )}
              </button>
            )
          })}
        </div>
      </div>


      {/* オプションバー（有効なプレイヤーのみ表示） */}
      {selectedPlayer?.enabled && (
        <div className="bg-white rounded-xl shadow px-3 py-2 mb-3">
          <div className="flex items-center gap-1.5">
            {/* 参加解除ボタン */}
            <button
              onClick={() => togglePlayer(selectedPlayer.id)}
              className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 text-lg font-bold rounded transition-colors"
              title="参加解除"
            >
              ×
            </button>

            {/* 自分設定ボタン */}
            <button
              onClick={() => setSelfPlayer(state.selfPlayerId === selectedPlayer.id ? null : selectedPlayer.id)}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                state.selfPlayerId === selectedPlayer.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={state.selfPlayerId === selectedPlayer.id ? '自分設定を解除' : 'このプレイヤーを自分として設定'}
            >
              {state.selfPlayerId === selectedPlayer.id ? '👤自分' : '自分'}
            </button>

            {/* 確定ボタン（残り1つで未確定の場合のみ表示） */}
            {selectedPlayer.possibleHintIds.length === 1 && !selectedPlayer.confirmedHintId && (
              <button
                onClick={() => confirmHint(selectedPlayer.id, selectedPlayer.possibleHintIds[0])}
                className="text-xs px-1.5 py-0.5 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                title="残り1つのヒントを確定する"
              >
                ✓確定
              </button>
            )}

            {/* 確定解除ボタン（確定済みの場合のみ表示） */}
            {selectedPlayer.confirmedHintId && (
              <button
                onClick={() => unconfirmHint(selectedPlayer.id)}
                className="text-xs px-1.5 py-0.5 rounded bg-gray-400 text-white hover:bg-gray-500 transition-colors"
                title="確定を解除する"
              >
                ✓解除
              </button>
            )}

            <div className="flex-1" />

            {/* アイコンボタン群（トグル） */}
            <div className="flex items-center gap-1">
              {/* 自動モード */}
              <button
                onClick={toggleAutoMode}
                className={`relative w-7 h-7 rounded-lg text-sm transition-colors flex items-center justify-center ${
                  state.autoMode
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={state.autoMode ? '自動モード ON: マーカーに基づいてヒントを自動計算' : '自動モード OFF: ヒントを手動で切り替え'}
              >
                ⚡
                {!state.autoMode && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-6 h-0.5 bg-red-500 rotate-45 rounded" />
                  </span>
                )}
              </button>

              {/* OFFを非表示 */}
              <button
                onClick={() => setHideOffItems(!hideOffItems)}
                className={`relative w-7 h-7 rounded-lg text-sm transition-colors flex items-center justify-center ${
                  !hideOffItems
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={hideOffItems ? 'OFFのヒントを非表示中（クリックで全表示）' : '全ヒント表示中（クリックでOFFを非表示）'}
              >
                👁
                {hideOffItems && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-6 h-0.5 bg-red-500 rotate-45 rounded" />
                  </span>
                )}
              </button>

              {/* 可能セル色付け */}
              <button
                onClick={onToggleShowPossibleCells}
                className={`relative w-7 h-7 rounded-lg text-sm transition-colors flex items-center justify-center ${
                  showPossibleCells
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={showPossibleCells ? '可能セルの色付け ON' : '可能セルの色付け OFF'}
              >
                🎨
                {!showPossibleCells && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-6 h-0.5 bg-red-500 rotate-45 rounded" />
                  </span>
                )}
              </button>

              {/* ソルバーボタン */}
              {solverStatus.canRun && (
                <button
                  onClick={runSolver}
                  className="w-7 h-7 rounded-lg text-sm transition-colors flex items-center justify-center bg-orange-100 text-orange-600 hover:bg-orange-200"
                  title="解の候補を探索"
                >
                  🔍
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ヒントリスト（有効なプレイヤーのみ表示） */}
      {selectedPlayer?.enabled && (
        <div className="space-y-3">
          {Object.entries(hintsByCategory)
            .filter(([, hints]) => hints.length > 0)
            .map(([category, hints]) => (
            <div key={category} className="bg-white rounded-xl shadow p-3">
              <div className="flex items-center gap-2 mb-2 border-b pb-1">
                <h3 className="font-bold text-gray-700 text-sm">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                {/* 地形カテゴリの場合はフィルターを表示 */}
                {category === 'terrain' && (
                  <>
                    <div className="flex-1" />
                    <div className="flex gap-0.5">
                      {(['forest', 'desert', 'swamp', 'mountain', 'water'] as TerrainType[]).map((t) => {
                        const info = terrainIcons[t]
                        const active = terrainFilters.includes(t)
                        return (
                          <button
                            key={t}
                            onClick={() => toggleTerrainFilter(t)}
                            className={`p-0.5 rounded transition-all ${
                              active
                                ? 'bg-emerald-100 ring-1 ring-emerald-500'
                                : 'opacity-40 hover:opacity-100'
                            }`}
                          >
                            <span className={`${info.color} text-sm`}>{info.icon}</span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-0.5">
                {hints.map((hint) => {
                  const isOn = selectedPlayer.possibleHintIds.includes(hint.id)
                  const icons = getHintIcons(hint)
                  const confirmedOwnerId = getConfirmedHintOwner(hint.id)
                  const confirmedOwner = confirmedOwnerId ? state.players.find(p => p.id === confirmedOwnerId) : null
                  const isSelfPlayer = state.selfPlayerId === selectedPlayer.id
                  const isMyConfirmedHint = selectedPlayer.confirmedHintId === hint.id

                  return (
                    <div
                      key={hint.id}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-all flex items-center gap-2 ${
                        isMyConfirmedHint
                          ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                          : isOn
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {/* トグルスイッチ */}
                      <button
                        onClick={() => toggleHint(selectedPlayer.id, hint.id)}
                        className={`w-8 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                          isOn ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            isOn ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>

                      {/* アイコン */}
                      {icons.length > 0 && (
                        <span className={`flex items-center gap-0.5 ${isOn ? '' : 'opacity-40'}`}>
                          {icons}
                        </span>
                      )}

                      {/* テキスト */}
                      <span className="flex-1">
                        <StyledHintText text={hint.text} isOn={isOn} />
                      </span>

                      {/* 確定マーク（他プレイヤーが確定したヒントの場合） */}
                      {confirmedOwner && confirmedOwner.id !== selectedPlayer.id && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded text-white ${PLAYER_COLOR_MAP[confirmedOwner.color].bgClass}`}
                          title={`${confirmedOwner.symbol}のヒント`}
                        >
                          {confirmedOwner.symbol}
                        </span>
                      )}

                      {/* 自分プレイヤーの場合、確定ボタン */}
                      {isSelfPlayer && isOn && !selectedPlayer.confirmedHintId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmHint(selectedPlayer.id, hint.id)
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                          title="このヒントを確定する"
                        >
                          確定
                        </button>
                      )}

                      {/* このヒントが確定済みマーク */}
                      {isMyConfirmedHint && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white">
                          ✓確定
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ソルバー結果パネル */}
      {showSolver && solverResults !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-gray-800">🔍 解の候補</h2>
                {solverResults.items.length > 0 && (
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setSolverViewMode('summary')}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        solverViewMode === 'summary'
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      一覧
                    </button>
                    <button
                      onClick={() => setSolverViewMode('detail')}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        solverViewMode === 'detail'
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      詳細
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowSolver(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* 結果リスト */}
            <div className="flex-1 overflow-y-auto p-4">
              {solverResults.items.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">🤔</div>
                  <p>答えが1マスになる組み合わせが見つかりませんでした</p>
                  <p className="text-sm mt-2">ヒントをもう少し絞り込んでみてください</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* 確定済みヒント（共通） */}
                  {solverResults.confirmedHints.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 space-y-1">
                      <div className="text-xs text-blue-600 mb-1">確定済みヒント</div>
                      {solverResults.confirmedHints.map((hint) => {
                        const colorInfo = PLAYER_COLOR_MAP[hint.playerColor as keyof typeof PLAYER_COLOR_MAP]
                        return (
                          <div key={hint.playerId} className="flex items-center gap-2 text-sm">
                            <span
                              className={`flex-shrink-0 px-1.5 py-0.5 rounded text-white text-xs ${colorInfo?.bgClass || 'bg-gray-400'}`}
                            >
                              {hint.isSelf && '👤'}{hint.playerSymbol}
                            </span>
                            <span className="text-gray-700">{hint.hintText}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {solverViewMode === 'summary' ? (
                    /* 一覧表示 */
                    <div>
                      {(() => {
                        // ユニークなセルを抽出
                        const uniqueCells = [...new Set(solverResults.items.map(r => r.answerLabel))].sort()
                        return (
                          <>
                            <p className="text-sm text-gray-500 mb-3">
                              {uniqueCells.length}マスの候補
                              {solverResults.hasMore && <span className="text-orange-500">（50マス以上あり、省略）</span>}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {uniqueCells.map((label) => (
                                <span
                                  key={label}
                                  className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg font-medium text-sm"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    /* 詳細表示 */
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        {solverResults.items.length}件の候補
                        {solverResults.hasMore && <span className="text-orange-500">（50マス以上あり、省略）</span>}
                      </p>
                      {solverResults.items.map((result, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-orange-600">📍 {result.answerLabel}</span>
                          </div>
                          <div className="space-y-1">
                            {result.hintTexts.map((hintText, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-700">{hintText}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="px-4 py-3 border-t">
              <button
                onClick={() => setShowSolver(false)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
