import React from 'react';
import { useLanguage } from '../../Language/LanguageContext';

export default function ProjectMainDescription({ projectData }) {
    const { language } = useLanguage();

    if (!projectData) return null;

    const mainDescription = projectData.projectMainDescription?.[language] || 
                            projectData.projectMainDescription?.vi || 
                            projectData.projectMainDescription?.en || "";

    if (!mainDescription) return null;

    return (
        <section className="py-12 bg-white font-['Manrope']">
            <div className="max-w-4xl mx-auto px-6">
                <div 
                    className="main-description-rich-text text-[#374151] text-[16px] md:text-[17px] leading-[1.8]"
                    dangerouslySetInnerHTML={{ __html: mainDescription }}
                />
            </div>

            <style>{`
                .main-description-rich-text p {
                    margin-bottom: 1.5rem;
                }
                .main-description-rich-text strong {
                    color: #111827;
                    font-weight: 800;
                }
                .main-description-rich-text ul {
                    list-style-type: none;
                    padding-left: 0;
                    margin-bottom: 1.5rem;
                }
                .main-description-rich-text li {
                    position: relative;
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .main-description-rich-text li::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #41398B;
                    font-weight: bold;
                }
            `}</style>
        </section>
    );
}
