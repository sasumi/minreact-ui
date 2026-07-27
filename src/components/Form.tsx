import { lockElement } from "@/utils/Dom";
import { showWarning } from "@/utils/Mix";
import { detectedPrecision, formatSize, precisionToStep } from "minutool";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

//文本类型的表单元素
export const FormTextTypes = ["text", "search", "email", "tel", "url", "color", "date", "datetime-local", "time", "week", "password"];

//<input>类型表单元素
export const FormInputTypes = [...FormTextTypes, "number", "range", "month", "checkbox", "radio"];

export const makeElement = ({ type, ...props }) => {
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
	let unlock;
	const formRef = useRef<HTMLFormElement>(null);
	return (
		<form
			ref={formRef}
			className={"form form-dir-" + dir}
			onChange={onChange}
			autoComplete="off"
			onSubmit={(e) => {
				e.preventDefault();
				if (onSubmit) {
					lockElement(formRef.current, (reset) => {
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

Form.Group = ({ title = "", children, className = "" }) => {
	return (
		<div className={"form-group " + className}>
			{title && <div className="form-group-title">{title}</div>}
			<div className="form-group-content">{children}</div>
		</div>
	);
};

Form.Item = ({ label, children, className = "" }) => {
	return (
		<div className={"form-item " + className}>
			<div className="form-item-label">{label}</div>
			<div className="form-item-content">{children}</div>
		</div>
	);
};
Form.Actions = ({ children, className = "" }) => {
	return <div className={"form-actions " + className}>{children}</div>;
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
