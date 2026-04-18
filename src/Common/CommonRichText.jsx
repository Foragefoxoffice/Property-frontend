import React, { memo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

/**
 * CommonRichText Component
 * Provides a standardized Rich Text Editor using ReactQuill with a "Word-like" toolbar.
 */
const CommonRichText = ({
    label,
    value,
    onChange,
    placeholder,
    className = "",
    minHeight = "200px"
}) => {
    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                [{ size: ["small", false, "large", "huge"] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ script: "sub" }, { script: "super" }],
                ["blockquote", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image", "video"],
            ],
        },
    };

    const formats = [
        "header",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "script",
        "blockquote",
        "code-block",
        "list",
        "bullet",
        "link",
        "image",
        "video",
    ];

    return (
        <div className={`flex flex-col ${className}`}>
            {label && (
                <label className="text-sm text-[#131517] font-semibold mb-2">
                    {label}
                </label>
            )}
            <div className="rich-text-wrapper">
                <ReactQuill
                    theme="snow"
                    value={value || ""}
                    onChange={onChange}
                    placeholder={placeholder || "Type here..."}
                    modules={modules}
                    formats={formats}
                    className="bg-white rounded-lg"
                />
            </div>
            <style>{`
                .rich-text-wrapper .ql-container.ql-snow {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    border-color: #b2b2b3;
                    font-family: inherit;
                }
                .rich-text-wrapper .ql-toolbar.ql-snow {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    border-color: #b2b2b3;
                    background-color: #f8fafc;
                }
                .rich-text-wrapper .ql-editor {
                    min-height: ${minHeight};
                    font-size: 14px;
                    line-height: 1.6;
                    color: #1a1a1a;
                }
                /* Ensure lists display correctly in the editor */
                .rich-text-wrapper .ql-editor ul, 
                .rich-text-wrapper .ql-editor ol {
                    padding-left: 1.5rem !important;
                }
                .rich-text-wrapper .ql-editor ul {
                    list-style-type: disc !important;
                }
                .rich-text-wrapper .ql-editor ol {
                    list-style-type: decimal !important;
                }
                /* Spacing between paragraphs */
                .rich-text-wrapper .ql-editor p {
                    margin-bottom: 0.75rem;
                }
                /* Blockquote styling */
                .rich-text-wrapper .ql-editor blockquote {
                    border-left: 4px solid #41398B;
                    padding-left: 1rem;
                    margin-left: 0;
                    margin-bottom: 0.75rem;
                    font-style: italic;
                    color: #4b5563;
                }
                /* Code block styling */
                .rich-text-wrapper .ql-editor pre {
                    background-color: #f1f5f9;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    margin-bottom: 0.75rem;
                }
                /* Custom scrollbar for editor */
                .rich-text-wrapper .ql-editor::-webkit-scrollbar {
                    width: 6px;
                }
                .rich-text-wrapper .ql-editor::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .rich-text-wrapper .ql-editor::-webkit-scrollbar-thumb {
                    background: #41398B;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default memo(CommonRichText);
