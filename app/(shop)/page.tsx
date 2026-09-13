import { Suspense } from "react";
import Home from "./Home";
import HomeLoading from "@/components/home/HomeLoading";

export const revalidate = 60;

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <Home />
    </Suspense>
  );
}
