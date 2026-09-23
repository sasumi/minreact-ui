import { ReactNode, useEffect, useRef, useState } from "react";
import { reactNodeToString } from "../utils";
import "./../styles/common.module.scss";
import "./../styles/components/menu.scss";
import { namespace } from "./../styles/namespace";
import { AnyButton } from "./Button";
import { Popover } from "./Popover";

//菜单项
export interface MenuItemData {
    value?: any; // 唯一标识值，通常用于选中和回调
    icon?: ReactNode; // 菜单项的图标，显示在左侧
    label: ReactNode; // 显示文本，默认使用 value
    disabled?: boolean; // 禁用状态，禁用的菜单项无法被选中
    title?: string; // 鼠标悬停时显示的提示文本，默认使用 label
    checked?: boolean | null; // null 表示不显示选中标记，true 显示选中，false 显示未选中
    extension?: ReactNode; // 扩展内容，显示在右侧
    onClick?: (item: MenuItemData) => void; // 点击回调函数，点击菜单项时触发，并传入当前菜单项数据
}

//菜单标题
export interface MenuCaption {
    type: "caption"; // 固定标记，用于区分菜单标题与菜单项
    label: ReactNode;
}

/**
 * 分隔线哨兵常量：直接放进 items 数组即表示该位置渲染一条分隔线。
 * 数组元素是对象即为菜单项，是此符号即为分隔线，无需再用 type 字段区分。
 */
export const MenuItemDivider = Symbol("menu-divider");

export type MenuEntry = MenuItemData | MenuCaption | typeof MenuItemDivider;

/** 判断菜单条目是否为分隔线（类型收窄辅助函数） */
export const isMenuDivider = (entry: MenuEntry): entry is typeof MenuItemDivider => entry === MenuItemDivider;

/** 判断菜单条目是否为菜单标题（类型收窄辅助函数） */
export const isMenuCaption = (entry: MenuEntry): entry is MenuCaption => !isMenuDivider(entry) && (entry as MenuCaption).type === "caption";

export interface MenuProps {
    items: MenuEntry[];
    value?: any;
    onChange?: (value: any) => void;
    showChecker?: boolean;
    ref?: React.Ref<HTMLDivElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    _className?: string; //默认类名，可以覆盖
    className?: string; //额外自定义类名
}

/**
 * 统一将数据转换为 MenuItemData 类型
 * @param data 字符串、对象或 MenuItemData 类型
 * @returns MenuItemData 类型
 * @throws 如果数据类型无效，则抛出错误
 */
export const MenuItemDataConvert = (data: MenuItemData | Partial<MenuItemData> | string): MenuItemData => {
    if (typeof data === "string") {
        return {
            value: data,
            label: data,
        };
    }
    if (typeof data === "object" && data !== null) {
        // label 可能是 React 节点（例如套了截断样式的 <div className="ellipsis">…），
        // 直接当作 title 会被渲染成 "[object Object]"，这里统一转成纯文本
        const labelText = reactNodeToString(data.label) || (typeof data.value === "string" ? data.value : "");
        return {
            ...data,
            value: data.value,
            label: data.label || data.value,
            title: data.title || labelText,
        } as MenuItemData;
    }
    throw new Error("MenuItemDataConvert: invalid data type");
};

const MenuImpl = ({ items, value, showChecker, _className = namespace + "-menu", className, onChange, onKeyDown, ref }: MenuProps) => {
    const [val, setVal] = useState(value);

    // 外部 value（受控选中项）变化时同步内部选中值
    useEffect(() => {
        setVal(value);
    }, [value]);

    // 只要存在任意带图标的项，就为整列预留等宽图标列，让不带图标的项文字也能对齐
    const hasIcon = items.some((item) => !isMenuDivider(item) && !isMenuCaption(item) && Boolean(item.icon));

    return (
        <div className={_className + (className ? " " + className : "")} tabIndex={-1} ref={ref} onKeyDown={onKeyDown}>
            {items.map((item, index) => {
                if (isMenuDivider(item)) {
                    return index !== 0 && !isMenuDivider(items[index - 1]) ? <MenuDivider key={index} /> : null;
                } else if (isMenuCaption(item)) {
                    return <MenuCaptionItem key={index} label={item.label} />;
                } else {
                    return (
                        <MenuItem
                            key={index}
                            {...item}
                            reserveIcon={hasIcon}
                            checked={showChecker ? item.value === val : null}
                            onClick={() => {
                                if (item.disabled) {
                                    return;
                                }
                                item.onClick?.(item);
                                setVal(item.value);
                                onChange?.(item.value);
                            }}
                        />
                    );
                }
            })}
        </div>
    );
};

