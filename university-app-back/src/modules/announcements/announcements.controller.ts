import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { ApiTags } from '@nestjs/swagger';

import { Roles } from 'src/common/decorators/roles.decorator';

type AppRole = Parameters<typeof Roles>[number];

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Roles('TEACHER' as AppRole)
  @Post()
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Req() req) {
    return this.announcementsService.create(req.user.id, createAnnouncementDto);
  }

  @Roles('TEACHER' as AppRole)
  @Get()
  findAll(@Req() req) {
    return this.announcementsService.findAllByTeacher(req.user.id);
  }

  @Roles(Role.STUDENT)
  @Get('student')
  findAllForStudent(@Req() req) {
    return this.announcementsService.findAllForStudent(req.user.id);
  }
}



