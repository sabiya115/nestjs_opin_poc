import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsUppercase } from 'class-validator';
import { HydratedDocument, PopulatedDoc, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';

const random = () => randomBytes(12).toString('hex');

@Schema()
export class Package {
  @Prop({ type: String, required: true })
  name: string;


  @Prop({ type: String, default: random })
  api_key: string;


  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: String,
    validate: [IsUppercase, 'Key must be uppercase'],
  })
  key: string;

  @Prop({
    type: Number,
    default: 0,
  })
  feedback_count: number;

}

export type packageDocument = HydratedDocument<Package>;

export const PackageSchema = SchemaFactory.createForClass(Package); 


PackageSchema.index(
  { key: 1 },
  {
    partialFilterExpression: {
      deleted_at: { $eq: 'false' },
    },
    unique: true,
    name: 'key',
  },
);
