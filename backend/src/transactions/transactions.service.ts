import { Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';

const typeMap = {
  income: 'INCOME',
  expense: 'EXPENSE',
};

const paymentMap = {
  card: 'CARD',
  cash: 'CASH',
  invoice: 'INVOICE',
};

const statusMap = {
  confirmed: 'CONFIRMED',
  pending: 'PENDING',
  cancelled: 'CANCELLED',
};

const reverseTypeMap = { INCOME: 'income', EXPENSE: 'expense' };
const reversePaymentMap = { CARD: 'card', CASH: 'cash', INVOICE: 'invoice' };
const reverseStatusMap = { CONFIRMED: 'confirmed', PENDING: 'pending', CANCELLED: 'cancelled' };

function toPrismaType(type: string) { return typeMap[type] || type.toUpperCase(); }
function toPrismaPayment(pm: string) { return paymentMap[pm] || pm.toUpperCase(); }
function toPrismaStatus(status: string) { return statusMap[status] || status.toUpperCase(); }

function fromPrisma(tx: any) {
  return {
    ...tx,
    type: reverseTypeMap[tx.type] || tx.type.toLowerCase(),
    paymentMethod: reversePaymentMap[tx.paymentMethod] || tx.paymentMethod.toLowerCase(),
    status: reverseStatusMap[tx.status] || tx.status.toLowerCase(),
    amount: Number(tx.amount),
  };
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const transactions = await this.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return transactions.map(fromPrisma);
  }

  async create(data: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        type: toPrismaType(data.type),
        category: data.category,
        amount: data.amount,
        paymentMethod: toPrismaPayment(data.paymentMethod),
        description: data.description || null,
        status: data.status ? toPrismaStatus(data.status) : 'PENDING',
      },
    });
    return fromPrisma(transaction);
  }

  async update(id: string, data: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Транзакция не найдена');

    const updateData: any = {};
    if (data.type) updateData.type = toPrismaType(data.type);
    if (data.category) updateData.category = data.category;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paymentMethod) updateData.paymentMethod = toPrismaPayment(data.paymentMethod);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status) updateData.status = toPrismaStatus(data.status);

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });
    return fromPrisma(transaction);
  }

  async remove(id: string) {
    const existing = await this.prisma.transaction.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Транзакция не найдена');
    await this.prisma.transaction.delete({ where: { id } });
    return { success: true, id };
  }

  async exportToExcel(): Promise<Buffer> {
    const transactions = await this.prisma.transaction.findMany({
      orderBy: { date: 'desc' },
    });

    const typeLabels: Record<string, string> = { INCOME: 'Доход', EXPENSE: 'Расход' };
    const paymentLabels: Record<string, string> = { CARD: 'Карта', CASH: 'Наличные', INVOICE: 'Счёт' };
    const statusLabels: Record<string, string> = { CONFIRMED: 'Подтверждено', PENDING: 'В обработке', CANCELLED: 'Отменено' };

    const rows: Record<string, string | number>[] = transactions.map((tx) => ({
      'Дата': tx.date.toISOString().slice(0, 10),
      'Тип': typeLabels[tx.type] || tx.type,
      'Категория': tx.category,
      'Сумма': Number(tx.amount),
      'Способ оплаты': paymentLabels[tx.paymentMethod] || tx.paymentMethod,
      'Описание': tx.description || '',
      'Статус': statusLabels[tx.status] || tx.status,
    }));

    // Итоговые строки
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((s, t) => s + Number(t.amount), 0);

    rows.push({ 'Дата': '', 'Тип': 'ИТОГО', 'Категория': '', 'Сумма': totalIncome - totalExpense, 'Способ оплаты': '', 'Описание': '', 'Статус': '' });
    rows.push({ 'Дата': '', 'Тип': 'Общий доход', 'Категория': '', 'Сумма': totalIncome, 'Способ оплаты': '', 'Описание': '', 'Статус': '' });
    rows.push({ 'Дата': '', 'Тип': 'Общий расход', 'Категория': '', 'Сумма': totalExpense, 'Способ оплаты': '', 'Описание': '', 'Статус': '' });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'P&L Отчёт');

    // Ширина колонок
    ws['!cols'] = [
      { wch: 12 }, // Дата
      { wch: 14 }, // Тип
      { wch: 22 }, // Категория
      { wch: 14 }, // Сумма
      { wch: 16 }, // Способ оплаты
      { wch: 35 }, // Описание
      { wch: 16 }, // Статус
    ];

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
