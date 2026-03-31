import axios from "axios";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const getProfileFromApi = async (token) => {
  try {
    const response = await axios.get(`${apiBase}/users/profile`, {
      headers: { Cookie: `token=${token}` },
    });
    return response.data?.data || null;
  } catch {
    return null;
  }
};
