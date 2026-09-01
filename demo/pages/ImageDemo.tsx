import { ImageLoader, patchImgLoader } from "../../src/components/Image";
import { CSSProperties, useState } from "react";

// 示例图片地址（picsum.photos 提供占位图，seed 保证图片固定）
const NORMAL_SRC = "https://picsum.photos/seed/minreactui/400/300";
const SLOW_SRC = "https://picsum.photos/seed/minreactui-slow/2000/1500";
const ERROR_SRC = "https://invalid.example.com/not-found.png";

// 生成图片容器样式：position: relative 是占位层正确铺满的关键
const makeBox = (width: number, height: number): CSSProperties => ({
    position: "relative",
    width,
    height,
    border: "1px dashed #ccc",
    borderRadius: "4px",
    overflow: "hidden",
    background: "#fff",
});

const IMG_STYLE: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
};

function ImageDemo() {
    const [src, setSrc] = useState<string | undefined>(NORMAL_SRC);
    const [reloadKey, setReloadKey] = useState(0);

    const switchState = (nextSrc?: string) => {
        setSrc(nextSrc);
        setReloadKey((k) => k + 1);
    };

    const stateText =
        src === undefined
            ? "空状态（暂无图片）"
            : src === ERROR_SRC
                ? "错误状态（图片加载失败）"
                : "正常 / 加载中";

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>ImageLoader 图片加载</h2>
                <p>支持加载、错误、空状态的图片组件，加载过程中自动展示占位内容</p>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">基础用法</h3>
                <p className="demo-section-description">加载成功时显示图片，加载过程中自动展示占位动画</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <div style={makeBox(400, 300)}>
                            <ImageLoader src={NORMAL_SRC} alt="普通图片" style={IMG_STYLE} />
                        </div>
                        <div style={makeBox(400, 300)}>
                            <ImageLoader src={SLOW_SRC} alt="较大图片" style={IMG_STYLE} />
                        </div>
                    </div>
                    <p style={{ color: "#666", fontSize: "0.9rem" }}>左：普通图片 | 右：较大图片（可观察到加载动画）</p>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">状态切换</h3>
                <p className="demo-section-description">通过 src 属性控制不同的展示状态</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <button onClick={() => switchState(NORMAL_SRC)}>加载成功</button>
                        <button onClick={() => switchState(ERROR_SRC)}>加载失败</button>
                        <button onClick={() => switchState(undefined)}>空状态</button>
                        <button onClick={() => switchState(`${SLOW_SRC}?t=${Date.now()}`)}>慢速加载</button>
                    </div>
                    <div style={makeBox(400, 300)} key={reloadKey}>
                        <ImageLoader src={src} alt="状态演示图片" style={IMG_STYLE} />
                    </div>
                    <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.5rem" }}>当前状态：{stateText}</p>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">不同尺寸</h3>
                <p className="demo-section-description">通过容器尺寸控制图片显示大小，组件自动适配</p>
                <div className="demo-example">
                    <div className="demo-row" style={{ alignItems: "flex-end" }}>
                        <div style={makeBox(120, 90)}>
                            <ImageLoader src="https://picsum.photos/seed/small/120/90" alt="小图" style={IMG_STYLE} />
                        </div>
                        <div style={makeBox(200, 150)}>
                            <ImageLoader src="https://picsum.photos/seed/medium/200/150" alt="中图" style={IMG_STYLE} />
                        </div>
                        <div style={makeBox(300, 225)}>
                            <ImageLoader src="https://picsum.photos/seed/large/300/225" alt="大图" style={IMG_STYLE} />
                        </div>
                    </div>
                    <p style={{ color: "#666", fontSize: "0.9rem" }}>120×90 / 200×150 / 300×225</p>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">懒加载</h3>
                <p className="demo-section-description">组件默认开启 loading="lazy"，也可手动覆盖</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <div style={makeBox(400, 300)}>
                            <ImageLoader src={NORMAL_SRC} alt="默认懒加载" style={IMG_STYLE} />
                        </div>
                        <div style={makeBox(400, 300)}>
                            <ImageLoader src={NORMAL_SRC} alt="立即加载" loading="eager" style={IMG_STYLE} />
                        </div>
                    </div>
                    <p style={{ color: "#666", fontSize: "0.9rem" }}>左：默认 lazy | 右：eager 立即加载</p>
                </div>
            </div>

            <div className="demo-section">
                <h3 className="demo-section-title">patchImgLoader 函数版</h3>
                <p className="demo-section-description">返回 HTML 字符串，适用于非 React 环境或模板拼接场景</p>
                <div className="demo-example">
                    <div className="demo-row">
                        <div
                            style={makeBox(400, 300)}
                            dangerouslySetInnerHTML={{
                                __html: patchImgLoader({ src: NORMAL_SRC, class: "minreactui-img", alt: "函数版图片" }),
                            }}
                        />
                        <div
                            style={makeBox(400, 300)}
                            dangerouslySetInnerHTML={{
                                __html: patchImgLoader({ src: ERROR_SRC, class: "minreactui-img", alt: "函数版错误图片" }),
                            }}
                        />
                    </div>
                    <p style={{ color: "#666", fontSize: "0.9rem" }}>左：正常加载 | 右：加载失败</p>
                </div>
            </div>
        </div>
    );
}

export default ImageDemo;
