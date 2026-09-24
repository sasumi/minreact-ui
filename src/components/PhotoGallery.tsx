import './../styles/components/photogallery.scss';
import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import type { HTMLAttributes, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { namespace } from './../styles/namespace';
import { SpanButton } from './Button';
import { ImageLoader } from './Image';
import { bindDomEvent } from 'minutool';

const CSS_NS = namespace + '-photo-gallery';

/** 把位置夹在 [0, max] 内；无图（max < 0）时固定为 0 */
const clampIndex = (value: number, max: number) => (max < 0 ? 0 : Math.min(Math.max(value, 0), max));

/** 插槽公共属性：可透传任意 div 属性；className 会与组件类名合并，同名事件先走组件内部再走传入的 */
export type PhotoGallerySlotProps = HTMLAttributes<HTMLDivElement>;

/** 拼接类名：组件自身的类名在前，调用方传入的在后 */
const joinClass = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base);

/** 位置快照：随渲染更新，渲染期读它 */
export interface PhotoGalleryState {
    /** 当前第几张（0 起） */
    index: number;
    count: number;
    canPrev: boolean;
    canNext: boolean;
}

/** 命令式控制器：方法引用稳定、可长期持有，数据字段为最近一次渲染的值 */
export interface PhotoGalleryApi {
    readonly photos: readonly string[];
    readonly index: number;
    readonly count: number;
    readonly canPrev: boolean;
    readonly canNext: boolean;
    prev: () => void;
    next: () => void;
    /** 跳到指定下标（越界自动夹紧） */
    goTo: (index: number) => void;
    /** 相对当前位置偏移 */
    goBy: (delta: number) => void;
}

export interface UsePhotoGalleryOptions {
    defaultIndex?: number; //非受控初始下标，默认 0
    index?: number; //受控下标；传入后内部不再自持位置，需配合 onIndexChange 回写
    onIndexChange?: (index: number) => void;
}

/**
 * 位置与切换逻辑（不含渲染），通过 `PhotoGallery.use` 对外暴露：
 *
 * ```tsx
 * const [pg, pgState] = PhotoGallery.use(photos);
 * <PhotoGallery gallery={pg}><PhotoGallery.Gallery /></PhotoGallery>
 * <button onClick={pg.prev} disabled={!pgState.canPrev}>上一张</button>
 * ```
 */
const usePhotoGallery = (
    photos?: readonly string[],
    options: UsePhotoGalleryOptions = {},
): [PhotoGalleryApi, PhotoGalleryState] => {
    const { defaultIndex = 0, index: controlledIndex, onIndexChange } = options;
    const list = photos ?? [];
    const count = list.length;
    // 用图片地址串而非数组引用判定「同一组图」：调用方每次渲染可能重建数组，按引用重置会误清切换位置
    const signature = list.join('|');
    const [state, setState] = useState(() => ({ signature, index: clampIndex(defaultIndex, count - 1) }));
    // 渲染期直接派生：换图组回到首张、图数变少时夹紧，避免用 effect 回写 state
    const derived = state.signature === signature ? state.index : 0;
    const controlled = controlledIndex !== undefined;
    const index = clampIndex(controlled ? controlledIndex : derived, count - 1);

    // 方法要读到最新数据、引用又要稳定，故经 ref 中转；每次 commit 后用渲染结果归位权威位置
    const latest = useRef({ photos: list, signature, count, index, controlled, onIndexChange });
    useLayoutEffect(() => {
        latest.current = { photos: list, signature, count, index, controlled, onIndexChange };
    });

    const goTo = useCallback((target: number) => {
        const now = latest.current;
        const next = clampIndex(Math.round(target), now.count - 1);
        if (next === now.index) return;
        now.index = next; // 乐观前移：同一次批处理里的连续调用也不会漏切换
        if (!now.controlled) setState({ signature: now.signature, index: next });
        now.onIndexChange?.(next);
    }, []);

    const goBy = useCallback((delta: number) => goTo(latest.current.index + delta), [goTo]);

    return [
        {
            // 数据字段取自本次渲染，方法引用稳定
            photos: list,
            index,
            count,
            canPrev: index > 0,
            canNext: index < count - 1,
            prev: () => goBy(-1),
            next: () => goBy(1),
            goTo,
            goBy,
        },
        { index, count, canPrev: index > 0, canNext: index < count - 1 },
    ];
};

/** 插槽上下文：控制器 + 「指针停在轮播上」的暂停标记 */
const PhotoGalleryContext = createContext<{ api: PhotoGalleryApi; paused: boolean } | null>(null);

const useGalleryContext = () => {
    const ctx = useContext(PhotoGalleryContext);
    if (!ctx) throw new Error('PhotoGallery 的插槽组件必须放在 <PhotoGallery> 内部');
    return ctx;
};

/** 只关心位置的插槽用这个 */
const useGalleryApi = () => useGalleryContext().api;

/** 拖动超过容器宽度的该比例即翻页 */
const SWIPE_RATIO = 0.15;
/** 甩动速度（px/ms）超过该值时，即使距离不够也翻页 */
const FLING_SPEED = 0.4;
/** 首/末张继续拖动时的阻尼，给出「拖不动」的手感而不是硬停 */
const EDGE_RESISTANCE = 0.35;

export interface PhotoGalleryGalleryProps extends PhotoGallerySlotProps {
    /** 是否允许鼠标拖动 / 触摸滑动切换，默认 false */
    draggable?: boolean;
}

/** 画面插槽：横向滑动切换；开启 draggable 后支持鼠标拖动与触摸滑动，无图时显示占位 */
const GallerySlot = ({
    draggable = false,
    className,
    style,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    ...rest
}: PhotoGalleryGalleryProps) => {
    const { photos, index, count, canPrev, canNext, goTo } = useGalleryApi();
    // 只有开了拖动且有多张图时才算「可拖」：光标/手势样式由下面的修饰类控制，免得不可拖时还显示 grab
    const canDrag = draggable && count > 1;
    // progress 为拖动进度（容器宽度的倍数，向前切换为正），与 index 一起参与 transform
    const [progress, setProgress] = useState(0);
    const [dragging, setDragging] = useState(false);
    const dragRef = useRef<{ id: number; x: number; time: number; width: number } | null>(null);

    const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        const width = e.currentTarget.getBoundingClientRect().width;
        if (count < 2 || e.button !== 0 || !width || dragRef.current) return;
        dragRef.current = { id: e.pointerId, x: e.clientX, time: e.timeStamp, width };
        e.currentTarget.setPointerCapture(e.pointerId); // 指针移出元素后仍能收到 move/up
        setDragging(true);
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.id !== e.pointerId) return;
        let dx = e.clientX - drag.x;
        // 到头了继续拖：位移打折，松手后自然回弹
        if ((dx < 0 && !canNext) || (dx > 0 && !canPrev)) dx *= EDGE_RESISTANCE;
        setProgress(-dx / drag.width);
    };

    /** 松手：够远或够快就翻页，否则回弹；两者都靠收起拖动态让 transition 接管动画 */
    const settle = (e: ReactPointerEvent<HTMLDivElement>, flung: boolean) => {
        const drag = dragRef.current;
        if (!drag || drag.id !== e.pointerId) return;
        dragRef.current = null;
        const dx = e.clientX - drag.x;
        const step = dx < 0 ? 1 : -1;
        if ((Math.abs(dx) > drag.width * SWIPE_RATIO || flung) && (step > 0 ? canNext : canPrev)) goTo(index + step);
        setProgress(0);
        setDragging(false);
    };

    const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        const speed = drag ? Math.abs(e.clientX - drag.x) / Math.max(1, e.timeStamp - drag.time) : 0;
        settle(e, speed > FLING_SPEED);
    };

    const handlePointerCancel = (e: ReactPointerEvent<HTMLDivElement>) => settle(e, false);

    // 不开拖动时完全不接管指针事件，调用方传入的原样透传
    // 开着拖动时先跑组件自身的处理，再跑调用方传入的
    const pointerProps = draggable
        ? {
              onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
                  handlePointerDown(e);
                  onPointerDown?.(e);
              },
              onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
                  handlePointerMove(e);
                  onPointerMove?.(e);
              },
              onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => {
                  handlePointerUp(e);
                  onPointerUp?.(e);
              },
              onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => {
                  handlePointerCancel(e);
                  onPointerCancel?.(e);
              },
          }
        : { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };

    // 无图时只剩占位（ImageLoader 渲染的是 img，承载不了 div 属性）
    if (count === 0) return <ImageLoader />;
    return (
        <div
            {...rest}
            {...pointerProps}
            className={
                joinClass(`${CSS_NS}-track`, className) +
                (canDrag ? ` ${CSS_NS}-track-draggable` : '') +
                (dragging ? ` ${CSS_NS}-track-dragging` : '')
            }
            // 内部 transform 是滑动的根，放在后面盖掉调用方传入的同名内联样式
            // 负号写在插值里：首张向右拖时 index + progress 为负，`-${...}` 会得到非法的 `--13.98%`
            style={{ ...style, transform: `translateX(${-(index + progress) * 100}%)` }}
        >
            {photos.map((src, i) => (
                <div className={`${CSS_NS}-slide`} key={src + i}>
                    <ImageLoader src={src} draggable={false} />
                </div>
            ))}
        </div>
    );
};

export type PhotoGalleryControlsProps = PhotoGallerySlotProps;

/**
 * 左右箭头插槽：无图时不渲染
 */
const ControlsSlot = ({ className, ...rest }: PhotoGalleryControlsProps) => {
    const { count, canPrev, canNext, prev, next } = useGalleryApi();
    if (count === 0) return null;
    return (
        // 容器只为承载调用方属性：箭头是绝对定位，容器本身不参与布局
        <div className={joinClass(`${CSS_NS}-controls`, className)} {...rest}>
            <SpanButton
                className={`${CSS_NS}-arrow prev`}
                title="上一张"
                aria-label="上一张"
                disabled={!canPrev}
                debounce={false}
                onClick={prev}
            />
            <SpanButton
                className={`${CSS_NS}-arrow next`}
                title="下一张"
                aria-label="下一张"
                disabled={!canNext}
                debounce={false}
                onClick={next}
            />
        </div>
    );
};

/** 活动缩略图带入视野时与视口边缘保留的留白（px） */
const NAV_SCROLL_PADDING = 4;

/**
 * 相邻缩略图的跨度（项宽 + 间距）：取相邻两项左偏移之差，比只看宽度更贴近真实步长；
 * 只有一项时退化为该项宽度，量不到就返回 0（调用方按 0 跳过滚动）
 */
const navStride = (viewport: HTMLElement | null) => {
    const track = viewport?.firstElementChild;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!first) return 0;
    const second = track?.children[1] as HTMLElement | undefined;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
};

/** 拖动超过该距离（px）才算拖动，否则当成点击，免得轻微的位移把切图抢掉 */
const NAV_DRAG_THRESHOLD = 4;

export interface PhotoGalleryNavProps extends PhotoGallerySlotProps {
    /** 箭头一次滚动的缩略图个数；默认按视口内能完整放下的个数（至少 1 张） */
    step?: number;
    /** 缩略图条是否可鼠标 / 触摸左右拖动，默认 true（没溢出时自动不接管） */
    draggable?: boolean;
}

/**
 * 缩略图导航插槽：列出全部图片，点击缩略图即切到该张；当前图高亮并随位置变化自动滚入视野
 * （箭头、拖动、自动播放引起的切换同样生效），与 Controls / Indicator 共用同一份位置，天生联动。
 * 缩略图条可鼠标 / 触摸左右拖动（draggable，默认开），两侧箭头按 step 张滚动一屏，
 * 滚到两头时对应箭头禁用；无图时不渲染。
 */
