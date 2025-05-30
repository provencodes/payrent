import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return cb(
      new BadRequestException('Only images (jpg, jpeg, png, webp) are allowed'),
      false,
    );
  }
  cb(null, true);
};

export const multerOptions: MulterOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per image
  },
};
