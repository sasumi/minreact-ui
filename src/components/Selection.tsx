import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ============================================================
 * 底层 Checkbox —— 支持 indeterminate
 * ============================================================ */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "onChange" | "type" | "value"> {
    checked?: boolean;
    indeterminate?: boolean;
    onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
    { checked = false, indeterminate = false, onChange, ...rest },
    forwardedRef,
) {
    const innerRef = useRef<HTMLInputElement>(null);

    const setRef = useCallback(
        (node: HTMLInputElement | null) => {
            innerRef.current = node;
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
        },
        [forwardedRef],
    );

    // indeterminate 是 DOM property，React 没有对应 prop
    useEffect(() => {
        if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return <input ref={setRef} type="checkbox" checked={checked} onChange={(e) => onChange?.(e.target.checked, e)} {...rest} />;
});

/* ============================================================
 * useSelection
 * ============================================================ */
export interface UseSelectionOptions<T> {
    defaultSelected?: Iterable<T>;
    disabled?: boolean;
    pruneOnValuesChange?: boolean;
    onChange?: (values: T[], set: ReadonlySet<T>) => void;
}

export type CheckboxAllProps = Omit<CheckboxProps, "checked" | "indeterminate" | "onChange">;

export type CheckboxItemProps<T> = Omit<CheckboxProps, "checked" | "indeterminate" | "onChange" | "value"> & { value: T };

export interface UseSelectionResult<T> {
    results: T[];
    isSelected: (value: T) => boolean;
    selectAll: () => void;
    invert: () => void;
    clear: () => void;
    toggle: (value: T, checked?: boolean) => void;
    setSelected: (next: Iterable<T> | ((prev: ReadonlySet<T>) => Iterable<T>)) => void;
    CheckboxAll: React.ComponentType<CheckboxAllProps>;
    CheckboxItem: React.ComponentType<CheckboxItemProps<T>>;
}

export function useSelection<T>(values: readonly T[], options: UseSelectionOptions<T> = {}): UseSelectionResult<T> {
    const { defaultSelected, disabled = false, pruneOnValuesChange = false, onChange } = options;

    const valuesRef = useRef<readonly T[]>(values);
    valuesRef.current = values;

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const [selectedSet, setSelectedSet] = useState<ReadonlySet<T>>(() => new Set<T>(defaultSelected ?? []));
    const selectedRef = useRef<ReadonlySet<T>>(selectedSet);
    selectedRef.current = selectedSet;

    /* ---------- 核心更新器 ---------- */
    const update = useCallback((nextOrUpdater: Iterable<T> | ((prev: ReadonlySet<T>) => Iterable<T>)) => {
        setSelectedSet((prev) => {
            const next: Iterable<T> = typeof nextOrUpdater === "function" ? (nextOrUpdater as (prev: ReadonlySet<T>) => Iterable<T>)(prev) : nextOrUpdater;
            const nextSet: ReadonlySet<T> = next instanceof Set ? next : new Set<T>(next);
            return nextSet === prev ? prev : nextSet;
        });
    }, []);

    /* ---------- values 变化时可选裁剪 ---------- */
    useEffect(() => {
        if (!pruneOnValuesChange) return;
        setSelectedSet((prev) => {
            const valid = new Set(values);
            let changed = false;
            const next = new Set<T>();
            for (const v of prev) {
                if (valid.has(v)) next.add(v);
                else changed = true;
            }
            return changed ? next : prev;
        });
    }, [values, pruneOnValuesChange]);

    /* ---------- 选中集变化时通知外部（跳过首帧） ---------- */
    const lastEmittedRef = useRef<ReadonlySet<T>>(selectedSet);
    useEffect(() => {
        if (lastEmittedRef.current === selectedSet) return;
        lastEmittedRef.current = selectedSet;
        onChangeRef.current?.(Array.from(selectedSet), selectedSet);
    }, [selectedSet]);

    /* ---------- 操作 ---------- */
    const selectAll = useCallback(() => {
        update(new Set(valuesRef.current));
    }, [update]);

    const clear = useCallback(() => {
        update(new Set<T>());
    }, [update]);

    // 反选：仅翻转当前 values 范围，其他页面已选项保留
    const invert = useCallback(() => {
        update((prev) => {
            const list = valuesRef.current;
            const listSet = new Set(list);
            const next = new Set<T>();
            for (const v of prev) if (!listSet.has(v)) next.add(v);
            for (const v of list) if (!prev.has(v)) next.add(v);
            return next;
        });
    }, [update]);

    const toggle = useCallback(
        (value: T, checked?: boolean) => {
            update((prev) => {
                const shouldSelect = checked ?? !prev.has(value);
                if (shouldSelect === prev.has(value)) return prev;
                const next = new Set(prev);
                if (shouldSelect) next.add(value);
                else next.delete(value);
                return next;
            });
        },
        [update],
    );

    const isSelected = useCallback((value: T) => selectedRef.current.has(value), []);

    /* ---------- 派生：results 引用稳定 ---------- */
    const results = useMemo(() => Array.from(selectedSet), [selectedSet]);

    /* ---------- 记忆化组件 ---------- */
    const { CheckboxAll, CheckboxItem } = useMemo(() => {
        const CheckboxAll: React.FC<CheckboxAllProps> = (props) => {
            const cur = selectedRef.current;
            const list = valuesRef.current;

            let count = 0;
            for (const v of list) if (cur.has(v)) count++;

            const all = list.length > 0 && count === list.length;
            const partial = count > 0 && count < list.length;

            return (
                <Checkbox
                    {...props}
                    checked={all}
                    indeterminate={partial}
                    disabled={props.disabled ?? disabled}
                    aria-label={props["aria-label"] ?? "全选"}
                    onChange={(checked) => {
                        // 全选 → 覆盖为全部；半选 → 也补全为全部；取消 → 清空
                        update(checked ? new Set(list) : new Set<T>());
                    }}
                />
            );
        };

        const CheckboxItem: React.FC<CheckboxItemProps<T>> = ({ value, ...rest }) => {
            const checked = selectedRef.current.has(value);
            return (
                <Checkbox
                    {...rest}
                    checked={checked}
                    disabled={rest.disabled ?? disabled}
                    aria-label={rest["aria-label"] ?? `选择 ${String(value)}`}
                    onChange={(next) => {
                        update((prev) => {
                            if (next === prev.has(value)) return prev;
                            const s = new Set(prev);
                            if (next) s.add(value);
                            else s.delete(value);
                            return s;
                        });
                    }}
                />
            );
        };

        return { CheckboxAll, CheckboxItem };
    }, [update, disabled]);

    return {
        results,
        isSelected,
        selectAll,
        invert,
        clear,
        toggle,
        setSelected: update,
        CheckboxAll,
        CheckboxItem,
    };
}
