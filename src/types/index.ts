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

/** マスの構造物情報 */
export interface CellStructure {
  type: StructureType;
  color: StructureColor;
}

/** マス */
export interface Cell {
  coordinate: string; // 例: "A1", "B3"
  row: number; // 0-8 (1-9に対応)
  col: number; // 0-5 (A-Fに対応)
  terrain: TerrainType;
  structure: CellStructure | null;
  animalTerritory: AnimalType | null;
}

/** マス情報（入力用の簡易版） */
export interface CellInfo {
  terrain: TerrainType;
  structureColor: StructureColor | null;
  nearStructures: { color: StructureColor; distance: number }[];
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

/** プレイヤー */
export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  possibleHintIds: string[]; // 可能性のあるヒントIDリスト
}

// ========================================
// ゲーム状態
// ========================================

/** ゲーム状態 */
export interface GameState {
  mode: GameMode;
  players: Player[];
  actions: PlayerAction[];
  createdAt: number;
  updatedAt: number;
}

// ========================================
// UI用の定数
// ========================================

/** 地形の表示情報 */
export interface TerrainInfo {
  type: TerrainType;
  label: string;
  color: string; // Tailwind用
}

/** 構造物の表示情報 */
export interface StructureInfo {
  color: StructureColor;
  label: string;
  cssColor: string;
}

/** 動物の表示情報 */
export interface AnimalInfo {
  type: AnimalType;
  label: string;
  emoji: string;
}
