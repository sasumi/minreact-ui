import { useEffect, useMemo, useRef, useState } from "react";
import { Clickable } from "./Button";
import { Popover } from "./Popover";
import "./../styles/common.module.scss";
import "./../styles/components/timepicker.scss";
import { namespace } from "./../styles/namespace";

const CSS_NS = `${namespace}-time-picker`;

/** 选择维度：仅日期、仅时间、日期时间 */
export type TimePickerFormat = "date" | "time" | "datetime";

const FORMAT_DATE: TimePickerFormat = "date";
const FORMAT_TIME: TimePickerFormat = "time";
const FORMAT_DATETIME: TimePickerFormat = "datetime";

/** 固定渲染 6 行，避免不同月份的面板高度跳动 */
const WEEKS = 6;

/** 表头顺序与网格列一致，一周从周一开始 */
const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

/**
 * 年月视图固定 4 行 4 列：前 12 个格子是本年的 1-12 月，后 4 个是次年 1-4 月补位
 * 与日期网格一样定长渲染，切换年/月时面板高度不跳动
 */
const MONTH_CELLS = Array.from({ length: 16 }, (_, index) => index);

/** 面板主体当前的层级：日期 → 年月 → 年份 */
type TimePickerView = "date" | "month" | "year";

const VIEW_DATE: TimePickerView = "date";
const VIEW_MONTH: TimePickerView = "month";
const VIEW_YEAR: TimePickerView = "year";

/** 十年为一页 */
const DECADE_SIZE = 10;

/**
 * 年份视图的 16 个格子：从十年起始年往前 2 年铺开，凑满 4 行 4 列
 * 与年月视图一样定长渲染，翻页时面板高度不跳动
 */
const YEAR_CELLS = Array.from({ length: 16 }, (_, index) => index);

/** 滚轮累积多少位移才翻一页，避免触控板轻微滑动就跳月/跳年 */
const WHEEL_STEP_DELTA = 24;

/** 两次滚轮翻页的最小间隔（毫秒），避免惯性滚动连跳多页 */
const WHEEL_STEP_TIME = 200;

/** 数字补零到两位 */
const pad2 = (n: number) => String(n).padStart(2, "0");

/** 滚轮可见的选项数，取奇数保证有明确的中选项 */
const WHEEL_VISIBLE_ITEMS = 5;

/** 滚轮停止滚动多久后上报中选项（毫秒） */
const WHEEL_SETTLE_TIME = 120;

/** 拖动多少像素才算拖动，低于该值仍当作点击选项（保证点选仍然好使） */
const WHEEL_DRAG_THRESHOLD = 4;

/** 甩动的“投影时间”（毫秒）：速度乘以它换算成额外翻动的行数 */
const WHEEL_FLING_TIME = 100;

/** 甩动最多额外翻几行，避免快速一甩划过去太多 */
const WHEEL_FLING_MAX_ROWS = 3;

/** 小时滚轮选项 */
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => pad2(index));

/** 分钟滚轮选项 */
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => pad2(index));

/** 时间滚轮是 portal 出去的独立浮层，点击它不应关闭所属面板 */
const WHEEL_LAYER_SELECTOR = `.${CSS_NS}-wheel-layer`;

/** 判断两个日期是否为同一天 */
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * 解析外部传入的值
 * @param value Date 或 "YYYY-MM-DD" / "HH:mm" / "YYYY-MM-DD HH:mm" 形式的字符串
 * @returns 解析结果；无法解析或日期非法（如 2026-02-30）时返回 null
 */