const MenuDivider = () => {
    return <div className={namespace + "-menu-divider"} />;
};

const MenuCaptionItem = ({ label }: { label: ReactNode }) => {
    return <div className={namespace + "-menu-caption"}>{label}</div>;
};

const MenuItemIcon = ({ className, children }: { className?: string; children?: ReactNode }) => {
    return <span className={namespace + "-menu-item-icon" + (className ? " " + className : "")}>{children}</span>;
};

const CheckedIcon = () => {
    return <span className={namespace + "-menu-item-icon-checked"}></span>;
};

const MenuItem = (itemData: MenuItemData & { reserveIcon?: boolean }) => {
    itemData = MenuItemDataConvert(itemData);
    // 只要菜单中存在带图标的项（reserveIcon）或开启了选中标记（checked 非 null），
    // 就为每一行渲染等宽的前置图标列。没有图标/标记的行渲染空列，保证文字纵向对齐。
    const hasLeadingColumn = Boolean(itemData.reserveIcon) || itemData.checked !== null || Boolean(itemData.icon);
    return (
        <div
            className={namespace + "-menu-item"}
            title={!itemData.disabled ? itemData.title : undefined}
            aria-disabled={itemData.disabled}
            onClick={() => itemData.onClick?.(itemData)}
            tabIndex={itemData.disabled || !itemData.onClick ? -1 : 0} // 禁用或没有点击事件的项不可通过 Tab 聚焦
        >
            {/** 当前版本不支持check和icon同时出现 */}
            {hasLeadingColumn && <MenuItemIcon>{itemData.icon ? itemData.icon : itemData.checked === true && <CheckedIcon />}</MenuItemIcon>}
            <span className={namespace + "-menu-item-content"}>{itemData.label}</span>
            {itemData.extension && <span className={namespace + "-menu-item-extension"}>{itemData.extension}</span>}
        </div>
    );
};

/** 可用 Tab 聚焦的元素（与 Radix 判定 tabbable 的范围保持一致即可） */
const TABBABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** 容器内可聚焦的元素（弹层根节点自身是 tabIndex=-1，不会被算进来） */
const tabbablesIn = (container: HTMLElement | null | undefined) => (container ? Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)) : []);

/**
 * 焦点在触发器上时按 Tab / ↓：把焦点交给弹层内第一个可聚焦元素（菜单项；组合框是搜索框）。
 * 弹层未展开时 Tab 放行默认行为（继续在页面上移动），↓ 则先展开，等内容挂载后再由调用方补一次聚焦。
 */
const focusIntoLayer = (event: React.KeyboardEvent, container: HTMLElement | null, expand: () => void) => {
    if (event.key !== "ArrowDown" && (event.key !== "Tab" || event.shiftKey)) {
        return;
    }
    const first = tabbablesIn(container)[0];
    if (first) {
        event.preventDefault();
        first.focus();
    } else if (event.key === "ArrowDown") {
        event.preventDefault();
        expand();
    }
};

/**
 * ↑/↓ 在菜单内把焦点移到上/下一个可聚焦项，不循环：最后一项按 ↓、第一项按 ↑ 都不生效。
 * 焦点不在容器内（组合框的搜索框）时按 ↓ 落在第一项。
 */
const moveFocusOnArrow = (event: React.KeyboardEvent, container: HTMLElement | null) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
    }
    const items = tabbablesIn(container);
    if (!items.length) {
        return;
    }
    const current = items.indexOf(document.activeElement as HTMLElement); // 不在容器内时为 -1
    const next = Math.min(Math.max(event.key === "ArrowDown" ? current + 1 : current - 1, 0), items.length - 1);
    event.preventDefault();
    items[next].focus();
};

