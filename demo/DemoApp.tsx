import { useCallback, useEffect, useState } from "react";
import "./DemoApp.scss";

// Import all demo pages
import ButtonDemo from "./pages/ButtonDemo";
import SpinnerDemo from "./pages/SpinnerDemo";
import CounterDemo from "./pages/CounterDemo";
import DialogDemo from "./pages/DialogDemo";
import FormDemo from "./pages/FormDemo";
import StepInputDemo from "./pages/StepInputDemo";
import RangeInputDemo from "./pages/RangeInputDemo";
import PaginationDemo from "./pages/PaginationDemo";
import AsyncListDemo from "./pages/AsyncListDemo";
import StateWidgetDemo from "./pages/StateWidgetDemo";
import PopoverDemo from "./pages/PopoverDemo";
import ToastDemo from "./pages/ToastDemo";
import NoviceDemo from "./pages/NoviceDemo";

const components = [
  { name: "Button", label: "按钮", component: ButtonDemo, category: "基础组件" },
  { name: "Spinner", label: "加载器", component: SpinnerDemo, category: "基础组件" },
  { name: "Counter", label: "字符计数器", component: CounterDemo, category: "基础组件" },
  { name: "Dialog", label: "对话框", component: DialogDemo, category: "交互组件" },
  { name: "Form", label: "表单", component: FormDemo, category: "表单组件" },
  { name: "StepInput", label: "步进输入", component: StepInputDemo, category: "表单组件" },
  { name: "RangeInput", label: "范围输入", component: RangeInputDemo, category: "表单组件" },
  { name: "Pagination", label: "分页", component: PaginationDemo, category: "数据组件" },
  { name: "AsyncList", label: "异步列表", component: AsyncListDemo, category: "数据组件" },
  { name: "StateWidget", label: "状态组件", component: StateWidgetDemo, category: "数据组件" },
  { name: "Popover", label: "气泡弹出层", component: PopoverDemo, category: "交互组件" },
  { name: "Toast", label: "消息提示", component: ToastDemo, category: "反馈组件" },
  { name: "Novice", label: "新手引导", component: NoviceDemo, category: "交互组件" },
];

const DEFAULT_COMPONENT = "Button";

/** Read the current component name from the URL hash, e.g. `#/Dialog` → `"Dialog"`. */
function getComponentFromHash(): string {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash && components.some((c) => c.name === hash)) {
    return hash;
  }
  return DEFAULT_COMPONENT;
}

function DemoApp() {
  const [activeComponent, setActiveComponent] = useState(getComponentFromHash);

  // Sync hash ↔ state on mount and when the user presses back/forward
  useEffect(() => {
    const onHashChange = () => setActiveComponent(getComponentFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigateTo = useCallback((name: string) => {
    window.location.hash = `#/${name}`;
  }, []);

  const ActiveDemo = components.find((c) => c.name === activeComponent)?.component || ButtonDemo;

  // Group components by category
  const categorizedComponents = components.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof components>);

  return (
    <div className="demo-app">
      <aside className="demo-sidebar">
        <div className="demo-header">
          <h1>MinUI</h1>
          <p className="demo-subtitle">组件演示</p>
        </div>
        <nav className="demo-nav">
          {Object.entries(categorizedComponents).map(([category, items]) => (
            <div key={category} className="demo-nav-group">
              <h3 className="demo-nav-category">{category}</h3>
              <ul className="demo-nav-list">
                {items.map((item) => (
                  <li key={item.name}>
                    <button
                      className={`demo-nav-item ${activeComponent === item.name ? "active" : ""}`}
                      onClick={() => navigateTo(item.name)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main className="demo-content">
        <ActiveDemo />
      </main>
    </div>
  );
}

export default DemoApp;
