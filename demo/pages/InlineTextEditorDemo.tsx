import { useState } from "react";
import { InlineTextEditor } from "../../src/components/InlineTextEditor";
import { DemoSection } from "../DemoApp";
import "./InlineTextEditorDemo.scss";

/** 模拟一次异步保存请求，用来观察组件的 saving 状态 */
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** 只读等纯展示用例不会真的保存 */
const noopSave = async () => {};

/* ------------------------------------------------------------
 * 1. 基础用法
 * ---------------------------------------------------------- */
function BasicDemo() {
    const [nickname, setNickname] = useState("小明");

    return (
        <div className="inline-text-editor-demo__stack">
            <div className="demo-row">
                <span className="inline-text-editor-demo__label">昵称</span>
                <InlineTextEditor value={nickname} saveHandler={async (next) => setNickname(next)} />
            </div>
            <p className="inline-text-editor-demo__hint">
                点击文本进入编辑态，回车或点击 ✓ 保存，点击 ✗ 放弃本次修改（输入框里的内容会被丢弃）。
            </p>
        </div>
    );
}

/* ------------------------------------------------------------
 * 2. 保存中状态
 * ---------------------------------------------------------- */
function SavingDemo() {
    const [remark, setRemark] = useState("默认备注");

    return (
        <div className="inline-text-editor-demo__stack">
            <div className="demo-row">
                <span className="inline-text-editor-demo__label">备注</span>
                <InlineTextEditor
                    value={remark}
                    placeholder="点击编辑"
                    saveHandler={async (next) => {
                        await wait(800);
                        setRemark(next);
                    }}
                />
            </div>
            <p className="inline-text-editor-demo__hint">
                保存耗时 0.8s：期间输入框只读，✓ 变成旋转图标，两个按钮都不可点击，重复提交会被忽略。
            </p>
        </div>
    );
}

/* ------------------------------------------------------------
 * 3. 空值与占位符
 * ---------------------------------------------------------- */
function PlaceholderDemo() {
    const [slogan, setSlogan] = useState("");

    return (
        <div className="demo-row">
            <InlineTextEditor value={slogan} placeholder="还没有签名，点击填写" saveHandler={async (next) => setSlogan(next)} />
            <span>当前值：{slogan || "（空）"}</span>
        </div>
    );
}

/* ------------------------------------------------------------
 * 4. 必填校验
 * ---------------------------------------------------------- */
function RequiredDemo() {
    const [phone, setPhone] = useState("");

    return (
        <div className="inline-text-editor-demo__stack">
            <div className="demo-row">
                <span className="inline-text-editor-demo__label">手机号</span>
                <InlineTextEditor value={phone} required placeholder="必填" saveHandler={async (next) => setPhone(next)} />
            </div>
            <p className="inline-text-editor-demo__hint">
                required 且内容为空时点击 ✓ 会被浏览器原生校验拦下（提示「请填写此字段」），saveHandler 不会执行，组件留在编辑态，补填后可以再次提交。
            </p>
        </div>
    );
}

/* ------------------------------------------------------------
 * 5. 长度限制
 * ---------------------------------------------------------- */
function MaxlengthDemo() {
    const [tagline, setTagline] = useState("专业");

    return (
        <div className="demo-row">
            <InlineTextEditor value={tagline} maxlength={10} placeholder="最多 10 个字" saveHandler={async (next) => setTagline(next)} />
            <span>
                当前值：{tagline}（{tagline.length}/10）
            </span>
        </div>
    );
}

/* ------------------------------------------------------------
 * 6. 只读模式
 * ---------------------------------------------------------- */
function ReadonlyDemo() {
    return (
        <div className="demo-row">
            <InlineTextEditor value="由系统自动生成，不可编辑" readonly saveHandler={noopSave} />
            <span>只读时不渲染编辑态，悬停也不会出现编辑图标</span>
        </div>
    );
}

/* ------------------------------------------------------------
 * 7. 外部值同步
 * ---------------------------------------------------------- */
