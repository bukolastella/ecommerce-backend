import { Injectable, NotFoundException } from '@nestjs/common';
import { Users, UserType } from 'src/users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisapproveBusinessDto } from './dto/business.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    private readonly mailService: MailService,
  ) {}

  async findAll() {
    const businesses = await this.usersRepo.find({
      where: { type: UserType.BUSINESS },
    });

    return businesses;
  }

  async findOne(id: number) {
    const business = await this.usersRepo.findOneBy({
      id,
      type: UserType.BUSINESS,
    });

    if (!business) {
      throw new NotFoundException('Business not found!');
    }

    return business;
  }

  async remove(id: number) {
    const business = await this.findOne(id);

    await this.usersRepo.delete({ id });
    return business;
  }

  approveBusiness = async (id: number) => {
    const business = await this.findOne(id);
    business.businessVerfied = true;
    const updatedBusiness = await this.usersRepo.save(business);
    await this.mailService.sendMail({
      to: business.email,
      subject: 'Business Application Status',
      template: 'business-application-status',
      context: {
        businessName: business.name,
        businessEmail: business.email,
        isApproved: true,
      },
    });

    return updatedBusiness;
  };

  disapproveBusiness = async (id: number, dto: DisapproveBusinessDto) => {
    const business = await this.findOne(id);

    await this.mailService.sendMail({
      to: business.email,
      subject: 'Business Application Status',
      template: 'business-application-status',
      context: {
        businessName: business.name,
        businessEmail: business.email,
        isApproved: false,
        disapprovalReason: dto.comment,
      },
    });

    await this.usersRepo.delete({ id });

    return null;
  };
}
