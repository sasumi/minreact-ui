import { useState } from "react";
import { ColorPicker } from "../../src/components/ColorPicker";
import { DemoSection } from "../DemoApp";

function ColorPickerDemo() {
    const [color, setColor] = useState("#0f9ed5");
    const [background, setBackground] = useState("");
    const [solid, setSolid] = useState("#4ea72e");

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>ColorPicker 颜色选择器</h2>
                <p>取色器 + HEX 输入 + 透明度滑杆 + 内置调色板，支持空值</p>
            </div>

            <DemoSection title="基础用法" description="点击色块打开面板，选择颜色或输入 HEX">
                <div className="demo-row">
                    <ColorPicker value={color} onChange={setColor} allowAlpha={true} />
                    <code>{color}</code>
                </div>
            </DemoSection>

            <DemoSection title="支持空值" description="空字符串表示未设置，面板内可用删除按钮清空（emptyLabel 自定义按钮提示）">
                <div className="demo-row">
                    <ColorPicker value={background} onChange={setBackground} fallback="#f3f3f3" emptyLabel="透明" />
                    <code>{background || "（未设置）"}</code>
                </div>
            </DemoSection>

            <DemoSection title="关闭透明度" description="allowAlpha={false} 时只输出 6 位 HEX，alpha 强制为 1">
                <div className="demo-row">
                    <ColorPicker value={solid} onChange={setSolid} allowAlpha={false} />
                    <code>{solid}</code>
                </div>
            </DemoSection>

            <DemoSection title="预设透明度值" description="value 支持 #rrggbbaa / rgba() / transparent，输出统一为 HEX（带透明度时 8 位）">
                <div className="demo-row">
                    <ColorPicker value="rgba(15, 158, 213, 0.45)" onChange={(next) => console.log(next)} />
                    <ColorPicker value="transparent" onChange={(next) => console.log(next)} />
                </div>
            </DemoSection>

            <DemoSection title="禁用状态" description="disabled 时无法打开面板">
                <div className="demo-row">
                    <ColorPicker value="#e97132" onChange={() => {}} disabled />
                </div>
            </DemoSection>
        </div>
    );
}

export default ColorPickerDemo;
