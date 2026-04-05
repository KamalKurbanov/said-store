import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PnlService } from './pnl.service';
import { PrismaService } from './prisma/prisma.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly pnlService: PnlService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype) && !file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
      throw new BadRequestException(
        'Поддерживаются только CSV и Excel файлы',
      );
    }

    try {
      const data = await this.pnlService.parseFile(file);
      const pnlReport = this.pnlService.generatePnl(data);

      // Сохраняем отчёт в БД
      await this.prisma.pnlReport.create({
        data: {
          userId: req.user.id,
          filename: file.originalname,
          data: pnlReport as any,
        },
      });

      return {
        success: true,
        message: 'Файл успешно обработан',
        pnl: pnlReport,
      };
    } catch (error) {
      throw new BadRequestException('Ошибка обработки файла: ' + error.message);
    }
  }

  @Get('pnl/sample')
  getSamplePnl() {
    return {
      success: true,
      pnl: this.pnlService.getSamplePnl(),
    };
  }

  @Get('reports')
  @UseGuards(AuthGuard('jwt'))
  async getReports(@Request() req) {
    return this.prisma.pnlReport.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, filename: true, createdAt: true },
    });
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
