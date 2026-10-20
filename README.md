# 极限研习 · Limits

一个讲「高数极限」的静态站点：首页三径（刷题 / 方法 / 设置）、五大方法模块、33 道四步解析例题、550 道分型题库，带判分、错题本、收藏、深浅色与「连对奖励诗句」。

- 前端：原生 HTML / CSS / JavaScript，无框架、无构建步骤
- 后端：Node.js 内置模块（`http`、`fs`、`node:sqlite`），零第三方依赖
- 数据：JSON 内容 + 生成脚本，构建期校验

## 运行

```bash
node server.js
# 打开 http://127.0.0.1:8787
```

要求 Node 22+（用到内置 `node:sqlite`）。数据文件在 `data/limits.db`，首次启动自动创建。

## 目录

```
server.js               HTTP 服务 + API + 静态资源
lib/
  content.js            方法 JSON / 题库 JSON 的加载与校验
  store.js              SQLite：答题、收藏、设置
  http.js               JSON 响应、请求体、Cookie
content/
  methods/*.json        五个方法模块（总流程、题型、进阶、方法失效、例题）
  examples/*.json       33 道例题的源文件（按题型分组）
  bank/<题型>.js        550 道题库的源文件（每型 50 题）
  questions.json        构建产物，服务端读取
public/
  index.html            启动页
  main.html             三径
  method.html           方法详情
  practice.html         题库练习
  wrongbook.html        收藏错题
  assets/               app.css、core.js、math.js、各页脚本
scripts/
  build-examples.js     合并 content/examples → methods/05-examples.json
  gen-bank.js           合并 content/bank → questions.json
  check-content.js      JSON、公式命令、花括号配平检查
  capture.js            无头浏览器交互回归（答题、奖励、错题本）
```

## 功能

- **启动页**：中心菱形 + 8 个 M 词环形对称排布，点击进入
- **三径**：刷题·涵泳 / 方法·破的 / 设置·设彀，三等分卡片
- **方法**：总流程（四步闭环）、题型分类（七型 + 可转化 + 求和型）、进阶细节、方法失效、例题
- **例题**：11 个题型 × 3 道，每题按「判断类型 → 预处理化简 → 匹配解法 → 二次校验」展开
- **题库**：11 型 × 50 题，题型筛选、判分、解析、收藏、进度条
- **错题本**：错题自动归档、收藏列表、重做、移除
- **设置**：深浅色、奖励频率（连对 1/3/5 题）、奖励等级（大爱仙尊 / 教员毛泽东诗词）

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 题量、方法数、运行时长 |
| GET | `/api/methods` | 方法摘要列表 |
| GET | `/api/methods/:slug` | 方法详情 |
| GET | `/api/questions?type=&difficulty=` | 题库（不含答案） |
| POST | `/api/answer` | 判分并记录答题 |
| GET | `/api/progress` | 作答统计 |
| GET | `/api/wrongbook` | 错题 + 收藏 |
| POST | `/api/favorites` | 收藏 / 取消 |
| DELETE | `/api/wrongbook/:qid?kind=` | 移除错题或收藏 |
| GET/PUT | `/api/settings` | 主题与奖励设置 |

## 内容管线

题库不直接手写 JSON，而是每型一个 JS 文件：

```js
// content/bank/form00.js
q(题干, ['正确项', '干扰项1', '干扰项2', '干扰项3'], 难度, 解析)
```

`gen-bank.js` 会：
1. 校验每题 4 个不重复选项、难度合法；
2. 用固定种子打乱选项，答案不会总在 A；
3. 校验失败直接报错退出（构建即测试）。

```bash
node scripts/build-examples.js   # 例题合稿
node scripts/gen-bank.js         # 题库构建
node scripts/check-content.js    # 内容体检
```

## 验证

- `check-content.js`：JSON 合法、公式命令都在渲染器覆盖范围内、花括号配平
- API 实测：11 个题型各 50 题，`/api/health` 返回 550
- `capture.js`：无头 Edge 驱动，验证答对/答错、错题入库、奖励层、连对 1/2 次不触发、第 3 次触发
- 页面：启动页、三径、题库、错题本、5 个方法页全部 200

数学答案由人工编写并抽查，自动校验只保证结构与答案键合法，不构成逐题证明。

## 设计

- 以页面中线为轴左右对称；卡片等宽等高
- 中文标题用宋体，英文用无衬线 + 大字距
- 深浅色由 CSS 变量切换，只改 `html[data-theme]`
- 公式使用自研的迷你 TeX 子集渲染器（`public/assets/math.js`），离线可用，不依赖 CDN

## 相关小项目

- `c-trainer/`：C 语言命令行训练器（函数 + 循环 + 分支，含菱形打印）
- `../mini-splash/`：从启动页抽出的独立小项目（环形布局 + 诗句弹层）
