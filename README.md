# 梦幻西游消费记录系统

一个帮助梦幻西游玩家记录和管理游戏消费与收入的 Web 应用。

## 功能特性

- 🎮 人物管理：添加、删除游戏人物
- 💰 消费记录：记录点卡、月卡、年卡、装备、宝宝等消费
- 📈 收入记录：记录出菜、宝宝、装备等收入
- 📊 统计概览：查看每个人物的总消费、总收入和分类统计
- 📱 响应式设计：完美适配 H5 和桌面端
- 💾 本地存储：数据自动保存到浏览器
- 🔄 免费部署：支持部署到 Vercel/Netlify/GitHub Pages

## 快速开始

### 本地开发

```bash
npm install
npm run dev
```

访问 http://127.0.0.1:5173/ 即可使用。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 部署指南

### 方式一：部署到 Vercel（推荐）

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 访问 [vercel.com](https://vercel.com) 并使用 GitHub 账号登录
3. 点击 "New Project"，选择您的仓库
4. 保持默认配置，点击 "Deploy"
5. 等待部署完成，您将获得一个公开访问的 URL

### 方式二：部署到 Netlify

1. 将代码推送到 GitHub
2. 访问 [netlify.com](https://netlify.com) 并登录
3. 点击 "New site from Git"，选择您的仓库
4. 配置构建设置（Build command: `npm run build`，Publish directory: `dist`）
5. 点击 "Deploy site"

### 方式三：部署到 GitHub Pages

1. 在 `package.json` 中添加 homepage 字段：
   ```json
   "homepage": "https://<your-username>.github.io/<repo-name>"
   ```
2. 安装 gh-pages：
   ```bash
   npm install -D gh-pages
   ```
3. 在 `package.json` 中添加 scripts：
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. 运行 `npm run deploy`

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand
- React Router
- Lucide React

## 重要提示

📱 **跨设备同步方法**：
- 在设备 A 上点击"导出数据"，保存 JSON 文件
- 在设备 B 上点击"导入数据"，选择刚才保存的文件
- 即可完成数据同步！

⚠️ 当前数据存储在浏览器的 localStorage 中，建议定期导出备份。

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
