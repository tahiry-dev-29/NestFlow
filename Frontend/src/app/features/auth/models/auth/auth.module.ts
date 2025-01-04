import { IUsers } from "../../../users/store/users.store";

export interface AuthState {
  isAuthenticated: boolean;
  user?: IUsers; 
  loading: boolean;
  error?: string | null; // Make error nullable
  token: string | null;
}