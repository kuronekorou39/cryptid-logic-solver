import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { getHintsByMode, PLAYER_COLOR_MAP, PLAYER_COLORS, PLAYER_COUNT } from '../data'

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
    <div className="space-y-3">
      {/* プレイヤータブ */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {state.players.map((player) => {
          const colorInfo = PLAYER_COLOR_MAP[player.color]
          const isSelected = selectedPlayerId === player.id
          const remainingCount = player.possibleHintIds.length

          return (
            <button
              key={player.id}
              onClick={() => setSelectedPlayerId(player.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                isSelected
                  ? `${colorInfo.bgClass} text-white`
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{player.name}</span>
              <span className={`ml-1 text-xs ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                ({remainingCount})
              </span>
              {/* 削除ボタン（選択中のみ） */}
              {isSelected && state.players.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemovePlayer(player.id)
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs leading-none"
                >
                  ×
                </button>
              )}
            </button>
          )
        })}

        {/* 追加ボタン */}
        {canAddPlayer && !isAddingPlayer && (
          <button
            onClick={() => setIsAddingPlayer(true)}
            className="flex-shrink-0 w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-500 text-xl font-bold transition-colors"
          >
            +
          </button>
        )}

        {/* 追加フォーム */}
        {isAddingPlayer && (
          <div className="flex gap-1 flex-shrink-0">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              placeholder="名前"
              autoFocus
              className="w-20 px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
              className="px-2 py-1 bg-emerald-500 text-white rounded text-sm disabled:bg-gray-300"
            >
              OK
            </button>
            <button
              onClick={() => {
                setIsAddingPlayer(false)
                setNewPlayerName('')
              }}
              className="px-2 py-1 bg-gray-300 rounded text-sm"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* ヒントリスト */}
      {selectedPlayer ? (
        <div className="space-y-3">
          {Object.entries(hintsByCategory).map(([category, hints]) => (
            <div key={category} className="bg-white rounded-xl shadow p-3">
              <h3 className="font-bold text-gray-700 text-sm mb-2 border-b pb-1">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="space-y-0.5">
                {hints.map((hint) => {
                  const isOn = selectedPlayer.possibleHintIds.includes(hint.id)
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
                      <span className={isOn ? '' : 'line-through'}>{hint.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
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
        <div className="pt-4">
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
