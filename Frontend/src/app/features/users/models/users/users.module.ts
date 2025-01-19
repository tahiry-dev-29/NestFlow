export interface UserState {
    users: IUsers[];
    loading: boolean;
    error: string | null;
    currentUser: IUsers | null | undefined;
}

export interface IUsers {
    id: string;
    name: string;
    firstName: string;
    mail: string;
    password: string;
    imageUrl?: string;
    role: UserEntity.ROLE;

    online: boolean;
}

export interface UserUpdateRequest {
    name: string;
    firstName: string;
    mail: string;
    imageUrl?: string;
    role: UserEntity.ROLE;
}

export namespace UserEntity {
    export enum ROLE {
        ADMIN,
        USER
    }
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

// <Omit<IUsers, 'id' | 'online' >>
/* export type TSignUp = {
    name: string;
    firstName: string;
    mail: string;
    password: string;
    // imageUrl?: string;
    role: UserEntity.ROLE;
    
    // online: boolean;
} */

export interface IUserSignupResponse {
    success: boolean;
    message: string;
    user?: IUsers;
    error?: string;
}
