import { Inject, Injectable } from '@nestjs/common';
import {
  v2 as CloudinaryType,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof CloudinaryType,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const { originalname, buffer } = file as {
      originalname: string;
      buffer: Buffer;
    };
    const fileExtension = path.extname(originalname);
    const key = `uploads/${randomUUID()}${fileExtension}`;

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          { public_id: key },
          (
            error: UploadApiErrorResponse | undefined,
            response: UploadApiResponse,
          ) => {
            if (error) return reject(new Error(error.message));
            resolve(response);
          },
        )
        .end(buffer);
    });

    return result.secure_url;
  }
}
