import API from './api';

// Admin Dashboard ka data lane ke liye
export const getAdminDashboardData = async () => {
  try {
    const response = await API.get('/v1/dashboard/admin');
    return response.data;
  } catch (error) {
    console.error("Dashboard Error:", error);
    throw error;
  }
};