import { Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Req } from '@nestjs/common';
import { ObjectService } from './object.service';
import { Request } from 'express';
import { errorResponse } from 'common/utils';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from 'common/pipes';
import { ApiKey } from 'common/decorators';

@Controller('v1/classes/packages/objects')
export class ObjectController {
  constructor(private readonly appService: ObjectService) {
  }
  


  @Get()
  // @errorResponse({
  //   message: "genericErrors.bobject.error.getAll",
  //   httpStatus: HttpStatus.NOT_FOUND,
  // })
  async find(@Req() req:Request, @I18n() i18n: I18nContext) {
    try{
      const res = await this.appService.findObject(req.headers);
      return res;
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

  @Post()
  // @errorResponse({
  //   message: "genericErrors.bobject.error.getAll",
  //   httpStatus: HttpStatus.NOT_FOUND,
  // })
  async create(@ApiKey() api_key: string, @Req() req:Request, @I18n() i18n: I18nContext) {
    console.log("Api key is", api_key, req.headers.authtoken);
    try{
      await this.appService.createObject({api_key, authtoken: req.headers.authtoken});
    }
    catch(errors) {
      console.log("Error is", errors);
      throw new HttpException(
        {
          message: i18n.t('genericErrors.bobject.error.getAll'),
          errors: errors,
        },
        HttpStatus.NOT_FOUND || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Delete('/:packageId')
  // @errorResponse({
  //   message: "genericErrors.bobject.error.getAll",
  //   httpStatus: HttpStatus.NOT_FOUND,
  // })
  async delete(@Req() req:Request, @I18n() i18n: I18nContext, @Param('packageId', new ParseObjectIdPipe({ key: 'projectId' }))
  id: Types.ObjectId) {
    try{
      const res = await this.appService.deleteObject(req.headers, id);
      return res;
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

  @Put('/:packageId')
  // @errorResponse({
  //   message: "genericErrors.bobject.error.getAll",
  //   httpStatus: HttpStatus.NOT_FOUND,
  // })
  async update(@Req() req:Request, @I18n() i18n: I18nContext, @Param('packageId', new ParseObjectIdPipe({ key: 'projectId' }))
  id: Types.ObjectId) {
    try{
      const res = await this.appService.updateObject(req.headers, id);
      return res;
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
