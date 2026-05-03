import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/createProgram.dto';
import { UpdateProgramDto } from './dto/updateProgram.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('programs')
@ApiBearerAuth()
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.create(createProgramDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.programService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    return this.programService.update(id, updateProgramDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programService.remove(id);
  }
}
