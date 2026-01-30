# Firebase 快速配置指南（已创建项目）

## 你现在应该看到什么？

创建项目后，你应该在 Firebase 控制台的项目概览页面。

## 第一步：找到 Realtime Database

### 方法1：在项目概览页面查找（最简单）

1. **查看页面上的卡片**
   - 在项目概览页面，你会看到多个卡片，比如：
     - "Authentication"（身份验证）
     - "Firestore Database"
     - "Realtime Database" ← **找这个！**
     - "Storage"
     - "Functions"
     - 等等

2. **找到 Realtime Database 卡片**
   - 卡片上可能显示"Get started"或"创建数据库"按钮
   - 点击这个卡片或按钮

### 方法2：从左侧菜单进入

1. **查看左侧菜单**
   - 找到"构建"（Build）部分
   - 点击 **"Realtime Database"** 或 **"实时数据库"**
   - ⚠️ 不是 "Firestore Database"，不是 "Data Connect"

### 方法3：直接访问（如果知道项目ID）

在浏览器地址栏输入：
```
https://console.firebase.google.com/project/你的项目ID/database
```

## 第二步：创建数据库

1. **点击"创建数据库"或"Create database"**

2. **选择模式**
   - 选择 **"以测试模式启动"** 或 **"Start in test mode"**
   - 点击"下一步"或"Next"

3. **选择位置**
   - 选择离你最近的区域
   - 中国用户建议：asia-east1 或 asia-southeast1
   - 点击"完成"或"Done"

4. **等待创建完成**（约30秒）

## 第三步：设置数据库规则

1. **在 Realtime Database 页面**
   - 点击顶部的"规则"或"Rules"标签

2. **修改规则**
   - 将规则改为：
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - 点击"发布"或"Publish"

## 第四步：获取 Web 应用配置

1. **进入项目设置**
   - 点击左侧菜单的"项目设置"（齿轮图标 ⚙️）

2. **添加 Web 应用**
   - 滚动到"你的应用"（Your apps）部分
   - 点击"Web"图标（</>）
   - 输入应用昵称：`daily-menu-web`
   - 点击"注册应用"或"Register app"

3. **复制配置**
   - 你会看到 `firebaseConfig` 代码块
   - 复制整个配置对象

4. **更新 firebase-config.js**
   - 打开项目中的 `firebase-config.js` 文件
   - 将复制的配置替换进去
   - 保存文件

## 完成！

现在刷新浏览器，登录应用，数据就会同步到 Firebase 了！
