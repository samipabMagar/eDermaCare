import ProductCard from "@/components/products/ProductCard";
import { PackageSearch } from "lucide-react";

const getVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
};

// Skeleton card shown while loading
const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
    <div className="h-52 bg-linear-to-br from-slate-100 to-slate-200" />
    <div className="space-y-3 p-4">
      <div className="flex justify-between">
        <div className="h-3 w-16 rounded-full bg-slate-100" />
        <div className="h-3 w-14 rounded-full bg-slate-100" />
      </div>
      <div className="h-4 w-3/4 rounded-full bg-slate-100" />
      <div className="h-3 w-full rounded-full bg-slate-100" />
      <div className="h-3 w-2/3 rounded-full bg-slate-100" />
      <div className="flex justify-between pt-2">
        <div className="h-6 w-20 rounded-full bg-slate-100" />
        <div className="h-9 w-24 rounded-xl bg-slate-100" />
      </div>
    </div>
  </div>
);

const ProductResultsGrid = ({
  isLoading,
  products,
  pagination,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2FA4A9]/10 text-[#2FA4A9]">
          <PackageSearch className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            No products found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try adjusting your filters, search terms, or price range to discover
            more skincare products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-500">
        Showing{" "}
        <span className="font-bold text-[#2FA4A9]">{products.length}</span>{" "}
        {products.length === 1 ? "product" : "products"}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
          <button
            type="button"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex flex-wrap items-center gap-1.5">
            {getVisiblePages(pagination.page, pagination.totalPages).map(
              (pageNumber) => {
                const isCurrent = pagination.page === pageNumber;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => onPageChange(pageNumber)}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      isCurrent
                        ? "bg-[#2FA4A9] text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              },
            )}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductResultsGrid;
