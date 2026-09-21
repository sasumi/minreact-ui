import '@/styles/components/photogallery.scss';
import { ImageLoader, SpanButton } from 'minreact-ui';
import { useState } from 'react';

/**
 * 图片轮播：多图时左右箭头切换（带滑动动画）并显示「当前/总数」，单图不显示箭头与序号，无图时显示占位
 */
export const PhotoGallery = ({ photos, className }: { photos?: string[]; className?: string }) => {
    const list = photos ?? [];
    // 用图片地址串而非数组引用判定「同一组图」：调用方每次渲染可能重建数组，按引用重置会误清切换位置
    const signature = list.join('|');
    const [state, setState] = useState({ signature, index: 0 });
    const index = state.signature === signature ? state.index : 0;
    // 用函数式更新读取最新位置：连点箭头时不会因闭包里的旧 index 而漏切换
    const goBy = (delta: number) =>
        setState((prev) => {
            const from = prev.signature === signature ? prev.index : 0;
            return { signature, index: Math.min(Math.max(from + delta, 0), list.length - 1) };
        });

    return (
        <div className={'photo-gallery' + (className ? ' ' + className : '')}>
            {list.length === 0 ? (
                <ImageLoader />
            ) : (
                <div className="photo-gallery-track" style={{ transform: `translateX(-${index * 100}%)` }}>
                    {list.map((src, i) => (
                        <div className="photo-gallery-slide" key={src + i}>
                            <ImageLoader src={src} />
                        </div>
                    ))}
                </div>
            )}
            {list.length > 1 ? (
                <>
                    <SpanButton
                        className="photo-gallery-arrow prev"
                        title="上一张"
                        disabled={index === 0}
                        debounce={false}
                        onClick={() => goBy(-1)}
                    />
                    <SpanButton
                        className="photo-gallery-arrow next"
                        title="下一张"
                        disabled={index === list.length - 1}
                        debounce={false}
                        onClick={() => goBy(1)}
                    />
                    <div className="photo-gallery-counter">
                        {index + 1}/{list.length}
                    </div>
                </>
            ) : null}
        </div>
    );
};
