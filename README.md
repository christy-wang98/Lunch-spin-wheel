# 午餐大转盘 (Lunch Spin Wheel)

这是一个帮助用户随机选择午餐的趣味工具。使用React + TypeScript开发，提供简单直观的用户界面。

## 功能特点

- 可视化转盘界面，展示不同的午餐选项
- 随机转动功能，带有平滑的动画效果
- 结果展示区域，清晰显示最终选中的午餐
- 支持自定义午餐选项，可调整选项权重
- 集成高德地图，搜索附近餐厅并添加到转盘
- 基于位置的餐厅推荐，帮助用户快速决定
- 显示餐厅详细信息，包括地址、距离等
- 响应式设计，适配各种屏幕尺寸

## 技术栈

- React 18
- TypeScript
- Vite
- CSS Modules
- 高德地图JavaScript API

## 开发环境设置

1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
npm install
```

3. 配置高德地图API密钥
创建`.env.local`文件，添加以下内容：
```
VITE_AMAP_KEY=您的高德地图JavaScript API密钥
VITE_AMAP_SECRET=您的高德地图Web服务API密钥
VITE_AMAP_VERSION=2.0
```

4. 启动开发服务器
```bash
npm run dev
```

## 功能说明

### 基础功能
- **转盘旋转**：点击转盘中心或"旋转"按钮开始旋转
- **自定义选项**：在右侧面板添加、删除或修改选项
- **权重调整**：为不同选项设置权重，影响其被选中的概率

### 地图功能
- **位置获取**：自动获取用户当前位置
- **餐厅搜索**：根据关键词和距离搜索附近餐厅
- **快速添加**：选择餐厅并一键添加到转盘选项中
- **详细信息**：显示餐厅地址、距离等信息

## 使用方法

1. 进入应用后，系统会请求位置权限，建议允许以获得最佳体验
2. 地图界面会显示您附近的餐厅，可以通过关键词筛选特定类型
3. 选择喜欢的餐厅，点击"添加到转盘"按钮
4. 在转盘界面旋转，随机选择一家餐厅
5. 结果区域会显示选中餐厅的详细信息

## 项目结构

```
src/
├── components/        # 可复用组件
│   ├── SpinWheel/     # 转盘组件
│   ├── OptionList/    # 选项列表组件
│   └── MapView/       # 地图视图组件
├── types/             # TypeScript类型定义
├── utils/             # 工具函数
│   └── mapService.ts  # 高德地图服务封装
└── App.tsx            # 应用入口
```

## 获取高德地图API密钥

1. 前往[高德开放平台](https://lbs.amap.com/)注册账号
2. 创建应用并获取JavaScript API密钥
3. 在应用中添加安全设置（Web服务API需要设置IP白名单）

## 技术支持

如有问题或建议，请提交Issue或联系[维护者邮箱]

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

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
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Google Maps API 使用说明

本应用使用 Google Maps Platform 提供的以下服务：
- Maps JavaScript API：显示地图
- Places API：搜索周边餐厅
- Geocoding API：地址解析

为了优化API使用和控制成本：
1. 所有API请求都有30分钟的缓存
2. 实现了请求限流机制：
   - Maps API: 每分钟最多50次请求
   - Places API: 每分钟最多30次请求
   - Geocoding API: 每分钟最多20次请求

## 项目结构

```
src/
  ├── components/         # 组件目录
  │   ├── SpinWheel/     # 转盘组件
  │   ├── OptionList/    # 选项列表组件
  │   └── MapView/       # 地图视图组件
  ├── utils/             # 工具函数
  │   ├── cacheService.ts    # 缓存服务
  │   ├── rateLimiter.ts    # 请求限流服务
  │   └── mapService.ts     # 地图服务
  └── App.tsx            # 应用入口
```

## 贡献指南

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT
