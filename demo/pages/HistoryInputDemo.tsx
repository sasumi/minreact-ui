import { DataListInput, HistoryInput } from "../../src/components/TextInput";
import type { HistoryInputHandle } from "../../src/components/TextInput";
import { useRef, useState } from "react";

function HistoryInputDemo() {
    const [value, setValue] = useState("");

    const hi1Ref = useRef<HistoryInputHandle>(null);

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>HistoryInput 历史输入</h2>
                <p>支持本地历史记录回填的输入框，适合搜索框和高频短文本场景</p>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">普通List用法</h3>
                <div className="demo-example">
                    <DataListInput
                        options={[
                            "React",
                            "Vite",
                            "TypeScript",
                            "JavaScript",
                            "Node.js",
                            "Webpack",
                            "Babel",
                            "ESLint",
                            "Prettier",
                            "Jest",
                            "Vitest",
                            "Cypress",
                            "Playwright",
                            "Tailwind CSS",
                            "Bootstrap",
                            "Material UI",
                            "Ant Design",
                        ]}
                        placeholder="试着输入几个关键词，比如 React、Vite、TypeScript"
                    />
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">基础用法</h3>
                <p className="demo-section-description">输入内容后失焦即可写入历史，选中历史项会自动置顶</p>
                <div className="demo-example">
                    <HistoryInput
                        ref={hi1Ref}
                        placeholder="试着输入几个关键词，比如 React、Vite、TypeScript"
                        storeKey="history-input-demo"
                        onKeyDown={(e) => {
                            console.log("onKeyDown", e.key, e.currentTarget.value);
                            if (e.key === "Enter") {
                                hi1Ref.current?.commit(e.currentTarget.value);
                            }
                        }}
                    />
                    <div style={{ color: "#64748b", lineHeight: 1.7 }}>
                        <div>交互规则：</div>
                        <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.25rem" }}>
                            <li>回车保存到历史</li>
                            <li>选择历史项会去重并置顶</li>
                            <li>历史条数最多保留 8 条</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HistoryInputDemo;
