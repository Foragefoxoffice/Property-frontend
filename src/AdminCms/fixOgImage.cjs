const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if we already injected getAbsoluteUrl
    if (content.includes('const getAbsoluteUrl =')) return;

    // We want to replace the body of the useEffect that initializes ogImage
    // It usually looks like:
    /*
    useEffect(() => {
        if (pageData?.aboutSeoOgImage) {
            setOgImage(pageData.aboutSeoOgImage);
        } else if (pageData?.aboutSeoOgImages && pageData.aboutSeoOgImages.length > 0) {
            setOgImage(pageData.aboutSeoOgImages[0]);
        }
    }, [pageData]);
    */
    
    // We can inject getAbsoluteUrl right before it
    const useEffectRegex = /useEffect\(\(\) => \{\s*if \((pageData|blogData)\?\./;
    const match = content.match(useEffectRegex);
    
    if (match) {
        const helperFunc = `
        const getAbsoluteUrl = (url) => {
            if (!url) return '';
            if (url.startsWith('http')) return url;
            const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://api.183housingsolutions.com';
            return \`\${apiBase}\${url.startsWith('/') ? '' : '/'}\${url}\`;
        };
        `;
        
        // We replace setOgImage(...) with setOgImage(getAbsoluteUrl(...)) inside that useEffect
        // We can just globally replace setOgImage(pageData...) and setOgImage(blogData...) 
        // with setOgImage(getAbsoluteUrl(pageData...)) etc.
        
        // Let's do it specifically for the lines in the file
        let newContent = content.replace(/setOgImage\(((?:pageData|blogData)[^)]+)\);/g, 'setOgImage(getAbsoluteUrl($1));');
        
        // And inject the helper function inside that useEffect
        newContent = newContent.replace(useEffectRegex, (m) => {
            return `useEffect(() => {${helperFunc}\n        if (${match[1]}?.`;
        });
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('SeoForm.jsx')) {
            processFile(fullPath);
        }
    }
}

walk(__dirname);
