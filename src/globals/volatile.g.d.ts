interface Volatile {
  [key: string]: any;
}

interface Global {
  /** 
   * Resets every reinitialization 
   */
  Volatile: Volatile;

  /**
   * Resets once at the beginning of each tick
   */
  TickVolatile: Volatile;

  /**
   * Contents are not guaranteed to survive, but are agnostic of resets
   */
  Involatile: Volatile;
}

interface Memory {
  /**
   * Does not reset, but is not guaranteed to survive
   */
  Involatile: Volatile;
}

/** 
 * Resets every reinitialization 
 */
declare const Volatile: Volatile;

/**
 * Resets once at the beginning of each tick
 */
declare const TickVolatile: Volatile;

/**
 * Contents are not guaranteed to survive, but are agnostic of resets
 */
declare const Involatile: Volatile;