/**
 * 菜单首/尾的可聚焦项上再按 Tab 越界时，把焦点交还触发器并关掉弹层，让浏览器把默认的 Tab 继续走到页面上触发器之后/之前的元素。
 * 三个必须动作的原因：
 * 1. 弹层是 portal（DOM 上排在 body 末尾），且卸载被 Radix Presence 延后，所以不 inert 的话默认 Tab 会直接落回弹层里；
 * 2. Radix Popover 的 FocusScope 写死 loop，它只比较 document.activeElement 是不是内容区首/尾项，是就把焦点循环回去，
 *    所以要先（同步）把焦点移出内容区；
 * 3. tabExitRef 供 onCloseAutoFocus 跳过「把焦点拉回触发器」，否则会把浏览器已经移走的焦点又拽回来。
 */
const exitMenuOnTab = (event: React.KeyboardEvent<HTMLDivElement>, triggerRef: React.RefObject<HTMLElement | null>, tabExitRef: { current: boolean }, close: () => void) => {
    if (event.key !== "Tab" || !triggerRef.current) {
        return;
    }
    const tabbables = tabbablesIn(event.currentTarget);
    const edge = event.shiftKey ? tabbables[0] : tabbables[tabbables.length - 1];
    if (!edge || document.activeElement !== edge) {
        return;
    }
    event.currentTarget.closest<HTMLElement>("." + namespace + "-popover-content-wrap")?.setAttribute("inert", "");
    tabExitRef.current = true;
    close();
    triggerRef.current.focus();
};

export const DropdownMenu = ({
    trigger,
    items,
    value,
    disabled,
    onChange,
    showChecker,
    hideOnClick = true,
}: {
    trigger: ReactNode;
    items: MenuEntry[];
    value?: any;
    disabled?: boolean;
    showChecker?: boolean;
    hideOnClick?: boolean;
    onChange?: (val: any) => void;
}) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const tabExitRef = useRef(false);
    const pendingFocusRef = useRef(false); // 未展开时按了 ↓：展开后补一次聚焦

    /** 未展开时按 ↓：展开菜单（禁用时 Popover 恒为关闭状态） */
    const expandByKeyboard = () => {
        if (disabled) {
            return;
        }
        pendingFocusRef.current = true;
        setOpen(true);
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                if (next) tabExitRef.current = false; // 重新打开时清掉上次的 Tab 逃逸标记
                setOpen(next);
            }}
        >
            <Popover.Trigger
                ref={triggerRef}
                className={namespace + "-dropdown-menu-trigger"}
                aria-disabled={disabled}
                onKeyDown={(event) => focusIntoLayer(event, menuRef.current, expandByKeyboard)}
            >
                {trigger}
            </Popover.Trigger>
            <Popover.Content
                className={namespace + "-dropdown-menu-content"}
                onOpenAutoFocus={(event) => {
                    event.preventDefault(); // 默认不抢走触发器的焦点
                    if (pendingFocusRef.current) {
                        pendingFocusRef.current = false;
                        tabbablesIn(menuRef.current)[0]?.focus(); // 未展开时按 ↓ 展开：焦点交给第一个菜单项
                    }
                }}
                onCloseAutoFocus={(event) => {
                    if (tabExitRef.current) {
                        tabExitRef.current = false;
                        event.preventDefault();
                    }
                }}
            >
                <MenuImpl
                    ref={menuRef}
                    onKeyDown={(event) => {
                        exitMenuOnTab(event, triggerRef, tabExitRef, () => setOpen(false));
                        moveFocusOnArrow(event, event.currentTarget);
                    }}
                    items={items}
                    onChange={(val) => {
                        onChange?.(val);
                        if (hideOnClick) {
                            setOpen(false);
                        }
                    }}
                    value={value}
                    showChecker={showChecker}
                    _className={namespace + "-dropdown-menu"}
                />
            </Popover.Content>
        </Popover>
    );
};

/**
 * 组合框菜单组件，带搜索框
 * @param trigger 触发器组件
 * @param items 菜单项数组
 * @param value 当前选中值
 * @param disabled 是否禁用
 * @param showChecker 是否显示选中标记
 * @param onChange 选中值变化回调
 * @param hideOnClick 点击选项后是否关闭菜单，默认 true
 */
