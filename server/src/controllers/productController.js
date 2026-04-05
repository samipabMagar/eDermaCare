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
