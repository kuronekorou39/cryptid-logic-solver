import { useContext, useState } from 'react'
import { GameContext } from '../context/GameContext'
import { TileIcon, GreenStoneIcon, WhiteShackIcon, SolverIcon } from './Icons'

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
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
              <h2 className="font-bold text-lg text-gray-800">使い方ガイド</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* 基本の流れ */}
              <div>
                <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-xs">▶</span>
                  基本の流れ
                </h3>

                {/* Step 1: マップ設定 */}
                <div className="mb-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600">
                        <TileIcon className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-green-600">
                        <GreenStoneIcon className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600">
                        <WhiteShackIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">マップを設定</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-11">
                    マップ右下のボタンからタイル番号・巨石・廃墟の位置を設定
                  </p>
                </div>

                {/* Step 2: プレイヤー設定 */}
                <div className="mb-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {['bg-red-500', 'bg-green-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-purple-500'].map((color, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 ${color} rounded text-white text-xs flex items-center justify-center font-medium ${i > 0 ? '-ml-1' : ''}`}
                          style={{ zIndex: 5 - i }}
                        >
                          {['α', 'β', 'γ', 'δ', 'ε'][i]}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">プレイヤーを有効化</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-11">
                    タブをタップで参加ON/OFF。
                    <span className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded">自分</span>
                    で自分を設定
                  </p>
                </div>

                {/* Step 3: マーカー配置 */}
                <div className="mb-4 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-8 bg-emerald-100 border-2 border-emerald-500 rounded flex items-center justify-center">
                        <span className="text-emerald-600 text-lg">○</span>
                      </div>
                      <div className="w-8 h-8 bg-red-100 border-2 border-red-500 rounded flex items-center justify-center">
                        <span className="text-red-600 text-lg">×</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">マーカーを配置</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-11">
                    マップのセルをタップしてdisc（○）/cube（×）を配置
                  </p>
                </div>

                {/* Step 4: ヒント確認 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-5 bg-emerald-500 rounded-full relative">
                        <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 bg-orange-500 text-white rounded">確定</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">ヒントを絞り込み</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-11">
                    自動モードならマーカーに基づいて自動計算。自分のヒントは「確定」で固定
                  </p>
                </div>
              </div>

              {/* 便利な機能 */}
              <div>
                <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">★</span>
                  便利な機能
                </h3>

                {/* 解の候補 */}
                <div className="mb-4 bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      <SolverIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">解の候補を探索</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-11">
                    全プレイヤーのヒント組み合わせから、答えが1マスになるパターンを自動探索
                  </p>
                </div>

                {/* オプションボタン */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">オプションバー</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">⚡</span>
                      <span className="text-xs text-gray-600">自動モード</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">👁</span>
                      <span className="text-xs text-gray-600">OFF非表示</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">🎨</span>
                      <span className="text-xs text-gray-600">可能セル表示</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">∩</span>
                      <span className="text-xs text-gray-600">全員の交差</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <span className="w-5 h-5 bg-green-100 text-green-700 rounded flex items-center justify-center text-xs">☑</span>
                        <span className="w-5 h-5 bg-red-100 text-red-700 rounded flex items-center justify-center text-xs">☐</span>
                      </div>
                      <span className="text-xs text-gray-600">全ON/OFF</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* フッター */}
              <div className="pt-4 border-t text-center">
                <a
                  href="https://github.com/kuronekorou39/cryptid-logic-solver"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub で詳細を見る
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
