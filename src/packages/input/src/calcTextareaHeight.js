let hiddenTextarea;

const HIDDEN_STYLE = `
    height: 0 !important;
    visibility: hidden !important;
    overflow: hidden !important;
    position: absolute !important;
    z-index: -1000 !important;
    top: 0 !important;
    right: 0 !important;
`;

const CONTEXT_STYLE = [
    'letter-spacing',
    'line-height',
    'padding-top',
    'padding-bottom',
    'font-family',
    'font-weight',
    'font-size',
    'text-rendering',
    'text-transfomr',
    'width',
    'text-indent',
    'padding-left',
    'padding-right',
    'border-width',
    'box-sizing'
];

function calculateNodeStyling(targetElement) {
    const style = window.getComputedStyle(targetElement);

    const boxSizing = style.getPropertyValue('box-sizing');

    const paddingSize = (
        parseFloat(style.getPropertyValue('padding-bottom')) +
        parseFloat(style.getPropertyValue('padding-top'))
    );

    const borderSize = (
        parseFloat(style.getPropertyValue('border-bottom-width')) + 
        parseFloat(style.getPropertyValue('border-top-width'))
    );

    const contextStyle = CONTEXT_STYLE
        .map(name => `${name}: ${style.getPropertyValue(name)}`)
        .join(';');

    return { contextStyle, paddingSize, borderSize, boxSizing };
}

export default function calcTextareaHeight(
    targetElement,
    minRows = 1,
    maxRows = null
) {
    // 创建一个 textarea 元素，作为body的最后子元素
    if (!hiddenTextarea) {
        hiddenTextarea = document.createElement('textarea');
        document.body.appendChild(hiddenTextarea);
    }

    let {
        paddingSize,
        borderSize,
        boxSizing,
        contextStyle
    } = calculateNodeStyling(targetElement);

    // contextStyle 是 targetElemnt 中 对内容宽高有影响的样式，用来重置原生的 textarea
    // HIDDEN_STYLE 作用是 让临时用来计算 textarea 对页面不造成影响
    hiddenTextarea.setAttribute('style', `${contextStyle};${HIDDEN_STYLE}`);

    hiddenTextarea.value = targetElement.value || targetElement.placeholder || '';

    // scrollHeight = content + padding
    let height = hiddenTextarea.scrollHeight;
    const result = {};

    if (boxSizing === 'border-box') {
        // border-box: height = content + padding + border
        height = height + borderSize;
    }
    else if (boxSizing === 'content-box') {
        // height = content
        height = height - paddingSize;
    }

    hiddenTextarea.value = '';

    // 单行内容的高度
    let singleRowHeight = hiddenTextarea.scrollHeight - paddingSize;

    // 计算最小高度
    if (minRows !== null) {
        let minHeight = singleRowHeight * minRows;

        if (boxSizing === 'border-box') {
            minHeight = minHeight + paddingSize + borderSize;
        }

        height = Math.max(minHeight, height);
        result.minHeight = `${minHeight}`;
    }

    // 计算最大高度
    if (maxRows !== null) {
        let maxHeight = singleRowHeight * maxRows;

        if (boxSizing === 'border-box') {
            maxHeight = maxHeight + paddingSize + borderSize;
        }

        height = Math.min(maxHeight, height);
    }

    // height的最终值为：在最小高度 与 最大高度 之间
    result.height = `${height}px`;

    // 删除 textarea
    hiddenTextarea.parentNode && hiddenTextarea.parentNode.removeChild(hiddenTextarea);
    // 垃圾回收
    hiddenTextarea = null;

    return result;
};