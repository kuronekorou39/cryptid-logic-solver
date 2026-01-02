import { useState, useMemo, useContext } from 'react';
import { HexMap } from './HexMap';
import { type MapConfig } from '../data/map-tiles';
import { GreenStoneIcon, BlueStoneIcon, WhiteShackIcon, TileIcon } from './Icons';
import { GameContext } from '../context/GameContext';
import type { StructureColor } from '../types';

// 8つの構造物定義（巨石4色 + 廃墟4色）
const STRUCTURE_DEFS = [
  { id: 'stone-green', type: 'stone' as const, color: 'green' as StructureColor, label: '巨石', colorLabel: '緑', icon: GreenStoneIcon, colorClass: 'text-green-600' },
  { id: 'stone-blue', type: 'stone' as const, color: 'blue' as StructureColor, label: '巨石', colorLabel: '青', icon: BlueStoneIcon, colorClass: 'text-blue-600' },
  { id: 'stone-white', type: 'stone' as const, color: 'white' as StructureColor, label: '巨石', colorLabel: '白', icon: GreenStoneIcon, colorClass: 'text-gray-400' },
  { id: 'stone-black', type: 'stone' as const, color: 'black' as StructureColor, label: '巨石', colorLabel: '黒', icon: GreenStoneIcon, colorClass: 'text-gray-800' },
  { id: 'shack-green', type: 'shack' as const, color: 'green' as StructureColor, label: '廃墟', colorLabel: '緑', icon: WhiteShackIcon, colorClass: 'text-green-600' },
  { id: 'shack-blue', type: 'shack' as const, color: 'blue' as StructureColor, label: '廃墟', colorLabel: '青', icon: WhiteShackIcon, colorClass: 'text-blue-600' },
  { id: 'shack-white', type: 'shack' as const, color: 'white' as StructureColor, label: '廃墟', colorLabel: '白', icon: WhiteShackIcon, colorClass: 'text-gray-400' },
  { id: 'shack-black', type: 'shack' as const, color: 'black' as StructureColor, label: '廃墟', colorLabel: '黒', icon: WhiteShackIcon, colorClass: 'text-gray-800' },
];

