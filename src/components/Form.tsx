import { detectedPrecision, formatSize, lockElementInteraction, precisionToStep } from "minutool";
import { showWarning } from "@/components/Toast";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import "@/styles/components/form.scss";
import styleDefines from "@/styles/common.module.scss";
const CSS_NS = styleDefines.namespace;

//文本类型的表单元素
export const FormTextTypes = ["text", "search", "email", "tel", "url", "color", "date", "datetime-local", "time", "week", "password"];

//<input>类型表单元素
export const FormInputTypes = [...FormTextTypes, "number", "range", "month", "checkbox", "radio"];

/**
 * 构建表单元素
 * @param param0
 * @returns
 */
export const makeElement = ({ type, ...props }: { type: string; [key: string]: any }) => {
    if (FormInputTypes.includes(type)) {
        if (type === "number" && !props.step && props.defaultValue) {
            props.step = precisionToStep(detectedPrecision(props.defaultValue));
        }
        return <input type={type} {...props} />;
    }
    if (type === "select") {
        return <select {...props} />;
    }
    if (type === "textarea") {
        return <textarea {...props} />;
    }
    throw "type not support";
};

export const FORM_DIR_AUTO = "auto";
export const FORM_DIR_LANDSCAPE = "landscape";
export const FORM_DIR_PORTRAIT = "portrait";

export interface FormInterface {
    children: React.ReactNode;
    unlock?: () => void;
    onChange?: (e: React.FormEvent<HTMLFormElement>) => void;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>, data: Record<string, any>, unlock?: () => void) => void;
    dir?: string;
}

export const Form = ({ children, onChange, onSubmit, dir = FORM_DIR_AUTO }: FormInterface) => {
    let unlock: (() => void) | undefined;
    const formRef = useRef<HTMLFormElement>(null);
    return (
        <form
            ref={formRef}
            className={CSS_NS + "-form"}
            data-dir={dir}
            onChange={onChange}
            autoComplete="off"
            onSubmit={(e) => {
                e.preventDefault();
                if (onSubmit) {
                    formRef.current &&
                        lockElementInteraction(formRef.current, (reset) => {
                            unlock = reset;
                        });
                    onSubmit(e, Object.fromEntries(new FormData(formRef.current!)), unlock);
                }
            }}
        >
            {children}
        </form>
    );
};

/**
 * Form.Group 组件用于创建表单分组，包含标题和内容区域。
 * @param param0 - 组件属性，包括标题、子元素和自定义类名。
 * @returns React 元素，表示一个表单分组。
 */
Form.Group = ({ title = "", children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) => {
    return (
        <div className={CSS_NS + "-form-group " + className}>
            {title && <div className={CSS_NS + "-form-group-title"}>{title}</div>}
            <div className={CSS_NS + "-form-group-content"}>{children}</div>
        </div>
    );
};

Form.Item = ({ label, children, className = "" }: { label?: string; children: React.ReactNode; className?: string }) => {
    return (
        <div className={CSS_NS + "-form-item " + className}>
            <div className={CSS_NS + "-form-item-label"}>{label}</div>
            <div className={CSS_NS + "-form-item-content"}>{children}</div>
        </div>
    );
};
Form.Actions = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return <div className={CSS_NS + "-form-actions " + className}>{children}</div>;
};

export const FileInput = ({
    onChange,
    maxSize = Infinity,
    minSize = 0,
    multiple = false,
    accept = "*",
}: {
    onChange: (file: File) => void;
    maxSize?: number;
    minSize?: number;
    multiple?: boolean;
    accept?: string;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation(["file"]);
    return (
        <>
            <input
                type="file"
                multiple={multiple}
                accept={accept}
                ref={inputRef}
                style={{ display: "none" }}
                onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                        if (file.size > maxSize) {
                            showWarning(t("file:fileTooLarge", { maxSize: formatSize(maxSize, "KB") + "KB" }));
                            return;
                        }
                        if (file.size < minSize) {
                            showWarning(t("file:fileTooSmall", { minSize: formatSize(minSize, "KB") + "KB" }));
                            return;
                        }
                        onChange(file);
                        (e.target as HTMLInputElement).value = "";
                    }
                }}
            />
        </>
    );
};
