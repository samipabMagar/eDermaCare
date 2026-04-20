import api from "./api";

const getApiErrorMessage = (error, fallbackMessage) => {
  return (
    error.response?.data?.errors?.[0]?.message ||
    error.response?.data?.message ||
    fallbackMessage
  );
};

export const adminService = {
  // User Management
  async getUsers(filters = {}) {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.isActive !== undefined && filters.isActive !== "") {
        params.isActive = filters.isActive;
      }
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await api.get("/users", { params });

      return {
        users: response.data?.data ?? [],
        pagination: response.data?.pagination ?? null,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch users"));
    }
  },

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete user"));
    }
  },

  // Product Management
  async getProducts(filters = {}) {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.brandId) params.brandId = filters.brandId;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await api.get("/products", { params });
      return {
        products: response.data?.data ?? [],
        pagination: response.data?.pagination ?? null,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch products"));
    }
  },

  async createProduct(formData) {
    try {
      const response = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create product"));
    }
  },

  async updateProduct(productId, formData) {
    try {
      const response = await api.put(`/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update product"));
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete product"));
    }
  },

  async getProductById(productId) {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data?.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch product"));
    }
  },

  async getBrands() {
    try {
      const response = await api.get("/brands");
      return response.data?.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch brands"));
    }
  },

  async getBrandById(brandId) {
    try {
      const response = await api.get(`/brands/${brandId}`);
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch brand"));
    }
  },

  async createBrand(formData) {
    try {
      const response = await api.post("/brands", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create brand"));
    }
  },

  async deleteBrand(brandId) {
    try {
      const response = await api.delete(`/brands/${brandId}`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete brand"));
    }
  },

  async updateBrand(brandId, formData) {
    try {
      const response = await api.put(`/brands/${brandId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update brand"));
    }
  },

  // Doctor Management
  async getPendingDoctors() {
    try {
      const response = await api.get("/doctors/admin/pending");
      return response.data?.data ?? [];
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to fetch pending doctors"),
      );
    }
  },

  async approveDoctor(userId) {
    try {
      const response = await api.put(`/doctors/admin/${userId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to approve doctor"));
    }
  },

  async rejectDoctor(userId, rejection_reason) {
    try {
      const response = await api.put(`/doctors/admin/${userId}/reject`, {
        rejection_reason,
      });
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to reject doctor"));
    }
  },

  async getAllDoctors(filters = {}) {
    try {
      const params = {};
      if (filters.is_available !== undefined)
        params.is_available = filters.is_available;
      if (filters.specialization)
        params.specialization = filters.specialization;

      const response = await api.get("/doctors", { params });
      return response.data?.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch doctors"));
    }
  },

  // Admin Order Management
  async getAdminOrders(filters = {}) {
    try {
      const params = {};
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.status) params.status = filters.status;
      if (filters.payment_status)
        params.payment_status = filters.payment_status;
      if (filters.search) params.search = filters.search;

      const response = await api.get("/orders", { params });

      return response.data?.data ?? { orders: [], pagination: null };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch orders"));
    }
  },

  async updateAdminOrderStatus(orderId, status) {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to update order status"),
      );
    }
  },

  // Admin Appointment Management
  async getAdminAppointments(filters = {}) {
    try {
      const params = {};

      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.status) params.status = filters.status;
      if (filters.doctor_user_id)
        params.doctor_user_id = filters.doctor_user_id;
      if (filters.patient_user_id)
        params.patient_user_id = filters.patient_user_id;
      if (filters.doctor) params.doctor = filters.doctor;
      if (filters.patient) params.patient = filters.patient;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.created_from) params.created_from = filters.created_from;
      if (filters.created_to) params.created_to = filters.created_to;
      if (filters.search) params.search = filters.search;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await api.get("/appointments", { params });

      return {
        appointments: response.data?.data?.appointments ?? [],
        pagination: response.data?.data?.meta ?? null,
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to fetch appointments"),
      );
    }
  },

  // Treatment Management
  async getTreatments(filters = {}) {
    try {
      const params = {};
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.search = filters.search;
      if (filters.sort) params.sort = filters.sort;

      const response = await api.get("/treatments/admin/all", { params });
      return {
        treatments: response.data?.data?.treatments ?? [],
        pagination: response.data?.data?.pagination ?? null,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch treatments"));
    }
  },

  async createTreatment(formData) {
    try {
      const response = await api.post("/treatments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create treatment"));
    }
  },

  async updateTreatment(treatmentId, formData) {
    try {
      const response = await api.patch(`/treatments/${treatmentId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update treatment"));
    }
  },

  async deleteTreatment(treatmentId) {
    try {
      await api.delete(`/treatments/${treatmentId}`);
      return true;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete treatment"));
    }
  },

  async getTreatmentBookings(filters = {}) {
    try {
      const params = {};
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.status) params.status = filters.status;

      const response = await api.get("/treatments/bookings", { params });
      return response.data?.data?.appointments ?? [];
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to fetch treatment bookings"),
      );
    }
  },

  async reviewTreatmentBooking(treatmentAppointmentId, payload) {
    try {
      const response = await api.patch(
        `/treatments/bookings/${treatmentAppointmentId}/review`,
        payload,
      );
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to review treatment booking"),
      );
    }
  },

  // Transaction Management
  async getAdminTransactions(filters = {}) {
    try {
      const params = {};
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      if (filters.search) params.search = filters.search;

      const response = await api.get("/transactions", { params });

      return {
        data: response.data?.data ?? [],
        pagination: response.data?.pagination ?? null,
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to fetch transactions"),
      );
    }
  },

  async getTransactionStats() {
    try {
      const response = await api.get("/transactions/stats/overview");
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "Failed to fetch transaction stats"),
      );
    }
  },
};
