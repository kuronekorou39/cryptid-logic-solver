import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { getHintsByMode, PLAYER_COLOR_MAP, PLAYER_COLORS, PLAYER_COUNT } from '../data'
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
  cougar: { icon: <EagleIcon />, color: 'text-orange-600' }, // cougar -> ワシ
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

  // 地形
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

  // 動物
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

  // 構造物
  if (condition.structureColors) {
    condition.structureColors.forEach((c, i) => {
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

// タブの薄い背景色を取得
function getTabBgClass(color: string, isSelected: boolean) {
  if (isSelected) return ''
  const lightColors: Record<string, string> = {
    red: 'bg-red-100',
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
  }
  return lightColors[color] || 'bg-gray-100'
}

export function GameBoard() {
  const { state, toggleHint, addPlayer, removePlayer, resetGame, setMode } = useGame()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(state.players[0]?.id || '')
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')

  const allHints = getHintsByMode(state.mode)
  const selectedPlayer = state.players.find((p) => p.id === selectedPlayerId)

  const usedColors = state.players.map((p) => p.color)
  const availableColors = PLAYER_COLORS.filter((c) => !usedColors.includes(c.color))
  const canAddPlayer = state.players.length < PLAYER_COUNT.MAX && availableColors.length > 0

  const handleAddPlayer = () => {
    if (!newPlayerName.trim() || !canAddPlayer) return
    const color = availableColors[0].color
    addPlayer(newPlayerName.trim(), color)
    setNewPlayerName('')
    setIsAddingPlayer(false)
  }

  const handleRemovePlayer = (playerId: string) => {
    if (state.players.length <= 1) return
    removePlayer(playerId)
    if (selectedPlayerId === playerId) {
      const remaining = state.players.filter((p) => p.id !== playerId)
      setSelectedPlayerId(remaining[0]?.id || '')
    }
  }

  const handleReset = () => {
    if (window.confirm('全てリセットしますか？')) {
      resetGame()
      setSelectedPlayerId('')
    }
  }

  // カテゴリごとにグループ化
  const hintsByCategory = {
    terrain: allHints.filter((h) => h.category === 'terrain'),
    structure: allHints.filter((h) => h.category === 'structure'),
    animal: allHints.filter((h) => h.category === 'animal'),
  }

  const categoryLabels = {
    terrain: '地形',
    structure: '構造物',
    animal: '動物',
  }

  return (
    <div>
      {/* 固定タブバー */}
      <div className="sticky top-0 z-10 bg-gray-100 pb-2">
        <div className="flex border-b border-gray-300 bg-white rounded-t-lg overflow-hidden">
          {state.players.map((player) => {
            const colorInfo = PLAYER_COLOR_MAP[player.color]
            const isSelected = selectedPlayerId === player.id
            const remainingCount = player.possibleHintIds.length
            const tabBg = isSelected ? colorInfo.bgClass : getTabBgClass(player.color, isSelected)

            return (
              <button
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                className={`relative flex-1 min-w-0 py-2 px-1 text-center transition-all border-b-2 ${tabBg} ${
                  isSelected
                    ? 'text-white border-transparent'
                    : `${colorInfo.textClass} border-transparent hover:opacity-80`
                }`}
              >
                <div className="truncate text-sm font-medium">{player.name}</div>
                <div className={`text-xs ${isSelected ? 'text-white/80' : 'opacity-60'}`}>
                  {remainingCount}/{allHints.length}
                </div>
                {/* 削除ボタン */}
                {isSelected && state.players.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemovePlayer(player.id)
                    }}
                    className="absolute top-0 right-0 w-5 h-5 bg-black/30 text-white rounded-bl text-xs"
                  >
                    ×
                  </button>
                )}
              </button>
            )
          })}

          {/* 追加タブ */}
          {canAddPlayer && !isAddingPlayer && (
            <button
              onClick={() => setIsAddingPlayer(true)}
              className="flex-shrink-0 w-12 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xl font-bold border-b-2 border-transparent"
            >
              +
            </button>
          )}
        </div>

        {/* 追加フォーム */}
        {isAddingPlayer && (
          <div className="flex gap-2 p-2 bg-white border-x border-b border-gray-300 rounded-b-lg">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              placeholder="プレイヤー名"
              autoFocus
              maxLength={10}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm disabled:bg-gray-300"
            >
              追加
            </button>
            <button
              onClick={() => {
                setIsAddingPlayer(false)
                setNewPlayerName('')
              }}
              className="px-3 py-2 bg-gray-200 rounded-lg text-sm"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* モード選択（プレイヤーがいない時） */}
      {state.players.length === 0 && (
        <div className="bg-white rounded-xl shadow p-4 mb-3">
          <h3 className="font-bold text-gray-700 text-sm mb-2">難易度</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('normal')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                state.mode === 'normal'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ノーマル
            </button>
            <button
              onClick={() => setMode('advanced')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                state.mode === 'advanced'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              上級
            </button>
          </div>
        </div>
      )}

      {/* ヒントリスト */}
      {selectedPlayer ? (
        <div className="space-y-3 pt-2">
          {Object.entries(hintsByCategory).map(([category, hints]) => (
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
      ) : (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500 mt-2">
          <p className="mb-4">プレイヤーを追加してください</p>
          <button
            onClick={() => setIsAddingPlayer(true)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
          >
            + プレイヤー追加
          </button>
        </div>
      )}

      {/* リセットボタン */}
      {state.players.length > 0 && (
        <div className="pt-8 pb-4">
          <button
            onClick={handleReset}
            className="w-full py-2 text-red-500 text-sm hover:bg-red-50 rounded-lg transition-colors"
          >
            リセット
          </button>
        </div>
      )}
    </div>
  )
}
