import { Spinner } from "../../src/components/Spinner";

function SpinnerDemo() {
  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <h2>Spinner 加载器</h2>
        <p>旋转加载动画组件，用于表示内容正在加载</p>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">基础用法</h3>
        <p className="demo-section-description">通过 run 属性控制旋转动画</p>
        <div className="demo-example">
          <div className="demo-row">
            <div style={{ width: "48px", height: "48px" }}>
              <Spinner run={true} />
            </div>
            <div style={{ width: "48px", height: "48px" }}>
              <Spinner run={false} />
            </div>
          </div>
          <p style={{ marginTop: "1rem", color: "#666" }}>左：运行中 | 右：静止</p>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">不同尺寸</h3>
        <p className="demo-section-description">通过设置容器尺寸来调整 Spinner 大小</p>
        <div className="demo-example">
          <div className="demo-row" style={{ alignItems: "center" }}>
            <div style={{ width: "24px", height: "24px" }}>
              <Spinner run={true} />
            </div>
            <div style={{ width: "32px", height: "32px" }}>
              <Spinner run={true} />
            </div>
            <div style={{ width: "48px", height: "48px" }}>
              <Spinner run={true} />
            </div>
            <div style={{ width: "64px", height: "64px" }}>
              <Spinner run={true} />
            </div>
          </div>
          <p style={{ marginTop: "1rem", color: "#666" }}>24px / 32px / 48px / 64px</p>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">不同颜色</h3>
        <p className="demo-section-description">通过 CSS 的 color 属性改变颜色</p>
        <div className="demo-example">
          <div className="demo-row" style={{ alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", color: "#1976d2" }}>
              <Spinner run={true} />
            </div>
            <div style={{ width: "48px", height: "48px", color: "#4caf50" }}>
              <Spinner run={true} />
            </div>
            <div style={{ width: "48px", height: "48px", color: "#f44336" }}>
              <Spinner run={true} />
            </div>
            <div style={{ width: "48px", height: "48px", color: "#ff9800" }}>
              <Spinner run={true} />
            </div>
          </div>
          <p style={{ marginTop: "1rem", color: "#666" }}>蓝色 / 绿色 / 红色 / 橙色</p>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">加载场景示例</h3>
        <p className="demo-section-description">在实际场景中使用 Spinner</p>
        <div className="demo-example">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              border: "1px dashed #ccc",
              borderRadius: "4px",
            }}
          >
            <div style={{ width: "48px", height: "48px", marginBottom: "1rem" }}>
              <Spinner run={true} />
            </div>
            <p style={{ color: "#666", margin: 0 }}>加载中...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpinnerDemo;
