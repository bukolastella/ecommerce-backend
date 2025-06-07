import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Category } from 'src/admin/category/entities/category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly catRepo: Repository<Category>,
  ) {}

  private validationOnCreateOrUpdate = async (
    productName?: string,
    categoryId?: number,
    businessId?: number,
  ) => {
    if (!businessId) throw new BadRequestException('Business id not found');

    const cat = await this.catRepo.findOneBy({
      id: categoryId,
    });

    if (!cat) throw new BadRequestException('Category id not found');

    const hasNameByBusiness = await this.productRepo.find({
      where: { businessId: businessId, name: productName },
    });

    if (hasNameByBusiness.length > 0)
      throw new BadRequestException('Name already exists');
  };

  async create(createProductDto: CreateProductDto, businessId?: number) {
    await this.validationOnCreateOrUpdate(
      createProductDto.name,
      createProductDto.categoryId,
      businessId,
    );

    const product = this.productRepo.create({
      ...createProductDto,
      slug: slugify(`${createProductDto.name}-${businessId}`),
      businessId,
    });

    const saved = await this.productRepo.save(product);

    return saved;
  }

  async findAll() {
    return await this.productRepo.find();
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    businessId?: number,
  ) {
    await this.validationOnCreateOrUpdate(
      updateProductDto.name,
      updateProductDto.categoryId,
      businessId,
    );

    await this.findOne(id);

    const product = this.productRepo.create({
      id,
      ...updateProductDto,
      slug: slugify(`${updateProductDto.name}-${businessId}`),
    });

    const saved = await this.productRepo.save(product);

    return saved;
  }

  async remove(id: number) {
    const p = await this.findOne(id);

    await this.productRepo.delete(id);

    return p;
  }
}
