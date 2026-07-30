import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon, Calendar, User, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import type { BlogPost } from '../types';

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { const { data } = await supabase.from('blog_posts').select('*').eq('is_published', true).order('created_at', { ascending: false }); if (data) setPosts(data as BlogPost[]); setLoading(false); })(); }, []);
  return (
    <div className="animate-fade-in">
      <div className="bg-gray-50 border-b border-gray-100"><div className="container-app py-3"><div className="flex items-center gap-1.5 text-sm text-gray-500"><Link to="/" className="hover:text-primary-600 flex items-center gap-1"><HomeIcon size={14} /> Home</Link><ChevronRight size={14} /><span className="text-gray-900 font-medium">Blog</span></div></div></div>
      <div className="container-app py-8 lg:py-12"><div className="text-center mb-10"><h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Ahmad Herbals Blog</h1><p className="text-gray-500">Tips, guides, and stories about healthy organic living</p></div>
        {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="card overflow-hidden"><div className="aspect-[16/10] skeleton" /><div className="p-5 space-y-2"><div className="h-4 w-20 skeleton rounded" /><div className="h-5 w-full skeleton rounded" /><div className="h-4 w-full skeleton rounded" /></div></div>)}</div> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{posts.map(post => <Link key={post.id} to={`/blog/${post.slug}`} className="card card-hover group"><div className="aspect-[16/10] overflow-hidden bg-gray-50"><img src={post.image_url} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div><div className="p-5"><div className="flex items-center gap-3 text-xs text-gray-500 mb-2"><span className="badge bg-secondary-100 text-secondary-700">{post.category}</span><span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.created_at)}</span></div><h2 className="font-display text-lg font-semibold text-gray-900 group-hover:text-primary-700 mb-2 line-clamp-2">{post.title}</h2><p className="text-sm text-gray-500 line-clamp-3 mb-3">{post.excerpt}</p><span className="text-sm font-semibold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">Read More <ArrowRight size={14} /></span></div></Link>)}</div>
        )}
      </div>
    </div>
  );
}

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { if (!slug) return; const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle(); if (data) setPost(data as unknown as BlogPost); setLoading(false); })(); }, [slug]);
  if (loading) return <div className="container-app py-20 text-center text-gray-400">Loading...</div>;
  if (!post) return <div className="container-app py-20 text-center"><h1 className="font-display text-2xl font-bold mb-2">Article Not Found</h1><Link to="/blog" className="btn-primary mt-4">Back to Blog</Link></div>;
  return (
    <div className="animate-fade-in">
      <div className="bg-gray-50 border-b border-gray-100"><div className="container-app py-3"><div className="flex items-center gap-1.5 text-sm text-gray-500"><Link to="/" className="hover:text-primary-600 flex items-center gap-1"><HomeIcon size={14} /> Home</Link><ChevronRight size={14} /><Link to="/blog" className="hover:text-primary-600">Blog</Link><ChevronRight size={14} /><span className="text-gray-900 font-medium truncate">{post.title}</span></div></div></div>
      <article className="container-app py-8 lg:py-12 max-w-3xl">
        <span className="badge bg-secondary-100 text-secondary-700 mb-3">{post.category}</span>
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6"><span className="flex items-center gap-1"><User size={14} /> {post.author}</span><span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(post.created_at)}</span></div>
        <div className="aspect-[16/9] rounded-xl overflow-hidden mb-8"><img src={post.image_url} alt={post.title} className="w-full h-full object-cover" /></div>
        <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium">{post.excerpt}</p>
        <p className="text-gray-700 leading-relaxed">{post.content}</p>
        <div className="mt-8 pt-6 border-t border-gray-100"><Link to="/blog" className="btn-outline"><ChevronRight size={18} className="rotate-180" /> Back to Blog</Link></div>
      </article>
    </div>
  );
}
