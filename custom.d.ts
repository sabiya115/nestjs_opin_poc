declare namespace RAW {
    interface Error {
      errorKey: string;
      path: string;
      errorData?: { [x: string]: any }
    }
    interface Query {
      query?: Record<string, any>;
      projection?: Record<string, any>;
      options?: { skip: number; limit: number; sort: Record<string, any> };
      includeCount?: boolean;
      ref?: any;
    }
}

declare module "mongoose" {
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
  interface Model<
  TRawDocType,
  TQueryHelpers = {},
  TInstanceMethods = {},
  TVirtuals = {},
  THydratedDocumentType = HydratedDocument<TRawDocType, TVirtuals & TInstanceMethods, TQueryHelpers>,
  TSchema = any
  > {
    __excludedScopes: string[];
    __unscoped: boolean;
    createDocument(
      params: Record<string, any>,
      session?: any,
      overrideAccessibles?: any
    ): Promise<T>;
    deleteDocuments(query: Record<string, any>, session?: any): Promise<any>;
    findOneAndUpdateDocument(
      query: Record<string, any>,
      params: Record<string, any>,
      options?: any,
      session?: any,
      overrideAccessibles?: any
    ): Promise<T>;
    findWithReference(
      params: {
        query: Record<string, any>;
        projection?: Record<string, number>;
        options?: Record<string, any>;
        includeCount?: boolean;
      },
      referenceModel?: any
    ): Promise<{ data: T[]; count?: number }>;
    _find(cb: any): any;
    count(cb: any): any;
    getDefaultScopes(): {
      name: string;
      query: Record<string, any>;
    }[];
    // find(cb: any): any;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
  interface Document<T> {
    deleteDocument(
      params?: any,
      session?: any,
      overrideAccessibles?: any
    ): Promise<T>;
    updateDocument(
      params: any,
      session?: any,
      overrideAccessibles?: any
    ): Promise<T>;
    save():Promise<T>;
  }

  interface Schema {
    options: Record<string, any>;
    accessibles: string[];
    protectedAttrs: string[];
    defaultScopes: {
      name: string;
      query: Record<string, any>;
    }[];
    addAccessibles(accessiblesAttrs: string[]): void;
    addProtected(protectedAttrs: string[]): void;
    addDefaultScope(scopeName: string, scopeQuery: Record<string, any>): void;
  }

  namespace Schema {
    namespace Types {
      class ObjectType extends SchemaType {}
      class EpochType extends SchemaType {}
    }
  }
}

declare module express {
  interface Request {
    headers: {
      api_key: string;
      auth_token: string;
    }
  }
  
  
}