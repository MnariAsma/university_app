import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/createProgram.dto';
import { UpdateProgramDto } from './dto/updateProgram.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('programs')
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.create(createProgramDto);
  }

  @Get()
  findAll() {
    return this.programService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    return this.programService.update(id, updateProgramDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programService.remove(id);
  }
}
