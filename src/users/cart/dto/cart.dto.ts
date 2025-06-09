import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddCartDto {
  @ApiProperty()
  @IsString()
  productId: number;

  @ApiProperty()
  @IsString()
  quantity: number;
}
