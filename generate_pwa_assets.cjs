const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const robotSrc = path.join('src', 'assets', 'images', 'app_icon_robot_1785405143321.jpg');
const publicDir = path.join('public');
const distDir = path.join('dist');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function generatePwaIcons() {
  ensureDir(publicDir);

  for (const size of [192, 512]) {
    const outPath = path.join(publicDir, `pwa-${size}x${size}.png`);
    await sharp(robotSrc)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(outPath);
  }

  await sharp(robotSrc)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));

  await sharp(robotSrc)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(robotSrc)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  await sharp(robotSrc)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'app-icon.png'));
}

async function generatePlaceholderScreenshots() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <rect width="390" height="844" fill="#FAF7FF"/>
      <rect x="20" y="28" width="350" height="86" rx="22" fill="#F3E8FF"/>
      <text x="35" y="82" font-family="sans-serif" font-size="26" font-weight="800" fill="#581C87">AI 코칭</text>
      <rect x="20" y="150" width="350" height="210" rx="28" fill="#0F172A"/>
      <text x="40" y="206" font-family="sans-serif" font-size="18" fill="#94A3B8">오늘의 컨디션</text>
      <text x="40" y="270" font-family="sans-serif" font-size="56" font-weight="900" fill="#A3E635">88%</text>
      <rect x="20" y="390" width="350" height="220" rx="24" fill="#FFFFFF" stroke="#E9D5FF"/>
      <text x="40" y="440" font-family="sans-serif" font-size="20" font-weight="800" fill="#581C87">오늘의 추천</text>
      <text x="40" y="490" font-family="sans-serif" font-size="18" fill="#7E22CE">• 가벼운 스트레칭</text>
      <text x="40" y="525" font-family="sans-serif" font-size="18" fill="#7E22CE">• 상큼한 음료</text>
      <text x="40" y="560" font-family="sans-serif" font-size="18" fill="#7E22CE">• 산책 약속</text>
    </svg>
  `;

  for (const fileName of [
    'screenshot-01-login.png',
    'screenshot-02-home.png',
    'screenshot-03-battery-report.png',
    'screenshot-04-matching-result.png',
    'screenshot-05-settings.png'
  ]) {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(publicDir, fileName));
  }

  await sharp(Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
      <rect width="1280" height="800" fill="#FAF7FF"/>
      <rect x="40" y="40" width="240" height="720" rx="32" fill="#FFFFFF"/>
      <text x="80" y="100" font-family="sans-serif" font-size="26" font-weight="900" fill="#581C87">AI 코칭</text>
      <rect x="310" y="40" width="930" height="720" rx="32" fill="#FFFFFF"/>
      <text x="360" y="100" font-family="sans-serif" font-size="36" font-weight="900" fill="#2E1065">오늘의 AI 데일리 코칭 리포트</text>
      <rect x="360" y="150" width="410" height="280" rx="24" fill="#0F172A"/>
      <text x="400" y="210" font-family="sans-serif" font-size="20" fill="#94A3B8">오늘의 컨디션 배터리</text>
      <text x="400" y="300" font-family="sans-serif" font-size="80" font-weight="900" fill="#A3E635">88%</text>
      <rect x="800" y="150" width="400" height="280" rx="24" fill="#FAF5FF" stroke="#E9D5FF"/>
      <text x="830" y="220" font-family="sans-serif" font-size="22" font-weight="900" fill="#581C87">추천 가이드</text>
      <text x="830" y="270" font-family="sans-serif" font-size="18" fill="#7E22CE">• 가벼운 스트레칭</text>
      <text x="830" y="305" font-family="sans-serif" font-size="18" fill="#7E22CE">• 상큼한 음료</text>
      <text x="830" y="340" font-family="sans-serif" font-size="18" fill="#7E22CE">• 산책 약속</text>
    </svg>
  `))
    .png()
    .toFile(path.join(publicDir, 'screenshot-06-desktop.png'));
}

async function generateManifest() {
  const manifest = {
    name: 'AI 데일리 코칭',
    short_name: 'AI 코칭',
    description: 'MZ 라이프스타일 컨디션 바이오리듬 AI 분석 코칭 앱',
    start_url: './',
    display: 'standalone',
    background_color: '#FAF7FF',
    theme_color: '#FAF7FF',
    orientation: 'portrait',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' }
    ],
    screenshots: [
      { src: 'screenshot-01-login.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow' },
      { src: 'screenshot-06-desktop.png', sizes: '1280x800', type: 'image/png', form_factor: 'wide' }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

async function copyToDist() {
  ensureDir(distDir);

  const files = [
    'pwa-192x192.png',
    'pwa-512x512.png',
    'maskable-icon-512x512.png',
    'app-icon.png',
    'apple-touch-icon.png',
    'favicon.png',
    'manifest.json',
    'screenshot-01-login.png',
    'screenshot-02-home.png',
    'screenshot-03-battery-report.png',
    'screenshot-04-matching-result.png',
    'screenshot-05-settings.png',
    'screenshot-06-desktop.png'
  ];

  for (const file of files) {
    const source = path.join(publicDir, file);
    const target = path.join(distDir, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, target);
    }
  }
}

async function main() {
  if (!fs.existsSync(robotSrc)) {
    throw new Error(`Missing source image: ${robotSrc}`);
  }

  await generatePwaIcons();
  await generatePlaceholderScreenshots();
  await generateManifest();
  await copyToDist();

  console.log('PWA assets generated successfully.');
}

main().catch((error) => {
  console.error('Failed to generate PWA assets:', error);
  process.exit(1);
});
