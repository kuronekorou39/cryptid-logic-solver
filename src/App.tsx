import { GameProvider } from './context/GameContext'
import { GameBoard } from './components/GameBoard'
import { Header } from './components/Header'
import { GameSetup } from './components/GameSetup'
import { useGame } from './hooks/useGame'

function AppContent() {
  const { state } = useGame()
  const isGameStarted = state.players.length > 0

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-lg">
        {isGameStarted ? <GameBoard /> : <GameSetup />}
      </main>
    </div>
  )
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App
