import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { getHintsByMode, PLAYER_COLOR_MAP } from '../data'
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

  if (condition.structureColors) {
    const colors = condition.structureColors
    if (colors.includes('green') && colors.includes('blue') && colors.length === 2) {
      icons.push(
        <span key="stone" className="text-teal-600">
          <GreenStoneIcon />
        </span>
      )
    } else if (colors.includes('white') && colors.includes('black') && colors.length === 2) {
      icons.push(
        <span key="shack" className="text-gray-600">
          <WhiteShackIcon />
        </span>
      )
    } else {
      colors.forEach((c, i) => {
        const info = structureIcons[c]
        icons.push(
          <span key={`structure-${i}`} className={info.color}>
            {info.icon}
          </span>
        )
      })
    }
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

// フィルター用の型
type FilterType = 'terrain' | 'animal' | 'structure'
type FilterValue = TerrainType | AnimalType | StructureColor | 'anyAnimal' | 'anyStructure' | 'stone' | 'shack'

function hintMatchesFilter(hint: Hint, filterType: FilterType, filterValue: FilterValue): boolean {
  const { condition } = hint

  if (filterType === 'terrain') {
    return condition.terrains?.includes(filterValue as TerrainType) ?? false
  }

  if (filterType === 'animal') {
    if (filterValue === 'anyAnimal') {
      return condition.anyAnimal === true
    }
    return condition.animals?.includes(filterValue as AnimalType) ?? false
  }

  if (filterType === 'structure') {
    if (filterValue === 'anyStructure') {
      return condition.anyStructure === true
    }
    if (filterValue === 'stone') {
      const colors = condition.structureColors
      return !!(colors && colors.includes('green') && colors.includes('blue') && colors.length === 2)
    }
    if (filterValue === 'shack') {
      const colors = condition.structureColors
      return !!(colors && colors.includes('white') && colors.includes('black') && colors.length === 2)
    }
    return condition.structureColors?.includes(filterValue as StructureColor) ?? false
  }

  return false
}

export function GameBoard() {
  const { state, toggleHint, togglePlayer, setPlayerName } = useGame()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(state.players[0]?.id || 'α')
  const [activeFilters, setActiveFilters] = useState<{ type: FilterType; value: FilterValue }[]>([])
  const [hideOffItems, setHideOffItems] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')

  const allHints = getHintsByMode(state.mode)
  const selectedPlayer = state.players.find((p) => p.id === selectedPlayerId)
  const enabledPlayersCount = state.players.filter((p) => p.enabled).length

  // フィルター適用
  let filteredHints = activeFilters.length === 0
    ? allHints
    : allHints.filter((hint) =>
        activeFilters.every((f) => hintMatchesFilter(hint, f.type, f.value))
      )

  // OFFの項目を非表示
  if (hideOffItems && selectedPlayer) {
    filteredHints = filteredHints.filter((hint) =>
      selectedPlayer.possibleHintIds.includes(hint.id)
    )
  }

  const toggleFilter = (type: FilterType, value: FilterValue) => {
    setActiveFilters((prev) => {
      const exists = prev.some((f) => f.type === type && f.value === value)
      if (exists) {
        return prev.filter((f) => !(f.type === type && f.value === value))
      }
      return [...prev, { type, value }]
    })
  }

  const isFilterActive = (type: FilterType, value: FilterValue) =>
    activeFilters.some((f) => f.type === type && f.value === value)

  const clearFilters = () => setActiveFilters([])

  const handleStartEditName = () => {
    if (selectedPlayer) {
      setTempName(selectedPlayer.name)
      setEditingName(true)
    }
  }

  const handleSaveName = () => {
    if (selectedPlayer) {
      setPlayerName(selectedPlayer.id, tempName.trim())
      setEditingName(false)
    }
  }

  const hintsByCategory = {
    terrain: filteredHints.filter((h) => h.category === 'terrain'),
    structure: filteredHints.filter((h) => h.category === 'structure'),
    animal: filteredHints.filter((h) => h.category === 'animal'),
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
            const displayName = player.name || player.symbol
            const remainingCount = player.possibleHintIds.length

            return (
              <button
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                className={`relative flex-1 min-w-0 py-2 px-1 text-center transition-all border-b-2 ${
                  isSelected
                    ? `${colorInfo.bgClass} text-white border-transparent`
                    : player.enabled
                      ? `bg-white ${colorInfo.textClass} border-transparent hover:opacity-80`
                      : 'bg-gray-100 text-gray-400 border-transparent'
                }`}
              >
                <div className="truncate text-sm font-medium">
                  {displayName}
                </div>
                {player.enabled ? (
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'opacity-60'}`}>
                    {remainingCount}/{allHints.length}
                  </div>
                ) : (
                  <div className="text-xs opacity-50">OFF</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 選択中プレイヤーの設定 */}
      {selectedPlayer && (
        <div className="bg-white rounded-xl shadow p-3 mb-3">
          <div className="flex items-center gap-3">
            {/* 有効/無効トグル */}
            <button
              onClick={() => togglePlayer(selectedPlayer.id)}
              className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${
                selectedPlayer.enabled ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  selectedPlayer.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>

            {/* 名前表示/編集 */}
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    placeholder={selectedPlayer.symbol}
                    maxLength={10}
                    autoFocus
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-1 bg-emerald-500 text-white rounded text-sm"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="px-2 py-1 bg-gray-200 rounded text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartEditName}
                  className="text-left w-full"
                >
                  <span className="text-sm font-medium">
                    {selectedPlayer.name || selectedPlayer.symbol}
                  </span>
                  {!selectedPlayer.name && (
                    <span className="text-xs text-gray-400 ml-2">名前を設定</span>
                  )}
                </button>
              )}
            </div>

            {/* 有効プレイヤー数 */}
            <div className="text-xs text-gray-500 flex-shrink-0">
              {enabledPlayersCount}人参加
            </div>
          </div>
        </div>
      )}

      {/* プレイヤーが無効の場合のメッセージ */}
      {selectedPlayer && !selectedPlayer.enabled && (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          <p className="mb-2">このプレイヤーは参加していません</p>
          <p className="text-sm">上のスイッチをONにして参加させてください</p>
        </div>
      )}

      {/* フィルターバー（有効なプレイヤーのみ表示） */}
      {selectedPlayer?.enabled && (
        <div className="bg-white rounded-xl shadow p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">絞り込み</span>
            {activeFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-600"
              >
                クリア
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['forest', 'desert', 'swamp', 'mountain', 'water'] as TerrainType[]).map((t) => {
              const info = terrainIcons[t]
              const active = isFilterActive('terrain', t)
              return (
                <button
                  key={t}
                  onClick={() => toggleFilter('terrain', t)}
                  className={`p-1.5 rounded-lg transition-all ${
                    active
                      ? 'bg-emerald-100 ring-2 ring-emerald-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={t}
                >
                  <span className={info.color}>{info.icon}</span>
                </button>
              )
            })}
            <span className="w-px bg-gray-300 mx-1" />
            {(['bear', 'cougar'] as AnimalType[]).map((a) => {
              const info = animalIcons[a]
              const active = isFilterActive('animal', a)
              return (
                <button
                  key={a}
                  onClick={() => toggleFilter('animal', a)}
                  className={`p-1.5 rounded-lg transition-all ${
                    active
                      ? 'bg-emerald-100 ring-2 ring-emerald-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className={info.color}>{info.icon}</span>
                </button>
              )
            })}
            <span className="w-px bg-gray-300 mx-1" />
            <button
              onClick={() => toggleFilter('structure', 'stone')}
              className={`p-1.5 rounded-lg transition-all ${
                isFilterActive('structure', 'stone')
                  ? 'bg-emerald-100 ring-2 ring-emerald-500'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="巨石"
            >
              <span className="text-teal-600"><GreenStoneIcon /></span>
            </button>
            <button
              onClick={() => toggleFilter('structure', 'shack')}
              className={`p-1.5 rounded-lg transition-all ${
                isFilterActive('structure', 'shack')
                  ? 'bg-emerald-100 ring-2 ring-emerald-500'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="廃墟"
            >
              <span className="text-gray-600"><WhiteShackIcon /></span>
            </button>
            {(['blue', 'white', 'green', 'black'] as StructureColor[]).map((c) => {
              const info = structureIcons[c]
              const active = isFilterActive('structure', c)
              return (
                <button
                  key={c}
                  onClick={() => toggleFilter('structure', c)}
                  className={`p-1.5 rounded-lg transition-all ${
                    active
                      ? 'bg-emerald-100 ring-2 ring-emerald-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className={info.color}>{info.icon}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">OFFを非表示</span>
            <button
              onClick={() => setHideOffItems(!hideOffItems)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                hideOffItems ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  hideOffItems ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          {(activeFilters.length > 0 || hideOffItems) && (
            <div className="mt-2 text-xs text-gray-500">
              {filteredHints.length}件のヒントを表示中
            </div>
          )}
        </div>
      )}

      {/* ヒントリスト（有効なプレイヤーのみ表示） */}
      {selectedPlayer?.enabled && (
        <div className="space-y-3">
          {Object.entries(hintsByCategory)
            .filter(([, hints]) => hints.length > 0)
            .map(([category, hints]) => (
            <div key={category} className="bg-white rounded-xl shadow p-3">
              <h3 className="font-bold text-gray-700 text-sm mb-2 border-b pb-1">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="space-y-0.5">
                {hints.map((hint) => {
                  const isOn = selectedPlayer.possibleHintIds.includes(hint.id)
                  const icons = getHintIcons(hint)
                  return (
                    <button
                      key={hint.id}
                      onClick={() => toggleHint(selectedPlayer.id, hint.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-all flex items-center gap-2 ${
                        isOn
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <div
                        className={`w-8 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                          isOn ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            isOn ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      {icons.length > 0 && (
                        <span className={`flex items-center gap-0.5 ${isOn ? '' : 'opacity-40'}`}>
                          {icons}
                        </span>
                      )}
                      <span className={isOn ? '' : 'line-through'}>{hint.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
