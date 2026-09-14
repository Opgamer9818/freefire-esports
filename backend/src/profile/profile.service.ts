import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // Safe to assume the Profile row exists — FirebaseAuthGuard creates it
  // the moment a User first appears, so every authenticated request here
  // already has one.
  async getMyProfile(user: User) {
    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: { userId: user.id },
    });

    return {
      ...profile,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }

  async updateMyProfile(user: User, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.update({
      where: { userId: user.id },
      data: dto,
    });

    return {
      ...profile,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }
}
