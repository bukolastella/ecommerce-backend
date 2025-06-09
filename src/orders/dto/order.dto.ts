import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

// export class CreateOrderDto {
//   @ApiProperty()
//   @IsNumber()
//   quantity: number;

//   @ApiProperty()
//   @IsString()
//   currency: string;

//   @ApiProperty()
//   @IsNumber()
//   amount: number;

//   @ApiProperty({ enum: OrderStatus })
//   @IsEnum(OrderStatus)
//   status: OrderStatus;

//   //
//   @ApiProperty()
//   @IsNumber()
//   productId: number;

//   @ApiProperty()
//   @IsString()
//   productName: string;

//   @ApiProperty()
//   @IsString()
//   productSlug: string;

//   @ApiProperty()
//   @IsString()
//   categoryId: number;

//   @ApiProperty({ type: [String] })
//   @IsArray()
//   @ArrayNotEmpty()
//   @IsString({ each: true })
//   images: string[];
// }

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
