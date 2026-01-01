import { useGame } from '../hooks/useGame'

export function Header() {
  const { state, resetGame } = useGame()
  const isGameStarted = state.players.length > 0

  const handleReset = () => {
    if (window.confirm('ゲームをリセットしますか？')) {
      resetGame()
    }
  }

  return (
    <header className="bg-emerald-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Cryptid Solver</h1>
            <p className="text-emerald-200 text-sm">ヒント推理ツール</p>
          </div>
          {isGameStarted && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm transition-colors"
            >
              リセット
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
