import prismadb from "@/app/lib/prismadb";
import { compare, hash } from 'bcryptjs'

type UserData = {
    username?: string;
    email?: string;
    password?: string;
  };

export const createUser = async (username: string, email: string, password: string) => {
    const hashedPassword = await hash(password, 8);

    const user = await prismadb.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });

    return user;
};

export const deleteUser = async (id: number) => {
    const deletedUser = await prismadb.user.delete({
        where: {
            id,
        },
    });

    return deletedUser;
};

export const updateUser = async (id: number, newData: UserData) => {
    const updatedUser = await prismadb.user.update({
        where: {
            id,
        },
        data: newData,
    });

    return updatedUser;
};

export const getUserByEmail = async (email: string) => {
    const user = await prismadb.user.findUnique({
        where: {
            email,
        },
    });

    return user;
};

export const getUserByUsername = async (username: string) => {
    const user = await prismadb.user.findUnique({
        where: {
            username,
        },
    });

    return user;
};

export const verifyPassword = async (hashedPassword: string, password: string): Promise<boolean> => {
    try {
        const isValid = await compare(password, hashedPassword);
        return isValid;
    } catch (error) {
        // Tindakan penanganan kesalahan jika diperlukan
        throw new Error('Error in password verification');
    }
};