import objectAssign = require('object-assign')
import { ActionReducer, CursorAction, CursorStateStorage, GlobalIntentHandler, LocalReducer } from './types'

function splitAction<Param>(action: CursorAction<Param>): [string, CursorAction<Param>] {
  const sepPos = action.type.indexOf('/')
  if (sepPos === -1)
    return ['', action]
  return [action.type.substr(0, sepPos), objectAssign({}, action, {
    type: action.type.substr(sepPos + 1)
  })]
}

export default function makeLocalReducer<State extends Object>(key: string, initialState: State, children: LocalReducer<Object>[] = []): LocalReducer<State> {
  if (!key || key.indexOf('/') > -1) {
    throw new Error('Invalid key')
  }
  const actionReducers: { [k: string]: ActionReducer<State, any> } = {}
  return {
    action: function <Param>(name: string, f: ActionReducer<State, Param>) {
      if (name in actionReducers) {
        throw new Error('Duplicate action name ' + name)
      }
      actionReducers[name] = f
      return function(param?: Param): CursorAction<Param> {
        return {
          type: name,
          param: param,
          'cursor-action': { 'reducer-key': key }
        }
      }
    },
    apply: function <Param>(storage: CursorStateStorage<State> = { _: initialState }, action: CursorAction<Param>, globalIntentHandler: GlobalIntentHandler) {
      const [childKey, finalAction] = splitAction(action)
      if (childKey) {
        const correctChildren = children.filter(c => c.key === childKey || c.key === childKey.split('$')[1])
        if (correctChildren.length === 0) {
          console.warn('It seems you have forgotten to include a child reducer in a parent. Check the reducer for "' + key + '". The third parameter to makeCursorReducer should be a list of child reducers, including "' + childKey + '".')
          return storage
        }
        return objectAssign({}, storage, {
          [childKey]: correctChildren[0].apply(storage[childKey], finalAction, globalIntentHandler)
        })
      } else {
        // Action on the current reducer
        if (finalAction.type in actionReducers) {
          return objectAssign({}, storage, {
            _: objectAssign({}, storage._,
              actionReducers[finalAction.type]({
                state: storage._,
                global: globalIntentHandler,
                param: finalAction.param
              }))
          })
        }
        return storage
      }
    },
    key,
    initial: initialState
  }
}
