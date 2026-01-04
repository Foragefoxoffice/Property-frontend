import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white font-['Manrope'] pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">Property</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Your trusted partner in finding the perfect property. We bridge the gap between dream homes and reality with expert guidance.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#41398B] transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#41398B] transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#41398B] transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#41398B] transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <li><Link to="/home" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/listing" className="text-gray-400 hover:text-white transition-colors">Listings</Link></li>
                            <li><Link to="/blogs" className="text-gray-400 hover:text-white transition-colors">Blogs</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Services</h3>
                        <ul className="space-y-4">
                            <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Property Management</Link></li>
                            <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Consulting</Link></li>
                            <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Mortgage Services</Link></li>
                            <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Appraisals</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-400">
                                <MapPin size={20} className="mt-1 flex-shrink-0 text-[#41398B]" />
                                <span>123 Real Estate Ave, Business District, City, Country</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Phone size={20} className="flex-shrink-0 text-[#41398B]" />
                                <span>+1 (234) 567-8900</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail size={20} className="flex-shrink-0 text-[#41398B]" />
                                <span>info@property.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Property. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
