import { SetMetadata } from '@nestjs/common';
import { UserType } from 'src/users/entities/users.entity';

export const IS_USER_TYPE_KEY = 'isUserType';
export const isUserType = (...userTypes: UserType[]) =>
  SetMetadata(IS_USER_TYPE_KEY, userTypes);
