import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector, RouteTree } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RequestWithUser } from 'src/profile/profile.controller';
import { IS_PUBLIC_KEY } from 'src/public.decorator';
import { Users } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';

export interface JwtPayload {
  sub: number;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const path: string = (request.route as RouteTree).path || request.url || '';

    if (path.startsWith('/auth')) {
      // Skip guard for auth routes
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(token);
      const user = await this.usersRepo.findOneBy({ id: decoded.sub });

      if (!user)
        throw new UnauthorizedException(
          'The user belonging to this token no longer exists',
        );

      if (user.hasPasswordChangedAfter(decoded.iat)) {
        throw new UnauthorizedException(
          'User recently changed password. please log in again',
        );
      }

      (request as Request & { user?: Users }).user = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
