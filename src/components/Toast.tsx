import { Bounce, toast } from "react-toastify";

const tsConfig = (duration: number): any => {
    // 获取最后一个Toastify实例的containerId，用于兼容<dialog>里面的toast
    let ts = Array.from(document.querySelectorAll(".Toastify"));
    const containerId = ts[ts.length - 1]?.id;
    return {
        containerId,
        position: "top-center",
        autoClose: duration,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    };
};

type ToastId = string | number;

const MSG_ELAPSED_OFFSET = 200;

export const showError = (message: string, callback: (() => void) | null = null, duration = 4000): ToastId => {
    const toastId = toast.error(message, tsConfig(duration));
    if (callback) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

export const showInfo = (message: string, callback: (() => void) | null = null, duration = 2000): ToastId => {
    const toastId = toast.info(message, tsConfig(duration));
    if (callback) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

export const showSuccess = (message: string, callback: ((...args: any[]) => void) | null = null, duration = 1500): ToastId => {
    const toastId = toast.success(message, tsConfig(duration));
    if (callback) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

export const showWarning = (message: string, callback: (() => void) | null = null, duration = 3000): ToastId => {
    const toastId = toast.warn(message, tsConfig(duration));
    if (callback) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

export const showLoading = (message: string, callback: (() => void) | null = null, duration = 200000): ToastId => {
    const tsc = tsConfig(duration);
    const toastId = toast.loading(message, tsc);
    if (callback && duration) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

export const bindLoading = (promiseFunc: (...args: any[]) => Promise<any>, message: string, duration = 200000) => {
    return (...args: any[]) => {
        const tsc = tsConfig(duration);
        const toastId = toast.loading(message, tsc);
        return promiseFunc(...args).finally(() => {
            hideToast(toastId);
        });
    };
};

export const hideToast = (toastId: ToastId) => {
    toast.dismiss(toastId);
};
