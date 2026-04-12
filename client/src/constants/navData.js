import { HOME_ROUTE, PRODUCT_ROUTE, DOCTORS_ROUTE } from "@/constants/routes";

export const navLinks = [
  { href: HOME_ROUTE, label: "Home" },
  { href: `${HOME_ROUTE}#services`, label: "Services" },
  { href: `${HOME_ROUTE}#brands`, label: "Brands" },
  { href: `${HOME_ROUTE}#how-it-works`, label: "How It Works" },
  { href: `${HOME_ROUTE}#why-us`, label: "Why Us" },
  { href: DOCTORS_ROUTE, label: "Doctors" },
  { href: PRODUCT_ROUTE, label: "Products" },
];
