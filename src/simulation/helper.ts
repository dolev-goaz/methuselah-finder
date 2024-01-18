type Prettier<T> = T extends object? {
    [TKey in keyof T]: Prettier<T[TKey]>;
}: T