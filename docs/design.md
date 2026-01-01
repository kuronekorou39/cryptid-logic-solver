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
- 6x9のヘックスマップ上でUMA（未確認生物）の居場所を推理
- 各プレイヤーは1つの秘密のヒントを持つ
- 全員のヒント条件を満たす唯一のマスがUMAの居場所

### 2.2 マスの属性
| 属性 | 種類 |
|------|------|
| 地形 | 森林、砂漠、沼地、山岳、水域 |
| 構造物 | 廃墟（黒/白）、巨石（青/緑）、なし |
| 動物の縄張り | クマ、クーガー |

### 2.3 ヒントの種類（ノーマルモード）
1. **地形系**: 「○○地形にいる」「○○地形から1マス以内」
2. **構造物系**: 「○色の構造物から○マス以内」
3. **動物系**: 「○○の縄張り内にいる」「どちらかの動物の縄張り内」
4. **複合系**: 「○○か△△にいる」

### 2.4 ゲーム中のアクション
- **質問**: 他プレイヤーに特定のマスを指定し「UMAはここにいるか？」と質問
- **キューブ（NO）**: そのマスにUMAはいない → そのヒントでは成立しない
- **ディスク（YES）**: そのマスにUMAがいる可能性あり → そのヒントで成立する

---

## 3. データモデル設計

### 3.1 ヒント (Hint)

```typescript
type TerrainType = 'forest' | 'desert' | 'swamp' | 'mountain' | 'water';
type StructureColor = 'black' | 'white' | 'blue' | 'green';
type AnimalType = 'bear' | 'cougar';

interface HintCondition {
  // 地形条件
  terrains?: TerrainType[];
  terrainRange?: number; // 0 = その地形上、1 = 1マス以内、2 = 2マス以内

  // 構造物条件
  structureColors?: StructureColor[];
  structureRange?: number;
  anyStructure?: boolean; // いずれかの構造物

  // 動物条件
  animals?: AnimalType[];
  anyAnimal?: boolean; // いずれかの動物
}

interface Hint {
  id: string;
  text: string;           // 日本語テキスト
  textEn: string;         // 英語テキスト（オプション）
  mode: 'normal' | 'hard';
  category: 'terrain' | 'structure' | 'animal' | 'composite';
  condition: HintCondition;
}
```

### 3.2 マス (Cell)

```typescript
interface Cell {
  coordinate: string;     // 例: "A1", "B3"
  row: number;            // 0-8
  col: number;            // 0-5
  terrain: TerrainType;
  structure: {
    type: 'ruin' | 'standing_stone' | null;
    color: StructureColor | null;
  };
  animalTerritory: AnimalType | null;
}
```

### 3.3 マップ (GameMap)

```typescript
interface GameMap {
  id: string;
  tiles: MapTile[];       // 6枚のタイル構成
  cells: Cell[];          // 全54マス (6x9)
}

interface MapTile {
  tileId: string;         // タイルID (1-6)
  position: number;       // 配置位置 (0-5)
  flipped: boolean;       // 裏面かどうか
}
```

### 3.4 プレイヤー (Player)

```typescript
interface Player {
  id: string;
  name: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  possibleHints: string[]; // 可能性のあるヒントIDリスト
  actions: PlayerAction[]; // このプレイヤーの行動履歴
}

interface PlayerAction {
  id: string;
  type: 'cube' | 'disc';  // NO or YES
  coordinate: string;
  timestamp: number;
}
```

### 3.5 ゲーム状態 (GameState)

```typescript
interface GameState {
  id: string;
  mode: 'normal' | 'hard';
  players: Player[];
  map: GameMap | null;    // マップ設定（オプション）
  actions: GameAction[];  // 全行動履歴
  createdAt: number;
  updatedAt: number;
}

interface GameAction {
  id: string;
  playerId: string;
  type: 'cube' | 'disc';
  coordinate: string;
  cellInfo: CellInfo;     // そのマスの属性情報
  timestamp: number;
}

interface CellInfo {
  terrain: TerrainType;
  structure: StructureColor | null;
  nearStructures: { color: StructureColor; distance: number }[];
  animalTerritory: AnimalType | null;
  nearAnimals: { animal: AnimalType; distance: number }[];
}
```

---

## 4. 論理消去エンジン設計

### 4.1 コア機能

#### 4.1.1 ヒント評価関数
マスの属性情報とヒントを受け取り、そのヒントが成立するかを判定。

```typescript
function evaluateHint(hint: Hint, cellInfo: CellInfo): boolean {
  // ヒントの条件に基づいて成立判定
  // true = このマスでヒント成立（UMAがいる可能性あり）
  // false = このマスでヒント不成立（UMAはいない）
}
```

#### 4.1.2 消去ロジック
```
キューブ（NO）が置かれた場合:
  そのマスで「成立する」ヒント → 候補から除外
  理由: NOと答えた = そのヒントでは成立しないはず

ディスク（YES）が置かれた場合:
  そのマスで「成立しない」ヒント → 候補から除外
  理由: YESと答えた = そのヒントで成立するはず
```

#### 4.1.3 消去実行関数

```typescript
function eliminateHints(
  player: Player,
  action: PlayerAction,
  cellInfo: CellInfo,
  allHints: Hint[]
): string[] {
  return player.possibleHints.filter(hintId => {
    const hint = allHints.find(h => h.id === hintId);
    if (!hint) return false;

    const isMatch = evaluateHint(hint, cellInfo);

    if (action.type === 'cube') {
      // NO → 成立するヒントを除外
      return !isMatch;
    } else {
      // YES → 成立しないヒントを除外
      return isMatch;
    }
  });
}
```

### 4.2 距離計算

ヘックスマップの距離計算にはキューブ座標系を使用。

