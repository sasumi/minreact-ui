import { Dialog, DIALOG_SIZE_SMALL, DIALOG_SIZE_NORMAL, DIALOG_SIZE_LARGE } from "../../src/components/Dialog";
import { PrimaryButton, NormalButton } from "../../src/components/Button";
import { useCallback, useState } from "react";
import { Toast } from "../../src";
import { useLocalStorage } from "../../src/hooks/useLocalStorage";
import { DemoSection } from "../DemoApp";

/** iframe 对话框的内联示例页面（data URL，不依赖外部站点） */
const INLINE_IFRAME_HTML =
    "data:text/html;charset=utf-8," +
    encodeURIComponent(
        `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
            body { margin: 0; padding: 1em; font: 14px/1.8 system-ui, sans-serif; }
            h3 { margin: 0 0 0.5em; }
        </style></head><body>
            <h3>内联 HTML</h3>
            <p>这段内容由 data: URL 提供，与宿主页面无关。</p>
            <p>iframe 会撑满对话框内容区的高度。</p>
        </body></html>`,
    );

function DialogDemo() {
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [open3, setOpen3] = useState(false);
    const [open4, setOpen4] = useState(false);
    const [open5, setOpen5] = useState(false);
    const [openMoveable, setOpenMoveable] = useState(false);
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
    const [openRememberPosition, setOpenRememberPosition] = useState(false);
    const [savedDialogPosition, setSavedDialogPosition] = useLocalStorage<{ x: number; y: number }>("minreactui-demo-dialog-position", null);
    // 函数形式：每次打开时再读取存储值，打开期间 onMove 写入新位置也不会重置拖动
    const getRememberedPosition = useCallback(
        () => (savedDialogPosition ? { top: savedDialogPosition.y, left: savedDialogPosition.x } : null),
        [savedDialogPosition],
    );

    // 初始位置：仅初始化时生效，拖动标题后以实际位置为准
    const showAtTopLeft = () => {
        Dialog.show({
            title: "左上角",
            content: <div style={{ padding: "1rem" }}>initPosition: {"{ top: 24, left: 24 }"}（数字按 px 处理）</div>,
            width: DIALOG_SIZE_NORMAL,
            initPosition: { top: 24, left: 24 },
            moveable: true,
        });
    };

    const showAtBottomRight = () => {
        Dialog.show({
            title: "右下角",
            content: <div style={{ padding: "1rem" }}>initPosition: {'{ right: "2em", bottom: "2em" }'}（支持 CSS 长度）</div>,
            width: DIALOG_SIZE_NORMAL,
            initPosition: { right: "2em", bottom: "2em" },
            moveable: true,
        });
    };

    const showAtTopCenter = () => {
        Dialog.show({
            title: "顶部居中",
            content: <div style={{ padding: "1rem" }}>只传 initPosition.top，水平方向仍然居中</div>,
            width: DIALOG_SIZE_NORMAL,
            initPosition: { top: "1.5em" },
            moveable: true,
        });
    };

    // 可拖动对话框：按住标题拖动，松开后保持实际位置
    const showMoveable = () => {
        Dialog.show({
            title: "可拖动对话框",
            content: <div style={{ padding: "1rem" }}>按住标题即可拖动，松开后位置保持不变</div>,
            width: DIALOG_SIZE_NORMAL,
            moveable: true,
        });
    };

    const showMoveableWithInitPosition = () => {
        Dialog.show({
            title: "可拖动对话框（指定初始位置）",
            content: <div style={{ padding: "1rem" }}>初始位置为 initPosition: {'{ top: "6em", left: "4em" }'}，拖动后以实际位置为准</div>,
            width: DIALOG_SIZE_NORMAL,
            moveable: true,
            initPosition: { top: "6em", left: "4em" },
        });
    };

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

    // iframe 对话框：内容交给 iframe 承载，对话框自动带上 -dialog-iframe 类名
    const showIframeInline = () => {
        Dialog.showIframe({
            title: "内联 HTML",
            url: INLINE_IFRAME_HTML,
        });
    };

    const showIframeLocalPage = () => {
        Dialog.showIframe({
            title: "站内页面 #/Button",
            url: "#/Button",
            width: DIALOG_SIZE_LARGE,
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
                            Dialog.show({
                                title: "小尺寸",
                                content: (
                                    <div className="small-dlg" style={{ padding: "1rem" }}>
                                        小尺寸对话框
                                    </div>
                                ),
                                width: DIALOG_SIZE_SMALL,
                            })
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
                        onClick={() => Dialog.show({ title: "大尺寸", content: <div style={{ padding: "1rem" }}>大尺寸对话框</div>, width: DIALOG_SIZE_LARGE })}
                    >
                        大尺寸 (60em)
                    </PrimaryButton>
                </div>
            </DemoSection>

            <DemoSection
                title="初始位置"
                description="通过 initPosition: { top, left, right, bottom } 指定初始位置，支持 px、em 等 CSS 长度（数字按 px）；未传的方向保持居中；仅初始化时生效，拖动后以实际位置为准"
            >
                <div className="demo-row">
                    <PrimaryButton onClick={showAtTopLeft}>左上角</PrimaryButton>
                    <PrimaryButton onClick={showAtBottomRight}>右下角</PrimaryButton>
                    <PrimaryButton onClick={showAtTopCenter}>顶部居中</PrimaryButton>
                </div>
            </DemoSection>

            <DemoSection
                title="可拖动对话框"
                description="moveable 为 true 时按住标题即可拖动；initPosition 只决定初始位置，拖动后使用实际位置；最后一个示例用 onMoveEnd 持久化位置，并通过函数形式的 initPosition 恢复"
            >
                <div className="demo-row">
                    <PrimaryButton onClick={showMoveable}>默认居中</PrimaryButton>
                    <PrimaryButton onClick={showMoveableWithInitPosition}>指定初始位置</PrimaryButton>
                    <PrimaryButton
                        onClick={() => {
                            setDragPos(null);
                            setOpenMoveable(true);
                        }}
                    >
                        onMove 回调
                    </PrimaryButton>
                    <PrimaryButton onClick={() => setOpenRememberPosition(true)}>记住上次位置</PrimaryButton>
                </div>
                <Dialog
                    open={openMoveable}
                    setOpen={setOpenMoveable}
                    width={DIALOG_SIZE_NORMAL}
                    moveable
                    onMove={(x, y) => setDragPos({ x, y })}
                >
                    <Dialog.Title>拖动坐标</Dialog.Title>
                    <Dialog.Content>
                        <p>拖动标题查看实时坐标</p>
                        <p>当前位置：{dragPos ? `x: ${Math.round(dragPos.x)}, y: ${Math.round(dragPos.y)}` : "尚未拖动"}</p>
                    </Dialog.Content>
                </Dialog>
                <Dialog
                    open={openRememberPosition}
                    setOpen={setOpenRememberPosition}
                    width={DIALOG_SIZE_NORMAL}
                    moveable
                    initPosition={getRememberedPosition}
                    onMoveEnd={(x, y) => setSavedDialogPosition({ x: Math.round(x), y: Math.round(y) })}
                >
                    <Dialog.Title>记住上次位置</Dialog.Title>
                    <Dialog.Content>
                        <p>拖动结束时通过 onMoveEnd 写入 useLocalStorage；initPosition 传函数，每次打开时读取最新值。</p>
                        <p>已保存位置：{savedDialogPosition ? `x: ${savedDialogPosition.x}, y: ${savedDialogPosition.y}` : "无"}</p>
                    </Dialog.Content>
                </Dialog>
            </DemoSection>

            <DemoSection title="Dialog.show 函数" description="通过函数式调用快速创建对话框">
                <div className="demo-row">
                    <PrimaryButton onClick={showCustom}>普通对话框</PrimaryButton>
                    <PrimaryButton onClick={showConfirm}>确认对话框</PrimaryButton>
                    <PrimaryButton onClick={showAlert}>提示对话框</PrimaryButton>
                    <PrimaryButton onClick={showPrompt}>输入对话框</PrimaryButton>
                </div>
            </DemoSection>

            <DemoSection title="Dialog.showProgress 进度对话框" description="返回 { updater, isAborted, close }，通过 updater(progress, total?) 推进进度">
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

            <DemoSection
                title="Esc 关闭"
                description="escClose 默认 true：焦点在对话框内且不在输入框里时按 Esc 关闭；关闭按钮不显示或 escClose 为 false 时不生效"
            >
                <PrimaryButton onClick={() => setOpen4(true)}>打开对话框</PrimaryButton>
                <Dialog open={open4} setOpen={setOpen4} escClose={false}>
                    <div style={{ padding: "1rem" }}>
                        <p>此对话框关闭了 Esc 关闭（escClose 为 false）</p>
                        <p>需要通过点击右上角关闭按钮或下面的按钮关闭</p>
                    </div>
                    <Dialog.Action>
                        <NormalButton onClick={() => setOpen4(false)}>关闭</NormalButton>
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

            <DemoSection
                title="Iframe 对话框"
                description="Dialog.Content 传 iframeSrc 时用 iframe 承载内容：对话框自动追加 -dialog-iframe 类名，内容区去掉内边距、iframe 撑满高度"
            >
                <div className="demo-row">
                    <PrimaryButton onClick={showIframeInline}>内联 HTML（data URL）</PrimaryButton>
                    <PrimaryButton onClick={showIframeLocalPage}>站内页面</PrimaryButton>
                    <PrimaryButton onClick={() => setOpen5(true)}>声明式用法</PrimaryButton>
                </div>
                <Dialog open={open5} setOpen={setOpen5} width={DIALOG_SIZE_NORMAL}>
                    <Dialog.Title>声明式 iframe 对话框</Dialog.Title>
                    <Dialog.Content iframeSrc="#/Button" />
                </Dialog>
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
