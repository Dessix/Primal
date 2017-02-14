
export function initVolatile(g: Global, m: Memory) {
  if (m.involatile == null) { m.involatile = {}; }
  g.Involatile = m.involatile;
  g.Volatile = {};
  initTickVolatile(g);
};

export function initTickVolatile(global: Global) {
  global.TickVolatile = {};
};
