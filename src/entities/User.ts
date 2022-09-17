export interface PublicDataUser {
  id: string;
  name: string;
  email: string;
}

export enum UserRole {
  NORMAL = "NORMAL",
  ADMIN = "ADMIN",
}

export class User {
  constructor(
    private id: string,
    private name: string,
    private email: string,
    private password: string,
    private role: UserRole
  ) {}
  static toUserModel(data: any): User | null {
    if (data) {
      return new User(data.id, data.name, data.email, data.password, data.role);
    } else {
      return null;
    }
  }
  public toPublicModel(): PublicDataUser {
    const user: PublicDataUser = {
      id: this.id,
      name: this.name,
      email: this.email,
    };
    return user;
  }
  public getId() {
    return this.id;
  }
  public getName() {
    return this.name;
  }
  public getEmail() {
    return this.email;
  }
  public getPassword() {
    return this.password;
  }
  public getRole() {
    return this.role;
  }
}
