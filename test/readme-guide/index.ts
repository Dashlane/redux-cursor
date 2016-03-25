import test from 'ava'
import objectAssign = require('object-assign')
import * as Redux from 'redux'

import { makeLocalReducer, makeRootReducer, makeRootCursor } from '../../src/index'

test('makeLocalReducer makes something', t => {
    t.ok(makeLocalReducer('my-app', {}))
})

test('rootReducer makes a reducer', t => {
    const reducer = makeRootReducer(makeLocalReducer('my-app', {}))
    t.same(typeof reducer, 'function')
    const dummyAction = { type: 'unknown-action' }
    const initialState = reducer(undefined, dummyAction)
    const state = objectAssign({}, initialState, { foo: 'bar' })
    t.same(reducer(state, dummyAction), state)
})

test('private reducer state is given to the cursor', t => {
    const appReducer = makeLocalReducer('my-app', { foo: 'bar' })
    const store = Redux.createStore(makeRootReducer(appReducer))
    const cursor = makeRootCursor(store, appReducer)
    t.same(cursor.state, { foo: 'bar' })
})
