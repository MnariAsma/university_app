import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/common/prisma.service';
import { UserService } from '../users/users.service';

@Module({
    controllers: [AdminController],
    providers: [AdminService, PrismaService, UserService],
    exports: [AdminService],
})
export class AdminModule { }