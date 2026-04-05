import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { productService } from "@/services/productService";

const initialFilters = {
  category: "",
  skinType: "",
  brandId: "",
  minPrice: "",
  maxPrice: "",
  search: "",
  sort: "newest",
  page: "1",
};

const PAGE_SIZE = 9;

const useProductCatalog = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [brands, setBrands] = useState([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = useMemo(() => {
    return {
      category: searchParams.get("category") ?? "",
      skinType: searchParams.get("skinType") ?? "",
      brandId: searchParams.get("brandId") ?? "",
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      search: searchParams.get("search") ?? "",
      sort: searchParams.get("sort") ?? initialFilters.sort,
      page: searchParams.get("page") ?? initialFilters.page,
    };
  }, [searchParams]);

  const updateQueryParams = useCallback(
    (updates = {}) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value == null) {
          nextParams.delete(key);
          return;
        }

        nextParams.set(key, String(value));
      });

      const queryString = nextParams.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const fetchBrands = useCallback(async () => {
    try {
      const brandList = await productService.getBrands();
      const activeBrands = brandList.filter(
        (brand) => brand.is_active !== false,
      );
      setBrands(activeBrands);
    } catch (err) {
      setBrands([]);
      setError(err.message);
    }
  }, []);

  const fetchProducts = useCallback(async (activeFilters) => {
    try {
      setIsLoading(true);
      setError("");

      const { products: productList, pagination: paginationMeta } =
        await productService.getProducts({
          ...activeFilters,
          limit: PAGE_SIZE,
        });
      const visibleProducts = productList.filter(
        (product) => product.is_active !== false,
      );
      setProducts(visibleProducts);
      setPagination(paginationMeta);
    } catch (err) {
      setProducts([]);
      setPagination(null);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const normalizedSearch = searchDraft.trim();

      if (normalizedSearch === filters.search) {
        return;
      }

      updateQueryParams({ search: normalizedSearch, page: 1 });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchDraft, filters.search, updateQueryParams]);

  const handleFilterChange = (key, value) => {
    if (key === "page") {
      updateQueryParams({ page: value });
      return;
    }

    updateQueryParams({ [key]: value, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchDraft("");
    router.replace(pathname, { scroll: false });
  };

  return {
    brands,
    filters,
    searchDraft,
    isLoading,
    error,
    products,
    pagination,
    setSearchDraft,
    handleFilterChange,
    handleResetFilters,
  };
};

export default useProductCatalog;
