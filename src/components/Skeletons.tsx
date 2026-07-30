export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2"><div className="h-3 w-20 skeleton rounded" /><div className="h-4 w-full skeleton rounded" /><div className="h-4 w-2/3 skeleton rounded" /><div className="h-4 w-24 skeleton rounded" /><div className="flex justify-between items-center pt-2"><div className="h-6 w-20 skeleton rounded" /><div className="h-10 w-10 skeleton rounded-lg" /></div></div>
    </div>
  );
}
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>;
}
