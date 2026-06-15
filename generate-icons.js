/**
 * 生成 Tauri 图标
 * 运行: node generate-icons.js
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'icons');

// 创建一个简单的 PNG 图标（紫色圆角矩形 + 白色对勾）
function createIconPNG(size) {
  // 使用 Canvas API 创建
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 圆角背景
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();

  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#a855f7');
  gradient.addColorStop(1, '#6366f1');
  ctx.fillStyle = gradient;
  ctx.fill();

  // 白色对勾
  ctx.beginPath();
  ctx.moveTo(size * 0.25, size * 0.5);
  ctx.lineTo(size * 0.45, size * 0.7);
  ctx.lineTo(size * 0.75, size * 0.3);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

// 生成图标
const sizes = [32, 128];
sizes.forEach(size => {
  const data = createIconPNG(size);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${size}x${size}.png`), data);
  console.log(`Created ${size}x${size}.png`);
});

console.log('Done!');
