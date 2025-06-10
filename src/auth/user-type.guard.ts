import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector, RouteTree } from '@nestjs/core';
import { RequestWithUser } from 'src/profile/profile.controller';
import { IS_USER_TYPE_KEY } from './userType.decorator';
import { UserType } from 'src/users/entities/users.entity';
import { IS_PUBLIC_KEY } from 'src/public.decorator';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const path: string = (request.route as RouteTree).path || request.url || '';

    if (!path.startsWith('/admin')) {
      return true; // Skip guard for non-admin routes
    }

    const { user } = request;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      IS_USER_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (user && requiredRoles) {
      return requiredRoles.includes(user.type);
    }

    // Admin routes
    if (user?.type === UserType.ADMIN && !path.startsWith('/admin')) {
      throw new ForbiddenException('Admins can only access /admin routes');
    }

    // Business routes
    if (user?.type === UserType.BUSINESS && !path.startsWith('/business')) {
      throw new ForbiddenException(
        'Businesses can only access /business routes',
      );
    }

    // User routes
    if (user?.type === UserType.USER && !path.startsWith('/users')) {
      throw new ForbiddenException('Users can only access /users routes');
    }

    return true;
  }
}
