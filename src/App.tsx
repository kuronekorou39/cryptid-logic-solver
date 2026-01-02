import { GameProvider } from './context/GameContext'
import { GameBoard } from './components/GameBoard'
import { MapView } from './components/MapView'
import { Header } from './components/Header'

function App() {
  return (
    <GameProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden container mx-auto px-3 py-3 max-w-2xl">
          {/* マップ（固定表示） */}
          <div className="flex-shrink-0">
            <MapView />
          </div>

          {/* ヒント管理（スクロール領域） */}
          <div className="flex-1 overflow-y-auto mt-3">
            <GameBoard />
          </div>
        </main>
      </div>
    </GameProvider>
  )
}

export default App
