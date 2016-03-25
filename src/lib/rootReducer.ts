import objectAssign = require('object-assign')
import { Action, CursorAction, HasCursorState, LocalReducer } from './types'

const isCursorAction = function <Param>(action: Action): action is CursorAction<Param> {
  return action.type.match(/^@cursor\//) && 'cursor-action' in action
}

export default function <GlobalState extends HasCursorState>(rootReducer: LocalReducer<{}>) {
  return function(state: GlobalState, action: Action) {
    if (!isCursorAction(action)) {
      return state
    }

    const cursorAction = objectAssign({}, action, {
      type: action.type.substr(9 + rootReducer.key.length)
    })
    const cursorState = objectAssign({}, state.cursor)

    const newCursorState = rootReducer.apply(cursorState[rootReducer.key] || {}, cursorAction)
    return objectAssign({}, state, {
      cursor: objectAssign({}, {
        [rootReducer.key]: newCursorState
      })
    })
  }
}