export function MapView() {
  const game = useContext(GameContext);
  if (!game) return null;

  const { state, setTiles, setStructureCoord } = game;
  const isAdvanced = state.mode === 'advanced';
  const tileConfig = state.mapSettings.tiles;
  const structureCoords = state.mapSettings.structureCoords;

  // UI状態（永続化不要）
  const [showTiles, setShowTiles] = useState(true);
  const [showStones, setShowStones] = useState(true);
  const [showShacks, setShowShacks] = useState(true);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);

  // 回転ボタンのハンドラ
  const rotateClockwise = () => {
    setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
  };

  // タイル設定を更新
  const updateTile = (index: number, tileId: number, reversed: boolean) => {
    const newTiles = tileConfig.map((t, i) => (i === index ? { tileId, reversed } : t));
    setTiles(newTiles);
  };

  // 構造物の座標を更新
  const updateStructureCoord = (id: string, col: number, row: number) => {
    setStructureCoord(id, { col, row });
  };

  // 構造物の座標をクリア
  const clearStructureCoord = (id: string) => {
    setStructureCoord(id, null);
  };

  // マップクリック時のハンドラ
  const handleCellClick = (col: number, row: number) => {
    if (selectedStructure) {
      updateStructureCoord(selectedStructure, col, row);
    }
  };

  // mapConfigを構築
  const mapConfig: MapConfig = useMemo(() => {
    const structures = STRUCTURE_DEFS
      .filter((def) => structureCoords[def.id] !== null)
      .filter((def) => isAdvanced || def.color !== 'black')
      .map((def) => ({
        type: def.type,
        color: def.color,
        col: structureCoords[def.id]!.col,
        row: structureCoords[def.id]!.row,
      }));

    return {
      tiles: tileConfig,
      structures,
    };
  }, [tileConfig, structureCoords, isAdvanced]);

  // ハイライトするセル（選択中の構造物の座標）
  const highlightedCells = useMemo(() => {
    if (!selectedStructure) return undefined;
    const coord = structureCoords[selectedStructure];
    if (!coord) return undefined;
    return new Set([`${coord.col}-${coord.row}`]);
  }, [selectedStructure, structureCoords]);

  // 未設定の構造物数を計算
  const unplacedStones = STRUCTURE_DEFS
    .filter((def) => def.type === 'stone' && (isAdvanced || def.color !== 'black'))
    .filter((def) => structureCoords[def.id] === null).length;
  const unplacedShacks = STRUCTURE_DEFS
    .filter((def) => def.type === 'shack' && (isAdvanced || def.color !== 'black'))
    .filter((def) => structureCoords[def.id] === null).length;

  const columns = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="space-y-3 select-none">
      {/* マップ表示（一番上） */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <div className="flex items-start gap-2">
          {/* マップ（左寄せ） */}
          <div className="flex-1">
            <HexMap
              config={mapConfig}
              highlightedCells={highlightedCells}
              onCellClick={handleCellClick}
              rotation={rotation}
            />
          </div>
          {/* 右側ボタン群（上寄せ） */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={rotateClockwise}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-600 transition-colors"
              title="90°回転"
            >
              ↻
            </button>
            <button
              onClick={() => setShowTiles(!showTiles)}
              className={`w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${
                showTiles ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="タイル設定"
            >
              <TileIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowStones(!showStones)}
              className={`relative w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${
                showStones ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="巨石設定"
            >
              <GreenStoneIcon className="w-5 h-5" />
              {unplacedStones > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unplacedStones}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowShacks(!showShacks)}
              className={`relative w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${
                showShacks ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="廃墟設定"
            >
              <WhiteShackIcon className="w-5 h-5" />
              {unplacedShacks > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unplacedShacks}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* タイル設定 */}
      {showTiles && (
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-medium text-gray-600 text-sm mb-2 flex items-center gap-1">
            <TileIcon className="w-4 h-4" />
            タイル配置
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {tileConfig.map((tile, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm bg-gray-50 rounded p-1.5">
                <select
                  value={tile.tileId}
                  onChange={(e) =>
                    updateTile(index, parseInt(e.target.value), tile.reversed)
                  }
                  className="border rounded px-2 py-1 w-14"
                >
                  {[1, 2, 3, 4, 5, 6].map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={tile.reversed}
                    onChange={(e) =>
                      updateTile(index, tile.tileId, e.target.checked)
                    }
                  />
                  <span className="text-xs text-gray-500">逆</span>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowTiles(false)}
            className="w-full mt-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
          >
            OK
          </button>
        </div>
      )}

      {/* 巨石設定 */}
      {showStones && (
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-medium text-gray-600 text-sm mb-2 flex items-center gap-1">
            <GreenStoneIcon className="w-4 h-4" />
            巨石
          </h4>
          <div className="space-y-1">
            {STRUCTURE_DEFS.filter((def) => def.type === 'stone' && (isAdvanced || def.color !== 'black')).map((def) => {
              const coord = structureCoords[def.id];
              const isSelected = selectedStructure === def.id;
              const Icon = def.icon;

              return (
                <div
                  key={def.id}
                  className={`flex items-center gap-2 text-sm p-1.5 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-100 ring-2 ring-amber-400'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedStructure(isSelected ? null : def.id)}
                >
                  <span className={def.colorClass}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className={`w-4 ${def.colorClass}`}>{def.colorLabel}</span>

                  {/* 座標選択 */}
                  <div className="flex items-center gap-1 ml-auto" onClick={coord ? (e) => e.stopPropagation() : undefined}>
                    {coord ? (
                      <>
                        <select
                          value={coord.col}
                          onChange={(e) => updateStructureCoord(def.id, parseInt(e.target.value), coord.row)}
                          className="border rounded px-1 py-0.5 w-11 text-xs"
                        >
                          {columns.map((c, i) => (
                            <option key={c} value={i}>{c}</option>
                          ))}
                        </select>
                        <select
                          value={coord.row}
                          onChange={(e) => updateStructureCoord(def.id, coord.col, parseInt(e.target.value))}
                          className="border rounded px-1 py-0.5 w-11 text-xs"
                        >
                          {rows.map((r) => (
                            <option key={r} value={r - 1}>{r}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => clearStructureCoord(def.id)}
                          className="text-red-500 hover:text-red-700 px-1"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">マップをクリック</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => { setShowStones(false); setSelectedStructure(null); }}
            className="w-full mt-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
          >
            OK
          </button>
        </div>
      )}

      {/* 廃墟設定 */}
      {showShacks && (
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="font-medium text-gray-600 text-sm mb-2 flex items-center gap-1">
            <WhiteShackIcon className="w-4 h-4" />
            廃墟
          </h4>
          <div className="space-y-1">
            {STRUCTURE_DEFS.filter((def) => def.type === 'shack' && (isAdvanced || def.color !== 'black')).map((def) => {
              const coord = structureCoords[def.id];
              const isSelected = selectedStructure === def.id;
              const Icon = def.icon;

              return (
                <div
                  key={def.id}
                  className={`flex items-center gap-2 text-sm p-1.5 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-100 ring-2 ring-amber-400'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedStructure(isSelected ? null : def.id)}
                >
                  <span className={def.colorClass}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className={`w-4 ${def.colorClass}`}>{def.colorLabel}</span>

                  {/* 座標選択 */}
                  <div className="flex items-center gap-1 ml-auto" onClick={coord ? (e) => e.stopPropagation() : undefined}>
                    {coord ? (
                      <>
                        <select
                          value={coord.col}
                          onChange={(e) => updateStructureCoord(def.id, parseInt(e.target.value), coord.row)}
                          className="border rounded px-1 py-0.5 w-11 text-xs"
                        >
                          {columns.map((c, i) => (
                            <option key={c} value={i}>{c}</option>
                          ))}
                        </select>
                        <select
                          value={coord.row}
                          onChange={(e) => updateStructureCoord(def.id, coord.col, parseInt(e.target.value))}
                          className="border rounded px-1 py-0.5 w-11 text-xs"
                        >
                          {rows.map((r) => (
                            <option key={r} value={r - 1}>{r}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => clearStructureCoord(def.id)}
                          className="text-red-500 hover:text-red-700 px-1"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">マップをクリック</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => { setShowShacks(false); setSelectedStructure(null); }}
            className="w-full mt-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
