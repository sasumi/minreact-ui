import { SpanButton } from "./Button";
import { Dialog } from "./Dialog";
import "./../styles/components/inlinetexteditor.scss";
import { namespace } from "./../styles/namespace";

const CSS_NS = `${namespace}-inline-text-editor`;

/**
 * 轻量化的文本编辑器组件，支持单行和多行文本编辑。
 */
export const InlineTextEditor = ({
    value,
    title,
    multiline = false,
    required = false,
    readonly = false,
    saveHandler,
}: {
    value: string;
    title?: string;
    readonly?: boolean;
    multiline?: boolean;
    required?: boolean;
    saveHandler: (value: string) => Promise<void>;
}) => {
    if (readonly) {
        return <>{value}</>;
    }

    return (
        <SpanButton
            className={`${CSS_NS} ${multiline ? CSS_NS + "-multiline" : ""}`}
            onClick={() => {
                Dialog.prompt({
                    title: title || "编辑",
                    defaultValue: value,
                    type: multiline ? "textarea" : "text",
                    onSubmit: (value) => {
                        return new Promise(async (resolve, reject) => {
                            if (required && !value) {
                                reject(new Error("内容不能为空"));
                                return;
                            }
                            saveHandler(value).then(resolve, reject);
                        });
                    },
                });
            }}
        >
            {value}
        </SpanButton>
    );
};
