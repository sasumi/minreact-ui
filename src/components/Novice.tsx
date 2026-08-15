import { SpanButton } from "@/components/Button";
import "@/styles/components/novice.scss";
import "@/styles/common.module.scss";
import { useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "./Popover";
import { useUpdateEffect } from "@/hooks/useUpdateEffect";

import styleDefines from "@/styles/common.module.scss";
const CSS_NS = styleDefines.namespace;

const getOffset = (element: HTMLElement | string | null) => {
    if (typeof element === "string") {
        element = document.querySelector(element);
    }
    if (!element) {
        return { top: 0, left: 0, width: 0, height: 0 };
    }
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft, width: rect.width, height: rect.height };
};

function Novice({
    stepInfos,
    onClose = () => {},
    nextButtonTitle = "下一项",
    prevButtonTitle = "上一项",
    closeButtonTitle = "关闭",
}: {
    stepInfos: [HTMLElement | string | null, string][];
    onClose?: () => void;
    nextButtonTitle?: string;
    prevButtonTitle?: string;
    closeButtonTitle?: string;
}) {
    const [open, setOpen] = useState(true);
    const [noviceIndex, setNoviceIndex] = useState(0);
    const [targetOffset, setTargetOffset] = useState(getOffset(stepInfos[noviceIndex][0]));

    const switchNovice = (index: number) => {
        setNoviceIndex(index);
    };

    const closeHandle = () => {
        onClose();
        setOpen(false);
    };

    useUpdateEffect(() => {
        setTargetOffset(getOffset(stepInfos[noviceIndex][0]));
    }, [noviceIndex]);

    return (
        open && (
            <Popover open={true} className={CSS_NS + "-novice-popover"}>
                <div className={CSS_NS + "-novice-masker"}></div>
                <PopoverAnchor asChild>
                    <div className={CSS_NS + "-novice-highlight"} style={targetOffset}></div>
                </PopoverAnchor>
                <PopoverContent
                    className={CSS_NS + "-novice-content-wrap"}
                    side="bottom"
                    sideOffset={8}
                    onCloseBy={() => false}
                    style={{ zIndex: "calc(var(--novice-zindex) + 1)" }}
                >
                    <div className={CSS_NS + "-novice-content"} dangerouslySetInnerHTML={{ __html: stepInfos[noviceIndex][1] }}></div>
                    <div className={CSS_NS + "-novice-buttons"}>
                        {noviceIndex > 0 && (
                            <SpanButton className={CSS_NS + "-novice-previous-btn"} onClick={() => switchNovice(noviceIndex - 1)}>
                                {prevButtonTitle}
                            </SpanButton>
                        )}
                        <SpanButton
                            className={CSS_NS + "-novice-next-btn"}
                            disabled={noviceIndex == stepInfos.length - 1}
                            onClick={() => switchNovice(noviceIndex + 1)}
                        >
                            {nextButtonTitle}
                        </SpanButton>
                        <SpanButton className={CSS_NS + "-novice-close-btn"} onClick={() => closeHandle()}>
                            {closeButtonTitle}
                        </SpanButton>
                    </div>
                </PopoverContent>
            </Popover>
        )
    );
}

export default Novice;
