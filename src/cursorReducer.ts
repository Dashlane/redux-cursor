import objectAssign = require('object-assign')
import { Action, CursorAction, HasCursorState, LocalStateReducer } from './types'

const isCursorAction = function <Param>(action: Action): action is CursorAction<Param> {
  return action.type.match(/^@cursor\//) && 'cursor-action' in action
}

export default function <GlobalState extends HasCursorState>(rootReducer: LocalStateReducer<{}, GlobalState>) {
  return function(state: GlobalState, action: Action) {
    if (!isCursorAction(action)) {
      return state
    }

    const cursorAction = objectAssign({}, action, {
      type: action.type.substr(8)
    })
    const cursorState = objectAssign({}, state.cursor)

    // This is a mutable globalState for action reducers
    const globalState = objectAssign({}, state, { cursor: null })
    const newCursorState = rootReducer.apply(cursorState as any, cursorAction, globalState)
    return objectAssign({}, globalState, {
      cursor: newCursorState
    })
  }
}
