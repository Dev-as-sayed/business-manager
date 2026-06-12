export type TUserRole = "admin" | "customer" | "supplier";

export interface TUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: TUserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  consignment: [string];
}
