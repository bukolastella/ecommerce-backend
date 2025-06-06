import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector, RouteTree } from '@nestjs/core';
import { UserRole } from './admins/dto/admins.dto';
import { ROLES_KEY } from './roles.decorator';
import { IS_PUBLIC_KEY } from 'src/public.decorator';
import { RequestWithUser } from 'src/profile/profile.controller';

@Injectable()
export class RolesGuard implements CanActivate {
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

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = request;

    return requiredRoles.some((role) => user?.role?.includes(role));
  }
}
