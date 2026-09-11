import Container from "@/components/layout/Container";

/**
 * Collection layout — Server Component.
 * Wraps every /collection/* page in standard Container layout.
 */
export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container className="pt-4 md:pt-6 lg:pt-8 pb-20 md:pb-6 lg:pb-8">
      {children}
    </Container>
  );
}

