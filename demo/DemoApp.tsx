import { useCallback, useEffect, useState } from "react";
import "./DemoApp.scss";

// Import all demo pages
import ButtonDemo from "./pages/ButtonDemo";
import SpinnerDemo from "./pages/SpinnerDemo";
import CounterDemo from "./pages/CounterDemo";
import DialogDemo from "./pages/DialogDemo";
import StepInputDemo from "./pages/StepInputDemo";
import RangeInputDemo from "./pages/RangeInputDemo";
import PaginationDemo from "./pages/PaginationDemo";
import HistoryInputDemo from "./pages/HistoryInputDemo";
import AsyncListDemo from "./pages/AsyncListDemo";
import StateWidgetDemo from "./pages/StateWidgetDemo";
import PopoverDemo from "./pages/PopoverDemo";
import ToastDemo from "./pages/ToastDemo";
import NoviceDemo from "./pages/NoviceDemo";
import MenuDemo from "./pages/MenuDemo";
import ImageDemo from "./pages/ImageDemo";
import TabsDemo from "./pages/TabsDemo";

const components = [
    { name: "Button", label: "按钮", description: "多种样式的按钮组件，包括主按钮、普通按钮、文本按钮等", component: ButtonDemo, category: "基础组件" },
    { name: "Spinner", label: "加载器", description: "旋转加载动画组件", component: SpinnerDemo, category: "基础组件" },
    { name: "Counter", label: "字符计数器", description: "显示输入框字符数量的计数器组件", component: CounterDemo, category: "基础组件" },
    { name: "Dialog", label: "对话框", description: "可配置的模态对话框组件", component: DialogDemo, category: "交互组件" },
    { name: "StepInput", label: "步进输入", description: "带加减按钮的数字输入组件", component: StepInputDemo, category: "表单组件" },
    { name: "RangeInput", label: "范围输入", description: "滑块式范围选择器", component: RangeInputDemo, category: "表单组件" },
    { name: "HistoryInput", label: "历史输入", description: "支持本地历史回填的输入框", component: HistoryInputDemo, category: "表单组件" },
    { name: "Pagination", label: "分页", description: "数据分页组件", component: PaginationDemo, category: "数据组件" },
    { name: "AsyncList", label: "异步列表", description: "支持分页的异步数据列表组件", component: AsyncListDemo, category: "数据组件" },
    { name: "Menu", label: "菜单", description: "菜单组件", component: MenuDemo, category: "交互组件" },
    { name: "StateWidget", label: "状态组件", description: "数据加载、空状态、错误状态展示组件", component: StateWidgetDemo, category: "数据组件" },
    { name: "Popover", label: "气泡弹出层", description: "可定位的浮动弹出层组件", component: PopoverDemo, category: "交互组件" },
    { name: "Toast", label: "消息提示", description: "全局消息提示组件", component: ToastDemo, category: "反馈组件" },
    { name: "Novice", label: "新手引导", description: "分步引导用户的新手教程组件", component: NoviceDemo, category: "交互组件" },
    { name: "Image", label: "图片加载", description: "支持加载、错误、空状态的图片组件", component: ImageDemo, category: "基础组件" },
    { name: "Tabs", label: "标签页", description: "数据驱动的标签页切换组件，支持受控与非受控模式", component: TabsDemo, category: "交互组件" },
];

/** Sentinel used when the URL does not point at a specific component (the gallery). */
const HOME = "";

/** Resolve the active component from the URL. Prefers path routes such as
 * `/Dialog.html` or `/Dialog`, then falls back to hash routes like `#/Dialog`. */
function getRouteFromLocation(): string {
    const pathMatch = window.location.pathname.match(/\/([A-Za-z0-9]+?)(?:\.html)?\/?$/);
    if (pathMatch && components.some((c) => c.name === pathMatch[1])) {
        return pathMatch[1];
    }
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (hash && components.some((c) => c.name === hash)) {
        return hash;
    }
    return HOME;
}

function DemoApp() {
    const [activeComponent, setActiveComponent] = useState(getRouteFromLocation);

    // Sync URL ↔ state on mount and when the user presses back/forward
    useEffect(() => {
        const onLocationChange = () => setActiveComponent(getRouteFromLocation());
        window.addEventListener("popstate", onLocationChange);
        window.addEventListener("hashchange", onLocationChange);
        return () => {
            window.removeEventListener("popstate", onLocationChange);
            window.removeEventListener("hashchange", onLocationChange);
        };
    }, []);

    const navigateTo = useCallback((name: string) => {
        window.history.pushState(null, "", `/${name}.html`);
        setActiveComponent(name);
    }, []);

    const ActiveDemo = components.find((c) => c.name === activeComponent);

    // The root URL shows the component gallery instead of a single demo.
    if (!ActiveDemo) {
        return (
            <div className="container">
                <header>
                    <h1>minreactui 组件演示</h1>
                    <p className="description">基于 Vite 8 + React 19 + TypeScript 6 的 UI 组件库</p>
                </header>
                <div className="components-grid">
                    {components.map((item) => (
                        <a
                            key={item.name}
                            href={`/${item.name}.html`}
                            className="component-card"
                            onClick={(event) => {
                                event.preventDefault();
                                navigateTo(item.name);
                            }}
                        >
                            <h2>
                                {item.name} {item.label}
                            </h2>
                            <p>{item.description}</p>
                            <span className="component-tag">{item.category}</span>
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    const ActiveComponent = ActiveDemo.component;

    // Group components by category
    const categorizedComponents = components.reduce(
        (acc, comp) => {
            if (!acc[comp.category]) {
                acc[comp.category] = [];
            }
            acc[comp.category].push(comp);
            return acc;
        },
        {} as Record<string, typeof components>,
    );

    return (
        <div className="demo-app">
            <aside className="demo-sidebar">
                <div className="demo-header">
                    <h1>minreactui</h1>
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
                <ActiveComponent />
            </main>
        </div>
    );
}

export const DemoSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
    <section className="demo-section">
        <h3 className="demo-section-title">{title}</h3>
        {description && <p className="demo-section-description">{description}</p>}
        {children && <div className="demo-example">{children}</div>}
    </section>
);

export default DemoApp;
