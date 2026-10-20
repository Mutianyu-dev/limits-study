# 把项目发布到 GitHub（本机专用步骤）

## 先修网络

本机访问 `github.com` 会超时（DNS 返回的 20.205.243.166 不可达），但 `140.82.113.3` 可达。
桌面上的 `修复GitHub连接.bat` 会把下面两行写进 hosts：

```
140.82.113.3 github.com
140.82.113.3 www.github.com
```

操作：

1. 双击桌面的 **修复GitHub连接.bat**
2. 弹出 UAC 时点「是」
3. 看到 `GitHub hosts entries added` 后按任意键
4. 完全退出 GitHub Desktop（托盘图标也要退出），再重新打开

> 想撤销：用管理员权限打开 `C:\Windows\System32\drivers\etc\hosts`，删掉这两行，再执行 `ipconfig /flushdns`。

## 再用 GitHub Desktop 授权

1. 打开 GitHub Desktop → **Sign in to GitHub.com**
2. 浏览器会打开授权页，点绿色的 **Authorize desktop**
3. 浏览器提示“打开 GitHub Desktop”时点允许
4. 回到客户端，看到自己的头像即成功

## 发布仓库

1. GitHub Desktop → **File → Add local repository**
2. 选择：`D:\documents\桌面\文档\项目\极限学习站`
3. 左下角 Summary 填 `init: 极限研习网站`，点 **Commit to main**
4. 顶部点 **Publish repository**
   - Name：`limits-study`
   - 取消勾选 **Keep this code private**（报名表要能点开）
5. 发布后复制仓库地址，填到报名表 08 项

## 如果以后用命令行

GitHub Desktop 自带的 git 在：

```
C:\Users\Le'novo\AppData\Local\GitHubDesktop\app-3.6.7\resources\app\git\cmd\git.exe
```

首次提交前设置身份（把用户名换成你的 GitHub 用户名）：

```bash
git config user.name "你的用户名"
git config user.email "你的用户名@users.noreply.github.com"
git add .
git commit -m "init: 极限研习网站"
git remote add origin https://github.com/你的用户名/limits-study.git
git push -u origin main
```

推送时如果弹出浏览器授权，点同意即可（Git Credential Manager）。

## 备选：Gitee

如果 GitHub 一直连不上，`gitee.com` 在本机是通的，可以把 remote 换成 Gitee 仓库地址，
报名表里写 Gitee 链接同样算“ github 等托管平台链接”。
