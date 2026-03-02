export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

export interface SessionUser extends AuthUser {
  id: string; // local DB user id
  societyId: string;
  permissions: string[];
}
