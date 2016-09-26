
export function initVolatile(g: Global, m: Memory) {
  if (m.Involatile == null) { m.Involatile = {}; }
  g.Involatile = m.Involatile;
  g.Volatile = {};
  initTickVolatile(g);
};

export function initTickVolatile(global: Global) {
  global.TickVolatile = {};
};
