const fs = require('fs');

const file = 'c:/Users/dell/Documents/Property/Property-frontend/src/Admin/MasterList/MasterListPage/LegalDocumentPage.jsx';
const content = fs.readFileSync(file, 'utf8');

const parts = content.split(/(<div[^>]*className=["'][^"']*fixed inset-0 bg-black[^"']*["'][^>]*>)/g);
console.log("Parts length:", parts.length);
for (let i = 1; i < parts.length; i += 2) {
  console.log("Found backdrop:", parts[i]);
  const nextContent = parts[i+1];
  
  let closeHandler = null;
  const onClickRegex = /onClick=\{\(\)\s*=>\s*(\{[\s\S]*?\}|.*?)\}/g;
  let match;
  while ((match = onClickRegex.exec(nextContent)) !== null) {
      let code = match[1].trim();
      if ((code.includes('setShow') && code.includes('false')) || 
          code.includes('setDeleteConfirm') || 
          code.includes('show: false')) {
          closeHandler = code;
          break;
      }
  }
  console.log("Found close handler:", closeHandler);
}
