import { Op } from "sequelize";
import connection from "../configs/db.js";
import productModel from "../models/productModel.js";
import brandModel from "../models/brandModel.js";

class ProductService {
  async getAllProducts(filters = {}) {
    const {
      category,
      skinType,
      minPrice,
      maxPrice,
      search,
      isActive,
      brandId,
      sort,
      page,
      limit,
    } = filters;
    const whereClause = {};

    const sortMap = {
      newest: ["created_at", "DESC"],
      "price-asc": ["price", "ASC"],
      "price-desc": ["price", "DESC"],
      "rating-desc": ["rating", "DESC"],
      "name-asc": ["name", "ASC"],
    };
    const orderBy = sortMap[sort] ?? sortMap.newest;

    if (category) {
      whereClause.category = category;
    }

    if (brandId) {
      whereClause.brand_id = brandId;
    }

    if (skinType) {
      whereClause[Op.and] = connection.literal(
        `JSON_CONTAINS(skin_type, "${skinType}")`,
      );
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = minPrice;
      if (maxPrice) whereClause.price[Op.lte] = maxPrice;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { ingredients: { [Op.like]: `%${search}%` } },
      ];
    }
    if (isActive !== undefined) {
      whereClause.is_active = isActive;
    }

    const include = [
      {
        model: brandModel,
        as: "brand",
        attributes: ["brand_id", "name", "logo_url"],
      },
    ];

    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);
    const hasPagination =
      Number.isInteger(parsedPage) &&
      parsedPage > 0 &&
      Number.isInteger(parsedLimit) &&
      parsedLimit > 0;

    if (!hasPagination) {
      const products = await productModel.findAll({
        where: whereClause,
        include,
        order: [orderBy],
      });

      return {
        products,
        pagination: null,
      };
    }

    const offset = (parsedPage - 1) * parsedLimit;
    const { count, rows } = await productModel.findAndCountAll({
      where: whereClause,
      include,
      order: [orderBy],
      limit: parsedLimit,
      offset,
      distinct: true,
    });

    const totalPages = Math.max(1, Math.ceil(count / parsedLimit));

    return {
      products: rows,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalItems: count,
        totalPages,
        hasPrevPage: parsedPage > 1,
        hasNextPage: parsedPage < totalPages,
      },
    };
  }

  async getProductById(productId) {
    const product = await productModel.findByPk(productId, {
      include: [
        {
          model: brandModel,
          as: "brand",
          attributes: [
            "brand_id",
            "name",
            "description",
            "logo_url",
            "website_url",
          ],
        },
      ],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async createProduct(productData) {
    const newProduct = await productModel.create(productData);

    const productWithBrand = await this.getProductById(newProduct.product_id);
    return productWithBrand;
  }

  async updateProduct(productId, updateData) {
    const product = await productModel.findByPk(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    await product.update(updateData);

    const updatedProduct = await this.getProductById(productId);

    return updatedProduct;
  }

  async getRelatedProducts(productId, limit = 4) {
    const current = await productModel.findByPk(productId, {
      attributes: ["product_id", "category"],
    });

    if (!current) throw new Error("Product not found");

    const related = await productModel.findAll({
      where: {
        category: current.category,
        product_id: { [Op.ne]: current.product_id },
        is_active: true,
      },
      include: [
        {
          model: brandModel,
          as: "brand",
          attributes: ["brand_id", "name", "logo_url"],
        },
      ],
      order: [["rating", "DESC"]],
      limit,
    });

    return related;
  }

  async getAllBrands() {
    try {
      const brands = await brandModel.findAll({
        attributes: ["brand_id", "name", "logo_url"],
        order: [["name", "ASC"]],
      });

      return brands;
    } catch (error) {
      throw new Error("Failed to fetch brands");
    }
  }

  async deleteProduct(productId) {
    const product = await productModel.findByPk(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    await product.destroy();

    return { message: "Product deleted successfully" };
  }
}

export default new ProductService();
