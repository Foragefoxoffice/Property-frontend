const fs = require('fs');
const path = require('path');

function fixArrayBasedForm(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('// Dynamic Canonical URL')) {
        const injectPoint = content.match(/const activeTabSlug = Form.useWatch\(\['seoInformation', 'slugUrl', activeTab\], form\);/);
        if (injectPoint) {
            const logic = `
    // Dynamic Canonical URL
    const slugEn = Form.useWatch(['seoInformation', 'slugUrl', 'en'], form);
    const slugVi = Form.useWatch(['seoInformation', 'slugUrl', 'vi'], form);

    useEffect(() => {
        const siteUrl = 'https://183housingsolutions.com';
        const formatSlug = (s) => s && s !== '/' ? (s.startsWith('/') ? s : \`/\${s}\`) : '';
        const isBlog = ${filePath.includes('Blog') ? 'true' : 'false'};
        const prefix = isBlog ? '/blogs' : '/projects'; // fallback
        
        form.setFieldsValue({
            seoInformation: {
                ...form.getFieldValue('seoInformation'),
                canonicalUrl: {
                    en: \`\${siteUrl}\${prefix}\${formatSlug(slugEn)}\`,
                    vi: \`\${siteUrl}\${prefix}\${formatSlug(slugVi)}\`
                }
            }
        });
    }, [slugEn, slugVi, form]);
`;
            content = content.replace(injectPoint[0], injectPoint[0] + '\n' + logic);
        }
    }

    // vn
    const vnCanonicalRegex = /name=\{\['seoInformation', 'canonicalUrl', 'vi'\]\}[^>]+>\s*<Input[^>]*?className="([^"]+)"[^>]*?>/g;
    content = content.replace(vnCanonicalRegex, (match, classNames) => {
        if (!classNames.includes('bg-gray-50')) {
             return match.replace(/className="[^"]+"/, `className="${classNames} bg-gray-50"`).replace(/<Input/, '<Input disabled={true}');
        }
        return match;
    });

    // en
    const enCanonicalRegex = /name=\{\['seoInformation', 'canonicalUrl', 'en'\]\}[^>]+>\s*<Input[^>]*?className="([^"]+)"[^>]*?>/g;
    content = content.replace(enCanonicalRegex, (match, classNames) => {
        if (!classNames.includes('bg-gray-50')) {
             return match.replace(/className="[^"]+"/, `className="${classNames} bg-gray-50"`).replace(/<Input/, '<Input disabled={true}');
        }
        return match;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

fixArrayBasedForm(path.join(__dirname, 'BlogCms/BlogSeoForm.jsx'));
