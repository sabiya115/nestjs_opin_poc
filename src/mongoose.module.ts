import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  mongooseCorePlugin,
  getMongooseOptions,
} from '../common/utils';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('db.connString'),
        connectionFactory: async (connection: Connection) => {
          connection.plugin(mongooseCorePlugin);
          return connection;
        },
        ...getMongooseOptions(configService.get('db.dbOptions')),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MongooseServiceModule {}
