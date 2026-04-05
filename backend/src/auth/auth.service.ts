import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    const { password: _, ...result } = user;
    const token = await this.getToken(user.id, user.email);
    return { ...result, token };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const { password: _, ...result } = user;
    const token = await this.getToken(user.id, user.email);
    return { ...result, token };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  private async getToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
