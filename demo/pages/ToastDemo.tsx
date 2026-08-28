import { Toast } from "../../src/components/Toast";
import { PrimaryButton, NormalButton } from "../../src/components/Button";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ToastDemo() {
    const handleShowLoading = () => {
        const toastId = Toast.showLoading("处理中，请稍候...", null, 3000);
        setTimeout(() => {
            Toast.hideToast(toastId);
            Toast.showSuccess("处理完成！");
        }, 2000);
    };

    return (
        <div className="demo-page">
            <ToastContainer />

            <div className="demo-page-header">
                <h2>Toast 消息提示</h2>
                <p>全局消息提示组件，基于 react-toastify</p>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">基础用法</h3>
                <p className="demo-section-description">四种基础消息类型</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <PrimaryButton onClick={() => Toast.showSuccess("操作成功！")}>成功提示</PrimaryButton>
                        <PrimaryButton onClick={() => Toast.showInfo("这是一条信息")}>信息提示</PrimaryButton>
                        <PrimaryButton onClick={() => Toast.showWarning("请注意！")}>警告提示</PrimaryButton>
                        <PrimaryButton onClick={() => Toast.showError("操作失败！")}>错误提示</PrimaryButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">加载提示</h3>
                <p className="demo-section-description">显示长时间操作的加载状态</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <PrimaryButton onClick={() => Toast.showLoading("加载中...", null, 2000)}>显示加载（2秒后自动关闭）</PrimaryButton>
                        <PrimaryButton onClick={handleShowLoading}>模拟异步操作</PrimaryButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">自定义消息内容</h3>
                <p className="demo-section-description">可以传入任意文本作为消息内容</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <NormalButton onClick={() => Toast.showSuccess("✅ 文件上传成功！")}>带 Emoji</NormalButton>
                        <NormalButton onClick={() => Toast.showInfo("这是一条很长的消息提示，用于测试文本换行效果，看看在实际使用中的表现如何。")}>
                            长文本
                        </NormalButton>
                        <NormalButton onClick={() => Toast.showWarning("网络连接不稳定，请检查您的网络设置")}>多行提示</NormalButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">自定义持续时间</h3>
                <p className="demo-section-description">通过 duration 参数控制显示时长（毫秒）</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <NormalButton onClick={() => Toast.showInfo("1秒后关闭", null, 1000)}>1秒</NormalButton>
                        <NormalButton onClick={() => Toast.showInfo("3秒后关闭", null, 3000)}>3秒</NormalButton>
                        <NormalButton onClick={() => Toast.showInfo("5秒后关闭", null, 5000)}>5秒</NormalButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">回调函数</h3>
                <p className="demo-section-description">消息关闭后执行回调函数</p>
                <div className="demo-example">
                    <PrimaryButton
                        onClick={() =>
                            Toast.showSuccess("保存成功！", () => {
                                alert("回调函数执行了");
                            })
                        }
                    >
                        带回调的提示
                    </PrimaryButton>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">手动关闭</h3>
                <p className="demo-section-description">使用 Toast.hideToast 手动关闭指定的提示</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <PrimaryButton
                            onClick={() => {
                                const toastId = Toast.showInfo("这条消息不会自动关闭");
                                setTimeout(() => {
                                    Toast.hideToast(toastId);
                                }, 3000);
                            }}
                        >
                            3秒后手动关闭
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">实际应用场景</h3>
                <p className="demo-section-description">常见的使用场景示例</p>
                <div className="demo-example">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <h4 style={{ margin: "0 0 0.5rem" }}>表单提交</h4>
                            <PrimaryButton
                                onClick={() => {
                                    const toastId = Toast.showLoading("正在保存...");
                                    setTimeout(() => {
                                        Toast.hideToast(toastId);
                                        Toast.showSuccess("保存成功！");
                                    }, 1500);
                                }}
                            >
                                提交表单
                            </PrimaryButton>
                        </div>

                        <div>
                            <h4 style={{ margin: "0 0 0.5rem" }}>文件上传</h4>
                            <PrimaryButton
                                onClick={() => {
                                    const toastId = Toast.showLoading("正在上传...");
                                    setTimeout(() => {
                                        Toast.hideToast(toastId);
                                        Toast.showSuccess("上传完成！");
                                    }, 2000);
                                }}
                            >
                                上传文件
                            </PrimaryButton>
                        </div>

                        <div>
                            <h4 style={{ margin: "0 0 0.5rem" }}>删除确认</h4>
                            <PrimaryButton
                                onClick={() => {
                                    if (confirm("确定要删除吗？")) {
                                        Toast.showSuccess("删除成功！");
                                    } else {
                                        Toast.showInfo("已取消删除");
                                    }
                                }}
                            >
                                删除项目
                            </PrimaryButton>
                        </div>

                        <div>
                            <h4 style={{ margin: "0 0 0.5rem" }}>网络错误</h4>
                            <PrimaryButton
                                onClick={() => {
                                    Toast.showError("网络请求失败，请稍后重试");
                                }}
                            >
                                模拟网络错误
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">API 说明</h3>
                <div className="demo-example">
                    <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
                        <h4 style={{ margin: "0 0 0.5rem" }}>可用函数：</h4>
                        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
                            <li>
                                <code>Toast.showSuccess(message, callback?, duration?)</code> - 成功提示（默认1.5秒）
                            </li>
                            <li>
                                <code>Toast.showInfo(message, callback?, duration?)</code> - 信息提示（默认2秒）
                            </li>
                            <li>
                                <code>Toast.showWarning(message, callback?, duration?)</code> - 警告提示（默认3秒）
                            </li>
                            <li>
                                <code>Toast.showError(message, callback?, duration?)</code> - 错误提示（默认4秒）
                            </li>
                            <li>
                                <code>Toast.showLoading(message, callback?, duration?)</code> - 加载提示（默认200秒）
                            </li>
                            <li>
                                <code>Toast.hideToast(toastId)</code> - 手动关闭指定提示
                            </li>
                        </ul>
                        <h4 style={{ margin: "1rem 0 0.5rem" }}>注意：</h4>
                        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
                            <li>需要在根组件中添加 {`<ToastContainer />`}</li>
                            <li>所有函数返回 toastId，可用于手动关闭</li>
                            <li>callback 会在消息关闭前约200ms执行</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ToastDemo;
