import { Pagination } from "../../src/components/Pagination";
import { useState } from "react";

function PaginationDemo() {
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(1);
  const [page3, setPage3] = useState(1);

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <h2>Pagination 分页</h2>
        <p>数据分页组件，支持页码跳转和分页信息显示</p>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">基础用法</h3>
        <p className="demo-section-description">最基本的分页组件</p>
        <div className="demo-example">
          <Pagination page={page1} pageSize={10} total={100} onChange={setPage1} />
          <p style={{ marginTop: "1rem", color: "#666" }}>当前页: {page1}</p>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">不同数据量</h3>
        <p className="demo-section-description">展示不同数据总量下的分页效果</p>
        <div className="demo-example">
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>小数据量（50 条）</p>
            <Pagination page={1} pageSize={10} total={50} onChange={() => {}} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>中等数据量（500 条）</p>
            <Pagination page={1} pageSize={10} total={500} onChange={() => {}} />
          </div>

          <div>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>大数据量（10000 条）</p>
            <Pagination page={1} pageSize={10} total={10000} onChange={() => {}} />
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">不同每页条数</h3>
        <p className="demo-section-description">通过 pageSize 属性设置每页显示的条数</p>
        <div className="demo-example">
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>每页 10 条</p>
            <Pagination page={page2} pageSize={10} total={100} onChange={setPage2} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>每页 20 条</p>
            <Pagination page={1} pageSize={20} total={100} onChange={() => {}} />
          </div>

          <div>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>每页 50 条</p>
            <Pagination page={1} pageSize={50} total={100} onChange={() => {}} />
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">禁用状态</h3>
        <p className="demo-section-description">通过 disabled 属性禁用分页操作</p>
        <div className="demo-example">
          <Pagination page={5} pageSize={10} total={100} disabled onChange={() => {}} />
          <p style={{ marginTop: "1rem", color: "#666" }}>禁用状态下无法切换页码</p>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">页码跳转</h3>
        <p className="demo-section-description">点击页码信息可以快速跳转到指定页</p>
        <div className="demo-example">
          <Pagination page={page3} pageSize={10} total={1000} onChange={setPage3} />
          <div style={{ marginTop: "1rem", background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
            <p style={{ margin: 0, color: "#666" }}>💡 提示：点击中间的页码信息（例如 "第 {page3} / 100 页"）可以输入页码快速跳转</p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">边界情况</h3>
        <p className="demo-section-description">测试首页、末页和单页的情况</p>
        <div className="demo-example">
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>首页（上一页禁用）</p>
            <Pagination page={1} pageSize={10} total={100} onChange={() => {}} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>末页（下一页禁用）</p>
            <Pagination page={10} pageSize={10} total={100} onChange={() => {}} />
          </div>

          <div>
            <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>只有一页（两个按钮都禁用）</p>
            <Pagination page={1} pageSize={10} total={5} onChange={() => {}} />
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">实际应用示例</h3>
        <p className="demo-section-description">在列表数据中使用分页</p>
        <div className="demo-example">
          <div style={{ border: "1px solid #e8e8e8", borderRadius: "4px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #e8e8e8" }}>ID</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #e8e8e8" }}>名称</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #e8e8e8" }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }, (_, i) => (
                  <tr key={i}>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #e8e8e8" }}>{(page1 - 1) * 10 + i + 1}</td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #e8e8e8" }}>项目 {(page1 - 1) * 10 + i + 1}</td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #e8e8e8" }}>
                      <span style={{ color: "#4caf50" }}>●</span> 正常
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "1rem", background: "#fafafa", borderTop: "1px solid #e8e8e8" }}>
              <Pagination page={page1} pageSize={10} total={100} onChange={setPage1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaginationDemo;
