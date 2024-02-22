import { Module } from '@nestjs/common';
import { BuiltError } from 'common/raw.error';
import { ObjectController } from './object.controller';
import { ObjectService } from './object.service';

@Module({
  imports: [],
  controllers: [ObjectController],
  providers: [ObjectService, BuiltError],
})
export class ObjectModule {}