const parseValue = (value?: string | Date | null): Date | null => {
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value !== "string") {
        return null;
    }

    const dateMatch = value.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    const timeMatch = value.match(/(\d{1,2}):(\d{1,2})/);
    if (!dateMatch && !timeMatch) {
        return null;
    }

    // 只给日期或只给时间时，缺失的部分沿用今天，保证拿到的始终是完整的日期时间
    const now = new Date();
    const year = dateMatch ? Number(dateMatch[1]) : now.getFullYear();
    const month = dateMatch ? Number(dateMatch[2]) - 1 : now.getMonth();
    const date = dateMatch ? Number(dateMatch[3]) : now.getDate();
    const hour = timeMatch ? Number(timeMatch[1]) : 0;
    const minute = timeMatch ? Number(timeMatch[2]) : 0;

    const parsed = new Date(year, month, date, hour, minute);
    // Date 会静默进位（2026-02-30 → 2026-03-02），反查一次以拒绝非法输入
    return parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === date && parsed.getHours() === hour && parsed.getMinutes() === minute ? parsed : null;
};

/**
 * 按 format 输出字符串
 * @param date 待格式化的日期时间
 * @param format 输出维度
 * @returns date → "YYYY-MM-DD"，time → "HH:mm"，datetime → "YYYY-MM-DD HH:mm"
 */
const formatValue = (date: Date, format: TimePickerFormat) => {
    const dateText = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    const timeText = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    if (format === FORMAT_DATE) {
        return dateText;
    }
    if (format === FORMAT_TIME) {
        return timeText;
    }
    return `${dateText} ${timeText}`;
};

/**
 * 生成以周一为起始、固定 6 周的日期网格，含相邻月份的补位日期
 * @param year 展示的年份
 * @param month 展示的月份（0-11）
 */
const buildDays = (year: number, month: number): Date[] => {
    // getDay() 以周日为 0，这里换算成以周一为 0
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    return Array.from({ length: WEEKS * 7 }, (_, index) => new Date(year, month, 1 - offset + index));
};

/**
 * 取外部 value 的语义标识，用于判断它是否发生了变化
 * Date 取时间戳、字符串取原文，这样父组件每次渲染新建 Date 也不会误重置内部状态
 */
const toValueKey = (value?: string | Date | null): string | number => (value instanceof Date ? value.getTime() : (value ?? ""));

/** 面板内部草稿：回显与编辑都基于草稿，点击确定才向外提交 */
interface TimePickerDraft {
    /** 当前选中的日期（只使用年月日） */
    selected: Date;
    /** 面板正在展示的年月 */
    year: number;
    month: number;
    /** 时间输入框的原始文本，允许编辑过程中出现空串 */
    hour: string;
    minute: string;
}

/** 由日期时间生成面板草稿 */
const toDraft = (date: Date): TimePickerDraft => ({
    selected: date,
    year: date.getFullYear(),
    month: date.getMonth(),
    hour: pad2(date.getHours()),
    minute: pad2(date.getMinutes()),
});

/**
 * 按当前视图的粒度前后切换「正在浏览的年月」，不改变已选日期
 * ˄ ˅ 与鼠标滚轮共用这段逻辑：日期视图切月，年月视图切年，年份视图切十年
 * @param draft 当前草稿
 * @param view 当前视图
 * @param step 方向，正数向后
 */
const stepViewDraft = (draft: TimePickerDraft, view: TimePickerView, step: number): TimePickerDraft => {
    if (view === VIEW_DATE) {
        const next = new Date(draft.year, draft.month + step, 1);
        return { ...draft, year: next.getFullYear(), month: next.getMonth() };
    }
    return { ...draft, year: draft.year + step * (view === VIEW_YEAR ? DECADE_SIZE : 1) };
};

/**
 * 取单个滚轮选项的高度，各选项等高，量第一个即可
 * 这里必须用 getBoundingClientRect（可能带小数），offsetHeight 会取整，
 * 行高精度误差会随行数累加（60 行最多可偏出 20 多像素，导致点最后几项时滚不到位置）
 * @param list 滚轮列表元素
 */
const getWheelItemHeight = (list: HTMLDivElement | null) => (list?.firstElementChild as HTMLElement | null)?.getBoundingClientRect().height || 1;

