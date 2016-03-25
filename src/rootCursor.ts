import objectAssign = require('object-assign')
import Redux = require('redux')
import { Action, Cursor, CursorAction,
  LocalStateReducer, RootCursor } from './types'

function encodeInstanceKey(key: string) {
  return key.replace('%', '%P').replace('$', '%D').replace('/', '%S')
}

function makeCursorInternal<S, GlobalState>(keyPrefix: string, reducer: LocalStateReducer<S, GlobalState>, currentState: { _?: S } = {}, globalState: GlobalState, dispatch: (action: Action) => void): Cursor<S, GlobalState> {
  return {
    child: function <ChildState>(child: LocalStateReducer<ChildState, GlobalState>, instanceKey?: string) {
      const suffix = instanceKey ? encodeInstanceKey(instanceKey) + '$' : ''
      return makeCursorInternal(keyPrefix + reducer.key + '/' + suffix, child, currentState[suffix + child.key] || {}, globalState, dispatch)
    },
    dispatch: function(action: CursorAction<any>) {
      if (!action['cursor-action'])
        throw new Error('A regular action given to cursor dispatch')
      dispatch(objectAssign({}, action, {
        type: keyPrefix + reducer.key + '/' + action.type
      }))
    },
    dispatchGlobal: function(action: Action) {
      if (action['cursor-action'])
        throw new Error('A cursor action given to global dispatch')
      dispatch(action)
    },
    state: objectAssign({}, reducer.initial, currentState._ || {}),
    globalState
  }
}

export default function makeRootCursor<GlobalState extends { cursor: {} }>(store: Redux.IStore<GlobalState>, reducer: LocalStateReducer<{}, GlobalState>): RootCursor<GlobalState> {
  return {
    child: function <ChildState>(child: LocalStateReducer<ChildState, GlobalState>) {
      return makeCursorInternal(reducer.key + '/', child, store.getState().cursor[child.key], store.getState(), store.dispatch)
    }
  }
}
