import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { endpoints } from './config/endpoints';

@Injectable()
export class UsersGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    const requestMethod = request.method;

    if (!token) {
      throw new HttpException('Unauthorized', 401);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || '',
      });

      const compatibleEndpoint = endpoints.find(
        (e) => e.endpoint === request.url && e.method === requestMethod,
      );

      const userHasRequiredRole =
        compatibleEndpoint && payload.role === compatibleEndpoint.role;
      const userIsAdmin = payload.role === 'admin';

      if (userIsAdmin) {
        request['user'] = payload;
        return true;
      }

      if (compatibleEndpoint && !userHasRequiredRole) {
        throw new HttpException('Unauthorized', 401);
      }

      request['user'] = payload; // re-assigning the user to the request
    } catch (err) {
      throw new HttpException('Unauthorized', 401);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
