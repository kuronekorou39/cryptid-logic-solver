import { useContext } from 'react'
import { GameContext } from '../context/GameContext'

export function Header() {
  const game = useContext(GameContext)
  if (!game) return null

  const { state, setMode, resetGame } = game
  const isAdvanced = state.mode === 'advanced'

  const handleReset = () => {
    if (confirm('すべての設定をリセットしますか？')) {
      resetGame()
    }
  }

  return (
    <header className={`${isAdvanced ? 'bg-gray-800' : 'bg-emerald-700'} text-white py-2 px-4 flex items-center justify-between transition-colors`}>
      <h1 className="font-bold">Cryptid Solver</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('normal')}
            className={`px-2 py-0.5 text-sm rounded transition-colors ${
              !isAdvanced
                ? 'bg-white text-emerald-700 font-medium'
                : 'bg-transparent text-white/70 hover:text-white'
            }`}
          >
            通常
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-2 py-0.5 text-sm rounded transition-colors ${
              isAdvanced
                ? 'bg-white text-gray-800 font-medium'
                : 'bg-transparent text-white/70 hover:text-white'
            }`}
          >
            上級
          </button>
        </div>
        <button
          onClick={handleReset}
          className="px-2 py-0.5 text-sm rounded bg-transparent text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="すべてリセット"
        >
          リセット
        </button>
      </div>
    </header>
  )
}
