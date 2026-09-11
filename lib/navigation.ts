import { assets } from "@/lib/assets";
import type { NavItem } from "@/types/shared.types";

export const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    imageUrl: assets.navHome,
    imageWidth: 53,
    imageHeight: 33,
    href: "/",
  },
  {
    id: "wishlist",
    label: "Wishlist",
    imageUrl: assets.navWishlist,
    imageWidth: 57,
    imageHeight: 33,
    href: "/wishlist",
  },
  {
    id: "shop",
    label: "Shop",
    imageUrl: assets.navShop,
    imageWidth: 69,
    imageHeight: 33,
    href: "/collection/all",
  },
  {
    id: "profile",
    label: "Profile",
    imageUrl: assets.navProfile,
    imageWidth: 36,
    imageHeight: 29,
    href: "/profile",
  },
];

