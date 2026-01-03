// ========================================
// 基本型定義
// ========================================

/** 地形タイプ */
export type TerrainType = 'forest' | 'desert' | 'swamp' | 'mountain' | 'water';

/** 構造物の色 */
export type StructureColor = 'white' | 'black' | 'green' | 'blue';

/** 構造物タイプ */
export type StructureType = 'standing_stone' | 'shack';

/** 動物タイプ */
export type AnimalType = 'bear' | 'cougar';

/** プレイヤーカラー */
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

/** ゲームモード */
export type GameMode = 'normal' | 'advanced';

// ========================================
// ヒント関連
// ========================================

/** ヒントカテゴリ */
export type HintCategory = 'terrain' | 'structure' | 'animal';

/** ヒント条件 */
export interface HintCondition {
  // 地形条件（複数指定時はOR）
  terrains?: TerrainType[];

  // 構造物条件
  structureColors?: StructureColor[]; // 特定色（複数指定時はOR）
  structureTypes?: StructureType[]; // 構造物タイプ（巨石/廃墟）
  anyStructure?: boolean; // いずれかの構造物

  // 動物条件
  animals?: AnimalType[]; // 特定動物（複数指定時はOR）
  anyAnimal?: boolean; // いずれかの動物

  // 距離（0 = その上、1 = 1マス以内、2 = 2マス以内、3 = 3マス以内）
  range: number;

  // 否定条件（〜にいない）
  negated?: boolean;
}

/** ヒント */
export interface Hint {
  id: string;
  text: string; // 日本語テキスト
  mode: GameMode;
  category: HintCategory;
  condition: HintCondition;
}

// ========================================
// マス関連
// ========================================

/** マス情報（ヒント評価用） */
export interface CellInfo {
  terrain: TerrainType;
  structureColor: StructureColor | null;
  structureType: StructureType | null;
  nearStructures: { type: StructureType; color: StructureColor; distance: number }[];
  animalTerritory: AnimalType | null;
  nearAnimals: { animal: AnimalType; distance: number }[];
}

// ========================================
// プレイヤー関連
// ========================================

/** プレイヤーアクション */
export interface PlayerAction {
  id: string;
  playerId: string;
  type: 'cube' | 'disc'; // NO or YES
  coordinate: string;
  cellInfo: CellInfo;
  timestamp: number;
}

/** プレイヤーシンボル */
export type PlayerSymbol = 'α' | 'β' | 'γ' | 'δ' | 'ε';

/** プレイヤー */
export interface Player {
  id: string;
  symbol: PlayerSymbol;
  name: string;  // カスタム名（空文字の場合はシンボルを表示）
  color: PlayerColor;
  enabled: boolean;  // このプレイヤーを使用するか
  possibleHintIds: string[]; // 可能性のあるヒントIDリスト
  confirmedHintId: string | null;  // 確定したヒントID（nullは未確定）
}

// ========================================
// マップ設定
// ========================================

/** タイル配置 */
export interface TileConfig {
  tileId: number | null;  // null = 未設定
  reversed: boolean;
}

/** 構造物座標 */
export interface StructureCoord {
  col: number;
  row: number;
}

/** マップ設定 */
export interface MapSettings {
  tiles: TileConfig[];
  structureCoords: Record<string, StructureCoord | null>;
}

/** プレイヤーマーカータイプ */
export type MarkerType = 'disc' | 'cube';  // disc=いる可能性あり(〇), cube=いない(×)

/** プレイヤーマーカー（playerId -> cellKey -> MarkerType） */
export type PlayerMarkers = Record<string, Record<string, MarkerType>>;

// ========================================
// ゲーム状態
// ========================================

/** ゲーム状態 */
export interface GameState {
  mode: GameMode;
  players: Player[];
  actions: PlayerAction[];
  mapSettings: MapSettings;
  playerMarkers: PlayerMarkers;  // プレイヤーごとのマーカー配置
  autoMode: boolean;  // 自動モード: マーカーに基づいてヒントを自動計算
  selfPlayerId: string | null;  // 「自分」のプレイヤーID
  createdAt: number;
  updatedAt: number;
}
