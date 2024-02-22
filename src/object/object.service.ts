import { Injectable } from '@nestjs/common';
import { BuiltError } from 'common/raw.error';

@Injectable()
export class ObjectService {
  constructor() {}
  async findObject(headers) {
    const error = new BuiltError();
    if(!headers.authtoken) {
      // error.createRAWError({errorKey:"authtoken", path:"genericErrors.header_required", errorData: {}})
      error.add("authtoken","genericErrors.header_required");
      throw error;
      // throw this.builtError.add("authtoken", "header is required field")
      // throw new Error("error throws");
    }
    return 'Hello World!';
  }
}
