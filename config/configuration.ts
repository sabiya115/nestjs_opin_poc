/* istanbul ignore file */
// const getRabbits = () => {
//     const urlsString: string =
//       process.env.DJ_RABBITMQ_URL || 'amqp://localhost:5672';
  
//     return urlsString.split(',');
//   };
  
  export default () => ({
    // microservices: {
    //   test: {
    //     options: {
    //       host: process.env.TEST_MICROSERVIVE_HOST,
    //       port: process.env.TEST_MICROSERVICE_PORT,
    //     },
    //   },
    //   dj: {
    //     redis: {
    //       url: process.env.DJ_REDIS_URL,
    //       ttl: process.env.DJ_REDIS_TTL ?? '3600',
    //     },
    //     rabbitmq: {
    //       url: getRabbits(),
    //     },
    //   },
    // },
    timeout: process.env.TIMEOUT || 60000,
    translation: {
      language: process.env.TRANSLATION_LANGUAGE || 'en',
      path: process.env.TRANSLATION_PATH || 'translations',
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'true',
      methods:
        process.env.CORS_METHODS || 'GET,HEAD,PUT,POST,DELETE,OPTIONS,PATCH',
      allowedHeaders:
        process.env.CORS_ALLOWEDHEADERS ||
        'Content-Type,Authorization,X-Total-Count,api_key,token',
  
      exposedHeaders: process.env.CORS_EXPOSEDHEADERS || 'X-Total-Count',
  
      credentials: process.env.CORS_CREDENTIALS == 'true' ? true : false,
    },
    db: {
      connString: process.env.DBCONNSTRING,
      dbOptions: {
        ssl: process.env.DBSSL,
        sslCAPath: process.env.DBSSLCAPATH,
        sslCertPath: process.env.DBSSLCERTPATH,
      },
    },
    // auth0: {
    //   domain: process.env.AUTH0_DOMAIN,
    //   audience: process.env.AUTH0_AUDIENCE,
    //   client_id: process.env.AUTH0_M2M_CLIENT_ID,
    //   clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
    //   application_client_id: process.env.AUTH0_APPLICATION_CLIENT_ID,
    //   connection_name: process.env.AUTH0_CONNECTION_NAME,
    //   connection_id: process.env.AUTH0_CONNECTION_ID,
    // },
    // secretKey: process.env.SECRET_KEY,
    // cloudinary: {
    //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //   api_key: process.env.CLOUDINARY_API_KEY,
    //   api_secret: process.env.CLOUDINARY_API_SECRET,
    //   use_filename: process.env.CLOUDINARY_USE_FILENAME,
    //   unique_filename: process.env.CLOUDINARY_UNIQUE_FILENAME,
    //   secure: true,
    // },
    // s3: {
    //   bucket: process.env.S3_BUCKET,
    //   expires: process.env.S3_EXPIRES,
    //   region: process.env.S3_REGION,
    //   access_key: process.env.S3_ACCESS_KEY,
    //   secret_access_key: process.env.S3_SECRET_KEY,
    // },
    // integrations: {
    //   jwt_shared_secret: process.env.INTEGRATIONS_JWT_SHARED_SECRET,
    //   connectors: {
    //     auth_success_url_path: process.env.CONNECTORS_AUTH_SUCCESS_URL_PATH,
    //     auth_fail_url_path: process.env.CONNECTORS_AUTH_FAIL_URL_PATH,
    //     jira: {
    //       AUTH_URL: process.env.CONNECTORS_JIRA_AUTH_URL,
    //       API_URL: process.env.CONNECTORS_JIRA_API_URL,
    //     },
    //   },
    // },
    // smtp: {
    //   from: process.env.SMTP_FROM,
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   secure: process.env.SMTP_SECURE,
    //   auth: {
    //     user: process.env.SMTP_AUTH_USER,
    //     pass: process.env.SMTP_AUTH_PASS,
    //   },
    // },
    // basepath: process.env.BASE_PATH || '/',
    // payment: {
    //   secret_Key: process.env.PAYMENT_SECRET_KEY,
    //   method_type: (process.env.PAYMENT_METHOD_TYPE &&
    //     process.env.PAYMENT_METHOD_TYPE.split(',')) || ['card'],
    //   success_url: process.env.PAYMENT_SUCCESS_URL || '',
    //   processing_url: process.env.PAYMENT_PROCESSING_URL || '',
    //   cancel_url: process.env.PAYMENT_CANCEL_URL || '',
    //   endpoint_secret: process.env.PAYMENT_ENDPOINT_SECRET,
    //   expires_at: Number(process.env.PAYMENT_URL_EXPIRES) || 1800000,
    // },
    // application: {
    //   portal: {
    //     url: process.env.APPLICATION_PORTAL_URL ?? 'http://localhost:3000',
    //   },
    // },
    // verify: {
    //   times: Number(process.env.VERIFY_TIMES) || 86400000,
    // },
  });
  