# 部署说明

## Firebase 配置步骤

1. **创建 Firebase 项目**
   - 访问 https://console.firebase.google.com/
   - 点击"添加项目"
   - 输入项目名称（如：daily-menu）
   - 按照提示完成项目创建

2. **启用 Realtime Database**
   - 在 Firebase 控制台中，点击左侧菜单的"Realtime Database"
   - 点击"创建数据库"
   - 选择"以测试模式启动"（开发阶段）
   - 选择数据库位置（建议选择离你最近的区域）

3. **获取配置信息**
   - 在 Firebase 控制台中，点击项目设置（齿轮图标）
   - 滚动到"你的应用"部分
   - 点击"Web"图标（</>）添加 Web 应用
   - 输入应用昵称，点击"注册应用"
   - 复制配置信息（firebaseConfig 对象）

4. **更新 firebase-config.js**
   - 打开 `firebase-config.js` 文件
   - 将复制的配置信息替换到 `firebaseConfig` 对象中
   - 保存文件

5. **设置数据库规则（重要）**
   - 在 Realtime Database 页面，点击"规则"标签
   - 将规则设置为：
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - 注意：这是测试模式，任何人都可以读写。生产环境需要添加认证。

## 部署到静态托管

### 方案1：GitHub Pages（推荐）

1. **创建 GitHub 仓库**
   - 在 GitHub 上创建新仓库
   - 将项目文件上传到仓库

2. **启用 GitHub Pages**
   - 在仓库设置中找到 "Pages"
   - 选择源分支（通常是 main）
   - 保存

3. **访问网站**
   - 网站地址：`https://你的用户名.github.io/仓库名/`

### 方案2：Netlify（最简单）

1. **访问 https://www.netlify.com/**
2. **注册/登录账号**
3. **拖拽项目文件夹到 Netlify**
4. **完成！** Netlify 会自动部署

### 方案3：Vercel

1. **访问 https://vercel.com/**
2. **注册/登录账号**
3. **导入项目**
4. **完成部署**

## 注意事项

- 确保 `firebase-config.js` 中的配置信息正确
- 确保 Firebase 数据库规则已设置
- 部署后，所有登录用户将共享相同的数据
- 用户名：好好吃饭
- 密码：cmpldxyzz
