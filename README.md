# Image-Generation - AI 图像生成

基于 AI Router API 的图像生成工具，支持文生图、图生图和批量生成。

## 特性

- 文生图：使用文本描述生成图像
- 图生图：使用参考图片生成类似风格图像
- 批量生成：一次生成多张图像
- 风格迁移：将一张图片的风格应用到另一张图片

## 快速开始

### 安装依赖

```bash
npm install node-fetch
```

### 配置 API Key

��辑 `config/secrets.md` 或直接在配置文件中设置 API Key。

### 单张图像生成

```bash
curl -s -X POST "https://ai-router.plugins-world.cn/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "一只可爱的柴犬在樱花树下睡觉，水彩风格"
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }' | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'candidates' in data:
    parts = data['candidates'][0]['content']['parts']
    for part in parts:
        if 'inlineData' in part:
            import base64
            with open('output.png', 'wb') as f:
                f.write(base64.b64decode(part['inlineData']['data']))
            print('Image saved as output.png')
"
```

### 批量生成

创建配置文件 `config/batch-config.json`：

```json
{
  "apiKey": "YOUR_API_KEY",
  "delay": 2000,
  "tasks": [
    {
      "prompt": "一只可爱的柴犬在樱花树下睡觉，水彩风格",
      "outputFile": "result-1.png"
    },
    {
      "prompt": "一只小猫在沙发上打盹，油画风格",
      "referenceImage": "https://example.com/sofa.png",
      "outputFile": "result-2.png"
    }
  ]
}
```

运行批量生成：

```bash
node scripts/batch-generate.js config/batch-config.json
```

## 文档

| 文档 | 说明 |
|-----|------|
| [SKILL.md](./SKILL.md) | 核心 skill 文档 |
| [docs/01_提示词设计.md](./docs/01_提示词设计.md) | 如何撰写高质量提示词 |
| [docs/02_垫图准备.md](./docs/02_垫图准备.md) | 垫图选择和优化技巧 |
| [docs/03_API使用.md](./docs/03_API使用.md) | API 调用详细说明 |

## 目录结构

```
Image-Generation/
├── SKILL.md                  # 核心 skill 文档
├── README.md                 # 本文件
├── docs/
│   ├── 01_提示词设计.md
│   ├── 02_垫图准备.md
│   └── 03_API使用.md
├── config/
│   ├── secrets.md            # API Key 配置
│   └── batch-config.json     # 批量生成配置示例
└── scripts/
    └── batch-generate.js     # 批量生成脚本
```

## 示例

### 文生图

输入提示词："一只可爱的柴犬在樱花树下睡觉，水彩风格，柔和的粉色调"

输出：生成一张符合描述的图像

### 图生图

输入垫图：水彩风格画作

输入提示词："用这张图的风格绘制一座雪山"

输出：生成水彩风格的雪山图像

### 风格迁移

输入垫图1：水墨画风格的山水画

输入垫图2：一张现代城市照片

输入提示词："用第一张图的水墨风格重新绘制第二张图的城市"

输出：水墨风格的城市图像

## 高级功能

### 多张垫图

可以同时使用多张垫图来控制风格和内容：

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "file_data": {
            "mime_type": "image/png",
            "file_uri": "https://example.com/style-ref.png"
          }
        },
        {
          "file_data": {
            "mime_type": "image/png",
            "file_uri": "https://example.com/content-ref.png"
          }
        },
        {
          "text": "用第一张图的风格重新绘制第二张图"
        }
      ]
    }
  ]
}
```

### 参数调整

调整 `temperature` 参数控制随机性：

```json
{
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "temperature": 0.3
  }
}
```

- `temperature = 0.0`：完全确定性，每次生成相同
- `temperature = 0.5`：较低随机性，风格稳定
- `temperature = 1.0`：较高随机性，创意更多样

## 常见问题

### 生成速度慢

图像生成通常需要 20-40 秒，请耐心等待。

### 图像质量差

优化提示词，增加更多细节描述：

```
"一只可爱的柴犬在樱花树下睡觉，水彩风格，柔和的粉色调，春天的氛围，毛发蓬松，细节丰富，4K 分辨率"
```

### API 调用失败

检查以下几点：
1. API Key 是否正确
2. 是否超出调用频率限制
3. 提示词是否包含违规内容

### 风格不一致

使用垫图作为参考，可以有效控制风格一致性。

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT License