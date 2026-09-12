import { Metadata } from "next";
import PurposeClient from "./PurposeClient";
import { getActivePurposes } from "@/services/purpose.service";

export const metadata: Metadata = {
  title: "Shop by Purpose - GemoStone",
  description: "Filter gemstones and spiritual jewelry by intention and life purpose.",
};

export default async function PurposePage() {
  const purposes = await getActivePurposes();
  return <PurposeClient purposes={purposes} />;
}
