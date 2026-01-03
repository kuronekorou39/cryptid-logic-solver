# クリプティッド論理ソルバー 設計書

## 1. プロジェクト概要

### 1.1 目的
ボードゲーム「クリプティッド」のプレイ中に、他プレイヤーが持つヒント（手がかり）を論理的に絞り込むための補助ツール。

### 1.2 ターゲットユーザー
- クリプティッドをプレイ中のプレイヤー
- 論理的推理を効率化したい人

### 1.3 動作環境
- **プラットフォーム**: Webブラウザ（PC/スマホ両対応）
- **公開形式**: GitHub Pages（静的サイト）
- **オフライン対応**: 不要（静的サイトのため基本的に対応可能）

### 1.4 技術スタック
| 項目 | 技術 |
|------|------|
| フレームワーク | React 18+ |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| ビルドツール | Vite |
| デプロイ | GitHub Pages |
| 状態管理 | React Context + useReducer |

---

## 2. クリプティッド ゲームシステム概要

### 2.1 ゲームの基本
- 9x6のヘックスマップ上でUMA（未確認生物）の居場所を推理
- 各プレイヤーは1つの秘密のヒントを持つ
- 全員のヒント条件を満たす唯一のマスがUMAの居場所

### 2.2 マスの属性
| 属性 | 種類 |
|------|------|
| 地形 | 森林、砂漠、沼地、山岳、水辺 |
| 構造物 | 巨石（青/緑）、廃墟（白/黒）、なし |
| 動物の縄張り | クマ、ワシ |

### 2.3 ヒントの種類（ノーマルモード: 42件）
1. **地形系**: 「○○地形にいる」「○○地形から1マス以内」「○○地形にいない」
2. **構造物系**: 「○色の構造物から○マス以内」「巨石/廃墟から○マス以内」
3. **動物系**: 「○○の縄張り内にいる」「どちらかの動物の縄張り内」「○○から○マス以内」

### 2.4 ゲーム中のアクション
- **質問**: 他プレイヤーに特定のマスを指定し「UMAはここにいるか？」と質問
- **disc（○）**: そのマスにUMAがいる可能性あり → そのヒントで成立する
- **cube（×）**: そのマスにUMAはいない → そのヒントでは成立しない

---

## 3. データモデル設計

### 3.1 基本型

```typescript
/** 地形タイプ */
type TerrainType = 'forest' | 'desert' | 'swamp' | 'mountain' | 'water';

/** 構造物の色 */
type StructureColor = 'white' | 'black' | 'green' | 'blue';

/** 構造物タイプ */
type StructureType = 'standing_stone' | 'shack';

/** 動物タイプ */
type AnimalType = 'bear' | 'cougar';

/** プレイヤーカラー */
type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

/** ゲームモード */
type GameMode = 'normal' | 'advanced';

/** プレイヤーシンボル */
type PlayerSymbol = 'α' | 'β' | 'γ' | 'δ' | 'ε';

/** マーカータイプ */
type MarkerType = 'disc' | 'cube';  // disc=いる可能性あり(○), cube=いない(×)
```

### 3.2 ヒント (Hint)

```typescript
type HintCategory = 'terrain' | 'structure' | 'animal';

interface HintCondition {
  // 地形条件（複数指定時はOR）
  terrains?: TerrainType[];

  // 構造物条件
  structureColors?: StructureColor[]; // 特定色（複数指定時はOR）
  structureTypes?: StructureType[];   // 構造物タイプ（巨石/廃墟）
  anyStructure?: boolean;             // いずれかの構造物

  // 動物条件
  animals?: AnimalType[];             // 特定動物（複数指定時はOR）
  anyAnimal?: boolean;                // いずれかの動物

  // 距離（0 = その上、1 = 1マス以内、2 = 2マス以内、3 = 3マス以内）
  range: number;

  // 否定条件（〜にいない）
  negated?: boolean;
}

interface Hint {
  id: string;
  text: string;           // 日本語テキスト
  mode: GameMode;
  category: HintCategory;
  condition: HintCondition;
}
```

