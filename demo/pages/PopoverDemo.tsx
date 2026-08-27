import { Popover } from "../../src/components/Popover";
import { PrimaryButton, NormalButton } from "../../src/components/Button";
import { useState } from "react";

function PopoverDemo() {
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>Popover 气泡弹出层</h2>
                <p>基于 Radix UI 的可定位浮动弹出层组件</p>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">基础用法</h3>
                <p className="demo-section-description">通过 open 和 onOpenChange 控制 Popover 的显示</p>
                <div className="demo-example">
                    <Popover open={open1} onOpenChange={setOpen1}>
                        <Popover.Trigger>
                            {/* <PrimaryButton>点击打开 Popover</PrimaryButton> */}
                            <input type="text" name="" id="" />
                        </Popover.Trigger>
                        <Popover.Content>
                            <div style={{ padding: "1rem" }}>
                                <h4 style={{ margin: "0 0 0.5rem" }}>Popover 标题</h4>
                                <p style={{ margin: 0 }}>这是 Popover 的内容</p>
                            </div>
                        </Popover.Content>
                    </Popover>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">不同弹出方向</h3>
                <p className="demo-section-description">通过 side 属性设置弹出方向</p>
                <div className="demo-example">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", padding: "3rem" }}>
                        <div style={{ textAlign: "center" }}>
                            <Popover>
                                <Popover.Trigger>
                                    <NormalButton>上方</NormalButton>
                                </Popover.Trigger>
                                <Popover.Content side="top">
                                    <div style={{ padding: "0.5rem 1rem" }}>向上弹出</div>
                                </Popover.Content>
                            </Popover>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <Popover>
                                <Popover.Trigger>
                                    <NormalButton>下方</NormalButton>
                                </Popover.Trigger>
                                <Popover.Content side="bottom">
                                    <div style={{ padding: "0.5rem 1rem" }}>向下弹出</div>
                                </Popover.Content>
                            </Popover>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <Popover>
                                <Popover.Trigger>
                                    <NormalButton>左侧</NormalButton>
                                </Popover.Trigger>
                                <Popover.Content side="left">
                                    <div style={{ padding: "0.5rem 1rem" }}>向左弹出</div>
                                </Popover.Content>
                            </Popover>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <Popover>
                                <Popover.Trigger>
                                    <NormalButton>右侧</NormalButton>
                                </Popover.Trigger>
                                <Popover.Content side="right">
                                    <div style={{ padding: "0.5rem 1rem" }}>向右弹出</div>
                                </Popover.Content>
                            </Popover>
                        </div>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">偏移距离</h3>
                <p className="demo-section-description">通过 sideOffset 属性设置弹出层与触发器的距离</p>
                <div className="demo-example">
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <Popover>
                            <Popover.Trigger>
                                <NormalButton>偏移 4px</NormalButton>
                            </Popover.Trigger>
                            <Popover.Content sideOffset={4}>
                                <div style={{ padding: "0.5rem 1rem" }}>sideOffset = 4</div>
                            </Popover.Content>
                        </Popover>

                        <Popover>
                            <Popover.Trigger>
                                <NormalButton>偏移 12px</NormalButton>
                            </Popover.Trigger>
                            <Popover.Content sideOffset={12}>
                                <div style={{ padding: "0.5rem 1rem" }}>sideOffset = 12</div>
                            </Popover.Content>
                        </Popover>

                        <Popover>
                            <Popover.Trigger>
                                <NormalButton>偏移 24px</NormalButton>
                            </Popover.Trigger>
                            <Popover.Content sideOffset={24}>
                                <div style={{ padding: "0.5rem 1rem" }}>sideOffset = 24</div>
                            </Popover.Content>
                        </Popover>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">复杂内容</h3>
                <p className="demo-section-description">Popover 中可以包含任意内容</p>
                <div className="demo-example">
                    <Popover open={open2} onOpenChange={setOpen2}>
                        <Popover.Trigger>
                            <PrimaryButton>打开表单 Popover</PrimaryButton>
                        </Popover.Trigger>
                        <Popover.Content side="bottom" sideOffset={8}>
                            <div style={{ padding: "1rem", minWidth: "300px" }}>
                                <h4 style={{ margin: "0 0 1rem" }}>快速编辑</h4>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        alert("表单提交！");
                                        setOpen2(false);
                                    }}
                                >
                                    <div style={{ marginBottom: "0.75rem" }}>
                                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}>名称</label>
                                        <input type="text" style={{ width: "100%", padding: "0.5rem" }} />
                                    </div>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}>描述</label>
                                        <textarea style={{ width: "100%", padding: "0.5rem", resize: "vertical", minHeight: "60px" }}></textarea>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                        <NormalButton onClick={() => setOpen2(false)}>取消</NormalButton>
                                        <PrimaryButton tag="button" type="submit">
                                            保存
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </Popover.Content>
                    </Popover>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">列表菜单</h3>
                <p className="demo-section-description">使用 Popover 创建下拉菜单</p>
                <div className="demo-example">
                    <Popover>
                        <Popover.Trigger>
                            <NormalButton>操作菜单</NormalButton>
                        </Popover.Trigger>
                        <Popover.Content side="bottom" align="start">
                            <div style={{ minWidth: "150px" }}>
                                <button
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        padding: "0.5rem 1rem",
                                        border: "none",
                                        background: "none",
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                    onClick={() => alert("编辑")}
                                >
                                    ✏️ 编辑
                                </button>
                                <button
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        padding: "0.5rem 1rem",
                                        border: "none",
                                        background: "none",
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                    onClick={() => alert("复制")}
                                >
                                    📋 复制
                                </button>
                                <button
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        padding: "0.5rem 1rem",
                                        border: "none",
                                        background: "none",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        color: "#f44336",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#ffebee")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                    onClick={() => alert("删除")}
                                >
                                    🗑️ 删除
                                </button>
                            </div>
                        </Popover.Content>
                    </Popover>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">Popover.Anchor 定位锚点</h3>
                <p className="demo-section-description">使用 Popover.Anchor 将 Popover 定位到任意元素</p>
                <div className="demo-example">
                    <Popover>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                            <Popover.Trigger>
                                <NormalButton>打开 Popover</NormalButton>
                            </Popover.Trigger>
                            <Popover.Anchor asChild>
                                <div
                                    style={{
                                        padding: "0.5rem 1rem",
                                        background: "#e3f2fd",
                                        borderRadius: "4px",
                                        border: "1px dashed #1976d2",
                                    }}
                                >
                                    定位锚点
                                </div>
                            </Popover.Anchor>
                        </div>
                        <Popover.Content side="bottom">
                            <div style={{ padding: "0.5rem 1rem" }}>Popover 定位到蓝色框</div>
                        </Popover.Content>
                    </Popover>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">特性说明</h3>
                <div className="demo-example">
                    <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
                        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                            <li>基于 Radix UI Popover 组件</li>
                            <li>支持多种弹出方向（top, bottom, left, right）</li>
                            <li>支持自定义偏移距离</li>
                            <li>支持对齐方式（start, center, end）</li>
                            <li>自动处理边界碰撞</li>
                            <li>点击外部区域自动关闭</li>
                            <li>支持自定义关闭逻辑（onCloseBy）</li>
                            <li>内置箭头指示器</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PopoverDemo;
