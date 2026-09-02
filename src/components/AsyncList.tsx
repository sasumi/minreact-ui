import { DataEmpty, DataLoading, RequestError } from "./../modules/StateWidget";
import type { AbortablePromise } from "minutool";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Pagination } from "./Pagination";

export type AsyncState<T> = {
    idle?: boolean;
    loading?: boolean;
    success?: boolean;
    data?: T;
    error?: Error;
};

export function useAsync<T>(fn: () => AbortablePromise<T>) {
    const [state, setState] = useState<AsyncState<T>>({ loading: true });

    useEffect(() => {
        setState({ loading: true });
        const promise = fn();
        promise
            .then((data) => {
                setState({ success: true, data });
            })
            .catch((error) => {
                setState({ error: error as Error });
            });

        return () => {
            promise.abort?.();
        };
    }, []);
    return state;
}

/**
 * 异步列表+分页组件，适用于需要分页的列表数据加载场景
 */
export const AsyncPagination = ({
    fetcher,
    children,
    pageSize = 10,
    loading = DataLoading,
    error = RequestError,
    empty = DataEmpty,
    keepPreviousData = false,
}: {
    fetcher: (page: number, pageSize: number) => AbortablePromise<[any[], number]> | Promise<[any[], number]>;
    children: (list: any[], isLoading: boolean) => ReactNode;
    pageSize?: number;
    keepPreviousData?: boolean;
    loading?: (...args: any[]) => ReactNode;
    error?: (error: Error) => ReactNode;
    empty?: (...args: any[]) => ReactNode;
}) => {
    const [asyncState, setAsyncState] = useState<AsyncState<any[]>>({ loading: true });
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setAsyncState({ loading: true, data: asyncState.data });
        fetcher(page, pageSize)
            .then((rsp) => {
                if (!Array.isArray(rsp) || rsp.length < 2) {
                    throw new Error("Fetcher should resolve with [list, total]");
                }
                const [list, total] = rsp;
                setAsyncState({ success: true, data: list });
                setTotal(total);
            })
            .catch((err) => {
                console.error(err);
                setAsyncState({ error: err, data: asyncState.data });
            });
    }, [page, pageSize, fetcher]);

    // 检测当前页超出范围时，自动跳转到最大页
    //  如果当前页超出范围，直接跳转到最大页（避免使用page-1导致连锁反应）
    useEffect(() => {
        if (asyncState.success && asyncState.data?.length === 0 && page > 1 && total > 0) {
            const maxPage = Math.ceil(total / pageSize);
            if (page > maxPage) {
                setPage(maxPage);
            }
        }
    }, [asyncState.success, asyncState.data, page, total, pageSize]);

    return (
        <>
            <CommonListAsyncRenderer loading={loading} error={error} empty={empty} state={asyncState} keepPreviousData={keepPreviousData}>
                {(list, isLoading) => (
                    <>
                        {children(list, isLoading)}
                        {!!total && <Pagination disabled={!!asyncState.loading} page={page} pageSize={pageSize} total={total} onChange={setPage} />}
                    </>
                )}
            </CommonListAsyncRenderer>
        </>
    );
};

/**
 * 适用于列表数据的 AsyncRenderer，提供 loading、error、empty 三种状态的默认展示组件，
 * 并且在 loading 状态下可以选择是否保留旧数据（适用于分页加载等场景）
 */
export function CommonListAsyncRenderer<T>({
    state,
    loading = DataLoading,
    error = RequestError,
    empty = DataEmpty,
    children,
    keepPreviousData = false,
}: {
    state?: AsyncState<T[]>;
    loading?: (...args: any[]) => ReactNode;
    error?: (error: Error) => ReactNode;
    empty?: (...args: any[]) => ReactNode;
    children: (data: T[], isLoading: boolean) => ReactNode;
    keepPreviousData?: boolean;
}) {
    return (
        <CommonAsyncRenderer state={state} loading={loading} error={error} keepPreviousData={keepPreviousData}>
            {(list, isLoading) => {
                if (!list || list.length === 0) {
                    return empty();
                }
                return children(list, isLoading);
            }}
        </CommonAsyncRenderer>
    );
}

/**
 * 通用的 AsyncRenderer，提供 loading 和 error 的默认展示组件，并且在 loading 状态下可以选择是否保留旧数据（适用于分页加载等场景）
 * 适用于任何异步数据，不局限于列表
 * 通过 keepPreviousData 参数控制在 loading 状态下是否保留旧数据（适用于分页加载等场景）
 */
export function CommonAsyncRenderer<T>({
    state,
    loading = DataLoading,
    error = RequestError,
    children,
    keepPreviousData = false,
}: {
    state?: AsyncState<T>;
    loading?: (...args: any[]) => ReactNode;
    error?: (error: Error) => ReactNode;
    children: (data: T | undefined, isLoading: boolean) => ReactNode;
    keepPreviousData?: boolean;
}) {
    return (
        <AsyncRenderer state={state} loading={loading} error={error} keepPreviousData={keepPreviousData}>
            {(data, isLoading) => children(data, Boolean(isLoading)) || null}
        </AsyncRenderer>
    );
}

export function AsyncRenderer<T>({
    state,
    loading,
    error,
    children,
    keepPreviousData = false,
}: {
    state?: AsyncState<T>;
    loading?: () => ReactNode;
    error?: (err: Error) => ReactNode;
    children: (data: T | undefined, isLoading: boolean) => ReactNode;
    keepPreviousData?: boolean; //是否在loading状态下仍然显示数据（适用于分页加载等场景）
}) {
    if (state?.loading) {
        if (keepPreviousData && state.data !== undefined) {
            return children(state.data, true);
        }
        return loading?.();
    }
    if (!!state?.error) {
        return error?.(state.error);
    }
    if (state?.success) {
        return children(state.data, false);
    }
    return null;
}