```typescript
function hexDistance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

interface HexCoord {
  q: number;
  r: number;
  s: number; // q + r + s = 0
}
```

---

## 5. UI/UX コンポーネント設計

### 5.1 画面構成

```
┌─────────────────────────────────────┐
│           Header                     │
│  [タイトル]              [リセット]   │
├─────────────────────────────────────┤
│                                     │
│        Player Dashboard             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ P1  │ │ P2  │ │ P3  │ │ P4  │   │
│  │ 12  │ │ 8   │ │ 5   │ │ 10  │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│        Action Input Form            │
│  [プレイヤー選択] [座標入力]         │
│  [地形] [構造物] [動物]             │
│  [キューブ] [ディスク]               │
│                                     │
├─────────────────────────────────────┤
│                                     │
│        Action History               │
│  - P2: A3にキューブ (森林)           │
│  - P1: B5にディスク (砂漠, 青巨石)   │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 コンポーネント階層

```
App
├── Header
│   ├── Logo
│   └── ResetButton
├── GameSetup (初期画面)
│   ├── ModeSelector (ノーマル/ハード)
│   └── PlayerSetup
├── GameBoard (メイン画面)
│   ├── PlayerDashboard
│   │   └── PlayerCard (複数)
│   │       ├── PlayerName
│   │       ├── HintCount
│   │       └── ProgressBar
│   ├── ActionInputForm
│   │   ├── PlayerSelector
│   │   ├── CoordinateInput
│   │   ├── TerrainSelector
│   │   ├── StructureSelector
│   │   ├── AnimalSelector
│   │   └── ActionButtons (Cube/Disc)
│   └── ActionHistory
│       └── ActionItem (複数)
├── PlayerDetailModal
│   ├── HintList
│   │   └── HintItem (複数)
│   └── ManualToggle
└── Footer
```

### 5.3 主要コンポーネント詳細

#### PlayerCard
```typescript
interface PlayerCardProps {
  player: Player;
  totalHints: number;
  onClick: () => void;
}
```
- 残りヒント数を表示
- プログレスバーで絞り込み進捗を可視化
- タップで詳細モーダルを開く

#### ActionInputForm
```typescript
interface ActionInputFormProps {
  players: Player[];
  onSubmit: (action: GameAction) => void;
}
```
- 座標入力（A-F, 1-9 のセレクタ）
- マス属性の選択UI
- キューブ/ディスクボタン

#### PlayerDetailModal
```typescript
interface PlayerDetailModalProps {
  player: Player;
  hints: Hint[];
  onToggleHint: (hintId: string) => void;
  onClose: () => void;
}
```
- 残りヒント一覧（チェックボックス付き）
- 手動での候補操作が可能

---

## 6. ファイル構成

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Select.tsx
│   ├── game/
│   │   ├── ActionHistory.tsx
│   │   ├── ActionInputForm.tsx
│   │   ├── CoordinateInput.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── PlayerDashboard.tsx
│   │   └── PlayerDetailModal.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── setup/
│       ├── GameSetup.tsx
│       ├── ModeSelector.tsx
│       └── PlayerSetup.tsx
├── data/
│   ├── hints-normal.ts        # ノーマルモードヒント
│   ├── hints-hard.ts          # ハードモードヒント
│   └── index.ts
├── hooks/
│   ├── useGame.ts             # ゲーム状態管理
│   ├── useHintElimination.ts  # 消去ロジック
│   └── useLocalStorage.ts     # 永続化
├── logic/
│   ├── elimination.ts         # 消去エンジン
│   ├── evaluation.ts          # ヒント評価
│   └── hex.ts                 # ヘックス座標計算
├── types/
│   ├── game.ts
│   ├── hint.ts
│   └── player.ts
├── context/
│   └── GameContext.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## 7. 状態管理設計

### 7.1 GameContext

```typescript
interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;

  // 便利なヘルパー
  addPlayer: (name: string, color: PlayerColor) => void;
  removePlayer: (playerId: string) => void;
  recordAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  undoLastAction: () => void;
  resetGame: () => void;

  // 計算プロパティ
  getPlayerHints: (playerId: string) => Hint[];
  getRemainingHintCount: (playerId: string) => number;
}
```

### 7.2 Reducer Actions

```typescript
type GameReducerAction =
  | { type: 'SET_MODE'; payload: 'normal' | 'hard' }
  | { type: 'ADD_PLAYER'; payload: Omit<Player, 'id' | 'possibleHints' | 'actions'> }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'RECORD_ACTION'; payload: GameAction }
  | { type: 'UNDO_ACTION' }
  | { type: 'TOGGLE_HINT'; payload: { playerId: string; hintId: string } }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_STATE'; payload: GameState };
```

---

## 8. MVP機能一覧

### Phase 1: 基本機能
- [ ] プロジェクトセットアップ（Vite + React + TypeScript + Tailwind）
- [ ] ヒントデータベース作成（ノーマルモード）
- [ ] プレイヤー登録UI
- [ ] マス情報入力フォーム
- [ ] 論理消去エンジン実装
- [ ] プレイヤーダッシュボード
- [ ] ヒント詳細モーダル

### Phase 2: UX改善
- [ ] 行動履歴表示
- [ ] Undo機能
- [ ] LocalStorage永続化
- [ ] レスポンシブ対応

### Phase 3: 拡張機能
- [ ] ハードモードヒント追加
- [ ] マップタイル対応（自動属性取得）
- [ ] 統計情報表示

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

1. **マップビジュアライザー**: 実際のマップを表示し、クリックでマス選択
2. **AI推論アシスト**: 最も情報量の多い質問を提案
3. **複数言語対応**: 英語UI
4. **PWA化**: オフライン完全対応
5. **ゲーム履歴エクスポート**: JSON形式で保存/読み込み
