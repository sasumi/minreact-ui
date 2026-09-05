import React, { forwardRef, useImperativeHandle, useState, useEffect, useMemo, useCallback } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";

export interface TabItem {
    trigger: React.ReactNode | string;
    content: React.ReactNode | string;
    disabled?: boolean;
    onActive?: () => void;
}

export interface TabsProps extends Omit<React.ComponentProps<typeof RadixTabs.Root>, "value" | "defaultValue" | "onValueChange"> {
    items: TabItem[];
    defaultIndex?: number;
    index?: number;
    onIndexChange?: (index: number) => void;
    destroyOnHide?: boolean;
    className?: string;
}

export interface TabsRef {
    active: (index: number) => void;
}

const getValueByIndex = (index: number): string => {
    return `tab-${index}`;
};

const parseIndexFromValue = (value: string): number => {
    const match = value.match(/^tab-(\d+)$/);
    return match ? parseInt(match[1], 10) : -1;
};

export const Tabs = forwardRef<TabsRef, TabsProps>((props, ref) => {
    const { items, defaultIndex = 0, index: controlledIndex, onIndexChange: onControlledIndexChange, destroyOnHide = false, className, ...rest } = props;

    // 内部状态（非受控）
    const [internalIndex, setInternalIndex] = useState(() => {
        const initial = Math.min(defaultIndex, items.length - 1);
        return initial >= 0 ? initial : 0;
    });

    const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
    const safeIndex = items.length > 0 ? Math.min(Math.max(currentIndex, 0), items.length - 1) : 0;

    // 生成带 value 的 items
    const itemsWithValue = useMemo(() => {
        return items.map((item, idx) => ({
            ...item,
            value: getValueByIndex(idx),
        }));
    }, [items]);

    const currentValue = useMemo(() => {
        if (itemsWithValue.length === 0) return "";
        return getValueByIndex(safeIndex);
    }, [itemsWithValue.length, safeIndex]);

    // 值变化处理
    const handleValueChange = useCallback(
        (newValue: string) => {
            const newIndex = parseIndexFromValue(newValue);
            if (newIndex === -1 || newIndex === safeIndex) return;

            if (controlledIndex === undefined) {
                setInternalIndex(newIndex);
            }
            onControlledIndexChange?.(newIndex);

            const activeItem = itemsWithValue.find((item) => item.value === newValue);
            if (activeItem?.onActive) {
                activeItem.onActive();
            }
        },
        [controlledIndex, onControlledIndexChange, itemsWithValue, safeIndex],
    );

    // 暴露 ref 方法
    useImperativeHandle(ref, () => ({
        active: (index: number) => {
            if (items.length === 0) return;
            const target = Math.min(Math.max(index, 0), items.length - 1);
            if (target !== safeIndex) {
                handleValueChange(getValueByIndex(target));
            }
        },
    }));

    // items 变化时自动修正越界索引（非受控模式触发切换，受控模式仅警告）
    useEffect(() => {
        if (items.length === 0) return;
        if (safeIndex >= items.length) {
            if (controlledIndex === undefined) {
                handleValueChange(getValueByIndex(0));
            } else {
                console.warn("Tabs: 受控模式下 items 长度变化导致当前索引越界，请外部同步更新 index 属性。");
                // 内部强制修正 UI，但不触发外部 onChange
                setInternalIndex(0);
            }
        }
    }, [items.length, safeIndex, controlledIndex, handleValueChange]);

    if (items.length === 0) {
        return null;
    }

    return (
        <RadixTabs.Root className={className || ""} value={currentValue} onValueChange={handleValueChange} {...rest}>
            <RadixTabs.List>
                {itemsWithValue.map((item) => (
                    <RadixTabs.Trigger key={item.value} value={item.value} disabled={item.disabled}>
                        {item.trigger}
                    </RadixTabs.Trigger>
                ))}
            </RadixTabs.List>

            {itemsWithValue.map((item, idx) => (
                <RadixTabs.Content
                    key={item.value}
                    value={item.value}
                    hidden={idx !== safeIndex}
                    {...(!destroyOnHide ? { forceMount: true } : {})}
                >
                    {item.content}
                </RadixTabs.Content>
            ))}
        </RadixTabs.Root>
    );
});

Tabs.displayName = "Tabs";
