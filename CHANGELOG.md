# 2.0.0

Breaking change: LocalReducers are now fully independent of global state.

To upgrade, check your local reducers for access to `globalState`. Move any modifications done to globalState to regular, global action creators and trigger those actions where you trigger original local actions.

I apologize for the inconvenience this change brings. The existence of mutable global state in local reducers was, however, an important architectural problem in Cursor.
