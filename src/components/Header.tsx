import { useContext, useState } from 'react'
import { GameContext } from '../context/GameContext'

export function Header() {
  const game = useContext(GameContext)
  const [showHelp, setShowHelp] = useState(false)

  if (!game) return null

  const { state, setMode, resetGame } = game
  const isAdvanced = state.mode === 'advanced'

  const handleReset = () => {
    if (confirm('すべての設定をリセットしますか？')) {
      resetGame()
    }
  }

  return (
    <>
      <header className={`${isAdvanced ? 'bg-gray-800' : 'bg-emerald-700'} text-white py-2 px-4 flex items-center transition-colors`}>
        <h1 className="font-bold">Cryptid Solver</h1>
        <div className="flex-1 flex justify-center">
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
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2 py-0.5 text-sm rounded bg-transparent text-red-300 hover:text-red-100 hover:bg-red-500/20 transition-colors"
            title="すべてリセット"
          >
            リセット
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-bold transition-colors"
            title="使い方"
          >
            ?
          </button>
        </div>
      </header>

      {/* ヘルプモーダル */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-800">使い方</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm text-gray-700">
              <section>
                <h3 className="font-bold text-gray-800 mb-1">1. マップを設定</h3>
                <p>マップ上部のボタンからタイル・巨石・廃墟の位置を設定します。</p>
              </section>

              <section>
                <h3 className="font-bold text-gray-800 mb-1">2. プレイヤーを有効化</h3>
                <p>下部のタブ（α〜ε）をタップして参加プレイヤーを有効にします。自分のプレイヤーは「自分」ボタンで設定できます。</p>
              </section>

              <section>
                <h3 className="font-bold text-gray-800 mb-1">3. マーカーを配置</h3>
                <p>マップ上のセルをタップしてdisc（○）/cube（×）マーカーを配置。自動モード（⚡）がONなら、マーカーに基づいてヒントが自動計算されます。</p>
              </section>

              <section>
                <h3 className="font-bold text-gray-800 mb-1">4. ヒントを確定</h3>
                <p>自分のヒントがわかったら「確定」ボタンで確定。確定したヒントは他プレイヤーから自動で除外されます。</p>
              </section>

              <section>
                <h3 className="font-bold text-gray-800 mb-1">5. 解の候補を探索</h3>
                <p>マップ右下のターゲットアイコンで解の候補パネルを開き、「計算開始」で答えが1マスになる組み合わせを探索できます。</p>
              </section>

              <section className="pt-2 border-t">
                <h3 className="font-bold text-gray-800 mb-1">オプションボタン</h3>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li><span className="font-mono bg-gray-100 px-1 rounded">⚡</span> 自動モード（マーカーでヒント自動計算）</li>
                  <li><span className="font-mono bg-gray-100 px-1 rounded">👁</span> OFFのヒントを非表示</li>
                  <li><span className="font-mono bg-gray-100 px-1 rounded">🎨</span> 可能セルの色付け表示</li>
                  <li><span className="font-mono bg-gray-100 px-1 rounded">∩</span> 全プレイヤーの交差を表示</li>
                  <li><span className="font-mono bg-gray-100 px-1 rounded">☑/☐</span> 全ヒントON/OFF</li>
                </ul>
              </section>

              <div className="pt-3 border-t text-center text-xs text-gray-400">
                <a
                  href="https://github.com/kuronekorou39/cryptid-logic-solver"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-600 underline"
                >
                  GitHub
                </a>
                <span className="mx-2">|</span>
                <span>Cryptid Logic Solver</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
