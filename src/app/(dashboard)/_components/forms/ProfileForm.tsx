// "use client"

// // components/ProfileForm.js
// import React from 'react';
// import { TextField, Button } from '@mui/material';

// interface Props {
//     userData: string;
//     setUserData: string;
//     handleSave : void;
//   }

// const ProfileForm: React.FC<Props> = ({ userData, setUserData, handleSave }) => {
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUserData({ ...userData, [name]: value });
//   };

//   return (
//     <form className="space-y-6">
//       <TextField
//         fullWidth
//         label="Nama"
//         name="name"
//         value={userData.name}
//         onChange={handleChange}
//         variant="outlined"
//         className="mb-4"
//       />
//       <TextField
//         fullWidth
//         label="Email"
//         name="email"
//         value={userData.email}
//         onChange={handleChange}
//         variant="outlined"
//         className="mb-4"
//       />
//       {/* Tambahkan field lain sesuai kebutuhan */}
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleSave}
//         className="w-full"
//       >
//         Simpan Perubahan
//       </Button>
//     </form>
//   );
// };

// export default ProfileForm;
