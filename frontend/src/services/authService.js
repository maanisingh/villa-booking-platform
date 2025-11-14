// import API from './api';

// export const loginUser = async (email, password) => {
//   try {
//     const response = await API.post('/auth/login', { email, password });
//     return response.data;
//   } catch (error) {
//     // Yahan hum check kar rahe hain ki error kahan se aaya
//     if (error.response && error.response.data) {
//       // Agar Server ne error bheja hai (Jaise: Invalid password)
//       throw error.response.data;
//     } else {
//       // Agar Server band hai ya Network issue hai
//       throw new Error("Server se connect nahi ho pa raha. Kya backend chalu hai?");
//     }
//   }
// };