declare interface IteratorResult<T> {
    done: boolean
    value?: T
}

declare interface Iterator<T> {
    next(value?: any): IteratorResult<T>
    return?(value?: any): IteratorResult<T>
    throw?(e?: any): IteratorResult<T>
}
