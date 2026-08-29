import { SpanButton } from "./Button";
import "./../styles/components/inlinetexteditor.scss";
import { namespace } from "./../styles/namespace";
import { useRef, useState } from "react";

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
    saveHandler,
}: {
    value: string;
    title?: string;
    readonly?: boolean;
    multiline?: boolean;
    required?: boolean;
    maxlength?: number;
    saveHandler: (value: string) => Promise<void>;
}) => {
    if (readonly) {
        return (
            <span className={`${CSS_NS}-text`} aria-readonly="true">
                {value}
            </span>
        );
    }

    const [val, setVal] = useState(value);
    const [state, setState] = useState<typeof STATE_IDLE | typeof STATE_EDITING | typeof STATE_SAVING>(STATE_IDLE);
    const inputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <div className={`${CSS_NS}`} data-state={state}>
            {state === STATE_IDLE && (
                <span
                    tabIndex={0}
                    className={`${CSS_NS}-text`}
                    onClick={() => {
                        if (readonly) {
                            return;
                        }
                        setState(STATE_EDITING);
                    }}
                >
                    {val}
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
                        required={required}
                        autoFocus={true}
                        readOnly={state === STATE_SAVING}
                        maxLength={maxlength}
                    />
                    <SpanButton
                        type="submit"
                        aria-label="submit"
                        disabled={state === STATE_SAVING}
                        title="保存"
                        onClick={() => {
                            if (state === STATE_SAVING) {
                                return;
                            }
                            setState(STATE_SAVING);
                            formRef.current?.requestSubmit();
                        }}
                    />
                    <SpanButton disabled={state === STATE_SAVING} aria-label="cancel" title="取消" onClick={() => setState(STATE_IDLE)} />
                </form>
            )}
        </div>
    );
};
