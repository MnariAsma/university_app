import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { Roles } from 'src/common/decorators/roles.decorator';

type AppRole = Parameters<typeof Roles>[number];
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const name = file.originalname.split('.')[0];
      const extension = extname(file.originalname);
      const randomName = crypto.randomBytes(16).toString('hex');
      cb(null, `${name}-${randomName}${extension}`);
    },
  }),
};

@ApiTags('requests')
@ApiBearerAuth()
@Controller()
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Roles('STUDENT' as AppRole)
  @Post('requests')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  create(
    @Body() createRequestDto: CreateRequestDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.requestsService.create(req.user.id, createRequestDto, file);
  }

  @Roles('STUDENT' as AppRole)
  @Get('requests/my-requests')
  findMyRequests(@Req() req) {
    return this.requestsService.findMyRequests(req.user.id);
  }

  @Roles('ADMIN' as AppRole)
  @Get('requests')
  findAll() {
    return this.requestsService.findAll();
  }

  @Roles('ADMIN' as AppRole)
  @Patch('requests/:id/status')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  updateStatus(
    @Param('id') id: string,
    @Body() updateRequestStatusDto: UpdateRequestStatusDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.requestsService.updateStatus(id, updateRequestStatusDto, file);
  }

  @Roles('STUDENT' as AppRole)
  @Delete('requests/:id')
  deleteRequest(@Param('id') id: string, @Req() req) {
    return this.requestsService.deleteRequest(id, req.user.id);
  }

  @Roles('STUDENT' as AppRole, 'ADMIN' as AppRole, 'TEACHER' as AppRole)
  @Get('academic-years')
  getAcademicYears() {
    return this.requestsService.getAcademicYears();
  }
}



