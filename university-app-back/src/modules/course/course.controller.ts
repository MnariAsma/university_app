import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseService } from './course.service';
import { createCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('courses')
@ApiBearerAuth()
@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  // @Post()
  // @UseInterceptors(FileInterceptor('file'))
  // create(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() dto: createCourseDto,
  //   @Req() req,
  // ) {
  //   return this.courseService.create(dto, file, req.user.id);
  // }

@Post()
@UseInterceptors(FileInterceptor('file'))
@Roles(Role.ADMIN, Role.TEACHER)
async create(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: createCourseDto,
  @Req() req,
) {
  return this.courseService.create(dto, file, req.user.id);
}

  @Roles(Role.ADMIN, Role.TEACHER)
  @Get('teacher')
  findMyCourses(@Req() req) {
    return this.courseService.findAllByTeacher(req.user.id);
  }

  @Roles(Role.ADMIN, Role.STUDENT)
  @Get('student')
  findForStudent(@Req() req) {
    return this.courseService.findForStudent(
      req.user.programId,
      req.user.semester,
    );
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.courseService.update(id, dto, file, req.user.id);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.courseService.delete(id, req.user.id);
  }
}
