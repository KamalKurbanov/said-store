import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum TransactionTypeDto {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum PaymentMethodDto {
  CARD = 'card',
  CASH = 'cash',
  INVOICE = 'invoice',
}

export enum TransactionStatusDto {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export class CreateTransactionDto {
  @IsEnum(TransactionTypeDto)
  type: TransactionTypeDto;

  @IsString()
  category: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TransactionStatusDto)
  @IsOptional()
  status?: TransactionStatusDto;

  @IsString()
  restaurantId: string;
}

export class UpdateTransactionDto {
  @IsEnum(TransactionTypeDto)
  @IsOptional()
  type?: TransactionTypeDto;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(PaymentMethodDto)
  @IsOptional()
  paymentMethod?: PaymentMethodDto;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TransactionStatusDto)
  @IsOptional()
  status?: TransactionStatusDto;
}
