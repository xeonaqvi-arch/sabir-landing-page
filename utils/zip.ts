import JSZip from 'jszip';
import saveAs from 'file-saver';
import { GeneratedPage } from '../types';

export const downloadProjectFolder = async (page: GeneratedPage) => {
  const zip = new JSZip();
  const folderName = page.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const root = zip.folder(folderName);

  if (!root) return;

  // 1. Create index.html
  // We need to reconstruct the full HTML document for the download version
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <style>
      body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="font-sans antialiased text-gray-900 bg-white">
    ${page.html}
    <script src="script.js"></script>
</body>
</html>`;

  root.file("index.html", fullHtml);

  // 2. Create style.css
  root.file("style.css", page.css || "/* No custom CSS needed, Tailwind handles it */");

  // 3. Create script.js
  root.file("script.js", page.js || "// No custom JS needed");

  // 4. Create assets folder (Empty or with a readme)
  const assets = root.folder("assets");
  assets?.file("README.md", "Place your local images here and update the src attributes in index.html");

  // Generate and download
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${folderName}.zip`);
};