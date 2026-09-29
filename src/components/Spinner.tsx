import "./../styles/components/icon.scss";
import { namespace } from "./../styles/namespace";

export const Spinner = ({ run = true, color = "currentColor" }: { run?: boolean; color?: string }) => {
    return (
        <svg
            className={namespace + "-spinner"}
            data-running={run ? "true" : "false"}
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="8609"
            width="200"
            height="200"
            shapeRendering="geometricPrecision" // 强制走高质量抗锯齿
            style={{ willChange: "transform" }} // 旋转时提示合成层
        >
            <path
                d="M512 882.3125c-23.29875 0-42.1875-18.88875-42.1875-42.1875s18.88875-42.1875 42.1875-42.1875c157.918125 0 285.9375-128.019375 285.9375-285.9375S669.918125 226.0625 512 226.0625 226.0625 354.081875 226.0625 512c0 23.29875-18.88875 42.1875-42.1875 42.1875S141.6875 535.29875 141.6875 512c0-204.5175 165.795-370.3125 370.3125-370.3125S882.3125 307.4825 882.3125 512 716.5175 882.3125 512 882.3125z"
                fill={color}
                p-id="8610"
            ></path>
        </svg>
    );
};
