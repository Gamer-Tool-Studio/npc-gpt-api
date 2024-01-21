export type DataBase = {
  create: (schema: GTSSchemas, data: any, options: any) => Promise<any>,
  find: (schema: GTSSchemas, filter: any, select?: any, options?: any) => Promise<any>,
  findOne: (schema: GTSSchemas, filter: any, select?: any, options?: any) => Promise<any>,
  findOneAndUpdate: (schema: GTSSchemas, filter: any, update?: any, options?: any) => Promise<any>,
  [method: string]: (...args: any[]) => Promise<any>;
};
export const b = 1;