const USERS = [
    { name: "张三", city: "上海" },
    { name: "李四", city: "成都" },
];

function SyncDemo() {
    const [users, setUsers] = useState(USERS);
    const [index, setIndex] = useState(0);
    const user = users[index];

    return (
        <div className="inline-text-editor-demo__stack">
            <div className="demo-row">
                <span className="inline-text-editor-demo__label">城市</span>
                <InlineTextEditor
                    value={user.city}
                    saveHandler={async (next) => setUsers((prev) => prev.map((item, i) => (i === index ? { ...item, city: next } : item)))}
                />
            </div>
            <div className="demo-row">
                <button type="button" onClick={() => setIndex((prev) => (prev + 1) % users.length)}>
                    切换到下一位用户
                </button>
                <span>当前：{user.name}</span>
            </div>
            <p className="inline-text-editor-demo__hint">
                空闲态下外部 value 变化会立即同步到显示值；若正处于编辑或保存中，则不会被外部值覆盖（先点文本进入编辑，再点「切换到下一位用户」试试）。
            </p>
        </div>
    );
}

/* ------------------------------------------------------------
 * 8. 可编辑列表
 * ---------------------------------------------------------- */
type Member = { id: number; name: string; email: string };

const INITIAL_MEMBERS: Member[] = [
    { id: 1, name: "张三", email: "zhangsan@example.com" },
    { id: 2, name: "李四", email: "" },
    { id: 3, name: "王五", email: "wangwu@example.com" },
];

function TableDemo() {
    const [members, setMembers] = useState(INITIAL_MEMBERS);

    /** 模拟写服务端：延迟 0.5s 后写回本地状态 */
    const updateMember = async (id: number, patch: Partial<Member>) => {
        await wait(500);
        setMembers((prev) => prev.map((member) => (member.id === id ? { ...member, ...patch } : member)));
    };

    return (
        <table className="inline-text-editor-demo__table">
            <thead>
                <tr>
                    <th>姓名</th>
                    <th>邮箱</th>
                </tr>
            </thead>
            <tbody>
                {members.map((member) => (
                    <tr key={member.id}>
                        <td>
                            <InlineTextEditor
                                value={member.name}
                                required
                                placeholder="点击填写"
                                saveHandler={(next) => updateMember(member.id, { name: next })}
                            />
                        </td>
                        <td>
                            <InlineTextEditor
                                value={member.email}
                                placeholder="点击填写邮箱"
                                saveHandler={(next) => updateMember(member.id, { email: next })}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function InlineTextEditorDemo() {
    return (
        <div className="demo-page">
            <div className="demo-page-header">
                <h2>InlineTextEditor 行内文本编辑器</h2>
                <p>把文本原地变成输入框，保存逻辑交给 saveHandler 异步处理，并自带编辑 / 保存中 / 完成三种状态</p>
            </div>

            <DemoSection title="基础用法" description="saveHandler 返回的 Promise resolve 后才算保存成功，此时才更新显示值">
                <BasicDemo />
            </DemoSection>

            <DemoSection title="保存中状态" description="Promise 未结束时组件进入 saving 态并禁用交互">
                <SavingDemo />
            </DemoSection>

            <DemoSection title="空值与占位符" description="value 为空时显示 placeholder">
                <PlaceholderDemo />
            </DemoSection>

            <DemoSection title="必填校验" description="借助原生 form 校验拦截空提交">
                <RequiredDemo />
            </DemoSection>

            <DemoSection title="长度限制" description="maxlength 限制输入字符数">
                <MaxlengthDemo />
            </DemoSection>

            <DemoSection title="只读模式" description="readonly 只渲染文本，不提供编辑入口">
                <ReadonlyDemo />
            </DemoSection>

            <DemoSection title="外部值同步" description="外部切换数据源时的同步规则">
                <SyncDemo />
            </DemoSection>

            <DemoSection title="可编辑列表" description="表格里逐项编辑、逐项异步保存">
                <TableDemo />
            </DemoSection>
        </div>
    );
}

export default InlineTextEditorDemo;
