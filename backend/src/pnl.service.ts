import { Injectable, BadRequestException } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as XLSX from 'xlsx';

export interface TransactionData {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface PnlReport {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    margin: number;
  };
  byCategory: {
    category: string;
    total: number;
    type: 'income' | 'expense';
  }[];
  monthly: {
    month: string;
    income: number;
    expense: number;
    profit: number;
  }[];
  raw: TransactionData[];
}

@Injectable()
export class PnlService {
  async parseFile(file: Express.Multer.File): Promise<TransactionData[]> {
    const results: TransactionData[] = [];

    if (file.originalname.endsWith('.csv')) {
      return this.parseCsv(file.buffer);
    } else if (
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls')
    ) {
      return this.parseExcel(file.buffer);
    }

    throw new BadRequestException('Неподдерживаемый формат файла');
  }

  private parseCsv(buffer: Buffer): Promise<TransactionData[]> {
    return new Promise((resolve, reject) => {
      const results: TransactionData[] = [];
      const stringContent = buffer.toString('utf-8');

      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(stringContent);

      bufferStream
        .pipe(csv())
        .on('data', (row: Record<string, string>) => {
          const transaction = this.mapRowToTransaction(row);
          if (transaction) results.push(transaction);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private parseExcel(buffer: Buffer): TransactionData[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: Record<string, string | number>[] = XLSX.utils.sheet_to_json(
      worksheet,
    );

    return data
      .map((row) => this.mapRowToTransaction(row as Record<string, string>))
      .filter((t): t is TransactionData => t !== null);
  }

  private mapRowToTransaction(
    row: Record<string, string>,
  ): TransactionData | null {
    const keys = Object.keys(row);
    
    // Автоматическое определение колонок
    const dateKey = keys.find((k) => k.toLowerCase().includes('date')) || keys[0];
    const descKey =
      keys.find((k) => k.toLowerCase().includes('desc')) ||
      keys.find((k) => k.toLowerCase().includes('name')) ||
      keys[1];
    const catKey =
      keys.find((k) => k.toLowerCase().includes('cat')) || keys[2];
    const amountKey =
      keys.find((k) =>
        ['amount', 'sum', 'total', 'сумма', 'amount'].some((m) =>
          k.toLowerCase().includes(m),
        ),
      ) || keys[3];
    const typeKey =
      keys.find((k) =>
        ['type', 'kind', 'тип', 'вид'].some((m) => k.toLowerCase().includes(m)),
      ) || keys[4];

    if (!row[amountKey]) return null;

    let amount = parseFloat(String(row[amountKey]).replace(/[^\d.-]/g, ''));
    let type: 'income' | 'expense' = 'expense';

    if (row[typeKey]) {
      const typeStr = String(row[typeKey]).toLowerCase();
      if (['income', 'доход', 'приход', 'revenue'].includes(typeStr)) {
        type = 'income';
      }
    } else if (amount > 0) {
      type = 'income';
    } else {
      amount = Math.abs(amount);
    }

    return {
      date: String(row[dateKey] || ''),
      description: String(row[descKey] || ''),
      category: String(row[catKey] || 'Без категории'),
      amount,
      type,
    };
  }

  generatePnl(data: TransactionData[]): PnlReport {
    const totalIncome = data
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = data
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpense;
    const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Группировка по категориям
    const categoryMap = new Map<string, { total: number; type: 'income' | 'expense' }>();
    data.forEach((t) => {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.total += t.amount;
      } else {
        categoryMap.set(t.category, { total: t.amount, type: t.type });
      }
    });

    const byCategory = Array.from(categoryMap.entries()).map(
      ([category, { total, type }]) => ({
        category,
        total: Math.round(total * 100) / 100,
        type,
      }),
    ).sort((a, b) => b.total - a.total);

    // Группировка по месяцам
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    data.forEach((t) => {
      let month = 'Не указано';
      if (t.date) {
        const dateMatch = String(t.date).match(/(\d{4})[-/](\d{1,2})/);
        if (dateMatch) {
          month = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}`;
        }
      }

      const existing = monthlyMap.get(month);
      if (!existing) {
        monthlyMap.set(month, { income: 0, expense: 0 });
      }
      if (t.type === 'income') {
        monthlyMap.get(month)!.income += t.amount;
      } else {
        monthlyMap.get(month)!.expense += t.amount;
      }
    });

    const monthly = Array.from(monthlyMap.entries())
      .map(([month, { income, expense }]) => ({
        month,
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
        profit: Math.round((income - expense) * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        margin: Math.round(margin * 100) / 100,
      },
      byCategory,
      monthly,
      raw: data,
    };
  }

  getSamplePnl(): PnlReport {
    const sampleData: TransactionData[] = [
      { date: '2026-01-05', description: 'Продажа кофе', category: 'Продажи', amount: 150000, type: 'income' },
      { date: '2026-01-10', description: 'Аренда помещения', category: 'Аренда', amount: 50000, type: 'expense' },
      { date: '2026-01-15', description: 'Закупка зёрен', category: 'Закупки', amount: 30000, type: 'expense' },
      { date: '2026-01-20', description: 'Продажа чая', category: 'Продажи', amount: 45000, type: 'income' },
      { date: '2026-02-05', description: 'Продажа кофе', category: 'Продажи', amount: 180000, type: 'income' },
      { date: '2026-02-10', description: 'Аренда помещения', category: 'Аренда', amount: 50000, type: 'expense' },
      { date: '2026-02-12', description: 'Зарплата бариста', category: 'Зарплата', amount: 60000, type: 'expense' },
      { date: '2026-02-18', description: 'Продажа десертов', category: 'Продажи', amount: 55000, type: 'income' },
      { date: '2026-03-01', description: 'Продажа кофе', category: 'Продажи', amount: 200000, type: 'income' },
      { date: '2026-03-05', description: 'Закупка молока', category: 'Закупки', amount: 25000, type: 'expense' },
      { date: '2026-03-10', description: 'Аренда помещения', category: 'Аренда', amount: 50000, type: 'expense' },
      { date: '2026-03-15', description: 'Зарплата бариста', category: 'Зарплата', amount: 60000, type: 'expense' },
    ];

    return this.generatePnl(sampleData);
  }
}
