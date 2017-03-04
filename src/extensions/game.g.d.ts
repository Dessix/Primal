interface TypeTag<INTERFACE, T> {
  ____TYPETAG<T>(): INTERFACE & T;
} 

declare interface __IdFor<T> extends String, TypeTag<__IdFor<T>, T> { }
type IdFor<T> = __IdFor<T> & string;

interface Global {
  fromId(id: null | undefined): undefined;
  fromId<T>(id: __IdFor<T> | string | undefined | null): T | undefined;
}

declare function fromId(id: null | undefined): undefined;
declare function fromId<T>(id: __IdFor<T> | string | undefined | null): T | undefined;
