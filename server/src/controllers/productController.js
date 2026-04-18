import productService from "../services/productService.js";

class ProductController {
  async getAllProducts(req, res) {
    try {
      const filters = {
        category: req.query.category,
        skinType: req.query.skinType,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        search: req.query.search,
        isActive: req.query.isActive,
        brandId: req.query.brandId,
        sort: req.query.sort,
        page: req.query.page,
        limit: req.query.limit,
      };

      const { products, pagination } =
        await productService.getAllProducts(filters);

      return res.status(200).json({
        success: true,
        message:
          products.length > 0
            ? "Products retrieved successfully"
            : "No products found",
        data: products,
        pagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve products",
      });
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const productId = req.params.id;

      const product = await productService.getProductById(productId);

      return res.status(200).json({
        success: true,
        message: "Product retrieved successfully",
        data: product,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message || "Product not found",
      });
    }
  }

  // Get related products (same category, excluding current)
  async getRelatedProducts(req, res) {
    try {
      const productId = req.params.id;
      const limit = Number(req.query.limit) || 4;

      const related = await productService.getRelatedProducts(productId, limit);

      return res.status(200).json({
        success: true,
        message: "Related products retrieved successfully",
        data: related,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve related products",
      });
    }
  }

  // Create new product (Admin only)
  async createProduct(req, res) {
    try {
      const productData = req.body;

      // Handle uploaded images - normalize paths to use forward slashes
      if (req.files && req.files.length > 0) {
        productData.images = req.files.map((file) => {
          const normalizedPath = file.path.replace(/\\/g, "/");
          return normalizedPath.replace(/^\.\.\//, "");
        });
      }

      const newProduct = await productService.createProduct(productData);

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create product",
      });
    }
  }

  // Update product (Admin only)
  async updateProduct(req, res) {
    try {
      const productId = req.params.id;
      const updateData = req.body;
      const hasRetainedImagesField = Object.prototype.hasOwnProperty.call(
        updateData,
        "retained_images",
      );

      const retainedImages = Array.isArray(updateData.retained_images)
        ? updateData.retained_images
        : [];

      // This is a transient form field, not a DB column.
      delete updateData.retained_images;

      const uploadedImages =
        req.files && req.files.length > 0
          ? req.files.map((file) => {
              const normalizedPath = file.path.replace(/\\/g, "/");
              return normalizedPath.replace(/^\.\.\//, "");
            })
          : [];

      if (Array.isArray(updateData.images) && updateData.images.length > 0) {
        updateData.images = [...updateData.images, ...uploadedImages];
      } else if (hasRetainedImagesField || uploadedImages.length > 0) {
        updateData.images = [...retainedImages, ...uploadedImages];
      }

      const updatedProduct = await productService.updateProduct(
        productId,
        updateData,
      );

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update product",
      });
    }
  }

  // Delete product (Admin only)
  async deleteProduct(req, res) {
    try {
      const productId = req.params.id;

      const result = await productService.deleteProduct(productId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete product",
      });
    }
  }
}

export default new ProductController();
