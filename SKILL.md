---
name: image-gen
description: Image-Generation - 基于垫图和提示词的 AI 图像生成工作流。支持文生图、图生图、批量生成。
---

<!--
input: 垫图（可选） + 提示词
output: 生成的图像文件（PNG/JPG/WebP）
pos: 核心 skill，AI 图像生成
-->

# Image-Generation - AI 图像生成工作流

> **核心理念**：用垫图约束风格，用提示词描述内容，AI 生成高质量图像。

## 什么时候用

- 需要根据文本描述生成图像
- 有参考图片，需要生成类似风格的图像
- 需要批量生成多张图像
- 希望保持图像风格一致但内容不同

---

## 工作流程

```
准备参考 → 设计提示词 → 调用API → 下载保存 → 质量检查
    ↓          ↓          ↓          ↓          ↓
  垫图/风格  详细描述    生成图像    文件保存    人工审核
```

---

## 快速开始

### Step 1: 准备参考（可选）

如果需要控制图像风格，可以准备一张垫图：
- 本地图片文件
- 图床 URL（需公网可访问）
- 支持格式：PNG、JPG、WebP、GIF

### Step 2: 设计提示词

写清晰的提示词是成功的关键：
- **详细描述**：场景、主体、风格、颜色、光照等
- **避免歧义**：不要使用模糊词汇
- **示例**："一只可爱的柴犬在樱花树下睡觉，水彩风格，柔和的粉色调，春天的氛围"

### Step 3: 调用 API

#### 直接调用（单张图片）

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
            "file_data": {
              "mime_type": "image/png",
              "file_uri": "https://example.com/reference.png"
            }
          },
          {
            "text": "一只可爱的柴犬在樱花树下睡觉，水彩风格"
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'
```

### Step 4: 保存图像

从 API 响应中提取 base64 数据并保存：

```bash
response='{"candidates": [{"content": {"parts": [{"inlineData": {"data": "..."}}]}}]}'
base64_data=$(echo "$response" | python3 -c "
import json, sys, re
try:
    data = json.load(sys.stdin)
    if 'candidates' in data:
        parts = data.get('candidates', [{}])[0].get('content', {}).get('parts', [])
        for part in parts:
            if 'inlineData' in part:
                print(part['inlineData']['data'])
                sys.exit(0)
            if 'text' in part:
                text = part['text']
                match = re.search(r'data:image/[^;]+;base64,([^)]+)', text)
                if match:
                    print(match.group(1))
                    sys.exit(0)
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
")

echo "$base64_data" | base64 -d > "generated-image.png"
```

---

## 文件索引

| 文件 | 地位 | 功能 |
|------|------|------|
| `docs/01_提示词设计.md` | 指导 | 如何撰写高质量提示词 |
| `docs/02_垫图准备.md` | 指导 | 垫图选择和优化技巧 |
| `docs/03_API使用.md` | 技术 | API 调用详细说明 |
| `config/secrets.md` | 配置 | API Key 和访问配置 |
| `scripts/batch-generate.js` | 工具 | 批量生成图像脚本 |

---

## API 调用详细说明

### 模型说明

| 模型 | 说明 |
|-----|------|
| `gemini-3-pro-image-preview` | Gemini 图像生成模型，支持图生图和文生图 |

### 生成参数

```json
{
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "temperature": 0.7,
    "candidateCount": 1,
    "maxOutputTokens": 8192
  }
}
```

- `temperature`：控制随机性（0.0-1.0），值越低越稳定
- `candidateCount`：返回候选图像数量
- `maxOutputTokens`：最大输出 token 数

### 常见问题

1. **图像质量差**：提示词不够详细，尝试增加风格、光照、材质描述
2. **风格不一致**：使用垫图作为参考
3. **生成失败**：检查提示词是否包含违规内容，API Key 是否有效

---

## 批量生成

使用 `scripts/batch-generate.js` 进行批量操作：

```bash
# 首次使用安装依赖
npm install node-fetch

# 创建配置文件
cat > config/batch-config.json << 'EOF'
{
  "apiKey": "YOUR_API_KEY",
  "tasks": [
    {
      "prompt": "一只可爱的柴犬在樱花树下睡觉，水彩风格",
      "referenceImage": "https://example.com/cherry-blossom.png",
      "outputFile": "result-1.png"
    },
    {
      "prompt": "一只小猫在沙发上打盹，油画风格",
      "referenceImage": "https://example.com/sofa.png",
      "outputFile": "result-2.png"
    }
  ]
}
EOF

# 执行批量生成
node scripts/batch-generate.js config/batch-config.json
```

---

## 目录结构

```
Image-Generation/
├── SKILL.md                  # 入口（本文件）
├── README.md                 # 总览
├── docs/
│   ├── 01_提示词设计.md
│   ├── 02_垫图准备.md
│   └── 03_API使用.md
├── config/
│   ├── secrets.md            # API Key
│   └── batch-config.json     # 批量生成配置
└── scripts/
    └── batch-generate.js     # 批量生成脚本
```

---

## 高级功能

### 图生图

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
            "file_data": {
              "mime_type": "image/png",
              "file_uri": "https://example.com/input.png"
            }
          },
          {
            "text": "将这张图片转为水墨画风格"
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'
```

### 风格迁移

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
    ],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'
```