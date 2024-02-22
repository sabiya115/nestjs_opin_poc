import { HttpException, HttpStatus,  } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";


export function errorResponse(options: {
    message: string;
    httpStatus?: number;
  }) {
    return function (
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor,
    ) {
      const method = descriptor.value;
      //need to work on this
      // let i18n = I18nContext.current();
      // console.log('current language', i18n.lang);
      descriptor.value = new Proxy(method, {
        
        apply: async function (target, thisArg, args) {
          try {
            
            return await target.apply(thisArg, args);
          } catch (errors) {
            throw new HttpException(
              {
                // message: i18n.t(options.message),
                message: options.message,
                errors: errors,
              },
              options.httpStatus || HttpStatus.UNPROCESSABLE_ENTITY,
            );
          }
        },
      });
  
      return descriptor;
    };
  }