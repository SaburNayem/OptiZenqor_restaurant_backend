import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getMyProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { assignedBranches: true, customerProfile: true },
    });
  }

  updateMyProfile(userId: string, data: { fullName?: string; phone?: string }) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  listStaff() {
    return this.prisma.user.findMany({
      where: {
        role: { in: ['super_admin', 'branch_manager', 'kitchen_viewer'] },
        deletedAt: null,
      },
      include: { assignedBranches: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(dto: CreateStaffDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role as any,
        passwordHash: await bcrypt.hash(dto.password, 10),
      },
    });

    if (dto.branchIds?.length) {
      await this.prisma.staffBranchAssignment.createMany({
        data: dto.branchIds.map((branchId) => ({ userId: user.id, branchId })),
        skipDuplicates: true,
      });
    }

    return this.getMyProfile(user.id);
  }

  async setActive(userId: string, isActive: boolean) {
    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!exists) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id: userId }, data: { isActive } });
  }

  assignBranches(userId: string, branchIds: string[]) {
    return this.prisma.staffBranchAssignment.createMany({
      data: branchIds.map((branchId) => ({ userId, branchId })),
      skipDuplicates: true,
    });
  }
}
