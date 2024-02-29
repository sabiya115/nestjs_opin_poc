import { PipeTransform, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { exceptionFactory } from "./validation_factory.pipe";

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
  protected key: string;

  constructor(options: { key: string }) {
    this.key = options.key;
  }

  transform(value: any): Types.ObjectId {
    const validObjectId = Types.ObjectId.isValid(value);

    if (!validObjectId) {
      throw exceptionFactory([
        {
          property: this.key,
          value: value,
          constraints: {
            isMongoId: "isMongoId",
          },
        },
      ]);
    }

    return new Types.ObjectId(value);
  }
}
