#!/usr/bin/env node
/**
 * merge-to-pdf.js - 将图片文件夹打包成 PDF
 *
 * 用法: node merge-to-pdf.js <图片目录> [--output 输出文件名]
 * 示例: node merge-to-pdf.js ./slides --output output.pdf
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// 参数解析
function parseArgs() {
  const args = process.argv.slice(2);
  let dir = '';
  let output;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      output = args[++i];
    } else if (!args[i].startsWith('-')) {
      dir = args[i];
    }
  }

  if (!dir) {
    console.error('用法: node merge-to-pdf.js <图片目录> [--output 输出文件名]');
    console.error('示例: node merge-to-pdf.js ./slides --output output.pdf');
    process.exit(1);
  }

  return { dir, output };
}

// 查找图片文件
function findSlideImages(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`错误: 目录不存在 - ${dir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir);
  const slidePattern = /^(\d+)-slide-.*\.(png|jpg|jpeg)$/i;
  const imageExts = ['.jpg', '.jpeg', '.png'];

  const slides = files
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return imageExts.includes(ext) && slidePattern.test(f);
    })
    .map((f) => {
      const match = f.match(slidePattern);
      return {
        filename: f,
        path: path.join(dir, f),
        index: parseInt(match[1], 10),
      };
    })
    .sort((a, b) => a.index - b.index);

  if (slides.length === 0) {
    console.error(`错误: 目录中没有找到符合格式的图片文件`);
    console.error('期望格式: 01-slide-*.png, 02-slide-*.png 等');
    process.exit(1);
  }

  return slides;
}

// 创建 PDF
async function createPdf(slides, outputPath) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setAuthor('pw-image-generation');
  pdfDoc.setSubject('Generated Slide Deck');

  for (const slide of slides) {
    const imageData = fs.readFileSync(slide.path);
    const ext = slide.filename.toLowerCase();
    const image = ext.endsWith('.png')
      ? await pdfDoc.embedPng(imageData)
      : await pdfDoc.embedJpg(imageData);

    const { width, height } = image;
    const page = pdfDoc.addPage([width, height]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width,
      height,
    });

    console.log(`  ${slide.index}. ${slide.filename}`);
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  console.log(`\n✅ PDF 生成成功: ${outputPath}`);
  console.log(`   共 ${slides.length} 页`);
}

// 主函数
async function main() {
  const { dir, output } = parseArgs();
  const dirPath = path.resolve(dir);
  const slides = findSlideImages(dirPath);

  const dirName = path.basename(dirPath) === 'slide-deck'
    ? path.basename(path.join(dirPath, '..'))
    : path.basename(dirPath);
  const outputPath = output
    ? path.resolve(output)
    : path.join(dirPath, `${dirName}.pdf`);

  console.log(`找到 ${slides.length} 张图片:`);

  await createPdf(slides, outputPath);
}

main().catch((err) => {
  console.error('生成失败:', err.message);
  process.exit(1);
});
