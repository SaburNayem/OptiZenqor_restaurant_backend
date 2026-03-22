import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadsService } from './uploads.service';

function storage(folder: string) {
  return diskStorage({
    destination: `uploads/${folder}`,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`),
  });
}

@ApiTags('Uploads')
@Controller({ path: 'uploads', version: '1' })
export class UploadsController {
  constructor(private readonly service: UploadsService) {}

  @Post('food')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: storage('food') }))
  food(@UploadedFile() file: Express.Multer.File) { return this.service.storeLocal(file, 'food'); }

  @Post('branch')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: storage('branch') }))
  branch(@UploadedFile() file: Express.Multer.File) { return this.service.storeLocal(file, 'branch'); }

  @Post('brand')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: storage('brand') }))
  brand(@UploadedFile() file: Express.Multer.File) { return this.service.storeLocal(file, 'brand'); }
}
