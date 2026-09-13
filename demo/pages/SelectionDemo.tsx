import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Checkbox, useSelection } from "../../src/components/Selection";
import { Pagination } from "../../src/components/Pagination";
import { DemoSection } from "../DemoApp";
import "./SelectionDemo.scss";

const FRUITS = ["苹果", "香蕉", "橙子", "葡萄", "西瓜"];

/* ------------------------------------------------------------
 * 1. 基础用法
 * ---------------------------------------------------------- */
function BasicDemo() {
    const { results, CheckboxAll, CheckboxItem } = useSelection(FRUITS, { defaultSelected: ["香蕉"] });

    return (
        <div className="selection-demo">
            <label className="selection-demo__all">
                <CheckboxAll />
                全选
            </label>
            <ul className="selection-demo__list">
                {FRUITS.map((fruit) => (
                    <li key={fruit}>
                        <label className="selection-demo__option">
                            <CheckboxItem value={fruit} />
                            {fruit}
                        </label>
                    </li>
                ))}
            </ul>
            <p className="selection-demo__result">
                已选 <code>{results.length}</code> / {FRUITS.length} 项：{results.length ? results.join("、") : "（无）"}
            </p>
            <p className="selection-demo__hint">
                勾选部分选项时，全选框会进入 <code>indeterminate</code> 半选状态；点击半选的全选框会补全为全选。
            </p>
        </div>
    );
}

/* ------------------------------------------------------------
 * 2. 命令式 API：selectAll / invert / clear / toggle / setSelected / isSelected
 * ---------------------------------------------------------- */
