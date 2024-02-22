import { Controller, Get, HttpException, HttpStatus, Req } from '@nestjs/common';
import { ObjectService } from './object.service';
import { Request } from '@nestjs/common';
import { errorResponse } from 'common/utils';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('v1/classes/packages/objects')
export class ObjectController {
  constructor(private readonly appService: ObjectService) {}


  @Get()
  // @errorResponse({
  //   message: "genericErrors.bobject.error.getAll",
  //   httpStatus: HttpStatus.NOT_FOUND,
  // })
  async find(@Req() req:Request, @I18n() i18n: I18nContext) {
    console.log("Request object is", req.headers);
    try{
      await this.appService.findObject(req.headers);
    }
    catch(errors) {
      throw new HttpException(
        {
          message: i18n.t('genericErrors.bobject.error.getAll'),
          errors: errors,
        },
        HttpStatus.NOT_FOUND || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