const NavSlot = ({ step, draggable = true, className, ...rest }: PhotoGalleryNavProps) => {
    const { photos, index, count, goTo } = useGalleryApi();
    const viewportRef = useRef<HTMLDivElement>(null);
    // null = 还没量过：先不锁死箭头，量出来（下一帧）再修正，避免先灰后亮
    const [scrollable, setScrollable] = useState<{ prev: boolean; next: boolean } | null>(null);
    // 开了 draggable 就先当可拖（量出「确实没溢出」之前不预先否定，免得首帧光标闪一下）；
    // 真按下时还会用 DOM 复核一次，所以能不能拖不依赖这里的测量时机
    const canDrag = draggable && (!scrollable || scrollable.prev || scrollable.next);
    const [dragging, setDragging] = useState(false);
    const dragRef = useRef<{ id: number; x: number; scrollLeft: number } | null>(null);
    // 拖动后跟着的那次 click 要吃掉，否则松手会顺手切到别的图
    const draggedRef = useRef(false);

    const syncScrollable = useCallback(() => {
        const el = viewportRef.current;
        if (!el) return;
        const next = { prev: el.scrollLeft > 1, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 };
        // 拖动/滚动会高频回调，状态没变就不要 setState（否则整条缩略图白重渲染一遍）
        setScrollable((prev) => (prev && prev.prev === next.prev && prev.next === next.next ? prev : next));
    }, []);

    // 视口尺寸与图片张数（会改 scrollWidth）都会影响可滚性；ResizeObserver 注册时会先回调一次
    useLayoutEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const observer = new ResizeObserver(syncScrollable);
        observer.observe(el);
        return () => observer.disconnect();
    }, [syncScrollable, count]);

    // 位置变化时把活动缩略图带入视野；已经看得见就不动，免得手动滚动被拽回去
    useEffect(() => {
        const el = viewportRef.current;
        const item = el?.firstElementChild?.children[index] as HTMLElement | undefined;
        if (!el || !item) return;
        const view = el.getBoundingClientRect();
        const rect = item.getBoundingClientRect();
        if (rect.left < view.left + NAV_SCROLL_PADDING) {
            el.scrollBy({ left: rect.left - view.left - NAV_SCROLL_PADDING, behavior: 'smooth' });
        } else if (rect.right > view.right - NAV_SCROLL_PADDING) {
            el.scrollBy({ left: rect.right - view.right + NAV_SCROLL_PADDING, behavior: 'smooth' });
        }
    }, [index]);

    // 拖动期间在 window 上收 move/up：指针移出缩略图条也不会丢，且不用抢指针捕获
    // （一旦 setPointerCapture，click 会被改写目标到捕获元素，点击缩略图切图就失效了）
    useEffect(() => {
        if (!dragging) return;
        const onMove = (e: PointerEvent) => {
            const drag = dragRef.current;
            const el = viewportRef.current;
            if (!drag || !el || drag.id !== e.pointerId) return;
            const dx = e.clientX - drag.x;
            // 还没过阈值：继续当作点击，不抢掉缩略图的切图动作
            if (!draggedRef.current && Math.abs(dx) < NAV_DRAG_THRESHOLD) return;
            draggedRef.current = true;
            // 直接改 scrollLeft：滚动位置与 pointer 位移同源，不需要额外的 transform
            el.scrollLeft = drag.scrollLeft - dx;
        };
        const onEnd = (e: PointerEvent) => {
            if (dragRef.current?.id !== e.pointerId) return;
            dragRef.current = null;
            setDragging(false);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onEnd);
        window.addEventListener('pointercancel', onEnd);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onEnd);
            window.removeEventListener('pointercancel', onEnd);
        };
    }, [dragging]);

    const scrollByStep = (direction: 1 | -1) => {
        const el = viewportRef.current;
        const stride = navStride(el);
        if (!el || !stride) return;
        const pages = step ?? Math.max(1, Math.floor(el.clientWidth / stride));
        el.scrollBy({ left: direction * pages * stride, behavior: 'smooth' });
    };

    const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        const el = viewportRef.current;
        // 没开拖动、非左键、已有拖动进行中、或者压根没溢出：不接管，交给默认行为（点击切图等）
        if (!draggable || !el || e.button !== 0 || dragRef.current) return;
        if (el.scrollWidth <= el.clientWidth + 1) return;
        dragRef.current = { id: e.pointerId, x: e.clientX, scrollLeft: el.scrollLeft };
        draggedRef.current = false;
        setDragging(true); // 后续 move/up 由上方的 window 监听接手
    };

    const handleClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!draggedRef.current) return;
        draggedRef.current = false;
        e.preventDefault();
        e.stopPropagation();
    };

    if (count === 0) return null;
    return (
        // 容器就是贴底的那一条：箭头固定在两端，中间留给可滚动的缩略图条
        <div className={joinClass(`${CSS_NS}-nav`, className)} {...rest}>
            <SpanButton
                className={`${CSS_NS}-nav-arrow prev`}
                title="向前浏览缩略图"
                aria-label="向前浏览缩略图"
                disabled={scrollable?.prev === false}
                debounce={false}
                onClick={() => scrollByStep(-1)}
            />
            <div
                className={
                    `${CSS_NS}-nav-viewport` +
                    (canDrag ? ` ${CSS_NS}-nav-draggable` : '') +
                    (dragging ? ` ${CSS_NS}-nav-dragging` : '')
                }
                ref={viewportRef}
                onScroll={syncScrollable}
                onPointerDown={handlePointerDown}
                onClickCapture={handleClickCapture}
            >
                <div className={`${CSS_NS}-nav-track`}>
                    {photos.map((src, i) => (
                        <SpanButton
                            key={src + i}
                            className={`${CSS_NS}-nav-item`}
                            title={`第 ${i + 1} 张`}
                            aria-label={`切换到第 ${i + 1} 张`}
                            aria-current={i === index}
                            debounce={false}
                            onClick={() => goTo(i)}
                        >
                            <ImageLoader src={src} alt="" draggable={false} />
                        </SpanButton>
                    ))}
                </div>
            </div>
            <SpanButton
                className={`${CSS_NS}-nav-arrow next`}
                title="向后浏览缩略图"
                aria-label="向后浏览缩略图"
                disabled={scrollable?.next === false}
                debounce={false}
                onClick={() => scrollByStep(1)}
            />
        </div>
    );
};

