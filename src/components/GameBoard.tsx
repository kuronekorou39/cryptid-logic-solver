import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { getHintsByMode, PLAYER_COLOR_MAP, PLAYER_COLORS, PLAYER_COUNT } from '../data'
import {
  ForestIcon, DesertIcon, SwampIcon, MountainIcon, WaterIcon,
  BearIcon, CougarIcon, AnimalIcon,
  StoneIcon, ShackIcon, StructureIcon
} from './Icons'
import type { Hint } from '../types'

// ヒントからアイコンを取得
function getHintIcon(hint: Hint) {
  const { condition } = hint

  // 地形
  if (condition.terrains) {
    if (condition.terrains.includes('forest')) return <ForestIcon className="w-4 h-4 text-green-600" />
    if (condition.terrains.includes('desert')) return <DesertIcon className="w-4 h-4 text-yellow-600" />
    if (condition.terrains.includes('swamp')) return <SwampIcon className="w-4 h-4 text-purple-600" />
    if (condition.terrains.includes('mountain')) return <MountainIcon className="w-4 h-4 text-gray-600" />
    if (condition.terrains.includes('water')) return <WaterIcon className="w-4 h-4 text-blue-600" />
  }

  // 動物
  if (condition.animals) {
    if (condition.animals.includes('bear')) return <BearIcon className="w-4 h-4 text-amber-700" />
    if (condition.animals.includes('cougar')) return <CougarIcon className="w-4 h-4 text-orange-600" />
  }
  if (condition.anyAnimal) return <AnimalIcon className="w-4 h-4 text-amber-600" />

  // 構造物
  if (condition.structureColors) {
    if (condition.structureColors.includes('white') || condition.structureColors.includes('black')) {
      return <ShackIcon className="w-4 h-4 text-gray-700" />
    }
    return <StoneIcon className="w-4 h-4 text-emerald-700" />
  }
  if (condition.anyStructure) return <StructureIcon className="w-4 h-4 text-gray-600" />

  return null
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
  const { state, toggleHint, addPlayer, removePlayer, resetGame } = useGame()
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
                  const icon = getHintIcon(hint)
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
                      {icon && <span className={isOn ? '' : 'opacity-40'}>{icon}</span>}
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
