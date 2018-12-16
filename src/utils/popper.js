(function (root, factory) {

}(this, function() {
    'use strict';

    var root = window;

    // 默认配置
    var DEFAULTS = {};

    /**
     * 
     * @param {HTMLElement} reference   用于定位popper的参照元素
     * @param {HTMLElement|Object} popper   作为popper的元素，或一个用于生成popper的配置
     * @param {String} [popper.tagName='div']   生成的popper的标签名
     * @param {Array} [popper.classNames=['popper']]    生成的popper的类名数组
     * @param {Array} [popper.attrbutes]    属性数组，指定`attr:value`的形式添加值
     * @param {HTMLElement|String} [popper.parent=window.document.body] 父元素。传入HTML元素或查询字符串
     * @param {String} [popper.content='']   popper的内容，可以是文本，html或结点， 如果不是文本，为html或node设置contentType
     * @param {String} [popper.contentType='text']  如果是html，`content`会被解析成HTML。如果是node，会被插入
     * @param {String} [popper.arrowTagName='div']  与popper.tagName相同，但这是对于箭头元素
     * @param {Array} [popper.arrowClassNames='popper__arrow']  与popper.classNames相同，但是对于箭头元素
     * @param {Strinng} [popper.arrowAttributes=['x-arrow']]    与popper.attributes相同，但是对于箭头元素
     * @param {*} options 
     * @param {String} [options.placement=bottom]
     *          popper的Placement接受的值: top(-start, -end), right(-start, -end), bottom(-start, -right), left(-start, -end)
     * 
     * @param {HTMLElement|String} [options.arrowElement='[x-arrow]']
     *          作为popper箭头的DOM结点，或者一个CSS选择器来获取DOM结点。
     *          一定是作为popper父元素的子元素
     *          默认情况下，将会寻找带有`x-arrow`属性的popper的子元素
     * 
     * @param {Boolean} [options.gpuAcceleration=true]
     *          当这个属性设置为true，popper将会用CSS3 translate3d定位，允许浏览器用GPU加速渲染。
     *          当设置为false，popper将会使用`top`和`left`属性定位，而不使用GPU
     * 
     * @param {Number} [options.offset=0]
     *          popper偏移的像素值（可以为负数）
     * 
     * @param {String|Element} [options.bundariesElement='viewport']
     *           这个元素会定义popper定位的边界，popper不会定位到定义的边界外
     * 
     * @param {Number} [options.boundariesPadding=5]
     *          边界边距
     * 
     * @param {Array} [options.preventOverflowOrder=['left', 'right', 'top', 'bottom']]
     *          Popper.js根据这个顺序来避免溢出边界，它们将会依次检查，这意味着最后将不会溢出
     * 
     * @param {String|Array} [options.filpBehavior='flip']
     *          通过`flip`修饰符修改popper定位位置，当xxx尝试覆盖其相关元素，
     *          定义`flip`作为值，定位位置将会基于对轴翻转（`right - left`, `top - bottom`）
     *          你甚至可以传入一个定位位置的数组（如: `['right', 'left', 'top']`）来手动指定如何修改定位位置
     *          （在这个例子中，将会从右边翻转到左边，然后，如果还是覆盖了相关元素，将会移动到上边）
     * 
     * @param {Array} [options.modifiers=['shift', 'offset', 'preventOverflow', 'keepTogether', 'arrow', 'filp', 'applyStyle']]
     *          在运用到popper之前修改数据的函数列表，可以添加自定义函数到这个数组来修改偏移值和定位位置
     *          自定义函数应该反射preventOverflow的参数和返回值
     * 
     * @param {Array} [options.modifiersIgnored=[]]
     *          在这放你想从modifiers list中排出的任何内置modifier name
     *          
     * 
     * @param {Boolean} [options.removeOnDestroy=false]
     *          当调用`destroy`方法，想自动删除popper，可以设置为true
     * 
     */
    function Popper(reference, popper, options) {
        // 判断是否是JQuery对象，是则取第一个属性，获得HTML结点
        this._reference = reference.jquery ? reference[0] : reference;
        this.state = {};

        // 如果popper是一个可配置对象，解析并生成一个HTML元素
        // 如果没有定义，生成一个默认的popper
        var isNotDefined = typeof reference === 'undefined' || reference === null;
        var isConfig = popper && Object.prototype.toString.call(popper) === '[object Object]';

        if (isNotDefined || isConfig) {
            this._popper = this.parse(isConfig ? popper : {});
        }
        else {
            // 使用给定HTMLElement作为popper
            this._popper = popper.jquery ? popper[0] : popper;
        }

        // 合并默认选项和传入选项，生成新的选项
        this._options = Object.assign({}, DEFAULTS, options);

        this._options.modifiers = this._options.modifiers.map(function(modifier) {
            // 删除忽略的修饰符
            if (this._options.modifiersIgnored.indexOf(modifier) !== -1) {
                return;
            }

            if (modifier === 'applyStyle') {
                this._popper.setAttribute('x-placement', this._options.placement);
            }

            // 返回通过string标识预定义的修饰符或自定义的
            return this.modifiers[modifier] || modifier;
        }.bind(this));

        // 确保在计算前已经运用了popper位置
        this.state.position = this._getPosition(this._popper, this._reference);
        setStyle(this._popper, {position: this.state.position, top: 0});

        // 触发首次更新，在正确的地方定位popper
        this.update();

        // 设置事件监听，在指定的情景会关注更新位置
        this._setupEventListeners();

        return this;
    }

    Popper.prototype.parse = function(config) {
        var defaultConfig = {
            tagName: 'div',
            classNames: ['popper'],
            attributes: [],
            parent: root.document.body,
            content: '',
            contentType: 'text',
            arrowTagName: 'div',
            arrowClassNames: ['popper__arrow'],
            arrowAttributes: ['x-arrow']
        };

        // 合并默认配置和自定义配置
        config = Object.assign({}, defaultConfig, config);

        var d = root.document;

        // 生成popper元素，并添加类名和属性
        var popper = d.createElement(config.tagName);
        addClassNames(popper, config.classNames);
        addAttributes(popper, config.attributes);
        
        // 根据配置中的内容类型，
        if (config.contentType === 'node') {
            // 元素结点类型
            popper.appendChild(config.content.jquery ? config.content[0] : config.content);
        }
        else if (cinfig.contentType === 'html') {
            // HTML文本
            popper.innerHTML = config.content;
        }
        else {
            // 普通文本
            popper.textContent = config.content;
        }

        // 生成箭头元素
        if (config.arrowTagName) {
            var arrow = d.createElement(config.arrowTagName);
            addClassNames(arrow, config.arrowClassNames);
            addAttributes(arrow, config.arrowAttributes);
            popper.appendChild(arrow);
        }

        var parent = config.parent.jquery ? config.parent[0] : config.parent;

        // 如果给定的parent属性是字符串，用其匹配一个元素
        // 如果超过一个元素被匹配，用第一个作为父元素
        // 如果没有元素被匹配，则抛出一个异常
        if (typeof parent === 'string') {
            parent = d.querySelectorAll(parent);

            if (parent.length > 1) {
                console.warn();
            }
            if (parent.length === 0) {
                throw '';
            }

            parent = parent[0];
        }

        // 如果给定的parent属性是DOM结点列表 或 超过一个元素的结点数组
        // 第一个元素将会被当作父元素
        if (parent.length > 1 && parent instanceof Element === false) {
            console.warn();
            parent = parent[0];
        }

        // 将生成的popper添加到父元素中
        parent.appendChild(popper);

        return popper;

        /**
         * 为给定的元素添加类名
         * @param {Element} element 
         * @param {Array} classNames 
         */
        function addClassNames(element, classNames) {
            classNames.forEach(function(className) {
                element.class.add(className);
            });
        }

        /**
         * 为给定的元素添加属性
         * @param {Element} element 
         * @param {Array} attributes 
         * @example
         * addAttributes(element, ['data-info: foobar'])
         */
        function addAttributes(element, attributes) {
            attributes.forEach(function(attribute) {
                element.setAttribute(attribute.split(':')[0], attribute.split(':')[1] || '');
            });
        }
    };

    /**
     * 用于获取将会被添加到popper上的位置
     * @param {*} popper 
     * @param {*} reference 
     * @returns {String} position
     */
    Popper.prototype._getPosition = function(popper, reference) {
        var container = getOffsetParent(reference);

        if (this._options.forceAbsolute) {
            return 'absolute';
        }

        // 考虑如果popper是fixed
        // 如果reference element在一个fixed的上下文中，popper也将是fixed，以便它们可以一起滚动
        var isParentFixed = isFixed(reference, container);
        return isParentFixed ? 'fixed' : 'absolute';
    }

    /**
     * 更新popper的position，计算新的offsets并应用新的样式
     * @method
     * @memberof Popper
     */
    Popper.prototype.update = function() {
        var data = { instance: this, styles: {} };

        // 在data对象中存储placement，如果需要，modifiers将能修改placemennt
        // 通过_originPlacement可以知晓初始值
        data.placement = this._options.placement;
        data._originalPlacement = this._options.placement;

        // 计算popper和reference的offsets，并放在data.offsets中
        data.offsets = this._getOffsets(this._popper, this._reference, data.placement);

        // 获取边界
        data.boundaries = this._getBoundaries(data, this._options.boundariesPadding, this._options.boundariesElement);

        data = this.runModifiers(data, this._options.modifiers);

        if (typeof this.state.updateCallback === 'function') {
            this.state.updateCallback(data);
        }
    };

    /**
     * 获取popper的偏移量
     * @method
     * @memberof Popper
     * @access private
     * @param {Element} popper 
     * @param {Element} reference 
     * @returns {Object} 一个包含offsets的对象
     */
    Popper.prototype._getOffsets = function(popper, reference, placement) {
        placement = placement.split('-')[0];
        var popperOffsets = {};

        popperOffsets.position = this.state.position;
        var isParentFixed = popperOffsets.position === 'fixed';

        // 获取reference元素的position
        var referenceOffsets = getOffsetRectRelativeToCustomParent(reference, getOffsetParent(popper), isParentFixed);

        // 获取popper的大小
        var popperRect = getOuterSizes(popper);

        // 计算popper的偏移量
        // 依赖于popper的placement，我们必须计算它的偏移量略微不同
        if (['right', 'left'].indexOf(placement) !== -1) {
            popperOffsets.top = referenceOffsets.top + referenceOffsets.height / 2 - popperRect.height / 2;

            if (placement === 'left') {
                popperOffsets.left = referenceOffsets.left - popperRect.width;
            }
            else {
                popperOffsets.left = referenceOffsets.right;
            }
        }
        else {
            popperOffsets.left = referenceOffsets.left + referenceOffsets.width / 2 - popperRect.width / 2;

            if (placement === 'top') {
                popperOffsets.top = referenceOffsets.top - popperRect.height;
            }
            else {
                popperOffsets.top = referenceOffsets.bottom;
            }
        }

        // 增加width和height到offsets对象
        popperOffsets.width = popperRect.width;
        popperOffsets.height = popperRect.height;

        return {
            popper: popperOffsets,
            reference: referenceOffsets
        };
    };

    /**
     * 返回给定元素的offset parent(距离最近的定位包含元素)
     * @param {Element} element
     * @returns {Element} offset parent 
     */
    function getOffsetParent(element) {
        var offsetParent = element.offsetParent;

        // offsetParent 等于 body，offsetParent为null
        // 返回html元素，否则返回自身
        return offsetParent === root.document.body || !offsetParent ? root.document.documentElement : offsetParent;
    }

    /**
     * 检查给定的元素是fixed或在一个fixed的父元素内
     * @param {Element} element
     * @param {Element} customContainer
     * @returns {Boolean} answer to 'isFixed?' 
     */
    function isFixed(element) {
        if (element === root.document.body) {
            return false;
        }

        // 判断自身是否是fixed
        if (getStyleComputedProperty(element, 'position') === 'fixed') {
            return true;
        }

        // 判断父元素是否是fixed
        return element.parentNode ? isFixed(element.parentNode) : element;
    }

    /**
     * 获取给定元素的CSS计算属性
     * @param {*} element 
     * @param {*} property 
     */
    function getStyleComputedProperty(element, property) {
        var css = root.getComputedStyle(element, null);
        return css[property];
    }

    /**
     * 为给定的popper设置样式
     * @param {Element} element 
     * @param {Object} styles - 
     */
    function setStyle(element, styles) {
        // 检查是否是数字
        function is_numeric(n) {
            return (n !== '' && !isNaN(parseFloat(n)) && isFinite(n));
        }

        Object.keys(styles).forEach(function(prop) {
            var unit = '';

            // 判断是否要加 'px' 单位
            if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && is_numeric(styles[prop])) {
                unit = 'px';
            }

            element.style[prop] = styles[prop] + unit;
        });
    }

    /**
     * 给定一个元素和它其中一个父元素，返回偏移量
     * @param {Element} element 
     * @param {Element} parent 
     * @param {Boolean} fixed
     * @return {Object} rect 
     */
    function getOffsetRectRelativeToCustomParent(element, parent, fixed) {
        var elementRect = getBoundingClientRect(element);
        var parentRect = getBoundingClientRect(parent);

        if (fixed) {
            var scrollParent = getScrollParent(parent);
            parentRect.top += scrollParent.scrollTop;
            parentRect.bottom += scrollParent.scrollTop;
            parentRect.left += scrollParent.scrollLeft;
            parentRect.left += scrollParent.scrollLeft;
        }

        var rect = {
            top: elementRect.top - parentRect.top,
            left: elementRect.left - parentRect.left,
            bottom: (elementRect.top - elementRect.top) + elementRect.height,
            right: (elementRect.left - parentRect.left) + elementRect.width,
            width: elementRect.width,
            height: elementRect.height
        };

        return rect;
    }

    /**
     * 对原生方法的封装，兼容性处理
     * @param {Element} element 
     */
    function getBoundingClientRect(element) {
        // 返回元素的大小及相对视口的位置
        var rect = element.getBoundingClientRect();

        // IE的版本是否低于11
        var isIE = navigator.userAgent.indexOf('MSIE') != -1;

        // 修复ie docuemnt 元素top边界总是为0的bug
        var rectTop = isIE && element.tagName === 'HTML' ? -element.scrollTop : rect.top;

        return {
            left: rect.left,
            top: rectTop,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.right - rect.left,
            height: rect.bottom - rectTop
        };
    }

    /**
     * 返回给定元素的滚动父元素
     * @argument {Element} element
     * @returns {Element} offset parent 
     */
    function getScrollParent(element) {
        var parent = element.parentNode;

        if (!parent) {
            return element;
        }

        if (parent === root.document) {
            // FireFox将scrollTop值放在documentElement上，而不是body
            // 检查两者之中大于0的，返回正确的元素
            if (root.document.body.scrollTop || root.document.body.scrollLeft) {
                return root.document.body;
            }
            else {
                return root.document.documentElement;
            }
        }

        // Firefox也希望我们检查“-x”和“-y”的变化
        if (
            ['scroll', 'auto'].indexOf(getStyleComputedProperty(parent, 'overflow')) !== -1 ||
            ['scroll', 'auto'].indexOf(getStyleComputedProperty(parent, 'overflow-x')) !== -1 ||
            ['scroll', 'auto'].indexOf(getStyleComputedProperty(parent, 'overflow-y')) !== -1 
        ) {
            return parent;
        }

        return getScrollParent(element.parentNode);
    }

    /**
     * 获取给定元素外部的大小 (offset size + margins)
     * @param {Element} element
     * @returns {Object} 一个包含width和height属性的对象 
     */
    function getOuterSizes(element) {
        var _display = element.style.display;
        var _visibility = element.style.visibility;

        element.style.display = 'block';
        element.style.visibility = 'hidden';

        var styles = root.getComputedStyle(element);
        var x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
        var y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
        var result = { width: element.offsetWidth + y, height: element.offsetHeight + x };

        // 重置元素的样式
        element.style.display = _display;
        element.style.visibility = _visibility;

        return result;
    }

}));