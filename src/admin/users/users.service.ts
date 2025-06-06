import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users, UserType } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
  ) {}

  async findAll() {
    const users = await this.usersRepo.find({
      where: { type: UserType.USER },
    });

    return users;
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOneBy({
      id,
      type: UserType.USER,
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return user;
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    await this.usersRepo.delete({ id });
    return user;
  }
}
