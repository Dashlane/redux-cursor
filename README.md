# Redux cursor

The general idea is pretty simple - handling local state at the global level defeats encapsulation and there are discussions on topic both [in Redux](https://github.com/rackt/redux/issues/159) and [in React](https://github.com/facebook/react/issues/4595).

[Cursors are reasonably popular tools](https://github.com/Yomguithereal/baobab). Redux [does not like cursors as they are](https://github.com/rackt/redux/issues/155), but the criticism is focused purely on the low-level ability to mutate the state at will. Our implementation of cursors requires actions same as base Redux does, only those actions are private by default. So far only one implementation similar to ours has been found: [vdux-local](https://github.com/ashaffer/vdux-local).

## Usage

Any connected component receives a `cursor` property that can be used to retrieve (`cursor.state.`) and modify (`cursor.dispatch()`) state.

## Known limitations

Currently the globalState is marked as modified with any cursor action.
