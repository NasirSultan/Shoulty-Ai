const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const B2C_TEMPLATE_PATH = path.join(PUBLIC_DIR, 'Cafe.html');
const B2B_TEMPLATE_PATH = path.join(PUBLIC_DIR, 'textile_final.html');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function titleFromSlug(slug) {
  return slug
    .replace(/\.html$/i, '')
    .split('-')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
    .replace(/\bAnd\b/g, '&')
    .replace(/\bS\b(?= )/g, 's');
}

function isB2B(name) {
  const n = name.toLowerCase();
  return (
    n.includes('manufacturing') ||
    n.includes('industrial') ||
    n.includes('wholesale') ||
    n.includes('distribution') ||
    n.includes('textile') ||
    n.includes('packag') ||
    n.includes('property') ||
    n.includes('consultant') ||
    n.includes('developers') ||
    n.includes('construction') ||
    n.includes('ca_gst') ||
    n.includes('loan') ||
    n.includes('insurance') ||
    n.includes('mutual-fund') ||
    n.includes('trading') ||
    n.includes('website-development') ||
    n.includes('app-development') ||
    n.includes('saas') ||
    n.includes('cyber-security') ||
    n.includes('ai-tools') ||
    n.includes('tech-startups') ||
    n.includes('digital-marketing-agencies')
  );
}

const imageMap = {
  'adventure-tourism.html': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'auto-repair-workshops.html': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80',
  'car-accessories-and-parts.html': 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80',
  'car-rentals.html': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  'car-showrooms.html': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
  'car-spa-detailing.html': 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
  'cleaning-pest-control.html': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80',
  'electronics-and-appliances.html': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'furniture-store.html': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  'home-decor-brand.html': 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
  'homestays-airbnb-hosts.html': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
  'hotels-resorts.html': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  'kitchenware.html': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80',
  'tour-packages.html': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  'travel-agencies.html': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80',
  'two-wheeler-dealers.html': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
  'veg-multicuisine-restaurant.html': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'watches-jewelry.html': 'https://images.unsplash.com/photo-1523170335258-f5c6c6bd11c0?auto=format&fit=crop&w=1200&q=80',
  'website-development-social-media-automation.html': 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80',
  'weight-loss-body-transformation.html': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  'wellness-supplements.html': 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1200&q=80',
  'wholesale-distribution.html': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  'yoga-centre.html': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  'zumba-aerobic-studio.html': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80'
};

function pickImage(fileName, fallback) {
  return imageMap[fileName] || fallback;
}

const B2C_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80'
];

const B2B_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1200&q=80'
];

const CATEGORY_IMAGE_POOLS = {
  food: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80'
  ],
  travel: [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80'
  ],
  fitness: [
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80'
  ],
  automotive: [
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80'
  ],
  beauty: [
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80'
  ],
  education: [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'
  ],
  healthcare: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=1200&q=80'
  ],
  realestate: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
  ],
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80'
  ],
  finance: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1200&q=80'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80'
  ],
  b2b: [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'
  ]
};

