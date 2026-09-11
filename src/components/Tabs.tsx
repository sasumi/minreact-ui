import React, { forwardRef, useImperativeHandle, useState, useEffect, useMemo, useCallback, useRef } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { Clickable } from "./Button";
import { namespace } from "./../styles/namespace";

const CSS_NS = namespace + "-tabs";

export interface TabItem {
    /** 触发器，如果提供的是 string，会额外包裹在 Clickable 中 */
    trigger: React.ReactNode | string;
    content: React.ReactNode | string;
    disabled?: boolean;
    onActive?: () => void;
}

/** render prop 回传的两个插槽组件 */
export interface TabsSlots {
    List: React.FC<{ className?: string }>;
    Panels: React.FC<{ className?: string }>;
}

export interface TabsProps extends Omit<React.ComponentProps<typeof RadixTabs.Root>, "value" | "defaultValue" | "onValueChange" | "children"> {
    items: TabItem[];
    defaultIndex?: number;
    index?: number;
    onIndexChange?: (index: number) => void;
    destroyOnHide?: boolean;
    className?: string;
    /**
     * 可选。传函数时启用 render props 模式，由外部决定 List / Panels 的摆放位置；
     * 不传时使用默认布局（List 在 Panels 上方）。
     */
    children?: (slots: TabsSlots) => React.ReactNode;
}

export interface TabsRef {
    active: (index: number) => void;
}

const getValueByIndex = (index: number): string => `tab-${index}`;

const parseIndexFromValue = (value: string): number => {
    const m = value.match(/^tab-(\d+)$/);
    return m ? parseInt(m[1], 10) : -1;
};

export const Tabs = forwardRef<TabsRef, TabsProps>((props, ref) => {
    const {
        items,
        defaultIndex = 0,
        index: controlledIndex,
        onIndexChange: onControlledIndexChange,
        destroyOnHide = false,
        className,
        children,
        ...rest
    } = props;

    // 内部状态（非受控）
    const [internalIndex, setInternalIndex] = useState(() => {
        const initial = Math.min(defaultIndex, items.length - 1);
        return initial >= 0 ? initial : 0;
    });

    const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
    const safeIndex = items.length > 0 ? Math.min(Math.max(currentIndex, 0), items.length - 1) : 0;

    // 生成带 value 的 items
    const itemsWithValue = useMemo(() => items.map((item, idx) => ({ ...item, value: getValueByIndex(idx) })), [items]);

    const currentValue = itemsWithValue.length > 0 ? getValueByIndex(safeIndex) : "";

    const handleValueChange = useCallback(
        (newValue: string) => {
            const newIndex = parseIndexFromValue(newValue);
            if (newIndex === -1 || newIndex === safeIndex) return;

            if (controlledIndex === undefined) {
                setInternalIndex(newIndex);
            }
            onControlledIndexChange?.(newIndex);

            itemsWithValue.find((item) => item.value === newValue)?.onActive?.();
        },
        [controlledIndex, onControlledIndexChange, itemsWithValue, safeIndex],
    );

    // 暴露 ref 方法
    useImperativeHandle(
        ref,
        () => ({
            active: (index: number) => {
                if (items.length === 0) return;
                const target = Math.min(Math.max(index, 0), items.length - 1);
                if (target !== safeIndex) {
                    handleValueChange(getValueByIndex(target));
                }
            },
        }),
        [items.length, safeIndex, handleValueChange],
    );

    // items 变化时自动修正越界索引
    useEffect(() => {
        if (items.length === 0) return;
        if (safeIndex >= items.length) {
            if (controlledIndex === undefined) {
                handleValueChange(getValueByIndex(0));
            } else {
                console.warn("Tabs: 受控模式下 items 长度变化导致当前索引越界，请外部同步更新 index 属性。");
                setInternalIndex(0);
            }
        }
    }, [items.length, safeIndex, controlledIndex, handleValueChange]);

    // 用 ref 存放最新的渲染数据，让 List / Panels 组件标识保持稳定，
    // 避免每次渲染都重新生成组件导致 React 卸载重建。
    const latest = useRef({ itemsWithValue, safeIndex, destroyOnHide });
    latest.current = { itemsWithValue, safeIndex, destroyOnHide };

    const slots = useMemo<TabsSlots>(() => {
        const List: React.FC<{ className?: string }> = ({ className: cls }) => {
            const { itemsWithValue } = latest.current;
            return (
                <RadixTabs.List className={cls || CSS_NS + "__triggers"}>
                    {itemsWithValue.map((item) => (
                        <RadixTabs.Trigger key={item.value} value={item.value} disabled={item.disabled} asChild>
                            <Clickable className={CSS_NS + "__trigger"}>{item.trigger}</Clickable>
                        </RadixTabs.Trigger>
                    ))}
                </RadixTabs.List>
            );
        };
        List.displayName = "Tabs.List";

        const Panels: React.FC<{ className?: string }> = ({ className: cls }) => {
            const { itemsWithValue, safeIndex, destroyOnHide } = latest.current;
            return (
                <div className={cls || CSS_NS + "__contents"}>
                    {itemsWithValue.map((item, idx) => (
                        <RadixTabs.Content
                            key={item.value}
                            className={CSS_NS + "__content"}
                            value={item.value}
                            hidden={idx !== safeIndex}
                            {...(!destroyOnHide ? { forceMount: true } : {})}
                        >
                            {item.content}
                        </RadixTabs.Content>
                    ))}
                </div>
            );
        };
        Panels.displayName = "Tabs.Panels";

        return { List, Panels };
    }, []);

    if (items.length === 0) {
        return null;
    }

    const { List, Panels } = slots;

    return (
        <RadixTabs.Root className={className || ""} value={currentValue} onValueChange={handleValueChange} {...rest}>
            {typeof children === "function" ? (
                children(slots)
            ) : (
                <>
                    <List />
                    <Panels />
                </>
            )}
        </RadixTabs.Root>
    );
});

Tabs.displayName = "Tabs";
