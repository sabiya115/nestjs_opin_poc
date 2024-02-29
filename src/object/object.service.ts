import { Inject, Injectable } from '@nestjs/common';
import { BuiltError } from 'common/raw.error';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { PackageDocument, Package, PackageSchema } from './schema/object.schema';
import {Document, Model, Schema as MongooseSchema, Types} from "mongoose";
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { getModelForClass } from '@typegoose/typegoose';


@Injectable()
export class ObjectService {
  constructor(@InjectModel(Package.name) private packageModel: Model<Package>) {
  }

  async createDynamicModel(collectionName) {

    if (this.packageModel.db.models[collectionName]) {
      return this.packageModel.db.models[collectionName];
    }

    const schema = new MongooseSchema({}, { collection: collectionName });
    const dynamicModel = this.packageModel.db.model(collectionName, schema);
    dynamicModel.schema.add(PackageSchema);
    return dynamicModel;
  }

  async createObject(headers) {
    const error = new BuiltError();
    if(!headers.authtoken) {
      error.add("authtoken","genericErrors.header_required");
      throw error;
      
    }

    let collectionName = `${headers.api_key}.packages`;
    let model = await this.createDynamicModel(collectionName);
    // @ts-ignore
    const res = await model.createDocument({name: "NBA F1 skyhawks",
    api_key: "some_random_third_key"
    });
    return 'Hello World!';
  }

  async findObject(headers) {
    let collectionName = `${headers.api_key}.packages`;
    const error = new BuiltError();
    if(!headers.authtoken) {
      error.add("authtoken","genericErrors.header_required");
      throw error;
     
    }
   
    let model = await this.createDynamicModel(collectionName);
    const res = await model.find({});

    return res;
  }

  async deleteObject(headers, _id: Types.ObjectId) {
    let collectionName = `${headers.api_key}.packages`;
    const error = new BuiltError();
    if(!headers.authtoken) {
      error.add("authtoken","genericErrors.header_required");
      throw error;
    }


    let model = await this.createDynamicModel(collectionName);
    const doc = await model.findOne({_id});
    if (!doc) {
      error.add("not found","genericErrors.invalid_id");
      throw error;
    }
    return doc.deleteDocument();
  }

  async updateObject(headers, _id: Types.ObjectId) {
    let collectionName = `${headers.api_key}.packages`;
    const error = new BuiltError();
    if(!headers.authtoken) {
      error.add("authtoken","genericErrors.header_required");
      throw error;
    }


    let model = await this.createDynamicModel(collectionName);
    return await model.findOneAndUpdateDocument({_id},{api_key: "updated_key"});
    
  }
}