### 3.3 マス情報 (CellInfo)

```typescript
/** マス情報（ヒント評価用） */
interface CellInfo {
  terrain: TerrainType;
  structureColor: StructureColor | null;
  structureType: StructureType | null;
  nearStructures: { type: StructureType; color: StructureColor; distance: number }[];
  animalTerritory: AnimalType | null;
  nearAnimals: { animal: AnimalType; distance: number }[];
}
```

### 3.4 マップ設定 (MapSettings)

```typescript
/** タイル配置 */
interface TileConfig {
  tileId: number | null;  // null = 未設定
  reversed: boolean;
}

/** 構造物座標 */
interface StructureCoord {
  col: number;
  row: number;
}

/** マップ設定 */
interface MapSettings {
  tiles: TileConfig[];                              // 6枚のタイル
  structureCoords: Record<string, StructureCoord | null>;  // 8つの構造物の座標
}
```

### 3.5 プレイヤー (Player)

```typescript
/** プレイヤーアクション */
interface PlayerAction {
  id: string;
  playerId: string;
  type: 'cube' | 'disc';  // NO or YES
  coordinate: string;
  cellInfo: CellInfo;
  timestamp: number;
}

/** プレイヤー */
interface Player {
  id: string;
  symbol: PlayerSymbol;
  name: string;                    // カスタム名（空文字の場合はシンボルを表示）
  color: PlayerColor;
  enabled: boolean;                // このプレイヤーを使用するか
  possibleHintIds: string[];       // 可能性のあるヒントIDリスト
}
```

### 3.6 ゲーム状態 (GameState)

```typescript
/** プレイヤーマーカー（playerId -> cellKey -> MarkerType） */
type PlayerMarkers = Record<string, Record<string, MarkerType>>;

/** ゲーム状態 */
interface GameState {
  mode: GameMode;
  players: Player[];                // 5人固定
  actions: PlayerAction[];
  mapSettings: MapSettings;
  playerMarkers: PlayerMarkers;     // プレイヤーごとのマーカー配置
  autoMode: boolean;                // 自動モード: マーカーに基づいてヒントを自動計算
  createdAt: number;
  updatedAt: number;
}
```

---

## 4. 論理消去エンジン設計

### 4.1 手動モード: ヒント評価関数

マスの属性情報とヒントを受け取り、そのヒントが成立するかを判定。

```typescript
function evaluateHint(hint: Hint, cellInfo: CellInfo): boolean {
  // ヒントの条件に基づいて成立判定
  // true = このマスでヒント成立（UMAがいる可能性あり）
  // false = このマスでヒント不成立（UMAはいない）
}
```

### 4.2 手動モード: 消去ロジック

```
キューブ（NO）が置かれた場合:
  そのマスで「成立する」ヒント → 候補から除外
  理由: NOと答えた = そのヒントでは成立しないはず

ディスク（YES）が置かれた場合:
  そのマスで「成立しない」ヒント → 候補から除外
  理由: YESと答えた = そのヒントで成立するはず
```

### 4.3 自動モード: マーカーベースのヒント計算

マップ上のマーカー配置に基づいて、矛盾しないヒントを自動計算。

```typescript
function calculateConsistentHints(
  tiles: TileConfig[],
  structureCoords: Record<string, StructureCoord | null>,
  markers: Record<string, MarkerType>,  // cellKey -> MarkerType
  mode: GameMode
): string[] {
  // 各ヒントがマーカーと矛盾しないかチェック
  // disc（○）があるセル → そのセルでFALSEになるヒントを除外
  // cube（×）があるセル → そのセルでTRUEになるヒントを除外
  // 全マーカーと矛盾しないヒントIDを返す
}
```

### 4.4 マップ上でのヒント評価

```typescript
function evaluateHintOnMap(
  hint: Hint,
  grid: MapGrid,
  col: number,
  row: number
): boolean {
  // マップグリッドを使用して、特定セルでヒントが成立するかを評価
  // 距離計算はヘックスマップの座標系（odd-q）を使用
}
```

