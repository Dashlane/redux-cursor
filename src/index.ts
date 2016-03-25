import cursorReducer from './cursorReducer'
import localReducer from './localReducer'
import rootCursor from './rootCursor'

export const makeLocalStateReducer = localReducer
export const makeRootCursor = rootCursor
export const makeRootReducer = cursorReducer
