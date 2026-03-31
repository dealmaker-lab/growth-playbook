/**
 * AI Image Prompts Library — Growth Playbook
 *
 * Pre-crafted prompts for generating visual assets via Midjourney v6, DALL-E 3, or Flux.
 * Each prompt includes platform recommendation, aspect ratio, and usage context.
 *
 * Generated using the AI Image Prompts skill (YouMind-OpenLab methodology).
 */

export interface ImagePrompt {
  id: string;
  name: string;
  usage: string;
  platform: 'midjourney' | 'dalle3' | 'flux';
  aspectRatio: string;
  dimensions: string;
  prompt: string;
  negativePrompt?: string;
  midjourneyParams?: string;
  placeholderColor: string;
}

export const IMAGE_PROMPTS: ImagePrompt[] = [
  {
    id: 'hero',
    name: 'Growth Playbook Hero',
    usage: 'Main hero section background (above the fold)',
    platform: 'midjourney',
    aspectRatio: '16:9',
    dimensions: '2560x1440',
    prompt:
      'A dynamic upward growth chart transforming into a rocket trail, app icons and data nodes orbiting around it, modern flat illustration style, emerald green #26BE81 and deep navy #1A1A2E color palette, cinematic lighting with subtle glow effects, clean dark gradient background, professional SaaS marketing aesthetic, no text, no people --ar 16:9 --v 6 --s 250 --q 2',
    negativePrompt: 'text, words, letters, numbers, watermark, signature, blurry, low quality',
    midjourneyParams: '--ar 16:9 --v 6 --s 250 --q 2',
    placeholderColor: '#1A1A2E',
  },
  {
    id: 'dsp-pillar',
    name: 'DSP Programmatic Engine',
    usage: 'Chapter 1 pillar illustration (inline)',
    platform: 'midjourney',
    aspectRatio: '4:3',
    dimensions: '1600x1200',
    prompt:
      'Flowing streams of programmatic ad data connecting mobile devices to audience segments, isometric 3D illustration, emerald green #26BE81 accent lines on dark navy background, clean tech-forward aesthetic, RTB auction nodes glowing, data packets flowing between ad exchanges and devices, no text, no people --ar 4:3 --v 6 --s 200',
    negativePrompt: 'text, words, blurry, photorealistic, stock photo',
    midjourneyParams: '--ar 4:3 --v 6 --s 200',
    placeholderColor: '#0F1B2D',
  },
  {
    id: 'rewarded-pillar',
    name: 'Rewarded Models',
    usage: 'Chapter 2 pillar illustration (inline)',
    platform: 'midjourney',
    aspectRatio: '4:3',
    dimensions: '1600x1200',
    prompt:
      'A gamification reward loop with golden coins, achievement badges, and engaged mobile users, playful 3D illustration style, gold and emerald green accents on soft dark background, reward chest opening with light beams, app screens showing progress bars and rewards, warm inviting lighting, no text --ar 4:3 --v 6 --s 200',
    negativePrompt: 'text, words, blurry, photorealistic',
    midjourneyParams: '--ar 4:3 --v 6 --s 200',
    placeholderColor: '#1A1A0F',
  },
  {
    id: 'oem-pillar',
    name: 'OEM & On-Device Discovery',
    usage: 'Chapter 3 pillar illustration (inline)',
    platform: 'midjourney',
    aspectRatio: '4:3',
    dimensions: '1600x1200',
    prompt:
      'Smartphones on a modern assembly line with apps pre-installed on their glowing screens, clean technical illustration, blue-green palette with emerald #26BE81 highlights, Samsung Galaxy and Xiaomi device silhouettes, factory-to-user journey visualization, isometric perspective, no text --ar 4:3 --v 6 --s 200',
    negativePrompt: 'text, words, logos, brand names, blurry',
    midjourneyParams: '--ar 4:3 --v 6 --s 200',
    placeholderColor: '#0D1F2D',
  },
  {
    id: 'asa-pillar',
    name: 'ASA/ASO Synergy',
    usage: 'Chapter 4 pillar illustration (inline)',
    platform: 'midjourney',
    aspectRatio: '4:3',
    dimensions: '1600x1200',
    prompt:
      'App Store search results interface with optimization metrics and ranking arrows rising upward, flat modern illustration style, emerald green and white palette on light background, keyword bubbles floating around search bar, conversion funnel visualization, clean minimal design, no text --ar 4:3 --v 6 --s 200',
    negativePrompt: 'text, words, Apple logo, blurry, dark',
    midjourneyParams: '--ar 4:3 --v 6 --s 200',
    placeholderColor: '#F0F7F4',
  },
  {
    id: 'email-gate',
    name: 'Email Gate Decoration',
    usage: 'Email capture gate visual (inline with form)',
    platform: 'dalle3',
    aspectRatio: '1:1',
    dimensions: '1200x1200',
    prompt:
      'A locked treasure chest with a glowing emerald green key hovering above it, the chest is slightly open revealing growth charts, analytics dashboards, and bar graphs inside, clean modern illustration style, dark background with soft green glow, professional SaaS aesthetic, no text, square composition',
    negativePrompt: 'text, words, watermark',
    placeholderColor: '#1A2E1A',
  },
  {
    id: 'calculator-bg',
    name: 'ROI Calculator Background',
    usage: 'Calculator page hero background (subtle)',
    platform: 'flux',
    aspectRatio: '16:9',
    dimensions: '2560x1440',
    prompt:
      'Abstract financial growth patterns with intersecting curves and data points, minimal geometric design, emerald green #26BE81 and navy #1A1A2E palette, subtle grid overlay, clean modern data visualization aesthetic, low opacity suitable for background use, no text',
    negativePrompt: 'text, words, busy, cluttered, bright',
    placeholderColor: '#F5F7F9',
  },
];

/**
 * Get prompt by ID
 */
export function getImagePrompt(id: string): ImagePrompt | undefined {
  return IMAGE_PROMPTS.find((p) => p.id === id);
}

/**
 * Get all prompts for a specific platform
 */
export function getPromptsByPlatform(platform: ImagePrompt['platform']): ImagePrompt[] {
  return IMAGE_PROMPTS.filter((p) => p.platform === platform);
}
