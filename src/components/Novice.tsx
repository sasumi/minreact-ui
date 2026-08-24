import { SpanButton } from ".//Button";
import "./../styles/common.module.scss";
import "./../styles/components/novice.scss";
import { ReactNode, useEffect, useState } from "react";
import { Popover } from "./Popover";

import { namespace } from "./../styles/namespace";
import { findOne } from "minutool";
const CSS_NS = namespace + "-novice";

const getOffset = (element: string) => {
    const el = findOne(element);
    if (!el) {
        return { top: 0, left: 0, width: 0, height: 0 };
    }
    const rect = el.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft, width: rect.width, height: rect.height };
};

interface NoviceProps {
    /**
     * 新手引导步骤信息数组，每个步骤包含目标元素选择器和内容
     * target: 目标元素的 CSS 选择器
     * content: 新手引导内容，可以是 ReactNode 或字符串
     */
    stepInfos: {
        target: string;
        content: ReactNode | string;
    }[];

    /**
     * 关闭新手引导的回调函数
     */
    onClose?: () => void;
    nextButtonTitle?: string;
    prevButtonTitle?: string;
    closeButtonTitle?: string;
}

/**
 * Novice 新手引导组件，基于 Popover 实现
 */
function Novice({ stepInfos, onClose = () => {}, nextButtonTitle = "下一项", prevButtonTitle = "上一项", closeButtonTitle = "关闭" }: NoviceProps) {
    const [open, setOpen] = useState(true);
    const [noviceIndex, setNoviceIndex] = useState(0);
    const [targetOffset, setTargetOffset] = useState(getOffset(stepInfos[noviceIndex].target));

    const switchNovice = (index: number) => {
        setNoviceIndex(index);
    };

    const closeHandle = () => {
        onClose();
        setOpen(false);
    };

    useEffect(() => {
        const tag = stepInfos[noviceIndex].target;
        setTargetOffset(getOffset(tag));
        console.log("Scrolling to target:", findOne(tag));
        findOne(tag)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [noviceIndex]);

    return (
        open && (
            <Popover open={true} className={CSS_NS + "-popover"}>
                <div className={CSS_NS + "-masker"}></div>
                <Popover.Anchor asChild>
                    <div className={CSS_NS + "-highlight"} style={targetOffset}></div>
                </Popover.Anchor>
                <Popover.Content
                    className={CSS_NS + "-content-wrap"}
                    side="bottom"
                    sideOffset={8}
                    onCloseBy={() => false}
                    style={{ zIndex: "calc(var(--zindex) + 1)" }}
                >
                    <div className={CSS_NS + "-content"}>{stepInfos[noviceIndex].content}</div>
                    <div className={CSS_NS + "-actions"}>
                        {noviceIndex > 0 && (
                            <SpanButton className={CSS_NS + "-previous-btn"} onClick={() => switchNovice(noviceIndex - 1)}>
                                {prevButtonTitle}
                            </SpanButton>
                        )}
                        <SpanButton
                            className={CSS_NS + "-next-btn"}
                            disabled={noviceIndex == stepInfos.length - 1}
                            onClick={() => switchNovice(noviceIndex + 1)}
                        >
                            {nextButtonTitle}
                        </SpanButton>
                        <SpanButton className={CSS_NS + "-close-btn"} onClick={() => closeHandle()}>
                            {closeButtonTitle}
                        </SpanButton>
                    </div>
                </Popover.Content>
            </Popover>
        )
    );
}

export default Novice;
