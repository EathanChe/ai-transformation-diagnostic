# 模型 API 配置

网站后端直接调用 OpenAI 兼容接口。无需搭建节点工作流，也无需在浏览器里拖拽画布。评分、路线判断和风险信号都由服务器代码完成，模型只负责解释结论和生成 90 天行动建议。

## 推荐选择：DeepSeek

DeepSeek 的配置项最少：

1. 登录 DeepSeek 开放平台，创建一个 API Key。
2. 在 Cloudflare Pages 的 Settings → Variables and Secrets 中添加：
   - `LLM_API_KEY`：Secret，填写 API Key。
   - `LLM_BASE_URL`：普通变量，填写 `https://api.deepseek.com`。
   - `LLM_MODEL`：普通变量，填写 `deepseek-chat`。
3. 重新部署网站。

API Key 只会保存在 Cloudflare 服务端。请勿添加 `VITE_` 前缀，也不要把真实密钥写入 `.env.example` 或提交到 GitHub。

## 其他兼容平台

### 通义千问

- `LLM_BASE_URL`：`https://dashscope.aliyuncs.com/compatible-mode/v1`
- `LLM_MODEL`：`qwen-plus`
- `LLM_API_KEY`：阿里云百炼 API Key

### 豆包方舟

- `LLM_BASE_URL`：`https://ark.cn-beijing.volces.com/api/v3`
- `LLM_MODEL`：填写方舟控制台提供的模型或推理接入点 ID
- `LLM_API_KEY`：火山方舟 API Key

三个平台选择其中一个即可。网站会调用 `${LLM_BASE_URL}/chat/completions`，并要求模型返回结构化 JSON。

## 验证方式

完成一次测评后，结果页底部显示“AI 模型已完成深度分析”，代表模型接口调用成功。若显示“已使用本地战略规则完成分析”，网站功能仍可正常使用，可按以下顺序检查：

1. `LLM_API_KEY` 是否有效并有可用余额。
2. `LLM_BASE_URL` 是否包含平台要求的版本路径。
3. `LLM_MODEL` 是否可由该账号调用。
4. Cloudflare Function 是否已经重新部署。

服务端对模型请求设置 25 秒超时。模型返回结构不合格时会自动请求一次格式修复，第二次仍未通过时使用规则模板报告。
