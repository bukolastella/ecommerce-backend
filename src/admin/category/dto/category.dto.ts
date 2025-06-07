import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ format: 'binary', type: 'string' })
  image: File;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class RemoveCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;
}
