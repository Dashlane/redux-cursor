import objectAssign = require('object-assign')
import { Action, CursorAction, HasCursorState, LocalReducer } from './types'

const isCursorAction = function <Param>(action: Action): action is CursorAction<Param> {
  return action.type.match(/^@cursor\//) && 'cursor-action' in action
}

export default function <GlobalState extends HasCursorState>(rootReducer: LocalReducer<{}>, intentHandler?: (state: GlobalState, type: string, param: any) => GlobalState) {
  return function(state: GlobalState, action: Action): GlobalState {
    if (!state) {
      return { cursor: {} } as GlobalState
    }

    if (!isCursorAction(action)) {
      return state
    }

    const cursorAction = objectAssign({}, action, {
      type: action.type.substr(9 + rootReducer.key.length)
    })
    const cursorState = objectAssign({}, state.cursor)

    type Intent = { type: string, param: any }
    const intents: Intent[] = []
    intentHandler = intentHandler || (s => s)
    const newCursorState = rootReducer.apply(cursorState[rootReducer.key] || {}, cursorAction,
      (type: string, param: any) => { intents.push({ type, param })})
    const stateWithIntentsHandled = intents.reduce(
      (state, intent) => intentHandler(state, intent.type, intent.param),
      state)
    return objectAssign({}, stateWithIntentsHandled, {
      cursor: objectAssign({}, {
        [rootReducer.key]: newCursorState
      })
    })
  }
}
