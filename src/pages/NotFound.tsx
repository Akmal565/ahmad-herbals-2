import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 animate-fade-in">
      <div className="text-center max-w-md">
        <p className="font-display text-8xl font-bold text-primary-200">404</p>
        <h1 className="font-display text-2xl font-bold text-gray-900 mt-2 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="btn-primary"><Home size={18} /> Go Home</Link>
      </div>
    </div>
  );
}
