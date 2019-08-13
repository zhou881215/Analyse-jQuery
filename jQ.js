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

  jQuery.prototype.init.prototype = jQuery.prototype; // 是以init为构造函数创建出来的，所有需要把jq的原型赋给init的原型
  global.$ = global.jQuery = jQuery; // 把jQuery赋给window的$和jQuery属性
})(window);
