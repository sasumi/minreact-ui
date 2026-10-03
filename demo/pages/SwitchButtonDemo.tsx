import { NormalButton, PrimaryButton, SwitchButton } from "../../src/components/Button";
import { useState } from "react";
import { DemoSection } from "../DemoApp";
import "./SwitchButtonDemo.scss";

function SwitchButtonDemo() {
    const [basic, setBasic] = useState(false);
    const [notify, setNotify] = useState(true);
    const [autoSave, setAutoSave] = useState(true);
    const [theme, setTheme] = useState("light");
    const [size, setSize] = useState(true);
    const [custom, setCustom] = useState(true);

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>SwitchButton 开关按钮</h2>
                <p>以原生 checkbox / radio 为内核的开关，外观由 CSS 绘制，支持受控使用与 label 触发</p>
            </div>

            <DemoSection title="基础用法" description="受控组件：checked 决定开关状态，onChange 回传最新的布尔值">
                <div className="demo-row">
                    <SwitchButton checked={basic} onChange={setBasic} />
                    <span>
                        当前状态：<strong>{basic ? "开启" : "关闭"}</strong>
                    </span>
                </div>
                <div className="demo-row">
                    <PrimaryButton onClick={() => setBasic(true)}>开启</PrimaryButton>
                    <NormalButton onClick={() => setBasic(false)}>关闭</NormalButton>
                </div>
            </DemoSection>

            <DemoSection title="label 触发" description="默认根元素是 span，放进 label 后点击文字也能切换；asLabel 让根元素本身成为 label">
                <label className="switch-demo-field">
                    <SwitchButton checked={notify} onChange={setNotify} />
                    接收通知（点击文字也能切换）
                </label>
                <div className="switch-demo-field">
                    <SwitchButton asLabel checked={autoSave} onChange={setAutoSave} />
                    <span>自动保存（asLabel 根元素为 label，无需再包一层）</span>
                </div>
            </DemoSection>

            <DemoSection title="自定义尺寸" description="宽高基于 em，调整 fontSize 即可整体缩放">
                <div className="demo-row">
                    <SwitchButton style={{ fontSize: "14px" }} checked={size} onChange={setSize} />
                    <SwitchButton style={{ fontSize: "18px" }} checked={size} onChange={setSize} />
                    <SwitchButton style={{ fontSize: "26px" }} checked={size} onChange={setSize} />
                </div>
            </DemoSection>

            <DemoSection title="自定义样式" description="className 会追加到根元素上，可以用自己的类名覆盖开关配色与形状">
                <div className="demo-row">
                    <SwitchButton className="switch-demo-danger" checked={custom} onChange={setCustom} />
                    <SwitchButton className="switch-demo-square" checked={custom} onChange={setCustom} />
                </div>
                <p className="switch-demo-tip">左：danger 配色 | 右：方形开关</p>
            </DemoSection>

            <DemoSection title="radio 模式" description={'type="radio" 时按 name 分组，可实现互斥的单选开关'}>
                <div className="demo-row">
                    <label className="switch-demo-field">
                        <SwitchButton
                            type="radio"
                            name="switch-demo-theme"
                            value="light"
                            checked={theme === "light"}
                            onChange={() => setTheme("light")}
                        />
                        浅色主题
                    </label>
                    <label className="switch-demo-field">
                        <SwitchButton
                            type="radio"
                            name="switch-demo-theme"
                            value="dark"
                            checked={theme === "dark"}
                            onChange={() => setTheme("dark")}
                        />
                        深色主题
                    </label>
                </div>
                <p className="switch-demo-tip">当前主题：{theme === "light" ? "浅色" : "深色"}</p>
            </DemoSection>

            <DemoSection title="设置项组合" description="常见的设置面板布局">
                <div className="switch-demo-list">
                    <label className="switch-demo-item">
                        <span>接收邮件通知</span>
                        <SwitchButton checked={notify} onChange={setNotify} />
                    </label>
                    <label className="switch-demo-item">
                        <span>自动保存草稿</span>
                        <SwitchButton checked={autoSave} onChange={setAutoSave} />
                    </label>
                </div>
            </DemoSection>
        </div>
    );
}

export default SwitchButtonDemo;
