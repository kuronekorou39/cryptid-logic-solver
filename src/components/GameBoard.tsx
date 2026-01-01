import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { getHintsByMode, PLAYER_COLOR_MAP } from '../data'

export function GameBoard() {
  const { state, toggleHint } = useGame()
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(state.players[0]?.id || '')
  const allHints = getHintsByMode(state.mode)

  const selectedPlayer = state.players.find((p) => p.id === selectedPlayerId)

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
    <div className="space-y-4">
      {/* プレイヤータブ */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {state.players.map((player) => {
          const colorInfo = PLAYER_COLOR_MAP[player.color]
          const isSelected = selectedPlayerId === player.id
          const remainingCount = player.possibleHintIds.length

          return (
            <button
              key={player.id}
              onClick={() => setSelectedPlayerId(player.id)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium transition-all ${
                isSelected
                  ? `${colorInfo.bgClass} text-white shadow-lg`
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
              }`}
            >
              <div className="text-sm">{player.name}</div>
              <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                {remainingCount} / {allHints.length}
              </div>
            </button>
          )
        })}
      </div>

      {/* ヒントリスト */}
      {selectedPlayer && (
        <div className="space-y-4">
          {Object.entries(hintsByCategory).map(([category, hints]) => (
            <div key={category} className="bg-white rounded-xl shadow p-4">
              <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="space-y-1">
                {hints.map((hint) => {
                  const isOn = selectedPlayer.possibleHintIds.includes(hint.id)
                  return (
                    <button
                      key={hint.id}
                      onClick={() => toggleHint(selectedPlayer.id, hint.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-3 ${
                        isOn
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {/* トグルスイッチ */}
                      <div
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          isOn ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            isOn ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </div>
                      <span className={isOn ? '' : 'line-through'}>{hint.text}</span>
                      {hint.mode === 'advanced' && (
                        <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                          上級
                        </span>
                      )}
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
