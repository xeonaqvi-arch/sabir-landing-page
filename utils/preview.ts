import { GeneratedPage } from '../types';

export const generateFullHtml = (page: GeneratedPage): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            ${page.css}
        </style>
    </head>
    <body class="bg-white">
        ${page.html}
        <script>
            ${page.js}
        </script>
    </body>
    </html>
  `;
};

export const openInNewTab = (page: GeneratedPage) => {
  const fullContent = generateFullHtml(page);
  const blob = new Blob([fullContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};