/**
 * 把指定下标的选项滚到中间：上下各留半格 padding，因此 scrollTop 与下标成正比
 * @param list 滚轮列表元素
 * @param index 目标下标
 * @param behavior 滚动方式
 */
const scrollToWheelIndex = (list: HTMLDivElement | null, index: number, behavior: ScrollBehavior) => {
    list?.scrollTo({ top: index * getWheelItemHeight(list), behavior });
};

/**
 * 滚轮选择列：滚动或点击选项均可选中，中选项高亮显示
 * @param label 无障碍标签
 * @param options 选项列表（等宽等高，值为零填充字符串）
 * @param value 当前选中的选项
 * @param onChange 选中项变化回调
 */
const TimePickerWheel = ({ label, options, value, onChange, className }: { label: string; options: string[]; value: string; onChange?: (value: string) => void; className?: string }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** 拖动过程的采样：按下位置、起始滚动量与最近两次采样的时间/位置（算速度用） */
    const dragRef = useRef<{ pointerId: number; startY: number; startTop: number; lastY: number; lastTime: number; velocity: number; moved: boolean } | null>(null);
    const [dragging, setDragging] = useState(false);
    /** 刚完成一次拖动，用于吞掉随之而来的 click，避免误选终止位置的选项 */
    const draggedRef = useRef(false);

    // 首次渲染定位到当前值；外部改值时跟随，但自身滚动上报的值已经就位，不重复滚动以免打断操作
    useEffect(() => {
        const list = listRef.current;
        if (!list) {
            return;
        }
        const index = Math.max(options.indexOf(value), 0);
        if (Math.round(list.scrollTop / getWheelItemHeight(list)) !== index) {
            scrollToWheelIndex(list, index, "auto");
        }
    }, [value, options]);

    // 卸载时清掉还没触发的滚动回调
    useEffect(
        () => () => {
            if (settleTimer.current) {
                clearTimeout(settleTimer.current);
            }
        },
        [],
    );

    /** 滚动停稳后上报居中的选项，并结束拖动状态以恢复 scroll-snap */
    const handleScroll = () => {
        if (settleTimer.current) {
            clearTimeout(settleTimer.current);
        }
        settleTimer.current = setTimeout(() => {
            const list = listRef.current;
            if (!list) {
                return;
            }
            setDragging(false);
            const index = Math.min(Math.max(Math.round(list.scrollTop / getWheelItemHeight(list)), 0), options.length - 1);
            if (options[index] !== value) {
                onChange?.(options[index]);
            }
        }, WHEEL_SETTLE_TIME);
    };

    /** 按下：先只记录，位移超过阈值才算拖动（阈值内保持原生点击） */
    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }
        draggedRef.current = false;
        dragRef.current = { pointerId: event.pointerId, startY: event.clientY, startTop: listRef.current?.scrollTop ?? 0, lastY: event.clientY, lastTime: event.timeStamp, velocity: 0, moved: false };
    };

    /** 移动：把纵向位移转成滚动；过程中必须关掉 scroll-snap，否则赋值会被立刻吸回最近一行 */
    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        const list = listRef.current;
        if (!drag || !list || event.pointerId !== drag.pointerId) {
            return;
        }
        const offset = event.clientY - drag.startY;
        if (!drag.moved) {
            if (Math.abs(offset) < WHEEL_DRAG_THRESHOLD) {
                return;
            }
            drag.moved = true;
            setDragging(true);
            list.setPointerCapture(event.pointerId);
        }
        const elapsed = event.timeStamp - drag.lastTime;
        if (elapsed > 0) {
            drag.velocity = (event.clientY - drag.lastY) / elapsed;
        }
        drag.lastY = event.clientY;
        drag.lastTime = event.timeStamp;
        list.scrollTop = drag.startTop - offset;
    };

    /** 松手：按甩动速度多翻几行，再平滑吸附到目标行；停稳后由 handleScroll 恢复 scroll-snap */
    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        const list = listRef.current;
        dragRef.current = null;
        if (!drag || !list || !drag.moved) {
            return;
        }
        if (list.hasPointerCapture(event.pointerId)) {
            list.releasePointerCapture(event.pointerId);
        }
        draggedRef.current = true;
        const itemHeight = getWheelItemHeight(list);
        // 速度是屏幕坐标（向下为正），scrollTop 方向相反所以要取负，再折算成行数并限制幅度
        const flingRows = (-drag.velocity * WHEEL_FLING_TIME) / itemHeight;
        const clampedRows = Math.max(Math.min(flingRows, WHEEL_FLING_MAX_ROWS), -WHEEL_FLING_MAX_ROWS);
        const index = Math.min(Math.max(Math.round(list.scrollTop / itemHeight + clampedRows), 0), options.length - 1);
        scrollToWheelIndex(list, index, "smooth");
    };

    return (
        <div
            ref={listRef}
            className={`${CSS_NS}-wheel${dragging ? ` ${CSS_NS}-wheel-dragging` : ""}${className ? " " + className : ""}`}
            style={{
                // 高度与居中留白由可见行数单点推导，CSS 只负责单行高度
                height: `calc(var(--${CSS_NS}-wheel-item-height) * ${WHEEL_VISIBLE_ITEMS})`,
                paddingBlock: `calc(var(--${CSS_NS}-wheel-item-height) * ${(WHEEL_VISIBLE_ITEMS - 1) / 2})`,
            }}
            role="listbox"
            aria-label={label}
            onScroll={handleScroll}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {options.map((option, index) => (
                <Clickable
                    key={option}
                    className={`${CSS_NS}-wheel-item${option === value ? ` ${CSS_NS}-wheel-item-active` : ""}`}
                    role="option"
                    aria-selected={option === value}
                    onClick={() => {
                        // 拖动结束后的 click 不是用户想选中的那一项，忽略掉
                        if (draggedRef.current) {
                            return;
                        }
                        scrollToWheelIndex(listRef.current, index, "smooth");
                        if (option !== value) {
                            onChange?.(option);
                        }
                    }}
                >
                    {option}
                </Clickable>
            ))}
        </div>
    );
};

