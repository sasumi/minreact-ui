import { guid } from 'minutool';
import { forwardRef, useState } from 'react';
import "./../styles/components/image.scss";
import { namespace } from "./../styles/namespace";

const CSS_NS = namespace + "-img";

const STATE_LOADING = 'loading';
const STATE_ERROR = 'error';
const STATE_EMPTY = 'empty';
const STATE_NORMAL = 'normal';

const STATE_TITLE_MAP = {
    [STATE_LOADING]: '加载中...',
    [STATE_ERROR]: '图片加载失败',
    [STATE_EMPTY]: '暂无图片',
    [STATE_NORMAL]: '',
} as Record<string, string>;

/**
 * 图片加载组件，支持加载状态、错误状态、空状态
 * @param props 图片属性
 * @returns React 元素
 */
export const ImageLoader = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(({ ...rest }, ref) => {
    rest.loading = rest.loading ?? 'lazy';
    const [state, setState] = useState(!rest.src ? STATE_EMPTY : STATE_LOADING);
    return (
        <>
            <img
                {...rest}
                className={CSS_NS + ' ' + (rest.className || '')}
                ref={ref}
                data-state={state}
                onLoad={(e) => {
                    setState(STATE_NORMAL);
                    rest.onLoad?.(e);
                }}
                onError={(e) => {
                    setState(STATE_ERROR);
                    rest.onError?.(e);
                }}
            />
            <span className={CSS_NS + '__holder'} data-state={state} title={STATE_TITLE_MAP[state]} />
        </>
    );
});

/**
 * 函数版图片加载器，返回 HTML 字符串
 * @param props 图片属性
 * @returns HTML 字符串
 */
export const patchImgLoader = ({ ...props }) => {
    const img_id = guid('img');
    const holder_id = guid('img__holder');
    if(!props.src){
        delete props.src;
    }
    props.class = props.class ? `${CSS_NS} ${props.class}` : CSS_NS;
    return `
        <img id="${img_id}" ${Object.entries(props)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ')}
            data-state="${!props.src ? STATE_EMPTY : STATE_LOADING}"
            onload="this.dataset.state='normal';var h=document.getElementById('${holder_id}');if(h){h.dataset.state='normal'}"
            onerror="this.dataset.state='error';var h=document.getElementById('${holder_id}');if(h){h.dataset.state='error'}"/>
        <span id="${holder_id}" class="${CSS_NS}__holder" data-state="${STATE_LOADING}" title="${STATE_TITLE_MAP[STATE_LOADING]}"></span>
    `;
};
