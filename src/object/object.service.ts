import { Injectable } from '@nestjs/common';
import { BuiltError } from 'common/raw.error';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { packageDocument, Package } from './schema/object.schema';
import {Document, Model} from "mongoose";

@Injectable()
export class ObjectService {
  constructor(@InjectModel(Package.name) private packageModel) {}
  async findObject(headers) {
    const error = new BuiltError();
    if(!headers.authtoken) {
      // error.createRAWError({errorKey:"authtoken", path:"genericErrors.header_required", errorData: {}})
      error.add("authtoken","genericErrors.header_required");
      throw error;
      // throw this.builtError.add("authtoken", "header is required field")
      // throw new Error("error throws");
    }
    const res = await this.packageModel.createDocument({
      name: "NBA F1 pacers",
    api_key: "some_random_key"
    });
    console.log("Response is>>>>>>>", res)
    return 'Hello World!';
  }
}
