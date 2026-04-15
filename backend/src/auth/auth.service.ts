import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string, role?: Role) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
      role: role || Role.USER,
    });

    const { password: _, ...result } = user;
    const token = await this.getToken(user.id, user.email);
    return { ...result, token };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Получаем ресторан пользователя
    const userData = await this.usersService.getMe(user.id);
    const restaurantId = userData?.restaurantId || null;

    const { password: _, ...result } = user;
    const token = await this.getToken(user.id, user.email, restaurantId);
    return { ...result, token, restaurantId };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  private async getToken(userId: string, email: string, restaurantId?: string | null) {
    const payload: any = { sub: userId, email };
    if (restaurantId) {
      payload.restaurantId = restaurantId;
    }
    return this.jwtService.sign(payload);
  }
}