export const ComboboxMenu = ({
    trigger,
    items,
    value,
    disabled,
    showChecker = true,
    hideOnClick = true,
    placeholder = "搜索...",
    onChange,
}: {
    trigger: ReactNode;
    items: MenuEntry[];
    value?: any;
    disabled?: boolean;
    showChecker?: boolean;
    placeholder?: string;
    onChange?: (val: any) => void;
    hideOnClick?: boolean;
}) => {
    const [searchText, setSearchText] = useState("");
    const [open, setOpen] = useState(false);
    // Tab / ↓ 进入弹层的落点是搜索框（弹层内第一个可聚焦元素），再按 Tab 才会到菜单项
    const searchRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const tabExitRef = useRef(false);
    const pendingFocusRef = useRef(false); // 未展开时按了 ↓：展开后补一次聚焦

    /** 未展开时按 ↓：展开面板（禁用时 Popover 恒为关闭状态） */
    const expandByKeyboard = () => {
        if (disabled) {
            return;
        }
        pendingFocusRef.current = true;
        setOpen(true);
    };

    const filteredItems = items.filter((item) => {
        if (isMenuDivider(item) || isMenuCaption(item)) {
            return true; // 保留分隔线与菜单标题
        }
        return reactNodeToString(item.label).toLowerCase().includes(searchText.toLowerCase());
    });

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                if (next) tabExitRef.current = false; // 重新打开时清掉上次的 Tab 逃逸标记
                setOpen(next);
            }}
        >
            <Popover.Trigger
                ref={triggerRef}
                className={namespace + "-combobox-menu-trigger"}
                aria-disabled={disabled}
                onKeyDown={(event) => focusIntoLayer(event, searchRef.current, expandByKeyboard)}
            >
                {trigger}
            </Popover.Trigger>
            <Popover.Content
                className={namespace + "-combobox-menu-content"}
                onOpenAutoFocus={(event) => {
                    event.preventDefault(); // 默认不抢走触发器的焦点
                    if (pendingFocusRef.current) {
                        pendingFocusRef.current = false;
                        searchRef.current?.focus(); // 未展开时按 ↓ 展开：焦点交给搜索框
                    }
                }}
                onCloseAutoFocus={(event) => {
                    if (tabExitRef.current) {
                        tabExitRef.current = false;
                        event.preventDefault();
                    }
                }}
            >
                <div className={namespace + "-combobox-menu-wrap"}>
                    <input
                        ref={searchRef}
                        type="search"
                        className={namespace + "-combobox-menu-search"}
                        placeholder={placeholder}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(event) => {
                            // ↓ 从搜索框进入列表
                            if (event.key === "ArrowDown") moveFocusOnArrow(event, menuRef.current);
                        }}
                    />
                    <MenuImpl
                        ref={menuRef}
                        items={filteredItems}
                        onKeyDown={(event) => {
                            exitMenuOnTab(event, triggerRef, tabExitRef, () => setOpen(false));
                            moveFocusOnArrow(event, event.currentTarget);
                        }}
                        onChange={(val) => {
                            onChange?.(val);
                            if (hideOnClick) {
                                setSearchText(""); // 清空搜索框
                                setOpen(false); // 关闭 Popover
                            }
                        }}
                        value={value}
                        showChecker={showChecker}
                        _className={namespace + "-combobox-menu"}
                    />
                </div>
            </Popover.Content>
        </Popover>
    );
};

export const Menu = Object.assign(MenuImpl, {
    Item: MenuItem,
    Divider: MenuDivider,
    Caption: MenuCaptionItem,
    Icon: MenuItemIcon,
});

/**
 * Select 选择组件，基于 Popover 实现
 */
export const Select = ({
    items,
    name,
    triggerClassName,
    disabled = false,
    value,
    placeholder = "请选择",
    onChange,
}: {
    items: MenuEntry[];
    name?: string;
    value?: any;
    triggerClassName?: string;
    disabled?: boolean;
    placeholder?: string;
    onChange?: (value: any) => void;
}) => {
    const [val, setVal] = useState<any>(value);

    const currentItem = items.find((item): item is MenuItemData => !isMenuDivider(item) && !isMenuCaption(item) && item.value === val);

    const trigger = (
        <AnyButton disabled={disabled} className={triggerClassName}>
            {val !== undefined && val !== null ? currentItem?.label : placeholder}
            {name && <input type="hidden" name={name} value={String(val) ?? ""} />}
        </AnyButton>
    );

    return (
        <DropdownMenu
            items={items}
            value={val}
            onChange={(v) => {
                setVal(v);
                onChange?.(v);
            }}
            disabled={disabled}
            trigger={trigger}
        />
    );
};
