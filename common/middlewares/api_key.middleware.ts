// api-key.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract API key from request headers
    const apiKey = req.headers['api_key'];

    // Attach API key to request object for later access
    req['apiKey'] = apiKey;
    
    next();
  }
}