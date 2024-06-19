import { UserEntity } from './../entities/user.entity';

export class ResponseUserDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: string;

  constructor(user: Partial<UserEntity>) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.email = user.email;
    this.lastName = user.lastName;
    this.isActive = user.isActive;
    this.role = user.role;
  }
}
