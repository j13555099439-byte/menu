# Firebase 配置完整指南

## 第一步：创建 Firebase 项目

1. **访问 Firebase 控制台**
   - 打开浏览器，访问：https://console.firebase.google.com/
   - 使用 Google 账号登录

2. **创建新项目**
   - 点击"添加项目"或"创建项目"
   - 输入项目名称：`daily-menu`（或你喜欢的名称）
   - 点击"继续"
   - 可以选择是否启用 Google Analytics（建议先不启用，简化流程）
   - 点击"创建项目"
   - 等待项目创建完成（约30秒）

## 第二步：启用 Realtime Database

### 方法1：从左侧菜单进入

1. **查找 Realtime Database**
   - 在 Firebase 控制台左侧菜单，找到"构建"（Build）部分
   - 查找 **"Realtime Database"** 或 **"实时数据库"**
   - ⚠️ **重要**：不是 "Data Connect"，不是 "Firestore Database"
   
2. **如果找到了 Realtime Database**
   - 点击进入
   - 如果看到"创建数据库"或"Create database"按钮，点击它
   - 如果已经创建过，会直接显示数据库内容

### 方法2：如果找不到 Realtime Database（新版界面）

1. **通过项目概览创建**
   - 在项目概览页面（首页），找到"构建"卡片区域
   - 查找"Realtime Database"卡片
   - 点击"创建数据库"或"Get started"

2. **或者通过搜索**
   - 在控制台顶部搜索框输入 "Realtime Database"
   - 点击搜索结果

3. **创建数据库步骤**
   - 选择"以测试模式启动"（Start in test mode）
   - 点击"下一步"（Next）
   - 选择数据库位置：
     - 中国用户建议选择：asia-east1（台湾）或 asia-southeast1（新加坡）
     - 其他地区选择最近的区域
   - 点击"完成"（Done）
   - 等待数据库创建完成（约30秒）

### 方法3：如果还是找不到

可能你的项目使用的是新版界面，可以尝试：
1. 点击左侧菜单的"项目设置"（齿轮图标）
2. 在"常规"标签页中，查看是否有"数据库"相关选项
3. 或者直接访问：`https://console.firebase.google.com/project/你的项目名/database`

3. **设置数据库规则**
   - 在 Realtime Database 页面，点击"规则"标签
   - 将规则修改为：
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - 点击"发布"
   - ⚠️ 注意：这是测试模式，任何人都可以读写。仅用于开发测试。

## 第三步：获取 Web 应用配置

1. **添加 Web 应用**
   - 在 Firebase 控制台，点击左侧的"项目设置"（齿轮图标）
   - 滚动到"你的应用"部分
   - 点击"Web"图标（</>）
   - 输入应用昵称：`daily-menu-web`（或任意名称）
   - 点击"注册应用"

2. **复制配置信息**
   - 你会看到一个包含 `firebaseConfig` 的代码块
   - 复制整个配置对象，它看起来像这样：
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

## 第四步：更新 firebase-config.js

1. **打开 firebase-config.js 文件**
2. **替换配置信息**
   - 将你复制的 `firebaseConfig` 对象替换到文件中
   - 保存文件

## 第五步：测试 Firebase 连接

1. **刷新浏览器页面**
2. **登录应用**
3. **添加一个菜品测试**
4. **检查 Firebase 控制台**
   - 在 Realtime Database 页面，应该能看到数据出现

## 完成！

现在 Firebase 已经配置完成，数据会同步到云端。
