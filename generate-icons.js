const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#7BA598';
  ctx.fillRect(0, 0, size, size);
  
  // Bird emoji
  ctx.font = `${size * 0.5}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐦', size * 0.4, size * 0.4);
  
  // Vehicle emoji
  ctx.fillText('🚗', size * 0.6, size * 0.6);
  
  const buffer = canvas.toPNG();
  const outDir = path.join(__dirname, 'public', 'assets', 'icons');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `icon-${size}x${size}.png`), buffer);
  console.log(`Generated icon-${size}x${size}.png`);
}

generateIcon(192);
generateIcon(512);
console.log('Icons generated!');
