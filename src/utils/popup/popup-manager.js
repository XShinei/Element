import Vue from 'vue';
import { addClass, reomove } from '../dom';

let hasModal = false;
let hasInitZIndex = false;
let zIndex = 2000;

const getModal = function() {
    if (Vue.prototype.$isServer) {
        return;
    }

    // 获取PopupManager的dom实例
    let modalDom = PopupManager.modalDom;

    if (modalDom) {
        hasModal = true;
    }
    else {
        // 不存在modal实例
        hasModal = false;

        // 创建dom实例，赋给PopupManager的modalDom属性
        modalDom = document.createElement('div');
        PopupManager.modalDom = modalDom;

        modalDom.addEventListener('touchmove', function(event) {
            event.preventDefault();
            event.stopPropagation();
        });

        // 监听click事件，执行内部的doOnModalClick方法
        modalDom.addEventListener('click', function() {
            PopupManager.doOnModalClick && PopupManager.doOnModalClick();
        });
    }

    return modalDom;
};

// PopupManager对象实例集合
const instances = {};

const PopupManager = {
    modalFade: true,

    // 根据id获得实例对象
    getInstance: function(id) {
        return instances[id];
    },

    /**
     *  注册
     */
    register: function(id, instance) {
        if (id && instance) {
            instances[id] = instance;
        }
    },

    /**
     *  注销
     */
    deregister: function(id) {
        if (id) {
            instances[id] = null;
            delete instances[id];
        }
    },

    nextZIndex: function() {
        return PopupManager.zIndex++;
    },

    modalStack: [],

    doOnModalClick: function() {
        const topItem = PopupManager.modalStack[PopupManager.modalStack.length - 1];

        if (!topItem) {
            return;
        }

        // 获取栈顶对应的PopupManager对象实例
        const instance = PopupManager.getInstance(topItem.id);

        // ???
        if (instance && instance.closeOnClickModal) {
            instance.close();
        }
    },

    openModal:function(id, zIndex, dom, modalClass, modalFade) {
        if (Vue.prototype.$isServer) {
            return;
        }

        if (!id || zIndex === undefined) {
            return;
        }

        this.modalFade = modalFade;
        const modalStack = this.modalStack;

        // 判断是否已经存在
        for (let i = 0, j = modalStack.length; i < j; i++) {
            const item = modalStack[i];

            if (item.id === id) {
                return;
            }
        }

        const modalDom = getModal();

        addClass(modal, 'v-modal');

        if (this.modalFade && !hasModal) {
            addClass(modalDom, 'v-modal-enter');
        }

        if (modalClass) {
            let classArr = modalClass.trim().split(/\s+/);
            classArr.forEach(item => addClass(modalDom, item));
        }

        setTimeout(() => {
            removeClass(modalDom, 'v-modal-enter');
        }, 200);

        // nodeType 11: documentFragment
        // 传入了dom，modalDom作为dom的兄弟节点，否则modalDom作为body的子节点
        if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
            dom.parentNode.appendChild(modalDom);
        }
        else {
            document.body.appendChild(modalDom);
        }

        if (zIndex) {
            modalDom.style.zIndex = zIndex;
        }

        modalDom.tabIndex = 0;
        modalDom.style.display = '';

        // 将modalDom的相关属性存入栈顶
        this.modalStack.push({ id: id, zIndex: zIndex, modalClass: modalClass });
    },

    closeModal: function(id) {
        const modalStack = this.modalStack;
        const modalDom = getModal();

        // 栈中存在元素
        if (modalStack.length > 0) {
            // 获取栈顶元素
            const topItem = modalStack[modalStack.length - 1];

            // 要关闭的modal在栈顶
            if (topItem.id === id) {
                // 删除相关的class
                if (topItem.modalClass) {
                    let classArr = topItem.modalClass.trim().split(/\s+/);
                    classArr.forEach(item => removeClass(modalDom, item));
                }
                
                // 删除栈顶元素
                modalStack.pop();

                // 栈中还存在元素
                if (modalStack.length > 0) {
                    // 当前modal元素的zIndex 等于 栈顶元素的zIndex
                    modalDom.style.zIndex = modalStack[modalStack.length - 1].zIndex;
                }
            }
            else {
                for (let i = modalStack.length - 1; i >= 0; i--) {
                    if (modalStack[i].id === id) {
                        modalStack.splice(i, 1);

                        break;
                    }
                }
            }
        }

        if (modalStack.length === 0) {
            if (this.modalFade) {
                addClass(modalDom, 'v-modal-leave');
            }

            setTimeout(() => {
                if (modalStack.length === 0) {
                    if (modalDom.parentNode) {
                        modalDom.parentNode.removeChild(modalDom);
                    }
                    
                    modalDom.style.display = 'none';
                    PopupManager.modalDom = undefined;
                }

                removeClass(modalDom, 'v-modal-leave');
            }, 200);
        }
    }
};

Object.defineProperty(PopupManager, 'zIndex', {
    configurable: true,
    get() {
        if (!hasInitZIndex) {
            zIndex = (Vue.prototype.$ELEMENT || {}).zIndex || zIndex;
            hasInitZIndex = true;
        }

        return zIndex;
    },
    set(value) {
        zIndex = value;
    }
});

const getTopPopup = function() {
    if (Vue.prototype.$isServer) {
        return;
    }

    if (PopupManager.modalStack.length > 0) {
        const topPopup = PopupManager.modalStack[PopupManager.modalStack.length - 1];

        if (!topPopup) {
            return;
        }

        const instance = instances[topPopup.id];

        return instance;
    }
};

if (!Vue.prototype.$isServer) {
    window.addEventListener('keydown', function(event) {
        if (event.keyCode === 27) {
            const topPopup = getTopPopup();

            if (topPopup && topPopup.closeOnPressEscape) {
                topPopup.handleClose 
                ? topPopup.handleClose()
                : (topPopup.handleAction ? topPopup.handleAction('cancel') : topPopup.close());
            }
        }
    });
}

export default PopupManager;