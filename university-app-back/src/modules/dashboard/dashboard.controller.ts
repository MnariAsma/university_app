import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/modules/users/dto/createUser.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.STUDENT)
  @Get('student')
  getStudentDashboard(@Req() req) {
    return this.dashboardService.getStudentDashboard(req.user.id);
  }

  @Roles(Role.TEACHER)
  @Get('teacher')
  getTeacherDashboard(@Req() req) {
    return this.dashboardService.getTeacherDashboard(req.user.id);
  }
}