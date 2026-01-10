import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogBySlug } from '../Api/action';
import BlogSidebar from '../components/Blog/BlogSidebar';
import { Twitter, Facebook, Linkedin, Link as LinkIcon, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '../Language/LanguageContext';

import { getImageUrl } from '../utils/imageHelper';
import Loader from '@/components/Loader/Loader';
import Header from '@/Admin/Header/Header';
import Footer from '@/Admin/Footer/Footer';

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
        return <Loader />;
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <h2 className="text-2xl font-bold mb-2">Blog Post Not Found</h2>
                <p>The article you are looking for does not exist or has been moved.</p>
            </div>
        );
    }

    // Helper to get localized content
    const getLocalized = (field) => field?.[language] || field?.en || '';

    return (
        <>
            <Header />
            <div className="font-['Manrope'] bg-gray-50 min-h-screen">

                {/* Hero Section with Parallax-like effect */}
                <div className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-white overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src={getImageUrl(blog.mainImage)}
                            alt={getLocalized(blog.title)}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        {/* Gradient Overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center -mt-10">
                        <div className="mb-6 animate-fade-in-down">
                            <span className="inline-block px-5 py-2 bg-[#41398B] shadow-lg shadow-[#41398B]/30 rounded-full text-sm font-bold tracking-wider uppercase text-white transform hover:scale-105 transition-transform duration-300">
                                {blog.category?.name?.[language] || blog.category?.name?.en || 'Uncategorized'}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-8 max-w-5xl mx-auto leading-tight drop-shadow-lg capitalize tracking-tight">
                            {getLocalized(blog.title)}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base text-gray-200 font-medium">
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                {/* Initials Avatar */}
                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#41398B] to-purple-500 flex items-center justify-center text-[10px] font-bold border border-white/30 shadow-sm">
                                    {blog.author?.charAt(0) || 'A'}
                                </span>
                                {blog.author}
                            </span>
                            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/50" />
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                <Calendar size={16} className="text-purple-300" />
                                {new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/50" />
                            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                                <Clock size={16} className="text-purple-300" />
                                5 min read
                            </span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16 -mt-32 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Main Content Column */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 ring-1 ring-black/5">
                                {/* Share Buttons (Mobile Top) */}
                                <div className="flex lg:hidden gap-4 mb-8 pb-8 border-b border-gray-100 justify-center">
                                    <button className="p-3 rounded-full bg-gray-50 hover:bg-[#1DA1F2] hover:text-white text-gray-500 transition-all duration-300"><Twitter size={20} /></button>
                                    <button className="p-3 rounded-full bg-gray-50 hover:bg-[#4267B2] hover:text-white text-gray-500 transition-all duration-300"><Facebook size={20} /></button>
                                    <button className="p-3 rounded-full bg-gray-50 hover:bg-[#0077b5] hover:text-white text-gray-500 transition-all duration-300"><Linkedin size={20} /></button>
                                    <button className="p-3 rounded-full bg-gray-50 hover:bg-gray-800 hover:text-white text-gray-500 transition-all duration-300"><LinkIcon size={20} /></button>
                                </div>

                                {/* Blog Content */}
                                <article style={{ lineHeight: '2.1' }} className="prose prose-lg max-w-none w-full break-words
                                prose-headings:font-bold prose-headings:text-gray-900 
                                prose-h1:text-4xl prose-h2:text-3xl prose-h2:text-[#41398B] prose-h3:text-2xl 
                                prose-p:text-gray-600 prose-p:leading-relaxed 
                                prose-a:text-[#41398B] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                                prose-blockquote:border-l-4 prose-blockquote:border-[#41398B] prose-blockquote:bg-purple-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-gray-700
                                prose-strong:text-gray-900 prose-strong:font-bold
                                prose-li:marker:text-[#41398B]">
                                    <div dangerouslySetInnerHTML={{ __html: getLocalized(blog.content) }} />
                                </article>

                                {/* Tags */}
                                {blog.tags?.[language]?.length > 0 && (
                                    <div className="mt-12 pt-8 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="font-bold text-gray-800">Tags:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {blog.tags[language].map((tag, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#41398B] hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Author Bio Box */}
                                <div className="mt-12 p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-inner">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#41398B] to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
                                        {blog.author?.charAt(0)}
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center justify-center sm:justify-start gap-2">
                                            About {blog.author}
                                            <span className="text-xs bg-[#41398B]/10 text-[#41398B] px-2 py-0.5 rounded-full border border-[#41398B]/20">Author</span>
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                            Real estate expert and content contributor. Sharing insights on market trends, property management, and investment strategies to help you make informed decisions.
                                        </p>
                                        <div className="flex items-center justify-center sm:justify-start gap-3">
                                            <button className="text-gray-400 hover:text-[#1DA1F2] transition-colors"><Twitter size={18} /></button>
                                            <button className="text-gray-400 hover:text-[#0077b5] transition-colors"><Linkedin size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 space-y-8">
                                {/* Share Widget (Desktop) */}
                                <div className="hidden lg:flex bg-white rounded-2xl shadow-sm p-6 border border-gray-100 items-center justify-between">
                                    <span className="font-bold text-gray-700">Share Article</span>
                                    <div className="flex gap-2">
                                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#1DA1F2] hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                                            <Twitter size={18} />
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#4267B2] hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                                            <Facebook size={18} />
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#0077b5] hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                                            <Linkedin size={18} />
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-800 hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                                            <LinkIcon size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Blog Sidebar Component */}
                                <BlogSidebar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
