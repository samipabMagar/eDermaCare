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

  if (filters.page) {
    params.page = filters.page;
  }

  if (filters.limit) {
    params.limit = filters.limit;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.specialization) {
    params.specialization = filters.specialization;
  }

  if (typeof filters.isAvailable === "boolean") {
    params.is_available = filters.isAvailable;
  }

  if (filters.sortBy) {
    params.sort_by = filters.sortBy;
  }

  if (filters.approvalStatus) {
    params.approval_status = filters.approvalStatus;
  }

  return params;
};

export const doctorService = {
  async getDoctors(filters = {}) {
    try {
      const response = await api.get("/doctors", {
        params: buildQueryParams(filters),
      });

      const payload = response.data?.data;

      if (Array.isArray(payload)) {
        const approved = payload.filter(
          (doctor) => doctor.approval_status === "approved",
        );

        return {
          doctors: approved,
          pagination: null,
        };
      }

      const doctors = Array.isArray(payload?.doctors) ? payload.doctors : [];
      const approved = doctors.filter(
        (doctor) => doctor.approval_status === "approved",
      );

      return {
        doctors: approved,
        pagination: payload?.pagination || null,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load doctors"));
    }
  },

  async getDoctorByUserId(userId) {
    try {
      const response = await api.get(`/doctors/${userId}`);
      return response.data?.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load doctor details"),
      );
    }
  },

  // Get logged-in doctor's profile
  async getDoctorProfile() {
    try {
      const response = await api.get("/doctors/profile");
      return response.data?.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to load doctor profile"),
      );
    }
  },

  // Update logged-in doctor's professional profile
  async updateDoctorProfile(profileData) {
    try {
      const response = await api.put("/doctors/profile", profileData);
      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to update doctor profile"),
      );
    }
  },

  // Toggle logged-in doctor's availability
  async updateDoctorAvailability() {
    try {
      const response = await api.patch("/doctors/profile/availability");
      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to update availability"),
      );
    }
  },
};
