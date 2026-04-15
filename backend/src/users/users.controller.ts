import { Body, Controller, Delete, Get, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Получить текущего пользователя (с рестораном)
  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.getMe(req.user.id);
  }

  // Admin only
  @Get()
  @Roles(Role.ADMIN)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  // Admin only
  @Patch(':id/role')
  @Roles(Role.ADMIN)
  async updateUserRole(@Param('id') userId: string, @Body() dto: UpdateUserDto) {
    if (dto.role) {
      return this.usersService.updateRole(userId, dto.role);
    }
    return { message: 'No role specified' };
  }

  // Admin only
  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') userId: string) {
    return this.usersService.deleteUser(userId);
  }

  // Admin and Moderator — view all users
  @Get('all')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getAllUsersForModerator() {
    return this.usersService.findAll();
  }
}
