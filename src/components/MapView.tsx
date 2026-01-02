import { useState, useMemo } from 'react';
import { HexMap } from './HexMap';
import { DEFAULT_MAP_CONFIG, type MapConfig } from '../data/map-tiles';
import { GreenStoneIcon, BlueStoneIcon, WhiteShackIcon } from './Icons';
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

// 座標の型（未設定はnull）
type Coord = { col: number; row: number } | null;

export function MapView() {
  const [tileConfig, setTileConfig] = useState(DEFAULT_MAP_CONFIG.tiles);
  const [showTileConfig, setShowTileConfig] = useState(true);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

  // 回転ボタンのハンドラ
  const rotateClockwise = () => {
    setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
  };
  const rotateCounterClockwise = () => {
    setRotation((prev) => ((prev - 90 + 360) % 360) as 0 | 90 | 180 | 270);
  };

  // 各構造物の座標を個別に管理
  const [structureCoords, setStructureCoords] = useState<Record<string, Coord>>({
    'stone-green': null,
    'stone-blue': null,
    'stone-white': null,
    'stone-black': null,
    'shack-green': null,
    'shack-blue': null,
    'shack-white': null,
    'shack-black': null,
  });

  // 現在選択中の構造物（マップクリックで座標を設定する対象）
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);

  // タイル設定を更新
  const updateTile = (index: number, tileId: number, reversed: boolean) => {
    setTileConfig((prev) =>
      prev.map((t, i) => (i === index ? { tileId, reversed } : t))
    );
  };

  // 構造物の座標を更新（同じマスの他の構造物はクリア）
  const updateStructureCoord = (id: string, col: number, row: number) => {
    setStructureCoords((prev) => {
      const newCoords = { ...prev };
      // 同じ座標の他の構造物をクリア
      Object.keys(newCoords).forEach((key) => {
        if (key !== id && newCoords[key]?.col === col && newCoords[key]?.row === row) {
          newCoords[key] = null;
        }
      });
      // 対象の構造物を更新
      newCoords[id] = { col, row };
      return newCoords;
    });
  };

  // 構造物の座標をクリア
  const clearStructureCoord = (id: string) => {
    setStructureCoords((prev) => ({
      ...prev,
      [id]: null,
    }));
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
  }, [tileConfig, structureCoords]);

  // ハイライトするセル（選択中の構造物の座標）
  const highlightedCells = useMemo(() => {
    if (!selectedStructure) return undefined;
    const coord = structureCoords[selectedStructure];
    if (!coord) return undefined;
    return new Set([`${coord.col}-${coord.row}`]);
  }, [selectedStructure, structureCoords]);

  const columns = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="space-y-3 select-none">
      {/* マップ表示（一番上） */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          {/* マップ（左寄せ） */}
          <div className="flex-1">
            <HexMap
              config={mapConfig}
              highlightedCells={highlightedCells}
              onCellClick={handleCellClick}
              rotation={rotation}
            />
          </div>
          {/* 回転ボタン（右側） */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={rotateClockwise}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-600 transition-colors"
              title="時計回りに90°回転"
            >
              ↻
            </button>
            <button
              onClick={rotateCounterClockwise}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-600 transition-colors"
              title="反時計回りに90°回転"
            >
              ↺
            </button>
          </div>
        </div>
      </div>

      {/* マップ設定（アコーディオン） */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <button
          onClick={() => setShowTileConfig(!showTileConfig)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="font-bold text-gray-700 text-sm">マップ設定</span>
          <span className="text-gray-400">{showTileConfig ? '▲' : '▼'}</span>
        </button>
        {showTileConfig && (
          <div className="px-4 pb-4 space-y-4">
            {/* タイル配置 */}
            <div>
              <h4 className="font-medium text-gray-600 text-sm mb-2">タイル配置</h4>
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
            </div>

            {/* 構造物配置 */}
            <div>
              <h4 className="font-medium text-gray-600 text-sm mb-2">構造物</h4>
              <div className="space-y-1">
                {STRUCTURE_DEFS.map((def) => {
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
                      <span className="w-8">{def.label}</span>
                      <span className={`w-4 ${def.colorClass}`}>{def.colorLabel}</span>

                      {/* 座標選択 */}
                      <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
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
              <p className="text-xs text-gray-500 mt-2">
                行をクリックして選択→マップ上のマスをクリックで座標設定
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
