# AI 转型战略诊断

一个中文、移动端优先的企业 AI 转型战略诊断网站。用户通过八项可核验记录获得变革深度、实际交付能力、运营基础和信息完整度，以及进化或革命的路线建议。

## 技术结构

- React + TypeScript + Vite + Tailwind CSS
- React Hook Form + Zod
- Cloudflare Pages + Pages Functions
- OpenAI 兼容模型接口，可接入 DeepSeek、通义千问或豆包方舟
- Vitest + Playwright

评分由共享规则模块完成。Pages Function 重新校验选项，并根据正式文件、项目台账和真实运行记录计算分值。最近项目的交付耗时会按实际覆盖部门数校正；未知信息计入证据完整度，不直接按低分处理。模型 API 负责综合多项证据生成解释。模型未配置、超时或输出校验失败时，Function 会返回完整的规则模板报告。

问卷版本为 `3.3`。八项记录包括：正式授权范围、真实运行流程数、有使用前后结果对比的 AI 应用数、过去 12 个月最近项目覆盖部门数、同一项目实际耗时、优先流程材料、一号位决策记录和已生效岗位变化。系统只在进化与革命两条深层变革路线之间给出建议；信息缺失或项目口径需要复核时，会降低置信度并显示风险提示。

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

`npm run dev` 用于调试前端。完整调试 Pages Function：

```bash
npm run dev:pages
```

此命令会先构建，再由 Wrangler 启动 `dist` 与 `functions/`。未配置模型 API 时，本地请求会使用规则模板报告。

## Cloudflare Pages 部署

1. 在 GitHub 新建仓库并推送本目录。
2. 在 Cloudflare Pages 选择该仓库。
3. Framework preset 选择 Vite，Build command 使用 `npm run build`，Output directory 使用 `dist`。
4. 配置 Node.js 版本为 20 或更高。
5. 按 [模型 API 配置](./docs/MODEL_API.md)创建一个 API Key 并添加环境变量。
6. 重新部署并完成移动端、桌面端和中国大陆网络实测。

Cloudflare 会提供免费的 `*.pages.dev` 域名。项目未使用数据库，不保存答案、自由文本或报告。

## 命令

```bash
npm run typecheck   # TypeScript 检查
npm test            # 单元与 API 测试
npm run build       # 生产构建
npm run test:e2e    # Playwright 端到端测试
```

## 隐私与安全

- 模型 API Key 仅存在 Cloudflare 加密变量中。
- 服务端忽略客户端分值，只接收选项 ID 并重新评分。
- 接口启用单实例短时限流、请求结构校验和 25 秒 AI 超时。
- HTTP 响应使用 `no-store`，浏览器只连接同源分析接口。
- 代码不记录答案、补充描述或模型输出。

## 项目入口

- 评分与风险信号：`shared/assessment.ts`
- 降级报告：`shared/fallback-report.ts`
- Pages Function：`functions/api/analyze.ts`
- 前端流程：`src/App.tsx`
- 模型接口和环境变量：[docs/MODEL_API.md](./docs/MODEL_API.md)
