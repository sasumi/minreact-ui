import "@/styles/com.range.scss";
import { detectedPrecision, round } from "minutool";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const STYLES = `
    .range-selector {display:inline-flex; align-content:center; gap:.25em; vertical-align:middle;}
    .range-selector input {width:6em;}
    .range-selector .rs-input {border:1px solid transparent; margin-right:0.1em;}
    .range-selector[disabled] {color:gray;}
    .range-selector:not([disabled]) .rs-input:hover {border-color:gray;cursor:pointer;  background-color:#fff}
`;

let changeTm: ReturnType<typeof setTimeout> | null = null;
function RangeInput({
	value,
	min = 0,
	max = 100,
	precision = null,
	disabled = false,
	step = 1,
	unit = "",
	onInput = () => {},
}: {
	value: number;
	min?: number;
	max?: number;
	precision?: number | null;
	disabled?: boolean;
	step?: number;
	unit?: string;
	onInput?: (v: number) => void;
}) {
	min = Number(min);
	max = Number(max);
	const [val, setVal] = useState<number>(value);
	const stepV = Number(step);
	const rangeRef = useRef<HTMLInputElement>(null);
	const { t } = useTranslation(["component"]);
	precision = precision === null ? detectedPrecision(min, max, step) : precision;

	useEffect(() => {
		changeTm && clearTimeout(changeTm);
		changeTm = setTimeout(() => {
			if (val !== value) {
				onInput(val);
			}
		}, 100);
	}, [val]);

	const promptVal = useCallback(() => {
		let vStr = window.prompt(t("component:range.inputPrompt"), String(val));
		if (vStr === null) {
			return;
		}
		const v = parseFloat(vStr);
		if (v > max || v < min) {
			alert(t("component:range.inputRangeAlert", { min, max }));
			return;
		}
		setVal(v);
	}, [val, min, max]);

	const handleScroll = useCallback(
		(e: WheelEvent) => {
			e.preventDefault();
			if (e.deltaY < 0) {
				if (val + stepV <= max) {
					setVal(round(val + stepV, precision));
				}
			} else {
				if (val - stepV >= min) {
					setVal(round(val - stepV, precision));
				}
			}
		},
		[val, step, min, max, precision],
	);

	useEffect(() => {
		rangeRef.current?.addEventListener("wheel", handleScroll);
		return () => {
			rangeRef.current?.removeEventListener("wheel", handleScroll);
		};
	}, [handleScroll]);

	return (
		<>
			<style>{STYLES}</style>
			<span className="range-selector" {...(disabled ? { "aria-disabled": true } : {})}>
				<input
					ref={rangeRef}
					type="range"
					value={val}
					min={min}
					step={step}
					max={max}
					disabled={disabled}
					onChange={(e) => {
						setVal(parseFloat(e.target.value));
					}}
				/>
				<span className="rs-input" onClick={promptVal}>
					{val}
				</span>
				{unit}
			</span>
		</>
	);
}

export default RangeInput;
