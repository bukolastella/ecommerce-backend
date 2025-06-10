import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RequestWithUser } from 'src/profile/profile.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/public.decorator';

@ApiTags('Business: Product')
@Controller('business/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth('businessToken')
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: RequestWithUser,
  ) {
    return this.productService.create(createProductDto, req.user?.id);
  }

  @Public()
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @ApiBearerAuth('businessToken')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: RequestWithUser,
  ) {
    return this.productService.update(+id, updateProductDto, req.user?.id);
  }

  @ApiBearerAuth('businessToken')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
