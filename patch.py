import re

with open(r'c:\Users\dell\Documents\Property\property-frontend\src\Api\action.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports and compressImage
if 'browser-image-compression' not in content:
    content = content.replace('import axios from "axios";', 'import axios from "axios";\nimport imageCompression from "browser-image-compression";\n\nconst compressImage = async (file) => {\n  if (!file || !file.type || !file.type.startsWith("image/")) return file;\n  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;\n\n  const options = {\n    maxSizeMB: 0.25,\n    maxWidthOrHeight: 1920,\n    useWebWorker: true,\n  };\n\n  try {\n    const compressedFile = await imageCompression(file, options);\n    if (compressedFile.size > file.size) return file;\n    return compressedFile;\n  } catch (error) {\n    console.error("Image compression error:", error);\n    return file;\n  }\n};\n')

# Patch uploadPropertyMedia
content = re.sub(
    r'export const uploadPropertyMedia = \(file, type\) => \{',
    r'export const uploadPropertyMedia = async (file, type) => {\n  if (type === "image" || type === "floor") { file = await compressImage(file); }',
    content
)

# Patch other upload* functions
def patch_upload(match):
    name = match.group(1)
    param = match.group(2)
    # Don't patch uploadPropertyMedia again
    if name == 'uploadPropertyMedia':
        return match.group(0)
    
    return f'export const {name} = async ({param}) => {{\n  {param} = await compressImage({param});'

content = re.sub(r'export const (upload[A-Za-z0-9]+) = \(([a-zA-Z0-9_]+)\) => \{', patch_upload, content)

with open(r'c:\Users\dell\Documents\Property\property-frontend\src\Api\action.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
