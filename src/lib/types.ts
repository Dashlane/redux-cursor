export type Action = { type: string }

export interface ActionReducer<State, GlobalState, Param> {
  // Return value is deepPartial State, but not yet supported by TypeScript
  // https://github.com/Microsoft/TypeScript/issues/4889
  (params: { state: State, globalState: GlobalState, param: Param }): Object
}

export interface Cursor<State extends Object, GlobalState extends Object> {
  child: <ChildState>(reducer: LocalReducer<ChildState, GlobalState>, instanceKey?: string) => Cursor<ChildState, GlobalState>
  dispatch: (action: CursorAction<any>) => void
  dispatchGlobal: (action: Action) => void
  globalDispatch: (action: Action) => void
  state: State,
  globalState: GlobalState
}

export interface CursorAction<Param> {
  type: string
  param?: Param
  'cursor-action': boolean
}

export interface CursorStateStorage<LocalState extends {}> {
  _?: LocalState
  // The following should be typed :CursorStateStorage<{}>,
  // but this conflicts with the _ property above.
  [k: string]: any
}

export interface CursorActionCreator<Param> {
  (param?: Param): CursorAction<Param>
}

export interface HasCursorState {
  cursor: CursorStateStorage<{}>
}

export interface LocalReducer<State extends Object, GlobalState extends Object> {
  action: <Param>(name: string, f: ActionReducer<State, GlobalState, Param>) => CursorActionCreator<Param>
  apply: (storage: CursorStateStorage<State>, action: Action, globalState: GlobalState) => CursorStateStorage<State>
  key: string
  initial: State
}

export interface RootCursor<GlobalState extends Object> {
  child: <ChildState>(reducer: LocalReducer<ChildState, GlobalState>) => Cursor<ChildState, GlobalState>
}
