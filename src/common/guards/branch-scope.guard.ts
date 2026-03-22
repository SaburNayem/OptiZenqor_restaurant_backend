import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BRANCH_SCOPE_KEY } from '../decorators/branch-scope.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class BranchScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const branchScoped = this.reflector.getAllAndOverride<boolean>(BRANCH_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!branchScoped) return true;

    const req = context.switchToHttp().getRequest<any>();
    const user = req.user;
    if (user?.role === Role.SUPER_ADMIN) return true;

    const branchId = req.params?.branchId || req.query?.branchId || req.body?.branchId;
    if (!branchId) return true;

    if (!user?.branchIds?.includes(branchId)) {
      throw new ForbiddenException('You are not allowed to access this branch resource');
    }

    return true;
  }
}
