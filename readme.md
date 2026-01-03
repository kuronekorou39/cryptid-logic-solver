# Cryptid Logic Solver

ボードゲーム「クリプティッド」のヒント推論補助ツール。各プレイヤーのヒントを論理的に絞り込み、UMA（未確認生物）の居場所を特定する手助けをします。

## デモ

**[https://kuronekorou39.github.io/cryptid-logic-solver/](https://kuronekorou39.github.io/cryptid-logic-solver/)**

## 機能

- **マップビューア** - 6枚のタイルを配置し、ヘックスマップを表示。構造物の位置も設定可能
- **マーカー機能** - マップ上にdisc（いる可能性あり）/cube（いない）マーカーを配置
- **自動ヒント計算** - マーカーに基づいて矛盾しないヒントを自動で絞り込み
- **5プレイヤー固定** - シンボル（α〜ε）で識別、タップで参加/解除を切り替え
- **2つのゲームモード** - ノーマル（42ヒント）/ アドバンスト（67ヒント）対応
- **ヒントフィルター** - 地形アイコンでヒントをフィルタリング、OFF非表示オプション
- **自動保存** - localStorageによるゲーム状態の永続化
- **モバイル対応** - スマートフォンでも快適に操作可能

## 技術スタック

- [React](https://react.dev/) 18 - UIフレームワーク
- [TypeScript](https://www.typescriptlang.org/) 5.6 - 型安全性
- [Vite](https://vitejs.dev/) - ビルドツール
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング

## プロジェクト構成

```
src/
├── types/                 # 型定義
│   └── index.ts          # 全インターフェース・型
├── data/                  # ゲームデータ
│   ├── index.ts          # データエクスポート・ユーティリティ
│   ├── hints-normal.ts   # ノーマルモードのヒント（42件）
│   ├── hints-advanced.ts # アドバンストモードのヒント（25件）
│   ├── map-tiles.ts      # 6枚のマップタイルデータ
│   └── constants.ts      # 地形・構造物・動物・プレイヤーカラー定数
├── logic/                 # コアロジック
│   ├── elimination.ts    # ヒント評価・消去アルゴリズム
│   ├── possible-cells.ts # マップ上のヒント評価・自動計算
│   └── map-utils.ts      # ヘックスマップ座標計算（odd-q座標系）
├── context/               # 状態管理
│   └── GameContext.tsx   # React Context + Reducer
├── hooks/                 # カスタムフック
│   └── useGame.ts        # Context利用フック
├── components/            # UIコンポーネント
│   ├── Header.tsx        # ヘッダー（モード選択・リセット）
│   ├── GameBoard.tsx     # ヒント一覧・プレイヤータブ
│   ├── MapView.tsx       # マップ設定画面（タイル・構造物配置）
│   ├── HexMap.tsx        # ヘックスマップ描画・マーカー配置
│   └── Icons.tsx         # SVGアイコンコンポーネント
├── App.tsx                # ルートコンポーネント
├── main.tsx               # エントリーポイント
└── index.css              # グローバルスタイル
```

## 主要ファイル

| ファイル | 説明 |
|---------|------|
| [src/logic/elimination.ts](src/logic/elimination.ts) | ヒント評価・消去のコアアルゴリズム |
| [src/logic/possible-cells.ts](src/logic/possible-cells.ts) | マップ上でのヒント評価・自動計算 |
| [src/logic/map-utils.ts](src/logic/map-utils.ts) | ヘックスマップ座標計算（odd-q座標系） |
| [src/context/GameContext.tsx](src/context/GameContext.tsx) | ゲーム状態管理（Reducer パターン） |
| [src/data/hints-normal.ts](src/data/hints-normal.ts) | ノーマルモードの全42ヒント定義 |
| [src/data/hints-advanced.ts](src/data/hints-advanced.ts) | アドバンストモード追加25ヒント定義 |
| [src/data/map-tiles.ts](src/data/map-tiles.ts) | 6枚のマップタイルデータ |
| [src/components/HexMap.tsx](src/components/HexMap.tsx) | ヘックスマップ描画・マーカー配置 |

## ゲームロジック

### ヒント消去の仕組み

1. **手動モード**: マーカーを配置せず、ヒントを直接ON/OFFして絞り込み

2. **自動モード**: マーカーに基づいて矛盾しないヒントを自動計算
   - **disc（○）配置**: そのセルにいる可能性あり → そこでFALSEになるヒントを除外
   - **cube（×）配置**: そのセルにいない → そこでTRUEになるヒントを除外

### ヒントの種類

| カテゴリ | 例 |
|---------|-----|
| 地形 | 「森林か砂漠にいる」「山岳から1マス以内」「水辺にいない」 |
| 構造物 | 「青の構造物から2マス以内」「巨石から2マス以内」「廃墟から3マス以内」 |
| 動物 | 「クマの縄張り内」「ワシから2マス以内」「いずれかの動物の縄張り内」 |

### 座標系

ヘックスマップはodd-q座標系（オフセット座標）を使用：
- 列（q）: 0〜8（左から右）
- 行（r）: 0〜5（上から下）
- 奇数列は0.5マス下にずれる

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# プレビュー
npm run preview
```

## 使い方

1. **モード選択** - ヘッダーでノーマル or アドバンストを選択
2. **マップ設定** - 「マップ」タブで6枚のタイルを配置（数字と反転を設定）
3. **構造物配置** - マップ上で構造物の位置を設定
4. **プレイヤー参加** - α〜εタブをタップして参加プレイヤーを有効化
5. **マーカー配置** - 「マップ」タブで各プレイヤーのdisc/cubeマーカーを配置
6. **ヒント確認** - 「ヒント」タブで自動計算された候補を確認
7. **繰り返し** - UMAの居場所が特定できるまで続ける

## ライセンス

MIT
