import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { CreateAdminDto } from './dto/createAdmin.dto';
import { UpdateAdminDto } from './dto/updateAdmin.dto';
import { UserService } from '../users/users.service';
import { Role } from '../users/dto/createUser.dto';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private userService: UserService,
    ) { }

    async create(dto: CreateAdminDto) {
        const user = await this.userService.createUser({
            email: dto.email,
            password: dto.password,
            role: Role.ADMIN,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            photo: dto.photo,
            active: true,
        });

        return this.prisma.admin.create({
            data: { userId: user.id },
            include: { user: true },
        });
    }

    async findAll() {
        return this.prisma.admin.findMany({
            include: { user: true },
        });
    }

    async findOne(id: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!admin) throw new NotFoundException(`Admin ${id} not found`);
        return admin;
    }

    async update(id: string, dto: UpdateAdminDto) {
        await this.findOne(id);
        return this.prisma.admin.update({
            where: { id },
            data: {
                user: {
                    update: {
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        phone: dto.phone,
                        photo: dto.photo,
                        active: dto.active,
                    },
                },
            },
            include: { user: true },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.admin.delete({ where: { id } });
    }
}