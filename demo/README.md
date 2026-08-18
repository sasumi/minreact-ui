# minuui 组件演示

这是 minuui 组件库的演示应用，展示了所有可用组件的用法和示例。

## 运行 Demo

### 开发模式

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

然后在浏览器中访问：`http://localhost:5173/demo.html`

### 构建

```bash
pnpm build
```

构建后的 demo 文件将在 `dist` 目录中。

## 目录结构

```
demo/
├── main.tsx           # Demo 应用入口
├── DemoApp.tsx        # Demo 主应用组件
├── DemoApp.scss       # Demo 样式
└── pages/             # 各组件的 Demo 页面
    ├── ButtonDemo.tsx
    ├── SpinnerDemo.tsx
    ├── CounterDemo.tsx
    ├── DialogDemo.tsx
    ├── FormDemo.tsx
    ├── StepInputDemo.tsx
    ├── RangeInputDemo.tsx
    ├── PaginationDemo.tsx
    ├── AsyncListDemo.tsx
    ├── StateWidgetDemo.tsx
    ├── PopoverDemo.tsx
    ├── ToastDemo.tsx
    └── NoviceDemo.tsx
```

## 组件列表

### 基础组件
- **Button** - 多种样式的按钮组件
- **Spinner** - 旋转加载动画
- **Counter** - 字符计数器

### 表单组件
- **Form** - 完整的表单组件
- **StepInput** - 步进输入
- **RangeInput** - 范围输入（滑块）

### 数据组件
- **Pagination** - 分页组件
- **AsyncList** - 异步列表+分页
- **StateWidget** - 状态组件（加载/空数据/错误）

### 交互组件
- **Dialog** - 对话框
- **Popover** - 气泡弹出层
- **Novice** - 新手引导

### 反馈组件
- **Toast** - 消息提示

## 添加新的 Demo 页面

1. 在 `demo/pages/` 目录下创建新的 Demo 组件文件
2. 在 `demo/DemoApp.tsx` 中导入并注册该组件

```tsx
import NewComponentDemo from "./pages/NewComponentDemo";

const components = [
  // ... 其他组件
  { name: "NewComponent", label: "新组件", component: NewComponentDemo, category: "分类" },
];
```

## 注意事项

- 所有组件导入使用 `@/` 别名，指向 `src` 目录
- Demo 页面应该展示组件的各种用法和配置选项
- 包含交互示例和说明文档
