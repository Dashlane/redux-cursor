# 4.0.0

TypeScript 2 and strict null checks

# 3.0.0

License change to Apache 2.

# 2.0.0

Breaking change: LocalReducers are now independent of global state.

To upgrade, check your local reducers for access to `globalState`. Replace any modifications done to globalState with static global intents, and move the actual modification performing to your global intent handler in the call to makeRootReducer. See ‘Global changes in local action reducers’ in the Readme for more.

I apologize for the inconvenience this change brings. The existence of mutable global state in local reducers was, however, an important architectural problem in Cursor.