function detectCategory(fileName, useB2B) {
  const n = fileName.toLowerCase();
  if (/restaurant|cafe|bakery|food|catering|kitchen/.test(n)) return 'food';
  if (/travel|tour|hotel|resort|homestay/.test(n)) return 'travel';
  if (/yoga|zumba|fitness|gym|wellness|weight/.test(n)) return 'fitness';
  if (/car|automotive|auto-repair|two-wheeler|bike|repair|showroom|rental/.test(n)) return 'automotive';
  if (/beauty|salon|spa|makeup/.test(n)) return 'beauty';
  if (/coaching|academy|institute|education|courses/.test(n)) return 'education';
  if (/clinic|hospital|dental|pharma|ayurvedic|health/.test(n)) return 'healthcare';
  if (/real-estate|property|construction|architecture/.test(n)) return 'realestate';
  if (/software|website|app-development|ai-tools|cyber-security|saas|tech/.test(n)) return 'tech';
  if (/ca|gst|finance|loan|insurance|mutual-fund|trading|accounting/.test(n)) return 'finance';
  if (/fashion|boutique|clothing|textile|jewelry|watches/.test(n)) return 'fashion';
  return useB2B ? 'b2b' : 'food';
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function rotatePool(pool, seed) {
  if (!pool.length) return [];
  const out = [];
  for (let i = 0; i < pool.length; i += 1) {
    out.push(pool[(seed + i) % pool.length]);
  }
  return out;
}

function buildImageSet(fileName, useB2B, primaryImage, category) {
  const categoryPool = CATEGORY_IMAGE_POOLS[category] || [];
  const basePool = useB2B ? B2B_IMAGE_POOL : B2C_IMAGE_POOL;
  const seed = hashString(fileName);
  const activePool = categoryPool.length ? categoryPool : basePool;
  const rotatedActive = rotatePool(activePool, seed);
  // Repeat related images to keep all sections filled while staying on-topic.
  const expanded = [];
  for (let i = 0; i < 16; i += 1) {
    expanded.push(rotatedActive[i % rotatedActive.length]);
  }
  const merged = [primaryImage, ...expanded].filter(Boolean);
  return Array.from(new Set(merged));
}

function buildPreviewSet(fileName, category, fallbackSet) {
  const seed = hashString(`${fileName}-preview`);
  const categoryPool = CATEGORY_IMAGE_POOLS[category] || [];
  const rotatedCategory = rotatePool(categoryPool, seed);
  if (rotatedCategory.length >= 2) {
    return [rotatedCategory[0], rotatedCategory[1]];
  }
  return [fallbackSet[0], fallbackSet[1] || fallbackSet[0]];
}

function getIndustryProfile(fileName, industryName, useB2B) {
  const n = fileName.toLowerCase();
  if (/restaurant|cafe|bakery|kitchen|food|catering/.test(n)) {
    return {
      audience: 'nearby food lovers and regular diners',
      value: 'menu storytelling, ambience shots and offer-led campaigns',
      cta: 'Get More Orders',
      sectionBadge: `Social Media Automation for ${industryName}`,
      growthLine: `Turn ${industryName} content into repeat visits and direct enquiries.`
    };
  }
  if (/fitness|yoga|zumba|gym|wellness|weight/.test(n)) {
    return {
      audience: 'health-focused local communities and members',
      value: 'transformation stories, class highlights and retention campaigns',
      cta: 'Get More Members',
      sectionBadge: `Social Media Automation for ${industryName}`,
      growthLine: `Make ${industryName} visible daily with trust-building fitness content.`
    };
  }
  if (/travel|tour|hotel|resort|homestay/.test(n)) {
    return {
      audience: 'travel planners, families and experience seekers',
      value: 'destination reels, package highlights and seasonal offer campaigns',
      cta: 'Get More Bookings',
      sectionBadge: `Social Media Automation for ${industryName}`,
      growthLine: `Showcase ${industryName} experiences that convert viewers into bookings.`
    };
  }
  if (/real-estate|property|construction|architect/.test(n)) {
    return {
      audience: 'buyers, investors and project decision makers',
      value: 'project updates, trust-led proof and enquiry-optimized content',
      cta: 'Get More Site Visits',
      sectionBadge: `Social Media Automation for ${industryName}`,
      growthLine: `Position ${industryName} as the trusted first choice in your market.`
    };
  }
  if (/manufacturing|industrial|textile|wholesale|distribution|packag/.test(n) || useB2B) {
    return {
      audience: 'procurement teams, dealers and B2B buyers',
      value: 'capability showcases, process credibility and lead-ready messaging',
      cta: 'Get More B2B Leads',
      sectionBadge: `Social Media Automation for ${industryName}`,
      growthLine: `Grow ${industryName} enquiries with consistent authority content.`
    };
  }

  return {
    audience: 'qualified local prospects and repeat customers',
    value: 'offer-led campaigns, trust content and conversion-focused posting',
    cta: 'Get More Leads',
    sectionBadge: `Social Media Automation for ${industryName}`,
    growthLine: `Build a stronger digital pipeline for ${industryName} with consistent content.`
  };
}

function replaceAll(template, fileName, industryName, canonicalPath, imageSet, previewSet, profile, category) {
  let out = template;
  const industryLower = industryName.toLowerCase();
  const industryHash = industryName.replace(/[^A-Za-z0-9]+/g, '');
  const canonicalUrl = `https://www.shoutlyai.com/${canonicalPath}`;
  const metaDescription = `${industryName} businesses grow faster with ShoutlyAI automated social media posting built for ${profile.audience}. Deliver ${profile.value} and convert visibility into enquiries.`;
  const twitterDescription = `Automated social media growth for ${industryName} with ${profile.value}.`;
  const metaKeywords = `${industryLower} social media automation, ${industryLower} marketing, ${industryLower} lead generation, automated posting for ${industryLower} businesses, ShoutlyAI`;
  const previewImageA = previewSet[0] || imageSet[0];
  const previewImageB = previewSet[1] || imageSet[1] || imageSet[0];
  const socialPreviewBlock = `<div class="social-feed-preview"><article class="social-post"><div class="social-post-head"><span class="avatar-dot">S</span><div><strong>${industryName} Hub</strong><div class="social-sub">Instagram • 2h</div></div></div><img src="${previewImageA}" alt="${industryName} social post preview" loading="lazy"><div class="social-post-body">${industryName} offer highlight with location tags and CTA for enquiries.</div><div class="social-post-actions">♥ 124 &nbsp; 💬 18 &nbsp; ↗ Share</div></article><article class="social-post"><div class="social-post-head"><span class="avatar-dot">S</span><div><strong>${industryName} Hub</strong><div class="social-sub">Facebook • 3h</div></div></div><img src="${previewImageB}" alt="${industryName} social post preview" loading="lazy"><div class="social-post-body">Client story and service proof designed to improve conversion and trust.</div><div class="social-post-actions">👍 203 &nbsp; 💬 27 &nbsp; ↗ Share</div></article></div>`;
  let imageIndex = 0;

  // Main naming substitutions.
  out = out.replace(/Cafe Social Media Automation/g, `${industryName} Social Media Automation`);
  out = out.replace(/Textile Production Social Media Automation/g, `${industryName} Social Media Automation`);

  // Generic service phrasing from templates.
  out = out.replace(/for cafes, coffee shops, bakeries, dessert bars and local food businesses/gi, `for ${industryLower} businesses`);
  out = out.replace(/for textile manufacturers, garment production units, weaving mills, fabric suppliers, dyeing units, apparel exporters, and textile brands/gi, `for ${industryLower} businesses`);

  // Remove niche template language that can leak into non-cafe/non-textile pages.
  out = out.replace(/through your cafe doors/gi, 'for your business');
  out = out.replace(/Promote coffee, fresh bakes, daily specials, ambience, events and offers/gi, 'Promote products, services, offers, customer stories and updates');
  out = out.replace(/Promote coffee, fresh bakes, daily specials, ambience and offers/gi, 'Promote products, services, offers, customer stories and updates');
  out = out.replace(/coffee shop/gi, `${industryLower} business`);
  out = out.replace(/cafes, coffee shops, bakeries and dessert bars/gi, `${industryLower} businesses`);
  out = out.replace(/driving footfall, walk-ins and repeat visits/gi, 'driving visibility, enquiries and repeat customers');
  out = out.replace(/to drive footfall, walk-ins and repeat visits/gi, 'to drive visibility, enquiries and repeat customers');
  out = out.replace(/Get More Footfall/gi, profile.cta);
  out = out.replace(/Get More Leads/gi, profile.cta);
  out = out.replace(/Fill More Tables With Automated/gi, 'Get More Leads With Automated');
  out = out.replace(/Get More Leads With Automated/gi, `${profile.cta} With Automated`);
  out = out.replace(/for cafes and coffee shops to drive footfall and local customers/gi, `for ${industryLower} businesses to drive enquiries and growth`);
  out = out.replace(/Social Media Automation for Cafes/gi, `Social Media Automation for ${industryName}`);
  out = out.replace(/automated content posting for cafes/gi, `automated content posting for ${industryLower} businesses`);

  out = out.replace(/fabric manufacturing, weaving, dyeing, garment production, bulk orders, apparel exports, textile quality checks, and B2B buyer enquiries/gi, 'products, services, process quality, buyer trust and enquiry-focused updates');
  out = out.replace(/textile manufacturers, garment production units, weaving mills, fabric suppliers, dyeing units, apparel exporters, and textile brands/gi, `${industryLower} businesses`);

  // Clean textile-specific gallery terms and tags for non-textile pages.
  out = out.replace(/#(?:Textile|Fabric|Garment|Apparel)[A-Za-z]*/g, `#${industryHash}`);
  out = out.replace(/#BulkFabric/g, `#${industryHash}`);
  out = out.replace(/\bTextile\b/g, industryName);
  out = out.replace(/\btextile\b/g, industryLower);
  out = out.replace(/\bFabric\b/g, 'Product');
  out = out.replace(/\bfabric\b/g, 'product');
  out = out.replace(/\bGarment\b/g, 'Business');
  out = out.replace(/\bgarment\b/g, 'business');
  out = out.replace(/\bApparel\b/g, 'Industry');
  out = out.replace(/\bapparel\b/g, 'industry');

  // Refresh template hashtags for generic industry relevance.
  out = out.replace(/#TextileProduction/g, `#${industryHash}`);
  out = out.replace(/#CafeVibes/g, `#${industryHash}`);

  // Canonical/OG URL path.
  out = out.replace(/https:\/\/www\.shoutlyai\.com\/cafe-social-media-automation/gi, `https://www.shoutlyai.com/${canonicalPath}`);
  out = out.replace(/https:\/\/www\.shoutlyai\.com\/textile-production-social-media-automation/gi, `https://www.shoutlyai.com/${canonicalPath}`);

  // Industry labels in visible strings.
  out = out.replace(/\bCafe\b/g, industryName);
  out = out.replace(/\bTextile Production\b/g, industryName);
  out = out.replace(/\bcafe\b/g, industryLower);
  out = out.replace(/\btextile production\b/g, industryLower);

  // Make key hero lines less repetitive between pages.
  out = out.replace(/ShoutlyAI helps [^.]*\./gi, `ShoutlyAI helps ${industryLower} businesses publish consistent, high-performing social media content for ${profile.audience}.`);
  out = out.replace(/Every post is AI-generated,[^.]*\./gi, `Every post is AI-generated and designed around ${profile.value}.`);
  out = out.replace(/B2B enquiries grow when [^.]*\./gi, `${profile.growthLine}`);
  out = out.replace(/☕ Social Media Automation for Cafes/gi, profile.sectionBadge);
  out = out.replace(/🧵 Social Media Automation for [^<]*/gi, `🧵 ${profile.sectionBadge}`);

  // Keep cafe-style mockup layout but swap in industry-relevant preview visuals.
  if (category !== 'food') {
    out = out.replace(
      /\.post-photo\{position:relative;width:100%;aspect-ratio:1\/1;background:[^}]*\}/,
      `.post-photo{position:relative;width:100%;aspect-ratio:1/1;background:linear-gradient(135deg,#6f4a2f,#9c6b3f 45%,#c98a4b);overflow:hidden}.mock-stage > div:first-child .post-photo{background:url("${previewImageA}") center/cover no-repeat}.mock-stage > div:last-child .post-photo{background:url("${previewImageB}") center/cover no-repeat}.mock-stage .post-photo .cup,.mock-stage .post-photo .steam{display:none}`
    );
    out = out.replace(/Freshly Brewed,<br>Just For You ☕/g, `${industryName}<br>Social Post Preview`);
    out = out.replace(/Craving a perfect cup near you\?/g, `Looking for trusted ${industryLower} solutions?`);
  }

  // Force page-level metadata to be uniquely aligned to each industry.
  out = out.replace(/<meta name="description" content="[^"]*"\s*\/>/i, `<meta name="description" content="${metaDescription}" />`);
  out = out.replace(/<meta name="keywords" content="[^"]*"\s*\/>/i, `<meta name="keywords" content="${metaKeywords}" />`);
  out = out.replace(/<meta property="og:description" content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${metaDescription}" />`);
  out = out.replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/i, `<meta name="twitter:description" content="${twitterDescription}" />`);

  // Add social-preview styles for templates that use preview-figure layout.
  out = out.replace(
    /\.preview-figure figcaption\{[^}]*\}/,
    (m) => `${m}.social-feed-preview{display:grid;grid-template-columns:1fr 1fr;gap:16px}.social-post{background:var(--white);border:1px solid rgba(37,99,235,.12);border-radius:18px;overflow:hidden;box-shadow:0 10px 28px rgba(2,6,23,.08)}.social-post img{width:100%;height:190px;object-fit:cover}.social-post-head{display:flex;align-items:center;gap:10px;padding:12px}.social-post-body{padding:0 12px 10px;color:var(--text);font-size:.9rem}.social-post-actions{padding:0 12px 12px;color:var(--muted);font-size:.82rem;font-weight:800}.social-sub{font-size:.75rem;color:var(--muted)}.avatar-dot{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--secondary),var(--accent));color:#fff;font-weight:900}`
  );
  out = out.replace(/@media\(max-width:760px\)\{/, '@media(max-width:760px){.social-feed-preview{grid-template-columns:1fr}');

  // Enforce canonical URL consistency after broader text substitutions.
  out = out.replace(/https:\/\/www\.shoutlyai\.com\/[^"'<>\n]*social-media-automation/gi, canonicalUrl);

  // Diversify unsplash images across pages and sections.
  out = out.replace(/https:\/\/images\.unsplash\.com\/photo-[^"')\s]+/g, () => {
    const next = imageSet[imageIndex % imageSet.length];
    imageIndex += 1;
    return next;
  });

  // Make preview section visuals industry-specific in both template styles.
  out = out.replace(/<img src="data:image\/[^"]*" alt="Preview of AI-generated[^>]*id="previewImg">/gi, `<img src="${previewImageA}" alt="Preview of AI-generated ${industryLower} posts on Instagram and Facebook feeds" loading="lazy" id="previewImg">`);
  out = out.replace(/<img src="https:\/\/images\.unsplash\.com\/photo-[^"]*" alt="Preview of AI-generated[^>]*id="previewImg">/gi, `<img src="${previewImageA}" alt="Preview of AI-generated ${industryLower} posts on Instagram and Facebook feeds" loading="lazy" id="previewImg">`);
  out = out.replace(/<figure class="preview-figure">[\s\S]*?<\/figure>/i, socialPreviewBlock);

  return out;
}

function main() {
  const b2cTemplate = read(B2C_TEMPLATE_PATH);
  const b2bTemplate = read(B2B_TEMPLATE_PATH);

  const htmlFiles = fs
    .readdirSync(PUBLIC_DIR)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .sort((a, b) => a.localeCompare(b));

  let generated = 0;
  let skipped = 0;

  for (const fileName of htmlFiles) {
    const lc = fileName.toLowerCase();

    // Keep source templates untouched.
    if (lc === 'cafe.html' || lc === 'textile_final.html') {
      skipped += 1;
      continue;
    }

    const industryName = titleFromSlug(fileName);
    const canonicalPath = `${fileName.replace(/\.html$/i, '').toLowerCase()}-social-media-automation`;

    const useB2B = isB2B(fileName);
    const template = useB2B ? b2bTemplate : b2cTemplate;

    const defaultImage = useB2B
      ? 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80'
      : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80';

    const imageUrl = pickImage(fileName, defaultImage);
    const profile = getIndustryProfile(fileName, industryName, useB2B);
    const category = detectCategory(fileName, useB2B);
    const imageSet = buildImageSet(fileName, useB2B, imageUrl, category);
    const previewSet = buildPreviewSet(fileName, category, imageSet);

    const content = replaceAll(template, fileName, industryName, canonicalPath, imageSet, previewSet, profile, category);

    write(path.join(PUBLIC_DIR, fileName), content);
    generated += 1;
  }

  console.log(`Generated ${generated} pages; skipped ${skipped} template file(s).`);
}

main();
