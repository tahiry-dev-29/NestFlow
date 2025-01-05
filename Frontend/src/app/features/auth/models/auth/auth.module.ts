import { IUsers } from "../../../users/models/users/users.module";


export interface AuthState {
  isAuthenticated: boolean;
  user?: IUsers; 
  loading: boolean;
  error?: string | null;
  token: string | null;
}

export interface IAuthCredentials {
  mail: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: IUsers;
}

export interface IHttpError {
  message: string;
  status: number;
  timestamp?: string;
}
