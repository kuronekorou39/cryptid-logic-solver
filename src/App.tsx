import { GameProvider } from './context/GameContext'
import { GameBoard } from './components/GameBoard'
import { MapView } from './components/MapView'
import { Header } from './components/Header'

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-3 py-3 max-w-2xl space-y-4">
          {/* マップ（常に表示、設定は折りたたみ） */}
          <MapView />

          {/* ヒント管理 */}
          <GameBoard />
        </main>
      </div>
    </GameProvider>
  )
}

export default App
