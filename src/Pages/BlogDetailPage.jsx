import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogBySlug } from '../Api/action';
import Header from '../components/Header';
import BlogSidebar from '../components/Blog/BlogSidebar';
import { Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '../Language/LanguageContext';

import { getImageUrl } from '../utils/imageHelper';

export default function BlogDetailPage() {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await getBlogBySlug(slug);
                setBlog(res.data.data);
            } catch (error) {
                console.error("Failed to fetch blog", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!blog) {
        return <div className="min-h-screen flex items-center justify-center">Blog not found</div>;
    }

    // Helper to get localized content
    const getLocalized = (field) => field?.[language] || field?.en || '';

    return (
        <div className="font-['Manrope'] bg-gray-50 min-h-screen">

            {/* Hero Section with Parallax-like effect */}
            <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={getImageUrl(blog.mainImage)}
                        alt={getLocalized(blog.title)}
                        className="w-full h-full object-cover"
                    />
                    {/* Standard Dark Overlay for consistency with BlogBanner */}
                    <div className="absolute inset-0 bg-black/60" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 tracking-wide uppercase border border-white/20">
                        {blog.category?.name?.[language] || blog.category?.name?.en || 'Uncategorized'}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
                        {getLocalized(blog.title)}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-sm md:text-base text-gray-200">
                        <span className="flex items-center gap-2">
                            {/* Initials Avatar */}
                            <span className="w-8 h-8 rounded-full bg-[#41398B] flex items-center justify-center text-xs font-bold border border-white/30">
                                {blog.author?.charAt(0) || 'A'}
                            </span>
                            {blog.author}
                        </span>
                        <span>•</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>5 min read</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                            {/* Share Buttons (Mobile Top) */}
                            <div className="flex lg:hidden gap-4 mb-8 pb-8 border-b border-gray-100 justify-center">
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><Twitter size={20} /></button>
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><Facebook size={20} /></button>
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><Linkedin size={20} /></button>
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><LinkIcon size={20} /></button>
                            </div>

                            {/* Blog Content */}
                            <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-[#41398B] prose-img:rounded-xl">
                                <div dangerouslySetInnerHTML={{ __html: getLocalized(blog.content) }} />
                            </article>

                            {/* Tags */}
                            {blog.tags?.[language]?.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-gray-100">
                                    <h4 className="font-bold text-gray-800 mb-4">Tags:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {blog.tags[language].map((tag, index) => (
                                            <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-[#41398B] hover:text-white transition-colors cursor-pointer">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Author Bio Box */}
                            <div className="mt-12 p-8 bg-gray-50 rounded-xl flex items-start gap-6">
                                <div className="w-16 h-16 rounded-full bg-[#41398B] flex-shrink-0 flex items-center justify-center text-white text-2xl font-bold">
                                    {blog.author?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">About {blog.author}</h3>
                                    <p className="text-gray-600 text-sm">
                                        Real estate expert and content contributor. Sharing insights on market trends and property investment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-8">
                            {/* Share Widget (Desktop) */}
                            <div className="hidden lg:flex bg-white rounded-2xl shadow-sm p-6 border border-gray-100 justify-around">
                                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#1DA1F2] transition-colors">
                                    <div className="p-3 bg-gray-50 rounded-full"><Twitter size={20} /></div>
                                    <span className="text-xs font-semibold">Tweet</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#4267B2] transition-colors">
                                    <div className="p-3 bg-gray-50 rounded-full"><Facebook size={20} /></div>
                                    <span className="text-xs font-semibold">Share</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#0077b5] transition-colors">
                                    <div className="p-3 bg-gray-50 rounded-full"><Linkedin size={20} /></div>
                                    <span className="text-xs font-semibold">Post</span>
                                </button>
                            </div>

                            {/* Blog Sidebar Component */}
                            <BlogSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
