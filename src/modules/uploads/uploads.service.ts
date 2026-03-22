import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  storeLocal(file: Express.Multer.File, folder: string) {
    return {
      storage: 'local',
      folder,
      fileName: file.filename,
      path: `/uploads/${folder}/${file.filename}`,
      s3Ready: true,
    };
  }
}
