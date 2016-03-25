import cursorReducer from './cursorReducer'
import localReducer from './localReducer'
import rootCursor from './rootCursor'

export const makeLocalReducer = localReducer
export const makeRootCursor = rootCursor
export const makeRootReducer = cursorReducer

import { Action, Cursor, CursorAction, LocalStateReducer } from './types'
export type Action = Action
export type CursorAction<Param> = CursorAction<Param>
export interface Cursor<State, GlobalState> extends Cursor<State, GlobalState> {}
export interface LocalStateReducer<State, GlobalState> extends LocalStateReducer<State, GlobalState> {}
