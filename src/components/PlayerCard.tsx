import type { Player } from '../types'
import { PLAYER_COLOR_MAP } from '../data'
import { getHintsByMode } from '../data'
import { useGame } from '../hooks/useGame'

interface PlayerCardProps {
  player: Player
  onClick: () => void
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const { state } = useGame()
  const colorInfo = PLAYER_COLOR_MAP[player.color]
  const totalHints = getHintsByMode(state.mode).length
  const remainingHints = player.possibleHintIds.length
  const progress = ((totalHints - remainingHints) / totalHints) * 100

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full ${colorInfo.bgClass} flex items-center justify-center`}>
          <span className="text-white font-bold">{player.name.charAt(0)}</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{player.name}</h3>
          <p className="text-sm text-gray-500">残り {remainingHints} 候補</p>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${colorInfo.bgClass} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1 text-right">
        {Math.round(progress)}% 絞り込み済み
      </p>
    </button>
  )
}