### 4.5 距離計算（odd-q座標系）

ヘックスマップの距離計算にはodd-q座標系を使用。

```typescript
// odd-qオフセット座標からキューブ座標へ変換
function offsetToCube(col: number, row: number): { q: number; r: number; s: number } {
  const q = col
  const r = row - (col - (col & 1)) / 2
  const s = -q - r
  return { q, r, s }
}

// キューブ座標間の距離
function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2
}

// オフセット座標間の距離
function hexDistance(col1: number, row1: number, col2: number, row2: number): number {
  const a = offsetToCube(col1, row1)
  const b = offsetToCube(col2, row2)
  return cubeDistance(a, b)
}
```

---

## 5. UI/UX コンポーネント設計

### 5.1 画面構成

```
┌─────────────────────────────────────┐
│           Header                     │
│  [タイトル] [ノーマル/アドバンスト]  [リセット]  │
├─────────────────────────────────────┤
│                                     │
│     [マップ] [ヒント] タブ切り替え    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  【マップタブ】                      │
│  ┌─────────────────────────────┐    │
│  │  タイル設定 (6枚)             │    │
│  │  [1▼] [2▼] [3▼]              │    │
│  │  [4▼] [5▼] [6▼]              │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  構造物配置 (8個)             │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  ヘックスマップ表示           │    │
│  │  (マーカー配置可能)           │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  【ヒントタブ】                      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │  α  │ │  β  │ │  γ  │ │  δ  │ │  ε  │  │
│  │ 12  │ │ 8   │ │ 5   │ │ 10  │ │ OFF │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  [自動] [OFF非表示] オプション       │
│                                     │
│  地形カテゴリ                        │
│  ├─ 森林か砂漠にいる [ON/OFF]        │
│  ├─ 森林から1マス以内 [ON/OFF]       │
│  └─ ...                             │
│                                     │
│  構造物カテゴリ                      │
│  └─ ...                             │
│                                     │
│  動物カテゴリ                        │
│  └─ ...                             │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 コンポーネント階層

```
App
├── Header
│   ├── タイトル
│   ├── ModeSelector (ノーマル/アドバンスト)
│   └── ResetButton
├── タブ切り替え (マップ/ヒント)
├── MapView (マップタブ)
│   ├── TileSettings (6枚のタイル設定)
│   ├── StructureSettings (8つの構造物配置)
│   ├── PlayerMarkerSelector (プレイヤー選択)
│   └── HexMap (ヘックスマップ描画)
│       └── HexCell (各セル、マーカー表示)
└── GameBoard (ヒントタブ)
    ├── PlayerTabs (5人のプレイヤータブ)
    ├── OptionsBar (自動モード、OFF非表示)
    └── HintList (カテゴリ別ヒント一覧)
        └── HintItem (個別ヒント、トグル)
