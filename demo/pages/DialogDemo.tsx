import { Dialog, DIALOG_SIZE_SMALL, DIALOG_SIZE_NORMAL, DIALOG_SIZE_LARGE } from "@/components/Dialog";
import { alert, confirm, showCustomDialog, showImgPreview } from "@/components/DialogExt";
import { PrimaryButton, NormalButton } from "@/components/Button";
import { useState } from "react";

function DialogDemo() {
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [open3, setOpen3] = useState(false);

    const showCustom = () => {
        showCustomDialog({
            title: "自定义对话框",
            contentNode: (
                <div style={{ padding: "1rem" }}>
                    <p>这是通过 showCustomDialog 函数创建的对话框</p>
                    <p>可以在任何地方调用，不需要管理 state</p>
                </div>
            ),
            size: DIALOG_SIZE_NORMAL,
        });
    };

    const showConfirm = () => {
        confirm("确认操作", "您确定要执行此操作吗？");
    };

    const showAlert = () => {
        alert("提示", "这是一个提示对话框");
    };

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>Dialog 对话框</h2>
                <p>可配置的模态对话框组件，支持多种尺寸和自定义内容</p>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">基础用法</h3>
                <p className="demo-section-description">通过 open 和 setOpen 控制对话框的显示/隐藏</p>
                <div className="demo-example">
                    <PrimaryButton onClick={() => setOpen1(true)}>打开对话框</PrimaryButton>
                    <Dialog open={open1} setOpen={setOpen1}>
                        <Dialog.Title>基础对话框</Dialog.Title>
                        <Dialog.TopCloser />
                        <div style={{ padding: "1rem" }}>
                            <p>这是一个基础的对话框内容</p>
                            <p>可以包含任何 React 组件</p>
                        </div>
                    </Dialog>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">不同尺寸</h3>
                <p className="demo-section-description">通过 size 属性设置对话框尺寸</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <PrimaryButton
                            onClick={() =>
                                showCustomDialog({ title: "小尺寸", contentNode: <div style={{ padding: "1rem" }}>小尺寸对话框</div>, size: DIALOG_SIZE_SMALL })
                            }
                        >
                            小尺寸 (24em)
                        </PrimaryButton>
                        <PrimaryButton
                            onClick={() =>
                                showCustomDialog({
                                    title: "普通尺寸",
                                    contentNode: <div style={{ padding: "1rem" }}>普通尺寸对话框</div>,
                                    size: DIALOG_SIZE_NORMAL,
                                })
                            }
                        >
                            普通尺寸 (32em)
                        </PrimaryButton>
                        <PrimaryButton
                            onClick={() =>
                                showCustomDialog({ title: "大尺寸", contentNode: <div style={{ padding: "1rem" }}>大尺寸对话框</div>, size: DIALOG_SIZE_LARGE })
                            }
                        >
                            大尺寸 (60em)
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">showCustomDialog 函数</h3>
                <p className="demo-section-description">通过函数式调用快速创建对话框</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <PrimaryButton onClick={showCustom}>普通对话框</PrimaryButton>
                        <PrimaryButton onClick={showConfirm}>确认对话框</PrimaryButton>
                        <PrimaryButton onClick={showAlert}>提示对话框</PrimaryButton>
                    </div>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">不显示关闭按钮</h3>
                <p className="demo-section-description">
                    通过 <Dialog.TopCloser /> 组件控制右上角关闭按钮的显示与隐藏
                </p>
                <div className="demo-example">
                    <PrimaryButton onClick={() => setOpen2(true)}>打开对话框</PrimaryButton>
                    <Dialog open={open2} setOpen={setOpen2}>
                        <Dialog.Title>无关闭按钮对话框</Dialog.Title>
                        <div style={{ padding: "1rem" }}>
                            <p>此对话框没有右上角的关闭按钮</p>
                            <p>需要通过点击遮罩层或自定义按钮关闭</p>
                        </div>
                        <Dialog.Actions>
                            <NormalButton onClick={() => setOpen2(false)}>关闭</NormalButton>
                        </Dialog.Actions>
                    </Dialog>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">自定义最大高度</h3>
                <p className="demo-section-description">通过 maxHeight 属性限制对话框内容高度</p>
                <div className="demo-example">
                    <PrimaryButton onClick={() => setOpen3(true)}>打开对话框</PrimaryButton>
                    <Dialog open={open3} setOpen={setOpen3} maxHeight="400px">
                        <Dialog.Title>长内容对话框</Dialog.Title>
                        <div style={{ padding: "1rem" }}>
                            {Array.from({ length: 20 }, (_, i) => (
                                <p key={i}>这是第 {i + 1} 段内容，用于演示滚动效果。</p>
                            ))}
                        </div>
                    </Dialog>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">表单对话框</h3>
                <p className="demo-section-description">在对话框中使用表单</p>
                <div className="demo-example">
                    <PrimaryButton
                        onClick={() =>
                            showCustomDialog({
                                title: "编辑信息",
                                contentNode: (
                                    <div style={{ padding: "1rem" }}>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                alert("表单提交！");
                                            }}
                                        >
                                            <div style={{ marginBottom: "1rem" }}>
                                                <label style={{ display: "block", marginBottom: "0.5rem" }}>用户名</label>
                                                <input type="text" style={{ width: "100%", padding: "0.5rem" }} />
                                            </div>
                                            <div style={{ marginBottom: "1rem" }}>
                                                <label style={{ display: "block", marginBottom: "0.5rem" }}>邮箱</label>
                                                <input type="email" style={{ width: "100%", padding: "0.5rem" }} />
                                            </div>
                                            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                                                <NormalButton>取消</NormalButton>
                                                <PrimaryButton tag="button" type="submit">
                                                    保存
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </div>
                                ),
                                size: DIALOG_SIZE_NORMAL,
                            })
                        }
                    >
                        打开表单对话框
                    </PrimaryButton>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">图片预览</h3>
                <p className="demo-section-description">在对话框中预览图片</p>
                <div className="demo-example">
                    <PrimaryButton
                        onClick={() => {
                            showImgPreview("https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1SxPL9.img?w=768&h=723&m=6&x=311&y=270&s=324&d=324");
                        }}
                    >
                        打开图片预览
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}

export default DialogDemo;
