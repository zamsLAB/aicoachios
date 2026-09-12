const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const robotSrc = path.join('src', 'assets', 'images', 'app_icon_robot_1785405143321.jpg');
const appIconSetDir = path.join('ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

async function generateAppIconSet() {
  console.log('Generating only the iOS AppIcon asset catalog for Xcode builds...');

  if (!fs.existsSync(robotSrc)) {
    throw new Error(`Missing source app icon: ${robotSrc}`);
  }

  fs.mkdirSync(appIconSetDir, { recursive: true });

  const iosSizes = [
    { name: 'AppIcon-20x20@2x.png', size: 40, idiom: 'iphone', scale: '2x', pointSize: '20x20' },
    { name: 'AppIcon-20x20@3x.png', size: 60, idiom: 'iphone', scale: '3x', pointSize: '20x20' },
    { name: 'AppIcon-29x29@2x.png', size: 58, idiom: 'iphone', scale: '2x', pointSize: '29x29' },
    { name: 'AppIcon-29x29@3x.png', size: 87, idiom: 'iphone', scale: '3x', pointSize: '29x29' },
    { name: 'AppIcon-40x40@2x.png', size: 80, idiom: 'iphone', scale: '2x', pointSize: '40x40' },
    { name: 'AppIcon-40x40@3x.png', size: 120, idiom: 'iphone', scale: '3x', pointSize: '40x40' },
    { name: 'AppIcon-60x60@2x.png', size: 120, idiom: 'iphone', scale: '2x', pointSize: '60x60' },
    { name: 'AppIcon-60x60@3x.png', size: 180, idiom: 'iphone', scale: '3x', pointSize: '60x60' },
    { name: 'AppIcon-20x20@1x.png', size: 20, idiom: 'ipad', scale: '1x', pointSize: '20x20' },
    { name: 'AppIcon-20x20@2x_ipad.png', size: 40, idiom: 'ipad', scale: '2x', pointSize: '20x20' },
    { name: 'AppIcon-29x29@1x.png', size: 29, idiom: 'ipad', scale: '1x', pointSize: '29x29' },
    { name: 'AppIcon-29x29@2x_ipad.png', size: 58, idiom: 'ipad', scale: '2x', pointSize: '29x29' },
    { name: 'AppIcon-40x40@1x.png', size: 40, idiom: 'ipad', scale: '1x', pointSize: '40x40' },
    { name: 'AppIcon-40x40@2x_ipad.png', size: 80, idiom: 'ipad', scale: '2x', pointSize: '40x40' },
    { name: 'AppIcon-76x76@1x.png', size: 76, idiom: 'ipad', scale: '1x', pointSize: '76x76' },
    { name: 'AppIcon-76x76@2x.png', size: 152, idiom: 'ipad', scale: '2x', pointSize: '76x76' },
    { name: 'AppIcon-83.5x83.5@2x.png', size: 167, idiom: 'ipad', scale: '2x', pointSize: '83.5x83.5' },
    { name: 'AppIcon-512@2x.png', size: 1024, idiom: 'ios-marketing', scale: '1x', pointSize: '1024x1024' }
  ];

  for (const item of iosSizes) {
    const iconBuffer = await sharp(robotSrc)
      .removeAlpha()
      .flatten({ background: '#FAF7FF' })
      .resize(item.size, item.size, { fit: 'cover' })
      .png({ progressive: false })
      .toBuffer();

    fs.writeFileSync(path.join(appIconSetDir, item.name), iconBuffer);
  }

  const contentsJson = {
    images: [
      {
        idiom: 'universal',
        platform: 'ios',
        size: '1024x1024',
        filename: 'AppIcon-512@2x.png'
      },
      ...iosSizes.map((size) => ({
        filename: size.name,
        idiom: size.idiom,
        scale: size.scale,
        size: size.pointSize
      }))
    ],
    info: {
      author: 'xcode',
      version: 1
    }
  };

  fs.writeFileSync(path.join(appIconSetDir, 'Contents.json'), JSON.stringify(contentsJson, null, 2));
  console.log(`Generated AppIcon catalog at ${appIconSetDir}`);
}

generateAppIconSet().catch((error) => {
  console.error('Failed to generate iOS AppIcon asset catalog:', error);
  process.exit(1);
});
