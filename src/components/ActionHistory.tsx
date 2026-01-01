import { useGame } from '../hooks/useGame'
import { PLAYER_COLOR_MAP, TERRAIN_MAP } from '../data'

export function ActionHistory() {
  const { state } = useGame()

  // 最新のアクションから表示（最大10件）
  const recentActions = [...state.actions].reverse().slice(0, 10)

  return (
    <div className="space-y-2">
      {recentActions.map((action) => {
        const player = state.players.find((p) => p.id === action.playerId)
        if (!player) return null

        const colorInfo = PLAYER_COLOR_MAP[player.color]
        const terrainInfo = TERRAIN_MAP[action.cellInfo.terrain]
        const actionLabel = action.type === 'cube' ? 'NO' : 'YES'
        const actionColor = action.type === 'cube' ? 'text-red-500' : 'text-blue-500'

        return (
          <div
            key={action.id}
            className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2"
          >
            <div className={`w-6 h-6 rounded-full ${colorInfo.bgClass} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{player.name.charAt(0)}</span>
            </div>
            <span className="font-medium">{player.name}</span>
            <span className="text-gray-400">@</span>
            <span className="font-mono">{action.coordinate}</span>
            <span className="text-gray-400">({terrainInfo.label})</span>
            <span className={`font-bold ${actionColor}`}>{actionLabel}</span>
          </div>
        )
      })}
    </div>
  )
}
