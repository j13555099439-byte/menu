# Firebase Hosting 部署指南（推荐）

由于你已经配置了 Firebase，使用 Firebase Hosting 是最自然的选择！

## 优点
- ✅ 已经配置好 Firebase，无需额外设置
- ✅ 与 Firebase Realtime Database 完美配合
- ✅ 自动 HTTPS
- ✅ 免费额度充足
- ✅ 全球 CDN 加速

---

## 第一步：安装 Firebase CLI

### Windows 用户（使用 PowerShell）

1. **安装 Node.js**（如果还没有）
   - 访问：https://nodejs.org/
   - 下载并安装 LTS 版本
   - 安装完成后，重启 PowerShell

2. **验证 Node.js 安装**
   ```powershell
   node --version
   npm --version
   ```
   如果显示版本号，说明安装成功

3. **安装 Firebase CLI**
   ```powershell
   npm install -g firebase-tools
   ```

---

## 第二步：登录 Firebase

在 PowerShell 中运行：

```powershell
firebase login
```

这会打开浏览器，让你登录 Firebase 账号（使用你创建项目时用的 Google 账号）。

---

## 第三步：初始化 Firebase Hosting

1. **在项目目录中运行**（确保在 `daily-menu` 文件夹中）

   ```powershell
   firebase init hosting
   ```

2. **按提示选择**：
   - ✅ 选择你创建的项目：`menu-2588e`
   - ✅ 公共目录：输入 `.`（当前目录）
   - ✅ 单页应用：输入 `y`（是）
   - ✅ 自动覆盖文件：输入 `n`（否，不覆盖现有文件）

---

## 第四步：部署

运行部署命令：

```powershell
firebase deploy --only hosting
```

等待部署完成（约1-2分钟）

---

## 第五步：获取网址

部署完成后，你会看到类似这样的输出：

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/menu-2588e/overview
Hosting URL: https://menu-2588e.web.app
```

**你的网址就是：`https://menu-2588e.web.app`**

（实际网址可能略有不同，以部署完成后的输出为准）

---

## 后续更新

以后如果需要更新网站，只需要：

1. 修改代码
2. 运行：`firebase deploy --only hosting`

---

## 常见问题

### Q: 如果提示找不到 firebase 命令？
A: 确保已安装 Node.js，并且运行了 `npm install -g firebase-tools`

### Q: 部署后看不到最新内容？
A: 清除浏览器缓存，或使用无痕模式访问

### Q: 如何查看部署历史？
A: 在 Firebase 控制台 → Hosting → 可以看到所有部署记录

---

## 完成！

现在你可以：
1. 用手机打开部署后的网址
2. 登录测试（用户名：好好吃饭，密码：cmpldxyzz）
3. 测试数据同步功能

需要我帮你执行这些步骤吗？
