import { useRef, useState } from "react";
import { Tabs } from "../../src/components/Tabs";
import type { TabItem, TabsRef } from "../../src/components/Tabs";
import { DemoSection } from "../DemoApp";
import "./TabsDemo.scss";

/** 带内部计数的面板，用于演示 destroyOnHide 对内容挂载/卸载的影响 */
function CounterPanel({ label }: { label: string }) {
    const [count, setCount] = useState(0);
    return (
        <div>
            <p>「{label}」面板内部计数：{count}</p>
            <button type="button" onClick={() => setCount((c) => c + 1)}>
                计数 +1
            </button>
            <p style={{ color: "#666", fontSize: "0.85rem" }}>切换标签后再切回来，观察计数是否被保留。</p>
        </div>
    );
}

/** destroyOnHide = false / true 两种内容挂载策略对比 */
function MountStrategyDemo() {
    const keepItems: TabItem[] = [
        { trigger: "草稿箱", content: <CounterPanel label="草稿箱" /> },
        { trigger: "已发送", content: <CounterPanel label="已发送" /> },
    ];
    const destroyItems: TabItem[] = [
        { trigger: "草稿箱", content: <CounterPanel label="草稿箱" /> },
        { trigger: "已发送", content: <CounterPanel label="已发送" /> },
    ];
    return (
        <div className="demo-row" style={{ alignItems: "flex-start" }}>
            <div className="demo-col">
                <p style={{ fontWeight: 500, margin: "0 0 0.75rem" }}>destroyOnHide = false（默认 · 内容常驻挂载）</p>
                <Tabs className="tabs-demo" items={keepItems} />
            </div>
            <div className="demo-col">
                <p style={{ fontWeight: 500, margin: "0 0 0.75rem" }}>destroyOnHide = true（隐藏即卸载）</p>
                <Tabs className="tabs-demo" destroyOnHide items={destroyItems} />
            </div>
        </div>
    );
}

/** 通过 onActive 监听标签被激活（适合做按需加载内容、统计埋点等） */
function OnActiveDemo() {
    const [history, setHistory] = useState<string[]>([]);
    const record = (name: string) => setHistory((h) => [name, ...h.filter((n) => n !== name)].slice(0, 5));
    const items: TabItem[] = [
        { trigger: "隐私策略", content: <p>这是「隐私策略」面板内容，每次点击激活该标签都会触发 onActive 回调。</p>, onActive: () => record("隐私策略") },
        { trigger: "服务条款", content: <p>这是「服务条款」面板内容。</p>, onActive: () => record("服务条款") },
        { trigger: "Cookie 说明", content: <p>这是「Cookie 说明」面板内容。</p>, onActive: () => record("Cookie 说明") },
    ];
    return (
        <div>
            <Tabs className="tabs-demo" items={items} />
            <div className="tabs-demo-log">
                <strong>最近激活（onActive）：</strong>
                {history.length === 0 ? " 尚未手动切换过标签（首次渲染不会触发）" : ` ${history.join(" → ")}`}
            </div>
        </div>
    );
}

/** 通过 ref 暴露的 active(index) 命令式切换标签 */
function RefControlDemo() {
    const tabsRef = useRef<TabsRef>(null);
    const items: TabItem[] = [
        { trigger: "基础设置", content: <p>「基础设置」面板内容。</p> },
        { trigger: "高级设置", content: <p>「高级设置」面板内容。</p> },
        { trigger: "关于", content: <p>「关于」面板内容。</p> },
    ];
    return (
        <div>
            <Tabs ref={tabsRef} className="tabs-demo" items={items} />
            <div className="demo-row" style={{ margin: "1rem 0 0" }}>
                <button type="button" onClick={() => tabsRef.current?.active(0)}>
                    切到「基础设置」
                </button>
                <button type="button" onClick={() => tabsRef.current?.active(1)}>
                    切到「高级设置」
                </button>
                <button type="button" onClick={() => tabsRef.current?.active(2)}>
                    切到「关于」
                </button>
            </div>
        </div>
    );
}

/** 受控模式：index + onIndexChange */
function ControlledDemo() {
    const [index, setIndex] = useState(1);
    const items: TabItem[] = [
        { trigger: "第一步", content: <p>第一步：填写基本信息。</p> },
        { trigger: "第二步", content: <p>第二步：确认联系方式。</p> },
        { trigger: "第三步", content: <p>第三步：完成提交。</p> },
    ];
    return (
        <div>
            <Tabs className="tabs-demo" index={index} onIndexChange={setIndex} items={items} />
            <div className="demo-row" style={{ margin: "1rem 0 0" }}>
                <span style={{ color: "#666" }}>当前激活索引：{index}（第 {index + 1} 个标签）</span>
                <button type="button" onClick={() => setIndex(0)}>
                    第一步
                </button>
                <button type="button" onClick={() => setIndex(1)}>
                    第二步
                </button>
                <button type="button" onClick={() => setIndex(2)}>
                    第三步
                </button>
            </div>
        </div>
    );
}

