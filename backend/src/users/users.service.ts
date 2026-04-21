import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { email: string; password: string; name?: string; role?: Role }) {
    const email = 'admin@coffee.com';
    const password = 'admin123';
    const name = 'Admin';

    

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (!existing) {
       const hashedPassword = await bcrypt.hash(password, 10);

        await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: 'ADMIN',
          },
        });

      console.log('create ADmin')
    }



    return this.prisma.user.create({
      data: {
        ...data,
        role: data.role || Role.USER,
      },
    });

  

    
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, restaurantId: true, createdAt: true },
    });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        restaurantId: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            imageUrl: true,
          },
        },
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Prevent modifying admin role
    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot modify admin role');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Prevent deleting admin
    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot delete admin');
    }
    return this.prisma.user.delete({
      where: { id: userId },
      select: { id: true, email: true },
    });
  }

  async assignUserToRestaurant(userId: string, restaurantId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { restaurantId },
      select: { id: true, email: true, name: true, role: true, restaurantId: true },
    });
  }
}
