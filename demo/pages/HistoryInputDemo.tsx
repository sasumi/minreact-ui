import { DataListInput, HistoryInput } from "../../src/components/DatalistInput";
import { useState } from "react";

function HistoryInputDemo() {
    const [value, setValue] = useState("");

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>HistoryInput 历史输入</h2>
                <p>支持本地历史记录回填的输入框，适合搜索框和高频短文本场景</p>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">List用法</h3>
                <div className="demo-example">
                    <DataListInput options={["React", "Vite", "TypeScript"]} placeholder="试着输入几个关键词，比如 React、Vite、TypeScript" />
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">基础用法</h3>
                <p className="demo-section-description">输入内容后失焦即可写入历史，选中历史项会自动置顶</p>
                <div className="demo-example">
                    <HistoryInput placeholder="试着输入几个关键词，比如 React、Vite、TypeScript" />
                    <div style={{ color: "#64748b", lineHeight: 1.7 }}>
                        <div>交互规则：</div>
                        <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.25rem" }}>
                            <li>输入后失焦会自动保存到历史</li>
                            <li>选择历史项会去重并置顶</li>
                            <li>历史条数最多保留 8 条</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">受控用法</h3>
                <p className="demo-section-description">和外部状态联动时也能继续复用同一份历史记录</p>
                <div className="demo-example">
                    <div style={{ display: "grid", gap: "0.75rem", maxWidth: "32rem" }}>
                        <HistoryInput value={value} placeholder="输入并回车或失焦，历史会保持同步" />
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "0.9rem 1rem", color: "#334155" }}>
                            当前值：{value || "空"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HistoryInputDemo;