```

---

## 6. ファイル構成

```
src/
├── components/
│   ├── Header.tsx            # ヘッダー（モード選択・リセット）
│   ├── GameBoard.tsx         # ヒント一覧・プレイヤータブ
│   ├── MapView.tsx           # マップ設定画面（タイル・構造物配置）
│   ├── HexMap.tsx            # ヘックスマップ描画・マーカー配置
│   └── Icons.tsx             # SVGアイコンコンポーネント
├── data/
│   ├── hints-normal.ts       # ノーマルモードヒント（42件）
│   ├── hints-advanced.ts     # アドバンストモードヒント（25件）
│   ├── map-tiles.ts          # マップタイルデータ（6枚）
│   ├── constants.ts          # プレイヤーカラー等の定数
│   └── index.ts              # エクスポート・ユーティリティ関数
├── hooks/
│   └── useGame.ts            # GameContext利用フック
├── logic/
│   ├── elimination.ts        # ヒント評価・消去エンジン（手動モード用）
│   ├── possible-cells.ts     # マップ上ヒント評価（自動モード用）
│   └── map-utils.ts          # ヘックスマップ座標計算
├── types/
│   └── index.ts              # 全型定義
├── context/
│   └── GameContext.tsx       # React Context + Reducer
├── App.tsx
├── main.tsx
└── index.css
```

---

## 7. 状態管理設計

### 7.1 GameContext

```typescript
interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameReducerAction>

  // Helper functions
  setMode: (mode: GameMode) => void
  togglePlayer: (playerId: string) => void
  setPlayerName: (playerId: string, name: string) => void
  startGame: () => void
  recordAction: (playerId: string, type: 'cube' | 'disc', coordinate: string, cellInfo: CellInfo) => void
  undoAction: () => void
  toggleHint: (playerId: string, hintId: string) => void
  resetGame: () => void

  // Map settings
  setTiles: (tiles: TileConfig[], changedIndex: number) => void
  setStructureCoord: (id: string, coord: StructureCoord | null) => void

  // Markers
  setMarker: (playerId: string, cellKey: string, markerType: MarkerType | null) => void

  // Auto mode
  toggleAutoMode: () => void
}
```

### 7.2 Reducer Actions

```typescript
type GameReducerAction =
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'TOGGLE_PLAYER'; payload: string }
  | { type: 'SET_PLAYER_NAME'; payload: { playerId: string; name: string } }
  | { type: 'START_GAME' }
  | { type: 'RECORD_ACTION'; payload: Omit<PlayerAction, 'id' | 'timestamp'> }
  | { type: 'UNDO_ACTION' }
  | { type: 'TOGGLE_HINT'; payload: { playerId: string; hintId: string } }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'SET_TILES'; payload: { tiles: TileConfig[]; changedIndex: number } }
  | { type: 'SET_STRUCTURE_COORD'; payload: { id: string; coord: StructureCoord | null } }
  | { type: 'SET_MARKER'; payload: { playerId: string; cellKey: string; markerType: MarkerType | null } }
  | { type: 'TOGGLE_AUTO_MODE' }
  | { type: 'RECALCULATE_HINTS'; payload: { playerId: string } }
```

---

## 8. 実装済み機能

### Phase 1: 基本機能
- [x] プロジェクトセットアップ（Vite + React + TypeScript + Tailwind）
- [x] ヒントデータベース作成（ノーマルモード 42件）
- [x] ヒントデータベース作成（アドバンストモード 25件追加）
- [x] 5人固定プレイヤー（シンボルα〜ε）
- [x] 論理消去エンジン実装
- [x] ヒント一覧表示（カテゴリ別、トグルUI）
- [x] LocalStorage永続化
- [x] レスポンシブ対応

### Phase 2: マップ機能
- [x] マップタイルデータ（6枚）
- [x] タイル配置設定UI
- [x] 構造物配置設定UI
- [x] ヘックスマップビューア（odd-q座標系）
- [x] マーカー配置機能（disc/cube）
- [x] 自動モード（マーカーに基づくヒント自動計算）

### Phase 3: UX改善
- [x] ヒントフィルター（地形アイコン）
- [x] OFF非表示オプション
- [x] ヒントテキストのカラーリング
- [x] プレイヤー参加/解除のワンタップ切り替え

---

## 9. 非機能要件

### 9.1 パフォーマンス
- 初期読み込み: 3秒以内
- アクション反映: 100ms以内

### 9.2 アクセシビリティ
- キーボード操作対応
- スクリーンリーダー対応（基本レベル）
- コントラスト比 4.5:1 以上

### 9.3 ブラウザ対応
- Chrome (最新2バージョン)
- Safari (最新2バージョン)
- Firefox (最新2バージョン)
- Edge (最新2バージョン)

---

## 10. 今後の拡張案

1. **候補セル可視化**: 全プレイヤーのヒント交差による候補マスをマップ上にハイライト
2. **AI推論アシスト**: 最も情報量の多い質問を提案
3. **複数言語対応**: 英語UI
4. **PWA化**: オフライン完全対応
5. **ゲーム履歴エクスポート**: JSON形式で保存/読み込み
