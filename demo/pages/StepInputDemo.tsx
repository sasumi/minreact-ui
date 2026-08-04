import { StepInput } from "@/components/StepInput";
import { useState } from "react";

function StepInputDemo() {
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(10);
  const [value3, setValue3] = useState(5);
  const [value4, setValue4] = useState(0);

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <h2>StepInput 步进输入</h2>
        <p>带加减按钮的数字输入组件，适用于数值调整场景</p>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">基础用法</h3>
        <p className="demo-section-description">默认步长为 1，最小值为 0</p>
        <div className="demo-example">
          <div className="demo-row">
            <StepInput value={value1} onChange={setValue1} />
            <span>当前值: {value1}</span>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">设置最小值和最大值</h3>
        <p className="demo-section-description">通过 min 和 max 属性限制数值范围</p>
        <div className="demo-example">
          <div className="demo-row">
            <StepInput value={value2} onChange={setValue2} min={0} max={20} />
            <span>当前值: {value2} (范围: 0-20)</span>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">自定义步长</h3>
        <p className="demo-section-description">通过 step 属性设置每次增减的步长</p>
        <div className="demo-example">
          <div style={{ marginBottom: "1rem" }}>
            <div className="demo-row" style={{ marginBottom: "1rem" }}>
              <StepInput value={value3} onChange={setValue3} step={5} />
              <span>步长 5，当前值: {value3}</span>
            </div>
            <div className="demo-row">
              <StepInput value={value4} onChange={setValue4} step={10} min={0} max={100} />
              <span>步长 10，当前值: {value4} (范围: 0-100)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">实际应用示例</h3>
        <p className="demo-section-description">在实际场景中使用步进输入</p>
        <div className="demo-example">
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <label style={{ minWidth: "80px" }}>数量:</label>
              <StepInput value={1} onChange={() => {}} min={1} max={99} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <label style={{ minWidth: "80px" }}>优先级:</label>
              <StepInput value={3} onChange={() => {}} min={1} max={5} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <label style={{ minWidth: "80px" }}>折扣 (%):</label>
              <StepInput value={10} onChange={() => {}} min={0} max={100} step={5} />
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">边界测试</h3>
        <p className="demo-section-description">测试最小值和最大值边界情况</p>
        <div className="demo-example">
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="demo-row">
              <StepInput value={0} onChange={() => {}} min={0} max={10} />
              <span>最小值边界（按减号无效）</span>
            </div>
            <div className="demo-row">
              <StepInput value={10} onChange={() => {}} min={0} max={10} />
              <span>最大值边界（按加号无效）</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepInputDemo;
