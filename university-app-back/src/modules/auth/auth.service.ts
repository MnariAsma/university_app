import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { UserService } from '../users/users.service';
import { PrismaService } from 'src/common/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    private generatePassword(length = 10): string {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
        return Array.from({ length }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length)),
        ).join('');
    }

    private signToken(userId: string, role: string) {
        return this.jwtService.sign({ sub: userId, role });
    }

    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email);

        if (!user) throw new UnauthorizedException('Invalid credentials');
        if (!user.active) throw new UnauthorizedException('Account is disabled');

        const passwordMatch = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

        return {
            accessToken: this.signToken(user.id, user.role),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }

    async registerStudent(dto: RegisterStudentDto) {
        const existing = await this.userService.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already in use');

        const plainPassword = this.generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Auto-generate matricule STD-000001
        const lastStudent = await this.prisma.student.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { matricule: true },
        });

        let nextNumber = 1;
        if (lastStudent?.matricule) {
            const parts = lastStudent.matricule.split('-');
            const numberPart = parseInt(parts[1]);
            if (!isNaN(numberPart)) nextNumber = numberPart + 1;
        }
        const matricule = `STD-${nextNumber.toString().padStart(6, '0')}`;

        // Create user then student in a transaction
        await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    role: Role.STUDENT,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    phone: dto.phone,
                    active: true,
                },
            });

            await tx.student.create({
                data: {
                    userId: user.id,
                    matricule,
                    departmentId: dto.departmentId,
                    programId: dto.programId,
                    groupId: dto.groupId,
                    academicYearId: dto.academicYearId,
                },
            });
        });

        // TODO: replace console.log with real email once mail is configured
        console.log(`✉️  Student credentials → Email: ${dto.email} | Password: ${plainPassword}`);

        return { message: 'Registration successful. Check your email for login credentials.' };
    }
}