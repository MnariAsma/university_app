import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}


  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        photo: dto.photo,
        active: dto.active ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        photo: true,
        active: true,
        createdAt: true,
      },
    });
  }


  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }


  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }


  async updateUser(id: string, UpsateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...UpsateUserDto,
      },
    });
  }


  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}