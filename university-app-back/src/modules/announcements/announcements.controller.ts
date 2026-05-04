import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Roles(Role.TEACHER)
  @Post()
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Req() req) {
    return this.announcementsService.create(req.user.id, createAnnouncementDto);
  }

  @Roles(Role.TEACHER)
  @Get()
  findAll(@Req() req) {
    return this.announcementsService.findAllByTeacher(req.user.id);
  }
}
