import test from 'ava'

import Redux = require('redux')
import { makeLocalReducer, makeRootCursor } from '../src/index'

test('should dispatch global actions', t => {
    const reducer = makeLocalReducer('foo', {})
    const myAction = { type: 'my-action' }
    const store = Redux.createStore((state, action) => {
        if (action && action.type === myAction.type) {
            t.same(action, myAction)
            t.pass()
        }
        return state
    }, { cursor: {} })
    const cursor = makeRootCursor(store, reducer)
    cursor.globalDispatch(myAction)
})

test('should dispatch global actions using an alias', t => {
    const reducer = makeLocalReducer('foo', {})
    const myAction = { type: 'my-action' }
    const store = Redux.createStore((state, action) => {
        if (action && action.type === myAction.type) {
            t.same(action, myAction)
            t.pass()
        }
        return state
    }, { cursor: {} })
    const cursor = makeRootCursor(store, reducer)
    cursor.dispatchGlobal(myAction)
})
