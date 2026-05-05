import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/modules/users/dto/createUser.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request.dto';

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

  @Roles(Role.STUDENT)
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

  @Roles(Role.STUDENT)
  @Get('requests/my-requests')
  findMyRequests(@Req() req) {
    return this.requestsService.findMyRequests(req.user.id);
  }

  @Roles(Role.ADMIN)
  @Get('requests')
  findAll() {
    return this.requestsService.findAll();
  }

  @Roles(Role.ADMIN)
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

  @Roles(Role.STUDENT)
  @Delete('requests/:id')
  deleteRequest(@Param('id') id: string, @Req() req) {
    return this.requestsService.deleteRequest(id, req.user.id);
  }

  @Roles(Role.STUDENT, Role.ADMIN, Role.TEACHER)
  @Get('academic-years')
  getAcademicYears() {
    return this.requestsService.getAcademicYears();
  }
}








