import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import { PLAYER_COLORS, PLAYER_COUNT } from '../data'

export function GameSetup() {
  const { state, setMode, addPlayer, removePlayer, startGame } = useGame()
  const [playerName, setPlayerName] = useState('')

  const usedColors = state.players.map((p) => p.color)
  const availableColors = PLAYER_COLORS.filter((c) => !usedColors.includes(c.color))

  const canAddPlayer = state.players.length < PLAYER_COUNT.MAX && availableColors.length > 0
  const canStartGame = state.players.length >= PLAYER_COUNT.MIN

  const handleAddPlayer = () => {
    if (!canAddPlayer || !playerName.trim()) return

    const color = availableColors[0].color
    addPlayer(playerName.trim(), color)
    setPlayerName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPlayer()
    }
  }

  return (
    <div className="space-y-6">
      {/* モード選択 */}
      <section className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-bold text-gray-800 mb-3">ゲームモード</h2>
        <div className="flex gap-2">
          <ModeButton
            label="ノーマル"
            selected={state.mode === 'normal'}
            onClick={() => setMode('normal')}
          />
          <ModeButton
            label="アドバンスト"
            selected={state.mode === 'advanced'}
            onClick={() => setMode('advanced')}
          />
        </div>
      </section>

      {/* プレイヤー登録 */}
      <section className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-bold text-gray-800 mb-3">
          プレイヤー登録 ({state.players.length}/{PLAYER_COUNT.MAX})
        </h2>

        {/* 登録済みプレイヤー */}
        <div className="space-y-2 mb-4">
          {state.players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    PLAYER_COLORS.find((c) => c.color === player.color)?.bgClass
                  }`}
                >
                  {index + 1}
                </div>
                <span className="font-medium">{player.name}</span>
              </div>
              <button
                onClick={() => removePlayer(player.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* プレイヤー追加フォーム */}
        {canAddPlayer && (
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="プレイヤー名"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleAddPlayer}
              disabled={!playerName.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              追加
            </button>
          </div>
        )}
      </section>

      {/* ゲーム開始 */}
      <button
        onClick={startGame}
        disabled={!canStartGame}
        className="w-full py-4 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        {canStartGame ? 'ゲーム開始' : `${PLAYER_COUNT.MIN}人以上で開始`}
      </button>
    </div>
  )
}

function ModeButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
        selected
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )
}
