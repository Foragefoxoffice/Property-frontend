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

  // We want to wrap the returned div in <React.Fragment> and prepend the backdrop.
  // The structure is typically:
  // {openMenuIndex === i && (
  //   <div className="absolute ...">
  //     ...
  //   </div>
  // )}
  //
  // We can find `{openMenuIndex === i && (`
  // and then parse brackets to find the end of the `(` 
  // or we can use regex to replace `{openMenuIndex === i && (` with `{openMenuIndex === i && (<React.Fragment><div className="fixed inset-0 z-40" onClick={() => setOpenMenuIndex(null)}></div>`
  // And then how do we add `</React.Fragment>`?
  // 
  // An alternative regex:
  // Find `{openMenuIndex === i && (` 
  // then optionally some whitespace,
  // then `<div` (this is the menu div).
  // Wait, if we use a regex to just capture the entire div tree... it's hard because of nested divs.
  
  // Let's implement a simple balanced bracket parser!
  
  let index = content.indexOf('{openMenuIndex === i && (');
  if (index === -1) {
     console.log(`Not found in ${file}`);
     continue;
  }
  
  const startExpr = index;
  let i = index + '{openMenuIndex === i && ('.length;
  let parens = 1;
  let braces = 1; // from the initial `{`
  
  // Find the opening of the div to insert our overlay before it
  let firstTagStart = content.indexOf('<div', i);
  if (firstTagStart !== -1) {
    // Check if it already has React.Fragment or <> to avoid double wrapping
    const between = content.substring(i, firstTagStart);
    if (between.includes('<React.Fragment') || between.includes('<>')) {
      console.log(`Already wrapped in ${file}`);
      continue;
    }
  }

  // Find the end of the `)` for `{openMenuIndex === i && ( ... )}`
  let j = i;
  let pCount = 1; // '('
  let inString = false;
  let stringChar = '';
  
  while (j < content.length && pCount > 0) {
    const char = content[j];
    if (inString) {
      if (char === stringChar && content[j-1] !== '\\') {
        inString = false;
      }
    } else {
      if (char === '"' || char === "'" || char === '`') {
        inString = true;
        stringChar = char;
      } else if (char === '(') {
        pCount++;
      } else if (char === ')') {
        pCount--;
      }
    }
    j++;
  }
  
  if (pCount === 0) {
    const exprEnd = j - 1; // index of the closing ')'
    // The expression inside the parenthesis is from `i` to `exprEnd`
    const innerContent = content.substring(i, exprEnd);
    
    // Replace the content
    const newInner = `\n<React.Fragment>\n<div className="fixed inset-0 z-40" onClick={() => setOpenMenuIndex(null)}></div>\n${innerContent}\n</React.Fragment>\n`;
    
    content = content.substring(0, i) + newInner + content.substring(exprEnd);
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`Failed to parse ${file}`);
  }
}
