import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/transactions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(@Request() req, @Query('restaurantId') restaurantId?: string) {
    const userRole = req.user.role;
    const userRestaurantId = req.user.restaurantId;

    // ADMIN видит все транзакции (может фильтровать по restaurantId)
    if (userRole === Role.ADMIN) {
      if (restaurantId) {
        return this.transactionsService.findAllByRestaurant(restaurantId);
      }
      return this.transactionsService.findAll();
    }

    // MODERATOR и USER должны быть привязаны к ресторану
    if (userRole === Role.MODERATOR || userRole === Role.USER) {
      // Если пользователь не привязан к ресторану — возвращаем 403
      if (!userRestaurantId) {
        throw new ForbiddenException(
          'У вас нет доступа к транзакциям. Обратитесь к администратору для добавления прав.'
        );
      }
      
      // Используем restaurantId из токена (привязка пользователя)
      return this.transactionsService.findAllByRestaurant(userRestaurantId);
    }

    // Fallback: если нет ресторана в токене, возвращаем только свои транзакции
    return this.transactionsService.findAllByUser(req.user.id);
  }

  @Get('export')
  async exportExcel(@Request() req, @Res() res: Response, @Query('restaurantId') restaurantId?: string) {
    const userRole = req.user.role;
    const userRestaurantId = req.user.restaurantId;

    let buffer: Buffer;

    // ADMIN экспортирует все транзакции (может фильтровать по restaurantId)
    if (userRole === Role.ADMIN) {
      if (restaurantId) {
        buffer = await this.transactionsService.exportToExcelByRestaurant(restaurantId);
      } else {
        buffer = await this.transactionsService.exportToExcel();
      }
    }
    // MODERATOR и USER экспортируют только транзакции своего ресторана
    else if (userRole === Role.MODERATOR || userRole === Role.USER) {
      // Если пользователь не привязан к ресторану — возвращаем 403
      if (!userRestaurantId) {
        throw new ForbiddenException(
          'У вас нет доступа к экспорту. Обратитесь к администратору для добавления прав.'
        );
      }
      buffer = await this.transactionsService.exportToExcelByRestaurant(userRestaurantId);
    }
    // Fallback: если нет ресторана, экспортируем только свои транзакции
    else {
      buffer = await this.transactionsService.exportToExcel(req.user.id);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=pnl_report_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    res.send(buffer);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateTransactionDto) {
    const userRole = req.user.role;
    const userRestaurantId = req.user.restaurantId;

    // USER и MODERATOR должны быть привязаны к ресторану
    if ((userRole === Role.USER || userRole === Role.MODERATOR) && !userRestaurantId) {
      throw new ForbiddenException(
        'У вас нет доступа к созданию транзакций. Обратитесь к администратору для добавления прав.'
      );
    }

    // USER и MODERATOR — restaurantId из body должен совпадать с их restaurantId из токена
    if (userRole === Role.USER || userRole === Role.MODERATOR) {
      if (dto.restaurantId !== userRestaurantId) {
        throw new ForbiddenException(
          'Вы можете создавать транзакции только для своего ресторана.'
        );
      }
    }

    // ADMIN может создать транзакцию для любого ресторана
    return this.transactionsService.create(dto, req.user.id, dto.restaurantId);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    const userRole = req.user.role;
    const restaurantId = req.user.restaurantId;
    const isAdmin = userRole === Role.ADMIN;

    // USER и MODERATOR должны быть привязаны к ресторану
    if (!isAdmin && !restaurantId) {
      throw new ForbiddenException(
        'У вас нет доступа к редактированию транзакций. Обратитесь к администратору для добавления прав.'
      );
    }

    return this.transactionsService.update(id, dto, req.user.id, restaurantId, isAdmin);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const userRole = req.user.role;
    const restaurantId = req.user.restaurantId;
    const isAdmin = userRole === Role.ADMIN;

    // USER и MODERATOR должны быть привязаны к ресторану
    if (!isAdmin && !restaurantId) {
      throw new ForbiddenException(
        'У вас нет доступа к удалению транзакций. Обратитесь к администратору для добавления прав.'
      );
    }

    return this.transactionsService.remove(id, req.user.id, restaurantId, isAdmin);
  }
}
