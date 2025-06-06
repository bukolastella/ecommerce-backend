import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto, EditAdminDto } from './dto/admins.dto';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users, UserType } from 'src/users/entities/users.entity';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  createAdmin = async (dto: CreateAdminDto) => {
    const passwordLength = 12;
    const password = randomBytes(passwordLength)
      .toString('base64')
      .slice(0, passwordLength)
      .replace(/\+/g, 'A')
      .replace(/\//g, 'B');

    const user = this.usersRepo.create({
      ...dto,
      isEmailVerfied: true,
      password,
      type: UserType.ADMIN,
    });

    try {
      await this.usersRepo.save(user);
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Welcome Admin',
        template: 'invite-admin',
        context: {
          name: user.name,
          PASSWORD: password,
        },
      });

      return user;
    } catch (error) {
      this.authService.handleDatabaseError(error);
    }
  };

  private async findAdminById(adminId: number): Promise<Users> {
    const admin = await this.usersRepo.findOneBy({
      id: adminId,
      type: UserType.ADMIN,
    });

    if (!admin) {
      throw new NotFoundException('Admin not found!');
    }

    return admin;
  }

  getAllAdmins = async () => {
    const admins = await this.usersRepo.find({
      where: { type: UserType.ADMIN },
    });

    return admins;
  };

  getSingleAdmin = async (adminId: number) => {
    return this.findAdminById(adminId);
  };

  editAdmin = async (dto: EditAdminDto) => {
    const { adminId, role } = dto;

    const updateResult = await this.usersRepo.update(
      { id: adminId, type: UserType.ADMIN },
      { role: role },
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException('Admin not found!');
    }

    return await this.findAdminById(adminId);
  };

  deleteAdmin = async (adminId: number) => {
    const admin = await this.findAdminById(adminId);

    await this.usersRepo.delete({ id: adminId });
    return admin;
  };
}
