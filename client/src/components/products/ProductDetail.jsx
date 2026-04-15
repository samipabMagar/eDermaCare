"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { productService } from "@/services/productService";
import { PRODUCT_ROUTE } from "@/constants/routes";
import ProductImageGallery from "@/components/products/detail/ProductImageGallery";
import ProductInfoPanel from "@/components/products/detail/ProductInfoPanel";
import ProductTabs from "@/components/products/detail/ProductTabs";
import RelatedProducts from "@/components/products/detail/RelatedProducts";

const LoadingSkeleton = () => (
  <div className="mx-auto max-w-5xl animate-pulse px-6 py-10">
    <div className="mb-6 h-4 w-32 rounded-full bg-slate-200" />
    <div className="grid gap-10 md:grid-cols-2">
      <div className="aspect-square rounded-2xl bg-slate-200" />
      <div className="space-y-4">
        <div className="h-6 w-3/4 rounded-full bg-slate-200" />
        <div className="h-4 w-1/2 rounded-full bg-slate-200" />
        <div className="h-4 w-1/3 rounded-full bg-slate-200" />
        <div className="h-10 w-1/4 rounded-full bg-slate-200" />
        <div className="h-12 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  </div>
);

const ProductDetail = ({ id }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (error || !product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <Package className="h-14 w-14 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Product not found</h2>
        <p className="text-sm text-slate-400">
          {error || "This product does not exist."}
        </p>
        <Link
          href={PRODUCT_ROUTE}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#2FA4A9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25888d]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  const images = Array.isArray(product.images)
    ? product.images
    : (() => {
        try {
          return JSON.parse(product.images) || [];
        } catch {
          return [];
        }
      })();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href={PRODUCT_ROUTE}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[#2FA4A9]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductImageGallery images={images} productName={product.name} />
        <ProductInfoPanel product={product} />
      </div>

      <ProductTabs product={product} />

      <RelatedProducts productId={product.product_id} />
    </main>
  );
};

export default ProductDetail;
