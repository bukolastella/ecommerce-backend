import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DisapproveBusinessDto {
  @ApiProperty()
  @IsString()
  comment: string;
}
