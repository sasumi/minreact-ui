import { SpanButton } from "@/components/Button";
import "@/styles/components/novice.scss";
import "@/styles/common.module.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverAnchor, PopoverContent } from "./Popover";
import { useUpdateEffect } from "@/hooks/useUpdateEffect";

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

function Novice({ stepInfos, onClose = () => {} }: { stepInfos: [HTMLElement | string | null, string][]; onClose?: () => void }) {
    const { t } = useTranslation(["novice", "common"]);
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
            <Popover open={true} className="paper-novice-popover">
                <div className="paper-novice-masker"></div>
                <PopoverAnchor asChild>
                    <div className="paper-novice-highlight" style={targetOffset}></div>
                </PopoverAnchor>
                <PopoverContent
                    className="paper-novice-content-wrap"
                    side="bottom"
                    sideOffset={8}
                    onCloseBy={() => false}
                    style={{ zIndex: "calc(var(--novice-zindex) + 1)" }}
                >
                    <div className="paper-novice-content" dangerouslySetInnerHTML={{ __html: stepInfos[noviceIndex][1] }}></div>
                    <div className="paper-novice-buttons">
                        {noviceIndex > 0 && (
                            <SpanButton className="novice-previous-btn" onClick={() => switchNovice(noviceIndex - 1)}>
                                {t("novice:previous")}
                            </SpanButton>
                        )}
                        <SpanButton className="novice-next-btn" disabled={noviceIndex == stepInfos.length - 1} onClick={() => switchNovice(noviceIndex + 1)}>
                            {t("novice:next")}
                        </SpanButton>
                        <SpanButton className="novice-close-btn" onClick={() => closeHandle()}>
                            {t("common:close")}
                        </SpanButton>
                    </div>
                </PopoverContent>
            </Popover>
        )
    );
}

export default Novice;
