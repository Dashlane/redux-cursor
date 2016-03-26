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
