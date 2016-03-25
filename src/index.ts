import cursor from './lib/cursor'
import localReducer from './lib/localReducer'
import rootReducer from './lib/rootReducer'

export const makeLocalReducer = localReducer
export const makeRootReducer = rootReducer

// Naming makes it clear for the users that you are only supposed
// to make a cursor at the root level, and then should use .child instead.
// Contrast this with reducers, which have their own local reducer factory.
export const makeRootCursor = cursor

import { Action, Cursor, CursorAction, LocalReducer } from './lib/types'

export type Action = Action
export type CursorAction<Param> = CursorAction<Param>
export interface Cursor<State, GlobalState> extends Cursor<State, GlobalState> {}
export interface LocalReducer<State, GlobalState> extends LocalReducer<State, GlobalState> {}
