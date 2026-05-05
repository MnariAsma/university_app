import { Role } from 'src/modules/users/dto/createUser.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

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

  @Roles(Role.STUDENT)
  @Get('student')
  findAllForStudent(@Req() req) {
    return this.announcementsService.findAllForStudent(req.user.id);
  }
}








