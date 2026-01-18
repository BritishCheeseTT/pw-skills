# API 使用指南

本技能使用 AI Router 提供的图像生成 API。

## API 基础信息

### 端点地址

```
https://ai-router.plugins-world.cn/v1beta/models/gemini-3-pro-image-preview:generateContent
```

### 支持的模型

| 模型 | 说明 |
|-----|------|
| `gemini-3-pro-image-preview` | 支持图生图和文生图，高质量输出 |

### 请求方法

```
POST
```

## 请求格式

### 基础请求

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "提示词内容"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

### 包含参考图片的请求

```json
{
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
          "text": "提示词内容"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

### 包含多张参考图片的请求

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
  ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

## 参数说明

### contents

`contents` 数组包含对话历史，每个元素有两个字段：
- `role`：消息角色（`user` 或 `model`）
- `parts`：消息内容数组

### generationConfig

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

| 参数 | 类型 | 说明 |
|-----|------|------|
| `responseModalities` | 数组 | 指定输出模态，`["TEXT", "IMAGE"]` 表示同时接受文本和图像响应 |
| `temperature` | 浮点 | 控制随机性（0.0-1.0），值越低越稳定 |
| `candidateCount` | 整数 | 返回候选图像数量，默认 1 |
| `maxOutputTokens` | 整数 | 最大输出 token 数，默认 8192 |

## 响应格式

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inlineData": {
              "data": "base64编码的图像数据",
              "mime_type": "image/png"
            }
          }
        ]
      },
      "finishReason": "STOP",
      "safetyRatings": [
        {
          "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
          "probability": "NEGLIGIBLE"
        }
      ]
    }
  ],
  "promptFeedback": {
    "safetyRatings": [
      {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "probability": "NEGLIGIBLE"
      }
    ]
  }
}
```

### inlineData

`inlineData` 包含生成的图像数据：
- `data`：base64 编码的图像数据
- `mime_type`：图像格式（通常为 image/png）

### safetyRatings

安全评级信息，分为以下类别：
- HARM_CATEGORY_DANGEROUS_CONTENT：危险内容
- HARM_CATEGORY_HARASSMENT：骚扰内容
- HARM_CATEGORY_HATE_SPEECH：仇恨言论
- HARM_CATEGORY_SEXUALLY_EXPLICIT：色情内容

## 使用 curl 调用 API

### 文生图

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
  }'
```

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
              "file_uri": "https://example.com/reference.png"
            }
          },
          {
            "text": "用这张图的风格绘制一只柴犬"
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'
```

## 使用 Python 调用 API

```python
import requests
import json
import base64

def generate_image(prompt, reference_image=None, api_key="YOUR_API_KEY"):
    url = "https://ai-router.plugins-world.cn/v1beta/models/gemini-3-pro-image-preview:generateContent"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "contents": [
            {
                "role": "user",
                "parts": []
            }
        ],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"]
        }
    }

    if reference_image:
        data["contents"][0]["parts"].append({
            "file_data": {
                "mime_type": "image/png",
                "file_uri": reference_image
            }
        })

    data["contents"][0]["parts"].append({
        "text": prompt
    })

    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        response.raise_for_status()

        result = response.json()

        if "candidates" in result and len(result["candidates"]) > 0:
            candidates = result["candidates"]
            for candidate in candidates:
                if "content" in candidate and "parts" in candidate["content"]:
                    parts = candidate["content"]["parts"]
                    for part in parts:
                        if "inlineData" in part:
                            image_data = part["inlineData"]["data"]
                            return base64.b64decode(image_data)
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

    return None
```

## 错误处理

### 常见错误

1. **API Key 无效**
   ```json
   {"error": "invalid_api_key"}
   ```

2. **API 调用频率超限**
   ```json
   {"error": "rate_limit_exceeded"}
   ```

3. **内容违规**
   ```json
   {"error": "content_blocked"}
   ```

### 重试机制

```python
import time

def generate_with_retry(prompt, retries=3, delay=1):
    for i in range(retries):
        try:
            image_data = generate_image(prompt)
            if image_data:
                return image_data
        except Exception as e:
            print(f"Attempt {i+1} failed: {e}")
            time.sleep(delay)
    return None
```

## API 限制

### 请求限制

- 每个请求最多 8 个 parts
- 单个 part 文本长度不超过 8192 字符
- 图像大小不超过 10MB

### 频率限制

- 每分钟最大请求数：100
- 每天最大请求数：1000

### 响应时间

- 平均响应时间：30 秒
- 超时时间：60 秒

## 最佳实践

1. 合理设置 retry 机制
2. 控制 API 调用频率
3. 及时处理错误响应
4. 监控 API 使用情况
5. 缓存常用图像结果