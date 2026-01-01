# Cryptid Logic Solver

ボードゲーム「クリプティッド」のヒント推論補助ツール。各プレイヤーのヒントを論理的に絞り込み、UMA（未確認生物）の居場所を特定する手助けをします。

## デモ

**[https://kuronekorou39.github.io/cryptid-logic-solver/](https://kuronekorou39.github.io/cryptid-logic-solver/)**

## 機能

- **ヒント消去エンジン** - キューブ（NO）/ディスク（YES）の配置に基づき、不可能なヒントを自動消去
- **2つのゲームモード** - ノーマル（42ヒント）/ アドバンスト（67ヒント）対応
- **プレイヤー管理** - 3〜5人のプレイヤーをカラーで識別
- **アクション履歴** - 全アクションを記録、取り消し機能付き
- **進捗表示** - 各プレイヤーのヒント絞り込み状況をプログレスバーで可視化
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
│   ├── index.ts          # データエクスポート
│   ├── hints-normal.ts   # ノーマルモードのヒント（42件）
│   ├── hints-advanced.ts # アドバンストモードのヒント（25件）
│   └── constants.ts      # 地形・構造物・動物の定数
├── logic/                 # コアロジック
│   └── elimination.ts    # ヒント評価・消去アルゴリズム
├── context/               # 状態管理
│   └── GameContext.tsx   # React Context + Reducer
├── hooks/                 # カスタムフック
│   └── useGame.ts        # Context利用フック
├── components/            # UIコンポーネント
│   ├── Header.tsx            # ヘッダー
│   ├── GameSetup.tsx         # ゲーム設定画面
│   ├── GameBoard.tsx         # メインゲーム画面
│   ├── PlayerCard.tsx        # プレイヤーカード
│   ├── ActionInputForm.tsx   # アクション入力フォーム
│   ├── PlayerDetailModal.tsx # ヒント詳細モーダル
│   └── ActionHistory.tsx     # アクション履歴
├── App.tsx                # ルートコンポーネント
├── main.tsx               # エントリーポイント
└── index.css              # グローバルスタイル
```

## 主要ファイル

| ファイル | 説明 |
|---------|------|
| [src/logic/elimination.ts](src/logic/elimination.ts) | ヒント評価・消去のコアアルゴリズム |
| [src/context/GameContext.tsx](src/context/GameContext.tsx) | ゲーム状態管理（Reducer パターン） |
| [src/data/hints-normal.ts](src/data/hints-normal.ts) | ノーマルモードの全42ヒント定義 |
| [src/data/hints-advanced.ts](src/data/hints-advanced.ts) | アドバンストモード追加25ヒント定義 |
| [src/components/ActionInputForm.tsx](src/components/ActionInputForm.tsx) | マス情報入力UI |
| [src/components/PlayerDetailModal.tsx](src/components/PlayerDetailModal.tsx) | プレイヤーのヒント一覧表示 |

## ゲームロジック

### ヒント消去の仕組み

1. **キューブ配置（NO）**: プレイヤーが「UMAはここにいない」と宣言
   - そのマスで**成立するヒント**を候補から除外（持っていたらYESと答えるはずだから）

2. **ディスク配置（YES）**: プレイヤーが「UMAがいる可能性がある」と宣言
   - そのマスで**成立しないヒント**を候補から除外（持っていたらNOと答えるはずだから）

### ヒントの種類

| カテゴリ | 例 |
|---------|-----|
| 地形 | 「森林か砂漠にいる」「山岳から1マス以内」 |
| 構造物 | 「青い建造物から2マス以内」「廃墟から3マス以内」 |
| 動物 | 「クマの縄張り内」「ピューマから2マス以内」 |

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

1. **ゲームモード選択** - ノーマル or アドバンスト
2. **プレイヤー登録** - 3〜5人のプレイヤーを色で登録
3. **ゲーム開始**
4. **アクション入力** - キューブ/ディスクを置いたマスの情報を入力
5. **ヒント確認** - プレイヤーカードをタップして残りのヒント候補を確認
6. **繰り返し** - UMAの居場所が特定できるまで続ける

## ライセンス

MIT
