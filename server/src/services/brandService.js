import brandModel from "../models/brandModel.js";
import { Op } from "sequelize";

class BrandService {
  async getAllBrands(filters = {}) {
    const { search, isActive } = filters;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        {
          name: { [Op.like]: `%${search}%` },
        },
        {
          description: { [Op.like]: `%${search}%` },
        },
      ];
    }

    if (isActive !== undefined) {
      whereClause.is_active = isActive;
    }

    const brands = await brandModel.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });

    return brands;
  }

  async createBrand(brandData) {
    const existingBrand = await brandModel.findOne({
      where: { name: brandData.name },
    });

    if (existingBrand) {
      throw new Error("Brand with this name already exists");
    }

    const brand = await brandModel.create(brandData);
    return brand;
  }

  async getBrandById(id) {
    const brand = await brandModel.findByPk(id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    return brand;
  }

  async updateBrand(id, brandData) {
    const brand = await brandModel.findByPk(id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    if (brandData.name && brandData.name !== brand.name) {
      const existingBrand = await brandModel.findOne({
        where: { name: brandData.name },
      });

      if (existingBrand) {
        throw new Error("Brand with this name already exists");
      }
    }

    await brand.update(brandData);
    return brand;
  }

  async deleteBrand(id) {
    const brand = await brandModel.findByPk(id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    await brand.destroy();

    return { message: "Brand deleted successfully" };
  }
}

export default new BrandService();
