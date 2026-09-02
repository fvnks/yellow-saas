// Force all API routes to be dynamic (no static generation)
// This prevents build-time errors when database is not available
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Layout must export a default function
export default function ApiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
