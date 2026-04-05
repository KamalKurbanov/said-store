import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';

@Controller('api/transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll() {
    return this.transactionsService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
