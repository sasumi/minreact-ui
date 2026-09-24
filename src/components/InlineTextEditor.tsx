import { Clickable, NormalButton, SpanButton, SubmitButton } from "./Button";
import "./../styles/components/inlinetexteditor.scss";
import { namespace } from "./../styles/namespace";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icons } from "react-toastify";

const CSS_NS = `${namespace}-inline-text-editor`;
const STATE_IDLE = "idle";
const STATE_EDITING = "editing";
const STATE_SAVING = "saving";

/**
 * 省略号宽度：按元素当前字体实测，用于把按钮放到被截断那一行的「…」之后
 */
const measureEllipsisWidth = (el: HTMLElement): number => {
    const style = getComputedStyle(el);
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return 0;
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return context.measureText("…").width;
};

/**
 * 轻量化的文本编辑器组件，支持单行和多行文本编辑。
 */
export const InlineTextEditor = ({
    value,
    multiline = false,
    required = false,
    readonly = false,
    maxlength,
    placeholder,
    saveHandler,
}: {
    value: string;
    title?: string;
    placeholder?: string;
    readonly?: boolean;
    multiline?: boolean;
    required?: boolean;
    maxlength?: number;
    saveHandler: (value: string) => Promise<void>;
}) => {
    const [val, setVal] = useState(value);
    const [state, setState] = useState<typeof STATE_IDLE | typeof STATE_EDITING | typeof STATE_SAVING>(STATE_IDLE);
    const rootRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const editButtonRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // 外部 value 变化时同步显示值（仅在未编辑时），避免父组件切换数据后仍显示旧值
    useEffect(() => {
        if (state === STATE_IDLE) {
            setVal(value);
        }
    }, [value]);

    // 编辑按钮贴到文本最后一行的末尾：文本换行 / 被省略时不再悬在整块右侧
    useLayoutEffect(() => {
        const alignEditButton = () => {
            const text = textRef.current;
            const button = editButtonRef.current;
            if (!text || !button) return;
            button.style.transform = "";
            const box = text.getBoundingClientRect();
            if (box.width <= 0 || box.height <= 0) return;
            const range = document.createRange();
            range.selectNodeContents(text);
            const lines = Array.from(range.getClientRects()).filter(
                (rect) => rect.width > 0 && rect.height > 0 && rect.top >= box.top - 0.5 && rect.top < box.bottom - 0.5
            );
            const lastLine = lines[lines.length - 1];
            if (!lastLine) return;
            // 被省略时省略号画在最后一个可见字符之后，要把它让出来
            const truncated = text.scrollHeight > text.clientHeight + 1;
            const end = lastLine.right + (truncated ? measureEllipsisWidth(text) : 0);
            const shift = end - box.right;
            if (shift < -0.5) button.style.transform = `translateX(${shift}px)`;
        };

        alignEditButton();
        const observer = new ResizeObserver(alignEditButton);
        if (textRef.current) observer.observe(textRef.current);
        if (rootRef.current) observer.observe(rootRef.current);
        window.addEventListener("resize", alignEditButton);
        void document.fonts?.ready.then(alignEditButton).catch(() => undefined);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", alignEditButton);
        };
    }, [val, state, placeholder]);

    if (readonly) {
        return (
            <span className={`${CSS_NS}-text`} aria-readonly="true">
                {value}
            </span>
        );
    }

    return (
        <div
            ref={rootRef}
            className={`${CSS_NS}`}
            data-state={state}
            onClick={() => {
                if (readonly || state !== STATE_IDLE) {
                    return;
                }
                setState(STATE_EDITING);
            }}
            title={state === STATE_IDLE && !readonly ? "编辑" : undefined}
        >
            {state === STATE_IDLE && (
                <>
                    <span
                        ref={textRef}
                        tabIndex={0}
                        className={`${CSS_NS}-text ${!val ? `${CSS_NS}-text-placeholder` : ""}`}
                    >
                        {val || placeholder}
                    </span>
                    <span ref={editButtonRef} className={`${CSS_NS}-edit-button`}></span>
                </>
            )}

            {[STATE_EDITING, STATE_SAVING].includes(state) && (
                <form
                    ref={formRef}
                    className={`${CSS_NS}-form`}
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (state === STATE_SAVING || !inputRef.current) {
                            return;
                        }
                        setState(STATE_SAVING);
                        saveHandler(inputRef.current?.value).then(() => {
                            setState(STATE_IDLE);
                            setVal(inputRef.current?.value || "");
                        });
                    }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        defaultValue={val}
                        placeholder={placeholder}
                        required={required}
                        autoFocus={true}
                        readOnly={state === STATE_SAVING}
                        maxLength={maxlength}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                setState(STATE_IDLE);
                            }
                        }}
                    />
                    <SubmitButton
                        disabled={state === STATE_SAVING}
                        title="保存"
                        onClick={(event) => {
                            event.preventDefault();
                            if (state === STATE_SAVING) {
                                return;
                            }
                            formRef.current?.requestSubmit();
                        }}
                    />
                    <NormalButton
                        disabled={state === STATE_SAVING}
                        data-variant="cancel"
                        title="取消"
                        onClick={(e) => {
                            e.preventDefault();
                            setState(STATE_IDLE);
                        }}
                    />
                </form>
            )}
        </div>
    );
};
