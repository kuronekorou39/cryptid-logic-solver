import { GameProvider } from './context/GameContext'
import { GameBoard } from './components/GameBoard'
import { Header } from './components/Header'

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-3 py-3 max-w-lg">
          <GameBoard />
        </main>
      </div>
    </GameProvider>
  )
}

export default App
