import AsyncPagination from "@/components/AsyncList";
import { useState } from "react";

// 模拟异步数据获取
const mockFetcher = (page: number, pageSize: number): Promise<[any[], number]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const total = 95; // 总数据量
      const data = Array.from({ length: Math.min(pageSize, total - (page - 1) * pageSize) }, (_, i) => ({
        id: (page - 1) * pageSize + i + 1,
        name: `项目 ${(page - 1) * pageSize + i + 1}`,
        status: Math.random() > 0.5 ? "正常" : "异常",
      }));
      resolve([data, total]);
    }, 500); // 模拟网络延迟
  });
};

function AsyncListDemo() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="demo-page">
      <div className="demo-page-header">
        <h2>AsyncList 异步列表</h2>
        <p>支持分页的异步数据列表组件，自动处理加载、错误和空状态</p>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">基础用法</h3>
        <p className="demo-section-description">自动加载数据并分页显示</p>
        <div className="demo-example">
          <AsyncPagination key={refreshKey} fetcher={mockFetcher} pageSize={10}>
            {(list, isLoading) => (
              <div style={{ border: "1px solid #e8e8e8", borderRadius: "4px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", opacity: isLoading ? 0.5 : 1 }}>
                  <thead>
                    <tr style={{ background: "#f5f5f5" }}>
                      <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #e8e8e8" }}>ID</th>
                      <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #e8e8e8" }}>名称</th>
                      <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #e8e8e8" }}>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((item: any) => (
                      <tr key={item.id}>
                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #e8e8e8" }}>{item.id}</td>
                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #e8e8e8" }}>{item.name}</td>
                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #e8e8e8" }}>
                          <span style={{ color: item.status === "正常" ? "#4caf50" : "#f44336" }}>●</span> {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AsyncPagination>
          <button onClick={() => setRefreshKey((k) => k + 1)} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
            刷新数据
          </button>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">不同每页条数</h3>
        <p className="demo-section-description">通过 pageSize 属性设置每页显示的条数</p>
        <div className="demo-example">
          <AsyncPagination fetcher={mockFetcher} pageSize={5}>
            {(list, isLoading) => (
              <div style={{ opacity: isLoading ? 0.5 : 1 }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {list.map((item: any) => (
                    <li
                      key={item.id}
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid #e8e8e8",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        <strong>#{item.id}</strong> {item.name}
                      </span>
                      <span style={{ color: item.status === "正常" ? "#4caf50" : "#f44336" }}>{item.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AsyncPagination>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">加载状态</h3>
        <p className="demo-section-description">通过 isLoading 参数判断加载状态</p>
        <div className="demo-example">
          <AsyncPagination fetcher={mockFetcher} pageSize={8}>
            {(list, isLoading) => (
              <div>
                {isLoading && (
                  <div
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      background: "#fff3cd",
                      border: "1px solid #ffc107",
                      borderRadius: "4px",
                      marginBottom: "1rem",
                    }}
                  >
                    ⏳ 数据加载中...
                  </div>
                )}
                <div style={{ opacity: isLoading ? 0.5 : 1 }}>
                  {list.map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "0.75rem",
                        background: "#f5f5f5",
                        marginBottom: "0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AsyncPagination>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">自定义渲染</h3>
        <p className="demo-section-description">使用 children 函数自定义列表渲染</p>
        <div className="demo-example">
          <AsyncPagination fetcher={mockFetcher} pageSize={6}>
            {(list, isLoading) => (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", opacity: isLoading ? 0.5 : 1 }}>
                {list.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "1rem",
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px",
                      background: "#fff",
                    }}
                  >
                    <h4 style={{ margin: "0 0 0.5rem" }}>{item.name}</h4>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      <div>ID: {item.id}</div>
                      <div>
                        状态: <span style={{ color: item.status === "正常" ? "#4caf50" : "#f44336" }}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AsyncPagination>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-section-title">特性说明</h3>
        <div className="demo-example">
          <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
            <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
              <li>自动处理数据加载状态</li>
              <li>自动处理错误状态（使用 error 组件）</li>
              <li>自动处理空数据状态（使用 empty 组件）</li>
              <li>集成分页组件，自动管理页码</li>
              <li>支持 keepPreviousData 保持上一页数据</li>
              <li>fetcher 函数需返回 [数据数组, 总数] 的格式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AsyncListDemo;
