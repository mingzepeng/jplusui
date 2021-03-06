
var Configs = require('./configs'),
	Path = require('path'),
	FS = require('fs'),
	HttpContext = require('./httpcontext');

/**
 * 表示一个 HTTP 应用程序。
 * @param {Object} configs 应用程序的默认配置。
 */
function HttpApplication(configs, pluginConfigs){
	this.loadConfigs(configs, pluginConfigs);
	this.init();
}

function loadHttpHandler(directory, name, application){
	if(!name){
		return null;
	}
	
	name = require(Configs.path[directory] + name);
	
	if(name.init){
		name.init(application);
	}
	
	
	return name;
}

function extend(dest, src){
	for(var key in src){
		dest[key] = src[key];
	}
	
	return dest;
}

var emptyObj = {};

HttpApplication.prototype = {

	// 配置

	/**
	 * 当前应用程序对应的域名。
	 * @type {String}
	 * @remark null 表示任意域名。
	 */ 
	host: null,
	
	/**
	 * 当前应用程序对应的域名别名。
	 * @type {String}
	 * @remark null 表示任意域名。
	 */ 
	hosts: null,

	/**
	 * 当前应用程序对应的 http 地址。
	 * @type {String}
	 * @remark '0.0.0.0' 表示任意地址。
	 */ 
	address: '0.0.0.0',
	
	/**
	 * 当前请求的文件路径的真实地址。
	 * @type {String}
	 */
	physicalPath: '.',
	
	/**
	 * 当前请求的文件路径的虚拟地址。
	 * @type {String}
	 */
	vitualPath: '',
	
	/**
	 * 当前应用程序对应的端口。
	 * @type {Integer}
	 */ 
	port: 0,
	
	/**
	 * 传输编码。
	 * @type {String}
	 */
	headerEncoding: 'utf8',
	
	/**
	 * 源码编码。
	 * @type {String}
	 */
	contentEncoding: 'utf-8',
	
	/**
	 * 解析文件时的默认编码。
	 * @type {String}
	 */
	fileEncoding: 'utf-8',
	
	/**
	 * 支持的请求头信息。
	 * @type {String}
	 */
	headers: null,
	
	/**
	 * 支持的模块信息。
	 * @type {Object}
	 */
	modules: emptyObj,
	
	/**
	 * 支持的处理模块。
	 * @type {Object}
	 */
	handlers: emptyObj,
	
	/**
	 * 支持的插件信息。
	 * @type {Object}
	 */
	plugins: emptyObj,
	
	/**
	 * 支持的 MIME 类型。
	 * @type {Object}
	 */
	mimeTypes: emptyObj,
	
	/**
	 * 支持的错误页。
	 * @type {Object}
	 */
	errorPages: emptyObj,
	
	/**
	 * 支持的主页。
	 * @type {Object}
	 */
	defaultPages: emptyObj,
	
	/**
	 * 默认配置对象。
	 * @type {Object}
	 */
	configs: {},
	
	/**
	 * 如果支持文件夹列表，则此为 true。
	 * @type {HttpHandler}
	 */
	directoryListHandler: null,
	
	/**
	 * 如果支持文件夹列表，则此为 true。
	 * @type {HttpHandler}
	 */
	errorHandler: null,
	
	/**
	 * 默认的 Session 过期时间。单位为分钟。
	 * @type {Integer}
	 */
	sessionTimeout: -1,
	
	/**
	 * 存储 Session 的键值。
	 * @type {Integer}
	 */
	sessionKey: 'XFLYSESSION',
	
	/**
	 * 存储 Session 的加密键。
	 * @type {Integer}
	 */
	sessionCryptoKey: 'xfly2',

	// 字段

	/**
	 * 当前应用程序对应的实际的 Http.Server 对象。
	 * @type {Http.Server}
	 */
	socket: null,
	
	/**
	 * 获取当前应用程序在应用程序池的 ID 。
	 * @type {String}
	 */
	get id(){
		// 获取详细信息。
		var address = this.address;
		return (address ? address === 'localhost' ? '127.0.0.1' : address : '0.0.0.0') + ':' + this.port;
	},
	
	/**
	 * 获取当前应用程序的主机名。
	 * @type {String}
	 */
	get hostname(){
		return this.host && this.host !== "*" ? this.host + (this.port !== 80 ? ':' + this.port : '')  : '*'
	},
	
	/**
	 * 获取当前应用程序的主页地址。
	 * @type {String}
	 */
	get rootUrl(){
		return 'http://' + (this.host && this.host !== '*' ? this.host : this.address && this.address !== '0.0.0.0' ? this.address : 'localhost') + (this.port !== 80 ? ':' + this.port : '') + '/';
	},
	
	loadConfigs: function(configs, pluginConfigs){
		
		// 如果存在 pluginConfigs， 则拷贝到当前对象。
		if(pluginConfigs) {
			this.configs = extend(extend({}, this.configs), pluginConfigs);
		}
		
		// 拷贝配置到当前对象。
		for(var key in configs){
			var value = configs[key];
			if(typeof value === 'object' && value) {
				this[key] = extend(extend({}, this[key]), value);
			} else {
				this[key] = value;
			}
		}
		
	},
	
	getConfig: function(name){
		return this.configs[name] || (this.configs[name] = {});
	},
	
	/**
	 * 初始化应用程序需要的全部资源。
	 */
	init: function(){
		
		// 将当前地址转为绝对路径。
		this.physicalPath = Path.resolve(Configs.path.workingDirectory, this.physicalPath);
		
		// 将字符串转为 Handler 。
		if(typeof this.directoryListHandler  === 'string'){
			this.directoryListHandler = loadHttpHandler('handlers', this.directoryListHandler, this);
		}
		
		if(typeof this.errorHandler  === 'string'){
			this.errorHandler = loadHttpHandler('handlers', this.errorHandler, this);
		}
		
		['modules', 'handlers', 'plugins'].forEach(function(value){
			var obj = this[value];
			for(var key in obj){
				if(typeof obj[key] === 'string'){
					obj[key] = loadHttpHandler(value, obj[key], this);
				}
			}
		}, this);
		
	},
	
	onApplicationStart: function(){
		
	},
	
	onApplicationStop: function(){
		
	},
	
	onBeginRequest: function(context) { 
	
	},
	
	onEndRequest: function(context) { 
	
	},
	
	onSessionStart: function(context){
	
	},
	
	onSessionEnd: function(context){
	
	},
	
	reportError: function (context, statusCode, error) {
	    context.errorCode = statusCode;
	    context.error = error;

	    if (!context.response.headersSent) {
	        context.response.statusCode = statusCode;

	        if (this.errorPages[statusCode]) {
	            return context.response.writeFile(this.errorPages[statusCode]);
	        }
	    }
		
		if(this.errorHandler){
			this.errorHandler.processRequest(context);
		} else {
			var desc = require('./httpworkerrequest').getStatusDescription(statusCode);
			context.response.write(statusCode + ' ' + desc);
			
			if(error) {
				context.response.write('<br>');
				context.response.write(error.toString());
			}
			
			context.response.end();
		}
		
	},
	
	processRequestWithHandler: function(context){
	
		var me = this;
		
		// 当前准备输出的文件的物理位置。
		var path = context.request.physicalPath;
	
		// 使用文件方式处理请求。
		FS.stat(path, function(err, stats) {
			
			// 如果文件不存在，则调用错误报告器。
		    if (err) {

		        //// 根据指定的扩展名获取对应的 HttpHandler
		        //var handler = me.handlers[context.request.filePathExtension] || me.handlers["*"];

		        //// 如果存在对应的 Handler，则使用 Handler 继续处理请求。
		        //if (handler) {
		        //    handler.processRequest(context);
		        //} else {
		        //    context.reportError(404, err);
		        //}

		        context.reportError(404, err);
				
			// 如果目标是一个文件。
			} else if(stats.isFile()) {
			
				// 根据指定的扩展名获取对应的 HttpHandler
				var handler = me.handlers[context.request.filePathExtension] || me.handlers["*"];

				// 如果存在对应的 Handler，则使用 Handler 继续处理请求。
				if(handler){
					handler.processRequest(context);
				} else {
					context.reportError(403);
				}
				
			// 如果目标是一个文件夹。
			} else if(stats.isDirectory()) {
				
				// 如果末尾不包含 /, 自动补上。
				if(!(/\/$/).test(context.request.filePath)) {
					context.response.redirect(context.request.filePath + '/', true);
					return;
				}
				
				// 处理主页。
				for(var index in me.defaultPages){
					if(FS.existsSync(path + index)){
						context.rewritePath(context.request.filePath + index);
						return;
					}
				}

				if(me.directoryListHandler) {
					me.directoryListHandler.processRequest(context);
					return;
				}
				
				context.reportError(403);
			
			// 无权限访问。
			} else {
				context.reportError(403);
			}
			
		});
		
		return true;
		
	},
	
	process: function(httpWorkerRequest){
		this.processRequest(new HttpContext(httpWorkerRequest));
	},
	
	processRequest: function(context){
	
		// 绑定 application 对象。
		context.applicationInstance = this;
	
		var me = this;
		
		me.onBeginRequest(context);
	
		// 优先使用各个模块处理请求，如果请求处理完毕，则返回 true 。
		for(var key in me.modules){
			if(me.modules[key] && me.modules[key].processRequest(context) === true){
				return true;
			}
		}
		
		// 然后使用使用各个处理程序处理请求。
		return me.processRequestWithHandler(context);
	}

};

HttpApplication.prototype.loadConfigs(Configs.web, Configs);

module.exports = HttpApplication;