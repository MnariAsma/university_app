import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }


  @Get()
  findAll() {
    return this.userService.findAll();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}