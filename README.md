# Lunch Spin Wheel 午餐转盘

A fun and interactive web application that helps you and your team decide where to eat for lunch. Spin the wheel and let fate decide!

一个有趣的互动式网页应用，帮助您和团队决定午餐去哪里吃。转动转盘，让命运为您做决定！

![Lunch Spin Wheel](screenshot.png)

## 🌟 Features 功能特点

- **Customizable Options**: Add, edit or remove lunch options with custom colors and weights
- **可自定义选项**: 添加、编辑或删除午餐选项，自定义颜色和权重

- **Interactive Spin Wheel**: Beautiful animation with sound effects and result highlighting
- **互动式转盘**: 精美动画，配有音效和结果高亮显示

- **Google Maps Integration**: Search for nearby restaurants and add them directly to your wheel
- **Google地图集成**: 搜索附近餐厅并直接添加到转盘中

- **Save Preferences**: Your options are automatically saved to local storage
- **保存偏好**: 您的选项会自动保存到本地存储中

- **Responsive Design**: Works on desktops, tablets and mobile devices
- **响应式设计**: 适用于桌面电脑、平板和移动设备

## 🌍 Versions 版本说明

This project has two main versions designed for different regions:

本项目有两个主要版本，针对不同区域设计：

### 🇨🇦 Canada Version (Branch: `canada`)

- English UI
- Google Maps integration for North America
- Distance shown in kilometers
- Optimized for Canadian/North American restaurants

### 🇨🇳 China Version (Branch: `china`)

- Chinese UI (中文界面)
- Alternative maps API for China region
- Compatible with Chinese address formats
- Optimized for Chinese restaurants and cuisine types

## 🚀 Getting Started 开始使用

### Prerequisites 前提条件

- Node.js 14+ and npm
- Google Maps API key (for Canada version)

### Installation 安装步骤

1. Clone the repository:
   ```
   git clone https://github.com/christy-wang98/Lunch-spin-wheel.git
   cd lunch-spin-wheel
   ```

2. Switch to your desired version:
   ```
   git checkout canada   # For Canada version
   # OR
   git checkout china    # For China version
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory with your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open `http://localhost:5173` in your browser

## 🛠️ Development Guide 开发指南

### Branch Structure 分支结构

- `main`: Core shared code
- `canada`: Canada-specific version with English UI
- `china`: China-specific version with Chinese UI

### Working with Branches 使用分支

To switch between versions:
```
git checkout canada   # Switch to Canada version
git checkout china    # Switch to China version
```

To merge changes from main to a specific branch:
```
git checkout china
git merge main
git push
```

### Build for Production 构建生产版本

```
npm run build
```

The build output will be in the `dist` directory.

## 📱 Usage Examples 使用示例

### Adding Custom Options 添加自定义选项

1. Use the "Add New Option" section in the left sidebar
2. Enter a name and choose a color
3. Click "Add" to add it to your wheel

### Using the Map to Find Restaurants 使用地图寻找餐厅

1. In the map section, you can search for nearby restaurants
2. Select restaurants you're interested in
3. Click "Add to Wheel" to add them as options

### Adjusting Option Weight 调整选项权重

1. Use the number input next to each option to change its weight
2. Higher weights increase the probability of that option being selected

## 🤝 Contributing 贡献指南

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献！请随时提交Pull Request。

## 📄 License 许可证

This project is licensed under the MIT License - see the LICENSE file for details.

本项目采用MIT许可证 - 详情请参阅LICENSE文件。

## 📞 Contact 联系方式

Christy Wang - christy.wang98@example.com

Project Link: [https://github.com/christy-wang98/Lunch-spin-wheel](https://github.com/christy-wang98/Lunch-spin-wheel)
