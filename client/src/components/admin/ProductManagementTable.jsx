"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { adminService } from "@/services/adminService";
import {
  formatCategory,
  getFirstImagePath,
  resolveImageUrl,
} from "@/utils/products/productCardHelpers";
import ConfirmModal from "@/components/ui/ConfirmModal";

const ProductManagementTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    product: null,
  });

  useEffect(() => {
    fetchProducts();
  }, [page, category, brand]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { products: data, pagination: paginationData } =
        await adminService.getProducts({
          page,
          limit,
          category: category || undefined,
          search: search || undefined,
        });
      setProducts(data);
      setPagination(paginationData);
    } catch (error) {
      toast.error(error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleBrandChange = (e) => {
    setBrand(e.target.value);
    setPage(1);
  };

  const handleSearch = async () => {
    setPage(1);
    await fetchProducts();
  };

  const categories = useMemo(() => {
    const unique = new Set(
      products.map((item) => item.category).filter(Boolean),
    );
    return Array.from(unique);
  }, [products]);

  const brands = useMemo(() => {
    const uniqueBrands = new Map();

    products.forEach((item) => {
      const brandId = item.brand?.brand_id;
      const brandName = item.brand?.name;

      if (!brandId || !brandName || uniqueBrands.has(brandId)) {
        return;
      }

      uniqueBrands.set(brandId, brandName);
    });

    return Array.from(uniqueBrands, ([brandId, name]) => ({ brandId, name }));
  }, [products]);

  const confirmDelete = (product) => {
    setDeleteModal({ show: true, product });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, product: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      setDeletingId(deleteModal.product.product_id);
      await adminService.deleteProduct(deleteModal.product.product_id);
      setProducts((prev) =>
        prev.filter((p) => p.product_id !== deleteModal.product.product_id),
      );
      closeDeleteModal();
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-(--brand-primary)" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Products Directory
          </h3>
          <p className="text-xs text-slate-600">
            {pagination ? (
              <>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalItems,
                )}{" "}
                of {pagination.totalItems} products
              </>
            ) : (
              <>Total records: {products.length}</>
            )}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-4">
        <div className="min-w-64 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name or brand..."
              value={search}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
            />
          </div>
        </div>

        <select
          value={category}
          onChange={handleCategoryChange}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {formatCategory(item)}
            </option>
          ))}
        </select>

        <select
          value={brand}
          onChange={handleBrandChange}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none focus:border-(--brand-primary) focus:ring-2 focus:ring-(--brand-primary-soft)"
        >
          <option value="">All Brands</option>
          {brands.map((item) => (
            <option key={item.brandId} value={String(item.brandId)}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100/90 backdrop-blur">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 font-semibold text-slate-700">
                Product
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Category
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700">Brand</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Price</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Stock</th>
              <th className="px-4 py-3 font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const imagePath = getFirstImagePath(product.images);
                const imageUrl = resolveImageUrl(imagePath);

                return (
                  <tr
                    key={product.product_id}
                    className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-500">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {product.product_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-700">
                      {formatCategory(product.category || "")}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {product.brand?.name || "N/A"}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900">
                      Rs {Number(product.price || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {product.stock_quantity ?? 0}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/products/${product.product_id}/edit`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                          title="Edit product"
                          aria-label="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => confirmDelete(product)}
                          disabled={deletingId === product.product_id}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white transition hover:bg-rose-600 disabled:opacity-50"
                          title="Delete product"
                          aria-label="Delete product"
                        >
                          {deletingId === product.product_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevPage || loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.show}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${deleteModal.product?.name || "this product"}?`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={Boolean(deletingId)}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default ProductManagementTable;
