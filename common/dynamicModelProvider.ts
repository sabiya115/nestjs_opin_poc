import {Document, Model, Schema as MongooseSchema, Schema, Types} from "mongoose";

export const createDynamicModel = async(collectionName:string, model, modelSchema:Schema) => {

    console.log("model.db.models[collectionName]", collectionName, model, modelSchema,  model.db.models[collectionName])
    
    if (model.db.models[collectionName]) {
        
      return model.db.models[collectionName];
    }

    const schema = new MongooseSchema({}, { collection: collectionName });
    
    const dynamicModel = model.db.model(collectionName, schema);
    dynamicModel.schema.add(modelSchema);
    return dynamicModel;
  }