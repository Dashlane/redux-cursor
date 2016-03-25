import objectAssign = require('object-assign')
import { ActionReducer, CursorAction, LocalReducer } from './types'

function splitAction<Param>(action: CursorAction<Param>): [string, CursorAction<Param>] {
  const sepPos = action.type.indexOf('/')
  if (sepPos === -1)
    return ['', action]
  return [action.type.substr(0, sepPos), objectAssign({}, action, {
    type: action.type.substr(sepPos + 1)
  })]
}

export default function makeLocalReducer<State extends Object, GlobalState extends Object>(key: string, initialState: State, children: LocalReducer<Object, GlobalState>[] = []): LocalReducer<State, GlobalState> {
  if (!key || key.indexOf('/') > -1) {
    throw new Error('Invalid key')
  }
  const actionReducers: { [k: string]: ActionReducer<State, GlobalState, any> } = {}
  return {
    action: function <Param>(name: string, f: ActionReducer<State, GlobalState, Param>) {
      if (name in actionReducers) {
        throw new Error('Duplicate action name ' + name)
      }
      actionReducers[name] = f
      return function(param?: Param): CursorAction<Param> {
        return {
          type: name,
          param: param,
          'cursor-action': true
        }
      }
    },
    apply: function <Param>(state: { _: State } = { _: initialState }, action: CursorAction<Param>, globalState: GlobalState) {
      const [childKey, finalAction] = splitAction(action)
      if (childKey) {
        const correctChildren = children.filter(c => c.key === childKey || c.key === childKey.split('$')[1])
        if (correctChildren.length === 0) {
          console.warn('It seems you have forgotten to include a child reducer in a parent. Check the reducer for "' + key + '". The third parameter to makeCursorReducer should be a list of child reducers, including "' + childKey + '".')
          return state
        }
        return objectAssign({}, state, {
          [childKey]: correctChildren[0].apply(state[childKey], finalAction, globalState)
        })
      } else {
        // Action on the current reducer
        if (finalAction.type in actionReducers) {
          return objectAssign({}, state, {
            _: objectAssign({}, state._,
              actionReducers[finalAction.type]({
                state: state._,
                globalState: globalState,
                param: finalAction.param
              }))
          })
        }
        return state
      }
    },
    key,
    initial: initialState
  }
}
