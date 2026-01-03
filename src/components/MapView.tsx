import { useState, useMemo, useContext } from 'react';
import { HexMap } from './HexMap';
import { type MapConfig } from '../data/map-tiles';
import { GreenStoneIcon, BlueStoneIcon, WhiteShackIcon, TileIcon } from './Icons';
import { GameContext } from '../context/GameContext';
import type { StructureColor, MarkerType } from '../types';
import { calculatePossibleCells } from '../logic/possible-cells';

interface MapViewProps {
  selectedPlayerId: string;
}

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

export function MapView({ selectedPlayerId }: MapViewProps) {
  const game = useContext(GameContext);
  if (!game) return null;

  const { state, setTiles, setStructureCoord, setMarker } = game;
  const isAdvanced = state.mode === 'advanced';
  const tileConfig = state.mapSettings.tiles;
  const structureCoords = state.mapSettings.structureCoords;
  const playerMarkers = state.playerMarkers;

  // 選択中のプレイヤーが有効かどうか
  const selectedPlayer = state.players.find(p => p.id === selectedPlayerId);
  const isPlayerEnabled = selectedPlayer?.enabled ?? false;

  // UI状態（永続化不要）
  // 初期状態: 未入力項目がある場合のみ表示
  const [showTiles, setShowTiles] = useState(() => {
    return state.mapSettings.tiles.some((t) => t.tileId === null);
  });
  const [showStones, setShowStones] = useState(() => {
    const isAdv = state.mode === 'advanced';
    return STRUCTURE_DEFS
      .filter((def) => def.type === 'stone' && (isAdv || def.color !== 'black'))
      .some((def) => state.mapSettings.structureCoords[def.id] === null);
  });
  const [showShacks, setShowShacks] = useState(() => {
    const isAdv = state.mode === 'advanced';
    return STRUCTURE_DEFS
      .filter((def) => def.type === 'shack' && (isAdv || def.color !== 'black'))
      .some((def) => state.mapSettings.structureCoords[def.id] === null);
  });
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);

  // 回転ボタンのハンドラ
  const rotateClockwise = () => {
    setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
  };

  // タイル設定を更新
  const updateTile = (index: number, tileId: number | null, reversed: boolean) => {
    const newTiles = tileConfig.map((t, i) => (i === index ? { tileId, reversed } : t));
    setTiles(newTiles, index);
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
    // 構造物配置モードが優先
    if (selectedStructure) {
      updateStructureCoord(selectedStructure, col, row);
      return;
    }

    // 有効なプレイヤーが選択されている場合はマーカー配置
    if (isPlayerEnabled) {
      const cellKey = `${col}-${row}`;
      const currentMarker = playerMarkers[selectedPlayerId]?.[cellKey] as MarkerType | undefined;

      // none → disc → cube → none とサイクル
      let nextMarker: MarkerType | null;
      if (!currentMarker) {
        nextMarker = 'disc';
      } else if (currentMarker === 'disc') {
        nextMarker = 'cube';
      } else {
        nextMarker = null;
      }

      setMarker(selectedPlayerId, cellKey, nextMarker);
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

  // 可能性のあるセルを計算（有効な全プレイヤーのヒントに基づく）
  const playerPossibleCells = useMemo(() => {
    // マップが未完成なら計算しない
    const allTilesSet = tileConfig.every(t => t.tileId !== null);
    if (!allTilesSet) return undefined;

    // 有効なプレイヤーの可能セルを計算
    const enabledPlayers = state.players.filter(p => p.enabled);
    if (enabledPlayers.length === 0) return undefined;

    return enabledPlayers.map(player => ({
      playerId: player.id,
      cells: calculatePossibleCells(
        tileConfig,
        structureCoords,
        player.possibleHintIds
      )
    }));
  }, [state.players, tileConfig, structureCoords]);

  // 未設定の数を計算
  const unplacedTiles = tileConfig.filter((t) => t.tileId === null).length;
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
              playerPossibleCells={playerPossibleCells}
              onCellClick={handleCellClick}
              rotation={rotation}
              playerMarkers={playerMarkers}
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
              className={`relative w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${
                showTiles ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="タイル設定"
            >
              <TileIcon className="w-5 h-5" />
              {unplacedTiles > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unplacedTiles}
                </span>
              )}
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
                  value={tile.tileId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateTile(index, val === '' ? null : parseInt(val), tile.reversed);
                  }}
                  className={`border rounded px-2 py-1 w-14 bg-white ${tile.tileId === null ? 'text-gray-400' : 'text-gray-900 font-medium'}`}
                >
                  <option value="">-</option>
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
                    disabled={tile.tileId === null}
                    onChange={(e) =>
                      updateTile(index, tile.tileId, e.target.checked)
                    }
                  />
                  <span className={`text-xs ${tile.tileId === null ? 'text-gray-300' : 'text-gray-500'}`}>逆</span>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowTiles(false)}
            disabled={unplacedTiles > 0}
            className={`w-full mt-3 py-1.5 text-sm font-medium rounded transition-colors ${
              unplacedTiles > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
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
            disabled={unplacedStones > 0}
            className={`w-full mt-3 py-1.5 text-sm font-medium rounded transition-colors ${
              unplacedStones > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
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
            disabled={unplacedShacks > 0}
            className={`w-full mt-3 py-1.5 text-sm font-medium rounded transition-colors ${
              unplacedShacks > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
