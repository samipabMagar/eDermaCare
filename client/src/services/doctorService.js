import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

const buildQueryParams = (filters = {}) => {
  const params = {};

  if (filters.specialization) {
    params.specialization = filters.specialization;
  }

  if (typeof filters.isAvailable === "boolean") {
    params.is_available = filters.isAvailable;
  }

  return params;
};

export const doctorService = {
  async getDoctors(filters = {}) {
    try {
      const response = await api.get("/doctors", {
        params: buildQueryParams(filters),
      });

      const doctors = response.data?.data ?? [];

      // Ensure only approved doctors are shown on the public list.
      return doctors.filter((doctor) => doctor.approval_status === "approved");
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load doctors"));
    }
  },

  // Get logged-in doctor's profile
  async getDoctorProfile() {
    try {
      const response = await api.get("/doctors/profile");
      return response.data?.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load doctor profile"));
    }
  },

  // Update logged-in doctor's professional profile
  async updateDoctorProfile(profileData) {
    try {
      const response = await api.put("/doctors/profile", profileData);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update doctor profile"));
    }
  },

  // Toggle logged-in doctor's availability
  async updateDoctorAvailability() {
    try {
      const response = await api.patch("/doctors/profile/availability");
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update availability"));
    }
  },
};
