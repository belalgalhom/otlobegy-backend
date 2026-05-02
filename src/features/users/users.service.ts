import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import {
  UpdateNotificationSettingsDto,
  ChangePasswordDto,
  UpdateUserDto,
} from './dto/user.dto';
import { CommonSuccess } from '../../common/constants/response.constants';
import { UserErrors } from '../../common/constants/response.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        language: true,
        title: true,
        titleAr: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        notificationSettings: true,
      },
    });

    if (!user) throw new NotFoundException(UserErrors.USER_NOT_FOUND);
    return user;
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
      select: {
        id: true,
        name: true,
        language: true,
        avatar: true,
        email: true,
        phone: true,
        title: true,
        titleAr: true,
      },
    });

    return updated;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });
    if (!user) throw new NotFoundException(UserErrors.USER_NOT_FOUND);

    if (user.avatar) {
      await this.storage.delete(user.avatar);
    }

    const avatarUrl = await this.storage.upload(file, 'avatars');

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return { avatar: avatarUrl, message: CommonSuccess.RESOURCE_UPDATED };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user) throw new NotFoundException(UserErrors.USER_NOT_FOUND);

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException(UserErrors.INVALID_PASSWORD);

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(UserErrors.PASSWORD_SAME_AS_OLD);
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: CommonSuccess.OPERATION_SUCCESS };
  }

  async getNotificationSettings(userId: string) {
    const settings = await this.prisma.notificationSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      return {
        pushEnabled: true,
        orderUpdates: true,
        chatMessages: true,
        promotions: true,
        system: true,
      };
    }

    return settings;
  }

  async updateNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ) {
    const settings = await this.prisma.notificationSetting.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });

    return settings;
  }

  async deleteAccount(userId: string) {
    await this.prisma.$transaction([
      this.prisma.session.deleteMany({ where: { userId } }),
      this.prisma.device.deleteMany({ where: { userId } }),
      this.prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), email: null, phone: null },
      }),
    ]);

    return { message: CommonSuccess.OPERATION_SUCCESS };
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        phone: data.phone,
      },
    });
  }
}
