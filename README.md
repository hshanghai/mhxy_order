# 梦幻西游消费记录系统

一个帮助梦幻西游玩家记录和管理游戏消费与收入的 Web 应用。

## 功能特性

- 人物管理：添加、删除游戏人物
- 消费记录：记录点卡、月卡、年卡、装备、宝宝等消费
- 收入记录：记录出菜、宝宝、装备等收入
- 统计概览：查看每个人物的总消费、总收入和分类统计
- 响应式设计：适配 H5 和桌面端
- 云端存储：数据存储在 Supabase（跨设备自动同步）
- 账号体系：支持注册/登录（密码使用 scrypt 哈希存储）

## 快速开始

### 本地开发

1. 安装依赖

```bash
npm install
```

2. 配置环境变量（本地）

在项目根目录创建 `.env`：

```bash
SUPABASE_URL=你的_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=你的_supabase_service_role_key
```

3. 启动开发

```bash
npm run dev
```

访问 http://127.0.0.1:5173/ 即可使用。

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist` 目录。

## 部署指南（推荐 Vercel）

本项目包含 `/api/*` 后端接口（用于注册/登录与数据读写），推荐使用 Vercel 部署（仓库已包含 `vercel.json`）。

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 访问 https://vercel.com 并登录
3. 点击 New Project 选择仓库并部署
4. 在 Vercel 项目 Settings -> Environment Variables 配置（Production/Preview/Development 都建议配置）：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. 重新部署一次（Redeploy）使环境变量生效

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase（Postgres）
- Node/Express（Vercel Serverless Functions）

## 重要提示

- 当前账号体系使用自建 `users` 表实现，并未接入 Supabase Auth
- 建议在 Supabase 后台定期做数据库备份
