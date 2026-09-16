import { Dialog, DIALOG_SIZE_SMALL, DIALOG_SIZE_NORMAL, DIALOG_SIZE_LARGE } from "../../src/components/Dialog";
import { PrimaryButton, NormalButton } from "../../src/components/Button";
import { useState } from "react";
import { Toast } from "../../src";
import { DemoSection } from "../DemoApp";

function DialogDemo() {
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [open3, setOpen3] = useState(false);

    const showCustom = () => {
        Dialog.show({
            title: "自定义对话框",
            content: (
                <div>
                    <p>这是通过 Dialog.show 函数创建的对话框</p>
                    <p>可以在任何地方调用，不需要管理 state</p>
                    <button onClick={() => Dialog.alert("按钮被点击了")}>点击我</button>
                    <button onClick={() => Toast.showInfo("这是一个 Toast 提示")}>Toast</button>
                </div>
            ),
            width: DIALOG_SIZE_NORMAL,
        });
    };

    const showConfirm = () => {
        Dialog.confirm({
            title: "确认操作",
            message: "您确定要执行此操作吗？",
        });
    };

    const showAlert = () => {
        Dialog.alert("提示", "这是一个提示对话框");
    };

    const showPrompt = () => {
        Dialog.prompt({ title: "请输入您的姓名" })
            .then((value) => {
                if (value !== undefined) {
                    Dialog.alert("您输入的姓名是：" + value);
                } else {
                    Dialog.alert("您取消了输入");
                }
            })
            .catch((err) => {
                console.error("Prompt error:", err);
            });
    };

    // 进度对话框：总量已知，到达总量后自动关闭
    const showProgressBasic = () => {
        const progress = Dialog.showProgress({
            title: "正在处理",
            message: "共 <b>100</b> 个任务，完成后自动关闭",
        });
        let done = 0;
        const timer = setInterval(() => {
            done += 5;
            progress.updater(done, 100);
            if (done >= 100) {
                clearInterval(timer);
            }
        }, 20000);
    };

    // 进度对话框：总量在过程中变更（先 10 个，再追加到 30 个）
    const showProgressGrowing = () => {
        const progress = Dialog.showProgress({
            title: "扫描中",
            message: "任务数量会动态增加",
            autoClose: false,
            canAbort: false,
        });
        let done = 0;
        let total = 10;
        const timer = setInterval(() => {
            done += 1;
            progress.updater(done, total);
            if (done === 10) {
                total = 30;
                progress.updater(done, total);
            }
            if (done >= total) {
                clearInterval(timer);
                setTimeout(() => {
                    progress.close();
                    Toast.showSuccess("扫描完成");
                }, 500);
            }
        }, 250);
    };

    // 进度对话框：可中止，通过 isAborted 让业务侧停止后续工作
    const showProgressAbortable = () => {
        const progress = Dialog.showProgress({
            title: "可中止的任务",
            message: "点击右上角关闭按钮可中止任务",
            canAbort: true,
            autoClose: false,
        });
        let done = 0;
        const timer = setInterval(() => {
            if (progress.isAborted()) {
                clearInterval(timer);
                Toast.showWarning("任务已中止");
                return;
            }
            done += 2;
            progress.updater(done, 100);
            if (done >= 100) {
                clearInterval(timer);
                progress.close();
                Toast.showSuccess("任务已完成");
            }
        }, 100);
    };

    // 进度对话框：自定义剩余时间文案，{timeStr} 会被替换为剩余时长
    const showProgressCustomText = () => {
        const progress = Dialog.showProgress({
            title: "下载中",
            canAbort: false,
            autoClose: false,
            remainTimesText: "还需 {timeStr}，请勿关闭页面",
        });
        let loaded = 0;
        const timer = setInterval(() => {
            loaded += 1;
            progress.updater(loaded, 20);
            if (loaded >= 20) {
                clearInterval(timer);
                setTimeout(() => {
                    progress.close();
                    Toast.showSuccess("下载完成");
                }, 800);
            }
        }, 300);
    };

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>Dialog 对话框</h2>
                <p>可配置的模态对话框组件，支持多种尺寸和自定义内容</p>
            </div>

            <DemoSection title="基础用法" description="通过 open 和 setOpen 控制对话框的显示/隐藏">
                <PrimaryButton onClick={() => setOpen1(true)}>打开对话框</PrimaryButton>
                <Dialog open={open1} setOpen={setOpen1}>
                    <Dialog.Title>基础对话框</Dialog.Title>
                    <div style={{ padding: "1rem" }}>
                        <p>这是一个基础的对话框内容</p>
                        <p>可以包含任何 React 组件</p>
                    </div>
                </Dialog>
            </DemoSection>

            <DemoSection title="不同尺寸" description="通过 size 属性设置对话框尺寸">
                <div className="demo-row">
                    <PrimaryButton
                        onClick={() =>
                            Dialog.show({ title: "小尺寸", content: <div style={{ padding: "1rem" }}>小尺寸对话框</div>, width: DIALOG_SIZE_SMALL })
                        }
                    >
                        小尺寸 (24em)
                    </PrimaryButton>
                    <PrimaryButton
                        onClick={() =>
                            Dialog.show({
                                title: "普通尺寸",
                                content: <div style={{ padding: "1rem" }}>普通尺寸对话框</div>,
                                width: DIALOG_SIZE_NORMAL,
                            })
                        }
                    >
                        普通尺寸 (32em)
                    </PrimaryButton>
                    <PrimaryButton
                        onClick={() =>
                            Dialog.show({ title: "大尺寸", content: <div style={{ padding: "1rem" }}>大尺寸对话框</div>, width: DIALOG_SIZE_LARGE })
                        }
                    >
                        大尺寸 (60em)
                    </PrimaryButton>
                </div>
            </DemoSection>

            <DemoSection title="Dialog.show 函数" description="通过函数式调用快速创建对话框">
                <div className="demo-row">
                    <PrimaryButton onClick={showCustom}>普通对话框</PrimaryButton>
                    <PrimaryButton onClick={showConfirm}>确认对话框</PrimaryButton>
                    <PrimaryButton onClick={showAlert}>提示对话框</PrimaryButton>
                    <PrimaryButton onClick={showPrompt}>输入对话框</PrimaryButton>
                </div>
            </DemoSection>

            <DemoSection
                title="Dialog.showProgress 进度对话框"
                description="返回 { updater, isAborted, close }，通过 updater(progress, total?) 推进进度"
            >
                <div className="demo-row">
                    <PrimaryButton onClick={showProgressBasic}>自动关闭</PrimaryButton>
                    <PrimaryButton onClick={showProgressGrowing}>总量动态变化</PrimaryButton>
                    <PrimaryButton onClick={showProgressAbortable}>可中止</PrimaryButton>
                    <PrimaryButton onClick={showProgressCustomText}>自定义剩余时间文案</PrimaryButton>
                </div>
                <ul style={{ marginTop: "0.75rem", paddingLeft: "1.2rem", opacity: 0.75, fontSize: "0.85rem" }}>
                    <li>
                        <code>updater(progress, total?)</code> 同时更新已完成量与总量；<code>total</code> 省略时沿用上次的值。
                    </li>
                    <li>
                        <code>isAborted()</code> 在用户点击右上角关闭按钮后返回 true，业务侧据此停止后续任务。
                    </li>
                    <li>
                        <code>autoClose</code> 为 true 时进度到达总量自动关闭；<code>canAbort</code> 控制是否显示关闭按钮。
                    </li>
                </ul>
            </DemoSection>

            <DemoSection title="不显示关闭按钮">
                <PrimaryButton onClick={() => setOpen2(true)}>打开对话框</PrimaryButton>
                <Dialog open={open2} setOpen={setOpen2} showTopCloser={false}>
                    <div style={{ padding: "1rem" }}>
                        <p>此对话框没有右上角的关闭按钮</p>
                        <p>需要通过点击遮罩层或自定义按钮关闭</p>
                    </div>
                    <Dialog.Action>
                        <NormalButton onClick={() => setOpen2(false)}>关闭</NormalButton>
                    </Dialog.Action>
                </Dialog>
            </DemoSection>

            <DemoSection title="自定义最大高度" description="通过 maxHeight 属性限制对话框内容高度">
                <PrimaryButton onClick={() => setOpen3(true)}>打开对话框</PrimaryButton>
                <Dialog open={open3} setOpen={setOpen3} maxHeight="20em">
                    <Dialog.Title>自定义最大高度</Dialog.Title>
                    <Dialog.Content>
                        <div style={{ padding: "1rem" }}>
                            {Array.from({ length: 20 }, (_, i) => (
                                <p key={i}>这是第 {i + 1} 段内容，用于演示滚动效果。</p>
                            ))}
                        </div>
                    </Dialog.Content>
                </Dialog>
            </DemoSection>

            <DemoSection title="表单对话框" description="在对话框中使用表单">
                <PrimaryButton
                    onClick={() =>
                        Dialog.show({
                            children: (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        Dialog.alert("表单提交！");
                                    }}
                                    className="demo-form"
                                >
                                    <Dialog.Title>编辑信息</Dialog.Title>
                                    <Dialog.Content>
                                        <div>
                                            <label>用户名</label>
                                            <input type="text" />
                                        </div>
                                        <div>
                                            <label>用户名</label>
                                            <input type="text" />
                                        </div>
                                        <div>
                                            <label>用户名</label>
                                            <input type="text" />
                                        </div>
                                        <div>
                                            <label>邮箱</label>
                                            <input type="email" />
                                        </div>
                                    </Dialog.Content>
                                    <Dialog.Action>
                                        <NormalButton>取消</NormalButton>
                                        <PrimaryButton tag="button" type="submit">
                                            保存
                                        </PrimaryButton>
                                    </Dialog.Action>
                                </form>
                            ),
                            width: DIALOG_SIZE_NORMAL,
                        })
                    }
                >
                    打开表单对话框
                </PrimaryButton>
            </DemoSection>

            <DemoSection title="图片预览" description="在对话框中预览图片">
                <PrimaryButton
                    onClick={() => {
                        Dialog.showImg("https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1SxPL9.img?w=768&h=723&m=6&x=311&y=270&s=324&d=324");
                    }}
                >
                    打开图片预览
                </PrimaryButton>
            </DemoSection>
        </div>
    );
}

export default DialogDemo;
