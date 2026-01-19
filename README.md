# Claude Code Skills

这是一个 Claude Code Skills 仓库，包含多个实用的技能扩展。

## 技能列表

### pw-image-generation

AI 图像生成工作流，支持文生图、图生图、批量生成。

**特性**：
- 文生图和图生图
- 批量生成（逐张确认，避免额度浪费）
- 9 种预设风格（水彩/扁平化/3D/油画/赛博朋克/像素/手绘/写实/抽象）
- 工具脚本：合并长图、打包 PPT

**安装**：
```bash
cd ~/.claude/skills/pw-image-generation && npm install
```

**使用**：查看 [pw-image-generation/SKILL.md](./pw-image-generation/SKILL.md)

---

### pw-redbook-image

小红书风格提示词模板，配合 pw-image-generation 使用。

**特性**：
- 文章拆解为系列图
- 封面图、内容图、结尾图模板
- 小红书风格约束（竖版、卡通手绘、莫兰迪色系）

**依赖**：需要先安装 pw-image-generation

**使用**：查看 [pw-redbook-image/SKILL.md](./pw-redbook-image/SKILL.md)

---

### 其他技能

- **ast-grep**: 基于 AST 的代码结构搜索
- **dev-principles**: 渐进式开发指导原则
- **frontend-design**: 前端 UI/UX 设计
- **research-workflow**: 调研和任务执行策略
- **AIPPT-Enterprise**: 基于模板定制化生成 PPT

## 快速开始

### 1. 克隆仓库

```bash
git clone <repository-url> ~/.claude/skills
```

### 2. 安装依赖（如需要）

```bash
# 安装 pw-image-generation 依赖
cd ~/.claude/skills/pw-image-generation && npm install

# 安装 AIPPT-Enterprise 依赖（如需要）
cd ~/.claude/skills/AIPPT-Enterprise && npm install
```

### 3. 使用技能

在 Claude Code 中，技能会自动加载。使用 `/skill-name` 调用特定技能。

## 让 AI 帮你安装

你可以让 Claude 帮助你安装和配置技能：

```
请帮我安装 pw-image-generation skill：

1. 进入 skill 目录并安装依赖
2. 配置 ai-router 的 API Key：[你的 API Key]
3. 创建测试项目并生成一张测试图片

注意：API Key 是 ai-router 的密钥，支持多种模型。
```

## 目录结构

```
~/.claude/skills/
├── README.md                    # 本文件
├── task.md                      # 任务记录
├── pw-image-generation/         # AI 图像生成
│   ├── SKILL.md
│   ├── references/
│   ├── scripts/
│   └── package.json
├── pw-redbook-image/            # 小红书图片生成
│   ├── SKILL.md
│   └── references/
├── AIPPT-Enterprise/            # PPT 生成
├── ast-grep/                    # AST 代码搜索
├── dev-principles/              # 开发原则
├── frontend-design/             # 前端设计
└── research-workflow/           # 调研工作流
```

## 贡献

欢迎提交 Issue 和 Pull Request。

## 作者

牟勇

官网: https://ai-router.plugins-world.cn

微信: 1254074921 (添加请注明来意)

## 许可证

MIT License
