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

  if (filters.category) params.category = filters.category;
  if (filters.skinType) params.skinType = filters.skinType;
  if (filters.search) params.search = filters.search;
  if (filters.brandId) params.brandId = filters.brandId;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters.sort) params.sort = filters.sort;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  return params;
};

export const productService = {
  async getProducts(filters = {}) {
    try {
      const response = await api.get("/products", {
        params: buildQueryParams(filters),
      });

      return {
        products: response.data?.data ?? [],
        pagination: response.data?.pagination ?? null,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load products"));
    }
  },

  // Fetch a single product by its ID  →  GET /api/products/:id
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data?.data ?? null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Product not found"));
    }
  },

  async getBrands() {
    try {
      const response = await api.get("/brands");
      return response.data?.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load brands"));
    }
  },
};
