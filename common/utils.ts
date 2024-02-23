import { HttpException, HttpStatus,  } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import * as Promise from "when";
import * as _lodash from "lodash";
import crypto = require('crypto');
import * as mongoose from 'mongoose';
import { BuiltError } from "./raw.error";


export function errorResponse(options: {
    message: string;
    httpStatus?: number;
  }) {
    return function (
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor,
    ) {
      const method = descriptor.value;
      //need to work on this
      // let i18n = I18nContext.current();
      // console.log('current language', i18n.lang);
      descriptor.value = new Proxy(method, {
        
        apply: async function (target, thisArg, args) {
          try {
            
            return await target.apply(thisArg, args);
          } catch (errors) {
            throw new HttpException(
              {
                // message: i18n.t(options.message),
                message: options.message,
                errors: errors,
              },
              options.httpStatus || HttpStatus.UNPROCESSABLE_ENTITY,
            );
          }
        },
      });
  
      return descriptor;
    };
  }

  export function mongooseCorePlugin(schema: mongoose.Schema) {
    const ensureIndex = (that) => {
      return that
        .listIndexes()
        .then((idx) => {
          return new Promise((resolve, reject) => {
            if (idx.length !== that.schema._indexes.length + 1)
              return that.ensureIndexes({}, (err) => {
                if (err) reject(err);
                Promise.resolve();
              });
            Promise.resolve();
          });
        })
        .catch((err) => {
          // pre indexing gives ns does not exists error
          if (err.codeName === 'NamespaceNotFound') return Promise.resolve();
          throw err;
        });
    };
  
    schema.options = schema.options || /* istanbul ignore next */ {};
    schema.options.toJSON =
      schema.options.toJSON || /* istanbul ignore next */ {};
  
    schema.accessibles = schema.accessibles || [];
    schema.protectedAttrs = schema.protectedAttrs || [];
    schema.protectedAttrs = [
      ...schema.protectedAttrs,
      'created_at',
      'deleted_at',
    ];
  
    schema.defaultScopes = schema.defaultScopes || [
      { name: 'deleted_at', query: { deleted_at: 'false' } },
    ];
  
    const _superTransform =
      schema.options.toJSON.transform ||
      function (ret, doc) {
        return doc;
      };
  
    schema.options.toJSON.transform = function () {
      // eslint-disable-next-line prefer-rest-params
      const doc = _superTransform.apply(this, arguments);
      doc.id = doc._id;
      // delete doc._id;
      delete doc.__v;
      doc.id = doc._id;
      delete doc._id;
  
      return doc;
    };
  
    /* istanbul ignore next */
    schema.pre('save', function (next) {
      // save helper
      if (this.wasNew) this.wasNew = false;
  
      if (this.isNew) this.wasNew = true;
  
      // update helper
      if (this.wasUpdate) this.wasUpdate = false;
  
      if (this.isUpdate) {
        this.isUpdate = false;
        this.wasUpdate = true;
      }
  
      // delete helper
      if (this.wasDelete) this.wasDelete = false;
  
      if (this.isDelete) {
        this.isDelete = false;
        this.wasDelete = true;
      }

      next();
    });
  
    /*
      Add attributes to the accessibles list
      @params attributes Array of attributes
    */
    /* istanbul ignore next */
    schema.addAccessibles = function (accessiblesAttrs: string[]) {
      if (!_lodash.isArray(accessiblesAttrs)) return;
  
      schema.accessibles = schema.accessibles.concat(accessiblesAttrs);
      schema.accessibles = _lodash.uniq(schema.accessibles);
    };
  
    /*
      Add params that are declared protected
      @params attributes Array of attributes
    */
    /* istanbul ignore next */
    schema.addProtected = function (protectedAttrs: string[]) {
      if (!_lodash.isArray(protectedAttrs)) return;
  
      schema.protectedAttrs = schema.protectedAttrs.concat(protectedAttrs);
      schema.protectedAttrs = _lodash.uniq(schema.protectedAttrs);
    };
  
    /*
      Add default scopes
      Default scopes are query conditions that are executed by default 
      for this model.
    */
    /* istanbul ignore next */
    schema.addDefaultScope = function (
      scopeName: string,
      scopeQuery: Record<string, any>,
    ) {
      schema.defaultScopes.push({ name: scopeName, query: scopeQuery });
    };
  
    /*
      Wrapper to create a document
      @param params The parameters by which to update the document
      @param overrideAccessibles If set to true, will ignore the accessibles
      @return promise A promise to create a document
    */
    /* istanbul ignore next */
    schema.statics.createDocument = function (
      params: Record<string, any>,
      session?: mongoose.ClientSession,
      overrideAccessibles?: boolean,
    ) {
      const originalParams = _lodash.clone(params);
  
      if (!overrideAccessibles) {
        params = accessibleParams(params);
      }
  
      if (params) params._originalParams = originalParams;
  
      return Promise.resolve()
        .then(() => {
          const doc: mongoose.Document = new this(params);
          return doc.save({ session });
        })
        .catch(function (err) {
          throw transformError(err);
        });
    };
  
    /* istanbul ignore next */
    schema.statics.deleteDocuments = function (
      query: Record<string, any>,
      session?: mongoose.ClientSession,
    ) {
      return this.updateMany(
        markParsed(query),
        {
          $set: { deleted_at: new Date().getTime() },
        },
        { session },
      ).catch((err) => {
        throw transformError(err);
      });
    };
  
    /**
     * Transform Error in RAW format
     * @param {*} err
     */
    /* istanbul ignore next */
    function transformError(err): BuiltError {
      // d.error(err);
      const rawError = new BuiltError();
  
      if (err.isRAWError) throw err;
  
      if (err.errors) throw transformMongooseError(err, rawError);
      else throw handleMongoError(err, rawError);
    }
  
    /**
     * Given a mongo error, it will parse it and return a built error
     */
    /* istanbul ignore next */
    function handleMongoError(error, rawError: BuiltError): BuiltError {
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        switch (error.code) {
          case 2:
            rawError.add(
              'Invalid parameters',
              'genericErrors.invalidUpdateOperation',
            );
            throw rawError;
          case 11000: {
            // Extracts index name from mongo error message
            // eg error = 'E11000 duplicate key error index: test.somecollection_name.$username dup key: { : "dummy_user1", : null }
            // output   = 'username'
            let path;
            try {
              // Assuming engine is set to mmapv1
              path = error.message.match(/\$[\w.]+/i)[0].replace('$', '');
            } catch (e) {
              // Assuming engine is set to wiredTiger
              path = error.message.match(/index: ([\w.]*)/i)[1];
            }
            rawError.add(path, 'genericErrors.unique');
            throw rawError;
          }
          case 16837: {
            let path;
            try {
              // Assuming engine is set to mmapv1
              path = error.message.match(/'([\w._-]*)' \b/i)[1];
            } catch (e) {
              // Assuming engine is set to wiredTiger
              path = 'parameters';
            }
            rawError.add(path, 'genericErrors.invalidArrayOperation');
            throw rawError;
          }
          default: {
            console.error({
              event: 'mongo_error',
              timestamp: new Date(),
              error: error,
              stack: error.stack,
            });
  
            rawError.add('parameter', 'genericErrors.invalid');
            throw rawError;
          }
        }
      }
  
      console.error({
        event: 'mongo_driver_error',
        timestamp: new Date(),
        error: error,
        stack: error.stack,
      });
      rawError.add('parameter', 'genericErrors.invalid');
      throw rawError;
    }
    /*
      Transforms the mongoose validation or type-cast errors and throws builtError.
     */
    /* istanbul ignore next */
    function transformMongooseError(
      err,
      rawError: BuiltError,
    ): BuiltError {
      for (const errName in err.errors) {
        const errorKey = errName || err.errors[errName].path;
        const errorInfo = err.errors[errName];
        if (errorInfo.name === 'ValidatorError') {
          /**
           * In mongoose 4.x, validator throw error with new format
           * kind field contain the name of the validator
           */
          if (err.errors[errName].kind) {
            switch (err.errors[errName].kind) {
              case 'required':
                rawError.add(errorKey, 'genericErrors.mandatory');
                break;
              case 'regexp':
                rawError.add(errorKey, 'genericErrors.regex');
                break;
              case 'unique':
                rawError.add(errorKey, 'genericErrors.unique');
                break;
              case 'uniquePath':
                rawError.add(errorKey, 'genericErrors.unique');
                break;
              case 'min':
                rawError.add(errorKey, 'genericErrors.min', {
                  min: errorInfo.properties.min,
                });
                break;
              case 'max':
                rawError.add(errorKey, 'genericErrors.max', {
                  max: errorInfo.properties.max,
                });
                break;
              case 'enum':
                rawError.add(errorKey, 'genericErrors.inclusion');
                break;
              case 'minlength':
                rawError.add(errorKey, 'genericErrors.minLength', {
                  min: errorInfo.properties.minlength,
                });
                break;
              case 'maxlength':
                rawError.add(errorKey, 'genericErrors.maxLength', {
                  max: errorInfo.properties.maxlength,
                });
                break;
              case 'user defined':
                rawError.add(errorKey, errorInfo.message);
                break;
            }
          }
        } else if (errorInfo.name === 'CastError') {
          rawError.add(errorKey, 'genericErrors.castError', {
            val: errorInfo.kind || 'valid type',
          });
        } else if (errorInfo.name === 'ObjectParameterError') {
          rawError.add(errorKey, 'genericErrors.invalid');
        } else {
          rawError.add('parameter', 'genericErrors.invalid');
        }
      }
  
      throw rawError;
    }
    /*
      Wrapper to update a document
      @param params The parameters by which to update the document
      @param overrideAccessibles If set to true, will ignore the accessibles
      @return promise A promise to save the document
    */
    /* istanbul ignore next */
    schema.methods.updateDocument = function (
      params: Record<string, any>,
      session?: mongoose.ClientSession,
      overrideAccessibles?: boolean,
    ) {
      const originalParams = _lodash.clone(params);
  
      if (!overrideAccessibles) {
        params = accessibleParams(params);
      }
  
      if (params) params._originalParams = originalParams;
  
      this.set(params);
      this.isUpdate = true;
  
      return Promise.resolve()
        .then(() => {
          markFieldsModified.call(this, params);
          return this.save({ session });
        })
        .catch(function (err) {
          throw transformError(err);
        });
    };
  
    schema.statics.findOneAndUpdateDocument = function (
      query: Record<string, any>,
      params: Record<string, any>,
      options = {},
      session: mongoose.ClientSession,
      overrideAccessibles?: boolean,
    ) {
      const originalParams = _lodash.clone(params);
      // var now            = new Date().toISOString() //EPOCH change here
      const now = new Date().getTime(); //EPOCH chnage here
  
      if (!overrideAccessibles) {
        params = accessibleParams(params);
      }
  
      if (params) params._originalParams = originalParams;
  
      query = _lodash.merge(query, {
        deleted_at: 'false',
      });
  
      params = _lodash.merge(params, {
        updated_at: now,
      });
      const { $inc } = params;
  
      const update = {
        ...(params.$inc && delete params.$inc && { $inc }),
        $set: params,
        $setOnInsert: {
          created_at: now,
        },
      };
      options = Object.assign(
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
        options,
      );
      markFieldsModified.call(this, params);
      return (
        Promise.resolve()
  
          .then(() => {
            ensureIndex(this);
          })
          .then(() => {
            return this.findOneAndUpdate(query, update, options).session(session);
          })
          .then((response) => {
            // if (response) updateDelta(response); //todo need to add
            return response;
          })
          /* istanbul ignore next */
  
          .catch(function (err) {
            throw transformError(err);
          })
      );
    };
  
    /*
    Wrapper to soft delete a document
    @param params The parameters by which to update the document
    @param overrideAccessibles If set to true, will ignore the accessibles
    @return promise A promise to delete the document
  */
    schema.methods.deleteDocument = function (
      params: Record<string, any>,
      session?: mongoose.ClientSession,
      overrideAccessibles?: boolean,
    ) {
      params = params || {};
      const originalParams = _lodash.clone(params);
  
      if (!overrideAccessibles) {
        params = accessibleParams(params);
      }
  
      if (params) params._originalParams = originalParams;
  
      this.set(params);
      this.isDelete = true;
  
      return (
        Promise.resolve()
          .then(() => {
            return this.save({ validateBeforeSave: false, session });
          })
          /* istanbul ignore next */
  
          .catch(function (err) {
            throw transformError(err);
          })
      );
    };
  
    /*
      Exclude the given scope when querying
      @param scopeName The scope to exclude
    */
    /* istanbul ignore next */
    schema.statics.excludeScope = function (scopeName: string) {
      this.__excludedScopes = this.__excludedScopes || [];
      this.__excludedScopes.push(scopeName);
      return this;
    };
  
    /*
    Remove all scopes when querying
    @return this Enable chaining
  */
    /* istanbul ignore next */
    schema.statics.unscoped = function () {
      this.__unscoped = true;
      return this;
    };
  
    /*
    Reset all default scopes to normal
    If you have disabled any scoping, this will reenable all of them
    @return this Enable chaining
  */
    schema.statics.scoped = function () {
      this.__unscoped = false;
      this.__excludedScopes = [];
      return this;
    };
  
    /*
      Get the default scopes which are to apply in the query
    */
  
    schema.statics.getDefaultScopes = function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      /* istanbul ignore if */
      if (this.__unscoped) return [];
      else {
        if (that.__excludedScopes)
          return schema.defaultScopes.filter(function (s) {
            return that.__excludedScopes.indexOf(s.name) < 0;
          });
        else return schema.defaultScopes;
      }
    };
  
    /*
    Shared wrapper for find
  */
    schema.statics._find = function (func) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      return function () {
        const query = {};
        const scopes = this.getDefaultScopes();
  
        scopes.forEach(function (scope) {
          _lodash.extend(
            query,
            _lodash.isFunction(scope.query)
              ? /* istanbul ignore next */ scope.query()
              : scope.query,
          );
        });
  
        // eslint-disable-next-line prefer-rest-params
        const args = Array.prototype.slice.call(arguments, 0, arguments.length);
  
        // handle when query is not an object
        /* istanbul ignore if */
        if (args[0] && !_lodash.isPlainObject(args[0])) {
          throw Error('genericErrors.invalid');
        }
        // handle when option is not an object
        /* istanbul ignore if */
        if (args[2] && !_lodash.isPlainObject(args[2])) {
          throw Error('genericErrors.invalid');
        }
  
        args[0] = args[0] || /* istanbul ignore next */ {}; // custom query
        _lodash.extend(args[0], query);
  
        args[2] = args[2] || {}; // custom options
        args[2].sort = args[2].sort || { updated_at: -1 }; // default sort on updated at
        args[2].skip = +args[2].skip || 0; // default skip
        args[2].limit = +args[2].limit || 1000; // default limit, max limit is 1000
        args[2].limit =
          args[2].limit > 1000 ? /* istanbul ignore next */ 1000 : args[2].limit; // default limit, max limit is 1000
  
        this.scoped();
        return func.apply(that, args);
      };
    };
    /* istanbul ignore next */
    schema.statics._count = function (func) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      return function () {
        const query = {};
        const scopes = this.getDefaultScopes();
  
        scopes.forEach(function (scope) {
          _lodash.extend(
            query,
            _lodash.isFunction(scope.query) ? scope.query() : scope.query,
          );
        });
  
        // eslint-disable-next-line prefer-rest-params
        const args = Array.prototype.slice.call(arguments, 0, arguments.length);
  
        // handle when query is not an object
        if (args[0] && !_lodash.isPlainObject(args[0])) {
          throw Error('genericErrors.invalid');
        }
  
        args[0] = args[0] || {}; // custom query
        _lodash.extend(args[0], query);
  
        this.scoped();
        return func.apply(that, args);
      };
    };
  
    /*
      Wrapper for find, to figure in default scopes
    */
    /* istanbul ignore next */
    schema.statics.find = function () {
      // eslint-disable-next-line prefer-rest-params
      return this._find(mongoose.Model.find).apply(this, arguments);
    };
  
    schema.statics.count = function () {
      // eslint-disable-next-line prefer-rest-params
      return this.count(mongoose.Model.countDocuments).apply(this, arguments);
    };
  
    schema.statics.findWithReference = function (
      { query = {}, projection = {}, options = {}, includeCount = false },
      referenceModel,
    ) {
      query = markParsed(query);
      projection = markParsed(projection);
      options = markParsed(options);
      referenceModel = markParsed(referenceModel);
      let count;
      return Promise.resolve()
        .then(() => {
          if (includeCount) return this.count(query);
  
          return null;
        })
        .then((result) => {
          count = result;
          if (referenceModel) {
            return this.find(query, projection, options).populate({
              path: referenceModel,
              options: { _recursed: true },
            });
          }
          return this.find(query, projection, options);
        })
        .then((data) => {
          const response = { data };
          if (includeCount) response['count'] = count;
          return response;
        })
        .catch((err) => {
          throw transformError(err);
        });
    };
  
    /*
      Wrapper for findOne, to figure in default scopes
    */
    schema.statics.findOne = function () {
      // eslint-disable-next-line prefer-rest-params
      return this._find(mongoose.Model.findOne).apply(this, arguments);
    };
    /*
      Get only the accessible params
    */
    /* istanbul ignore next */
    function accessibleParams(params: Record<string, any>) {
      params = params || {};
  
      if (!_lodash.isEmpty(schema.accessibles))
        params = pickNested(params, schema.accessibles);
  
      if (!_lodash.isEmpty(schema.protectedAttrs)) {
        schema.protectedAttrs.forEach(function (attr) {
          if (_lodash.includes(Object.keys(params), attr))
            delete params[attr];
        });
      }
  
      return params;
    }
  
    function markParsed(field: any) {
      try {
        field = JSON.parse(field);
      } catch {}
      return field;
    }
  
    function markFieldsModified(params) {
      function mergeCustomize(source, param) {
        if (_lodash.isArray(source)) {
          source = param;
          return source;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let self = this;
  
      self = _lodash.merge(self, params);
  
      self = _lodash.mergeWith(self, params, mergeCustomize);
  
      self.schema.eachPath((path) => {
        try {
          self.markModified(path);
        } catch (e) {}
      });
    }
  }

  export function getMongooseOptions(dbOptions: Record<string, any>) {
    const newDBOptions = _lodash.cloneDeep(
      dbOptions || /* istanbul ignore next */ {},
    );
    newDBOptions['useNewUrlParser'] = true;
  
    /* istanbul ignore if */
    if (newDBOptions['ssl']) {
      newDBOptions['sslValidate'] = true;
      newDBOptions['sslCA'] = newDBOptions['sslCAPath'];
      newDBOptions['sslCert'] = newDBOptions['sslCertPath'];
      newDBOptions['sslKey'] = newDBOptions['sslCertPath'];
    }
  
    delete newDBOptions['sslCAPath'];
    delete newDBOptions['sslCertPath'];
    delete newDBOptions['dbOptions'];
  
    return newDBOptions;
  }
  
  export function markParsed(field: any) {
    try {
      field = JSON.parse(field);
    } catch {}
    return field;
  }
  
  // Returns a version of the object that contains 'keys'
  /* istanbul ignore next */
  export function pickNested(
    obj: Record<string, any>,
    keys: string[],
    delim?: string,
  ) {
    const picked: Record<string, any> = {};
    delim = delim || '.';
    obj = obj || {};
    keys = keys || [];
  
    function pick(destination, source, key) {
      if (key in source) destination[key] = source[key];
    }
  
    function separate(keys) {
      return {
        nested: keys.filter(function (key) {
          return key.indexOf(delim) >= 0;
        }),
        bare: keys.filter(function (key) {
          return key.indexOf(delim) < 0;
        }),
      };
    }
  
    function first(key) {
      return key.split(delim)[0];
    }
  
    function rest(key) {
      return key.split(delim).splice(1).join(delim);
    }
  
    function groupKeys(keys) {
      return module.exports.groupBy(keys, function (key) {
        return first(key);
      });
    }
  
    function _pickNested(destination, source, keys) {
      keys = separate(keys);
  
      keys.bare.forEach(function (key) {
        pick(destination, source, key);
      });
  
      const diffs = module.exports.difference(
        Object.keys(destination),
        keys.bare,
      );
  
      diffs.forEach(function (key) {
        delete destination[key];
      });
  
      const grouped = groupKeys(keys.nested);
      Object.keys(grouped).forEach(function (key) {
        if (key in destination) {
          if (!module.exports.isArray(source[key])) {
            if (module.exports.isObject(source[key])) {
              _pickNested(
                destination[key],
                source[key],
                grouped[key].map(function (k) {
                  return rest(k);
                }),
              );
            }
          }
        }
      });
    }
  
    _pickNested(picked, obj, keys);
  
    return picked;
  }