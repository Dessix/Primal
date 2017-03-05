// type PseudoGetterFor<TMemory extends 
//function WrappedGetter(this: )

// export function fromMemoryGet<TMemory extends ProcessMemory,T = T>(
//   def: T,
//   getter?: (mem: TMemory) => T,
//   setter?: (mem: TMemory, value: T) => void
// ) {
//   return function(ctor: Function,propName: string,propDesc: PropertyDescriptor) {
//     propDesc.value = def;
//     propDesc.get = getter;
//     propDesc.set = setter;
//   }

// }

export function fromMemory<Pickled,Unpickled>(serialization?: { key?: string,def?: Unpickled,get?: (v: Pickled) => Unpickled,set?: (v: Unpickled) => Pickled }) {
  return function(target: any,attributeName: string) {
    if(!(delete target[attributeName])) { return; }

    const key = serialization ? serialization.key || attributeName : attributeName;
    const def = serialization ? serialization.def : undefined;

    // first the default case and the specified key but no get/set case
    if((!serialization) ||
      (!serialization.get && !serialization.set)) {
      Object.defineProperty(target,attributeName,{
        get: function(this: any) {
          if(this.memory[key] == undefined && def != undefined) {
            this.memory[key] = _.clone(def);
          }
          return this.memory[key];
        },
        set: function(this: any,value: any) { this.memory[key] = value; },
        enumerable: true,
        configurable: true
      });
      return;
    }

    // wanted custom get/set methods too
    const memoizedAttributeName = `__${attributeName}__`;
    Object.defineProperty(target,memoizedAttributeName,{
      enumerable: false,
      configurable: true,
      writable: true,
      value: null
    });

    const { get: get,set: set } = serialization;
    if(!get || !set) {
      // this is not a good look
      console.log("some really bad misuse of decorators up in here");
      return;
    }

    Object.defineProperty(target,attributeName,{
      get: function(this: any) {
        if(this[memoizedAttributeName] != null) {
          return this[memoizedAttributeName];
        }
        if(this.memory[key] == undefined) {
          this.memory[key] = _.clone(def);
        }
        const result = get(this.memory[key]);
        this[memoizedAttributeName] = result;
        return result;
      },
      set: function(this: any,value: any) {
        if(this[memoizedAttributeName] != null) {
          this[memoizedAttributeName] = null;
        }
        this.memory[key] = set(value);
      },
      enumerable: true,
      configurable: true
    });
  };
}


type __ThingWithId = { id: IdFor<__ThingWithId> };
function __getIdIfExists(v?: __ThingWithId): IdFor<__ThingWithId> | undefined {
  if(v === undefined) { return undefined; }
  return v.id;
}

export function idFromMemory(key: string) {
  return fromMemory({
    key: key,
    get: fromId,
    set: __getIdIfExists,
  });
}

//TODO: <MemType extends ProcessMemory> key map checking in memory
export function processFromIdInMemory(key?: string) {
  return fromMemory<ProcessId | undefined,IProcess | undefined>({
    key: key,
    get: function(this: IProcess,pid?: ProcessId) { return pid !== undefined ? this.kernel.getProcessById(pid) : pid; },
    set: function(this: IProcess,p?: IProcess) { return p ? p.pid : undefined; },
  });
}

export function roomFromMemory<TKey extends string,TProc extends IProcess>(key: TKey,procType: ProcessConstructor & { prototype: { memory: {[k in TKey]: typeof Room.name; } } }) {
  return fromMemory({ key: key,get: (r?: typeof Room.name) => r ? Game.rooms[r] : undefined,set: (r?: Room) => r ? r.name : undefined });
}
