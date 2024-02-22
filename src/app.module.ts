import { join } from 'node:path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import ServiceConfiguration from '../config/configuration';
import {RestModule} from "./rest.module";
import { I18nModule, QueryResolver, AcceptLanguageResolver, HeaderResolver } from 'nestjs-i18n';
// import { validate } from '../../../config/env.validation';
// import { MongooseServiceModule } from 'api/mongoose.module';
// import { RabbitMQModule } from './rabbitmq.module';
// import { Auth0Module } from 'api/shared/auth0/auth0.module';
// import { EventEmitterModule } from '@nestjs/event-emitter';
// import { TransportServiceModule } from 'api/transport.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [ServiceConfiguration],
      isGlobal: true,
    //   validate,
      envFilePath: [join(__dirname, '../../../.env')],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('translation.language'),
        // parserOptions: {
        //   path: configService.get('translation.path'),
        // },
        loaderOptions: {
          path: join(__dirname, '../../translations'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
    }),
    RestModule
    
    // MongooseServiceModule,
    // Auth0Module.forRoot({
    //   // Options for using Management API only except Auth Module
    //   domain: process.env.AUTH0_DOMAIN,
    //   audience: process.env.AUTH0_AUDIENCE,
    //   // Used Only for mgmt client
    //   // M2M Application credentials (Bliss Nest Backend) to consume mgmt API
    //   clientId: process.env.AUTH0_M2M_CLIENT_ID,
    //   clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
    //   tokenProvider: { enableCache: true, cacheTTLInSeconds: 43200 },
    // }),
    // RabbitMQModule,
    // TransportServiceModule,
  ],
})
export class AppModule {}
