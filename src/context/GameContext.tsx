import { createContext, useReducer, useEffect, type ReactNode } from 'react'
import type { GameState, Player, PlayerAction, GameMode, PlayerColor, CellInfo, TileConfig, StructureCoord } from '../types'
import { getAllHintIds } from '../data'
import { eliminateHints } from '../logic/elimination'

// ========================================
// Actions
// ========================================

type GameReducerAction =
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'ADD_PLAYER'; payload: { name: string; color: PlayerColor } }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'START_GAME' }
  | { type: 'RECORD_ACTION'; payload: Omit<PlayerAction, 'id' | 'timestamp'> }
  | { type: 'UNDO_ACTION' }
  | { type: 'TOGGLE_HINT'; payload: { playerId: string; hintId: string } }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'SET_TILES'; payload: TileConfig[] }
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

const createInitialState = (): GameState => ({
  mode: 'normal',
  players: [],
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
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        updatedAt: Date.now(),
      }

    case 'ADD_PLAYER': {
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: action.payload.name,
        color: action.payload.color,
        possibleHintIds: getAllHintIds(state.mode),
      }
      return {
        ...state,
        players: [...state.players, newPlayer],
        updatedAt: Date.now(),
      }
    }

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload),
        updatedAt: Date.now(),
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

    case 'SET_TILES':
      return {
        ...state,
        mapSettings: {
          ...state.mapSettings,
          tiles: action.payload,
        },
        updatedAt: Date.now(),
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
  addPlayer: (name: string, color: PlayerColor) => void
  removePlayer: (playerId: string) => void
  startGame: () => void
  recordAction: (playerId: string, type: 'cube' | 'disc', coordinate: string, cellInfo: CellInfo) => void
  undoAction: () => void
  toggleHint: (playerId: string, hintId: string) => void
  resetGame: () => void
  // Map settings
  setTiles: (tiles: TileConfig[]) => void
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
    addPlayer: (name, color) => dispatch({ type: 'ADD_PLAYER', payload: { name, color } }),
    removePlayer: (playerId) => dispatch({ type: 'REMOVE_PLAYER', payload: playerId }),
    startGame: () => dispatch({ type: 'START_GAME' }),
    recordAction: (playerId, type, coordinate, cellInfo) =>
      dispatch({ type: 'RECORD_ACTION', payload: { playerId, type, coordinate, cellInfo } }),
    undoAction: () => dispatch({ type: 'UNDO_ACTION' }),
    toggleHint: (playerId, hintId) => dispatch({ type: 'TOGGLE_HINT', payload: { playerId, hintId } }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    setTiles: (tiles) => dispatch({ type: 'SET_TILES', payload: tiles }),
    setStructureCoord: (id, coord) => dispatch({ type: 'SET_STRUCTURE_COORD', payload: { id, coord } }),
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
