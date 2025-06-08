import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  RemoveCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IMAGE_UPLOAD_PIPE } from 'src/upload/fileValidators';

@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  // @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(IMAGE_UPLOAD_PIPE) image: Express.Multer.File,
  ) {
    return this.categoryService.create(createCategoryDto, image);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: number,
    @Body() updateCategoryDto?: UpdateCategoryDto,
    @UploadedFile(IMAGE_UPLOAD_PIPE) image?: Express.Multer.File,
  ) {
    return this.categoryService.update(id, updateCategoryDto, image);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Body() dto: RemoveCategoryDto) {
    return this.categoryService.remove(id, dto);
  }
}
