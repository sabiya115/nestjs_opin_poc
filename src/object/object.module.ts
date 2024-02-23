import { Module } from '@nestjs/common';
import { BuiltError } from 'common/raw.error';
import { ObjectController } from './object.controller';
import { ObjectService } from './object.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from './schema/object.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Package.name,
        schema: PackageSchema,
      },
    ]),
  ],
  controllers: [ObjectController],
  providers: [ObjectService, BuiltError],
})
export class ObjectModule {}
