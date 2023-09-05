export function hasSameProperties<T extends object>(obj: T, keys: Array<keyof T>): boolean {
  const typeKeys = Object.keys(obj) as Array<keyof T>;
  return keys.every((key) => {
    return typeKeys.includes(key as keyof object);
  });
}
export function isArrayOf<T extends object>(arr: Array<T>, keys: Array<keyof T>): boolean {
  return Array.isArray(arr) && arr.length > 0 && arr.every((element) => hasSameProperties<T>(element, keys));
}

export const isInstanceOf = <T>(ctor: { new (...args: any): T }) => {
  return (x: any): x is T => x instanceof ctor;
};
