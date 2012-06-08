/** * @author  */imports("Controls.Core.Base");using("System.Core.Base");using("System.Dom.Base");	/** * 所有控件基类。 * @class Control * @abstract * 控件的周期：  * constructor - 创建控件对应的 Javascript 类。不建议重写构造函数，除非你知道你在做什么。  * create - 创建本身的 dom 节点。 可重写 - 默认使用 this.tpl 创建。 * init - 初始化控件本身。 可重写 - 默认为无操作。  * attach - 渲染控件到文档。不建议重写，如果你希望额外操作渲染事件，则重写。  * detach - 删除控件。不建议重写，如果一个控件用到多个 dom 内容需重写。 */var Control = Dom.extend({	/**	 * 存储当前控件的默认配置。	 * @getter {Object} options	 * @protected	 * @virtual	 */	/**	 * 存储当前控件的默认模板字符串。	 * @getter {String} tpl	 * @protected	 * @virtual	 */	/**	 * 当被子类重写时，生成当前控件。	 * @param {Object} options 选项。	 * @protected	 * @virtual	 */	create: function() {		assert(this.tpl, "Control.prototype.create(): 当前类不存在 tpl 属性。Control.prototype.create 会调用 tpl 属性，根据这个属性中的 HTML 代码动态地生成节点并返回。子类必须定义 tpl 属性或重写 Control.prototype.create 方法返回节点。");		// 转为对 tpl解析。		return Dom.parseNode(this.tpl);	},		/**	 * 当被子类重写时，渲染控件。	 * @method	 * @param {Object} options 配置。	 * @protected virtual	 */	init: Function.empty,	/**	 * 初始化一个新的控件。	 * @param {String/Element/Control/Object} [options] 对象的 id 或对象或各个配置。	 */	constructor: function(options) {		// 这是所有控件共用的构造函数。		var me = this,			// 临时的配置对象。			opt = Object.extend({}, me.options),			// 当前实际的节点。			dom;		// 如果存在配置。		if(options) {						// 如果 options 是纯配置。			if(!options.nodeType && options.constructor === Object) {				dom = options.dom || options;				Object.extend(opt, options);				delete opt.dom;			} else {				dom = options;			}						if(typeof dom === "string") {				dom = document.getElementById(dom);			} else if(!dom.nodeType){				dom = dom.dom;			}					}		// 如果 dom 的确存在，使用已存在的， 否则使用 create(opt)生成节点。		me.dom = dom || me.create(opt);		assert(me.dom && me.dom.nodeType, "Control.prototype.constructor(options): 当前实例的 dom 属性为空，或此属性不是 DOM 对象。(检查 options.dom 是否是合法的节点或ID(ID不存在?) 或当前实例的 create 方法是否正确返回一个节点)\r\n当前控件: {dom} {xtype}", me.dom, me.xtype);		// 调用 init 初始化控件。		me.init(opt);		// 如果指定的节点已经在 DOM 树上，且重写了 attach 方法，则调用之。		if(me.dom.parentNode && this.attach !== Control.prototype.attach) {			this.attach(me.dom.parentNode, me.dom.nextSibling);		}		// 复制各个选项。		Object.set(me, opt);	},	/**	 * xtype 。	 * @virtual	 */	xtype: "control"	});