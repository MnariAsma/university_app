import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/createLevel.dto';
import { UpdateLevelDto } from './dto/updateLevel.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Levels')
@Controller('levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new level' })
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelService.create(createLevelDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all levels' })
  findAll() {
    return this.levelService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get a level by id' })
  findOne(@Param('id') id: string) {
    return this.levelService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a level' })
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.levelService.update(id, updateLevelDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a level' })
  remove(@Param('id') id: string) {
    return this.levelService.remove(id);
  }
}
