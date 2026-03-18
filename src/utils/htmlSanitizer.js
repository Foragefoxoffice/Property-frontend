/**
 * Sanitizes HTML strings by removing non-breaking spaces, 
 * multiple spaces, and empty paragraphs. 
 * This helps prevent character-level word breaking in various browsers.
 */
export const cleanHTML = (html) => {
    if (!html) return '';

    return html
        .replace(/&nbsp;/g, ' ')              // fix non-breaking spaces
        .replace(/\u00A0/g, ' ')              // unicode nbsp
        .replace(/<p>\s*<\/p>/g, '')          // remove empty paragraphs
        .replace(/\s{2,}/g, ' ')              // remove extra spaces (safe)
        .trim();
};

/**
 * Specifically for sanitizing data right before it is sent to the backend 
 * from CMS forms that use ReactQuill.
 */
export const sanitizeBeforeSave = (html) => {
    if (!html) return '';
    return html
        .replace(/&nbsp;/g, ' ')
        .replace(/\u00A0/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

/**
 * Standard configuration for ReactQuill to prevent unwanted style injection.
 */
export const quillModules = {
    clipboard: {
        matchVisual: false
    },
    toolbar: [
        ['bold', 'italic', 'underline'],
        [{ color: [] }],
        ['link'],
        ['clean']
    ]
};

export const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'color'
];
