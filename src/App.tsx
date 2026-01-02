import { useState } from 'react'
import { GameProvider } from './context/GameContext'
import { GameBoard } from './components/GameBoard'
import { MapView } from './components/MapView'
import { Header } from './components/Header'

type ViewMode = 'hints' | 'map'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('hints')

  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-3 py-3 max-w-2xl">
          {/* ビュー切り替えタブ */}
          <div className="flex mb-3 bg-white rounded-lg shadow overflow-hidden">
            <button
              onClick={() => setViewMode('hints')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                viewMode === 'hints'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ヒント管理
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              マップ
            </button>
          </div>

          {/* コンテンツ */}
          {viewMode === 'hints' ? <GameBoard /> : <MapView />}
        </main>
      </div>
    </GameProvider>
  )
}

export default App
