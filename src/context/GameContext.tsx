import { createContext, useReducer, useEffect, type ReactNode } from 'react'
import type { GameState, Player, PlayerAction, GameMode, CellInfo, TileConfig, StructureCoord } from '../types'
import { getAllHintIds, PLAYER_COLORS } from '../data'
import { eliminateHints } from '../logic/elimination'

// ========================================
// Actions
// ========================================

type GameReducerAction =
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'TOGGLE_PLAYER'; payload: string }  // playerId
  | { type: 'SET_PLAYER_NAME'; payload: { playerId: string; name: string } }
  | { type: 'START_GAME' }
  | { type: 'RECORD_ACTION'; payload: Omit<PlayerAction, 'id' | 'timestamp'> }
  | { type: 'UNDO_ACTION' }
  | { type: 'TOGGLE_HINT'; payload: { playerId: string; hintId: string } }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'SET_TILES'; payload: { tiles: TileConfig[]; changedIndex: number } }
  | { type: 'SET_STRUCTURE_COORD'; payload: { id: string; coord: StructureCoord | null } }

// ========================================
// Initial State
// ========================================

const DEFAULT_TILES: TileConfig[] = [
  { tileId: null, reversed: false },
  { tileId: null, reversed: false },
  { tileId: null, reversed: false },
  { tileId: null, reversed: false },
  { tileId: null, reversed: false },
  { tileId: null, reversed: false },
]

const DEFAULT_STRUCTURE_COORDS: Record<string, StructureCoord | null> = {
  'stone-green': null,
  'stone-blue': null,
  'stone-white': null,
  'stone-black': null,
  'shack-green': null,
  'shack-blue': null,
  'shack-white': null,
  'shack-black': null,
}

// 固定の5プレイヤーを生成
const createDefaultPlayers = (mode: GameMode): Player[] => {
  return PLAYER_COLORS.map((info) => ({
    id: info.symbol,  // シンボルをIDとして使用
    symbol: info.symbol,
    name: '',  // デフォルトは空（シンボルを表示）
    color: info.color,
    enabled: false,  // 初期状態では全員無効
    possibleHintIds: getAllHintIds(mode),
  }))
}

