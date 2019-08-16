(function(global) {
  function jQuery(selector) {
    return new jQuery.prototype.init(selector);
  }

  jQuery.prototype.init = function(selector) {
    // 选出dom并包装成jq对象并返回
    this.length = 0;

    // null undefined的情况
    if (selector == null) {
      return this;
    }

    // 是字符串的情况，class或id
    if (typeof selector === "string") {
      var dom = null;
      if (selector.indexOf(".") !== -1) {
        dom = document.getElementsByClassName(selector.slice(1));
      } else if (selector.indexOf("#") !== -1) {
        dom = document.getElementsById(selector.slice(1));
      }
    }

    // 选中的是DOM或是id,只有一个直接放；有length就循环放入
    if (selector instanceof Element || !dom.length) {
      this[0] = dom || selector;
      this.length++;
    } else {
      for (var i = 0; i < dom.length; i++) {
        this[i] = dom[i];
        this.length++;
      }
    }
  };

  // 让每个方法都能返回prevObject
  jQuery.prototype.pushStack = function(dom) {
    if (dom.constructor !== jQuery) {
      dom = jQuery(dom);
    }
    dom.prevObject = this; // 谁调用，谁就是那个prevObject；这个方法都是在实例方法里面调用，this都是一开始选择到的元素
    return dom;
  };

  jQuery.prototype.css = function(config) {
    for (var i = 0; i < this.length; i++) {
      for (var attr in config) {
        this[i].style[attr] = config[attr];
      }
    }
    return this;
  };

  // get 获取选到的jq对象集合中的某一个，转成原生DOM返回，不添num，那就是全部
  jQuery.prototype.get = function(num) {
    return num === undefined
      ? [].slice.call(this, 0)
      : num >= 0
      ? this[num]
      : this[num + this.length];
  };

  // eq 获取jq对象集合中的某一个，用get方法获得到的直接jQuery包一下返回
  jQuery.prototype.eq = function(num) {
    var dom =
      num === undefined ? null : num >= 0 ? this[num] : this[num + this.length];
    return this.pushStack(dom);
  };

  // 集中操作
  jQuery.prototype.add = function(selector) {
    var curObj = jQuery(selector);
    var prevObj = this;
    var newObj = jQuery();

    for (var i = 0; i < curObj.length; i++) {
      newObj[newObj.length++] = curObj[i];
    }
    for (var i = 0; i < prevObj.length; i++) {
      newObj[newObj.length++] = prevObj[i];
    }
    return this.pushStack(newObj);
  };

  // 回退操作
  jQuery.prototype.end = function() {
    return this.prevObject;
  };

  // on绑定事件, 这个只是绑定了自定义事件，没有处理原生事件
  jQuery.prototype.on = function(type, handle) {
    for (var i = 0; i < this.length; i++) {
      if (!this[i].cacheEvent) {
        this[i].cacheEvent = {};
      }

      !this[i].cacheEvent[type]
        ? (this[i].cacheEvent[type] = [handle])
        : this[i].cacheEvent[type].push(handle);
    }
  };

  // trigger触发事件
  jQuery.prototype.trigger = function(type) {
    var params = arguments.length > 1 ? [].slice.call(arguments, 1) : [];
    var self = this;
    for (var i = 0; i < this.length; i++) {
      if (this[i].cacheEvent[type]) {
        this[i].cacheEvent[type].forEach(function(elem, index) {
          elem.apply(self, params);
        });
      }
    }
  };

  // 压入队列
  jQuery.prototype.queue = function() {
    var queueObj = this,
      queueName = arguments[0] || "fx",
      addFunc = arguments[1] || null,
      len = this.length;
    // 获取队列
    if (len === 1) {
      return queueObj[0][queueName];
    }
    // 添加队列 或 往已有队列中添加内容
    queueObj[0][queueName] === undefined
      ? (queueObj[0][queueName] = [addFunc])
      : queueObj[0][queueName].push(addFunc);

    return this;
  };

  // 出队列执行
  jQuery.prototype.dequeue = function() {
    var self = this;
    var queueName = arguments[0] || "fx";
    var queueArr = this.queue(queueName);

    var currFunc = queueArr.shift();
    if (currFunc === undefined) {
      return;
    }
    // 递归执行自己，就是执行下一个
    var next = function() {
      self.dequeue(queueName);
    };
    currFunc(next);
    return this;
  };

  // 动画
  jQuery.prototype.animate = function(json, callback) {
    var len = this.length;
    var self = this;
    var baseFunc = function(next) {
      var times = 0;
      for (var i = 0; i < len; i++) {
        startMove(self[i], json, function() {
          times++;
          if (times === len) {
            callback && callback();
            next();
          }
        });
      }
    };

    this.queue("fx", baseFunc);

    if (this.queue("fx").length === 1) {
      this.dequeue("fx");
    }
  };

  //延迟
  jQuery.prototype.delay = function(duration) {
    var queueArr = this[0]["fx"];
    queueArr.push(function(next) {
      setTimeout(function() {
        next();
      }, duration);
    });
    return this;
  };

  jQuery.Callbacks = function() {
    // 储存参数
    var options = arguments[0] || "";
    // 通过add添加方法
    var list = [];
    // 记录当前要执行的函数的索引
    var fireIndex = 0;
    // 记录是否被fire过
    var fired = false;
    // 实际参数列表
    var args = [];

    var fire = function() {
      for (; fireIndex < list.length; fireIndex++) {
        list[fireIndex].apply(window, args);
      }
      if (options.indexOf("once") !== -1) {
        list = [];
        fireIndex = 0;
      }
    };

    return {
      add: function(func) {
        list.push(func);
        if (options.indexOf("memory") !== -1) {
          fired && fire();
        }
        return this;
      },
      fire: function() {
        fireIndex = 0;
        args = arguments;
        fired = true;
        fire();
      }
    };
  };

  jQuery.deferred = function() {
    var arrCallbacks = [
      [jQuery.Callbacks("once memory"), "done", "resolve"],
      [jQuery.Callbacks("once memory"), "fail", "reject"],
      [jQuery.Callbacks("memory"), "progress", "notify"]
    ];
    var pendding = true;
    var deferred = {};
    for (var i = 0; i < arrCallbacks.length; i++) {
      deferred[arrCallbacks[i][1]] = (function(index) {
        return function(func) {
          arrCallbacks[index][0].add(func);
        };
      })(i);
      // 触发
      deferred[arrCallbacks[i][2]] = (function(index) {
        return function() {
          if (pendding) {
            arrCallbacks[index][0].fire.apply(window, arguments);
            pendding =
              arrCallbacks[index][2] === "resolve" || "reject" ? false : true;
          }
        };
      })(i);
    }

    return deferred;
  };

  jQuery.prototype.init.prototype = jQuery.prototype; // 是以init为构造函数创建出来的，所有需要把jq的原型赋给init的原型
  global.$ = global.jQuery = jQuery; // 把jQuery赋给window的$和jQuery属性
})(window);
