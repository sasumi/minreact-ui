import { ComboboxMenu, DropdownMenu, Menu, MenuDivider, MenuItemData, Select } from "../../src/components/Menu";
import { useState } from "react";
import { DemoSection } from "../DemoApp";

function MenuDemo() {
    const icon1 = (
        <>
            <span className="minreact-ui-icon icondemo1"/>
        </>
    );

    const icon2 = (
        <>
            <span className="minreact-ui-icon icondemo2"/>
        </>
    );

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

    const TestMenuItemsWithIcon = [
        { type: "item", label: "菜单项1", icon: icon1, value: "item1", title: "这个是菜单项1" } as MenuItemData,
        { type: "item", label: "菜单项13", value: "item13", title: "这个是菜单项13" } as MenuItemData,
        { type: "item", label: "菜单项13", icon: icon2, value: "item14", title: "这个是菜单项13" } as MenuItemData,
    ];

    const [comboxVal, setComboxVal] = useState<string | undefined>(undefined);
    const [selectVal, setSelectVal] = useState<string | undefined>(undefined);

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>Menu 菜单组件</h2>
                <p>演示普通菜单、下拉菜单、组合框菜单以及选择器的使用</p>
            </div>

            <DemoSection title="普通菜单">
                <Menu
                    items={TestMenuItems}
                    onChange={(val) => {
                        alert(val);
                    }}
                />
            </DemoSection>

            <DemoSection title="触发菜单 Dropdown">
                <DropdownMenu trigger={<button>点击触发菜单</button>} items={TestMenuItems} />
            </DemoSection>

            <DemoSection title="显示选中项菜单">
                <DropdownMenu trigger={<button>点击触发菜单</button>} items={TestMenuItems} value="item2" showChecker={true} />
            </DemoSection>

            <DemoSection title="自定义图标菜单">
                <DropdownMenu trigger={<button>点击触发菜单</button>} items={TestMenuItemsWithIcon} value="item2" />
            </DemoSection>

            <DemoSection title="ComboBox菜单">
                <ComboboxMenu
                    trigger={<button>点击触发菜单</button>}
                    value={comboxVal}
                    items={TestMenuItems}
                    onChange={(val) => {
                        setComboxVal(val);
                    }}
                />
            </DemoSection>

            <DemoSection title="Select选择器">
                <Select
                    items={TestMenuItems}
                    value={selectVal}
                    onChange={(val) => {
                        setSelectVal(val);
                    }}
                />
            </DemoSection>

            <DemoSection title="自定义占位符">
                <Select
                    items={TestMenuItems}
                    value={selectVal}
                    placeholder="自定义占位符"
                    onChange={(val) => {
                        setSelectVal(val);
                    }}
                />
            </DemoSection>

            <DemoSection title="禁用的 Select 选择器">
                <Select
                    items={TestMenuItems}
                    value="item2"
                    disabled={true}
                    onChange={(val) => {
                        setSelectVal(val);
                    }}
                />
            </DemoSection>
        </div>
    );
}

export default MenuDemo;
