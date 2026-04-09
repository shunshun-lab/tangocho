export function newId(prefix = '') {
  const id = globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return prefix ? `${prefix}_${id}` : id;
}

