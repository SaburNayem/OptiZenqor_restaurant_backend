import { Role } from '../enums/role.enum';

export type RequestUser = {
  id: string;
  role: Role;
  email: string;
  branchIds?: string[];
};
