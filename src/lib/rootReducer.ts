import objectAssign = require('object-assign')
import { Action, CursorAction, HasCursorState, LocalReducer } from './types'

const isCursorAction = function <Param>(action: Action): action is CursorAction<Param> {
  return Boolean(action.type.match(/^@cursor\//) && 'cursor-action' in action)
}

export default function <GlobalState extends HasCursorState>(rootReducer: LocalReducer<{}>, intentHandler?: (state: GlobalState, type: string, param: any) => GlobalState) {
  // state can be undefined, but redux.IReducer is not updated yet
  return function(state: GlobalState, action: Action): GlobalState {
    if (!state) {
      return { cursor: {} } as GlobalState
    }

    if (!isCursorAction(action)) {
      return state
    }

    if (action.type.substr(8, rootReducer.key.length + 1) !== rootReducer.key + '/') {
        throw new Error('Action and store have different reducer trees. Action dispatched from root reducer "' + action.type + '", while the store has root reducer "' + rootReducer.key + '"')
    }

    const cursorAction = objectAssign({}, action, {
      type: action.type.substr(9 + rootReducer.key.length)
    })
    const cursorState = objectAssign({}, state.cursor)

    type Intent = { type: string, param: any }
    const intents: Intent[] = []
    const realIntentHandler = intentHandler || (s => s)
    const newCursorState = rootReducer.apply(cursorState[rootReducer.key] || {}, cursorAction,
      (type: string, param: any) => { intents.push({ type, param })})
    const stateWithIntentsHandled = intents.reduce(
      (state, intent) => realIntentHandler(state, intent.type, intent.param),
      state)
    return objectAssign({}, stateWithIntentsHandled, {
      cursor: objectAssign({}, {
        [rootReducer.key]: newCursorState
      })
    })
  }
}
