# Redux cursor

Local private slices of a global store for component encapsulation in a Redux model.

Redux is great, but the global actions and global state are problematic for big applications. Handling local state at the global level defeats encapsulation and there are discussions on topic both [in Redux](https://github.com/rackt/redux/issues/159) and [in React](https://github.com/facebook/react/issues/4595) projects.

[Cursors are reasonably popular tools](https://github.com/Yomguithereal/baobab) to solve this issue in general. Redux [does not like cursors as they are](https://github.com/rackt/redux/issues/155), but the criticism is focused purely on the low-level ability to mutate the state at will. `redux-cursor` is based on the actions same as base Redux, only those actions are private by default to the component.

Other solutions to this problem: [redux-react-local](https://github.com/threepointone/redux-react-local), [vdux-local](https://github.com/ashaffer/vdux-local), [redux-brick](https://github.com/leeching/redux-brick).

## Usage

### 1. Setup private state

For your top-level component `MyApp`, create a private reducer:

```js
const reduxCursor = require('redux-cursor')
const myAppReducer = reduxCursor.makeLocalReducer('my-app', {})
module.exports.myAppReducer = myAppReducer
```

Connect this top-level private reducer to your Redux store reducer:

```js
const cursorRootReducer = reduxCursor.makeRootReducer(myAppReducer)
module.exports = function(state, action) {
    state = combineReducer({
        // You probably have your global reducers here
    })
    state = cursorRootReducer(state, action)
    return state
}
```

Great, now Redux knows about your private reducer. Next, let us make it useful. Let us return to the reducer and give it some private state:

```js
const reduxCursor = require('redux-cursor')
const myAppReducer = reduxCursor.makeLocalReducer('my-app', {
    isPopupOpen: false
})
module.exports.myAppReducer = myAppReducer
```

This private state will be stored in the store, but will be visible only to `MyApp`. Let us make it visible to `MyApp` component. Modify the `MyApp` construction to include a new property, `cursor`:

```jsx
<MyApp cursor={makeRootCursor(store, myAppReducer)} />
```

Now inside the `MyApp` you can access the private state with `props.cursor.state.isPopupOpen`. Yes, this is longer than `state.isPopupOpen`, but the state is now explicitly stored in the store.

### 2. Modifying private state

Now we need to modify this state. In Redux, we only modify the state by dispatching actions, and redux-cursor promised you private actions. Let’s make one now in your private reducer:

```js
const reduxCursor = require('redux-cursor')
const myAppReducer = reduxCursor.makeLocalReducer('my-app', {
    isPopupOpen: false
})
module.exports.userClicked = myAppReducer.action('user-clicked',
    () => ({ isPopupOpen: true }))
module.exports.myAppReducer = myAppReducer
```

We have added a `userClicked` action that changes the `isPopupOpen` to `true`. For more thorough explanation of the action syntax, see this documentation a bit further.

To perform an action, we need to dispatch it. But we have to dispatch it through our Cursor in `MyApp`:

```js
const onClick = function(){
    props.cursor.dispatch(userClicked())
}
```

This modifies the store with our private change. Notice that a Cursor object is immutable, and thus whoever handles store changes in your application, must re-render the `<MyApp>` with a new `makeRootCursor`. If that happened, `MyApp` will now see a new `props.cursor.state.isPopupOpen`.

### 3. Nesting component trees

The final piece of the puzzle is handling component trees. Let us assume that you have a `Settings` component in your `MyApp`. First of all, make a private reducer for the `Settings`:

```js
const reduxCursor = require('redux-cursor')
const settingsReducer = reduxCursor.makeLocalReducer('settings', {
    sendNewsletter: false
})
module.exports.userExpressedNewsletterPreference = myAppReducer.action('newsletter',
    ({ param }) => ({ sendNewsletter: param }))
module.exports.settingsReducer = settingsReducer
```

Now you need to connect this reducer to its parent. Modify the parent `appReducer` to include the `settingsReducer` in the list in the third parameter:

```js
const reduxCursor = require('redux-cursor')
const settingsReducer = require('./settings/reducer')
const myAppReducer = reduxCursor.makeLocalReducer('my-app', {
    isPopupOpen: false
}, [settingsReducer])
```

That parameter should include private reducers of all direct children of the component. Finally, pass the `cursor` prop with its own state to the `Settings` in `MyApp` render method:

```jsx
<Settings cursor={this.props.cursor.child(settingsReducer)} />
```

Now `Settings` has its own `cursor` with its own `cursor.state` and a further, nested, `cursor.child`. If you ever include multiple copies of the same child component, pass a string key as the second parameter to `.child` call, similar to [React’s key parameter](https://facebook.github.io/react/docs/multiple-components.html#dynamic-children):

```jsx
<Tags cursor={this.props.cursor.child(tagsReducer, 'post-tags')} />
<Tags cursor={this.props.cursor.child(tagsReducer, 'category-tags')} />
```

This is it! Now every component has their own slice of the store with their own private actions and state.

## Action syntax

```js
myAppReducer.action('action-name', function(options) {
    // Returned value
    return diff;
})
```

## API

### props.cursor

#### Private state and actions

`props.cursor.state` is the private state of the component. Its shape is defined by the component reducer.

`props.cursor.dispatch` takes private cursor actions and modifies the store in accordance with the actions.

#### Global state and actions

`props.cursor.globalState` and `props.cursor.globalDispatch` are convenience shortcuts to link to the Redux store. There is no logic stored here, those come directly from the Redux store.

`props.cursor.dispatchGlobal` is deprecated.

#### Children

`props.cursor.child(childReducer, [childKey])` creates a child `cursor` object based on the `childReducer` and an optional string key. The reducer must be included in the parent’s reducer creation, but if you forget, a console warning will remind you. The key is optional and used to distinguish multiples of the same kind of children in the same parent. Note that if you use the same child in two different component hierarchies, keys is not needed.

## Known limitations

Currently the globalState is marked as modified with any cursor action, preventing efficient `shouldComponentUpdate` implementations.
