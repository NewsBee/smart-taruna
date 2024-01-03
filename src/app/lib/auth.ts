// import { User } from 'next-auth';
// import { compare } from 'bcryptjs';
// import prismadb from './prismadb';

// type LoginFn = (username: string, password: string) => Promise<User | null>;

// export const login: LoginFn = async (username, password) => {
//   const user = await prismadb.user.findFirst({
//     where: {
//       email: username,
//     },
//   });

//   if (user && (await compare(password, user.password))) {
//     const userForAuth: User = {
//       id: user.id, // Sesuaikan tipe ID jika diperlukan
//       name: user.username,
//       email: user.email,
//       // Anda juga dapat menambahkan properti lain jika diperlukan, seperti 'image'
//     };

//     return userForAuth;
//   }

//   return null; // Mengembalikan null jika tidak ada user ditemukan atau password tidak cocok
// };
