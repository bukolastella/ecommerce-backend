import { Controller } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // // In UploadController (or wherever you call uploadImage):
  // @UseInterceptors(FileInterceptor('avatar'))
  // uploadAvatar(
  //   @UploadedFile() file: Express.Multer.File, // <-- explicitly typed
  // ) {
  //   return this.uploadService.uploadImage(file);
  // }
}
