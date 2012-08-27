/** * @author  */imports("Controls.Form.MonthCalender");using("System.Utils.Date")  ;using("System.Fx.Animate");using("Controls.Core.IInput");var MonthCalender = (function(){		function getDateIn(date, fullYear, month){		return date.getFullYear() == fullYear && date.getMonth() == month ? date.getDate() : 0 		}		// 显示天。	var DecadeView = {						render: function(calender, container) {											// 初始化容器 -> days 。				calender._renderContainerOfMonthsAndYears(container);								// 目前的月。				var date = calender.currentDate,									// 目前的月。					year = date.getFullYear(),										cyear = year;									year = ((year / 100) | 0) * 100;								// 设置顶部标题。				calender.header.setText(year + '-' + (year + 99));								year--;								Object.each(container.node.getElementsByTagName('a'), function(a, i){										a.className = i === 0 || i === 11 ? 'x-monthcalender-decade x-monthcalender-alt' : 'x-monthcalender-decade';										if(cyear >= year && cyear <= year + 9){						a.className += ' x-monthcalender-selected';						}					a.tag = year + 5;										a.innerHTML = year + '-<br>' + (year + 9) + '&nbsp;';										year += 10;				});			},						top: function(calender){				YearView.top(calender);			},						switchTo: function(View, calender){								// 显示月。				View.render(calender, calender.contentProxy);								// 设置当前视图。				calender.currentView = View;								// 特效显示。				calender._switchContentFromFade();			},						select: function(calender, node){								calender.currentDate.setYear(node.tag);				DecadeView.switchTo(YearView, calender);				},						next: function(calender){								// 重新计算月。				calender.currentDate.addYear(100);			},						previous: function(calender){								// 重新计算月。				calender.currentDate.addYear(-100);							}		},				YearView = {						render: function(calender, container) {											// 初始化容器 -> days 。				calender._renderContainerOfMonthsAndYears(container);								// 目前的月。				var date = calender.currentDate,									// 目前的年。					year = date.getFullYear(),										cyear = year;									year = ((year / 10) | 0) * 10;								// 设置顶部标题。				calender.header.setText(year + '-' + (year + 9));								year--;								Object.each(container.node.getElementsByTagName('a'), function(a, i){										a.className = i === 0 || i === 11 ? 'x-monthcalender-alt' : '';										if(cyear === year){						a.className += ' x-monthcalender-selected';						}										a.innerHTML = a.tag = year++;				});			},						select: function(calender, node){								calender.currentDate.setYear(node.tag);									DecadeView.switchTo(MonthView, calender);				},						parent: DecadeView,						next: function(calender){								// 重新计算月。				calender.currentDate.addYear(10);								},						previous: function(calender){								// 重新计算月。				calender.currentDate.addYear(-10);				}					},				MonthView = {						render: function(calender, container) {												// 初始化容器 -> days 。				calender._renderContainerOfMonthsAndYears(container);								// 目前的月。				var date = calender.currentDate,									// 目前的月。					month = date.getMonth(),								// 显示所有月 。					months = MonthCalender.months;								Object.each(container.node.getElementsByTagName('a'), function(a, i){										a.tag = i;										a.className = i === month ? 'x-monthcalender-selected' : '';															a.innerHTML = months[i];				});								// 设置顶部标题。				calender.header.setText(date.getFullYear());			},						parent: YearView,						select: function(calender, node){								calender.currentDate.setMonth(node.tag);									DecadeView.switchTo(DayView, calender);							},						next: function(calender){								// 重新计算月。				calender.currentDate.addYear(1);				},						previous: function(calender){								// 重新计算月。				calender.currentDate.addYear(-1);				}					},				DayView = {						render: function(calender, container){								// 初始化容器 -> days 。				calender._renderContainerOfDays(container);								// 目前的时间。				var date = calender.currentDate,									// 每项的样式，对于非当前月显示时需要 disabled。					cls = 'x-monthcalender-alt',									// 获取当前年 。					fullYear = date.getFullYear(),										// 获取当前月。					month = date.getMonth(),										// 对选择的项 添加 selected					// 下面对日期判断, 如果 = v 或 cd 则表示特殊日。					// 由于只对某月有关，因此，如果不是当前的页，直接等于 0 。					v = getDateIn(calender.value, fullYear, month),					cd = getDateIn(calender.today, fullYear, month);								// 设置顶部标题。				calender.header.setText(date.toString(MonthCalender.current));								// 先获得月初。				date = new Date(fullYear, month, 1);								// 调整为星期天。 节约变量。				month = date.getDay();				date.addDay(month === 0 ? -7 : -month);								// 对每个 a 绑定，共 6 * 7  。				Object.each(container.node.getElementsByTagName('a'), function(a){										// 获取当前日期。					var day = date.getDate();										// 显示。					a.innerHTML = day;										// 如果是第一天，切换 是否当前月 。					if(day == 1){						cls = cls ? '' : 'x-monthcalender-alt';					}										// 设置属性。					a.className = cls;										// 如果是本日。					if(cd == day && !cls)						a.className += ' x-monthcalender-actived';										// 如果是选择的。					if(v == day && !cls)						a.className += ' x-monthcalender-selected';										// 计算下一天。					date.setDate(day + 1);									});							},						parent: MonthView,						select: function(calender, node, e){								var newValue = calender.currentDate.clone(), date = parseInt(node.innerHTML);								// 如果是disbaled， 则是上个月或下个月				if (node.className == 'x-monthcalender-alt') {					newValue.addMonth(date < 15 ? 1 : -1);					newValue.setDate(date);					calender.value = newValue;					if(date < 15){						calender.onNext();					} else {						calender.onPrevious();					}				} else {					newValue.setDate(date);					calender.onItemClick(e, newValue);				}			},						next: function(calender){								// 重新计算月。				calender.currentDate.addMonth(1);				},						previous: function(calender){								// 重新计算月。				calender.currentDate.addMonth(-1);				}					};		DecadeView.parent = DecadeView;		return Control.extend({				width: 172,				xtype: 'monthcalender',			tpl: '<div class="x-monthcalender">\		       <div class="x-monthcalender-wrap">\		        <div class="x-monthcalender-header">\		            <a class="x-monthcalender-previous" href="javascript://上一个">\		                ◂\		            </a>\		            <a href="javascript://更改时间" class="x-monthcalender-title">\		            </a>\		            <a class="x-monthcalender-next" href="javascript://下一个">\		                ▸\		            </a>\		        </div>\		        <div class="x-monthcalender-body">\		            <div class="x-monthcalender-content">\		                <div style="left:1px; top:1px;"></div>\						<div style="left:172px; top:1px;"></div>\					</div>\		        </div>\		    	<div class="x-monthcalender-footer">\		    		<a href="javascript://今天"></a>\		    	</div>\		      </div>\			</div>',					currentView: DayView,				duration: -1,			options: {			today: new Date(),			value: new Date()		},				_renderContainer: function(container, className, width, height){						if(container.node.className == className)				return false;						container.empty();			container.node.className = className;			for(var i = 0, j, c, a; i < width; i++){				container.node.appendChild(c = document.createElement('div'));				for(j = 0; j < height; j++) {					a = document.createElement('a');					a.href = 'javascript:;';					c.appendChild(a);				}			}						return true;		},				// 创建容纳 days 的节点。		_renderContainerOfDays: function(container){						if (this._renderContainer(container, 'x-monthcalender-days', 6, 7)) {							var weeks = container.prepend(Dom.create('div', 'x-monthcalender-week'));								Object.each(MonthCalender.weeks, function(name, week) {					weeks.append(Dom.create('span', 'x-monthcalender-' + week).setHtml(name));				});							}		},				_renderContainerOfMonthsAndYears: function(container){			this._renderContainer(container, 'x-monthcalender-monthyears', 3, 4);		},				_switchContent: function(oldLeft, sliderLeft, newLeft, tweenLeft){			var oldContent = this.content,				newContent = this.contentProxy,				slider = newContent.parent();						oldContent.node.style.left = oldLeft + 'px';			slider.node.style.left = sliderLeft + 'px';			newContent.node.style.left = newLeft + 'px';			slider.animate({left: tweenLeft }, this.duration, null, 'abort');						this.content = newContent;			this.contentProxy = oldContent;		},				_switchContentFromRight: function(){			return this._switchContent(1, 1, this.width, -this.width);		},				_switchContentFromLeft: function(){			return this._switchContent(this.width, -this.width, 1, 1);		},				_switchContentFromFade: function(){			var me = this,				oldContent = me.content,				newContent = me.contentProxy,				slider = newContent.node.parentNode,				duration = me.duration / 2,				newStyle = newContent.node.style,				oldStyle = oldContent.node.style;						newContent.setStyle('opacity', 0);			slider.style.left = oldStyle.left = newStyle.left = '1px';			newStyle.zIndex = 2;			oldStyle.zIndex = 1;			newContent.animate({opacity: 1}, duration, null, 'replace');			oldContent.animate({opacity: 0}, duration, function(){				newStyle.left = '1px';				oldStyle.left =  me.width + 'px';				oldContent.setStyle('opacity', 1);			}, 'replace');						me.content = newContent;			me.contentProxy = oldContent;		},				onPrevious: function(){						var me = this,				scr = this.currentView;						scr.previous(this);						// 渲染到代理。			scr.render(me, me.contentProxy);						// 特效显示。			me._switchContentFromLeft();		},				onNext: function(){						var me = this,				scr = this.currentView;						scr.next(this);						// 渲染到代理。			scr.render(me, me.contentProxy);						// 特效显示。			me._switchContentFromRight();		},				onTop: function(){						var me = this,				p = me.currentView.parent;						// 显示月。			p.render(me, me.contentProxy);						// 设置当前视图。			me.currentView = p;						// 特效显示。			me._switchContentFromFade();					},				onClick: function(e){			var target = e.target;			if (target.tagName === 'A') {				this.currentView.select(this, target, e);			}		},				onItemClick: function(e, value){			if(this.onSelect(value)) {				if (this.value - value !== 0) {					this.value = value;										// 触发内容改变。					this.onChange(value);										// 更新页面。					this.currentView.render(this, this.content);									}			} else {				e.stop();				}		},				onSelectTodayClick: function (e) {			this.onItemClick(e, this.today);		},				onSelect: function (value) {			return this.trigger('select', value);		},				onChange: function(value){			return this.trigger('change', value);		},				init: function(){			var me = this.unselectable();			me.header = me.find('.x-monthcalender-title').on('click', me.onTop, me);						me.find('.x-monthcalender-previous').on('click', me.onPrevious, me);			me.find('.x-monthcalender-next').on('click', me.onNext, me);						var container = this.find('.x-monthcalender-content');			me.content = container.first(0).on('click', me.onClick, me);			me.contentProxy = container.first(1).on('click', me.onClick, me);						me.find('.x-monthcalender-footer a').on('click', me.onSelectTodayClick, me);			},				setToday: function(value){			this.find('.x-monthcalender-footer a').setHtml(value.toString(MonthCalender.today));			this.today = value;		},				// 切换当前显示的界面。		setView: function(name){			var scr;			switch(name){				case 'day':					scr = DayView;					break;				case 'month':					scr = MonthView;					break;				case 'year':					scr = YearView;					break;				case 'decade':					scr = DecadeView;					break;			}						this.currentView = scr;			scr.render(this, this.content);		},				setValue: function(value){ 					var changed = this.value !== value;						// 设置值。			this.value = value;						// 设置目前显示的时间。			this.currentDate = new Date(value.getFullYear(), value.getMonth());						this.setView('day');						if(changed)				this.onChange(value);			return this;		},			getValue: function(fn){			return this.value;		}	}).implement(IInput).addEvents('select change');			})();Object.extend(MonthCalender, {			months: "一月 二月 三月 四月 五月 六月 七月 八月 九月 十月 十一月 十二月".split(' '),		weeks: {		sunday: '日',		monday: '一',		tuesday: '二',		wednesday: '三',		thursday: '四',		friday: '五',		saturday: '六'	},		current: 'yyyy年M月',		today: '今天: yyyy年M月d日'	});