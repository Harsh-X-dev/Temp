"use server";

import { getActiveCollections } from "@/services/collection.service";
import { getFilterMetadata } from "@/services/product.service";

export async function fetchCategoriesAction() {
  return getActiveCollections();
}

export async function fetchFilterMetadataAction() {
  return getFilterMetadata();
}
