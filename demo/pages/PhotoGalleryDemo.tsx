import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { PhotoGallery } from "../../src/components/PhotoGallery";
import type { PhotoGalleryApi } from "../../src/components/PhotoGallery";
import { ImageLoader } from "../../src/components/Image";
import { DemoSection } from "../DemoApp";

// 示例图片（picsum.photos 占位图，seed 固定）
const makePhotos = (count: number) =>
    Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/minreactui-gallery-${i + 1}/800/500`);

const PHOTOS = makePhotos(5);
const ONE_PHOTO = makePhotos(1);

const boxStyle = (width: number, height: number): CSSProperties => ({
    width,
    height,
    border: "1px solid #e5e5e5",
    borderRadius: "6px",
    overflow: "hidden",
});

const barStyle: CSSProperties = { display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" };

const labelStyle: CSSProperties = { margin: "0 0 0.5rem", fontWeight: 500 };

/** ref 方式：组件只管画面，切换动作与按钮位置完全由调用方决定 */
function RefControlDemo() {
    const pg = useRef<PhotoGalleryApi>(null);
    // ref 上的位置是「最近一次渲染的值」，不会自己触发重渲染，用 onIndexChange 同步到本地 state
    const [index, setIndex] = useState(0);

    return (
        <>
            <div style={boxStyle(560, 350)}>
                {/* 只要画面插槽，箭头与序号自绘 */}
                <PhotoGallery photos={PHOTOS} ref={pg} onIndexChange={setIndex}>
                    <PhotoGallery.Gallery />
                </PhotoGallery>
            </div>
            <div style={barStyle}>
                <button onClick={() => pg.current?.prev()} disabled={index === 0}>
                    上一张
                </button>
                <button onClick={() => pg.current?.next()} disabled={index === PHOTOS.length - 1}>
                    下一张
                </button>
                <button onClick={() => pg.current?.goTo(0)} disabled={index === 0}>
                    回到首张
                </button>
                <span style={{ color: "#666", fontSize: "0.9rem" }}>
                    {index + 1}/{PHOTOS.length}
                </span>
            </div>
        </>
    );
}

/** hook 方式：状态在调用方手里，画面通过 gallery 与同一份状态绑定 */
function HookControlDemo() {
    const [pg, pgState] = PhotoGallery.use(PHOTOS);
    const [auto, setAuto] = useState(false);

    // 自动播放：依赖里带上 pg，切图后（pg 是新的渲染结果）重新计时，形成「停留 1.2s 再切换」
    useEffect(() => {
        if (!auto) return;
        const id = window.setInterval(() => pg.goTo((pg.index + 1) % PHOTOS.length), 1200);
        return () => window.clearInterval(id);
    }, [auto, pg]);

    return (
        <>
            <div style={boxStyle(560, 350)}>
                {/* 只保留画面插槽：箭头、序号、缩略图全部由外部元素充当 */}
                <PhotoGallery gallery={pg}>
                    <PhotoGallery.Gallery />
                </PhotoGallery>
            </div>
            <div style={barStyle}>
                <button onClick={pg.prev} disabled={!pgState.canPrev}>
                    上一张
                </button>
                <button onClick={pg.next} disabled={!pgState.canNext}>
                    下一张
                </button>
                <button onClick={() => pg.goBy(2)} disabled={pgState.index >= pgState.count - 1}>
                    前进两张
                </button>
                <button onClick={() => setAuto((v) => !v)}>{auto ? "停止自动播放" : "自动播放"}</button>
                <span style={{ color: "#666", fontSize: "0.9rem" }}>
                    当前第 {pgState.index + 1} 张 / 共 {pgState.count} 张
                </span>
            </div>
            <div style={{ ...barStyle, flexWrap: "wrap" }}>
                {PHOTOS.map((src, i) => (
                    <button
                        key={src}
                        onClick={() => pg.goTo(i)}
                        style={{
                            padding: 0,
                            border: i === pgState.index ? "2px solid #1a7f37" : "2px solid transparent",
                            borderRadius: "4px",
                            background: "none",
                            cursor: "pointer",
                            lineHeight: 0,
                        }}
                    >
                        <ImageLoader
                            src={src}
                            alt=""
                            style={{ display: "block", width: 72, height: 45, objectFit: "cover", borderRadius: "2px" }}
                        />
                    </button>
                ))}
            </div>
        </>
    );
}

/** 受控方式：位置完全由外部 state 决定，可在外部按钮、跳转、同步等场景统一驱动 */
function ControlledDemo() {
    const [index, setIndex] = useState(2);

    return (
        <>
            <div style={boxStyle(560, 350)}>
                <PhotoGallery photos={PHOTOS} index={index} onIndexChange={setIndex} />
            </div>
            <div style={barStyle}>
                {PHOTOS.map((_, i) => (
                    <button key={i} onClick={() => setIndex(i)} disabled={i === index}>
                        第 {i + 1} 张
                    </button>
                ))}
            </div>
        </>
    );
}

/** 自动播放：定时触发器插槽自带环形倒计时，指针停在轮播上即暂停 */
function AutoPlayDemo() {
    return (
        <div className="demo-row">
            <div>
                <p style={labelStyle}>80 秒一张（鼠标移入即暂停，移出重新计时）</p>
                <div style={boxStyle(360, 225)}>
                    <PhotoGallery photos={PHOTOS}>
                        <PhotoGallery.Gallery />
                        <PhotoGallery.Controls />
                        <PhotoGallery.Indicator />
                        <PhotoGallery.Timer duration={80000} />
                    </PhotoGallery>
                </div>
            </div>
            <div>
                <p style={labelStyle}>只要画面 + 倒计时（1.5 秒一张，末张回到首张）</p>
                <div style={boxStyle(360, 225)}>
                    <PhotoGallery photos={PHOTOS}>
                        <PhotoGallery.Gallery />
                        <PhotoGallery.Timer duration={1500} />
                    </PhotoGallery>
                </div>
            </div>
        </div>
    );
}

/** 插槽组合：UI 由调用方拼装，取舍与顺序都随意 */
function SlotCompositionDemo() {
    return (
        <div className="demo-row">
            <div>
                <p style={labelStyle}>全套插槽（等价于默认布局）</p>
                <div style={boxStyle(360, 225)}>
                    <PhotoGallery photos={PHOTOS}>
                        <PhotoGallery.Gallery />
                        <PhotoGallery.Controls />
                        <PhotoGallery.Indicator />
                    </PhotoGallery>
                </div>
            </div>
            <div>
                <p style={labelStyle}>只要画面（无箭头、无序号，自己画）</p>
                <div style={boxStyle(360, 225)}>
                    <PhotoGallery photos={PHOTOS}>
                        <PhotoGallery.Gallery />
                    </PhotoGallery>
                </div>
            </div>
        </div>
    );
}

function PhotoGalleryDemo() {
    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>PhotoGallery 图片轮播</h2>
                <p>
                    位置逻辑由 PhotoGallery.use 承担，UI 拆成 PhotoGallery.Gallery / PhotoGallery.Controls /
                    PhotoGallery.Indicator 三个插槽；支持鼠标拖动与移动端滑动切换，不传子元素时渲染全套
                </p>
            </div>

            <DemoSection
                title="基础用法"
                description="内置左右箭头与「当前/总数」，图片可左右拖动（移动端滑动）切换；无图时显示占位"
            >
                <div className="demo-row">
                    <div style={boxStyle(560, 350)}>
                        <PhotoGallery photos={PHOTOS} />
                    </div>
                    <div className="demo-col" style={{ gap: "1rem" }}>
                        <div style={boxStyle(260, 160)}>
                            <PhotoGallery photos={ONE_PHOTO} />
                        </div>
                        <div style={boxStyle(260, 160)}>
                            <PhotoGallery photos={[]} />
                        </div>
                    </div>
                </div>
            </DemoSection>

            <DemoSection title="插槽组合" description="三个插槽任选任排；不传子元素时使用默认布局">
                <SlotCompositionDemo />
            </DemoSection>

            <DemoSection
                title="自动播放"
                description="定时触发器插槽：环形倒计时跑完切下一张，最后一张回到第一张；指针停在轮播上暂停并重置"
            >
                <AutoPlayDemo />
            </DemoSection>

            <DemoSection title="ref 命令式" description="只保留画面插槽，箭头、disabled 与位置显示全部由调用方掌握">
                <RefControlDemo />
            </DemoSection>

            <DemoSection
                title="hook 方式"
                description="PhotoGallery.use 返回 [控制器, 位置快照]，画面用 gallery 绑定同一份状态，缩略图也由它驱动"
            >
                <HookControlDemo />
            </DemoSection>

            <DemoSection title="受控 index" description="位置由外部 state 决定，适合与路由、缩略图、外部联动配合">
                <ControlledDemo />
            </DemoSection>
        </div>
    );
}

export default PhotoGalleryDemo;
