import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
