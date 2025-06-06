import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary/cloudinary';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider],
  exports: [UploadService],
})
export class UploadModule {}
