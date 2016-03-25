import cursorReducer from './cursorReducer'
import localReducer from './localReducer'
import rootCursor from './rootCursor'

export const makeLocalStateReducer = localReducer
export const makeRootCursor = rootCursor
export const makeRootReducer = cursorReducer

import { Action, Cursor, CursorAction, LocalStateReducer, RootCursor } from './types'
export type Action = Action
export type CursorAction<Param> = CursorAction<Param>
export interface Cursor<State, GlobalState> extends Cursor<State, GlobalState> {}
export interface LocalStateReducer<State, GlobalState> extends LocalStateReducer<State, GlobalState> {}
export interface RootCursor<GlobalState> extends RootCursor<GlobalState> {}