export type PhotoGalleryIndicatorProps = PhotoGallerySlotProps;

/**
 * 「当前/总数」插槽：无图时不渲染
 */
const IndicatorSlot = ({ className, ...rest }: PhotoGalleryIndicatorProps) => {
    const { count, index } = useGalleryApi();
    if (count === 0) return null;
    return (
        <div className={joinClass(`${CSS_NS}-counter`, className)} {...rest}>
            {index + 1}/{count}
        </div>
    );
};

/** 自动播放默认间隔（ms） */
const AUTO_PLAY_DURATION = 4000;

export interface PhotoGalleryTimerProps extends PhotoGallerySlotProps {
    /** 切换间隔（ms），同时决定环形倒计时的时长 */
    duration?: number;
}

/**
 * 定时触发器插槽：环形倒计时（12 点顺时针长满一圈后收空）跑完就切下一张，最后一张切回第一张；渲染该插槽即开启自动播放。
 * 指针移入轮播（root）时暂停并重置倒计时，移出后重新计时。
 */
const TimerSlot = ({ duration = AUTO_PLAY_DURATION, className, ...rest }: PhotoGalleryTimerProps) => {
    const { api, paused } = useGalleryContext();
    const { count, index, goTo } = api;

    useEffect(() => {
        if (paused || count < 2) return;
        const timer = window.setTimeout(() => goTo((index + 1) % count), duration);
        return () => window.clearTimeout(timer);
    }, [paused, count, index, duration, goTo]);

    if (count < 2) return null;
    return (
        // key 带 index / paused：切图或恢复播放时重新起画，与上面的定时器同一个起点
        <div
            key={`${index}-${paused}`}
            {...rest}
            className={joinClass(`${CSS_NS}-timer`, className) + (paused ? ` ${CSS_NS}-timer-paused` : '')}
            aria-hidden="true"
        >
            <svg viewBox="0 0 16 16">
                <circle className={`${CSS_NS}-timer-track`} cx="8" cy="8" r="7" />
                <circle className={`${CSS_NS}-timer-bar`} cx="8" cy="8" r="7" style={{ animationDuration: `${duration}ms` }} />
            </svg>
        </div>
    );
};

