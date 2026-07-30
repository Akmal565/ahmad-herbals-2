import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 16, showNumber = false, reviewCount }: { rating: number; size?: number; showNumber?: boolean; reviewCount?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">{[1,2,3,4,5].map(i => <Star key={i} size={size} className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />)}</div>
      {showNumber && <span className="text-sm text-gray-600">{rating.toFixed(1)}{reviewCount !== undefined && ` (${reviewCount})`}</span>}
    </div>
  );
}