export interface TimePickerPanelProps {
    /** 选择维度，默认 "datetime" */
    format?: TimePickerFormat;
    /** 当前值，支持 Date 或 "YYYY-MM-DD" / "HH:mm" / "YYYY-MM-DD HH:mm" */
    value?: string | Date | null;
    /** 点击确定时回调，参数为按 format 格式化后的字符串 */
    onChange?: (value: string) => void;
    /** 点击取消时回调，面板会同时丢弃未确认的修改 */
    onCancel?: () => void;
    /** 取消按钮文案 */
    cancelText?: string;
    /** 确定按钮文案 */
    confirmText?: string;
    /** 小时输入框的无障碍标签 */
    hourLabel?: string;
    /** 分钟输入框的无障碍标签 */
    minuteLabel?: string;
    className?: string;
}

/**
 * 日期时间面板，可单独内嵌使用，也可作为 TimePicker 的弹出内容
 */
export const TimePickerPanel = ({
    format = FORMAT_DATETIME,
    value,
    onChange,
    onCancel,
    cancelText = "取消",
    confirmText = "确定",
    hourLabel = "小时",
    minuteLabel = "分钟",
    className,
}: TimePickerPanelProps) => {
    const showDate = format !== FORMAT_TIME;
    const showTime = format !== FORMAT_DATE;

    const valueKey = toValueKey(value);
    /** 由外部 value 推导的基准值，作为草稿的初始值与回退值 */
    const baseDate = parseValue(value) ?? new Date();

    const [draftState, setDraftState] = useState<{ source: string | number; draft: TimePickerDraft }>(() => ({ source: valueKey, draft: toDraft(baseDate) }));
    // 时间滚轮的展开状态由面板自己维护
    const [wheelOpen, setWheelOpen] = useState(false);
    // 面板主体在日期 / 年月 / 年份三个层级之间切换
    const [view, setView] = useState<TimePickerView>(VIEW_DATE);
    const timeAnchorRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    /** 滚轮累积的位移，方向翻转时重新计数 */
    const wheelDelta = useRef(0);
    /** 上一次滚轮翻页的时间戳 */
    const lastWheelTime = useRef(0);

    // 外部 value 变化时在渲染期重新派生草稿，避免用 effect 同步 state 造成级联渲染
    const draft = draftState.source === valueKey ? draftState.draft : toDraft(baseDate);

    /** 更新草稿，并记录它对应的外部值 */
    const updateDraft = (updater: (prev: TimePickerDraft) => TimePickerDraft) =>
        setDraftState((prev) => ({ source: valueKey, draft: updater(prev.source === valueKey ? prev.draft : toDraft(baseDate)) }));

    /** 丢弃草稿修改，回到外部 value */
    const resetDraft = () => setDraftState({ source: valueKey, draft: toDraft(baseDate) });

    const days = useMemo(() => buildDays(draft.year, draft.month), [draft.year, draft.month]);
    const today = new Date();

    /** 通过 ˄ ˅ 或滚轮按当前视图的粒度前后切换 */
    const stepView = (step: number) => updateDraft((prev) => stepViewDraft(prev, view, step));

    /** 选中某年后回到年月视图，具体日期在选月时确定 */
    const selectYear = (year: number) => {
        updateDraft((prev) => ({ ...prev, year }));
        setView(VIEW_MONTH);
    };

    /** 选中某个月后回到日期视图，保留原来的“日”（目标月没有该日时取当月最后一天） */
    const selectMonth = (year: number, month: number) => {
        updateDraft((prev) => ({ ...prev, selected: new Date(year, month, Math.min(prev.selected.getDate(), new Date(year, month + 1, 0).getDate())), year, month }));
        setView(VIEW_DATE);
    };

    /** 选中某天，跨月补位日期同时切换展示月份 */
    const selectDay = (day: Date) => {
        updateDraft((prev) => ({ ...prev, selected: day, year: day.getFullYear(), month: day.getMonth() }));
    };

    /** 更新草稿里的小时 / 分钟 */
    const setTimeValue = (key: "hour" | "minute", next: string) => {
        updateDraft((prev) => ({ ...prev, [key]: next }));
    };

    /** 按 format 格式化草稿后向外提交 */
    const handleConfirm = () => {
        const { selected, hour, minute } = draft;
        const result = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), Number(hour) || 0, Number(minute) || 0);
        onChange?.(formatValue(result, format));
    };

    /** 放弃草稿修改 */
    const handleCancel = () => {
        resetDraft();
        onCancel?.();
    };

    const inMonthView = view === VIEW_MONTH;
    const inYearView = view === VIEW_YEAR;
    /** 年月视图与年份视图共用 draft.year 作为「正在浏览的年份」 */
    const decadeStart = Math.floor(draft.year / DECADE_SIZE) * DECADE_SIZE;
    /** 年份网格的首个年份 */
    const yearFirst = decadeStart - 2;

    const titleText = inYearView ? `${decadeStart} - ${decadeStart + DECADE_SIZE - 1}` : inMonthView ? `${draft.year}年` : `${draft.year}年${draft.month + 1}月`;
    /** 标题点击逐级下钻：日期 → 年月 → 年份 → 再回到日期，避免用户卡在深层视图 */
    const titleHint = inYearView ? "返回日期" : inMonthView ? "切换年份" : "切换年月";
    const titleNextView = inYearView ? VIEW_DATE : inMonthView ? VIEW_YEAR : VIEW_MONTH;

    /** 箭头与滚轮的无障碍提示也跟着当前粒度变 */
    const [prevHint, nextHint] = inYearView ? ["上一个十年", "下一个十年"] : inMonthView ? ["上一年", "下一年"] : ["上一月", "下一月"];

    // 鼠标滚轮翻页：React 的 onWheel 是 passive 的，无法阻止页面跟着一起滚，所以用原生监听
    useEffect(() => {
        const body = bodyRef.current;
        if (!body) {
            return;
        }
        const handleWheel = (event: WheelEvent) => {
            if (!event.deltaY) {
                return;
            }
            event.preventDefault();
            // 同方向累积位移，反向则重新计数，避免来回滚动互相抵消
            wheelDelta.current = Math.sign(event.deltaY) === Math.sign(wheelDelta.current) ? wheelDelta.current + event.deltaY : event.deltaY;

            const now = Date.now();
            if (Math.abs(wheelDelta.current) < WHEEL_STEP_DELTA || now - lastWheelTime.current < WHEEL_STEP_TIME) {
                return;
            }
            lastWheelTime.current = now;
            wheelDelta.current = 0;
            const step = event.deltaY > 0 ? 1 : -1;
            setDraftState((prev) => ({ ...prev, draft: stepViewDraft(prev.draft, view, step) }));
        };
        body.addEventListener("wheel", handleWheel, { passive: false });
        return () => body.removeEventListener("wheel", handleWheel);
    }, [view]);

    return (
        <div className={`${CSS_NS}-panel${className ? " " + className : ""}`}>
            {showDate && (
                <>
                    <div className={`${CSS_NS}-header`}>
                        <Clickable className={`${CSS_NS}-title`} title={titleHint} aria-label={titleHint} onClick={() => setView(titleNextView)}>
                            {titleText}
                        </Clickable>
                        <Clickable className={`${CSS_NS}-nav ${CSS_NS}-nav-prev`} title={prevHint} aria-label={prevHint} onClick={() => stepView(-1)} />
                        <Clickable className={`${CSS_NS}-nav ${CSS_NS}-nav-next`} title={nextHint} aria-label={nextHint} onClick={() => stepView(1)} />
                    </div>
                    <div ref={bodyRef} className={`${CSS_NS}-body`}>
                        {inYearView && (
                            <div className={`${CSS_NS}-years`}>
                                {YEAR_CELLS.map((index) => {
                                    const year = yearFirst + index;
                                    const inDecade = year >= decadeStart && year < decadeStart + DECADE_SIZE;
                                    const classes = [`${CSS_NS}-year`];
                                    if (!inDecade) {
                                        classes.push(`${CSS_NS}-year-outside`);
                                    }
                                    if (year === draft.selected.getFullYear()) {
                                        classes.push(`${CSS_NS}-year-selected`);
                                    }
                                    return (
                                        <Clickable key={year} className={classes.join(" ")} onClick={() => selectYear(year)}>
                                            {year}
                                        </Clickable>
                                    );
                                })}
                            </div>
                        )}
                        {inMonthView && (
                            <div className={`${CSS_NS}-months`}>
                                {MONTH_CELLS.map((index) => {
                                    const year = draft.year + Math.floor(index / 12);
                                    const month = index % 12;
                                    const classes = [`${CSS_NS}-month`];
                                    if (year !== draft.year) {
                                        classes.push(`${CSS_NS}-month-outside`);
                                    }
                                    if (year === draft.selected.getFullYear() && month === draft.selected.getMonth()) {
                                        classes.push(`${CSS_NS}-month-selected`);
                                    }
                                    return (
                                        <Clickable key={index} className={classes.join(" ")} onClick={() => selectMonth(year, month)}>
                                            {month + 1}月
                                        </Clickable>
                                    );
                                })}
                            </div>
                        )}
                        {view === VIEW_DATE && (
                            <>
                                <div className={`${CSS_NS}-weekdays`}>
                                    {WEEKDAY_LABELS.map((label) => (
                                        <span key={label} className={`${CSS_NS}-weekday`}>
                                            {label}
                                        </span>
                                    ))}
                                </div>
                                <div className={`${CSS_NS}-grid`}>
                                    {days.map((day) => {
                                        const classes = [`${CSS_NS}-day`];
                                        if (day.getMonth() !== draft.month) {
                                            classes.push(`${CSS_NS}-day-outside`);
                                        }
                                        if (isSameDay(day, draft.selected)) {
                                            classes.push(`${CSS_NS}-day-selected`);
                                        } else if (isSameDay(day, today)) {
                                            classes.push(`${CSS_NS}-day-today`);
                                        }
                                        return (
                                            <Clickable key={day.getTime()} className={classes.join(" ")} onClick={() => selectDay(day)}>
                                                {day.getDate()}
                                            </Clickable>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
            <div className={`${CSS_NS}-footer`}>
                {showTime && (
                    <Popover open={wheelOpen} onOpenChange={setWheelOpen}>
                        <Popover.Anchor ref={timeAnchorRef} className={`${CSS_NS}-time-anchor`}>
                            <div className={`${CSS_NS}-time`}>
                                <Clickable className={`${CSS_NS}-time-value`} aria-label={hourLabel} onClick={() => setWheelOpen(true)}>
                                    {draft.hour}
                                </Clickable>
                                <span className={`${CSS_NS}-time-separator`}>:</span>
                                <Clickable className={`${CSS_NS}-time-value`} aria-label={minuteLabel} onClick={() => setWheelOpen(true)}>
                                    {draft.minute}
                                </Clickable>
                            </div>
                        </Popover.Anchor>
                        <Popover.Content
                            className={`${CSS_NS}-wheel-layer`}
                            side="top"
                            align="start"
                            sideOffset={6}
                            // 点击时间框本身不关闭滚轮层，否则无法连续调整时和分
                            onCloseBy={(target) => !timeAnchorRef.current?.contains(target)}
                        >
                            <div className={`${CSS_NS}-wheels`}>
                                <TimePickerWheel label={hourLabel} options={HOUR_OPTIONS} value={draft.hour} onChange={(next) => setTimeValue("hour", next)} />
                                <TimePickerWheel label={minuteLabel} options={MINUTE_OPTIONS} value={draft.minute} onChange={(next) => setTimeValue("minute", next)} />
                            </div>
                        </Popover.Content>
                    </Popover>
                )}
                <div className={`${CSS_NS}-actions`}>
                    <Clickable className={`${CSS_NS}-action`} onClick={handleCancel}>
                        {cancelText}
                    </Clickable>
                    <Clickable className={`${CSS_NS}-action ${CSS_NS}-action-confirm`} onClick={handleConfirm}>
                        {confirmText}
                    </Clickable>
                </div>
            </div>
        </div>
    );
};

export interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
    /** 选择维度，默认 "datetime" */
    format?: TimePickerFormat;
    /** 当前值，支持 Date 或 "YYYY-MM-DD" / "HH:mm" / "YYYY-MM-DD HH:mm" */
    value?: string | Date | null;
    /** 值变化回调：点击确定，或输入框内文本提交成功时触发 */
    onChange?: (value: string) => void;
    /** 受控的展开状态，传入时由外部完全接管显隐 */
    open?: boolean;
    /** 展开状态变化回调 */
    onOpenChange?: (open: boolean) => void;
    /** 面板相对输入框的弹出方向 */
    side?: "top" | "right" | "bottom" | "left";
    /** 面板相对输入框的对齐方式 */
    align?: "start" | "center" | "end";
    /** 面板容器的附加类名 */
    panelClassName?: string;
    /** 取消按钮文案，透传给面板 */
    cancelText?: string;
    /** 确定按钮文案，透传给面板 */
    confirmText?: string;
}

/**
 * 日期时间选择器：可编辑的输入框 + 点击展开的选择面板
 * @param format 选择维度，决定输入框格式与面板内容
 * @param value 当前值
 * @param onChange 值变化回调
 */
export const TimePicker = ({
    format = FORMAT_DATETIME,
    value,
    onChange,
    open: controlledOpen,
    onOpenChange,
    placeholder = "请选择",
    disabled = false,
    side = "bottom",
    align = "start",
    panelClassName,
    cancelText,
    confirmText,
    className,
    ...inputProps
}: TimePickerProps) => {
    const [innerOpen, setInnerOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const isControlledOpen = controlledOpen !== undefined;
    const open = isControlledOpen ? controlledOpen : innerOpen;

    /** 统一受控 / 非受控的显隐切换 */
    const setOpen = (next: boolean) => {
        if (disabled) {
            return;
        }
        if (!isControlledOpen) {
            setInnerOpen(next);
        }
        onOpenChange?.(next);
    };

    const displayValue = useMemo(() => {
        const date = parseValue(value);
        return date ? formatValue(date, format) : "";
    }, [value, format]);

    const [textState, setTextState] = useState(() => ({ source: displayValue, text: displayValue }));

    // 允许直接编辑：编辑中的文本优先，外部 value 变化（source 不再匹配）时回落到最新显示值
    const text = textState.source === displayValue ? textState.text : displayValue;
    const setText = (next: string) => setTextState({ source: displayValue, text: next });

    /** 提交输入框文本，解析失败则回退到当前 value 的显示值 */
    const commitText = () => {
        const parsed = parseValue(text);
        if (!parsed) {
            setText(displayValue);
            return;
        }
        const formatted = formatValue(parsed, format);
        setText(formatted);
        onChange?.(formatted);
    };

    /** 关闭时归一化输入框文本，无法解析的内容回退到当前显示值 */
    const handleOpenChange = (next: boolean) => {
        if (!next) {
            const parsed = parseValue(text);
            setText(parsed ? formatValue(parsed, format) : displayValue);
        }
        setOpen(next);
    };

    const { onFocus, onBlur, onClick, onKeyDown, ...restInputProps } = inputProps;

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <Popover.Anchor ref={anchorRef} className={`${CSS_NS}-anchor`}>
                <input
                    {...restInputProps}
                    className={`${CSS_NS}-input${className ? " " + className : ""}`}
                    value={text}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    onChange={(e) => setText(e.target.value)}
                    onFocus={(e) => {
                        onFocus?.(e);
                        setOpen(true);
                    }}
                    onClick={(e) => {
                        onClick?.(e);
                        // 输入框已聚焦时不会再触发 focus，这里补一次展开
                        setOpen(true);
                    }}
                    onBlur={(e) => {
                        onBlur?.(e);
                        commitText();
                    }}
                    onKeyDown={(e) => {
                        onKeyDown?.(e);
                        if (e.key === "Enter") {
                            commitText();
                            setOpen(false);
                        }
                    }}
                />
            </Popover.Anchor>
            <Popover.Content
                className={`${CSS_NS}-popover-content`}
                side={side}
                align={align}
                sideOffset={4}
                // 点击输入框本身不应关闭面板，否则无法在展开状态下编辑文本；时间滚轮是独立浮层，同样不关闭
                onCloseBy={(target) => !anchorRef.current?.contains(target) && !target.closest(WHEEL_LAYER_SELECTOR)}
            >
                <TimePickerPanel
                    className={panelClassName}
                    format={format}
                    value={value}
                    cancelText={cancelText}
                    confirmText={confirmText}
                    onChange={(next) => {
                        setText(next);
                        onChange?.(next);
                        setOpen(false);
                    }}
                    onCancel={() => setOpen(false)}
                />
            </Popover.Content>
        </Popover>
    );
};