function ApiDemo() {
    const { results, isSelected, selectAll, invert, clear, toggle, setSelected, CheckboxAll, CheckboxItem } = useSelection(FRUITS, {
        defaultSelected: ["苹果", "葡萄"],
    });

    return (
        <div className="selection-demo">
            <div className="demo-row" style={{ flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <button type="button" onClick={selectAll}>
                    全选 selectAll()
                </button>
                <button type="button" onClick={invert}>
                    反选 invert()
                </button>
                <button type="button" onClick={clear}>
                    清空 clear()
                </button>
                <button type="button" onClick={() => toggle("香蕉")}>
                    toggle("香蕉")
                </button>
                <button type="button" onClick={() => toggle("西瓜", true)}>
                    toggle("西瓜", true)
                </button>
                <button type="button" onClick={() => setSelected((prev) => new Set([...prev, "橙子"]))}>
                    setSelected(updater)
                </button>
            </div>

            <label className="selection-demo__all">
                <CheckboxAll />
                全选
            </label>
            <ul className="selection-demo__list">
                {FRUITS.map((fruit) => (
                    <li key={fruit}>
                        <label className="selection-demo__option">
                            <CheckboxItem value={fruit} />
                            {fruit}
                            {isSelected(fruit) && <span className="selection-demo__badge">isSelected → true</span>}
                        </label>
                    </li>
                ))}
            </ul>
            <p className="selection-demo__result">
                results：<code>[{results.map((r) => `"${r}"`).join(", ")}]</code>
            </p>
            <p className="selection-demo__hint">
                invert() 只翻转当前 values 范围内的选项，范围外的已选项会被保留（跨页多选时不会被清掉）。
            </p>
        </div>
    );
}

/* ------------------------------------------------------------
 * 3. values 变化时的裁剪：pruneOnValuesChange
 * ---------------------------------------------------------- */
const GROUP_A = ["A-1", "A-2", "A-3", "A-4"];
const GROUP_B = ["B-1", "B-2", "B-3", "B-4"];

function PruneDemo({ prune }: { prune: boolean }) {
    const [group, setGroup] = useState<"A" | "B">("A");
    const values = group === "A" ? GROUP_A : GROUP_B;

    const { results, CheckboxAll, CheckboxItem } = useSelection(values, {
        defaultSelected: ["A-1", "A-2"],
        pruneOnValuesChange: prune,
    });

    return (
        <div className="selection-demo">
            <div className="demo-row" style={{ marginBottom: "0.75rem" }}>
                <button type="button" onClick={() => setGroup("A")} disabled={group === "A"}>
                    数据集 A
                </button>
                <button type="button" onClick={() => setGroup("B")} disabled={group === "B"}>
                    数据集 B
                </button>
                <span style={{ color: "#666" }}>pruneOnValuesChange = {String(prune)}</span>
            </div>

            <label className="selection-demo__all">
                <CheckboxAll />
                全选
            </label>
            <ul className="selection-demo__list">
                {values.map((value) => (
                    <li key={value}>
                        <label className="selection-demo__option">
                            <CheckboxItem value={value} />
                            {value}
                        </label>
                    </li>
                ))}
            </ul>
            <p className="selection-demo__result">
                当前数据集：{group}，已选项：{results.length ? results.join("、") : "（无）"}
            </p>
            <p className="selection-demo__hint">
                在两个数据集里各勾几项后切换：开启裁剪时，不属于新 values 的选项会被自动移除；关闭裁剪时旧选项会一直保留。
            </p>
        </div>
    );
}

/* ------------------------------------------------------------
 * 4. 禁用状态
 * ---------------------------------------------------------- */
function DisabledDemo() {
    const allDisabled = useSelection(FRUITS.slice(0, 3), { disabled: true, defaultSelected: ["苹果"] });
    const partialDisabled = useSelection(FRUITS.slice(0, 3), { defaultSelected: ["香蕉"] });

    const renderList = (values: string[], item: (value: string) => ReactNode) => (
        <ul className="selection-demo__list">
            {values.map((value) => (
                <li key={value}>
                    <label className="selection-demo__option">{item(value)}</label>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="demo-row" style={{ alignItems: "flex-start" }}>
            <div className="demo-col selection-demo">
                <p style={{ fontWeight: 500, margin: "0 0 0.5rem" }}>整体禁用（disabled: true）</p>
                <label className="selection-demo__all">
                    <allDisabled.CheckboxAll />
                    全选
                </label>
                {renderList(FRUITS.slice(0, 3), (value) => (
                    <>
                        <allDisabled.CheckboxItem value={value} />
                        {value}
                    </>
                ))}
                <p className="selection-demo__hint">通过 options.disabled 一次性禁用全部复选框，单项仍可用 disabled 覆盖。</p>
            </div>
            <div className="demo-col selection-demo">
                <p style={{ fontWeight: 500, margin: "0 0 0.5rem" }}>单项禁用</p>
                <label className="selection-demo__all">
                    <partialDisabled.CheckboxAll />
                    全选
                </label>
                {renderList(FRUITS.slice(0, 3), (value) => (
                    <>
                        <partialDisabled.CheckboxItem value={value} disabled={value === "橙子"} />
                        {value}
                        {value === "橙子" ? "（不可选）" : ""}
                    </>
                ))}
                <p className="selection-demo__hint">全选仍然会勾选被禁用的选项，禁用只影响用户交互。</p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------
 * 5. onChange 回调
 * ---------------------------------------------------------- */
function OnChangeDemo() {
    const [logs, setLogs] = useState<string[]>(["（等待操作，首帧不会触发 onChange）"]);

    const { results, CheckboxAll, CheckboxItem } = useSelection(FRUITS, {
        onChange: (values, set) => {
            setLogs((prev) => [`onChange → values: [${values.join(", ")}]，set.size: ${set.size}`, ...prev].slice(0, 8));
        },
    });

    return (
        <div className="selection-demo">
            <label className="selection-demo__all">
                <CheckboxAll />
                全选
            </label>
            <ul className="selection-demo__list">
                {FRUITS.map((fruit) => (
                    <li key={fruit}>
                        <label className="selection-demo__option">
                            <CheckboxItem value={fruit} />
                            {fruit}
                        </label>
                    </li>
                ))}
            </ul>
            <p className="selection-demo__result">当前选中：{results.length ? results.join("、") : "（无）"}</p>
            <pre className="selection-demo__log">{logs.join("\n")}</pre>
        </div>
    );
}

/* ------------------------------------------------------------
 * 6. 与分页联用：跨页保留选择
 * ---------------------------------------------------------- */
const ROWS = Array.from({ length: 23 }, (_, i) => `EMP-${String(i + 1).padStart(3, "0")}`);
const ROW_PAGE_SIZE = 5;

function PagedSelectionDemo() {
    const [page, setPage] = useState(1);
    const pageValues = useMemo(
        () => ROWS.slice((page - 1) * ROW_PAGE_SIZE, page * ROW_PAGE_SIZE),
        [page],
    );

    const { results, CheckboxAll, CheckboxItem, clear } = useSelection(pageValues);

    return (
        <div className="selection-demo">
            <table className="selection-demo__table">
                <thead>
                    <tr>
                        <th style={{ width: "3rem" }}>
                            <CheckboxAll aria-label="选择本页全部" />
                        </th>
                        <th>工号</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    {pageValues.map((row) => (
                        <tr key={row}>
                            <td>
                                <CheckboxItem value={row} aria-label={`选择 ${row}`} />
                            </td>
                            <td>{row}</td>
                            <td>
                                <span className="selection-demo__badge">在职</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="selection-demo__footer">
                <Pagination page={page} pageSize={ROW_PAGE_SIZE} total={ROWS.length} onChange={setPage} />
                <span>
                    跨页已选 <code>{results.length}</code> 项
                </span>
                <button type="button" onClick={clear} disabled={results.length === 0}>
                    清空选择
                </button>
            </div>
            <p className="selection-demo__hint">
                翻页后已选项目会保留：values 只代表「当前页」，而选中集是累计的；表头全选框只作用于本页。
            </p>
        </div>
    );
}

/* ------------------------------------------------------------
 * 7. 底层 Checkbox：支持 indeterminate
 * ---------------------------------------------------------- */
function CheckboxDemo() {
    const [checked, setChecked] = useState<string[]>(["图片"]);
    const all = ["图片", "视频", "文档"];
    const count = all.filter((v) => checked.includes(v)).length;

    const toggle = (value: string, next: boolean) =>
        setChecked((prev) => (next ? [...prev, value] : prev.filter((v) => v !== value)));

    return (
        <div className="selection-demo" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label className="selection-demo__option">
                <Checkbox
                    checked={count === all.length}
                    indeterminate={count > 0 && count < all.length}
                    onChange={(next) => setChecked(next ? [...all] : [])}
                />
                全部类型
            </label>
            <div style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {all.map((value) => (
                    <label key={value} className="selection-demo__option">
                        <Checkbox checked={checked.includes(value)} onChange={(next) => toggle(value, next)} />
                        {value}
                    </label>
                ))}
            </div>
            <p className="selection-demo__result">已选：{checked.length ? checked.join("、") : "（无）"}</p>
        </div>
    );
}

function SelectionDemo() {
    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>Selection 选择</h2>
                <p>useSelection 多选状态 Hook 与底层 Checkbox，支持全选 / 半选 / 反选 / 裁剪，以及跨页累计选择</p>
            </div>

            <DemoSection title="基础用法" description="useSelection(values) 返回 CheckboxAll、CheckboxItem 与 results，defaultSelected 指定初始选中项">
                <BasicDemo />
            </DemoSection>

            <DemoSection title="命令式 API" description="selectAll / invert / clear / toggle / setSelected / isSelected 可直接驱动选中集变化">
                <ApiDemo />
            </DemoSection>

            <DemoSection title="values 变化与裁剪" description="pruneOnValuesChange 控制当 values（如换页、换数据集）变化时，是否剔除已不在范围内的选中项">
                <div className="demo-row" style={{ alignItems: "flex-start" }}>
                    <div className="demo-col">
                        <PruneDemo prune />
                    </div>
                    <div className="demo-col">
                        <PruneDemo prune={false} />
                    </div>
                </div>
            </DemoSection>

            <DemoSection title="禁用状态" description="既可以通过 options.disabled 整体禁用，也可以在单个 CheckboxItem 上禁用">
                <DisabledDemo />
            </DemoSection>

            <DemoSection title="onChange 回调" description="选中集变化时回调 (values, set)，可用于联动外部状态或埋点（首帧渲染不会触发）">
                <OnChangeDemo />
            </DemoSection>

            <DemoSection title="跨页选择" description="与 Pagination 组合：values 传入当前页数据，选中集跨页累计，invert 只翻转当前页">
                <PagedSelectionDemo />
            </DemoSection>

            <DemoSection title="底层 Checkbox" description="独立使用的受控复选框，indeterminate 会以 DOM property 形式写入">
                <CheckboxDemo />
            </DemoSection>

            <DemoSection
                title="使用提示"
                description="CheckboxAll / CheckboxItem 由 Hook 内部记忆化，读取的是选中集 ref，因此必须渲染在调用 useSelection 的组件渲染树中（由该组件重渲染驱动更新），不要在 React.memo 包裹的独立子组件里消费它们。"
            >
                <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#666", lineHeight: 1.9 }}>
                    <li>values 只表示「当前可选范围」，选中集与之独立，因此天然支持跨页累计选择。</li>
                    <li>全选框在三态间切换：全选 → 取消（清空）；半选 → 点击补全为全选。</li>
                    <li>CheckboxAll / CheckboxItem 的 disabled 可用自身属性覆盖 options.disabled。</li>
                    <li>默认 aria-label 为「全选」与「选择 xxx」，实际项目中建议显式传入更语义化的文本。</li>
                </ul>
            </DemoSection>
        </div>
    );
}

export default SelectionDemo;
