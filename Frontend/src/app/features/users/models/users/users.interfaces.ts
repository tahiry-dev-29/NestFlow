export interface IUsers {
    id: string;
    name: string;
    firstName: string;
    mail: string;
    password: string;
    imageUrl?: string;
    online: boolean;
    active: boolean;
    role: UserEntity.ROLE;
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

