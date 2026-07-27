import { NormalButton, SpanButton } from "@/components/Button";
import "@/styles/components/com.dialog.scss";
import { bindPanelMove, lockElement, mountReactNode } from "@/utils/Dom";
import { focusFirstElement, showWarning } from "@/utils/Mix.js";
import { JSX, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { FormTextTypes, makeElement } from "@/components/Form";
import { useTranslation } from "react-i18next";
import { extractTitle } from "@/types/ComponentMeta";
import { prettyTimeDuration } from "@/utils/Time";
import { calcRemainingMSecs } from "minutool";

/**
 * 对话框大小
 */
export const DIALOG_SIZE_SMALL = "24em";
export const DIALOG_SIZE_NORMAL = "32em";
export const DIALOG_SIZE_LARGE = "60em";
export const DIALOG_SIZE_XLARGE = "80em";
export const DIALOG_SIZE_FULL = "90vw";

/**
 * 通用自定义内容弹窗，支持传入 React 组件
 * @param {Object} options
 * @param {String} options.title
 * @param {ReactNode} options.contentNode  直接传入 React 组件
 * @param {String} options.className
 * @param {Number|String} options.maxHeight
 * @param {Boolean} options.topCloseButton
 * @param {Boolean} options.autoFocus
 * @param {Function} options.onClose
 */
export const showCustomDialog = ({
	title,
	contentNode,
	className = "",
	autoFocus = false,
	maxHeight = null,
	maxWidth = null,
	topCloseButton = true,
	onClose = null,
	size = null,
	maxSize = null,
}) => {
	const DialogWrapper = () => {
		const [open, setOpen] = useState(true);
		useEffect(() => {
			!open && setTimeout(destroy, 0);
		}, [open]);
		return (
			<Dialog
				open={open}
				setOpen={setOpen}
				maxHeight={maxHeight}
				maxWidth={maxWidth}
				title={title}
				className={className}
				autoFocus={autoFocus}
				topCloseButton={topCloseButton}
				size={size}
				maxSize={maxSize}
			>
				{contentNode}
			</Dialog>
		);
	};
	const unmount = mountReactNode(<DialogWrapper />);
	function destroy() {
		unmount();
		onClose && onClose();
	}
	return destroy;
};

/**
 * 对话框组件
 * @param {Object} props
 * @param {String} props.title
 * @param {String} props.children
 * @param {String} props.maxHeight
 * @param {Boolean} props.open
 * @param {Boolean} props.autoFocus
 * @param {Function} props.setOpen
 * @param {String} props.className = ""
 * @param {Function} props.onCloseClick = null
 * @param {Object} props.ref = null
 * @param {Boolean} props.topCloseButton = true
 * @returns
 */
export default function Dialog({
	title: propTitle = undefined as any,
	children,
	open,
	setOpen,
	ref = null,
	className = "",
	maxHeight = null,
	maxWidth = null,
	onCloseClick = null,
	topCloseButton = true,
	autoFocus = false,
	size = null,
	maxSize = null,
	modal = true,
	moveable = false,
}: {
	title?: any;
	children?: any;
	open: any;
	setOpen: any;
	ref?: any;
	className?: string;
	maxHeight?: any;
	maxWidth?: any;
	onCloseClick?: any;
	topCloseButton?: boolean;
	autoFocus?: boolean;
	size?: string;
	maxSize?: string;
	modal?: boolean;
	moveable?: boolean;
}) {
	// 优先使用传入的 title，否则尝试从 children 中提取
	const title = propTitle ?? extractTitle(children);

	// ⚠️ All hooks must be called before any conditional returns
	const dlgRef = useRef(null);
	const cleanupRef = useRef<(() => void) | null>(null);

	// 使用 callback ref 确保在 DOM 挂载时立即执行
	const handleDialogRef = (element: HTMLDialogElement | null) => {
		dlgRef.current = element;

		// 清理旧的事件监听器
		if (cleanupRef.current) {
			cleanupRef.current();
			cleanupRef.current = null;
		}

		// 设置外部 ref
		if (ref) {
			ref.current = element;
		}

		// 绑定拖动事件
		if (moveable && element) {
			cleanupRef.current = bindPanelMove(element);
		}
	};

	useEffect(() => {
		if (open) {
			dlgRef.current?.show(); // 显示对话框
			autoFocus && focusFirstElement(dlgRef.current);
		} else {
			dlgRef.current?.close(); // 隐藏对话框
		}
	}, [open]);

	// 组件卸载时清理
	useEffect(() => {
		return () => {
			if (cleanupRef.current) {
				cleanupRef.current();
			}
		};
	}, []);

	if (!open) {
		return null;
	}

	return ReactDOM.createPortal(
		open ? (
			<>
				<div className="dialog-wrap" data-modal={modal} data-moveable={moveable}>
					<div className="dialog-masker"></div>
					<dialog
						className={`paper-dialog ` + className}
						style={{ width: size, maxWidth: maxSize }}
						ref={handleDialogRef}
						onClose={() => {
							setOpen(false);
						}}
					>
						{topCloseButton && (
							<SpanButton
								className="icon-button dlg-close-btn"
								onClick={() => {
									if (onCloseClick && !onCloseClick()) {
										return;
									}
									setOpen(false);
								}}
							></SpanButton>
						)}
						{title && <h2 className="dlg-title">{title}</h2>}
						<div className="dlg-ctn" style={{ maxHeight: maxHeight, maxWidth: maxWidth }}>
							{children}
						</div>
					</dialog>
				</div>
			</>
		) : (
			<></>
		),
		document.body,
	);
}

export const showDialogComponent = (DialogComponent, props = {}) => {
	// 使用对象引用确保闭包能正确访问 unmount 函数
	const unmountRef = { current: null as (() => void) | null };

	const DialogWrapper = () => {
		const [open, setOpen] = useState(true);

		useEffect(() => {
			if (!open) {
				setTimeout(() => {
					if (unmountRef.current) {
						unmountRef.current();
					}
				}, 0);
			}
		}, [open]);

		return <DialogComponent open={open} setOpen={setOpen} {...props} />;
	};

	unmountRef.current = mountReactNode(<DialogWrapper />);
	return unmountRef.current;
};

export const showDialog = ({
	title = undefined as any,
	content = "" as any,
	className = "",
	maxHeight = null,
	size = null,
	maxSize = null,
	topCloseButton = true,
	onClose = undefined as any,
	autoFocus = false,
}) => {
	const div = document.createElement("div");
	document.body.appendChild(div);
	const root = createRoot(div);

	function destroy() {
		root.unmount();
		div.remove();
		onClose && onClose();
	}

	function DialogWrapper() {
		const [open, setOpen] = useState(true);
		useEffect(() => {
			!open && setTimeout(destroy, 0);
		}, [open]);

		return (
			<Dialog
				open={open}
				setOpen={setOpen}
				maxHeight={maxHeight}
				title={title}
				children={content}
				autoFocus={autoFocus}
				className={className}
				topCloseButton={topCloseButton}
				size={size}
				maxSize={maxSize}
			/>
		);
	}

	root.render(<DialogWrapper />);
	return destroy;
};

export const showImgPreview = (src) => {
	let closer;
	closer = showDialog({
		title: "",
		content: (
			<img
				src={src}
				onClick={() => {
					closer();
				}}
			/>
		),
		className: "paper-dialog-img-preview",
	});
};

/**
 * 显示提示信息
 * @param {String} label
 * @param {Object} props1
 * @returns
 */
export const prompt = (
	label = "",
	{ defaultValue = "" as string | number, required = false, onSubmitPromise = null, type = "text", step = null, trimText = false, size = DIALOG_SIZE_SMALL },
) => {
	return new Promise<string | void>((resolve, reject) => {
		let closer = null;
		function DialogWrap() {
			const formRef = useRef<HTMLFormElement>(null);
			const elRef = useRef<HTMLInputElement>(null);
			const { t } = useTranslation(["common"]);
			const [inputValue, setInputValue] = useState(defaultValue);
			const doSubmit = () => {
				let val = elRef.current!.value;

				if (FormTextTypes.includes(type) && trimText) {
					val = val.trim();
					if (required && !val) {
						showWarning(t("common:pleaseEnterContent"));
						elRef.current!.focus();
						return;
					}
				}
				if (onSubmitPromise) {
					lockElement(formRef.current, (reset) => {
						onSubmitPromise(val)
							.then(() => {
								resolve(val);
								closer();
							})
							.finally(reset);
					});
				} else {
					resolve(val);
					closer();
				}
			};
			useEffect(() => {
				if (elRef.current) {
					elRef.current.focus();
				}
			}, [elRef.current]);
			return (
				<form
					ref={formRef}
					onSubmit={(e) => {
						e.preventDefault();
						doSubmit();
						return false;
					}}
				>
					<div className="pt-label">{label || t("common:pleaseEnterContent")}</div>
					<div className="pt-inputs">
						{makeElement({ type, defaultValue, step, required, ref: elRef, onChange: (e) => setInputValue(e.target.value) })}
					</div>
					<div className="dlg-buttons">
						<SpanButton
							className="button"
							disabled={required && FormTextTypes.includes(type) && !String(inputValue).trim().length}
							onClick={() => {
								formRef.current!.requestSubmit();
							}}
						>
							{t("common:confirm")}
						</SpanButton>
						{!required && (
							<SpanButton
								className="button button-outlined"
								onClick={() => {
									closer();
									reject && reject();
								}}
							>
								{t("common:cancel")}
							</SpanButton>
						)}
					</div>
				</form>
			);
		}
		closer = showDialog({ content: <DialogWrap />, className: "paper-dialog-prompt", autoFocus: true, topCloseButton: !required, size });
	});
};

/**
 * 显示进度对话框
 * @returns 返回控制对象 { update, isAborted, close }
 * update(progress, total) - 更新进度，progress 是当前进度值，total 是总进度值（可选）
 * isAborted() - 检查是否已中止，返回布尔值
 * close() - 关闭对话框
 */
export const showProgressDialog = ({
	title,
	message,
	canAbort = true,
	abortText = "",
	onAbort = null,
	autoClose = true,
}: {
	title: string;
	message?: string;
	canAbort?: boolean;
	abortText?: string;
	onAbort?: (() => void) | null;
	autoClose?: boolean;
}): {
	update: (p: number, totalValue?: number) => void;
	isAborted: () => boolean;
	close: () => void;
} => {
	let closer: (() => void) | undefined;
	// 使用对象引用来保存组件内部的函数，以便外部可以调用
	const apiRef = {
		updater: null as ((p: number, totalValue?: number) => void) | null,
		isAborted: null as (() => boolean) | null,
	};

	const ProgressDialog = () => {
		const { t } = useTranslation(["common"]);
		const [aborted, setAborted] = useState(false);
		const abortController = useRef(new AbortController()).current;
		const [progressValue, setProgressValue] = useState(0);
		const [totalValue, setTotalValue] = useState(100);
		const startTime = useRef(Date.now()).current;

		const isAborted = () => {
			return aborted || abortController.signal.aborted;
		};

		const updater = (p, newTotal) => {
			if (p !== undefined) {
				setProgressValue(p);
			}
			if (newTotal !== undefined) {
				setTotalValue(newTotal);
			}
		};

		// 在组件挂载时，将函数引用保存到 apiRef 中
		useEffect(() => {
			apiRef.updater = updater;
			apiRef.isAborted = isAborted;
		}, []);

		// 自动关闭：当进度达到总数时
		useEffect(() => {
			if (autoClose && progressValue >= totalValue && totalValue > 0) {
				// 延迟到下一个事件循环，避免在渲染期间卸载
				setTimeout(() => closer?.(), 0);
			}
		}, [progressValue, totalValue]);

		const remainSecs = Math.floor(calcRemainingMSecs(progressValue, totalValue, startTime) / 1000);
		const remainSecsStr = remainSecs === Infinity ? "" : t("common:remainTimes", { timeStr: prettyTimeDuration(remainSecs, t) });

		// 计算进度百分比
		return (
			<Dialog
				open={true}
				setOpen={(open) => {
					if (!open) {
						closer?.();
					}
				}}
				onCloseClick={() => {
					if (window.confirm(abortText || t("common:confirmAbort"))) {
						abortController.abort();
						setAborted(true);
						closer?.();
						onAbort && onAbort();
					}
				}}
				className="paper-dialog-progress"
				topCloseButton={canAbort}
				autoFocus={false}
			>
				<div className="pd-title">{title}</div>
				{!!message && <div className="pd-message" dangerouslySetInnerHTML={{ __html: message }} />}
				<progress value={progressValue} max={totalValue} className="progress" />
				<div className="pd-status">
					<span className="p-tm">{remainSecsStr}</span>
					<span className="p-txt">
						{progressValue}/{totalValue}
						{totalValue > 0 && ` (${Math.floor((progressValue / totalValue) * 100)}%)`}
					</span>
				</div>
			</Dialog>
		);
	};
	closer = showDialogComponent(ProgressDialog);

	// 返回对象结构，更加语义化
	return {
		update: (p, totalValue) => apiRef.updater?.(p, totalValue),
		isAborted: () => apiRef.isAborted?.() ?? false,
		close: () => closer?.(),
	};
};

// Confirm 对话框内部组件
const ConfirmContent = ({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) => {
	const { t } = useTranslation(["common"]);
	return (
		<>
			<div className="cf-title">{title}</div>
			<div className="cf-content" dangerouslySetInnerHTML={{ __html: message }}></div>
			<div className="dlg-buttons">
				<SpanButton className="button" onClick={onConfirm}>
					{t("common:confirm")}
				</SpanButton>
				<SpanButton className="button button-outlined" onClick={onCancel}>
					{t("common:cancel")}
				</SpanButton>
			</div>
		</>
	);
};

export const confirm = (title = "", message = "") => {
	return new Promise<void>((resolve, reject) => {
		let closer = null;
		const content = (
			<ConfirmContent
				title={title}
				message={message}
				onConfirm={() => {
					closer();
					resolve();
				}}
				onCancel={() => {
					closer();
					reject && reject();
				}}
			/>
		);
		closer = showDialog({ content, className: "paper-dialog-confirm", topCloseButton: false, size: DIALOG_SIZE_SMALL });
	});
};

// Alert 对话框内部组件
const AlertContent = ({
	title,
	message,
	option = {},
	onClose,
}: {
	title: string;
	message: string | JSX.Element;
	option?: { html?: string; closeButtonTitle?: string; size?: string };
	onClose: () => void;
}) => {
	const { t } = useTranslation(["common"]);
	return (
		<>
			<div className="al-title">{title}</div>
			{!!option.html && <div className="al-content" dangerouslySetInnerHTML={{ __html: option.html }}></div>}
			{!option.html && <div className="al-content">{message}</div>}
			<div className="dlg-buttons">
				<NormalButton onClick={onClose}>{option.closeButtonTitle || t("common:close")}</NormalButton>
			</div>
		</>
	);
};

export const alert = (
	title = "",
	message: string | JSX.Element = "",
	option: { closeButtonTitle?: string; size?: string; maxSize?: string } = {
		closeButtonTitle: "",
		size: DIALOG_SIZE_SMALL,
		maxSize: null,
	},
) => {
	return new Promise<void>((resolve, reject) => {
		let closer = null;
		const content = (
			<AlertContent
				title={title}
				message={message}
				option={option}
				onClose={() => {
					closer();
					resolve();
				}}
			/>
		);
		closer = showDialog({ content, className: "paper-dialog-alert", topCloseButton: false, size: option.size, maxSize: option.maxSize });
	});
};
