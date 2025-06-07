import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Users } from './users/entities/users.entity';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserSerializerInterceptor } from './users/user-serializer.interceptor';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './admin/roles.guard';
import { ProfileModule } from './profile/profile.module';
import { Category } from './admin/category/entities/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Users, Category],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    MailModule,
    UploadModule,
    AdminModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserSerializerInterceptor,
    },
  ],
})
export class AppModule {}
