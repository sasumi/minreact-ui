import type { ToastOptions } from "react-toastify";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { mountReactNode } from "../utils";

let ensureContainer = () => {
    mountReactNode(<ToastContainer position="top-center" theme="light" hideProgressBar closeOnClick pauseOnHover draggable transition={Bounce} />);
    ensureContainer = () => {};
};

const tsConfig = (duration: number): ToastOptions => {
    return {
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

const showError = (message: string, callback: (() => void) | null = null, duration = 4000): ToastId => {
    ensureContainer();
    const toastId = toast.error(message, tsConfig(duration));
    if (callback) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

const showInfo = (message: string, callback: (() => void) | null = null, duration = 3000): ToastId => {
    ensureContainer();
    const toastId = toast.info(message, tsConfig(duration));
    if (callback) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

const showSuccess = (message: string, callback: ((...args: any[]) => void) | null = null, duration = 1500): ToastId => {
    ensureContainer();
    const toastId = toast.success(message, tsConfig(duration));
    if (callback) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

const showWarning = (message: string, callback: (() => void) | null = null, duration = 3000): ToastId => {
    ensureContainer();
    const toastId = toast.warn(message, tsConfig(duration));
    if (callback) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

const showLoading = (message: string, callback: (() => void) | null = null, duration = 200000): ToastId => {
    ensureContainer();
    const tsc = tsConfig(duration);
    const toastId = toast.loading(message, tsc);
    if (callback && duration) {
        setTimeout(callback, duration - MSG_ELAPSED_OFFSET);
    }
    return toastId;
};

const bindLoading = (promiseFunc: (...args: any[]) => Promise<any>, message: string, duration = 200000) => {
    return (...args: any[]) => {
        ensureContainer();
        const tsc = tsConfig(duration);
        const toastId = toast.loading(message, tsc);
        return promiseFunc(...args).finally(() => {
            hideToast(toastId);
        });
    };
};

const hideToast = (toastId: ToastId) => {
    toast.dismiss(toastId);
};

export const Toast = {
    showError,
    showInfo,
    showSuccess,
    showWarning,
    showLoading,
    bindLoading,
    hideToast,
};
