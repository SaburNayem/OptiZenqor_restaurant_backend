import { SetMetadata } from '@nestjs/common';

export const BRANCH_SCOPE_KEY = 'branch_scope';
export const BranchScope = () => SetMetadata(BRANCH_SCOPE_KEY, true);
