import { useGame } from '../hooks/useGame'
import { getHintsByMode, PLAYER_COLOR_MAP } from '../data'
import type { Player } from '../types'

interface PlayerDetailModalProps {
  player: Player
  onClose: () => void
}

export function PlayerDetailModal({ player, onClose }: PlayerDetailModalProps) {
  const { state, toggleHint } = useGame()
  const colorInfo = PLAYER_COLOR_MAP[player.color]
  const allHints = getHintsByMode(state.mode)

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="relative bg-white w-full max-w-lg max-h-[80vh] rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className={`${colorInfo.bgClass} text-white p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold">{player.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="font-bold text-lg">{player.name}</h2>
                <p className="text-sm opacity-80">
                  残り {player.possibleHintIds.length} / {allHints.length} 候補
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ヒント一覧 */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(hintsByCategory).map(([category, hints]) => (
            <div key={category} className="mb-6">
              <h3 className="font-bold text-gray-700 mb-2 sticky top-0 bg-white py-1">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h3>
              <div className="space-y-1">
                {hints.map((hint) => {
                  const isPossible = player.possibleHintIds.includes(hint.id)
                  return (
                    <button
                      key={hint.id}
                      onClick={() => toggleHint(player.id, hint.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        isPossible
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-400 line-through hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                        isPossible ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                      }`}>
                        {isPossible && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span>{hint.text}</span>
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
      </div>
    </div>
  )
}
