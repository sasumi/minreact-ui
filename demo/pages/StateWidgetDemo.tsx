import { DataLoading, DataEmpty, RequestError } from "../../src/components/StateWidget";
import { DemoSection } from "../DemoApp";

function StateWidgetDemo() {
  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <h2>StateWidget 状态组件</h2>
        <p>用于显示数据加载、空状态、错误状态的组件集合</p>
      </div>

      <DemoSection title="DataLoading 加载状态" description="显示数据正在加载中">
        <DataLoading />
      </DemoSection>

      <DemoSection title="DataLoading 自定义文本" description="通过 text 属性自定义加载文本">
        <div style={{ marginBottom: "1rem" }}>
          <DataLoading text="正在获取数据..." />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <DataLoading text="处理中，请稍候..." />
        </div>
        <div>
          <DataLoading text="上传中..." />
        </div>
      </DemoSection>

      <DemoSection title="DataEmpty 空状态" description="显示暂无数据">
        <DataEmpty />
      </DemoSection>

      <DemoSection title="DataEmpty 自定义文本" description="通过 text 属性自定义空状态文本">
        <div style={{ marginBottom: "1rem" }}>
          <DataEmpty text="暂无内容" />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <DataEmpty text="没有找到相关数据" />
        </div>
        <div>
          <DataEmpty text="列表为空" />
        </div>
      </DemoSection>

      <DemoSection title="RequestError 错误状态" description="显示请求错误">
        <RequestError />
      </DemoSection>

      <DemoSection title="RequestError 自定义文本" description="通过 text 属性自定义错误文本">
        <div style={{ marginBottom: "1rem" }}>
          <RequestError text="网络连接失败" />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <RequestError text="服务器异常，请稍后重试" />
        </div>
        <div>
          <RequestError text="数据加载失败" />
        </div>
      </DemoSection>

      <DemoSection title="自定义样式" description="可以通过 className 和其他属性自定义样式">
        <div style={{ marginBottom: "1rem" }}>
          <DataLoading style={{ color: "#1976d2", fontSize: "1.2rem" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <DataEmpty style={{ color: "#999", fontSize: "0.9rem" }} />
        </div>
        <div>
          <RequestError style={{ color: "#f44336", fontSize: "1rem" }} />
        </div>
      </DemoSection>

      <DemoSection title="实际应用示例" description="在数据列表中使用状态组件">
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ border: "1px solid #e8e8e8", borderRadius: "4px", padding: "2rem", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 1rem" }}>加载中</h4>
            <DataLoading />
          </div>

          <div style={{ border: "1px solid #e8e8e8", borderRadius: "4px", padding: "2rem", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 1rem" }}>空状态</h4>
            <DataEmpty />
            <button style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>添加数据</button>
          </div>

          <div style={{ border: "1px solid #e8e8e8", borderRadius: "4px", padding: "2rem", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 1rem" }}>错误状态</h4>
            <RequestError />
            <button style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>重试</button>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="使用场景">
        <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
          <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
            <li>
              <strong>DataLoading</strong>: 列表加载、表单提交、文件上传等场景
            </li>
            <li>
              <strong>DataEmpty</strong>: 列表无数据、搜索无结果、筛选无匹配等场景
            </li>
            <li>
              <strong>RequestError</strong>: 接口请求失败、网络异常、服务器错误等场景
            </li>
            <li>这些组件常与 AsyncList 组件配合使用</li>
          </ul>
        </div>
      </DemoSection>
    </div>
  );
}

export default StateWidgetDemo;
