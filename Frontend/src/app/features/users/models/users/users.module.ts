export enum ROLE {
    ADMIN = 'ADMIN',
    USER = 'USER'
}
export interface UserState {
    users: IUsers[];
    loading: boolean;
    error: string | null;
    currentUser: IUsers | null | undefined;
    token: string | null;
}

export interface IUsers {
    id: string;
    name: string;
    firstName: string;
    mail: string;
    password: string;
    imageUrl?: string;
    role: ROLE;

    online: boolean;
}

export interface UserUpdateRequest {
    name: string;
    firstName: string;
    mail: string;
    imageUrl?: string;
    role: ROLE;
}

export interface IUserUpdateRequest {
    userId: string;
    updates: Partial<IUsers>;
}
export interface IUserUpdateResponse {
    success: boolean;
    message: string;
    updatedUser?: IUsers;
    error?: string;
}


export interface IUserSignupResponse {
    success: boolean;
    message: string;
    user?: IUsers;
    error?: string;
}