function TabsDemo() {
    const basicItems: TabItem[] = [
        {
            trigger: "概览",
            content: (
                <div>
                    <h4>概览</h4>
                    <p>minreactui 的 Tabs 组件基于 @radix-ui/react-tabs 封装，通过 items 数据驱动渲染触发标签与内容面板。</p>
                    <p>默认非受控使用，内部维护激活索引；也可以切换到受控模式。</p>
                </div>
            ),
        },
        {
            trigger: "属性说明",
            content: (
                <div>
                    <h4>属性说明</h4>
                    <p>TabItem：trigger（触发标签）、content（面板内容）、disabled（禁用）、onActive（激活回调）。</p>
                    <p>TabsProps：defaultIndex、index、onIndexChange、destroyOnHide，其余属性透传给 Radix Root。</p>
                </div>
            ),
        },
        {
            trigger: "可访问性",
            content: (
                <div>
                    <h4>可访问性</h4>
                    <p>方向键（←/→）可在标签间移动焦点，Enter / Space 激活当前聚焦项，使用标准的 role="tablist / tab / tabpanel" 语义。</p>
                </div>
            ),
        },
    ];

    const defaultItems: TabItem[] = [
        { trigger: "苹果", content: <p>「苹果」面板内容。</p> },
        { trigger: "香蕉", content: <p>「香蕉」面板内容，作为 defaultIndex 的默认选中项展示。</p> },
        { trigger: "橙子", content: <p>「橙子」面板内容。</p> },
    ];

    const disabledItems: TabItem[] = [
        { trigger: "可编辑", content: <p>「可编辑」面板内容，正常可切换。</p> },
        { trigger: "只读", content: <p>「只读」面板内容，正常可切换。</p> },
        {
            trigger: "锁定（禁用）",
            content: <p>「锁定」面板内容，禁用状态下无法被激活。</p>,
            disabled: true,
        },
    ];

    const verticalItems: TabItem[] = [
        {
            trigger: "个人资料",
            content: (
                <div>
                    <h4>个人资料</h4>
                    <p>用于展示个人资料相关的表单与信息，内容高度较矮时也能保持标签列自适应对齐。</p>
                </div>
            ),
        },
        {
            trigger: "账号与安全",
            content: (
                <div>
                    <h4>账号与安全</h4>
                    <p>包含密码、登录设备、安全验证等设置项，可在此演示 ↑/↓ 方向键导航。</p>
                </div>
            ),
        },
        {
            trigger: "消息通知",
            content: (
                <div>
                    <h4>消息通知</h4>
                    <p>控制站内信、邮件、短信等通知渠道，是垂直布局下的第三个面板。</p>
                </div>
            ),
        },
    ];

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>Tabs 标签页</h2>
                <p>基于 @radix-ui/react-tabs 的标签页组件，支持受控/非受控、禁用、内容挂载策略、命令式切换与垂直布局</p>
            </div>

            <DemoSection title="基础用法" description="默认非受控模式，点击标签或使用方向键（←/→）进行切换">
                <Tabs className="tabs-demo" items={basicItems} />
            </DemoSection>

            <DemoSection title="默认选中项" description="通过 defaultIndex 指定初始激活的标签（下面默认激活第 2 个）">
                <Tabs className="tabs-demo" defaultIndex={1} items={defaultItems} />
            </DemoSection>

            <DemoSection title="受控模式" description="通过 index 与 onIndexChange 完全控制激活项，适合需要与外部状态联动的场景">
                <ControlledDemo />
            </DemoSection>

            <DemoSection title="禁用标签" description="disabled 的标签不可点击，也不能通过键盘导航切换到它">
                <Tabs className="tabs-demo" items={disabledItems} />
            </DemoSection>

            <DemoSection title="内容挂载策略 destroyOnHide" description="默认（false）内容常驻挂载、内部状态得以保留；设为 true 后隐藏即卸载、状态重置">
                <MountStrategyDemo />
            </DemoSection>

            <DemoSection title="激活回调 onActive" description="标签被激活时触发该回调，可用于按需加载内容或统计埋点">
                <OnActiveDemo />
            </DemoSection>

            <DemoSection title="命令式切换（ref）" description="通过 ref 暴露的 active(index) 方法编程式切换标签">
                <RefControlDemo />
            </DemoSection>

            <DemoSection title="垂直布局" description='设置 orientation="vertical" 切换为纵向排列，标签在左、内容在右，使用 ↑/↓ 方向键导航'>
                <Tabs className="tabs-demo tabs-demo--vertical" orientation="vertical" items={verticalItems} />
            </DemoSection>
        </div>
    );
}

export default TabsDemo;
