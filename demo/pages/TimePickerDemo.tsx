import { useState } from "react";
import { TimePicker, TimePickerPanel } from "../../src/components/TimePicker";
import { DemoSection } from "../DemoApp";

function TimePickerDemo() {
    const [datetime, setDatetime] = useState("2026-09-19 19:00");
    const [date, setDate] = useState("2026-09-19");
    const [time, setTime] = useState("19:00");
    const [inline, setInline] = useState("2026-09-19 19:00");
    const [empty, setEmpty] = useState("");
    const [typed, setTyped] = useState("2026-09-19 09:30");
    const [open, setOpen] = useState(false);
    const [controlled, setControlled] = useState("2026-09-19");
    const [custom, setCustom] = useState("2026-09-19 19:00");

    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>TimePicker 日期时间选择器</h2>
                <p>支持日期、时间、日期时间三种维度，可直接输入，也可点击输入框在面板中选择</p>
            </div>

            <DemoSection title="日期时间" description="点击标题逐级切换日期 / 年月 / 年份视图，日历可滚轮切月 / 切年，小时与分钟支持拖动选择">
                <div className="demo-row">
                    <TimePicker format="datetime" value={datetime} onChange={setDatetime} />
                    <span>当前值: {datetime}</span>
                </div>
                <div className="demo-row">
                    <TimePicker format="datetime" value={empty} onChange={setEmpty} placeholder="请选择日期时间" />
                    <span>默认值为空: {empty || "(空)"}</span>
                </div>
            </DemoSection>

            <DemoSection title="仅日期 / 仅时间" description="date 只保留年月日，time 只保留时分">
                <div className="demo-row">
                    <TimePicker format="date" value={date} onChange={setDate} placeholder="请选择日期" />
                    <span>当前值: {date}</span>
                </div>
                <div className="demo-row">
                    <TimePicker format="time" value={time} onChange={setTime} placeholder="请选择时间" />
                    <span>当前值: {time}</span>
                </div>
            </DemoSection>

            <DemoSection title="直接输入" description="手动输入 2026-9-19 09:30 等写法，回车或失焦后按 format 归一化">
                <div className="demo-row">
                    <TimePicker format="datetime" value={typed} onChange={setTyped} />
                    <span>当前值: {typed}</span>
                </div>
            </DemoSection>

            <DemoSection title="内嵌面板" description="不使用输入框时，可单独内嵌 TimePickerPanel">
                <div className="demo-row">
                    <TimePickerPanel format="datetime" value={inline} onChange={setInline} />
                    <span>当前值: {inline}</span>
                </div>
            </DemoSection>

            <DemoSection title="受控展开与禁用" description="通过 open / onOpenChange 接管显隐；disabled 时不可编辑也不展开">
                <div className="demo-row">
                    <TimePicker format="date" value={controlled} onChange={setControlled} open={open} onOpenChange={setOpen} />
                    <button onClick={() => setOpen((prev) => !prev)}>{open ? "关闭面板" : "打开面板"}</button>
                    <span>展开状态: {open ? "已展开" : "已收起"}</span>
                </div>
                <div className="demo-row">
                    <TimePicker format="datetime" value={datetime} onChange={setDatetime} disabled />
                    <span>禁用状态</span>
                </div>
            </DemoSection>

            <DemoSection title="自定义文案与弹出方向" description="按钮文案与面板相对于输入框的弹出位置均可配置">
                <div className="demo-row">
                    <TimePicker format="datetime" value={custom} onChange={setCustom} side="top" cancelText="关闭" confirmText="好的" />
                    <span>面板向上弹出（空间不足时会自动翻转）</span>
                </div>
            </DemoSection>
        </div>
    );
}

export default TimePickerDemo;
