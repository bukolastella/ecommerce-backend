import {
  BadRequestException,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

export const IMAGE_UPLOAD_PIPE = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({
      maxSize: 1_000_000,
      message: 'File too large! Maximum size allowed is 1 MB.',
    }),
    new FileTypeValidator({
      fileType: /^image\/(?!svg\+xml).*$/,
    }),
  ],
  exceptionFactory: (error) => {
    if (error.includes('image/svg+xml') || error.includes('file type')) {
      return new BadRequestException(
        'Only image files (excluding SVG) are allowed.',
      );
    }
    return new BadRequestException(error);
  },
});
