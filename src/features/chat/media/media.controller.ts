import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ChatMediaService } from './media.service';
import { ALL_ALLOWED_MIME_TYPES, MULTER_MAX_FILE_SIZE } from './media.config';
import { ChatMediaErrors } from '../../../common/constants/response.constants';

@Controller('chat/media')
export class ChatMediaController {
  constructor(private readonly mediaService: ChatMediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),

      limits: {
        fileSize: MULTER_MAX_FILE_SIZE,
        files: 1,
      },

      fileFilter: (_req, file, cb) => {
        if (ALL_ALLOWED_MIME_TYPES.has(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              ChatMediaErrors.UNSUPPORTED_TYPE,
            ),
            false,
          );
        }
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(ChatMediaErrors.NO_FILE);
    }

    return this.mediaService.uploadChatMedia(file);
  }
}