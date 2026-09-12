import { Metadata } from "next";
import { getPurposeDetails, getProductsByPurposeSlug } from "@/services/purpose.service";
import PurposeDetailClient from "./PurposeDetailClient";

interface PurposePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PurposePageProps): Promise<Metadata> {
  const { slug } = await params;
  const purpose = await getPurposeDetails(slug);

  return {
    title: `${purpose.name} - GemoStone`,
    description: purpose.description,
  };
}

export default async function PurposeDetailPage({ params }: PurposePageProps) {
  const { slug } = await params;
  const [purpose, products] = await Promise.all([
    getPurposeDetails(slug),
    getProductsByPurposeSlug(slug),
  ]);

  return <PurposeDetailClient purpose={purpose} products={products} />;
}
