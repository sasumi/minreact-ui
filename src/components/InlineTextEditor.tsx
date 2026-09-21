import { Clickable, NormalButton, SpanButton, SubmitButton } from "./Button";
import "./../styles/components/inlinetexteditor.scss";
import { namespace } from "./../styles/namespace";
import { useEffect, useRef, useState } from "react";

const CSS_NS = `${namespace}-inline-text-editor`;
const STATE_IDLE = "idle";
const STATE_EDITING = "editing";
const STATE_SAVING = "saving";

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
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // 外部 value 变化时同步显示值（仅在未编辑时），避免父组件切换数据后仍显示旧值
    useEffect(() => {
        if (state === STATE_IDLE) {
            setVal(value);
        }
    }, [value]);

    if (readonly) {
        return (
            <span className={`${CSS_NS}-text`} aria-readonly="true">
                {value}
            </span>
        );
    }

    return (
        <div className={`${CSS_NS}`} data-state={state}>
            {state === STATE_IDLE && (
                <span
                    tabIndex={0}
                    className={`${CSS_NS}-text ${!val ? `${CSS_NS}-text-placeholder` : ""}`}
                    onClick={() => {
                        if (readonly) {
                            return;
                        }
                        setState(STATE_EDITING);
                    }}
                >
                    {val || placeholder}
                </span>
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
                    />
                    <SubmitButton
                        disabled={state === STATE_SAVING}
                        title="保存"
                        onClick={(event) => {
                            // 提交统一走 requestSubmit()（校验不通过时不会派发 submit 事件），
                            // preventDefault 是为了避免按钮自身再原生提交一次
                            event.preventDefault();
                            if (state === STATE_SAVING) {
                                return;
                            }
                            formRef.current?.requestSubmit();
                        }}
                    />
                    <NormalButton disabled={state === STATE_SAVING} data-variant="cancel" title="取消" onClick={() => setState(STATE_IDLE)} />
                </form>
            )}
        </div>
    );
};
