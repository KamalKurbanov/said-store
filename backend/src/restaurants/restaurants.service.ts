import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRestaurantDto) {
    // Используем транзакцию: создаём ресторан и обновляем restaurantId у владельца
    const result = await this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: dto,
        include: {
          owner: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      // Если назначен владелец — присваиваем ему restaurantId
      if (dto.ownerId) {
        await tx.user.update({
          where: { id: dto.ownerId },
          data: { restaurantId: restaurant.id },
        });
      }

      return restaurant;
    });

    return result;
  }

  async findAll() {
    return this.prisma.restaurant.findMany({
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
        _count: {
          select: {
            transactions: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        reports: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id "${id}" not found`);
    }

    return restaurant;
  }

  async update(id: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id "${id}" not found`);
    }

    // Используем транзакцию: обновляем ресторан и restaurantId у владельцев
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.restaurant.update({
        where: { id },
        data: dto,
        include: {
          owner: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      // Если ownerId изменился — обновляем restaurantId у обоих пользователей
      if (dto.ownerId !== undefined) {
        // Убираем restaurantId у старого владельца (если он был привязан только к этому ресторану)
        if (restaurant.ownerId) {
          await tx.user.update({
            where: { id: restaurant.ownerId },
            data: { restaurantId: null },
          });
        }

        // Назначаем restaurantId новому владельцу
        if (dto.ownerId) {
          await tx.user.update({
            where: { id: dto.ownerId },
            data: { restaurantId: id },
          });
        }
      }

      return updated;
    });

    return result;
  }

  async remove(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id "${id}" not found`);
    }

    // Убираем restaurantId у владельца перед удалением
    if (restaurant.ownerId) {
      await this.prisma.user.update({
        where: { id: restaurant.ownerId },
        data: { restaurantId: null },
      });
    }

    return this.prisma.restaurant.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}