export interface PhotoGalleryProps extends UsePhotoGalleryOptions {
    photos?: readonly string[];
    /** 复用 PhotoGallery.use 的控制器，与外部按钮共享同一份状态（此时图集以控制器为准） */
    gallery?: PhotoGalleryApi;
    /** 默认布局的画面是否允许拖动切换（同 Gallery 插槽的 draggable），默认 false */
    draggable?: boolean;
    /**
     * 自定义内部结构，插槽可任意取舍、任意顺序摆放：
     * `<PhotoGallery.Gallery />` 画面、`<PhotoGallery.Controls />` 箭头、`<PhotoGallery.Indicator />` 序号、
     * `<PhotoGallery.Nav />` 缩略图导航、`<PhotoGallery.Timer />` 自动播放倒计时。
     * 不传时渲染前三者组成的默认布局（不含 Nav / Timer）。
     */
    children?: ReactNode;
    className?: string;
}

/** 挂载在组件上的插槽与 hook */
type PhotoGalleryStatics = {
    Gallery: (props: PhotoGalleryGalleryProps) => ReactNode;
    Controls: (props: PhotoGalleryControlsProps) => ReactNode;
    Indicator: (props: PhotoGalleryIndicatorProps) => ReactNode;
    Nav: (props: PhotoGalleryNavProps) => ReactNode;
    Timer: (props: PhotoGalleryTimerProps) => ReactNode;
    use: typeof usePhotoGallery;
};

const PhotoGalleryRoot = forwardRef<PhotoGalleryApi, PhotoGalleryProps>(function PhotoGallery(
    { photos, gallery, className, children, draggable = false, defaultIndex, index, onIndexChange },
    ref,
) {
    const [internal] = usePhotoGallery(photos, { defaultIndex, index, onIndexChange });
    const api = gallery ?? internal;
    useImperativeHandle(ref, () => api, [api]);
    // 指针停在轮播上就暂停自动播放（悬停箭头、拖动中也算）
    const [paused, setPaused] = useState(false);
    return (
        <PhotoGalleryContext.Provider value={{ api, paused }}>
            <div
                className={joinClass(CSS_NS, className)}
                onPointerEnter={() => setPaused(true)}
                onPointerLeave={() => setPaused(false)}
            >
                {children ?? (
                    <>
                        <GallerySlot draggable={draggable} />
                        <ControlsSlot />
                        <IndicatorSlot />
                    </>
                )}
            </div>
        </PhotoGalleryContext.Provider>
    );
});

/**
 * 图片轮播：位置逻辑见 `PhotoGallery.use`，UI 拆成可按需取舍的插槽，不传子元素时渲染全套 UI。
 * 位置可完全受控（index + onIndexChange），也可通过 ref 或外部 gallery 控制器命令式驱动：
 *
 * ```tsx
 * const pg = useRef<PhotoGalleryApi>(null);
 * <PhotoGallery photos={photos} ref={pg} onIndexChange={setIndex}>
 *     <PhotoGallery.Gallery />
 *     <PhotoGallery.Controls />
 *     <PhotoGallery.Indicator />
 *     <PhotoGallery.Nav />
 *     <PhotoGallery.Timer duration={5000} />
 * </PhotoGallery>
 * <button onClick={() => pg.current?.prev()} disabled={pg.current?.index === 0}>上一张</button>
 * ```
 */
export const PhotoGallery = PhotoGalleryRoot as typeof PhotoGalleryRoot & PhotoGalleryStatics;
PhotoGallery.Gallery = GallerySlot;
PhotoGallery.Controls = ControlsSlot;
PhotoGallery.Indicator = IndicatorSlot;
PhotoGallery.Nav = NavSlot;
PhotoGallery.Timer = TimerSlot;
PhotoGallery.use = usePhotoGallery;
