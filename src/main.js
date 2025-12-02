// the main game loop
window.PLAYGROUND = {};
PLAYGROUND.MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
PLAYGROUND.OSX = navigator.userAgent.indexOf('Mac OS X');
function playground(args) {
    return new PLAYGROUND.Application(args);
}
;

PLAYGROUND.data = {};
PLAYGROUND.images = {};
PLAYGROUND.atlases = {};
PLAYGROUND.Utils = {
    extend: function() {
        for (var i = 1; i < arguments.length; i++) {
            for (var j in arguments[i]) {
                arguments[0][j] = arguments[i][j];
            }
        }
        return arguments[0];
    },
    defaults: function() {
        for (var i = 1; i < arguments.length; i++) {
            for (var j in arguments[i]) {
                if (typeof arguments[0][j] === "undefined")
                    arguments[0][j] = arguments[i][j];
            }
        }
        return arguments[0];
    },
    merge: function(a) {
        for (var i = 1; i < arguments.length; i++) {
            var b = arguments[i];
            for (var key in b) {
                var value = b[key];
                if (typeof a[key] !== "undefined") {
                    if (typeof a[key] === "object")
                        this.merge(a[key], value);
                    else
                        a[key] = value;
                } else {
                    a[key] = value;
                }
            }
        }
        return a;
    },
    invoke: function(object, methodName) {
        var args = Array.prototype.slice.call(arguments, 2);
        for (var i = 0; i < object.length; i++) {
            var current = object[i];
            if (current[methodName])
                current[methodName].apply(current, args);
        }
    },
    throttle: function(fn, delay) {
        var timeout;
        var last = 0;
        return function() {
            var args = [];
            for (var i = 0; i < arguments.length; i++)
                args.push(arguments[i]);
            var context = this;
            if (Date.now() - last > delay) {
                last = Date.now();
                fn.apply(context, args);
                clearTimeout(timeout);
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    fn.apply(context, args);
                    last = Date.now();
                }, Date.now() - last);
            }
        }
        ;
    },
    wrapTo: function(value, target, max, step) {
        if (value === target)
            return target;
        var result = value;
        var d = this.wrappedDistance(value, target, max);
        if (Math.abs(d) < step)
            return target;
        result += (d < 0 ? -1 : 1) * step;
        if (result > max) {
            result = result - max;
        } else if (result < 0) {
            result = max + result;
        }
        return result;
    },
    wrap: function(value, min, max) {
        if (value < min)
            return max + (value % max);
        if (value >= max)
            return value % max;
        return value;
    },
    circWrap: function(val) {
        return this.wrap(val, 0, Math.PI * 2);
    },
    circWrapTo: function(value, target, step) {
        return this.wrapTo(value, target, Math.PI * 2, step);
    },
    wrappedDistance: function(a, b, max) {
        if (a === b)
            return 0;
        else if (a < b) {
            var l = -a - max + b;
            var r = b - a;
        } else {
            var l = b - a;
            var r = max - a + b;
        }
        if (Math.abs(l) > Math.abs(r))
            return r;
        else
            return l;
    },
    circWrappedDistance: function(a, b) {
        return this.wrappedDistance(a, b, Math.PI * 2)
    },
    ground: function(num, threshold) {
        return (num / threshold | 0) * threshold;
    },
    circDistance: function(a, b) {
        return this.circWrappedDistance(a, b)
    },
    distance: function(x1, y1, x2, y2) {
        if (arguments.length > 2) {
            var dx = x1 - x2;
            var dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy);
        } else {
            var dx = x1.x - y1.x;
            var dy = x1.y - y1.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
    },
    sprintf: function(string, replace) {
        for (var key in replace) {
            var find = new RegExp("{" + key + "}","g");
            string = string.replace(find, replace[key]);
        }
        return string;
    },
    classInParents: function(element, className) {
        var parent = element;
        while (parent) {
            if (parent.classList.contains(className)) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }
};
PLAYGROUND.Utils.ease = ease;
PLAYGROUND.Events = function() {
    this.listeners = {};
}
;
PLAYGROUND.Events.prototype = {
    on: function(event, callback, context) {
        if (typeof event === "object") {
            var result = {};
            for (var key in event) {
                result[key] = this.on(key, event[key], context)
            }
            return result;
        }
        if (!this.listeners[event])
            this.listeners[event] = [];
        var listener = {
            once: false,
            callback: callback,
            context: context
        };
        this.listeners[event].push(listener);
        return listener;
    },
    once: function(event, callback, context) {
        if (typeof event === "object") {
            var result = {};
            for (var key in event) {
                result[key] = this.once(key, event[key], context)
            }
            return result;
        }
        if (!this.listeners[event])
            this.listeners[event] = [];
        var listener = {
            once: true,
            callback: callback,
            context: context
        };
        this.listeners[event].push(listener);
        return listener;
    },
    off: function(event, callback) {
        for (var i = 0, len = this.listeners[event].length; i < len; i++) {
            if (this.listeners[event][i].callback === callback) {
                this.listeners[event].splice(i--, 1);
                len--;
            }
        }
    },
    trigger: function(event, data) {
        if (this.listeners["event"]) {
            for (var i = 0, len = this.listeners["event"].length; i < len; i++) {
                var listener = this.listeners["event"][i];
                listener.callback.call(listener.context || this, event, data);
            }
        }
        if (this.listeners[event]) {
            for (var i = 0, len = this.listeners[event].length; i < len; i++) {
                var listener = this.listeners[event][i];
                listener.callback.call(listener.context || this, data);
                if (listener.once) {
                    this.listeners[event].splice(i--, 1);
                    len--;
                }
            }
        }
    }
};
PLAYGROUND.States = function(app) {
    this.app = app;
    PLAYGROUND.Events.call(this);
    app.on("step", this.step.bind(this));
}
;
PLAYGROUND.States.prototype = {
    step: function(delta) {
        if (!this.next)
            return;
        if (this.current && this.current.locked)
            return;
        var state = this.next;
        if (typeof state === "function")
            state = new state;
        if (!state.__created) {
            state.__created = true;
            state.app = this.app;
            this.trigger("createstate", {
                state: state
            });
            if (state.create)
                state.create();
        }
        if (this.current) {
            this.trigger("leavestate", {
                prev: this.current,
                next: state,
                state: this.current
            });
        }
        this.trigger("enterstate", {
            prev: this.current,
            next: state,
            state: state
        });
        this.current = state;
        if (this.current && this.current.enter) {
            this.current.enter();
        }
        this.app.state = this.current;
        this.next = false;
    },
    set: function(state) {
        if (this.current && this.current.leave)
            this.current.leave();
        this.next = state;
        this.step(0);
    }
};
PLAYGROUND.Utils.extend(PLAYGROUND.States.prototype, PLAYGROUND.Events.prototype);
PLAYGROUND.Application = function(args) {
    var app = this;
    this.preventDefaults = true;
    this.killed = false;
    this.promises = {};
    this.dataSource = {};
    PLAYGROUND.Events.call(this);
    PLAYGROUND.Utils.merge(this, this.defaults, args);
    this.autoWidth = this.width ? false : true;
    this.autoHeight = this.height ? false : true;
    this.autoScale = this.scale ? false : true;
    if (!this.container)
        this.container = document.body;
    if (this.container !== document.body)
        this.customContainer = true;
    if (typeof this.container === "string")
        this.container = document.querySelector(this.container);
    this.updateSize();
    this.states = new PLAYGROUND.States(this);
    this.states.on("event", this.emitLocalEvent, this);
    this.mouse = new PLAYGROUND.Mouse(this,this.container);
    this.mouse.on("event", this.emitGlobalEvent, this);
    this.touch = new PLAYGROUND.Touch(this,this.container);
    this.touch.on("event", this.emitGlobalEvent, this);
    this.keyboard = new PLAYGROUND.Keyboard(this);
    this.keyboard.on("event", this.emitGlobalEvent, this);
    this.gamepads = new PLAYGROUND.Gamepads(this);
    this.gamepads.on("event", this.emitGlobalEvent, this);
    this.tweens = new PLAYGROUND.TweenManager(this);
    this.ease = PLAYGROUND.Utils.ease;
    window.addEventListener("storage", this.handleLocalStorage.bind(this));
    PLAYGROUND.Sound(this);
    document.addEventListener("visibilitychange", function() {
        app.handleVisibilityChange(document.hidden);
    });
    window.addEventListener("blur", this.handleBlur.bind(this));
    window.addEventListener("focus", this.handleFocus.bind(this));
    this.resizelistener = PLAYGROUND.Utils.throttle(this.handleResize.bind(this), 100);
    window.addEventListener("resize", this.resizelistener);
    this.images = PLAYGROUND.images;
    this.atlases = PLAYGROUND.atlases;
    this.data = PLAYGROUND.data;
    this.loader = new PLAYGROUND.Loader(this);
    this.loadFoo(0.25);
    this.plugins = [];
    for (var key in PLAYGROUND) {
        var property = PLAYGROUND[key];
        if (property.plugin)
            this.plugins.push(new property(this));
    }
    setTimeout(()=>{
        this.emitLocalEvent("preload");
        this.firstBatch = true;
        if (this.disabledUntilLoaded)
            this.skipEvents = true;
        function onPreloadEnd() {
            app.loadFoo(0.25);
            setTimeout(function() {
                app.emitLocalEvent("create");
                app.setState(PLAYGROUND.DefaultState);
                app.handleResize();
                if (PLAYGROUND.LoadingScreen)
                    app.setState(PLAYGROUND.LoadingScreen);
                PLAYGROUND.GameLoop(app);
                app.loader.once("ready", function() {
                    app.firstBatch = false;
                    if (app.disabledUntilLoaded)
                        app.skipEvents = false;
                    app.setState(PLAYGROUND.DefaultState);
                    app.emitLocalEvent("ready");
                    app.handleResize();
                });
            });
        }
        ;this.loader.once("ready", onPreloadEnd);
    }
    , 100);
}
;
PLAYGROUND.Application.prototype = {
    defaults: {
        background: "#272822",
        smoothing: 1,
        paths: {
            base: "",
            images: "images/",
            fonts: "fonts/",
            rewrite: {},
            rewriteURL: {}
        },
        offsetX: 0,
        offsetY: 0,
        skipEvents: false,
        disabledUntilLoaded: true,
        mouseThrottling: 15
    },
    setState: function(state) {
        this.states.set(state);
    },
    insertAsset: function(asset, collection, path=false) {
        var pathArray = path.split("/");
        var current = collection;
        for (var i = 0; i < pathArray.length - 1; i++) {
            var segment = pathArray[i];
            if (!current[segment])
                current[segment] = {};
            current = current[segment];
        }
        let last = pathArray.pop();
        current[last] = asset;
        collection[path] = asset;
    },
    getPath: function(to) {
        return this.paths.base + (this.paths[to] || (to + "/"));
    },
    rewriteURL: function(url) {
        return this.paths.rewriteURL[url] || url;
    },
    getAssetEntry: function(path, folder, defaultExtension) {
        var key;
        var url;
        var absolute = false;
        if (path[0] === "<") {
            absolute = true;
            var abslimit = path.indexOf(">");
            url = path.substr(1, abslimit - 1);
            key = path.substr(abslimit + 1).trim();
            path = url;
            url = this.rewriteURL(url);
        }
        var folder = this.paths[folder] || (folder + "/");
        var fileinfo = path.match(/(.*)\..*/);
        if (!key)
            key = fileinfo ? fileinfo[1] : path;
        var temp = path.split(".");
        var basename = path;
        if (temp.length > 1) {
            var ext = temp.pop();
            path = temp.join(".");
        } else {
            var ext = defaultExtension;
            basename += "." + defaultExtension;
        }
        if (!url)
            url = this.rewriteURL(this.paths.base + folder + basename);
        return {
            key: key,
            url: url,
            path: this.paths.base + folder + path,
            ext: ext
        };
    },
    emitLocalEvent: function(event, data) {
        this.trigger(event, data);
        if ((event !== "render" || !this.skipEvents || this.loader.ready) && this[event])
            this[event](data);
    },
    emitGlobalEvent: function(event, data) {
        if (!this.state)
            return this.emitLocalEvent(event, data);
        this.trigger(event, data);
        if ((event !== "render" || !this.skipEvents || this.loader.ready) && this.event)
            this.event(event, data);
        if ((event !== "render" || !this.skipEvents || this.loader.ready) && this[event])
            this[event](data);
        if (this.state.event)
            this.state.event(event, data);
        if (this.state[event])
            this.state[event](data);
        this.trigger("after" + event, data);
    },
    updateSize: function() {
        if (this.customContainer) {
            var containerWidth = this.container.offsetWidth;
            var containerHeight = this.container.offsetHeight;
        } else {
            var containerWidth = window.innerWidth;
            var containerHeight = window.innerHeight;
        }
        if (!this.autoScale && !this.autoWidth && !this.autoHeight) {} else if (!this.autoHeight && this.autoWidth) {
            if (this.autoScale)
                this.scale = containerHeight / this.height;
            this.width = Math.ceil(containerWidth / this.scale);
        } else if (!this.autoWidth && this.autoHeight) {
            if (this.autoScale)
                this.scale = containerWidth / this.width;
            this.height = Math.ceil(containerHeight / this.scale);
        } else if (this.autoWidth && this.autoHeight && this.autoScale) {
            this.scale = 1;
            this.width = containerWidth;
            this.height = containerHeight;
        } else if (this.autoWidth && this.autoHeight) {
            this.width = Math.ceil(containerWidth / this.scale);
            this.height = Math.ceil(containerHeight / this.scale);
        } else {
            this.scale = Math.min(containerWidth / this.width, containerHeight / this.height);
        }
        this.offsetX = (containerWidth - this.width * this.scale) / 2 | 0;
        this.offsetY = (containerHeight - this.height * this.scale) / 2 | 0;
        this.center = {
            x: this.width / 2 | 0,
            y: this.height / 2 | 0
        };
    },
    handleLocalStorage(e) {
        this.emitGlobalEvent("localstorage", e);
    },
    handleVisibilityChange: function(hidden) {
        this.emitGlobalEvent("visibilitychange", {
            visible: !hidden,
            hidden: hidden
        });
    },
    handleBlur: function(e) {
        this.emitGlobalEvent("blur", {});
    },
    handleFocus: function(e) {
        this.emitGlobalEvent("focus", {});
    },
    handleResize: function() {
        this.updateSize();
        this.emitGlobalEvent("beforeresize", {});
        this.mouse.handleResize();
        this.touch.handleResize();
        this.emitGlobalEvent("resize", {});
    },
    request: function(url) {
        url = this.rewriteURL(url);
        var app = this;
        function promise(resolve, reject) {
            var baseurl = url.split("?")[0];
            if (app.dataSource[baseurl]) {
                return resolve({
                    responseText: app.dataSource[baseurl]
                });
            }
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.onload = function(event) {
                var xhr = event.target;
                if (xhr.status !== 200 && xhr.status !== 0) {
                    return reject(new Error("Failed to get " + url));
                }
                resolve(xhr);
            }
            request.send();
        }
        return new Promise(promise);
    },
    loadFoo: function(timeout) {
        var loader = this.loader;
        this.loader.add("foo " + timeout);
        setTimeout(function() {
            loader.success("foo " + timeout);
        }, timeout * 1000);
    },
    xloadData: function() {
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg === "object") {
                for (var key in arg)
                    this.loadData(arg[key]);
            } else {
                this.loadDataItem(arg);
            }
        }
    },
    loadData: function(name) {
        if (this.promises["data_" + name])
            return this.promises["data_name"];
        let resolve;
        let promise = new Promise((_resolve)=>{
            resolve = _resolve
        }
        );
        this.promises["data_" + name] = promise;
        var entry = this.getAssetEntry(name, "data", "json");
        var app = this;
        this.loader.add();
        this.request(entry.url + (this.purgeCache ? ("?" + Date.now()) : "")).then(processData);
        function processData(request) {
            let result;
            if (entry.ext === "json") {
                try {
                    var data = JSON.parse(request.responseText);
                } catch (e) {
                    console.error("JSON file corrupt " + name);
                    return;
                }
                app.insertAsset(result = data, app.data, entry.key);
            } else {
                app.insertAsset(result = request.responseText, app.data, entry.key);
            }
            app.loader.success(entry.url);
            resolve(result);
        }
        return promise;
    },
    loadImage: function() {
        return this.loadImages.apply(this, arguments);
    },
    loadImages: function() {
        var promises = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (typeof arg === "object") {
                for (var key in arg)
                    promises = promises.concat(this.loadImages(arg[key]));
            } else {
                promises.push(this.loadOneImage(arg));
            }
        }
        return Promise.all(promises);
    },
    loadOneImage: function(name) {
        var app = this;
        if (!this._imageLoaders)
            this._imageLoaders = {};
        if (!this._imageLoaders[name]) {
            var promise = function(resolve, reject) {
                var loader = app.loader;
                var entry = app.getAssetEntry(name, "images", "png");
                app.loader.add(entry.url);
                var image = new Image;
                image.addEventListener("load", function() {
                    app.images[entry.key] = image;
                    resolve(image);
                    loader.success(entry.url);
                    entry.image = image;
                    app.insertAsset(image, app.images, entry.key);
                    app.emitLocalEvent("imageready", entry);
                });
                image.addEventListener("error", function() {
                    reject("can't load " + entry.url);
                    loader.error(entry.url);
                });
                image.src = entry.url;
            };
            app._imageLoaders[name] = new Promise(promise);
        }
        return this._imageLoaders[name];
    },
    loadFont: function() {
        var promises = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            promises.push(this.loadFontItem(arg));
        }
        return Promise.all(promises);
    },
    loadFonts: function() {
        return this.loadFont.apply(this, arguments);
    },
    loadFontItem: function(name) {
        if (!this.fontStyleSheet) {
            var style = document.createElement("style");
            document.head.appendChild(style);
            this.fontStyleSheet = style;
        }
        var entry = this.getAssetEntry(name, "fonts", "ttf");
        var format = {
            woff: "woff",
            otf: "opentype",
            ttf: "truetype"
        }[entry.ext];
        var raw = "@font-face { font-family: '{name}'; font-style: 'normal'; font-weight: 400, 800; src: url(fonts/{name}.{ext}) format('{format}'); }";
        var rule = PLAYGROUND.Utils.sprintf(raw, {
            name: name,
            ext: entry.ext,
            format: format
        });
        this.fontStyleSheet.innerHTML += rule;
        var app = this;
        if (!this._fontPromises)
            this._fontPromises = {};
        if (!this._fontPromises[name]) {
            var promise = function(resolve, reject) {
                app.loader.add("font " + name);
                var checkingTimer = setInterval(function() {
                    var base = cq(100, 32).font("14px somethingrandom").fillStyle("#fff").textBaseline("top");
                    base.context.fillText("lorem ipsum dolores sit", 0, 4);
                    var test = cq(100, 32).font("14px '" + name + "'").fillStyle("#fff").textBaseline("top");
                    test.context.fillText("lorem ipsum dolores sit", 0, 4);
                    if (!cq.compare(base, test)) {
                        app.loader.success("font" + name);
                        clearInterval(checkingTimer);
                        resolve();
                    }
                }, 100);
            }
            this._fontPromises[name] = new Promise(promise);
        }
        return this._fontPromises[name];
    },
    render: function() {},
    enableInputs: function() {
        this.mouse.enabled = true;
        this.touch.enabled = true;
        this.keyboard.enabled = true;
    },
    disableInputs: function() {
        this.mouse.enabled = false;
        this.touch.enabled = false;
        this.keyboard.enabled = false;
    },
    kill: function() {
        this.killed = true;
        this.trigger("kill");
        window.removeEventListener("resize", this.resizelistener);
    }
};
PLAYGROUND.Utils.extend(PLAYGROUND.Application.prototype, PLAYGROUND.Events.prototype);
PLAYGROUND.GameLoop = function(app) {
    let fpses = [];
    let lastFPSIndex = 0;
    app.loop = {};
    app.lifetime = 0;
    app.ops = 0;
    app.opcost = 0;
    var lastTick = Date.now();
    var frame = 0;
    function render(dt) {
        app.emitGlobalEvent("prerender", dt)
        app.emitGlobalEvent("render", dt)
        app.emitGlobalEvent("postrender", dt)
    }
    ;function step(dt) {
        app.emitGlobalEvent("step", dt)
    }
    ;function gameLoop() {
        if (app.killed)
            return;
        requestAnimationFrame(gameLoop);
        if (app.frameskip) {
            frame++;
            if (frame === app.frameskip) {
                frame = 0;
            } else
                return;
        }
        var delta = Date.now() - lastTick;
        lastTick = Date.now();
        if (delta > 1000)
            return;
        var dt = delta / 1000;
        app.lifetime += dt;
        app.elapsed = dt;
        step(dt);
        render(dt);
        app.opcost = delta / 1000;
        app.ops = 1000 / app.opcost;
        fpses[lastFPSIndex++ % 60] = 1 / dt;
        app.fps = 0;
        for (let fps of fpses)
            app.fps += fps;
        app.fps = app.fps / fpses.length | 0;
    }
    ;requestAnimationFrame(gameLoop);
    app.loop.loop = gameLoop;
    app.loop.step = step;
    app.loop.render = render;
}
;
PLAYGROUND.Gamepads = function(app) {
    this.app = app;
    PLAYGROUND.Events.call(this);
    this.getGamepads = navigator.getGamepads || navigator.webkitGetGamepads;
    this.gamepadmoveEvent = {};
    this.gamepaddownEvent = {};
    this.gamepadupEvent = {};
    this.gamepadholdEvent = {};
    this.gamepads = {};
    this.app.on("step", this.step.bind(this));
}
;
PLAYGROUND.Gamepads.prototype = {
    buttons: {
        0: "1",
        1: "2",
        2: "3",
        3: "4",
        4: "l1",
        5: "r1",
        6: "l2",
        7: "r2",
        8: "select",
        9: "start",
        10: "stick1",
        11: "stick2",
        12: "up",
        13: "down",
        14: "left",
        15: "right",
        16: "super"
    },
    zeroState: function() {
        var buttons = [];
        for (var i = 0; i <= 15; i++) {
            buttons.push({
                pressed: false,
                value: 0
            });
        }
        return {
            axes: [],
            buttons: buttons
        };
    },
    createGamepad: function() {
        var result = {
            buttons: {},
            sticks: [{
                x: 0,
                y: 0
            }, {
                x: 0,
                y: 0
            }]
        };
        for (var i = 0; i < 16; i++) {
            var key = this.buttons[i];
            result.buttons[key] = false;
        }
        return result;
    },
    step: function() {
        if (!navigator.getGamepads)
            return;
        var gamepads = navigator.getGamepads();
        for (var i = 0; i < gamepads.length; i++) {
            var current = gamepads[i];
            if (!current)
                continue;
            if (!this[i])
                this[i] = this.createGamepad();
            var buttons = [].concat(current.buttons);
            var previous = this[i];
            if (current.axes) {
                var stickChanged = false;
                var stickA = false;
                var stickB = false;
                if (previous.sticks[0].x !== current.axes[0]) {
                    stickChanged = true;
                    stickA = true;
                }
                if (previous.sticks[0].y !== current.axes[1]) {
                    stickChanged = true;
                    stickA = true;
                }
                if (previous.sticks[1].x !== current.axes[2]) {
                    stickChanged = true;
                    stickB = true;
                }
                if (previous.sticks[1].y !== current.axes[3]) {
                    stickChanged = true;
                    stickB = true;
                }
                if (stickChanged) {
                    this.gamepadmoveEvent.old = [PLAYGROUND.Utils.extend({}, previous.sticks[0]), PLAYGROUND.Utils.extend({}, previous.sticks[1])];
                    previous.sticks[0].x = current.axes[0];
                    previous.sticks[0].y = current.axes[1];
                    previous.sticks[1].x = current.axes[2];
                    previous.sticks[1].y = current.axes[3];
                    this.gamepadmoveEvent.sticks = previous.sticks;
                    this.gamepadmoveEvent.gamepad = i;
                    if (stickA) {
                        this.gamepadmoveEvent.b = false;
                        this.gamepadmoveEvent.a = previous.sticks[0];
                        this.trigger("gamepadmove", this.gamepadmoveEvent);
                    }
                    if (stickB) {
                        this.gamepadmoveEvent.a = false;
                        this.gamepadmoveEvent.b = previous.sticks[1];
                        this.trigger("gamepadmove", this.gamepadmoveEvent);
                    }
                }
            }
            for (var j = 0; j < buttons.length; j++) {
                var key = this.buttons[j];
                if (buttons[j].pressed && !previous.buttons[key]) {
                    previous.buttons[key] = true;
                    this.gamepaddownEvent.button = this.buttons[j];
                    this.gamepaddownEvent.gamepad = i;
                    this.trigger("gamepaddown", this.gamepaddownEvent);
                    this.trigger("keydown", {
                        key: "gamepad" + this.gamepaddownEvent.button,
                        gamepad: i
                    });
                }
                if (buttons[j].pressed) {
                    this.gamepadholdEvent.button = this.buttons[j];
                    this.gamepadholdEvent.gamepad = i;
                    this.gamepadholdEvent.dt = this.app.elapsed;
                    this.trigger("gamepadhold", this.gamepadholdEvent);
                } else if (!buttons[j].pressed && previous.buttons[key]) {
                    previous.buttons[key] = false;
                    this.gamepadupEvent.button = this.buttons[j];
                    this.gamepadupEvent.gamepad = i;
                    this.trigger("gamepadup", this.gamepadupEvent);
                    this.trigger("keyup", {
                        key: "gamepad" + this.gamepadupEvent.button,
                        gamepad: i
                    });
                }
            }
        }
    }
};
PLAYGROUND.Utils.extend(PLAYGROUND.Gamepads.prototype, PLAYGROUND.Events.prototype);
PLAYGROUND.Keyboard = function(app) {
    PLAYGROUND.Events.call(this);
    this.app = app;
    this.keys = {};
    this.timestamps = {};
    this.any = false;
    this.lastKey = -1;
    this.keydownlistener = this.keydown.bind(this);
    this.keyuplistener = this.keyup.bind(this);
    this.keypresslistener = this.keypress.bind(this);
    document.addEventListener("keydown", this.keydownlistener);
    document.addEventListener("keyup", this.keyuplistener);
    document.addEventListener("keypress", this.keypresslistener);
    this.keydownEvent = {};
    this.keyupEvent = {};
    this.keypressEvent = {};
    this.preventDefault = true;
    this.enabled = true;
    this.app.on("kill", this.kill.bind(this));
    this.app.on("blur", this.blur.bind(this));
    this.mapping = {};
    this.keyToCode = {};
    for (var code in this.keycodes)
        this.keyToCode[this.keycodes[code]] = code;
}
;
PLAYGROUND.Keyboard.prototype = {
    doubleTimeframe: 0.25,
    kill: function() {
        document.removeEventListener("keydown", this.keydownlistener);
        document.removeEventListener("keyup", this.keyuplistener);
        document.removeEventListener("keypress", this.keypresslistener);
    },
    keycodes: {
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "insert",
        46: "delete",
        8: "backspace",
        9: "tab",
        13: "enter",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause",
        20: "capslock",
        27: "escape",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        96: "numpad0",
        97: "numpad1",
        98: "numpad2",
        99: "numpad3",
        100: "numpad4",
        101: "numpad5",
        102: "numpad6",
        103: "numpad7",
        104: "numpad8",
        105: "numpad9",
        106: "numpadmul",
        107: "numpadadd",
        109: "numpadsub",
        110: "numpaddec",
        111: "numpaddiv",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scrolllock",
        186: "semicolon",
        187: "equal",
        188: "comma",
        189: "dash",
        190: "period",
        191: "slash",
        192: "graveaccent",
        219: "openbracket",
        220: "backslash",
        221: "closebracket",
        222: "singlequote"
    },
    bypassKeys: ["f12", "f11", "f5", "ctrl", "alt", "shift"],
    keydown: function(e) {
        if (!this.enabled)
            return;
        if (e.which >= 48 && e.which <= 90)
            var keyName = String.fromCharCode(e.which).toLowerCase();
        else
            var keyName = this.keycodes[e.which];
        if (this.mapping[keyName])
            keyName = this.mapping[keyName];
        if (this.keys[keyName])
            return;
        this.any++;
        this.keydownEvent.key = keyName;
        this.keydownEvent.original = e;
        this.keys[keyName] = true;
        if (keyName === this.lastKey && Date.now() - this.timestamps[keyName] < this.doubleTimeframe * 1000) {
            this.timestamps[keyName] = Date.now() - this.doubleTimeframe;
            this.keydownEvent.double = true;
        } else {
            this.timestamps[keyName] = Date.now();
            this.keydownEvent.double = false;
        }
        this.trigger("keydown", this.keydownEvent);
        if (this.preventDefault && document.activeElement === document.body) {
            var bypass = e.metaKey;
            if (!bypass) {
                for (var i = 0; i < this.bypassKeys.length; i++) {
                    if (this.keys[this.bypassKeys[i]]) {
                        bypass = true;
                        break
                    }
                }
            }
            if (!bypass) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        this.lastKey = keyName;
    },
    keyup: function(e) {
        if (!this.enabled)
            return;
        if (e.which >= 48 && e.which <= 90)
            var keyName = String.fromCharCode(e.which).toLowerCase();
        else
            var keyName = this.keycodes[e.which];
        if (this.mapping[keyName])
            keyName = this.mapping[keyName];
        this.any--;
        this.keyupEvent.key = keyName;
        this.keyupEvent.original = e;
        this.keys[keyName] = false;
        this.trigger("keyup", this.keyupEvent);
    },
    keypress: function(e) {
        if (!this.enabled)
            return;
        if (e.which >= 48 && e.which <= 90)
            var keyName = String.fromCharCode(e.which).toLowerCase();
        else
            var keyName = this.keycodes[e.which];
        if (this.mapping[keyName])
            keyName = this.mapping[keyName];
        this.keypressEvent.key = keyName;
        this.keypressEvent.original = e;
        this.trigger("keypress", this.keypressEvent);
    },
    blur: function(e) {
        for (var key in this.keys) {
            var state = this.keys[key];
            if (!state)
                continue;
            this.keyup({
                which: this.keyToCode[key]
            });
        }
    }
};
PLAYGROUND.Utils.extend(PLAYGROUND.Keyboard.prototype, PLAYGROUND.Events.prototype);
PLAYGROUND.Pointer = function(app) {
    this.app = app;
    this.x = 0;
    this.y = 0;
    app.on("touchstart", this.touchstart, this);
    app.on("touchend", this.touchend, this);
    app.on("touchmove", this.touchmove, this);
    app.on("mousemove", this.mousemove, this);
    app.on("mousedown", this.mousedown, this);
    app.on("mouseup", this.mouseup, this);
    app.on("mousewheel", this.mousewheel, this);
    this.pointers = app.pointers = {};
    this.app.pointer = this;
    this.lastTap = 0;
}
;
PLAYGROUND.Pointer.plugin = true;
PLAYGROUND.Pointer.prototype = {
    updatePointer: function(e) {
        if (!this.pointers[e.id])
            this.pointers[e.id] = {};
        var pointer = this.pointers[e.id];
        pointer.x = e.x;
        pointer.y = e.y;
        pointer.id = e.id;
        return pointer;
    },
    removePointer: function(e) {
        delete this.pointers[e.id];
    },
    touchstart: function(e) {
        e.touch = true;
        this.updatePointer(e);
        this.x = this.app.touch.x;
        this.y = this.app.touch.y;
        this.pointerdown(e);
        this.app.emitGlobalEvent("pointerdown", e);
    },
    touchend: function(e) {
        e.touch = true;
        this.pointerup(e);
        this.removePointer(e);
        this.app.emitGlobalEvent("pointerup", e);
    },
    touchmove: function(e) {
        e.touch = true;
        this.updatePointer(e);
        this.pointermove(e);
        this.x = this.app.touch.x;
        this.y = this.app.touch.y;
        this.app.emitGlobalEvent("pointermove", e);
    },
    mousemove: function(e) {
        e.mouse = true;
        this.updatePointer(e);
        this.pointermove(e);
        this.x = this.app.mouse.x;
        this.y = this.app.mouse.y;
        this.app.emitGlobalEvent("pointermove", e);
    },
    mousedown: function(e) {
        e.mouse = true;
        this.pressed = true;
        this.updatePointer(e);
        this.app.emitGlobalEvent("pointerdown", e);
        this.pointerdown(e);
    },
    mouseup: function(e) {
        e.mouse = true;
        this.pressed = false;
        this.pointerup(e);
        this.app.emitGlobalEvent("pointerup", e);
    },
    mousewheel: function(e) {
        e.mouse = true;
        this.app.emitGlobalEvent("pointerwheel", e);
    },
    pointerdown: function(e) {
        var pointer = this.pointers[e.id];
        e.double = false
        pointer.pressed = true;
        this.pressed = true;
        var timeFrame = this.app.lifetime - this.lastTap;
        this.lastTap = this.app.lifetime;
        if (timeFrame < 0.4 && this.lastTapPosition && PLAYGROUND.Utils.distance(e, this.lastTapPosition) < 5) {
            this.app.emitGlobalEvent("pointerdoubletap", pointer);
            e.double = true;
            this.lastTap = 0;
        }
        this.lastTapPosition = {
            x: e.x,
            y: e.y
        };
    },
    pointermove: function(e) {
        var pointer = this.pointers[e.id];
        e.dragging = pointer.dragging;
    },
    pointerup: function(e) {
        var pointer = this.pointers[e.id];
        pointer.pressed = false;
        pointer.dragging = false;
        this.pressed = false;
    }
};
PLAYGROUND.Loader = function(app) {
    this.app = app;
    PLAYGROUND.Events.call(this);
    this.reset();
}
;
PLAYGROUND.Loader.prototype = {
    add: function(id) {
        this.queue++;
        this.count++;
        this.ready = false;
        this.trigger("add", id);
        return id;
    },
    error: function(id) {
        this.trigger("error", id);
    },
    success: function(id) {
        this.queue--;
        this.progress = 1 - this.queue / this.count;
        this.trigger("progress", this.progress);
        this.trigger("load", id);
        if (this.queue <= 0) {
            this.reset();
            this.trigger("ready");
        }
    },
    reset: function() {
        this.progress = 0;
        this.queue = 0;
        this.count = 0;
        this.ready = true;
    }
};
PLAYGROUND.Utils.extend(PLAYGROUND.Loader.prototype, PLAYGROUND.Events.prototype);
PLAYGROUND.Mouse = function(app, element) {
    var self = this;
    this.app = app;
    PLAYGROUND.Events.call(this);
    this.element = element;
    this.preventContextMenu = true;
    this.enabled = true;
    this.releaseButtonsWhenOffscreen = true;
    this.mousemoveEvent = {};
    this.mousedownEvent = {};
    this.mouseupEvent = {};
    this.mousewheelEvent = {};
    this.x = 0;
    this.y = 0;
    if (app.mouseThrottling) {
        this.mousemove = PLAYGROUND.Utils.throttle(this.mousemove, app.mouseThrottling);
    }
    this.mousemovelistener = this.mousemove.bind(this);
    this.mousedownlistener = this.mousedown.bind(this);
    this.mouseuplistener = this.mouseup.bind(this);
    this.mouseoutlistener = this.mouseout.bind(this);
    this.contextmenulistener = function(e) {
        if (self.preventContextMenu && !e.metaKey) {
            e.preventDefault();
        }
    }
    ;
    element.addEventListener("mousemove", this.mousemovelistener);
    element.addEventListener("mousedown", this.mousedownlistener);
    element.addEventListener("mouseup", this.mouseuplistener);
    element.addEventListener("mouseout", this.mouseoutlistener);
    element.addEventListener("contextmenu", this.contextmenulistener);
    this.app.on("kill", this.kill.bind(this));
    this.enableMousewheel();
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
    this.handleResize();
}
;
PLAYGROUND.Mouse.prototype = {
    kill: function() {
        this.element.removeEventListener("mousemove", this.mousemovelistener);
        this.element.removeEventListener("mousedown", this.mousedownlistener);
        this.element.removeEventListener("mouseup", this.mouseuplistener);
        this.element.removeEventListener("mouseout", this.mouseoutlistener);
        this.element.removeEventListener("contextmenu", this.contextmenulistener);
    },
    mouseout: function(button) {
        if (!this.releaseButtonsWhenOffscreen)
            return;
        for (var i = 0; i < 3; i++) {
            this.mouseup({
                button: i
            });
        }
    },
    lock: function() {
        this.locked = true;
        this.element.requestPointerLock();
    },
    unlock: function() {
        this.locked = false;
        document.exitPointerLock();
    },
    getElementOffset: function(element) {
        var offsetX = 0;
        var offsetY = 0;
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
        return {
            x: offsetX,
            y: offsetY
        };
    },
    handleResize: function() {
        this.elementOffset = this.getElementOffset(this.element);
    },
    mousemove: function(e) {
        if (!this.enabled)
            return;
        this.x = this.mousemoveEvent.x = (e.pageX - this.elementOffset.x - this.app.offsetX) / this.app.scale | 0;
        this.y = this.mousemoveEvent.y = (e.pageY - this.elementOffset.y - this.app.offsetY) / this.app.scale | 0;
        this.mousemoveEvent.original = e;
        if (this.locked) {
            this.mousemoveEvent.movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            this.mousemoveEvent.movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        }
        if (this.app.mouseToTouch) {
            this.mousemoveEvent.id = this.mousemoveEvent.identifier = 255;
            this.trigger("touchmove", this.mousemoveEvent);
        } else {
            this.mousemoveEvent.id = this.mousemoveEvent.identifier = 255;
            this.trigger("mousemove", this.mousemoveEvent);
        }
    },
    mousedown: function(e) {
        if (!this.enabled)
            return;
        var buttonName = ["left", "middle", "right"][e.button];
        this.mousedownEvent.x = this.mousemoveEvent.x;
        this.mousedownEvent.y = this.mousemoveEvent.y;
        this.mousedownEvent.button = buttonName;
        this.mousedownEvent.original = e;
        this[buttonName] = true;
        this.mousedownEvent.id = this.mousedownEvent.identifier = 255;
        if (this.app.mouseToTouch) {
            this.trigger("touchmove", this.mousedownEvent);
            this.trigger("touchstart", this.mousedownEvent);
        } else {
            this.trigger("mousedown", this.mousedownEvent);
        }
        this.trigger("keydown", {
            key: "mouse" + buttonName
        });
    },
    mouseup: function(e) {
        if (!this.enabled)
            return;
        var buttonName = ["left", "middle", "right"][e.button];
        if (!this[buttonName])
            return;
        this.mouseupEvent.x = this.mousemoveEvent.x;
        this.mouseupEvent.y = this.mousemoveEvent.y;
        this.mouseupEvent.button = buttonName;
        this.mouseupEvent.original = e;
        this.mouseupEvent.id = this.mouseupEvent.identifier = 255;
        if (this.app.mouseToTouch) {
            this.trigger("touchend", this.mouseupEvent);
        } else {
            this.trigger("mouseup", this.mouseupEvent);
        }
        this.trigger("keyup", {
            key: "mouse" + buttonName
        });
        this[buttonName] = false;
    },
    mousewheel: function(e) {
        this.mousewheelEvent.x = this.mousemoveEvent.x;
        this.mousewheelEvent.y = this.mousemoveEvent.y;
        this.mousewheelEvent.button = ["none", "left", "middle", "right"][e.button];
        this.mousewheelEvent.original = e;
        this.mousewheelEvent.id = this.mousewheelEvent.identifier = 255;
        this[e.button] = false;
        this.trigger("mousewheel", this.mousewheelEvent);
        this.trigger("keydown", {
            key: e.delta > 0 ? "mousewheelup" : "mousewheeldown"
        });
    },
    enableMousewheel: function() {
        var eventNames = 'onwheel'in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
        var callback = this.mousewheel.bind(this);
        var self = this;
        var throttled = PLAYGROUND.Utils.throttle(function(event) {
            var orgEvent = event || window.event, args = [].slice.call(arguments, 1), delta = 0, deltaX = 0, deltaY = 0, absDelta = 0, absDeltaXY = 0, fn;
            if (orgEvent.wheelDelta) {
                delta = orgEvent.wheelDelta;
            }
            if (orgEvent.detail) {
                delta = orgEvent.detail * -1;
            }
            if (orgEvent.deltaY) {
                deltaY = orgEvent.deltaY * -1;
                delta = deltaY;
            }
            if (orgEvent.wheelDeltaY !== undefined) {
                deltaY = orgEvent.wheelDeltaY;
            }
            var result = delta ? delta : deltaY;
            self.mousewheelEvent.x = self.mousemoveEvent.x;
            self.mousewheelEvent.y = self.mousemoveEvent.y;
            self.mousewheelEvent.delta = result / Math.abs(result);
            self.mousewheelEvent.original = orgEvent;
            callback(self.mousewheelEvent);
            orgEvent.preventDefault();
        }, 40);
        for (var i = eventNames.length; i; ) {
            self.element.addEventListener(eventNames[--i], function(event) {
                throttled(event);
                var prevent = self.app.preventDefaults && !PLAYGROUND.Utils.classInParents(event.target, "scroll");
                if (prevent) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }, false);
        }
    }
};
PLAYGROUND.Utils.extend(PLAYGROUND.Mouse.prototype, PLAYGROUND.Events.prototype);