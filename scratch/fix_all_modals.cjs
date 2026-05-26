const fs = require('fs');
const path = require('path');

function processDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(processDir(fullPath));
    } else if (file.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = processDir('c:/Users/dell/Documents/Property/Property-frontend/src');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;

  const parts = content.split(/(<div[^>]*className=["'][^"']*(?:fixed inset-0 bg-black|fixed inset-0 bg-black\/)[^"']*["'][^>]*>)/g);
  
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i += 2) {
      let backdropDiv = parts[i];
      if (backdropDiv.includes('onMouseDown=') || backdropDiv.includes('onClick=')) {
        continue;
      }
      
      const nextContent = parts[i+1];
      let closeCode = "";
      
      // Specific patterns
      if (nextContent.includes('handleCancelDelete')) {
         closeCode = "handleCancelDelete();";
      } else if (nextContent.includes('setDeleteConfirm')) {
         closeCode = "setDeleteConfirm({ show: false, id: null });";
      } else if (nextContent.includes('setShowDeleteModal(false)')) {
         closeCode = "setShowDeleteModal(false);";
      } else if (nextContent.includes('setIsDeleteModalOpen(false)')) {
         closeCode = "setIsDeleteModalOpen(false);";
      } else if (nextContent.includes('setIsModalOpen(false)')) {
         closeCode = "setIsModalOpen(false);";
      } else if (nextContent.includes('setShowAddModal(false)')) {
         closeCode = "setShowAddModal(false);";
      } else if (nextContent.includes('setShowViewModal')) {
         closeCode = "setShowViewModal(false);";
      } else if (nextContent.includes('setShowModal')) {
         closeCode = "setShowModal(false);";
         if (nextContent.includes('setEditingRecord(null)')) closeCode += " setEditingRecord(null);";
         if (nextContent.includes('setEditingUser(null)')) closeCode += " setEditingUser(null);";
         if (nextContent.includes('setEditingCategory(null)')) closeCode += " setEditingCategory(null);";
         if (nextContent.includes('setEditingProject(null)')) closeCode += " setEditingProject(null);";
         if (nextContent.includes('setEditingBlog(null)')) closeCode += " setEditingBlog(null);";
         if (nextContent.includes('setEditingStaff(null)')) closeCode += " setEditingStaff(null);";
      } else if (nextContent.includes('setIsOpen(false)')) {
         closeCode = "setIsOpen(false);";
      } else if (nextContent.includes('setShowStatusModal(false)')) {
         closeCode = "setShowStatusModal(false);";
      } else if (nextContent.includes('setModalOpen(false)')) {
         closeCode = "setModalOpen(false);";
      } else {
         const match = /(set[A-Z][a-zA-Z0-9]*\(\s*(?:false|null|\{[^}]*false[^}]*\})\s*\))/.exec(nextContent);
         if (match) {
             closeCode = match[1] + ";";
         }
      }
      
      if (closeCode) {
        const newBackdropDiv = backdropDiv.replace(/>$/, ` onMouseDown={(e) => { if (e.target === e.currentTarget) { ${closeCode} } }}>`);
        parts[i] = newBackdropDiv;
        updated = true;
      } else {
        if (content.includes('onClose')) {
           const newBackdropDiv = backdropDiv.replace(/>$/, ` onMouseDown={(e) => { if (e.target === e.currentTarget && typeof onClose === 'function') { onClose(); } }}>`);
           parts[i] = newBackdropDiv;
           updated = true;
        } else {
           console.log(`Could not find close handler for modal in ${file}`);
        }
      }
    }
  }
  
  if (updated) {
    fs.writeFileSync(file, parts.join(''), 'utf8');
    console.log(`Updated modals in ${file}`);
  }
}
