export enum UserRole {
  User = "User",
  Admin = "Admin"
}

export interface UserWithRole {
  id: string;
  email: string;
  userName: string;
  roles: string[];
  createdAt: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  gender?: string;
  roles: string[];
  createdAt?: string;
}

export interface UpdateUserRoleRequest {
  userId: string;
  role: number; // 0 = User, 1 = Admin
}
