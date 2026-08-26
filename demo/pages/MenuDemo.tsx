import { ComboboxMenu, DropdownMenu, Menu, MenuDivider, MenuItemData } from "../../src/components/Menu";
import { useState } from "react";

function MenuDemo() {
    const TestMenuItems = [
        { type: "item", label: "菜单项1", value: "item1", title: "这个是菜单项1" } as MenuItemData,
        { type: "item", label: "菜单项2", value: "item2", title: "这个是菜单项2" } as MenuItemData,
        { type: "divider" } as MenuDivider,
        { type: "item", label: "菜单项3", value: "item3", title: "这个是菜单项3" } as MenuItemData,
        { type: "item", disabled: true, label: "菜单项4", value: "item4", title: "这个是菜单项4" } as MenuItemData,
        { type: "divider" } as MenuDivider,
        { type: "item", label: "菜单项5", value: "item5", title: "这个是菜单项5" } as MenuItemData,
        { type: "item", label: "菜单项6", value: "item6", title: "这个是菜单项6" } as MenuItemData,
        { type: "item", label: "菜单项7", value: "item7", title: "这个是菜单项7" } as MenuItemData,
        { type: "item", label: "菜单项8", value: "item8", title: "这个是菜单项8" } as MenuItemData,
        { type: "item", label: "菜单项9", value: "item9", title: "这个是菜单项9" } as MenuItemData,
        { type: "item", label: "菜单项10", value: "item10", title: "这个是菜单项10" } as MenuItemData,
        { type: "item", label: "菜单项11", value: "item11", title: "这个是菜单项11" } as MenuItemData,
        { type: "item", label: "菜单项12", value: "item12", title: "这个是菜单项12" } as MenuItemData,
        { type: "item", label: "菜单项13", value: "item13", title: "这个是菜单项13" } as MenuItemData,
    ];

    const [comboxVal, setComboxVal] = useState<string | undefined>(undefined);

    return (
        <>
            <h2>普通菜单</h2>
            <Menu
                items={TestMenuItems}
                onChange={(val) => {
                    alert(val);
                }}
            />

            <h3>触发菜单 Dropdown</h3>
            <DropdownMenu trigger={<button>点击触发菜单</button>} items={TestMenuItems} />

            <h3>显示选中项菜单</h3>
            <DropdownMenu trigger={<button>点击触发菜单</button>} items={TestMenuItems} value="item2" showChecker={true} />

            <h3>ComboBox菜单</h3>
            <ComboboxMenu
                trigger={<button>点击触发菜单</button>}
                value={comboxVal}
                items={TestMenuItems}
                onChange={(val) => {
                    setComboxVal(val);
                }}
            />
        </>
    );
}

export default MenuDemo;
