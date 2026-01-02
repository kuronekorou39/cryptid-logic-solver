import { useState } from 'react';
import { HexMap } from './HexMap';
import { DEFAULT_MAP_CONFIG, type MapConfig } from '../data/map-tiles';
import { GreenStoneIcon, BlueStoneIcon, WhiteShackIcon, BlackShackIcon } from './Icons';
import type { StructureColor } from '../types';

// 構造物配置の入力用
interface StructurePlacement {
  type: 'stone' | 'shack';
  color: StructureColor;
  col: number;
  row: number;
}

export function MapView() {
  const [mapConfig, setMapConfig] = useState<MapConfig>({
    ...DEFAULT_MAP_CONFIG,
    structures: [],
  });

  const [showSetup, setShowSetup] = useState(true);

  // タイル設定を更新
  const updateTile = (index: number, tileId: number, reversed: boolean) => {
    setMapConfig((prev) => ({
      ...prev,
      tiles: prev.tiles.map((t, i) =>
        i === index ? { tileId, reversed } : t
      ),
    }));
  };

  // 構造物を追加
  const addStructure = (structure: StructurePlacement) => {
    setMapConfig((prev) => ({
      ...prev,
      structures: [...prev.structures.filter(
        (s) => !(s.col === structure.col && s.row === structure.row)
      ), structure],
    }));
  };

  // 構造物を削除
  const removeStructure = (col: number, row: number) => {
    setMapConfig((prev) => ({
      ...prev,
      structures: prev.structures.filter(
        (s) => !(s.col === col && s.row === row)
      ),
    }));
  };

  return (
    <div className="space-y-4">
      {/* 設定トグル */}
      <button
        onClick={() => setShowSetup(!showSetup)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        {showSetup ? '設定を隠す' : 'マップ設定を表示'}
      </button>

      {/* マップ設定UI */}
      {showSetup && (
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          <h3 className="font-bold text-gray-700">タイル配置</h3>
          <div className="grid grid-cols-2 gap-1">
            {mapConfig.tiles.map((tile, index) => (
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

          {/* 構造物配置 */}
          <div>
            <h4 className="font-medium text-gray-600 text-sm mb-2">構造物</h4>
            <StructureInput onAdd={addStructure} />
            {mapConfig.structures.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {mapConfig.structures.map((s, i) => {
                  const colorClass: Record<string, string> = {
                    green: 'text-green-600',
                    blue: 'text-blue-600',
                    white: 'text-gray-400',
                    black: 'text-gray-800',
                  };
                  const colorLabel: Record<string, string> = {
                    green: '緑',
                    blue: '青',
                    white: '白',
                    black: '黒',
                  };
                  const icon = s.type === 'stone'
                    ? (s.color === 'blue' ? <BlueStoneIcon /> : <GreenStoneIcon />)
                    : (s.color === 'black' ? <BlackShackIcon /> : <WhiteShackIcon />);
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                    >
                      <span className={colorClass[s.color]}>{icon}</span>
                      <span>{s.type === 'stone' ? '巨石' : '廃墟'}</span>
                      <span className={colorClass[s.color]}>{colorLabel[s.color]}</span>
                      <span className="text-gray-500">{String.fromCharCode(65 + s.col)}{s.row + 1}</span>
                      <button
                        onClick={() => removeStructure(s.col, s.row)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* マップ表示 */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <HexMap config={mapConfig} />
      </div>
    </div>
  );
}

// 構造物入力フォーム
function StructureInput({
  onAdd,
}: {
  onAdd: (structure: StructurePlacement) => void;
}) {
  const [type, setType] = useState<'stone' | 'shack'>('stone');
  const [color, setColor] = useState<StructureColor>('green');
  const [col, setCol] = useState(0);
  const [row, setRow] = useState(0);

  const handleAdd = () => {
    onAdd({ type, color, col, row });
  };

  const columns = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i)); // A-L
  const rows = Array.from({ length: 9 }, (_, i) => i + 1); // 1-9

  // アイコンと色のマッピング
  const getIcon = () => {
    if (type === 'stone') {
      return color === 'blue' ? <BlueStoneIcon /> : <GreenStoneIcon />;
    } else {
      return color === 'black' ? <BlackShackIcon /> : <WhiteShackIcon />;
    }
  };

  const colorClass: Record<StructureColor, string> = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    white: 'text-gray-400',
    black: 'text-gray-800',
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {/* 選択中のアイコン表示 */}
      <span className={`${colorClass[color]}`}>{getIcon()}</span>

      {/* タイプ選択 */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value as 'stone' | 'shack')}
        className="border rounded px-2 py-1"
      >
        <option value="stone">巨石</option>
        <option value="shack">廃墟</option>
      </select>

      {/* 色選択 */}
      <select
        value={color}
        onChange={(e) => setColor(e.target.value as StructureColor)}
        className={`border rounded px-2 py-1 font-medium ${colorClass[color]}`}
      >
        <option value="green" className="text-green-600">緑</option>
        <option value="blue" className="text-blue-600">青</option>
        <option value="white" className="text-gray-400">白</option>
        <option value="black" className="text-gray-800">黒</option>
      </select>

      {/* 座標選択 */}
      <div className="flex items-center gap-1">
        <select
          value={col}
          onChange={(e) => setCol(parseInt(e.target.value))}
          className="border rounded px-1.5 py-1 w-12"
        >
          {columns.map((c, i) => (
            <option key={c} value={i}>{c}</option>
          ))}
        </select>
        <select
          value={row}
          onChange={(e) => setRow(parseInt(e.target.value))}
          className="border rounded px-1.5 py-1 w-12"
        >
          {rows.map((r) => (
            <option key={r} value={r - 1}>{r}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAdd}
        className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
      >
        追加
      </button>
    </div>
  );
}
