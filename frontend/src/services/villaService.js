
import API from './api';

// GET all + stats
export const getVillasWithStats = async () => {
  const response = await API.get('/v1/villas/stats');
  return response.data;
};

// CREATE VILLA
export const createVilla = async (villaData) => {
  const response = await API.post('/v1/villas', villaData);
  return response.data;
};

// UPDATE VILLA (edit + assign owner)
export const updateVilla = async (id, villaData) => {
  const response = await API.put(`/v1/villas/${id}`, villaData);
  return response.data;
};

// DELETE VILLA
export const deleteVilla = async (id) => {
  const response = await API.delete(`/v1/villas/${id}`);
  return response.data;
};

// GET SINGLE VILLA
export const getVilla = async (id) => {
  const response = await API.get(`/v1/villas/${id}`);
  return response.data;
};

// GET OWNER'S VILLA (owner dashboard)
export const getMyVilla = async (ownerId) => {
  const response = await API.get(`/v1/villas/my-villa/${ownerId}`);
  return response.data;
};

