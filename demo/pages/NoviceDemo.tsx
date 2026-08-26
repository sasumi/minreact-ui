import Novice from "../../src/components/Novice";
import { PrimaryButton } from "../../src/components/Button";
import { useState, useRef } from "react";

function NoviceDemo() {
    const [showGuide, setShowGuide] = useState(false);
    const step1Ref = useRef<HTMLDivElement>(null);
    const step2Ref = useRef<HTMLDivElement>(null);
    const step3Ref = useRef<HTMLDivElement>(null);
    const step4Ref = useRef<HTMLDivElement>(null);

    const stepInfos = [
        { target: ".func-area-a", content: <><h3>欢迎使用！</h3><p>这是一个新手引导组件，可以帮助用户快速了解产品功能。</p></> },
        { target: ".func-area-b", content: <><h3>步骤一</h3><p>这是第一个功能点，点击这里可以执行某个操作。</p></> },
        { target: ".func-area-c", content: <><h3>步骤二</h3><p>这是第二个功能点，用于配置相关设置。</p></> },
        { target: ".func-area-d", content: <><h3>完成！</h3><p>恭喜你完成了新手引导，现在可以开始使用了。</p></> },
    ];

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>Novice 新手引导</h2>
                <p>分步引导用户的新手教程组件，带高亮和遮罩效果</p>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">基础演示</h3>
                <p className="demo-section-description">点击按钮开始新手引导流程</p>
                <div className="demo-example">
                    <div style={{ position: "relative", minHeight: "400px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "2rem" }}>
                            <div className="func-area-a" style={{ padding: "1rem", background: "#e3f2fd", borderRadius: "4px", border: "2px solid #1976d2" }}>
                                <h4 style={{ margin: "0 0 0.5rem" }}>功能区域 A</h4>
                                <p style={{ margin: 0 }}>这是一个重要的功能区域</p>
                            </div>

                            <div
                                ref={step2Ref}
                                className="func-area-b"
                                style={{ padding: "1rem", background: "#f3e5f5", borderRadius: "4px", border: "2px solid #9c27b0" }}
                            >
                                <h4 style={{ margin: "0 0 0.5rem" }}>功能区域 B</h4>
                                <p style={{ margin: 0 }}>这里可以进行其他操作</p>
                            </div>

                            <div
                                ref={step3Ref}
                                className="func-area-c"
                                style={{ padding: "1rem", background: "#e8f5e9", borderRadius: "4px", border: "2px solid #4caf50" }}
                            >
                                <h4 style={{ margin: "0 0 0.5rem" }}>功能区域 C</h4>
                                <p style={{ margin: 0 }}>配置相关设置</p>
                            </div>

                            <div
                                ref={step4Ref}
                                className="func-area-d"
                                style={{ padding: "1rem", background: "#fff3e0", borderRadius: "4px", border: "2px solid #ff9800" }}
                            >
                                <h4 style={{ margin: "0 0 0.5rem" }}>功能区域 D</h4>
                                <p style={{ margin: 0 }}>查看更多信息</p>
                            </div>
                        </div>

                        <div style={{ textAlign: "center", marginTop: "2rem" }}>
                            <PrimaryButton onClick={() => setShowGuide(true)}>开始新手引导</PrimaryButton>
                        </div>

                        {showGuide && <Novice stepInfos={stepInfos} onClose={() => setShowGuide(false)} />}
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">组件特性</h3>
                <div className="demo-example">
                    <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
                        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                            <li>自动添加遮罩层，突出显示当前引导的元素</li>
                            <li>支持自定义 HTML 内容</li>
                            <li>提供"上一步"、"下一步"、"关闭"按钮</li>
                            <li>基于 Popover 组件实现，自动定位</li>
                            <li>支持通过 CSS 选择器或 DOM 元素指定目标</li>
                            <li>高亮区域会自动跟随目标元素位置</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">使用说明</h3>
                <div className="demo-example">
                    <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
                        <h4 style={{ margin: "0 0 0.5rem" }}>Props：</h4>
                        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
                            <li>
                                <code>stepInfos</code>: 引导步骤数组，每项为 [目标元素, HTML内容]
                            </li>
                            <li>
                                <code>onClose</code>: 关闭回调函数
                            </li>
                        </ul>

                        <h4 style={{ margin: "1rem 0 0.5rem" }}>步骤配置：</h4>
                        <pre style={{ background: "#fff", padding: "0.75rem", borderRadius: "4px", overflow: "auto", fontSize: "0.9rem" }}>
                            {`const stepInfos: [HTMLElement | string | null, string][] = [
  [element, "<h3>标题</h3><p>描述</p>"],
  [".selector", "<p>也可以使用 CSS 选择器</p>"],
];`}
                        </pre>

                        <h4 style={{ margin: "1rem 0 0.5rem" }}>注意事项：</h4>
                        <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.5rem" }}>
                            <li>目标元素应该在 DOM 中可见</li>
                            <li>HTML 内容会通过 dangerouslySetInnerHTML 渲染</li>
                            <li>建议在用户首次使用或功能更新时显示引导</li>
                            <li>引导内容应该简洁明了，避免过长</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">适用场景</h3>
                <div className="demo-example">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <div style={{ padding: "1rem", border: "1px solid #e8e8e8", borderRadius: "4px" }}>
                            <h4 style={{ margin: "0 0 0.5rem" }}>新用户引导</h4>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>帮助新用户了解产品主要功能</p>
                        </div>
                        <div style={{ padding: "1rem", border: "1px solid #e8e8e8", borderRadius: "4px" }}>
                            <h4 style={{ margin: "0 0 0.5rem" }}>功能介绍</h4>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>介绍新功能或复杂功能的使用方法</p>
                        </div>
                        <div style={{ padding: "1rem", border: "1px solid #e8e8e8", borderRadius: "4px" }}>
                            <h4 style={{ margin: "0 0 0.5rem" }}>操作流程</h4>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>引导用户完成多步骤操作</p>
                        </div>
                        <div style={{ padding: "1rem", border: "1px solid #e8e8e8", borderRadius: "4px" }}>
                            <h4 style={{ margin: "0 0 0.5rem" }}>改版提示</h4>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>产品改版后告知用户变化</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NoviceDemo;
