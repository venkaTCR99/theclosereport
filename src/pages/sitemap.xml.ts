export const prerender = true;

import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async () => {
  // Get all archive dates
  const dataDir = path.join(process.cwd(), 'src/data/markets');
  const files = fs.readdirSync(dataDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  const dates = files.map(f => f.replace('.json', ''));
  const baseUrl = 'https://theclosereport.com';

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/archive', priority: '0.8', changefreq: 'daily' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
    { url: '/newsletter', priority: '0.7', changefreq: 'monthly' },
  ];

  const archivePages = dates.map(date => ({
    url: `/archive/${date}`,
    priority: '0.5',
    changefreq: 'never',
  }));

  const allPages = [...staticPages, ...archivePages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};