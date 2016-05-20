import test from 'ava'

import Redux = require('redux')
import { makeLocalReducer, makeRootReducer, makeRootCursor } from '../src/index'

test('should complain if a local action given to global dispatch', t => {
    const reducer = makeLocalReducer('foo', {})
    const action = reducer.action('action', () => ({}))
    const cursor = makeRootCursor(Redux.createStore(makeRootReducer(reducer)), reducer)
    t.throws(() => {
        cursor.globalDispatch(action())
    })
})

test('should complain if a global action given to local dispatch', t => {
    const reducer = makeLocalReducer('foo', {})
    const cursor = makeRootCursor(Redux.createStore(makeRootReducer(reducer)), reducer)
    t.throws(() => {
        cursor.dispatch({ type: 'something' } as any)
    })
})

test('should complain if an action from another reducer tree is given', t => {
    const reducer1 = makeLocalReducer('reducer1', {})
    const reducer2 = makeLocalReducer('reducer2', {})
    const action = reducer1.action('action', () => ({}))
    const cursor = makeRootCursor(Redux.createStore(makeRootReducer(reducer1)), reducer2)
    t.throws(() => {
        cursor.dispatch(action())
    })
})
