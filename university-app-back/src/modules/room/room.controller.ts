import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/modules/users/dto/createUser.dto';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/createRoom.dto';
import { UpdateRoomDto } from './dto/updateRoom.dto';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  findAll() {
    return this.roomService.findAll();
  }

   @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get a room by id' })
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}








