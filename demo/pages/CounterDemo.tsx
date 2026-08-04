import Counter from "@/components/Counter";
import { useRef } from "react";

function CounterDemo() {
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLTextAreaElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <h2>Counter 字符计数器</h2>
        <p>显示输入框字符数量的计数器组件</p>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">基础用法</h3>
        <p className="demo-section-description">实时显示输入框的字符数量</p>
        <div className="demo-example">
          <div style={{ marginBottom: "0.5rem" }}>
            <input ref={inputRef1} type="text" placeholder="请输入文字..." style={{ width: "100%", padding: "0.5rem" }} />
          </div>
          <Counter refInput={inputRef1} />
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">带最大长度限制</h3>
        <p className="demo-section-description">设置 max 属性后，超出最大长度时会显示警告样式</p>
        <div className="demo-example">
          <div style={{ marginBottom: "0.5rem" }}>
            <input
              ref={inputRef3}
              type="text"
              placeholder="最多输入20个字符..."
              maxLength={20}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <Counter refInput={inputRef3} max={20} />
          <p style={{ marginTop: "0.5rem", color: "#666", fontSize: "0.9rem" }}>尝试输入超过20个字符，计数器会变红色提示</p>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">文本域计数</h3>
        <p className="demo-section-description">支持 textarea 元素的字符计数</p>
        <div className="demo-example">
          <div style={{ marginBottom: "0.5rem" }}>
            <textarea
              ref={inputRef2}
              placeholder="请输入多行文字..."
              style={{ width: "100%", padding: "0.5rem", minHeight: "100px", resize: "vertical" }}
            />
          </div>
          <Counter refInput={inputRef2} max={200} />
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">实际应用示例</h3>
        <p className="demo-section-description">在表单中使用字符计数器</p>
        <div className="demo-example">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("表单提交！");
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>标题</label>
              <input
                ref={inputRef1}
                type="text"
                placeholder="请输入标题"
                style={{ width: "100%", padding: "0.5rem", marginBottom: "0.25rem" }}
              />
              <div style={{ textAlign: "right" }}>
                <Counter refInput={inputRef1} max={50} />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>描述</label>
              <textarea
                ref={inputRef2}
                placeholder="请输入描述"
                style={{ width: "100%", padding: "0.5rem", minHeight: "100px", resize: "vertical", marginBottom: "0.25rem" }}
              />
              <div style={{ textAlign: "right" }}>
                <Counter refInput={inputRef2} max={500} />
              </div>
            </div>

            <button type="submit" style={{ padding: "0.5rem 1.5rem" }}>
              提交
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CounterDemo;
