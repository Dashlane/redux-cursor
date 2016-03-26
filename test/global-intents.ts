import test from 'ava'
import objectAssign = require('object-assign')
import * as Redux from 'redux'

import { makeLocalReducer, makeRootReducer, makeRootCursor } from '../src/index'

test('global intents modify the global state', t => {
    const reducer = makeLocalReducer('my-app', {})
    const action = reducer.action('action', ({ global }) => {
        global('foo', 'bar')
        return {}
    })
    type GlobalState = { cursor: any, fooKey: string }
    const rootReducer = makeRootReducer<GlobalState>(reducer, function(state, type, param){
        if (type === 'foo') {
            return objectAssign({}, state, { fooKey: param })
        }
        return state
    })
    const store = Redux.createStore(rootReducer, { cursor: {}, fooKey: '' })
    const cursor1 = makeRootCursor(store, reducer)
    cursor1.dispatch(action())
    const cursor2 = makeRootCursor(store, reducer)
    t.same(cursor2.globalState.fooKey, 'bar')
})
