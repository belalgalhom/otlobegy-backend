import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  
  readonly baseDir = path.join(process.cwd(), 'storage', 'uploads');

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const targetDir = path.join(this.baseDir, folder);
      await this.ensureDir(targetDir);

      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(targetDir, fileName);

      await fs.promises.writeFile(filePath, file.buffer);
      this.logger.log(`Uploaded: ${folder}/${fileName}`);

      return `/media/${folder}/${fileName}`;
    } catch (error: any) {
      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) return;

      const relativePath = fileUrl.replace(/^\/media\//, '');
      const filePath = path.join(this.baseDir, relativePath);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`Deleted: ${relativePath}`);
      } else {
        this.logger.warn(`File not found for deletion: ${filePath}`);
      }
    } catch (error: any) {
      this.logger.error(`Delete failed: ${error.message}`);
    }
  }

  async ensureDir(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }
}