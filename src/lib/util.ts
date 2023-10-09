export function hasSameProperties<T extends object>(obj: T, keys: Array<keyof T>): boolean {
  const typeKeys = Object.keys(obj) as Array<keyof T>;
  return keys.every((key) => {
    return typeKeys.includes(key as keyof object);
  });
}
export function isArrayOf<T extends object>(arr: Array<T>, keys: Array<keyof T>): boolean {
  return Array.isArray(arr) && arr.length > 0 && arr.every((element) => hasSameProperties<T>(element, keys));
}

function mapFields(sourceObject: any, fieldMapping: any) {
  const mappedObject = {};

  // eslint-disable-next-line guard-for-in
  for (const googleField in fieldMapping) {
    const profileField = fieldMapping[googleField];

    const googleFieldParts = googleField.split('/');
    let value = sourceObject;

    for (const part of googleFieldParts) {
      value = value[part];
    }

    let profileValue: any = value;

    const profileFieldParts = profileField.split('/');
    for (let i = profileFieldParts.length - 1; i >= 0; i -= 1) {
      const tempProfileValue: any = {};
      tempProfileValue[profileFieldParts[i]] = profileValue;
      profileValue = tempProfileValue;
    }

    Object.assign(mappedObject, profileValue);
  }

  return mappedObject;
}

export function mapGoogleToProfile(user: Express.User) {
  // const googleFields = ['displayName', 'emails/0'];
  // const profileFields = ['username', 'email'];

  const fieldMapping = {
    displayName: 'username',
    'emails/0/value': 'email',
    'photos/0/value': 'picture',
  };

  const mappedObject = mapFields(user, fieldMapping);

  return mappedObject;
}

export const isInstanceOf = <T>(ctor: { new (...args: any): T }) => {
  return (x: any): x is T => x instanceof ctor;
};

export function filterObject(raw: Record<string, unknown>, allowed: string[]) {
  return Object.keys(raw)
    .filter((key) => allowed.includes(key))
    .reduce((object: Record<string, unknown>, key) => {
      const obj = { ...object };
      obj[key] = raw[key];
      return obj;
    }, {});
}
