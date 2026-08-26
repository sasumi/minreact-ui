import { PrimaryButton, NormalButton, SpanButton, SubmitButton } from "../../src/components/Button";
import { useState } from "react";

function ButtonDemo() {
    const [checked, setChecked] = useState(false);

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>Button 按钮</h2>
                <p>多种样式的按钮组件，支持不同的样式和交互状态</p>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">PrimaryButton 主按钮</h3>
                <p className="demo-section-description">用于主要操作的按钮，具有明显的视觉强调</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <PrimaryButton onClick={() => alert("Primary Button Clicked!")}>主要按钮</PrimaryButton>
                        <PrimaryButton disabled>禁用状态</PrimaryButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">NormalButton 普通按钮</h3>
                <p className="demo-section-description">用于次要操作的描边按钮</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <NormalButton onClick={() => alert("Normal Button Clicked!")}>普通按钮</NormalButton>
                        <NormalButton disabled>禁用状态</NormalButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">SpanButton 文本按钮</h3>
                <p className="demo-section-description">以 span 标签渲染的按钮，适用于文本链接场景</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <SpanButton onClick={() => alert("Span Button Clicked!")}>文本按钮</SpanButton>
                        <SpanButton disabled>禁用状态</SpanButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">SubmitButton 提交按钮</h3>
                <p className="demo-section-description">type="submit" 的按钮，用于表单提交</p>
                <div className="demo-example">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            alert("Form Submitted!");
                        }}
                    >
                        <div className="demo-row">
                            <SubmitButton>提交表单</SubmitButton>
                            <SubmitButton disabled>禁用状态</SubmitButton>
                        </div>
                    </form>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">防抖功能</h3>
                <p className="demo-section-description">按钮默认开启防抖（200ms），防止重复点击</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <PrimaryButton
                            onClick={() => {
                                console.log("Clicked at:", new Date().toLocaleTimeString());
                                alert("防抖按钮点击");
                            }}
                        >
                            防抖按钮（快速点击试试）
                        </PrimaryButton>
                        <PrimaryButton
                            debounce={false}
                            onClick={() => {
                                console.log("Clicked at:", new Date().toLocaleTimeString());
                                alert("无防抖按钮点击");
                            }}
                        >
                            无防抖按钮
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">自定义样式</h3>
                <p className="demo-section-description">可以通过 className 和 style 自定义按钮样式</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <PrimaryButton style={{ background: "#e91e63", borderColor: "#e91e63" }}>粉色按钮</PrimaryButton>
                        <NormalButton style={{ color: "#4caf50", borderColor: "#4caf50" }}>绿色按钮</NormalButton>
                        <SpanButton style={{ color: "#ff9800", fontSize: "1.2rem" }}>橙色文本</SpanButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ButtonDemo;
