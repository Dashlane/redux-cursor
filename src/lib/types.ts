export type Action = { type: string }

export interface ActionReducer<State, Param> {
  // Return value is deepPartial State, but not yet supported by TypeScript
  // https://github.com/Microsoft/TypeScript/issues/4889
  (params: { state: State, global: (type: string, param: any) => void, param: Param }): Object
}

export interface Cursor<State extends Object, GlobalState extends Object> {
  child: <ChildState>(reducer: LocalReducer<ChildState>, instanceKey?: string) => Cursor<ChildState, GlobalState>
  dispatch: (action: CursorAction<any>) => void
  dispatchGlobal: (action: Action) => void
  globalDispatch: (action: Action) => void
  state: State,
  globalState: GlobalState
}

export interface CursorAction<Param> {
  type: string
  param?: Param
  'cursor-action': {
    'reducer-key': string
  }
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

export interface GlobalIntentHandler {
  (type: string, param: any): void
}

export interface HasCursorState {
  cursor: CursorStateStorage<{}>
}

export interface LocalReducer<State extends Object> {
  action: <Param>(name: string, f: ActionReducer<State, Param>) => CursorActionCreator<Param>
  apply: (storage: CursorStateStorage<State>, action: Action, global: GlobalIntentHandler) => CursorStateStorage<State>
  key: string
  initial: State
}

export interface RootCursor<GlobalState extends Object> {
  child: <ChildState>(reducer: LocalReducer<ChildState>) => Cursor<ChildState, GlobalState>
}
