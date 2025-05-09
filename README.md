# NoteHub-API
一个基于 Express 框架构建的服务端项目，用于为 NoteHub 项目提供 API Service

## 目录说明

### `controllers/`
存放控制器逻辑，处理 HTTP 请求和响应。
### `models/`
存放数据模型，通常用于与数据库交互。
### `routes/`
存放路由文件，定义应用的路由逻辑。
### `services/`
存放业务逻辑服务，处理复杂的业务逻辑。
### `utils/`
存放工具函数和模块，如日期处理、字符串工具等。
### `middlewares/`
存放自定义中间件。
### `config/`
存放配置文件，如数据库配置、环境变量等。

### `public/`
存放静态资源，如图片、CSS 和 JavaScript 文件。

### `views/`
存放视图模板文件，如 Jade、EJS 或其他模板引擎支持的文件。

### `bin/`
存放启动脚本，如 `www` 文件，用于启动 Express 应用。

### `tests/`
存放测试文件，包括单元测试和集成测试。

- **`unit/`**：存放单元测试文件。
- **`integration/`**：存放集成测试文件。

### 其他文件
- **`app.ts`**：应用的入口文件。
- **`package.json`**：项目依赖和配置文件。
- **`README.md`**：项目说明文档。

## 安装和运行

### 环境
Node版本 >= 20

### 安装依赖
```bash
npm install
```

### 开发环境 
- **`start`**：开发环境快速启动。
- **`dev`**：开发环境热重启。

### 测试环境
- **`test`**：执行单元测试。

### 生产环境构建
- **`build`**：构建，编译 TypeScript 代码为 JavaScript。
- **`start:prod`**：生产环境启动。
- **`deploy`**：一键部署（编译 + 启动）。