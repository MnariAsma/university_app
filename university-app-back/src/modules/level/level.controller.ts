import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/createLevel.dto';
import { UpdateLevelDto } from './dto/updateLevel.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from 'src/common/decorators/roles.decorator';

type AppRole = Parameters<typeof Roles>[number];

@ApiTags('Levels')
@ApiBearerAuth()
@Controller('levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Roles('ADMIN' as AppRole)
  @Post()
  @ApiOperation({ summary: 'Create a new level' })
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelService.create(createLevelDto);
  }

  @Roles('ADMIN' as AppRole)
  @Get()
  @ApiOperation({ summary: 'Get all levels' })
  findAll() {
    return this.levelService.findAll();
  }

  @Roles('ADMIN' as AppRole)
  @Get(':id')
  @ApiOperation({ summary: 'Get a level by id' })
  findOne(@Param('id') id: string) {
    return this.levelService.findOne(id);
  }

  @Roles('ADMIN' as AppRole)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a level' })
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.levelService.update(id, updateLevelDto);
  }

  @Roles('ADMIN' as AppRole)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a level' })
  remove(@Param('id') id: string) {
    return this.levelService.remove(id);
  }
}



