import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { PlayerCard } from './PlayerCard'
import { ActionInputForm } from './ActionInputForm'
import { PlayerDetailModal } from './PlayerDetailModal'
import { ActionHistory } from './ActionHistory'
import type { Player } from '../types'

export function GameBoard() {
  const { state, undoAction } = useGame()
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  return (
    <div className="space-y-6">
      {/* プレイヤーダッシュボード */}
      <section>
        <h2 className="font-bold text-gray-800 mb-3">プレイヤー</h2>
        <div className="grid grid-cols-2 gap-3">
          {state.players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}
        </div>
      </section>

      {/* アクション入力 */}
      <section className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-bold text-gray-800 mb-3">アクション記録</h2>
        <ActionInputForm />
      </section>

      {/* 行動履歴 */}
      {state.actions.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">履歴</h2>
            <button
              onClick={undoAction}
              className="text-sm text-emerald-600 hover:text-emerald-500"
            >
              取り消し
            </button>
          </div>
          <ActionHistory />
        </section>
      )}

      {/* プレイヤー詳細モーダル */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}