const createInitialState = (): GameState => ({
  mode: 'normal',
  players: createDefaultPlayers('normal'),
  actions: [],
  mapSettings: {
    tiles: DEFAULT_TILES,
    structureCoords: DEFAULT_STRUCTURE_COORDS,
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

// ========================================
// Reducer
// ========================================

function gameReducer(state: GameState, action: GameReducerAction): GameState {
  switch (action.type) {
    case 'SET_MODE': {
      // モード変更時、全プレイヤーのヒント候補を更新
      const newMode = action.payload
      const updatedPlayers = state.players.map((player) => ({
        ...player,
        possibleHintIds: getAllHintIds(newMode),
      }))
      return {
        ...state,
        mode: newMode,
        players: updatedPlayers,
        actions: [],  // アクション履歴もクリア
        updatedAt: Date.now(),
      }
    }

    case 'TOGGLE_PLAYER': {
      const playerId = action.payload
      const updatedPlayers = state.players.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            enabled: !player.enabled,
            // 有効化時にヒント候補をリセット
            possibleHintIds: !player.enabled ? getAllHintIds(state.mode) : player.possibleHintIds,
          }
        }
        return player
      })
      return {
        ...state,
        players: updatedPlayers,
        updatedAt: Date.now(),
      }
    }

    case 'SET_PLAYER_NAME': {
      const { playerId, name } = action.payload
      const updatedPlayers = state.players.map((player) => {
        if (player.id === playerId) {
          return { ...player, name }
        }
        return player
      })
      return {
        ...state,
        players: updatedPlayers,
        updatedAt: Date.now(),
      }
    }

    case 'START_GAME':
      return {
        ...state,
        updatedAt: Date.now(),
      }

    case 'RECORD_ACTION': {
      const newAction: PlayerAction = {
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }

      // ヒントを消去
      const updatedPlayers = state.players.map((player) => {
        if (player.id === action.payload.playerId) {
          return {
            ...player,
            possibleHintIds: eliminateHints(
              player.possibleHintIds,
              action.payload.type,
              action.payload.cellInfo,
              state.mode
            ),
          }
        }
        return player
      })

      return {
        ...state,
        players: updatedPlayers,
        actions: [...state.actions, newAction],
        updatedAt: Date.now(),
      }
    }

    case 'UNDO_ACTION': {
      if (state.actions.length === 0) return state

      const lastAction = state.actions[state.actions.length - 1]
      const previousActions = state.actions.slice(0, -1)

      // プレイヤーのヒント候補を再計算
      const updatedPlayers = state.players.map((player) => {
        if (player.id === lastAction.playerId) {
          // 全ヒントからスタートして、残りのアクションを適用
          let hintIds = getAllHintIds(state.mode)
          for (const act of previousActions) {
            if (act.playerId === player.id) {
              hintIds = eliminateHints(hintIds, act.type, act.cellInfo, state.mode)
            }
          }
          return { ...player, possibleHintIds: hintIds }
        }
        return player
      })

      return {
        ...state,
        players: updatedPlayers,
        actions: previousActions,
        updatedAt: Date.now(),
      }
    }

    case 'TOGGLE_HINT': {
      const { playerId, hintId } = action.payload
      const updatedPlayers = state.players.map((player) => {
        if (player.id === playerId) {
          const hasHint = player.possibleHintIds.includes(hintId)
          return {
            ...player,
            possibleHintIds: hasHint
              ? player.possibleHintIds.filter((id) => id !== hintId)
              : [...player.possibleHintIds, hintId],
          }
        }
        return player
      })
      return {
        ...state,
        players: updatedPlayers,
        updatedAt: Date.now(),
      }
    }

    case 'RESET_GAME':
      return createInitialState()

    case 'LOAD_STATE':
      return action.payload

    case 'SET_TILES': {
      const { tiles, changedIndex } = action.payload
      const changedTileId = tiles[changedIndex].tileId

      // 変更されたインデックス以外で同じタイルIDを持つものをクリア
      const cleanedTiles = tiles.map((tile, index) => {
        if (index === changedIndex) return tile
        if (tile.tileId !== null && tile.tileId === changedTileId) {
          return { ...tile, tileId: null }
        }
        return tile
      })

      return {
        ...state,
        mapSettings: {
          ...state.mapSettings,
          tiles: cleanedTiles,
        },
        updatedAt: Date.now(),
      }
    }

    case 'SET_STRUCTURE_COORD': {
      const { id, coord } = action.payload
      const newStructureCoords = { ...state.mapSettings.structureCoords }

      // 同じ座標の他の構造物をクリア
      if (coord) {
        Object.keys(newStructureCoords).forEach((key) => {
          const existing = newStructureCoords[key]
          if (key !== id && existing?.col === coord.col && existing?.row === coord.row) {
            newStructureCoords[key] = null
          }
        })
      }

      newStructureCoords[id] = coord

      return {
        ...state,
        mapSettings: {
          ...state.mapSettings,
          structureCoords: newStructureCoords,
        },
        updatedAt: Date.now(),
      }
    }

    default:
      return state
  }
}

// ========================================
// Context
// ========================================

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
}

export const GameContext = createContext<GameContextValue | null>(null)

// ========================================
// Provider
// ========================================

const STORAGE_KEY = 'cryptid-logic-solver-state'

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    // LocalStorageから復元を試みる
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as GameState
        // データ構造が不正な場合はクリアして初期化
        if (!parsed.mapSettings?.tiles || !parsed.mapSettings?.structureCoords) {
          localStorage.removeItem(STORAGE_KEY)
          return createInitialState()
        }
        // プレイヤーデータが新形式（5人固定、symbol/enabled付き）か確認
        if (parsed.players.length !== 5 || !parsed.players[0]?.symbol) {
          localStorage.removeItem(STORAGE_KEY)
          return createInitialState()
        }
        return parsed
      }
    } catch {
      // 復元失敗時はクリアして初期状態を使用
      localStorage.removeItem(STORAGE_KEY)
    }
    return createInitialState()
  })

  // 状態変更時にLocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // 保存失敗は無視
    }
  }, [state])

  const value: GameContextValue = {
    state,
    dispatch,
    setMode: (mode) => dispatch({ type: 'SET_MODE', payload: mode }),
    togglePlayer: (playerId) => dispatch({ type: 'TOGGLE_PLAYER', payload: playerId }),
    setPlayerName: (playerId, name) => dispatch({ type: 'SET_PLAYER_NAME', payload: { playerId, name } }),
    startGame: () => dispatch({ type: 'START_GAME' }),
    recordAction: (playerId, type, coordinate, cellInfo) =>
      dispatch({ type: 'RECORD_ACTION', payload: { playerId, type, coordinate, cellInfo } }),
    undoAction: () => dispatch({ type: 'UNDO_ACTION' }),
    toggleHint: (playerId, hintId) => dispatch({ type: 'TOGGLE_HINT', payload: { playerId, hintId } }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    setTiles: (tiles, changedIndex) => dispatch({ type: 'SET_TILES', payload: { tiles, changedIndex } }),
    setStructureCoord: (id, coord) => dispatch({ type: 'SET_STRUCTURE_COORD', payload: { id, coord } }),
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
