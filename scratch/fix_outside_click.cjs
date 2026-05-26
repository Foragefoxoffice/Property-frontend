const fs = require('fs');

const files = [
  "src/Admin/UserDetails/UsersDetails.jsx",
  "src/AdminCms/ProjectCms/ProjectCategoryListPage.jsx",
  "src/AdminCms/ProjectCms/ProjectListPage.jsx",
  "src/Admin/Property/Staffs.jsx",
  "src/Admin/MasterList/MasterListPage/FeeTaxPage.jsx",
  "src/Admin/MasterList/MasterListPage/FurnishingPage.jsx",
  "src/Admin/MasterList/MasterListPage/LegalDocumentPage.jsx",
  "src/Admin/MasterList/MasterListPage/PaymentPage.jsx",
  "src/Admin/MasterList/MasterListPage/PropertTypePage.jsx",
  "src/Admin/MasterList/MasterListPage/PropertyPage.jsx",
  "src/Admin/MasterList/MasterListPage/UnitPage.jsx",
  "src/Admin/MasterList/MasterListPage/ParkingPage.jsx",
  "src/Admin/MasterList/MasterListPage/PetPolicyPage.jsx",
  "src/Admin/MasterList/MasterListPage/FloorRangePage.jsx",
  "src/Admin/MasterList/MasterListPage/DepositPage.jsx",
  "src/Admin/MasterList/MasterListPage/BlockPage.jsx",
  "src/Admin/MasterList/MasterListPage/AvailabilityStatusPage.jsx",
  "src/AdminCms/CategoryCms/CategoryListPage.jsx",
  "src/Admin/Currency/Currency.jsx",
  "src/AdminCms/BlogCms/BlogListPage.jsx"
];

for (const file of files) {
  const fullPath = `c:/Users/dell/Documents/Property/Property-frontend/${file}`;
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');

  let updated = false;

  // 1. Ensure useRef is imported
  if (content.includes('import React') && !content.includes('useRef')) {
    if (content.includes('useState, useEffect')) {
      content = content.replace('useState, useEffect', 'useState, useEffect, useRef');
      updated = true;
    } else if (content.includes('useState')) {
      content = content.replace('useState', 'useState, useRef');
      updated = true;
    }
  }

  // 2. Add the hook
  if (!content.includes('const menuRef = useRef(null);')) {
    const hookCode = `\n  const menuRef = useRef(null);\n  useEffect(() => {\n    const handleClickOutside = (event) => {\n      if (menuRef.current && !menuRef.current.contains(event.target)) {\n        setOpenMenuIndex(null);\n      }\n    };\n    document.addEventListener("mousedown", handleClickOutside);\n    return () => document.removeEventListener("mousedown", handleClickOutside);\n  }, []);\n`;
    
    content = content.replace(/(const \[openMenuIndex, setOpenMenuIndex\] = useState\(null\);)/, `$1${hookCode}`);
    updated = true;
  }

  // 3. Remove the overlay
  if (content.includes('onClick={() => setOpenMenuIndex(null)}')) {
    // Some are in <React.Fragment>, some might not be.
    content = content.replace(/<React\.Fragment>\s*<div className="fixed inset-0[^>]+onClick=\{\(\) => setOpenMenuIndex\(null\)\}>.*?<\/div>\s*/g, '');
    content = content.replace(/\s*<\/React\.Fragment>/g, '');
    
    // Fallback if no React.Fragment
    content = content.replace(/<div className="fixed inset-0[^>]+onClick=\{\(\) => setOpenMenuIndex\(null\)\}>.*?<\/div>\s*/g, '');
    updated = true;
  }

  // 4. Attach ref to the menu container
  if (content.includes('<div className="absolute right-') && !content.includes('ref={menuRef}')) {
    content = content.replace(/<div className="absolute right-/g, '<div ref={menuRef} className="absolute right-');
    updated = true;
  }

  // 5. Update the toggle button's onClick
  const oldOnClick1 = /onClick=\{\(\) =>\s*setOpenMenuIndex\(openMenuIndex === i \? null : i\)\}/g;
  const oldOnClick2 = /onClick=\{\(\) =>\s*setOpenMenuIndex\(\s*openMenuIndex === i \? null : i\s*\)\s*\}/g;
  
  if (oldOnClick1.test(content) || oldOnClick2.test(content)) {
    content = content.replace(oldOnClick1, 'onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === i ? null : i); }}');
    content = content.replace(oldOnClick2, 'onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === i ? null : i); }}');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
}
