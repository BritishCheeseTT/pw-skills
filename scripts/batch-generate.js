const fs = require('fs');
const fetch = require('node-fetch');

// 读取配置文件
const configFile = process.argv[2];
if (!configFile) {
  console.error('Usage: node batch-generate.js <config-file>');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

// 生成图像函数
async function generateImage(task) {
  console.log(`Generating: ${task.outputFile}`);

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: []
      }
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"]
    }
  };

  // 添加参考图片
  if (task.referenceImage) {
    requestBody.contents[0].parts.push({
      file_data: {
        mime_type: "image/png",
        file_uri: task.referenceImage
      }
    });
  }

  // 添加提示词
  requestBody.contents[0].parts.push({
    text: task.prompt
  });

  try {
    const response = await fetch(
      "https://ai-router.plugins-world.cn/v1beta/models/gemini-3-pro-image-preview:generateContent",
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();

    // 提取图像数据
    let base64Data = null;
    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
        if (part.text) {
          const match = part.text.match(/data:image\/[^;]+;base64,([^)]+)/);
          if (match) {
            base64Data = match[1];
            break;
          }
        }
      }
    }

    if (base64Data) {
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(task.outputFile, buffer);
      console.log(`Success: ${task.outputFile}`);
    } else {
      console.error(`Failed to get image data: ${task.outputFile}`);
    }
  } catch (error) {
    console.error(`Error generating ${task.outputFile}:`, error.message);
  }
}

// 主函数
async function main() {
  console.log(`Starting batch generation: ${config.tasks.length} tasks`);
  console.log('=' . repeat(50));

  // 串行执行任务，避免 API 频率限制
  for (const task of config.tasks) {
    await generateImage(task);
    // 添加延迟，避免 API 频率限制
    if (config.delay) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 默认延迟 1 秒
    }
  }

  console.log('=' . repeat(50));
  console.log('Batch generation completed');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});