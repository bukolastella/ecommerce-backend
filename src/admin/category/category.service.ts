import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateCategoryDto,
  RemoveCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { PostgreSQLError } from 'src/auth/auth.service';
import slugify from 'slugify';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly catRepo: Repository<Category>,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    image: Express.Multer.File,
  ) {
    const { name } = createCategoryDto;
    const resultFile = await this.uploadService.uploadImage(image);

    const category = this.catRepo.create({
      name,
      image: resultFile,
      slug: slugify(name, {
        lower: true,
      }),
    });

    try {
      return await this.catRepo.save(category);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as PostgreSQLError;

        if (dbError.code === '23505') {
          if (dbError.detail?.includes('email')) {
            throw new BadRequestException('Category name already exists');
          }
          throw new BadRequestException('Resource already exists');
        }
      }
      throw error;
    }
  }

  async findAll() {
    return await this.catRepo.find();
  }

  async findOne(id: number) {
    const cat = await this.catRepo.findOneBy({ id });

    if (!cat) throw new NotFoundException("Can't find category");

    return cat;
  }

  async update(
    id: number,
    updateCategoryDto?: UpdateCategoryDto,
    image?: Express.Multer.File,
  ) {
    const cat = await this.findOne(id);

    if (!image && !updateCategoryDto) {
      throw new BadRequestException('Nothing to update');
    }

    if (updateCategoryDto?.name) {
      cat.name = updateCategoryDto.name;
      cat.slug = slugify(updateCategoryDto.name, {
        lower: true,
      });
    }

    if (image) {
      const resultFile = await this.uploadService.uploadImage(image);
      cat.image = resultFile;
    }

    try {
      return await this.catRepo.save(cat);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error.driverError as PostgreSQLError;

        if (dbError.code === '23505') {
          if (dbError.detail?.includes('name')) {
            throw new BadRequestException('Category name already exists');
          }
          throw new BadRequestException('Resource already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: number, dto: RemoveCategoryDto) {
    const cat = await this.findOne(id);

    if (dto.name !== cat.name.toLowerCase()) {
      throw new BadRequestException('Category name mismatch');
    }

    await this.catRepo.delete(id);

    return cat;
  }
}
