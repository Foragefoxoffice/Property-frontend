const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find the prefix used for SeoSlugUrl_en, e.g., 'homeSeoSlugUrl_en'
    const slugMatch = content.match(/name="([a-zA-Z0-9]+SeoSlugUrl_en)"/);
    if (!slugMatch) return;
    
    const prefix = slugMatch[1].replace('SeoSlugUrl_en', '');
    
    // Check if we already inserted the dynamic canonical logic
    if (content.includes('// Dynamic Canonical URL')) return;

    // We will inject the logic right before useEffects or after activeTabSlug
    const injectPoint = content.match(/const activeTabSlug = [^\n]+;/);
    if (injectPoint) {
        const logic = `
    // Dynamic Canonical URL
    const slugEn = Form.useWatch('${prefix}SeoSlugUrl_en', form);
    const slugVn = Form.useWatch('${prefix}SeoSlugUrl_vn', form);

    useEffect(() => {
        const siteUrl = 'https://183housingsolutions.com';
        const formatSlug = (s) => s && s !== '/' ? (s.startsWith('/') ? s : \`/\${s}\`) : '';
        form.setFieldsValue({
            ${prefix}SeoCanonicalUrl_en: \`\${siteUrl}\${formatSlug(slugEn)}\`,
            ${prefix}SeoCanonicalUrl_vn: \`\${siteUrl}\${formatSlug(slugVn)}\`
        });
    }, [slugEn, slugVn, form]);
`;
        content = content.replace(injectPoint[0], injectPoint[0] + '\n' + logic);
    }

    // Now make the Canonical URL inputs disabled and add bg-gray-50
    // vn
    const vnCanonicalRegex = new RegExp(`name="${prefix}SeoCanonicalUrl_vn"[\\s\\S]*?<Input[\\s\\S]*?disabled={[^}]+}[\\s\\S]*?/>`, 'g');
    content = content.replace(vnCanonicalRegex, (match) => {
        return match.replace(/disabled={[^}]+}/, 'disabled={true}').replace(/className="([^"]+)"/, 'className="$1 bg-gray-50"');
    });

    // en
    const enCanonicalRegex = new RegExp(`name="${prefix}SeoCanonicalUrl_en"[\\s\\S]*?<Input[\\s\\S]*?disabled={[^}]+}[\\s\\S]*?/>`, 'g');
    content = content.replace(enCanonicalRegex, (match) => {
        return match.replace(/disabled={[^}]+}/, 'disabled={true}').replace(/className="([^"]+)"/, 'className="$1 bg-gray-50"');
    });

    // Handle standard canonicalUrl (for properties/blogs that might use canonicalUrl directly)
    // We can just rely on the above for CMS pages since they use prefixSeoCanonicalUrl_en

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
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
