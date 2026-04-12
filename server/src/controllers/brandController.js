import brandService from "../services/brandService.js";

class BrandController {
  // Get all brands with optional filters
  async getAllBrands(req, res) {
    try {
      const filters = {
        search: req.query.search,
        isActive: req.query.isActive,
      };

      const brands = await brandService.getAllBrands(filters);

      return res.status(200).json({
        success: true,
        message: "Brands retrieved successfully",
        data: brands,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve brands",
      });
    }
  }

  async createBrand(req, res) {
    try {
      const brandData = { ...req.body };

      if (req.file) {
        brandData.logo_url = `uploads/brands/${req.file.filename}`;
      }

      const brand = await brandService.createBrand(brandData);

      return res.status(201).json({
        success: true,
        message: "Brand created successfully",
        data: brand,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create brand",
      });
    }
  }

  async updateBrand(req, res) {
    try {
      const brand = await brandService.updateBrand(req.params.id, req.body);

      return res.status(200).json({
        success: true,
        message: "Brand updated successfully",
        data: brand,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update brand",
      });
    }
  }

  // Delete brand
  async deleteBrand(req, res) {
    try {
      const result = await brandService.deleteBrand(req.params.id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete brand",
      });
    }
  }
}

export default new BrandController();
