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
     * @param {String} [options.placement=button]
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
}));