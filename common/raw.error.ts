/* istanbul ignore file */
import * as lodash from 'lodash';
interface errorType {
  GenericError  : Number,
    NotFoundError : Number,
    ConditionError: Number
}
export class BuiltError {
  private errors: RAW.Error[];
  public isBuiltError: boolean;
  private types: errorType;
  private _type: Number;

  constructor() {
    // super()
    this.errors = []; //{}
    this.isBuiltError = true;
    this.types = {
      GenericError  : 422,
    NotFoundError : 404,
    ConditionError: 412
    }
    this._type = this.types.GenericError
  }

  getErrors(){
    return this.errors;
  }

  createRAWError(params: RAW.Error) {
    this.add(params.errorKey, params.path, params.errorData);
  }

  create(params: RAW.Error) {
    this.errors = [];
    this.add(params.errorKey, params.path, params.errorData);
    return this.errors;
  }

  /**
   * This method adds a new error in the Error object container
   * @param {String} errorKey  Unique key describing the error
   * @param {String} errorMessage  Error Message describing the error
   * @param {JSON} errorData Set of the data that express more about the error
   */
  add(path, errorKey, errorData=null) {
    console.log("coming inside add", path, errorKey);
    this.errors.push({
      errorKey: errorKey,
      path:path,
      errorData: errorData || {},
    });
  }

  setType(type) {
    return this._type = (type||this.types.GenericError)
  }

  getType() {
    return this._type;
  }

  isEmpty(){
    return lodash.isEmpty(this.errors);
  }

  // This method concats error message
  concat(errors) {
    this.errors = this.errors.concat(errors);
  }
}
