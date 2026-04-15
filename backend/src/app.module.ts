import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PnlService } from './pnl.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, TransactionsModule, RestaurantsModule],
  controllers: [AppController],
  providers: [PnlService],
})
export class AppModule {}
