import objectAssign = require('object-assign')
import Redux = require('redux')
import { Action, Cursor, CursorAction, CursorStateStorage, HasCursorState, LocalReducer } from './types'

function encodeInstanceKey(key: string) {
  return key.replace('%', '%P').replace('$', '%D').replace('/', '%S')
}

function makeCursor<State, GlobalState>(
  keyPrefix: string,
  reducer: LocalReducer<State>,
  currentState: CursorStateStorage<State> = {},
  globalState: GlobalState,
  dispatch: (action: Action) => void
): Cursor<State, GlobalState> {
  const globalDispatch = function(action: Action) {
    if ('cursor-action' in action)
      throw new Error('A cursor action given to global dispatch')
    dispatch(action)
  }
  return {
    child: function <ChildState>(child: LocalReducer<ChildState>, instanceKey?: string) {
      const suffix = instanceKey ? encodeInstanceKey(instanceKey) + '$' : ''
      return makeCursor(keyPrefix + reducer.key + '/' + suffix, child, currentState[suffix + child.key] || {}, globalState, dispatch)
    },
    dispatch: function(action: CursorAction<any>) {
      if (!action['cursor-action'])
        throw new Error('A regular action given to cursor dispatch')
      if (action['cursor-action']['reducer-key'] !== reducer.key)
        throw new Error('Action ' + action.type + ' came from reducer ' + action['cursor-action']['reducer-key'] + ' instead of expected ' + reducer.key)
      dispatch(objectAssign({}, action, {
        type: keyPrefix + reducer.key + '/' + action.type
      }))
    },
    globalDispatch,
    dispatchGlobal: globalDispatch,
    state: objectAssign({}, reducer.initial, currentState._ || {}),
    globalState
  }
}

export default function makeRootCursor<State extends {}, GlobalState extends HasCursorState>(
  store: Redux.IStore<GlobalState>,
  rootReducer: LocalReducer<State>
): Cursor<State, GlobalState> {
  const globalState = store.getState()
  return makeCursor(
    '@cursor/',
    rootReducer,
    globalState.cursor ? globalState.cursor[rootReducer.key] : {},
    globalState,
    store.dispatch
  )
}
