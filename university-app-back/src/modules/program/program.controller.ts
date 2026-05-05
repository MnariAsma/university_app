import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/createProgram.dto';
import { UpdateProgramDto } from './dto/updateProgram.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from 'src/common/decorators/roles.decorator';

type AppRole = Parameters<typeof Roles>[number];

@ApiTags('programs')
@ApiBearerAuth()
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Roles('ADMIN' as AppRole)
  @Post()
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.create(createProgramDto);
  }

  @Roles('ADMIN' as AppRole)
  @Get()
  findAll() {
    return this.programService.findAll();
  }

  @Roles('ADMIN' as AppRole)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programService.findOne(id);
  }

  @Roles('ADMIN' as AppRole)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    return this.programService.update(id, updateProgramDto);
  }

  @Roles('ADMIN' as AppRole)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programService.remove(id);
  }
}



