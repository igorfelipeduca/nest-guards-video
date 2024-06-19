import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signIn(body: SignInDto) {
    const { email, password } = body;

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new HttpException('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new HttpException('Invalid email or password', 401);
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      token: await this.jwtService.signAsync(payload),
    };
  }
}
