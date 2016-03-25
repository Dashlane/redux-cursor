import localReducer from './lib/localReducer'
import rootCursor from './lib/rootCursor'
import rootReducer from './lib/rootReducer'

export const makeLocalReducer = localReducer
export const makeRootCursor = rootCursor
export const makeRootReducer = rootReducer

import { Action, Cursor, CursorAction, LocalStateReducer } from './lib/types'

export type Action = Action
export type CursorAction<Param> = CursorAction<Param>
export interface Cursor<State, GlobalState> extends Cursor<State, GlobalState> {}
export interface LocalStateReducer<State, GlobalState> extends LocalStateReducer<State, GlobalState> {}
