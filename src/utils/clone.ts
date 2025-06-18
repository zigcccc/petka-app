export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(deepClone) as unknown as T;
  }

  const copy = {} as { [key: string]: unknown };
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      copy[key] = deepClone((value as { [key: string]: unknown })[key]);
    }
  }

  return copy as T;
}
