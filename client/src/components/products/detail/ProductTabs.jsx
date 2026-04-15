"use client";

import { useState } from "react";

// Parse ingredients TEXT → array of trimmed, non-empty strings
const parseIngredients = (raw) => {
  if (!raw) return [];
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-[#2FA4A9]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ProductTabs = ({ product }) => {
  const tabs = [
    {
      key: "description",
      label: "Description",
      hasContent: !!product.description,
    },
    {
      key: "ingredients",
      label: "Ingredients",
      hasContent: !!product.ingredients,
    },
    {
      key: "skinType",
      label: "Skin Type",
      hasContent: Array.isArray(product.skin_type)
        ? product.skin_type.length > 0
        : !!product.skin_type,
    },
  ].filter((tab) => tab.hasContent);

  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "");

  if (tabs.length === 0) return null;

  const ingredientItems = parseIngredients(product.ingredients);

  return (
    <div className="mt-10">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#2FA4A9] text-[#2FA4A9]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-5">

        {/* ── Description ── */}
        {activeTab === "description" && (
          <div className="rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            {product.description ?? "No description available."}
          </div>
        )}

        {/* ── Ingredients ── styled checkmark grid */}
        {activeTab === "ingredients" && (
          ingredientItems.length > 0 ? (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-700">
                Key Ingredients
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {ingredientItems.map((ing) => (
                  <div
                    key={ing}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-[#2FA4A9]/40 hover:bg-[#E8F7F8]/40"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E8F7F8]">
                      <CheckIcon />
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {ing}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              No ingredient information available.
            </div>
          )
        )}

        {/* ── Skin Type ── */}
        {activeTab === "skinType" && (
          <div className="rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            {Array.isArray(product.skin_type)
              ? product.skin_type.join(", ")
              : product.skin_type ?? "No information available."}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductTabs;
