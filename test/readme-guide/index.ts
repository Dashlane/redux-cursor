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

test('private reducer reacts to actions', t => {
    const appReducer = makeLocalReducer('my-app', { foo: 'bar' })
    const change = appReducer.action('change', () => ({ foo: 'changed' }))
    const store = Redux.createStore(makeRootReducer(appReducer))
    const cursor = makeRootCursor(store, appReducer)
    cursor.dispatch(change())
    const updatedCursor = makeRootCursor(store, appReducer)
    t.same(updatedCursor.state.foo, 'changed')
})

test('private reducer reacts to actions with parameters', t => {
    const appReducer = makeLocalReducer('my-app', { foo: 'bar' })
    const change = appReducer.action('change', ({ param }) => ({ foo: param }))
    const store = Redux.createStore(makeRootReducer(appReducer))
    const cursor = makeRootCursor(store, appReducer)
    cursor.dispatch(change('new'))
    const updatedCursor = makeRootCursor(store, appReducer)
    t.same(updatedCursor.state.foo, 'new')
})

test('child reducer should have its own state', t => {
    const childReducer = makeLocalReducer('child', { foo: 'bar' })
    const childChange = childReducer.action('change', ({ param }) => ({ foo: param }))
    const appReducer = makeLocalReducer('my-app', { foo: 'baz' }, [childReducer])
    const appChange = appReducer.action('change', ({ param }) => ({ foo: param }))
    const store = Redux.createStore(makeRootReducer(appReducer))
    const cursor1 = makeRootCursor(store, appReducer)
    cursor1.child(childReducer).dispatch(childChange('quux'))
    cursor1.dispatch(appChange('new'))
    const cursor2 = makeRootCursor(store, appReducer)
    t.same(cursor2.child(childReducer).state.foo, 'quux')
})

test('children reducers should be distinguished by keys', t => {
    const childReducer = makeLocalReducer('child', { foo: 'bar' })
    const childChange = childReducer.action('change', ({ param }) => ({ foo: param }))
    const appReducer = makeLocalReducer('my-app', {}, [childReducer])
    const store = Redux.createStore(makeRootReducer(appReducer))
    const cursor1 = makeRootCursor(store, appReducer)
    cursor1.child(childReducer, 'key1').dispatch(childChange('quux'))
    const cursor2 = makeRootCursor(store, appReducer)
    t.same(cursor2.child(childReducer, 'key1').state.foo, 'quux')
    t.same(cursor2.child(childReducer, 'key2').state.foo, 'bar')
})
