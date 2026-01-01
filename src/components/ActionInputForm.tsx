import { useState } from 'react'
import { useGame } from '../hooks/useGame'
import {
  TERRAINS,
  STRUCTURES,
  ANIMALS,
  COLUMN_LABELS,
  ROW_LABELS,
  PLAYER_COLOR_MAP,
} from '../data'
import type { TerrainType, StructureColor, AnimalType, CellInfo } from '../types'

interface NearbyItem<T> {
  value: T
  distance: number
}

export function ActionInputForm() {
  const { state, recordAction } = useGame()

  // フォーム状態
  const [playerId, setPlayerId] = useState('')
  const [column, setColumn] = useState('')
  const [row, setRow] = useState('')
  const [terrain, setTerrain] = useState<TerrainType | ''>('')
  const [structureColor, setStructureColor] = useState<StructureColor | ''>('')
  const [nearStructures, setNearStructures] = useState<NearbyItem<StructureColor>[]>([])
  const [animalTerritory, setAnimalTerritory] = useState<AnimalType | ''>('')
  const [nearAnimals, setNearAnimals] = useState<NearbyItem<AnimalType>[]>([])

  const isValid = playerId && column && row && terrain

  const handleSubmit = (actionType: 'cube' | 'disc') => {
    if (!isValid) return

    const coordinate = `${column}${row}`
    const cellInfo: CellInfo = {
      terrain: terrain as TerrainType,
      structureColor: structureColor || null,
      nearStructures: nearStructures.map((s) => ({ color: s.value, distance: s.distance })),
      animalTerritory: animalTerritory || null,
      nearAnimals: nearAnimals.map((a) => ({ animal: a.value, distance: a.distance })),
    }

    recordAction(playerId, actionType, coordinate, cellInfo)

    // フォームをリセット（プレイヤー以外）
    setColumn('')
    setRow('')
    setTerrain('')
    setStructureColor('')
    setNearStructures([])
    setAnimalTerritory('')
    setNearAnimals([])
  }

  const addNearStructure = (color: StructureColor, distance: number) => {
    if (!nearStructures.find((s) => s.value === color)) {
      setNearStructures([...nearStructures, { value: color, distance }])
    }
  }

  const removeNearStructure = (color: StructureColor) => {
    setNearStructures(nearStructures.filter((s) => s.value !== color))
  }

  const addNearAnimal = (animal: AnimalType, distance: number) => {
    if (!nearAnimals.find((a) => a.value === animal)) {
      setNearAnimals([...nearAnimals, { value: animal, distance }])
    }
  }

  const removeNearAnimal = (animal: AnimalType) => {
    setNearAnimals(nearAnimals.filter((a) => a.value !== animal))
  }

  return (
    <div className="space-y-4">
      {/* プレイヤー選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">プレイヤー</label>
        <div className="flex flex-wrap gap-2">
          {state.players.map((player) => {
            const colorInfo = PLAYER_COLOR_MAP[player.color]
            const isSelected = playerId === player.id
            return (
              <button
                key={player.id}
                onClick={() => setPlayerId(player.id)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  isSelected
                    ? `${colorInfo.bgClass} text-white`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {player.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* 座標 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">列</label>
          <select
            value={column}
            onChange={(e) => setColumn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">選択</option>
            {COLUMN_LABELS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">行</label>
          <select
            value={row}
            onChange={(e) => setRow(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">選択</option>
            {ROW_LABELS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 地形 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">地形 *</label>
        <div className="flex flex-wrap gap-2">
          {TERRAINS.map((t) => (
            <button
              key={t.type}
              onClick={() => setTerrain(t.type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                terrain === t.type
                  ? `${t.color} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 構造物（そのマス上） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">構造物（このマス上）</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStructureColor('')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              structureColor === ''
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            なし
          </button>
          {STRUCTURES.map((s) => (
            <button
              key={s.color}
              onClick={() => setStructureColor(s.color)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                structureColor === s.color
                  ? 'ring-2 ring-offset-1 ring-emerald-500 bg-gray-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ borderLeft: `4px solid ${s.cssColor}` }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 近くの構造物 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">近くの構造物</label>
        <div className="space-y-2">
          {nearStructures.map((s) => (
            <div key={s.value} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <span className="text-sm">{STRUCTURES.find((st) => st.color === s.value)?.label}</span>
              <span className="text-sm text-gray-500">({s.distance}マス以内)</span>
              <button
                onClick={() => removeNearStructure(s.value)}
                className="ml-auto text-red-500 text-sm"
              >
                削除
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {STRUCTURES.filter((s) => !nearStructures.find((ns) => ns.value === s.color)).map((s) => (
              <div key={s.color} className="flex items-center gap-1">
                <span className="text-xs text-gray-500">{s.label}:</span>
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    onClick={() => addNearStructure(s.color, d)}
                    className="w-6 h-6 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {d}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 動物の縄張り */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">動物の縄張り（このマス）</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAnimalTerritory('')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              animalTerritory === ''
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            なし
          </button>
          {ANIMALS.map((a) => (
            <button
              key={a.type}
              onClick={() => setAnimalTerritory(a.type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                animalTerritory === a.type
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* 近くの動物 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">近くの動物の縄張り</label>
        <div className="space-y-2">
          {nearAnimals.map((a) => (
            <div key={a.value} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <span className="text-sm">{ANIMALS.find((an) => an.type === a.value)?.label}</span>
              <span className="text-sm text-gray-500">({a.distance}マス以内)</span>
              <button
                onClick={() => removeNearAnimal(a.value)}
                className="ml-auto text-red-500 text-sm"
              >
                削除
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {ANIMALS.filter((a) => !nearAnimals.find((na) => na.value === a.type)).map((a) => (
              <div key={a.type} className="flex items-center gap-1">
                <span className="text-xs text-gray-500">{a.label}:</span>
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    onClick={() => addNearAnimal(a.type, d)}
                    className="w-6 h-6 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {d}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => handleSubmit('cube')}
          disabled={!isValid}
          className="py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          キューブ (NO)
        </button>
        <button
          onClick={() => handleSubmit('disc')}
          disabled={!isValid}
          className="py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          ディスク (YES)
        </button>
      </div>
    </div>
  )
}
