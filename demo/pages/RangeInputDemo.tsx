import {RangeInput} from "../../src/components/RangeInput";
import { useState } from "react";

function RangeInputDemo() {
  const [value1, setValue1] = useState(50);
  const [value2, setValue2] = useState(25);
  const [value3, setValue3] = useState(0.5);
  const [value4, setValue4] = useState(75);

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <h2>RangeInput 范围输入</h2>
        <p>滑块式范围选择器，支持鼠标滚轮调节和点击输入</p>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">基础用法</h3>
        <p className="demo-section-description">默认范围 0-100，步长 1</p>
        <div className="demo-example">
          <div className="demo-row">
            <RangeInput value={value1} onInput={setValue1} />
          </div>
          <p style={{ marginTop: "0.5rem", color: "#666" }}>当前值: {value1}</p>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">自定义范围</h3>
        <p className="demo-section-description">通过 min 和 max 属性设置数值范围</p>
        <div className="demo-example">
          <div className="demo-row">
            <RangeInput value={value2} onInput={setValue2} min={0} max={50} />
          </div>
          <p style={{ marginTop: "0.5rem", color: "#666" }}>当前值: {value2} (范围: 0-50)</p>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">小数精度</h3>
        <p className="demo-section-description">支持小数值和自定义精度</p>
        <div className="demo-example">
          <div className="demo-row">
            <RangeInput value={value3} onInput={setValue3} min={0} max={1} step={0.1} precision={1} />
          </div>
          <p style={{ marginTop: "0.5rem", color: "#666" }}>当前值: {value3.toFixed(1)} (步长: 0.1)</p>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">带单位</h3>
        <p className="demo-section-description">通过 unit 属性添加单位显示</p>
        <div className="demo-example">
          <div style={{ marginBottom: "1rem" }}>
            <div className="demo-row" style={{ marginBottom: "1rem" }}>
              <RangeInput value={value4} onInput={setValue4} min={0} max={100} unit="%" />
            </div>
            <p style={{ color: "#666" }}>当前值: {value4}%</p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div className="demo-row" style={{ marginBottom: "1rem" }}>
              <RangeInput value={30} onInput={() => {}} min={0} max={100} unit="°C" />
            </div>
            <p style={{ color: "#666" }}>温度: 30°C</p>
          </div>

          <div>
            <div className="demo-row" style={{ marginBottom: "1rem" }}>
              <RangeInput value={128} onInput={() => {}} min={0} max={255} unit="px" />
            </div>
            <p style={{ color: "#666" }}>像素: 128px</p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">禁用状态</h3>
        <p className="demo-section-description">通过 disabled 属性禁用组件</p>
        <div className="demo-example">
          <div className="demo-row">
            <RangeInput value={50} onInput={() => {}} disabled />
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">交互方式</h3>
        <p className="demo-section-description">支持多种交互方式</p>
        <div className="demo-example">
          <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
            <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
              <li>拖动滑块调节数值</li>
              <li>点击数值可以手动输入</li>
              <li>鼠标悬停在滑块上，滚动滚轮可以精确调节</li>
              <li>滚轮调节会按照 step 步长增减</li>
            </ul>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <div className="demo-row" style={{ marginBottom: "1rem" }}>
              <RangeInput value={value1} onInput={setValue1} min={0} max={100} step={5} />
            </div>
            <p style={{ color: "#666" }}>试试不同的交互方式！当前值: {value1}</p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">实际应用示例</h3>
        <p className="demo-section-description">在实际场景中使用范围输入</p>
        <div className="demo-example">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>音量控制</label>
              <RangeInput value={70} onInput={() => {}} min={0} max={100} unit="%" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>透明度</label>
              <RangeInput value={0.8} onInput={() => {}} min={0} max={1} step={0.1} precision={1} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>价格区间</label>
              <RangeInput value={500} onInput={() => {}} min={0} max={1000} step={50} unit="元" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RangeInputDemo;
