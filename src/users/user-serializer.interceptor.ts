import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Users, UserType } from './entities/users.entity';

// interface RequestWithUser extends Request {
//   user?: Users;
// }

@Injectable()
export class UserSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown): unknown => {
        // const request = context.switchToHttp().getRequest<RequestWithUser>();
        // const currentUser = request.user;

        // if (!currentUser) {
        //   return data;
        // }

        return this.serializeUser(data);
      }),
    );
  }

  // private serializeUser(
  //   data: unknown,
  //   // userType: UserType,
  //   // currentUserId?: number,
  // ): unknown {
  //   if (!data) return data;

  //   // Handle arrays
  //   if (Array.isArray(data)) {
  //     return data.map((item: unknown) => this.serializeUser(item));
  //   }

  //   // Handle objects with user data
  //   if (this.isUserObject(data)) {
  //     //   const isOwnProfile = currentUserId ? data.id === currentUserId : false;
  //     return this.getFieldsForUserType(data as Users);
  //   }

  //   // Handle nested objects
  //   if (this.isPlainObject(data)) {
  //     const result: Record<string, unknown> = { ...data };
  //     Object.keys(result).forEach((key: string) => {
  //       result[key] = this.serializeUser(result[key]);
  //     });
  //     return result;
  //   }

  //   return data;
  // }

  // Type guard to check if data is a user object

  private serializeUser(data: unknown): unknown {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.serializeUser(item));
    }

    if (this.isUserObject(data)) {
      return this.getFieldsForUserType(data as Users);
    }

    if (this.isPlainObject(data)) {
      const result: Record<string, unknown> = { ...data };
      for (const key of Object.keys(result)) {
        result[key] = this.serializeUser(result[key]);
      }
      return result;
    }

    return data;
  }

  private isUserObject(data: unknown): data is Record<string, any> & {
    id: number;
    type: UserType;
    email: string;
  } {
    return (
      data !== null &&
      typeof data === 'object' &&
      'type' in data &&
      'id' in data &&
      'email' in data &&
      Object.values(UserType).includes(
        (data as Record<string, unknown>).type as UserType,
      )
    );
  }

  // Type guard to check if data is a plain object (not array, not null, not primitive)
  private isPlainObject(data: unknown): data is Record<string, unknown> {
    return (
      data !== null &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data.constructor === Object
    );
  }

  //   private filterUserFields(
  //     user: Users,
  //     requestingUserType: UserType,
  //     isOwnProfile = false,
  //   ): Record<string, unknown> {
  //     const {
  //       password,
  //       emailVerificationExpiresAt,
  //       emailVerificationHash,
  //       forgotPasswordExpiresAt,
  //       forgotPasswordHash,
  //       passwordChangedAt,
  //       ...cleanUser
  //     } = user;
  //     void password;
  //     void emailVerificationExpiresAt;
  //     void emailVerificationHash;
  //     void forgotPasswordExpiresAt;
  //     void forgotPasswordHash;
  //     void passwordChangedAt;
  //     // const cleanUser = { ...user };
  //     // delete cleanUser.password;
  //     // delete cleanUser.emailVerificationHash;
  //     // delete cleanUser.emailVerificationExpiresAt;
  //     // delete cleanUser.forgotPasswordHash;
  //     // delete cleanUser.forgotPasswordExpiresAt;
  //     // delete cleanUser.passwordChangedAt;

  //     // If viewing own profile, show fields based on your own type
  //     if (isOwnProfile) {
  //       return this.getFieldsForUserType(cleanUser, user.type, true);
  //     }

  //     // If admin is viewing, show fields based on target user's type
  //     if (requestingUserType === UserType.ADMIN) {
  //       return this.getFieldsForUserType(cleanUser, user.type, false, true);
  //     }

  //     // For non-admin users viewing others, show limited fields based on target type
  //     return this.getFieldsForUserType(cleanUser, user.type, false, false);
  //   }

  private getFieldsForUserType(
    user: Users,
    // targetUserType: UserType,
    // isOwner = false,
    // isAdminViewing = false,
  ): Record<string, unknown> {
    const targetUserType = user.type;

    const baseFields: Record<string, unknown> = {
      id: user.id,
      name: user.name,
      type: user.type,
      avatar: user.avatar,
      email: user.email,
      isEmailVerfied: user.isEmailVerfied,
    };

    switch (targetUserType) {
      case UserType.ADMIN:
        return {
          ...baseFields,
          role: user.role,
        };

      case UserType.BUSINESS:
        return {
          ...baseFields,
          phone: user.phone,
          businessVerfied: user.businessVerfied,
        };

      case UserType.USER:
      default:
        return {
          ...baseFields,
          phone: user.phone,
        };
    }
  }
}
