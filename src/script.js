NAMESPACE = CLIENT = Object.create(null);
NAMESPACE.Manipulators = Object.create(null);
if (typeof window !== "undefined") {
    window.COMMON = Object.create(null);
} else {
    global.COMMON = Object.create(null);
}

COMMON.itemsByIndex = [];
{
    let index = 0;
    for (let key in COMMON.itemsByKey) {
        COMMON.itemsByKey[key].index = index;
        COMMON.itemsByKey[key].key = key;
        COMMON.itemsByIndex[index] = COMMON.itemsByKey[key];
        COMMON["ITEM_" + key.toUpperCase()] = index;
        index++;
    }
}
COMMON.tags = {};
{
    for (let key in COMMON.items) {
        let def = COMMON.items[key];
        if (!def.tags)
            continue;
        for (let tag of def.tags) {
            if (!COMMON.tags[tag])
                COMMON.tags[tag] = [];
            COMMON.tags[tag].push(def);
        }
    }
}
COMMON.TASKS = {
    IDLE: 0,
    FIGHT: 1,
    LOOT: 2,
    RECOVER: 3,
    CAMP: 4,
    HUNT: 5,
    LEAD: 6,
    COLLECT: 7,
    READY: 8,
    LUMBER: 9,
    BIRTH: 10,
    MINE: 11,
    RUN: 12,
    EAT: 13,
    HARVEST: 14,
    DIE: 15,
    PANIC: 16,
    GET_INTO_BUILDING: 17,
    SHOOT: 18,
    DEMOLISH: 19,
    BUILD: 20
}
COMMON.DEATH_NORMAL = 2;
COMMON.STATUS = {
    DEAD: 0,
    LOOTED: 1
};
COMMON.TREE_OK = 0;
COMMON.TREE_FALLING = 1;
COMMON.TREE_FALLEN = 2;
COMMON.TREE_DEAD = 3;
COMMON.canEquip = function(who, what) {
    if (who.isKing)
        return false;
    let def = COMMON.items[what];
    if (def.slot === "weapon" && who.weapon)
        return false;
    if (def.slot === "shield" && who.weapon == COMMON.ITEM_BOW)
        return false;
    if (def.tier !== undefined) {
        let def2 = COMMON.itemsByIndex[who[def.slot]];
        if (def2.tier >= def.tier)
            return false;
    }
    return true;
}
;
COMMON.getMaxHealth = function(who) {
    let maxHealth = 10;
    if (who.helmet) {
        let helmet = COMMON.itemsByIndex[who.helmet];
        maxHealth += helmet.health;
    }
    return maxHealth;
}
;
COMMON.getTribeScore = function(tribe) {
    let score = 0;
    for (let m of tribe.members)
        score += this.getTribesmanScore(m);
    return score;
}
;
COMMON.getTribesmanScore = function(who) {
    let score = 1;
    score += who.weaponDef.cost | 0;
    score += who.helmetDef.cost | 0;
    score += who.shieldDef.cost | 0;
    return Math.max(1, score);
}
;

COMMON.validateChatCharacters = function(val) {
    val = val.replace(/[^a-zA-Z0-9_\s\.,:/\?\)\(\]\[\!']/g, '');
    return val;
}
COMMON.modes = {};
COMMON.modes["Sandbox"] = {
    teams: 2,
    playersPerTeam: 3,
    maxPlayers: 20,
    expToScore: true
};
COMMON.modes["Castle"] = {
    teams: 2,
    maxPlayers: 30,
    expToScore: true,
    advancedContent: true
};
COMMON.modes["Domination"] = {
    maxPlayers: 30
};
COMMON.modes["BattleRoyale"] = {
    ffa: true,
    maxPlayers: 20,
    shrinkSpeed: 2,
    unlimitedRecruits: true
};
COMMON.nodeOffsets = [[2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [-1, 2], [-2, 2], [-2, 1], [-2, 0], [-2, -1], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [2, -1], ];
COMMON.nodeOffsets = [[2, 0], [2, 1], [1, 1], [1, 2], [0, 2], [-1, 2], [-1, 1], [-2, 1], [-2, 0], [-2, -1], [-1, -1], [-1, -2], [0, -2], [1, -2], [1, -1], [2, -1], ];
COMMON.o4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];


{
    let IOG = function(args) {
        this.initialState = true;
        if (window.ENV) {
            this.host = ENV.iog_host;
        }
        Object.assign(this, args);
        this.userToken = this.initialState ? this.getUserToken() : null;
        setInterval(this.trackChanges.bind(this), 1000);
        setTimeout(this.trackChanges.bind(this), 1);
    };
    IOG.prototype = {
        host: "instantonline.io",
        onLogin() {},
        onLogout() {},
        onChange() {},
        isLoggedIn() {
            return Boolean(this.getUserToken());
        },
        trackChanges() {
            let userToken = this.getUserToken();
            if (this.userToken === userToken)
                return;
            this.onChange();
            if (userToken)
                this.onLogin();
            else
                this.onLogout();
            this.userToken = userToken;
        },
        getCookie: function(a) {
            var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
            return b ? b.pop() : '';
        },
        login(a, b) {
            let options = {};
            let callback;
            if (arguments.length === 1) {
                callback = arguments[0] || function() {}
                ;
            }
            if (arguments.length === 2) {
                Object.assign(options, arguments[0]);
                callback = arguments[1] || function() {}
                ;
            }
            let close = ()=>{
                if (!this.loginWindow)
                    return;
                document.body.removeChild(this.loginWindow);
                this.loginWindow = null;
            }
            if (this.loginWindow)
                close();
            let iframe = document.createElement("iframe");
            let src = "//" + this.host + "/widgets/login/?action=close";
            ;if (options.email_redirect)
                email_redirect = encodeURIComponent()
            iframe.src = src;
            this.loginWindow = iframe;
            Object.assign(iframe.style, {
                left: "0%",
                top: "0%",
                position: "absolute",
                zIndex: 1000,
                width: "100%",
                height: "100%",
                border: "0",
            });
            document.body.appendChild(iframe);
            window.addEventListener("message", (e)=>{
                if (e.data === "LoginCancelled") {
                    close();
                }
                if (e.data === "LoginSuccessful") {
                    close();
                    if (callback)
                        callback(false, this.getUserToken());
                }
            }
            );
        },
        logout() {
            fetch("//" + this.host + "/app/logout", {
                method: "post"
            });
        },
        me() {
            return fetch("//" + this.host + "/app/me", {
                method: "get"
            }).then(function(r) {
                return r.json();
            });
        },
        getUserToken() {
            return this.getCookie("iog_secret");
        },
        promo(callback) {
            let resolve, reject;
            let result = new Promise(function(_resolve, _reject) {
                resolve = _resolve;
            }
            );
            callback = callback || function() {}
            ;
            let close = ()=>{
                if (!this.promoWindow)
                    return;
                document.body.removeChild(this.promoWindow);
                this.promoWindow = null;
            }
            if (this.promoWindow)
                close();
            let iframe = document.createElement("iframe");
            iframe.src = "//" + this.host + "/widgets/more-games/?action=close";
            this.promoWindow = iframe;
            Object.assign(iframe.style, {
                left: "0%",
                top: "0%",
                position: "absolute",
                zIndex: 1000,
                width: "100%",
                height: "100%",
                border: "0",
            });
            document.body.appendChild(iframe);
            window.addEventListener("message", (e)=>{
                close();
                resolve(e.data);
            }
            );
            return result;
        },
        getUserBarWidget(options={}) {
            let iframe = document.createElement("iframe");
            let src = "//" + this.host + "/widgets/user-bar?";
            if (options.theme)
                src += "theme=" + options.theme + "&";
            iframe.src = src;
            iframe.classList.add("iog-userbar-widget")
            Object.assign(iframe.style, {
                border: "0"
            });
            window.addEventListener("message", (e)=>{
                if (e.data === "login") {
                    this.login();
                }
            }
            );
            return iframe;
        }
    };
    window.InstantOnlineGaming = IOG;
}

// where the big layer js file stuff was

// where the ease math file was

PLAYGROUND.Touch = function(app, element) {
    PLAYGROUND.Events.call(this);
    this.app = app;
    this.element = element;
    this.touches = {};
    this.enabled = true;
    this.x = 0;
    this.y = 0;
    this.touchmovelistener = this.touchmove.bind(this);
    this.touchstartlistener = this.touchstart.bind(this);
    this.touchendlistener = this.touchend.bind(this);
    element.addEventListener("touchmove", this.touchmovelistener, {
        passive: false
    });
    element.addEventListener("touchstart", this.touchstartlistener, {
        passive: false
    });
    element.addEventListener("touchend", this.touchendlistener, {
        passive: false
    });
    this.app.on("kill", this.kill.bind(this));
}
;
PLAYGROUND.Touch.prototype = {
    kill: function() {
        this.element.removeEventListener("touchmove", this.touchmovelistener);
        this.element.removeEventListener("touchstart", this.touchstartlistener);
        this.element.removeEventListener("touchend", this.touchendlistener);
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
    touchmove: function(e) {
        if (!this.enabled)
            return;
        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            touchmoveEvent = {}
            this.x = touchmoveEvent.x = (touch.pageX - this.elementOffset.x - this.app.offsetX) / this.app.scale | 0;
            this.y = touchmoveEvent.y = (touch.pageY - this.elementOffset.y - this.app.offsetY) / this.app.scale | 0;
            touchmoveEvent.original = touch;
            touchmoveEvent.id = touchmoveEvent.identifier = touch.identifier;
            this.touches[touch.identifier].x = touchmoveEvent.x;
            this.touches[touch.identifier].y = touchmoveEvent.y;
            this.trigger("touchmove", touchmoveEvent);
        }
        var prevent = this.app.preventDefaults && !PLAYGROUND.Utils.classInParents(e.target, "ui");
        if (prevent)
            e.preventDefault();
    },
    touchstart: function(e) {
        if (!this.enabled)
            return;
        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            var touchstartEvent = {}
            this.x = touchstartEvent.x = (touch.pageX - this.elementOffset.x - this.app.offsetX) / this.app.scale | 0;
            this.y = touchstartEvent.y = (touch.pageY - this.elementOffset.y - this.app.offsetY) / this.app.scale | 0;
            touchstartEvent.original = e.touch;
            touchstartEvent.id = touchstartEvent.identifier = touch.identifier;
            this.touches[touch.identifier] = {
                x: touchstartEvent.x,
                y: touchstartEvent.y
            };
            this.trigger("touchstart", touchstartEvent);
        }
        var prevent = this.app.preventDefaults && !PLAYGROUND.Utils.classInParents(e.target, "ui");
        if (prevent)
            e.preventDefault();
    },
    touchend: function(e) {
        if (!this.enabled)
            return;
        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches[i];
            var touchendEvent = {};
            touchendEvent.x = (touch.pageX - this.elementOffset.x - this.app.offsetX) / this.app.scale | 0;
            touchendEvent.y = (touch.pageY - this.elementOffset.y - this.app.offsetY) / this.app.scale | 0;
            touchendEvent.original = touch;
            touchendEvent.id = touchendEvent.identifier = touch.identifier;
            delete this.touches[touch.identifier];
            this.trigger("touchend", touchendEvent);
        }
        var prevent = this.app.preventDefaults && !PLAYGROUND.Utils.classInParents(e.target, "ui");
        if (prevent)
            e.preventDefault();
    }
};
PLAYGROUND.Utils.extend(PLAYGROUND.Touch.prototype, PLAYGROUND.Events.prototype);
PLAYGROUND.Tween = function(manager, context) {
    PLAYGROUND.Events.call(this);
    this.manager = manager;
    this.context = context;
    this.auto = true;
    PLAYGROUND.Utils.extend(this, {
        prevEasing: "linear",
        prevDuration: 0.5
    });
    this.clear();
}
;
PLAYGROUND.Tween.prototype = {
    manual: function() {
        this.auto = false;
        return this;
    },
    add: function(properties, duration, easing) {
        if (typeof duration !== "undefined")
            this.prevDuration = duration;
        else
            duration = 0.5;
        if (easing)
            this.prevEasing = easing;
        else
            easing = "linear";
        this.actions.push([properties, duration, easing]);
        return this;
    },
    clear: function() {
        this.actions = [];
        this.index = -1;
        this.current = false;
        return this;
    },
    discard: function() {
        this.manager.discard(this.context, this);
        return this;
    },
    to: function(properties, duration, easing) {
        return this.add(properties, duration, easing);
    },
    call: function(methodName, context) {
        var action = ["call", methodName, context || this.context];
        for (var i = 2; i < arguments.length; i++)
            action.push(arguments[i]);
        this.actions.push(action);
        return this;
    },
    loop: function() {
        this.looped = true;
        return this;
    },
    repeat: function(times) {
        this.actions.push(["repeat", times]);
        return this;
    },
    wait: function(time) {
        this.actions.push(["wait", time]);
        return this;
    },
    delay: function(time) {
        this.actions.push(["wait", time]);
        return this;
    },
    set: function(key, val) {
        this.actions.push(["set", key, val]);
        return this;
    },
    then: function(callback) {
        this.actions.push(["then", callback]);
        return this;
    },
    stop: function() {
        this.manager.remove(this);
        return this;
    },
    play: function() {
        this.manager.add(this);
        this.finished = false;
        return this;
    },
    end: function() {
        var lastAnimationIndex = 0;
        for (var i = this.index + 1; i < this.actions.length; i++) {
            if (typeof this.actions[i][0] === "object")
                lastAnimationIndex = i;
        }
        this.index = lastAnimationIndex - 1;
        this.next();
        this.delta = this.duration;
        this.step(0);
        return this;
    },
    forward: function() {
        this.delta = this.duration;
        this.step(0);
    },
    rewind: function() {
        this.delta = 0;
        this.step(0);
    },
    next: function() {
        this.delta = 0;
        this.index++;
        if (this.index >= this.actions.length) {
            if (this.looped) {
                this.trigger("loop", {
                    tween: this
                });
                this.index = 0;
            } else {
                this.manager.remove(this);
                return;
            }
        }
        this.current = this.actions[this.index];
        if (this.current[0] === "call") {
            var args = this.current.slice(2);
            var methodName = this.current[1];
            var context = this.current[2];
            var method = context[methodName];
            method.apply(context, args);
            this.next();
        } else if (this.current[0] === "set") {
            this.context[this.current[1]] = this.current[2];
            this.next();
        } else if (this.current[0] === "wait") {
            this.duration = this.current[1];
            this.currentAction = "wait";
        } else if (this.current[0] === "then") {
            this.current[1](this.context);
            this.currentAction = "then";
            this.next();
        } else {
            var properties = this.current[0];
            this.keys = Object.keys(properties);
            this.change = [];
            this.before = [];
            this.types = [];
            for (var i = 0; i < this.keys.length; i++) {
                var key = this.keys[i];
                var value = this.context[key];
                if (typeof properties[key] === "number") {
                    value = value || 0;
                    this.before.push(value);
                    this.change.push(properties[key] - value);
                    this.types.push(0);
                } else if (typeof properties[key] === "string" && properties[key].indexOf("rad") > -1) {
                    value = value || 0;
                    this.before.push(value);
                    this.change.push(PLAYGROUND.Utils.circWrappedDistance(value, parseFloat(properties[key])));
                    this.types.push(2);
                } else {
                    value = value || "#000";
                    var before = cq.color(value);
                    this.before.push(before);
                    var after = cq.color(properties[key]);
                    var temp = [];
                    for (var j = 0; j < 3; j++) {
                        temp.push(after[j] - before[j]);
                    }
                    this.change.push(temp);
                    this.types.push(1);
                }
            }
            this.currentAction = "animate";
            this.duration = this.current[1];
            this.easing = this.current[2];
        }
    },
    prev: function() {},
    step: function(delta) {
        this.delta += delta;
        if (!this.current)
            this.next();
        switch (this.currentAction) {
        case "animate":
            this.doAnimate(delta);
            break;
        case "wait":
            this.doWait(delta);
            break;
        }
    },
    doAnimate: function(delta) {
        this.progress = this.duration ? Math.min(1, this.delta / this.duration) : 1.0;
        var mod = PLAYGROUND.Utils.ease(this.progress, this.easing);
        for (var i = 0; i < this.keys.length; i++) {
            var key = this.keys[i];
            switch (this.types[i]) {
            case 0:
                this.context[key] = this.before[i] + this.change[i] * mod;
                break;
            case 1:
                var change = this.change[i];
                var before = this.before[i];
                var color = [];
                for (var j = 0; j < 3; j++) {
                    color.push(before[j] + change[j] * mod | 0);
                }
                this.context[key] = "rgb(" + color.join(",") + ")";
                break;
            case 2:
                this.context[key] = PLAYGROUND.Utils.circWrap(this.before[i] + this.change[i] * mod);
                break;
            }
        }
        if (this.progress >= 1) {
            this.next();
        }
        if (this.listeners["step"]) {
            this.trigger("step", {
                tween: this,
                dt: delta
            });
        }
    },
    doWait: function(delta) {
        if (this.delta >= this.duration)
            this.next();
    },
    onremove: function() {
        this.trigger("finished", {
            tween: this
        });
        this.trigger("finish", {
            tween: this
        });
        this.finished = true;
    }
};
PLAYGROUND.Utils.extend(PLAYGROUND.Tween.prototype, PLAYGROUND.Events.prototype);
PLAYGROUND.TweenManager = function(app) {
    this.tweens = [];
    if (app) {
        this.app = app;
        this.app.tween = this.tween.bind(this);
    }
    this.delta = 0;
    this.app.on("step", this.step.bind(this));
}
;
PLAYGROUND.TweenManager.prototype = {
    defaultEasing: "128",
    circ: function(value) {
        return {
            type: "circ",
            value: value
        };
    },
    discard: function(object, safe) {
        for (var i = 0; i < this.tweens.length; i++) {
            var tween = this.tweens[i];
            if (tween.context === object && tween !== safe)
                this.remove(tween);
        }
    },
    tween: function(context) {
        var tween = new PLAYGROUND.Tween(this,context);
        this.add(tween);
        return tween;
    },
    step: function(delta) {
        this.delta += delta;
        for (var i = 0; i < this.tweens.length; i++) {
            var tween = this.tweens[i];
            if (!tween.auto)
                continue;
            if (!tween._remove)
                tween.step(delta);
            if (tween._remove)
                this.tweens.splice(i--, 1);
        }
    },
    add: function(tween) {
        tween._remove = false;
        var index = this.tweens.indexOf(tween);
        if (index === -1)
            this.tweens.push(tween);
    },
    remove: function(tween) {
        if (tween._remove)
            return;
        tween._remove = true;
        tween.onremove();
    }
};
PLAYGROUND.Application.prototype.loadAtlases = function() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (typeof arg === "object") {
            for (var key in arg)
                this.loadAtlases(arg[key]);
        } else {
            this._loadAtlas(arg)
        }
    }
}
;
PLAYGROUND.Application.prototype.loadAtlas = function() {
    return this.loadAtlases.apply(this, arguments);
}
;
PLAYGROUND.Application.prototype._loadAtlas = function(filename) {
    var entry = this.getAssetEntry(filename, "atlases", "png");
    this.loader.add(entry.url);
    var atlas = this.atlases[entry.key] = {};
    var image = atlas.image = new Image;
    image.addEventListener("load", function() {
        loader.success(entry.url);
    });
    image.addEventListener("error", function() {
        loader.error(entry.url);
    });
    image.src = entry.url;
    var request = new XMLHttpRequest();
    request.open("GET", entry.path + ".json", true);
    this.loader.add(entry.path + ".json");
    var loader = this.loader;
    request.onload = function() {
        var data = JSON.parse(this.response);
        atlas.frames = [];
        for (var i = 0; i < data.frames.length; i++) {
            var frame = data.frames[i];
            atlas.frames.push({
                region: [frame.frame.x, frame.frame.y, frame.frame.w, frame.frame.h],
                offset: [frame.spriteSourceSize.x || 0, frame.spriteSourceSize.y || 0],
                width: frame.sourceSize.w,
                height: frame.sourceSize.h
            });
        }
        loader.success(entry.path + ".json");
    }
    request.send();
}
;
PLAYGROUND.Application.prototype.loadFontOld = function(name) {
    var styleNode = document.createElement("style");
    styleNode.type = "text/css";
    var formats = {
        "woff": "woff",
        "ttf": "truetype"
    };
    var sources = "";
    for (var ext in formats) {
        var type = formats[ext];
        sources += " url(\"fonts/" + name + "." + ext + "\") format('" + type + "');"
    }
    styleNode.textContent = "@font-face { font-family: '" + name + "'; src: " + sources + " }";
    document.head.appendChild(styleNode);
    var layer = cq(32, 32);
    layer.font("10px Testing");
    layer.fillText(16, 16, 16).trim();
    var width = layer.width;
    var height = layer.height;
    this.loader.add("font " + name);
    var self = this;
    function check() {
        var layer = cq(32, 32);
        layer.font("10px " + name).fillText(16, 16, 16);
        layer.trim();
        if (layer.width !== width || layer.height !== height) {
            self.loader.ready("font " + name);
        } else {
            setTimeout(check, 250);
        }
    }
    ;check();
}
;
PLAYGROUND.DefaultState = {};
PLAYGROUND.LoadingScreen = {
    logoRaw: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANoAAAASBAMAAADPiN0xAAAAGFBMVEUAAQAtLixHSUdnaGaJioimqKXMzsv7/fr5shgVAAAAAWJLR0QAiAUdSAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB98EAwkeA4oQWJ4AAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAB9klEQVQ4y72UvW+rMBDAz+FrpVKrrFmesmapWNOlrKjSe1kZ+uoVAvj+/frujG1SaJcqJwU7voOf7xMQzQmsIDi5NPTMsLRntH3U+F6SAZo3NlCvcgBFJz8o+vkDiE63lI95Y/UmpinsZWkgJWJiDbAVQ16htptxSTNloIlugwaw001Ey3ASF3so6L1qLNXzQS5S0UGKL/CI5wWNriE0UH9Yty37LqIVg+wsqu7Ix0MwVBSF/dU+jv2SNnma021LEdPqVnMeU3xAu0kXcSGjmq7Ox4E2Wn88LZ2+EFj3avjixzai6VPVyuYveZLHF2XfdDnvAq27DIHGuq+0DJFsE30OtB1KqOwd8Dr7PcM4b+jfj2g5lp4WyntBK66qua3JzEA+uXJpwH/NlVuzRVPY/kTLB2mjuN+KwdZ8FOy8j2gDbEUSqumnSCY4lf4ibq3IhVM4ycZQRnv+zFqVdJQVn6BxvUqebGpuaNo3sZxwBzjajiMZOoBiwyVF+kCr+nUaJOaGpnAeRPPJZTr4FqmHRXcneEo4DqQ/ftfdnLeDrUAME8xWKPeKCwW6YkEpXfs3p1EWJhdcUAYP0TI/uYaV8cgjwBovaeyWwji2T9rTFIdS/cP/MnkTLRUWxgNNZVin7bT5fqT9miDcUVJzR1gRpfIONMmulU+5Qqr6zXAUqAAAAABJRU5ErkJggg==",
    create: function() {
        var self = this;
        this.logo = new Image;
        this.logo.addEventListener("load", function() {
            self.ready = true;
            self.createElements();
        });
        this.logo.src = this.logoRaw;
        this.background = "#000";
        if (window.getComputedStyle) {
            this.background = window.getComputedStyle(document.body).backgroundColor || "#000";
        }
    },
    enter: function() {
        this.current = 0;
    },
    leave: function() {
        this.locked = true;
        this.animation = this.app.tween(this).to({
            current: 1
        }, 0.5);
    },
    step: function(delta) {
        if (this.locked) {
            if (this.animation.finished) {
                this.locked = false;
                this.wrapper.parentNode.removeChild(this.wrapper);
            }
        } else {
            this.current = this.current + Math.abs(this.app.loader.progress - this.current) * delta;
        }
    },
    createElements: function() {
        this.width = window.innerWidth * 0.6 | 0;
        this.height = window.innerHeight * 0.1 | 0;
        this.wrapper = document.createElement("div");
        this.wrapper.style.width = this.width + "px";
        this.wrapper.style.height = this.height + "px";
        this.wrapper.style.border = "4px solid #fff";
        this.wrapper.style.position = "absolute";
        this.wrapper.style.left = (window.innerWidth / 2 - this.width / 2 | 0) + "px";
        this.wrapper.style.top = (window.innerHeight / 2 - this.height / 2 | 0) + "px";
        this.wrapper.style.zIndex = 100;
        this.app.container.appendChild(this.wrapper);
        this.progressBar = document.createElement("div");
        this.progressBar.style.width = "0%";
        this.progressBar.style.height = this.height + "px";
        this.progressBar.style.background = "#fff";
        this.wrapper.appendChild(this.progressBar);
    },
    render: function() {
        if (!this.ready)
            return;
        this.progressBar.style.width = (this.current * 100 | 0) + "%";
    }
};
(function() {
    var lib = {
        pools: new Map,
        resetMethod: "reset",
        getPool: function(constructor) {
            var pool = this.pools.get(constructor);
            if (!pool) {
                this.pools.set(constructor, []);
                return this.getPool(constructor);
            }
            return pool;
        },
        pull: function(constructor, args) {
            var pool = this.getPool(constructor);
            if (!pool.length) {
                for (var i = 0; i < 10; i++) {
                    pool.push(new constructor());
                }
            }
            var result = pool.pop();
            result[this.resetMethod](args);
            return result;
        },
        push: function(object) {
            var pool = this.getPool(object.constructor);
            if (pool.length < 100)
                pool.push(object);
        }
    };
    var api = function() {
        if (typeof arguments[0] === "function") {
            return lib.pull(arguments[0], arguments[1]);
        } else {
            return lib.push(arguments[0]);
        }
    };
    api.pull = lib.pull.bind(lib);
    api.push = lib.push.bind(lib);
    PLAYGROUND.Application.prototype.pool = api;
    PLAYGROUND.Application.prototype.pool_debug = lib;
}
)();
PLAYGROUND.Application.prototype.loadShader = function(path) {
    let gl = this.gl;
    if (!this.shaders)
        this.shaders = {};
    let app = this;
    this.loader.add();
    let entry = this.getAssetEntry(path, "shaders", "glsl");
    let type = path.indexOf("_vertex") > -1 ? "vertex" : "fragment";
    return app.request(entry.url).then((response)=>{
        let text = response.responseText;
        let result = null;
        let shader = gl.createShader(type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, text);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            let asset = {
                native: shader,
                variables: {}
            };
            result = asset;
            let regexp = /(uniform|attribute) (.*) (.*);/g;
            let match;
            while (match = regexp.exec(text)) {
                let qualifier = match[1].trim();
                let type = match[2].trim();
                let name = match[3].trim();
                asset.variables[name] = {
                    qualifier,
                    type
                }
            }
            app.insertAsset(asset, this.shaders, entry.key);
        } else {
            console.log("Error in shader ", entry.key)
            console.log(gl.getShaderInfoLog(shader));
        }
        this.loader.success();
        return result;
    }
    );
}
;
PLAYGROUND.ProgramAsset = function(app, vertexShaderAsset, fragmentShaderAsset) {
    this.app = app;
    let gl = app.gl;
    let program = gl.createProgram();
    this.program = this.native = program;
    this.variables = {};
    gl.attachShader(program, vertexShaderAsset.native);
    gl.attachShader(program, fragmentShaderAsset.native);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        Object.assign(this.variables, vertexShaderAsset.variables, fragmentShaderAsset.variables);
    } else {
        console.log(gl.getProgramInfoLog(program));
        return null;
    }
    this.locations = {};
    for (let name in this.variables) {
        let def = this.variables[name];
        if (def.qualifier === "uniform")
            def.location = gl.getUniformLocation(program, name);
        else if (def.qualifier === "attribute")
            def.location = gl.getAttribLocation(program, name);
        this.locations[name] = def.location;
    }
}
;
Object.assign(PLAYGROUND.ProgramAsset.prototype, {
    set(name, a, b, c, d) {
        let def = this.variables[name];
        if (def.qualifier === "uniform") {
            if (def.type === "float")
                this.app.gl.uniform1f(def.location, a);
            else if (def.type === "bool")
                this.app.gl.uniform1i(def.location, a);
            else if (def.type === "vec2")
                this.app.gl.uniform2f(def.location, a, b);
            else if (def.type === "vec3")
                this.app.gl.uniform3f(def.location, a, b, c, d);
            else if (def.type === "vec4")
                this.app.gl.uniform4f(def.location, a, b, c, d);
            else if (def.type === "mat3")
                this.app.gl.uniformMatrix3fv(def.location, false, a);
            else if (def.type === "mat4")
                this.app.gl.uniformMatrix4fv(def.location, false, a);
            else if (def.type === "sampler2D")
                this.app.gl.uniform1i(def.location, a);
        }
    }
});
PLAYGROUND.Application.prototype.loadProgram = function(programName, vertexPath, fragmentPath) {
    let gl = this.gl;
    if (!this.programs)
        this.programs = {};
    this.loader.add();
    return Promise.all([this.loadShader(vertexPath), this.loadShader(fragmentPath)]).then((shaders)=>{
        var programAsset = new PLAYGROUND.ProgramAsset(this,shaders[0],shaders[1]);
        this.programs[programName] = programAsset;
        this.loader.success();
        return programAsset;
    }
    );
}
PLAYGROUND.Application.prototype.nearestPOT = function(value, pow) {
    pow = pow || 1;
    while (pow < value) {
        pow *= 2;
    }
    return pow;
}
;
PLAYGROUND.Application.prototype.shouldUsePalette = function(url) {}
;
PLAYGROUND.Application.prototype.loadTexture = function(path, options={}) {
    let app = this;
    if (!this.textures)
        this.textures = {};
    let gl = this.gl;
    let entry = this.getAssetEntry(path, "textures", "png");
    var image = new Image();
    image.src = entry.url;
    if (this.promises[entry.url])
        return this.promises[entry.url];
    this.loader.add(path);
    return this.promises[entry.url] = new Promise(function(resolve, reject) {
        image.addEventListener('load', function() {
            let texture = gl.createTexture();
            let canvas = document.createElement("canvas");
            canvas.width = app.nearestPOT(image.width);
            canvas.height = app.nearestPOT(image.height);
            canvas.getContext("2d").drawImage(image, 0, 0);
            if (app.shouldUsePalette(entry.url) || options.usePalette) {
                cq(canvas).matchPalette(cq.palettes.db32).swapColors(app.paletteMap);
                texture.paletteReady = true;
            }
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
            texture.width = canvas.width;
            texture.height = canvas.height;
            texture.originalWidth = image.width;
            texture.originalHeight = image.height;
            texture.src = entry.url;
            app.insertAsset(texture, app.textures, entry.key);
            app.loader.success();
            resolve(texture)
        });
    }
    );
}
;
PLAYGROUND.Application.prototype.textureFromCanvas = function(canvas) {
    let gl = this.gl;
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    texture.originalWidth = texture.width = canvas.width;
    texture.originalHeight = texture.height = canvas.height;
    return texture;
}
PLAYGROUND.Painter = function(app) {
    this.values = {
        color: app.color(),
        rotation: 0.0,
        alpha: 1.0,
        creation: 0.0,
        dissolve: 0.0,
        blend: [],
        blendEquation: app.gl.FUNC_ADD,
        range: [],
        align: {
            x: 0.5,
            y: 0.5
        },
        scale: {
            x: 0.0,
            y: 0.0
        },
        translation: {
            x: 0.0,
            y: 0.0
        },
        font: null,
        program: null,
        textAlign: "center"
    };
    this.app = app;
    this.matrix = Matrix3.create();
    app.loadProgram("image", "image_vertex", "image_fragment");
}
;
PLAYGROUND.Painter.prototype = {
    _region: [],
    _trim: [],
    white: {
        r: 1.0,
        g: 1.0,
        b: 1.0,
        a: 1.0
    },
    transparent: {
        r: 1.0,
        g: 1.0,
        b: 1.0,
        a: 0.0
    },
    reset() {
        this.values.blendEquation = app.gl.FUNC_ADD;
        this.values.blend.length = 0;
        this.values.alpha = 1.0;
        this.values.translation.x = 0.0;
        this.values.translation.y = 0.0;
        this.values.align.x = 0.5;
        this.values.align.y = 0.5;
        this.values.scale.x = 1.0;
        this.values.scale.y = 1.0;
        this.values.rotation = 0.0;
        this.values.dissolve = 0.0;
        this.values.creation = 0.0;
        this.values.palette = -1.0;
        this.values.paletteTexture = null;
        this.values.program = null;
        this.values.nativeProgram = null;
        this.values.dissolveMap = app.textures.noise;
        this.values.repeat = false;
        this.values.end = 1.0;
        this.values.range.length = 0;
        this.values.color.set(0x000000, 0.0);
        this.values.textAlign = "center";
        this.values.font = this.app.fonts.default;
        this.values.width = 0;
        this.values.height = 0;
    },
    range(a, b) {
        if (arguments.length === 0) {
            this.values.range.length = 0;
        } else {
            this.values.range[0] = a;
            this.values.range[1] = b;
        }
    },
    program(program) {
        this.values.program = program;
        this.values.nativeProgram = program.native;
        app.gl.useProgram(program.native);
        return this;
    },
    textAlign(textAlign) {
        this.values.textAlign = textAlign;
        return this;
    },
    palette(palette) {
        this.values.palette = palette;
        return this;
    },
    paletteTexture(paletteTexture) {
        this.values.paletteTexture = paletteTexture;
        return this;
    },
    blend() {
        this.values.blend.length = Math.max(0, arguments.length - 1);
        this.values.blendEquation = arguments[0];
        for (let i = 1; i < arguments.length; i++)
            this.values.blend[i - 1] = arguments[i];
        return this;
    },
    blending() {
        if (!this.values.blend.length)
            return false;
        if (this.values.blend.length === 2)
            app.gl.blendFunc(this.values.blend[0], this.values.blend[1]);
        else
            app.gl.blendFuncSeparate(this.values.blend[0], this.values.blend[1], this.values.blend[2], this.values.blend[3]);
        app.gl.blendEquation(this.values.blendEquation);
        return true;
    },
    repeat(repeat) {
        this.values.repeat = repeat;
        return this;
    },
    alpha(alpha) {
        this.values.alpha = alpha;
        return this;
    },
    rotate(rotation) {
        this.values.rotation = rotation;
        return this;
    },
    parseColor(color, temp) {
        if (temp.num === color)
            return temp;
        temp.r = (color / 65536 % 256 | 0) / 255.0;
        temp.g = (color / 256 % 256 | 0) / 255.0;
        temp.b = (color % 256) / 255.0;
        temp.a = 1.0;
        temp.num = color;
        return temp;
    },
    font(font) {
        if (typeof font === "string")
            font = app.fonts[font];
        this.values.font = font;
        return this;
    },
    color(color, alpha=1.0) {
        if (typeof color === "object") {
            this.values.color.r = color.r;
            this.values.color.g = color.g;
            this.values.color.b = color.b;
            this.values.color.a = color.a;
        } else {
            if (color < 0)
                alpha = 0.0;
            this.values.color.set(color, alpha);
        }
        return this;
    },
    dissolve(dissolve) {
        this.values.dissolve = dissolve;
        return this;
    },
    dissolveMap(dissolveMap) {
        this.values.dissolveMap = dissolveMap;
        return this;
    },
    creation(creation) {
        this.values.creation = creation;
        return this;
    },
    end(end) {
        this.values.end = end;
        return this;
    },
    align(x, y) {
        this.values.align.x = x;
        this.values.align.y = y;
        return this;
    },
    scale(x, y) {
        this.values.scale.x = x;
        this.values.scale.y = y;
    },
    translate(x, y) {
        this.values.translation.x = x;
        this.values.translation.y = y;
    },
    updateMatrix(x, y, width, height) {
        width = this.values.width || width;
        height = this.values.height || height;
        Matrix3.reset(this.matrix);
        Matrix3.translate(this.matrix, x | 0, y | 0);
        if (this.values.translation.x || this.values.translation.y)
            Matrix3.translate(this.matrix, this.values.translation.x, this.values.translation.y);
        if (this.values.rotation)
            Matrix3.rotate(this.matrix, -this.values.rotation);
        Matrix3.translate(this.matrix, (-width * this.values.align.x) * this.values.scale.x | 0, (-height * this.values.align.y) * this.values.scale.y | 0);
        if (this.values.scale.x !== 1.0 || this.values.scale.y !== 1.0)
            Matrix3.scale(this.matrix, this.values.scale.x, this.values.scale.y);
    },
    bindTexture(texture, slot=0) {
        let gl = this.app.gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    },
    drawImage(texture, x, y) {
        let gl = this.app.gl;
        let program = this.values.program || app.programs.image;
        gl.enable(gl.BLEND);
        this.blending() || (gl.blendEquation(gl.FUNC_ADD),
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
        gl.useProgram(program.native);
        gl.enableVertexAttribArray(program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.enableVertexAttribArray(program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        program.set("width", texture.width);
        program.set("height", texture.height);
        program.set("alpha", this.values.alpha);
        program.set("creation", this.values.creation);
        program.set("tx", 0.0);
        program.set("ty", 0.0);
        program.set("tw", 1.0);
        program.set("th", 1.0);
        program.set("texture", 0);
        program.set("color", this.values.color.r, this.values.color.g, this.values.color.b, this.values.color.a * this.values.alpha);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.values.paletteTexture || app.textures.palette);
        let palette = this.values.palette;
        if (palette < 0 && texture.paletteReady)
            palette = 0;
        program.set("paletteTexture", 1);
        program.set("palette", palette);
        this.updateMatrix(x, y, texture.width, texture.height);
        program.set("modelMatrix", this.matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    drawImageRegion(texture, srcX, srcY, srcW, srcH, dstX, dstY, dstW=0, dstH=0) {
        dstW = dstW || srcW;
        dstH = dstH || srcH;
        let gl = this.app.gl;
        let program = this.values.program || app.programs.image;
        gl.enable(gl.BLEND);
        this.blending() || (gl.blendEquation(gl.FUNC_ADD),
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
        gl.useProgram(program.native);
        gl.enableVertexAttribArray(program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.enableVertexAttribArray(program.locations.uv);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        program.set("width", dstW);
        program.set("height", dstH);
        program.set("alpha", this.values.alpha);
        program.set("color", this.values.color.r, this.values.color.g, this.values.color.b, this.values.color.a * this.values.alpha);
        program.set("creation", this.values.creation);
        program.set("tx", srcX / texture.width);
        program.set("ty", srcY / texture.height);
        program.set("tw", srcW / texture.width);
        program.set("th", srcH / texture.height);
        program.set("texture", 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.values.paletteTexture || app.textures.palette);
        let palette = this.values.palette;
        if (palette < 0 && texture.paletteReady)
            palette = 0;
        program.set("paletteTexture", 1);
        program.set("palette", palette);
        this.updateMatrix(dstX, dstY, dstW, dstH);
        program.set("modelMatrix", this.matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    drawSprite(sprite, x, y, frame=0, row=0) {
        if (typeof sprite === "string") {
            if (!this.app.sprites[sprite])
                return app.loadSprite(sprite);
            sprite = this.app.sprites[sprite];
        }
        if (this.values.range.length) {
            let frames = this.values.range[1] - this.values.range[0];
            frame = this.values.range[0] + (frame % frames | 0);
        } else {
            frame = frame % sprite.frames | 0;
        }
        row = row % sprite.rows | 0;
        let gl = app.gl;
        let program = this.values.program || app.programs.sprite;
        gl.enable(gl.BLEND);
        this.blending() || (gl.blendEquation(gl.FUNC_ADD),
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
        gl.useProgram(program.native);
        gl.enableVertexAttribArray(program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.values.paletteTexture || app.textures.palette);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sprite.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.enableVertexAttribArray(program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        let absFrame = row * sprite.frames + frame;
        if (sprite.regions) {
            let regionIndex = absFrame * 4;
            this._region[0] = sprite.regions[regionIndex + 0];
            this._region[1] = sprite.regions[regionIndex + 1];
            this._region[2] = sprite.regions[regionIndex + 2];
            this._region[3] = sprite.regions[regionIndex + 3];
            let trimIndex = absFrame * 2;
            if (sprite.trim) {
                this._trim[0] = sprite.trim[trimIndex + 0];
                this._trim[1] = sprite.trim[trimIndex + 1];
            } else {
                this._trim[0] = 0;
                this._trim[1] = 0;
            }
        } else {
            let fx, fy;
            if (sprite.rows) {
                fx = frame % sprite.frames;
                fy = row + frame / sprite.frames | 0;
            } else {
                let cols = sprite.texture.originalWidth / sprite.width | 0;
                fx = frame % cols;
                fy = frame / cols | 0;
            }
            this._region[0] = fx * sprite.width;
            this._region[1] = fy * sprite.height;
            this._region[2] = sprite.width;
            this._region[3] = sprite.height;
            this._trim[0] = 0;
            this._trim[1] = 0;
        }
        let palette = this.values.palette;
        if (palette < 0 && sprite.texture.paletteReady)
            palette = 0;
        program.set("texture", 0);
        program.set("paletteTexture", 1);
        program.set("palette", palette);
        program.set("creation", this.values.creation);
        program.set("rw", this._region[2]);
        program.set("rh", this._region[3]);
        program.set("alpha", this.values.alpha);
        program.set("tx", this._region[0] / sprite.texture.width);
        program.set("ty", this._region[1] / sprite.texture.height);
        program.set("tw", this._region[2] / sprite.texture.width);
        program.set("th", this._region[3] / sprite.texture.height);
        program.set("color", this.values.color.r, this.values.color.g, this.values.color.b, this.values.color.a);
        this.updateMatrix(x, y, sprite.width, sprite.height);
        Matrix3.translate(this.matrix, this._trim[0], this._trim[1]);
        program.set("modelMatrix", this.matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    textCache: {},
    getTextCache(text, font) {
        let key = font.id + "--" + text;
        if (!this.textCache[key]) {
            let batch = new CLIENT.ImageBatch();
            let x = 0;
            let y = 0;
            for (var i = 0; i < text.length; i++) {
                let letter = text[i];
                if (letter === "\n") {
                    y += font.height + 1;
                    x = 0;
                } else if (letter === " ") {
                    x += font.spaceWidth;
                    continue;
                }
                if (!font.regions[letter])
                    continue;
                let sprite = batch.add();
                let region = font.regions[letter];
                sprite.setSprite(region[0], region[1], region[2], region[3]);
                sprite.setRegion(x, y, region[2], region[3]);
                x += 1 + region[2];
            }
            batch.width = x - 1;
            batch.program = app.programs.text;
            this.textCache[key] = batch;
        }
        return this.textCache[key];
    },
    fillText(text, x, y) {
        let batch = this.getTextCache(text, this.values.font);
        batch.color = this.values.color;
        batch.dissolve = this.values.dissolve;
        batch.alpha = this.values.alpha;
        if (this.values.textAlign === "center")
            batch.x = x - (batch.width * this.values.scale.x) / 2 | 0;
        else if (this.values.textAlign === "right")
            batch.x = x - (batch.width * this.values.scale.x);
        else
            batch.x = x;
        batch.scale.x = this.values.scale.x;
        batch.scale.y = this.values.scale.y;
        batch.y = y | 0;
        batch.rotation = this.values.rotation;
        batch.x += this.values.translation.x;
        batch.y += this.values.translation.y;
        batch.render();
    },
    clear() {
        this.app.gl.clear(gl.COLOR_BUFFER_BIT);
    },
    fillCircle(x, y, radius) {
        let gl = this.app.gl;
        let program = this.values.program || app.programs.circle;
        gl.enable(gl.BLEND);
        this.blending() || (gl.blendEquation(gl.FUNC_ADD),
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
        gl.useProgram(program.native);
        gl.enableVertexAttribArray(program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.app.quad);
        gl.vertexAttribPointer(program.locations.position, 2, gl.FLOAT, false, 0, 0);
        if (this.values.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.values.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            program.set("texture", 0);
        }
        gl.enableVertexAttribArray(program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.app.quad);
        gl.vertexAttribPointer(program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        program.set("radius", radius);
        program.set("inside", 0.0);
        program.set("end", this.values.end);
        program.set("color", this.values.color.r, this.values.color.g, this.values.color.b, this.values.color.a * this.values.alpha);
        this.updateMatrix(x, y, radius * 2.0, radius * 2.0);
        program.set("modelMatrix", this.matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    strokeCircle(x, y, radius, lineWidth=2.0) {
        let gl = this.app.gl;
        let program = this.values.program || app.programs.circle;
        gl.enable(gl.BLEND);
        this.blending() || (gl.blendEquation(gl.FUNC_ADD),
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
        gl.useProgram(program.native);
        gl.enableVertexAttribArray(program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.app.quad);
        gl.vertexAttribPointer(program.locations.position, 2, gl.FLOAT, false, 0, 0);
        if (this.values.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.values.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            program.set("texture", 0);
        }
        gl.enableVertexAttribArray(program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.app.quad);
        gl.vertexAttribPointer(program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        program.set("radius", radius);
        program.set("inside", 0.5 - this.vmax * lineWidth * radius);
        program.set("end", this.values.end);
        program.set("color", this.values.color.r, this.values.color.g, this.values.color.b, this.values.color.a * this.values.alpha);
        this.updateMatrix(x, y, radius * 2.0, radius * 2.0);
        program.set("modelMatrix", this.matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    fillRect(x, y, w, h) {
        let gl = this.app.gl;
        let program = this.values.program || app.programs.rect;
        gl.enable(gl.BLEND);
        this.blending() || (gl.blendEquation(gl.FUNC_ADD),
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA));
        gl.useProgram(program.native);
        gl.enableVertexAttribArray(program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.app.quad);
        gl.vertexAttribPointer(program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.enableVertexAttribArray(program.locations.uv);
        if (this.values.repeat) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        program.set("width", w);
        program.set("height", h);
        program.set("color", this.values.color.r, this.values.color.g, this.values.color.b, this.values.color.a * this.values.alpha);
        this.updateMatrix(x, y, w, h);
        program.set("modelMatrix", this.matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    drawLine(x1, y1, x2, y2, width) {
        let distance = Utils.distance(x1, y1, x2, y2);
        this.rotate(Utils.lookAt(x1, y1, x2, y2));
        this.align(0.0, 0.5);
        this.fillRect(x1, y1, distance, width);
    },
    createFramebuffer(width, height) {
        let gl = app.gl;
        let targetTextureWidth = width;
        let targetTextureHeight = height;
        let texture = gl.createTexture();
        texture.width = width;
        texture.height = height;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        let fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        fb.texture = texture;
        fb.width = width;
        fb.height = height;
        return fb;
    },
    setViewport(width, height) {
        this.width = width;
        this.height = height;
        app.gl.viewport(0, 0, this.width, this.height);
        this.vw = 1 / this.width;
        this.vh = 1 / this.height;
        this.vmax = Math.max(this.vw, this.vh);
        this.vmin = Math.min(this.vw, this.vh);
    },
    setFramebuffer(fb) {
        let gl = app.gl;
        if (!fb) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        this.setViewport(fb.texture.width, fb.texture.height);
        gl.colorMask(1.0, 1.0, 1.0, 1.0);
    }
};
PLAYGROUND.Color = function(hex=0, alpha=1.0) {
    this.r = 1.0;
    this.g = 1.0;
    this.b = 1.0;
    this.a = 1.0;
    this.num = 0.0;
    this.set(hex, alpha);
}
;
PLAYGROUND.Color.prototype = {
    set(hex=0.0, alpha=1.0) {
        this.a = alpha;
        if (this.num !== hex) {
            this.num = hex;
            this.r = (hex / 65536 % 256 | 0) / 255.0;
            this.g = (hex / 256 % 256 | 0) / 255.0;
            this.b = (hex % 256) / 255.0;
        }
    }
};
PLAYGROUND.Application.prototype.color = function(hex=0, alpha=1.0) {
    return new PLAYGROUND.Color(hex,alpha);
}
;
if (!window.AudioContext) {
    window.AudioContext = window.webkitAudioContext;
    if (!window.AudioContext.prototype.createStereoPanner) {
        window.AudioContext.prototype.createStereoPanner = function() {
            var node = this.createGain();
            node.pan = {
                value: 0
            };
            return node;
        }
    }
}
window.SoundOnDemand = function(options) {
    options = options || {};
    var canPlayMp3 = (new Audio).canPlayType("audio/mp3");
    var canPlayOgg = (new Audio).canPlayType('audio/ogg; codecs="vorbis"');
    if (this.preferedAudioFormat === "mp3") {
        if (canPlayMp3)
            this.audioFormat = "mp3";
        else
            this.audioFormat = "ogg";
    } else {
        if (canPlayOgg)
            this.audioFormat = "ogg";
        else
            this.audioFormat = "mp3";
    }
    this.audioContext = options.audioContext || new AudioContext;
    this.gainNode = this.audioContext.createGain()
    this.gainNode.connect(this.audioContext.destination);
    this.input = this.gainNode;
    this.gainNode.gain.value = 1.0;
    this.buffers = {};
    this.channels = {};
    this.aliases = {};
    var lastTick = Date.now();
    var engine = this;
    setInterval(function() {
        var delta = (Date.now() - lastTick) / 1000;
        lastTick = Date.now();
        engine.step(delta);
    }, 1000 / 30);
}
;
SoundOnDemand.moveTo = function(value, target, step) {
    if (value < target) {
        value += step;
        if (value > target)
            value = target;
    }
    if (value > target) {
        value -= step;
        if (value < target)
            value = target;
    }
    return value;
}
;
SoundOnDemand.prototype = {
    constructor: SoundOnDemand,
    path: "sounds/",
    channel: function(name) {
        if (!this.channels[name])
            this.channels[name] = new SoundOnDemand.Channel(this);
        return this.channels[name];
    },
    getAssetEntry: function(path, defaultExtension) {
        var fileinfo = path.match(/(.*)\..*/);
        var key = fileinfo ? fileinfo[1] : path;
        var temp = path.split(".");
        var basename = path;
        if (temp.length > 1) {
            var ext = temp.pop();
            path = temp.join(".");
        } else {
            var ext = defaultExtension;
            basename += "." + defaultExtension;
        }
        var url;
        if (app && app.rewriteURL) {
            url = app.rewriteURL(this.path + basename);
        } else {
            url = this.path + basename;
        }
        return {
            key: key,
            url: url,
            path: this.path + path,
            ext: ext
        };
    },
    loaders: {},
    load: function(key) {
        var engine = this;
        var entry = engine.getAssetEntry(key, engine.audioFormat);
        if (!this.loaders[key]) {
            this.loaders[key] = new Promise(function(resolve, reject) {
                if (engine.buffers[entry.key])
                    return resolve(engine.buffers[entry.key]);
                var request = new XMLHttpRequest();
                request.open("GET", entry.url, true);
                request.responseType = "arraybuffer";
                request.onload = function() {
                    engine.audioContext.decodeAudioData(this.response, function(decodedBuffer) {
                        engine.buffers[entry.key] = decodedBuffer;
                        resolve(decodedBuffer);
                    });
                }
                request.send();
            }
            );
        }
        return this.loaders[key];
    },
    step: function(delta) {
        for (var key in this.channels) {
            this.channels[key].step(delta);
        }
    },
    duplicate: function(source, as, volume, rate) {
        var engine = this;
        this.load(source).then(function() {
            engine.buffers[source];
            engine.buffers[as] = engine.buffers[source];
        });
    },
    alias: function(name, source, rate, volume) {
        this.aliases[name] = {
            source: source,
            rate: rate,
            volume: volume
        };
    }
};
SoundOnDemand.Events = function() {
    this.listeners = {};
}
;
SoundOnDemand.Events.prototype = {
    on: function(event, callback) {
        if (typeof event === "object") {
            var result = {};
            for (var key in event) {
                result[key] = this.on(key, event[key])
            }
            return result;
        }
        if (!this.listeners[event])
            this.listeners[event] = [];
        this.listeners[event].push(callback);
        return callback;
    },
    once: function(event, callback) {
        callback.once = true;
        if (!this.listeners[event])
            this.listeners[event] = [];
        this.listeners[event].push(callback);
        return callback;
    },
    off: function(event, callback) {
        for (var i = 0, len = this.listeners[event].length; i < len; i++) {
            if (this.listeners[event][i]._remove) {
                this.listeners[event].splice(i--, 1);
                len--;
            }
        }
    },
    trigger: function(event, data) {
        if (this.listeners["event"]) {
            for (var i = 0, len = this.listeners["event"].length; i < len; i++) {
                this.listeners["event"][i](event, data);
            }
        }
        if (this.listeners[event]) {
            for (var i = 0, len = this.listeners[event].length; i < len; i++) {
                var listener = this.listeners[event][i];
                listener.call(this, data);
                if (listener.once) {
                    this.listeners[event].splice(i--, 1);
                    len--;
                }
            }
        }
    }
};
SoundOnDemand.Channel = function(engine) {
    this.engine = engine;
    this.audioContext = engine.audioContext;
    this.gainNode = this.audioContext.createGain();
    this.convolverWetNode = this.audioContext.createGain();
    this.convolverDryNode = this.audioContext.createGain();
    this.convolverEnabled = false;
    this.compressorEnabled = true;
    this.route();
    this.queue = [];
    this.concurentSounds = 0;
    this.soundsThisStep = 0;
}
;
SoundOnDemand.Channel.prototype = {
    constructor: SoundOnDemand.Channel,
    get: function(key) {
        return new SoundOnDemand.Sound(key,this);
    },
    play: function(key) {
        if (this.mutedWith)
            key = this.mutedWith;
        var sound = this.get(key);
        this.add(sound);
        this.soundsThisStep++;
        if (this.concurentSounds && this.soundsThisStep > this.concurentSounds)
            sound.cancel = true;
        return sound;
    },
    remove: function(sound) {
        sound._remove = true;
    },
    add: function(sound) {
        sound._remove = false;
        if (this.queue.indexOf(sound) > -1)
            return;
        this.queue.push(sound);
    },
    step: function(delta) {
        this.soundsThisStep = 0;
        for (var i = 0; i < this.queue.length; i++) {
            var sound = this.queue[i];
            if (sound._remove) {
                this.queue.splice(i--, 1);
                continue;
            }
            sound.step(delta);
        }
    },
    muteWith: function(key) {
        this.mutedWith = key;
    },
    volume: function(value) {
        if (arguments.length === 0) {
            return this.gainNode.gain.value;
        } else {
            this.gainNode.gain.value = value;
            return this;
        }
    },
    swapConvolver: function(key) {
        var engine = this.engine;
        var channel = this;
        return new Promise(function(resolve, fail) {
            if (channel.currentConvolverImpulse === key) {
                resolve();
            } else {
                engine.load(key).then(function(buffer) {
                    channel.currentConvolverImpulse = key;
                    channel.convolverNode.buffer = buffer;
                    resolve();
                });
            }
        }
        );
    },
    updateConvovlerState: function(enabled) {
        this.convolverEnabled = enabled;
        this.route();
    },
    subroute: function(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            if (i < nodes.length - 1) {
                var node = nodes[i];
                node.disconnect();
                node.connect(nodes[i + 1]);
            }
        }
        this.input = nodes[0];
    },
    disconnect() {
        this.gainNode.disconnect();
    },
    reconnect() {
        this.route();
    },
    route: function() {
        this.gainNode.disconnect();
        if (this.convolverEnabled && this.audioContext.createConvolver) {
            this.convolverNode = this.audioContext.createConvolver();
            this.gainNode.connect(this.convolverDryNode);
            this.gainNode.connect(this.convolverNode);
            this.convolverNode.connect(this.convolverWetNode);
            this.convolverWetNode.connect(this.engine.input);
            this.convolverDryNode.connect(this.engine.input);
            this.input = this.gainNode;
        } else if (this.compressorEnabled && this.audioContext.createDynamicsCompressor) {
            this.gainNode.connect(this.engine.input);
            if (!this.compressor) {
                this.compressor = this.audioContext.createDynamicsCompressor();
                this.compressor.threshold.value = -50;
                this.compressor.knee.value = 40;
                this.compressor.ratio.value = 12;
                this.compressor.attack.value = 0;
                this.compressor.release.value = 0.25;
            }
            this.compressor.connect(this.gainNode);
            this.input = this.compressor;
        } else {
            this.gainNode.connect(this.engine.input);
            this.input = this.gainNode;
        }
    },
    convolver: function(value, key) {
        var enabled = value > 0;
        var channel = this;
        this.swapConvolver(key).then(function() {
            if (enabled !== channel.convolverEnabled)
                channel.updateConvovlerState(enabled);
        });
        this.convolverWetNode.gain.value = value;
        this.convolverDryNode.gain.value = 1 - value;
        return this;
    }
};
SoundOnDemand.Sound = function(key, channel) {
    this.key = key;
    this.bufferKey = key;
    this.delayTimeout = 0;
    this.paused = false;
    if (channel.engine.aliases[key]) {
        this.alias = channel.engine.aliases[key];
        this.bufferKey = this.alias.source;
    }
    if (!channel.engine.buffers[this.bufferKey])
        channel.engine.load(this.bufferKey);
    this.channel = channel;
    this.audioContext = this.channel.engine.audioContext;
    this.current = {
        volume: 1.0,
        rate: 1.0
    };
    this.fadeMod = 1.0;
    this.createNodes();
}
;
SoundOnDemand.Sound.prototype = {
    constructor: SoundOnDemand.Sound,
    alias: {
        volume: 1.0,
        rate: 1.0
    },
    createNodes: function() {
        var bufferSource = this.audioContext.createBufferSource();
        var gainNode = this.audioContext.createGain();
        var panNode = this.audioContext.createStereoPanner();
        bufferSource.connect(panNode);
        panNode.connect(gainNode);
        gainNode.connect(this.channel.input);
        this.bufferSource = bufferSource;
        this.gainNode = gainNode;
        this.panNode = panNode;
    },
    volume: function(volume) {
        volume *= this.alias.volume;
        this.current.volume = volume;
        this.updateVolume();
        return this;
    },
    volumef: function(volume) {
        return this.volume(this.current.volume * volume);
    },
    delay: function(time) {
        this.delayTimeout = time;
        return this;
    },
    updateVolume: function() {
        this.gainNode.gain.value = this.current.volume * this.fadeMod;
    },
    pan: function(pan) {
        if (pan < -1.0)
            pan = -1.0;
        if (pan > 1.0)
            pan = 1.0;
        this.current.pan = pan;
        this.updatePanning();
        return this;
    },
    updatePanning: function() {
        this.panNode.pan.value = this.current.pan;
    },
    loop: function(start=0, end=0) {
        this.bufferSource.loop = true;
        this.current.loop = true;
        this.bufferSource.loopStart = start;
        if (end)
            this.bufferSource.loopEnd = end;
        return this;
    },
    rrate: function(range) {
        return this.rate(this.current.rate + (-1 + Math.random() * 2) * range);
    },
    nrate: function(range) {
        return this.rate(this.current.rate - Math.random() * range);
    },
    prate: function(range) {
        return this.rate(this.current.rate + Math.random() * range);
    },
    rate: function(rate) {
        rate *= this.alias.rate;
        this.bufferSource.playbackRate.value = rate;
        this.current.rate = rate;
        return this;
    },
    rateTo: function(target, duration) {
        if (!this.playing && this.ready)
            this.resume();
        duration = duration || 1.0;
        this.rateTime = 0;
        this.rateTarget = target;
        this.rateDuration = duration;
        this.rateSpeed = Math.abs(target - this.current.rate) / duration;
        return this;
    },
    onended: function() {
        if (!this.current.loop)
            this.stop();
    },
    step: function(delta) {
        if (this.cancel && !this.current.loop) {
            this.stop();
            return;
        }
        let updateVolume = false;
        if (this.delayTimeout > 0) {
            this.delayTimeout -= delta;
            return;
        }
        if (this.fadeTarget !== this.fadeMod) {
            updateVolume = true;
            this.fadeMod = SoundOnDemand.moveTo(this.fadeMod, this.fadeTarget, delta * this.fadeSpeed);
        } else if (this.fadeTarget === 0) {
            this.pause();
            return;
        }
        if (!this.ready) {
            if (!this.channel.engine.buffers[this.bufferKey])
                return;
            this.ready = true;
            this.playing = true;
            this.buffer = this.channel.engine.buffers[this.bufferKey];
            this.bufferSource.buffer = this.buffer;
            this.bufferSource.start(0);
            this.bufferSource.onended = this.onended.bind(this);
            this.currentTime = 0;
            this.currentTime += this.bufferSource.playbackRate.value * delta;
        }
        if (updateVolume)
            this.updateVolume();
        if (this.rateTarget !== this.current.rate) {
            this.rate(SoundOnDemand.moveTo(this.current.rate, this.rateTarget, delta * this.rateSpeed));
        }
    },
    pause: function() {
        this.channel.remove(this);
        if (this.playing)
            this.bufferSource.stop(0);
        this.playing = false;
    },
    stop: function() {
        this.channel.remove(this);
        if (!this.playing)
            return;
        this.bufferSource.stop(0);
        this.playing = false;
    },
    play: function() {
        if (this.playing)
            return;
        this.createNodes();
        this.channel.add(this);
        this.ready = false;
        this.playing = false;
    },
    resume: function() {
        this.createNodes();
        this.bufferSource.buffer = this.buffer;
        this.currentTime = this.currentTime % this.buffer.duration;
        this.bufferSource.start(0, this.currentTime);
        this.rate(this.current.rate);
        this.volume(this.current.volume);
        this.loop(this.current.loop);
        this.channel.add(this);
        this.playing = true;
    },
    fadeTo: function(target, duration) {
        if (!this.playing && this.ready)
            this.resume();
        duration = duration || 1.0;
        this.fadeTime = 0;
        this.fadeTarget = target;
        this.fadeDuration = duration;
        this.fadeSpeed = Math.abs(target - this.fadeMod) / duration;
        return this;
    },
    fadeIn: function(duration) {
        if (!this.playing && this.ready)
            this.resume();
        this.fadeMod = 0;
        this.fadeTo(1.0, duration);
        return this;
    },
    fadeOut: function(duration) {
        this.fadeTo(0, duration || 1.0);
        return this;
    }
};
PLAYGROUND.SoundOnDemand = function(app) {
    app.audio = new SoundOnDemand();
    app.audio.path = app.getPath("sounds");
    app.loadSounds = function() {
        for (var i = 0; i < arguments.length; i++) {
            var key = arguments[i];
            this.loader.add();
            this.audio.load(key).then(this.loader.success.bind(this.loader), this.loader.error.bind(this.loader));
        }
    }
    ;
}
;
PLAYGROUND.SoundOnDemand.plugin = true;
PLAYGROUND.Ambient = function(app) {
    let loops = {};
    let sounds = {};
    function step() {
        for (var key in sounds) {
            sounds[key] -= 0.25;
            if (sounds[key] <= 0) {
                delete sounds[key];
                loops[key].fadeOut(0.25);
                loops[key] = null;
            }
        }
    }
    setInterval(step, 250);
    app.ambient = function(sound, volume=1.0, rate=1.0) {
        sounds[sound] = 0.5;
        if (!loops[sound])
            loops[sound] = app.sound.play(sound).loop().volume(volume).rate(rate).fadeIn(0.25);
    }
}
;
PLAYGROUND.Ambient.plugin = true;
PLAYGROUND.Ad = function(options) {
    options = options || {};
    options.threshold = options.threshold || 3;
    this.calls = (localStorage.getItem("ad_calls") | 0) || (Math.random() * (options.threshold + 1) | 0);
}
;
PLAYGROUND.Ad.prototype = {
    threshold: 3,
    start() {
        if (app.adStart)
            app.adStart();
    },
    end() {
        if (app.adEnd)
            app.adEnd();
        if (this.onceEnded) {
            this.onceEnded();
            this.onceEnded = null;
        }
    },
    interstitial(callback) {
        this.onceEnded = callback;
        this.calls++;
        if (this.threshold === 1 || this.calls % this.threshold === 1) {
            this.requestInterstitial();
        } else {
            this.end();
        }
        localStorage.setItem("ad_calls", this.calls);
    },
    requestInterstitial() {
        this.end();
    }
};
// cut math lib here

// ear cut here 

// math function  cut here 
// cut utils here 

// cut msg pack here

var Matrix3 = {
    translate: function(matrix, x, y) {
        return this.multiply(matrix, this.translation(x, y));
    },
    scale: function(matrix, x, y) {
        return this.multiply(matrix, this.scaling(x, y));
    },
    rotate: function(matrix, x, y) {
        return this.multiply(matrix, this.rotation(x, y));
    },
    invert: function(matrix) {
        let a00 = matrix[0]
          , a01 = matrix[1]
          , a02 = matrix[2];
        let a10 = matrix[3]
          , a11 = matrix[4]
          , a12 = matrix[5];
        let a20 = matrix[6]
          , a21 = matrix[7]
          , a22 = matrix[8];
        let b01 = a22 * a11 - a12 * a21;
        let b11 = -a22 * a10 + a12 * a20;
        let b21 = a21 * a10 - a11 * a20;
        let det = a00 * b01 + a01 * b11 + a02 * b21;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        matrix[0] = b01 * det;
        matrix[1] = (-a22 * a01 + a02 * a21) * det;
        matrix[2] = (a12 * a01 - a02 * a11) * det;
        matrix[3] = b11 * det;
        matrix[4] = (a22 * a00 - a02 * a20) * det;
        matrix[5] = (-a12 * a00 + a02 * a10) * det;
        matrix[6] = b21 * det;
        matrix[7] = (-a21 * a00 + a01 * a20) * det;
        matrix[8] = (a11 * a00 - a01 * a10) * det;
        return matrix;
    },
    create: function() {
        return ([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    },
    reset: function(matrix) {
        matrix[0] = 1;
        matrix[1] = 0;
        matrix[2] = 0;
        matrix[3] = 0;
        matrix[4] = 1;
        matrix[5] = 0;
        matrix[6] = 0;
        matrix[7] = 0;
        matrix[8] = 1;
        return matrix;
    },
    translation: function(tx, ty) {
        return ([1, 0, 0, 0, 1, 0, tx, ty, 1, ]);
    },
    rotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return ([c, -s, 0, s, c, 0, 0, 0, 1, ]);
    },
    scaling: function(sx, sy) {
        return ([sx, 0, 0, 0, sy, 0, 0, 0, 1, ]);
    },
    pixelate(matrix, width, height) {
        let pw = (2 / width);
        let ph = (2 / height);
        matrix[6] = Utils.ground(matrix[6], pw);
        matrix[7] = Utils.ground(matrix[7], ph);
    },
    projection: function(width, height) {
        return ([2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1]);
    },
    trs: function(tx, ty, r, sx, sy) {
        return [sx * c, -s]
    },
    multiply: function(a, b) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
        a[0 * 3 + 0] = b00 * a00 + b01 * a10 + b02 * a20;
        a[0 * 3 + 1] = b00 * a01 + b01 * a11 + b02 * a21;
        a[0 * 3 + 2] = b00 * a02 + b01 * a12 + b02 * a22;
        a[1 * 3 + 0] = b10 * a00 + b11 * a10 + b12 * a20;
        a[1 * 3 + 1] = b10 * a01 + b11 * a11 + b12 * a21;
        a[1 * 3 + 2] = b10 * a02 + b11 * a12 + b12 * a22;
        a[2 * 3 + 0] = b20 * a00 + b21 * a10 + b22 * a20;
        a[2 * 3 + 1] = b20 * a01 + b21 * a11 + b22 * a21;
        a[2 * 3 + 2] = b20 * a02 + b21 * a12 + b22 * a22;
        return a;
    }
};

CLIENT.Camera = function() {
    this.box = [0, 0, 0, 0];
    this.scale = 1.0;
    this.x = 0;
    this.y = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.followX = 0;
    this.followY = 0;
    this.center = {
        x: 0,
        y: 0
    };
    this.instant = true;
    this.set(0, 0, 32, 32);
    this.shaking = 0;
    this.shakingPower = 0;
    this.matrix = Matrix3.create()
    this.orgSensor = this.sensor = Math.min(app.width, app.height) / 4;
    this.limit = null;
}
;
CLIENT.Camera.prototype = {
    shake: function(power, duration) {
        power = power || 12;
        if (power > this.shakingPower || this.shaking <= 0) {
            this.shakingPower = power;
        }
        this.shaking = Math.max(this.shaking, duration || 1.0);
    },
    set: function(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.center.x = x;
        this.center.y = y;
        this.width = w;
        this.height = h;
    },
    jump: function(x, y) {
        if (arguments.length === 0) {
            this.center.x = this.follow.x;
            this.center.y = this.follow.y;
        } else if (arguments.length === 1) {
            this.center.x = x.x;
            this.center.y = x.y;
        } else {
            this.center.x = x;
            this.center.y = y;
        }
        this.x = this.center.x - this.width / 2 / this.scale;
        this.y = this.center.y - this.height / 2 / this.scale;
        this.updateWorldCoords();
    },
    skip: function() {
        this.skipped = true;
    },
    sensor: 100,
    step: function(dt) {
        this.updateWorldCoords();
        var offsetX = 0;
        var offsetY = 0;
        if (this.follow) {
            var followX = this.follow.x;
            var followY = this.follow.y;
            if (this.limiter) {
                followX = Utils.lerp(followX, this.limiter.x, 0.75);
                followY = Utils.lerp(followY, this.limiter.y, 0.75);
            }
            var distance = Utils.distance(this.center.x, this.center.y, followX, followY);
            var speed = Math.max(this.sensor === 0 ? 32 : 0, (distance - this.orgSensor) * 4);
            if (distance > this.sensor) {
                this.sensor = 0;
            }
            if (this.sensor === 0 && distance < 10) {
                this.sensor = this.orgSensor;
            }
            speed = Math.min(speed, 100);
            var angle = Utils.lookAt(this.center.x, this.center.y, followX, followY);
            if (this.skipped || this.instant || distance <= speed * dt) {
                this.skipped = false;
                this.center.x = followX | 0;
                this.center.y = followY | 0;
            } else {
                this.center.x += Math.cos(angle) * speed * dt;
                this.center.y += Math.sin(angle) * speed * dt;
            }
        }
        this.x = this.offsetX + this.center.x - (this.width / this.scale) / 2 + offsetX;
        this.y = this.offsetY + this.center.y - (this.height / this.scale) / 2 + offsetY;
        if (this.shaking > 0) {
            this.shaking -= dt;
            var a = Utils.saw(this.shaking / 1.0) * this.shakingPower;
            this.x += Utils.random(-a, a);
            this.y += Utils.random(-a, a);
        }
        if (this.limit) {
            if (this.x < this.limit[0])
                this.x = this.limit[0];
            if (this.x + this.width > this.limit[2])
                this.x = this.limit[2] - this.width;
            if (this.y < this.limit[1])
                this.y = this.limit[1];
            if (this.y + this.height > this.limit[3])
                this.y = this.limit[3] - this.height;
            this.center.x = this.x + this.width / 2;
            this.center.y = this.y + this.height / 2;
        }
        this.updateWorldCoords();
    },
    updateWorldCoords: function() {
        this.wx = this.x;
        this.wy = this.y;
        this.ww = this.width / this.scale;
        this.wh = this.height / this.scale;
        this.box[0] = this.x;
        this.box[1] = this.y;
        this.box[2] = this.ww;
        this.box[3] = this.wh;
    },
    setFollow: function(follow) {
        this.follow = follow;
    },
    inView: function(x, y, w=1, h=1) {
        return Utils.rectInRect(x, y, w, h, this.box[0], this.box[1], this.box[2], this.box[3]);
    }
};
CLIENT.Entities = function(game) {
    this.game = game;
    this.children = [];
    this.groups = {};
    this.id = 0;
    this.dirtyGroups = {};
    this.sidMap = new Map();
    this.inView = [];
}
;
CLIENT.Entities.prototype = {
    sid: function(sid) {
        return this.sidMap.get(sid);
    },
    all: function(filter, group) {
        var entities = group ? this.groups[group] : this.children;
        return Utils.filter(entities, filter);
    },
    one: function(filter, group) {
        var entities = group ? this.groups[group] : this.children;
        return Utils.find(entities, filter);
    },
    create: function(constructorName, args) {
        var constructor = CLIENT[constructorName];
        if (!constructor.prototype.constructorName)
            constructor.prototype.constructorName = constructorName;
        args.collection = this;
        args.game = this.game;
        if (constructor.prototype.reset) {
            var entity = app.pool(constructor, args);
        } else {
            var entity = new constructor(args);
        }
        entity.inView = 0;
        if (entity.shared) {
            entity.sid = entity.shared.sid;
            this.sidMap.set(entity.shared.sid, entity);
        }
        return entity;
    },
    add: function(constructorName) {
        var args = {};
        args.box = [0, 0, 0, 0];
        args._remove = false;
        for (var i = 1; i < arguments.length; i++) {
            Object.assign(args, arguments[i]);
        }
        args.id = ++this.id;
        if (typeof constructorName === "object") {
            var entity = constructorName;
            entity.game = this.game;
            entity.collection = this;
            entity.box = args.box;
            entity._remove = false;
        } else {
            var entity = this.create(constructorName, args)
        }
        this.children.push(entity);
        this.dirty = true;
        this.last = entity;
        if (entity.groups) {
            for (var i = 0; i < entity.groups.length; i++)
                this.addToGroup(entity, entity.groups[i]);
        }
        if (entity.shape)
            this.updateBox(entity);
        return entity;
    },
    createGroup: function(group) {
        if (this.groups[group])
            return;
        this.groups[group] = [];
        this.groups[group].entitiesToRemove = [];
    },
    addToGroup: function(entity, group) {
        this.createGroup(group);
        this.groups[group].push(entity);
    },
    removeFromGroup: function(entity, group) {
        this.dirtyGroups[group] = true;
        this.groups[group].entitiesToRemove.push(entity);
        this.dirty = true;
    },
    cleanup: function() {
        this.dirty = false;
        for (var i = 0, len = this.children.length; i < len; i++) {
            var entity = this.children[i];
            if (entity._remove) {
                if (entity.groups) {
                    for (var j = 0; j < entity.groups.length; j++) {
                        this.dirtyGroups[entity.groups[j]] = true;
                    }
                }
                Utils.pullOne(this.inView, entity);
                if (entity.leaveview)
                    entity.leaveview();
                if (entity._destruct)
                    entity._destruct();
                if (entity.sid) {
                    this.sidMap.delete(entity.sid);
                }
                this.children.splice(i--, 1);
                len--;
            }
        }
        for (var key in this.dirtyGroups) {
            var group = this.groups[key];
            for (var i = 0, len = group.length; i < len; i++) {
                var entity = group[i];
                if (entity._remove || group.entitiesToRemove.indexOf(entity) > -1) {
                    group.splice(i--, 1);
                    len--;
                }
            }
            group.entitiesToRemove = [];
        }
        this.dirtyGroups = {};
    },
    sortMethod: function(a, b) {
        if (a.zIndex !== b.zIndex) {
            return (a.zIndex | 0) - (b.zIndex | 0);
        }
        var ay = a.sortY || a.y;
        var by = b.sortY || b.y;
        if (ay !== by) {
            return ay - by;
        }
        var ax = a.sortX || a.x;
        var bx = b.sortX || b.x;
        if (ax !== bx) {
            return ax - bx;
        }
        return a.id - b.id;
    },
    sort: function() {
        this.children.sort(this.sortMethod);
    },
    remove: function(entity) {
        entity._remove = true;
        this.dirty = true;
    },
    updateEntity: function(entity, dt) {
        if (entity.shape) {
            entity.prevX = entity.x;
            entity.prevY = entity.y;
        }
        if (entity.lifespan && !(entity.delay > 0)) {
            entity.lifespan -= dt;
            if (entity.lifespan <= 0) {
                entity.lifespan = 0;
                this.remove(entity);
            }
        }
    },
    updateBox: function(entity) {
        if (!entity.shape) {} else if (entity.shape === COMMON.RECT) {
            entity.box[0] = entity.x - entity.width * (entity.alignX || 0);
            entity.box[1] = entity.y - entity.height * (entity.alignY || 0);
            entity.box[2] = entity.width;
            entity.box[3] = entity.height;
        } else {
            entity.box[0] = entity.x - entity.radius;
            entity.box[1] = entity.y - entity.radius;
            entity.box[2] = entity.radius * 2;
            entity.box[3] = entity.radius * 2;
        }
    },
    step: function(dt) {
        this.inView.length = 0;
        var camera = this.game.camera;
        for (var i = 0; i < this.children.length; i++) {
            var entity = this.children[i];
            var prevInView = entity.inView;
            if (entity.inView > 0) {
                entity.inView -= dt;
                if (entity.inView < 0)
                    entity.inView = 0;
            }
            if (entity.box) {
                entity.inView = 2.0 * Utils.rectInRect(entity.box[0], entity.box[1], entity.box[2], entity.box[3], camera.box[0], camera.box[1], camera.box[2], camera.box[3]) || entity.inView;
            } else {
                entity.inView = 1.0;
            }
            if (entity.inView)
                this.inView.push(entity);
            if (!prevInView && entity.inView) {
                if (entity.enterview)
                    entity.enterview();
            }
            if (prevInView && !entity.inView) {
                if (entity.leaveview)
                    entity.leaveview();
            }
            this.updateEntity(this.children[i], dt);
            if (this.children[i].step)
                this.children[i].step(dt);
            this.updateBox(this.children[i]);
        }
        if (this.dirty)
            this.cleanup();
        this.sort();
    },
    render: function() {
        for (var i = 0; i < this.children.length; i++) {
            let entity = this.children[i];
            if (!entity.inView)
                continue;
            entity.render();
        }
    }
};
class MyApp extends PLAYGROUND.Application {
}
CLIENT.Events = function() {
    this.listeners = {};
}
;
CLIENT.Events.prototype = {
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
            if (this.listeners[event][i]._remove) {
                this.listeners[event].splice(i--, 1);
                len--;
            }
        }
    },
    trigger: function(event, a, b, c) {
        if (this.listeners.event) {
            for (var i = 0, len = this.listeners.event.length; i < len; i++) {
                var listener = this.listeners.event[i];
                listener.callback.call(listener.context, event, a, b, c);
            }
        }
        if (this.listeners[event]) {
            for (var i = 0, len = this.listeners[event].length; i < len; i++) {
                var listener = this.listeners[event][i];
                listener.callback.call(listener.context || this, a, b, c);
                if (listener.once) {
                    this.listeners[event].splice(i--, 1);
                    len--;
                }
            }
        }
    }
};
NAMESPACE.FollowingTween = function(context) {
    this.context = context;
    this.tweensMap = new Map;
    this.tweensArray = [];
}
;
NAMESPACE.FollowingTween.LINEAR = 0;
NAMESPACE.FollowingTween.CIRC = 1;
NAMESPACE.FollowingTween.prototype = {
    to: function(follow, dst, src, offset, duration, easing="linear", mode=0) {
        var tween = this.tweensMap.get(dst);
        if (!tween) {
            var tween = {};
            this.tweensMap.set(dst, tween)
            this.tweensArray.push(tween);
        }
        tween.follow = follow;
        tween.dst = dst;
        tween.src = src;
        tween.before = this.context[dst];
        tween.offset = offset;
        tween.duration = duration;
        tween.lifetime = 0;
        tween.mode = mode;
        tween.after = 0;
        tween.easing = easing;
    },
    step: function(dt) {
        for (var i = 0; i < this.tweensArray.length; i++) {
            var tween = this.tweensArray[i];
            tween.lifetime += dt;
            tween.after = tween.follow[tween.src] + tween.offset;
            if (tween.mode === NAMESPACE.FollowingTween.LINEAR) {
                tween.diff = tween.after - tween.before;
            } else if (tween.mode === NAMESPACE.FollowingTween.CIRC) {
                tween.diff = Utils.circDistance(tween.after, tween.before);
            }
            var progress = tween.lifetime / tween.duration;
            if (progress > 1.0)
                progress = 1.0;
            if (tween.mode === NAMESPACE.FollowingTween.LINEAR) {
                this.context[tween.dst] = tween.before + tween.diff * app.ease(progress, tween.easing);
            } else if (tween.mode === NAMESPACE.FollowingTween.CIRC) {
                this.context[tween.dst] = Utils.circWrapTo(tween.before, tween.after, tween.diff * app.ease(progress, tween.easing));
            }
            if (progress === 1.0) {
                this.tweensMap.delete(tween.dst);
                this.tweensArray.splice(i--, 1);
            }
        }
    }
};
CLIENT.GameActionManager = function(parent, states) {
    this.parent = parent;
    this.current = {};
    this.states = states;
    this.data = {};
    this.runs = new Set;
    this.timeout = 0;
    this.timeoutArgs = [];
    this.lifetime = 0;
    this.elapsed = 0;
    this.selection = null;
}
;
CLIENT.GameActionManager.prototype = {
    runOnce: function(timeout) {
        if (!this.runs.has(timeout) && this.elapsed > timeout) {
            this.runs.add(timeout);
            return true;
        }
        return false;
    },
    setTimeout: function(state, timeout, a, b, c) {
        this.timeoutArgs[0] = state;
        this.timeoutArgs[2] = a;
        this.timeoutArgs[3] = b;
        this.timeoutArgs[4] = c;
        this.timeout = this.lifetime + timeout;
    },
    set: function(state, a, b, c) {
        this.timeout = 0;
        if (typeof state === "string") {
            this.key = state;
            state = this.states[state];
        }
        if (this.current && this.current.leave)
            this.current.leave(this.parent, this, a, b, c);
        if (this.current && this.current.select && this.selection) {
            if (this.selection.leaveHighlight)
                this.selection.leaveHighlight();
            this.selection.highlighted = false;
            this.selection = null;
        }
        if (typeof state === "function")
            state = new state;
        this.lifetime = 0;
        this.elapsed = 0;
        this.current = state;
        this.runs.clear();
        if (this.current && this.current.enter)
            this.current.enter(this.parent, this, a, b, c);
    },
    step: function(dt) {
        this.lifetime += dt;
        this.elapsed += dt;
        if (this.timeout && this.lifetime >= this.timeout) {
            this.set(this.timeoutArgs[0], this.timeoutArgs[1], this.timeoutArgs[2], this.timeoutArgs[3]);
        }
        if (this.current && this.current.step)
            this.current.step(this.parent, this, dt);
        if (this.current.select) {
            let prevSelection = this.selection;
            this.selection = this.current.select();
            if (prevSelection !== this.selection) {
                if (prevSelection) {
                    if (prevSelection.leaveHighlight)
                        prevSelection.leaveHighlight();
                    prevSelection.highlighted = false;
                }
                if (this.selection) {
                    this.selection.highlighted = true;
                    if (this.selection.enterHighlight)
                        this.selection.enterHighlight();
                }
            }
        }
    },
    call: function(methodName, a, b, c) {
        if (this.current && this.current[methodName])
            this.current[methodName](this.parent, this, a, b, c);
    },
    once: function() {}
};

CLIENT.Gun = function(parent) {
    this.parent = parent;
    this.sprite = new CLIENT.Sprite;
    this.sprite.set("gun");
    this.sprite.duration = 1.0;
    this.sprite.range = [0, 0];
    this.sprite.scale.x = 0.5;
    this.chargeDuration = 1.0;
    this.soundLoop = null;
    this.time = 0;
    this.running = false;
    this.hideTimeout = 0;
    this.stop();
}
;
CLIENT.Gun.prototype = {
    start() {
        if (this.running)
            return;
        this.running = true;
        if (this.soundLoop)
            this.stop();
        this.soundLoop = app.sound.play("gun_charge").loop();
        this.time = 0;
        this.sprite.range = [1, 8];
        this.sprite.loop = true;
        this.sprite.duration = 1.0;
        app.tween(this.sprite.scale).discard().to({
            x: 1.0,
            y: 1.0
        }, 0.5, "outElastic");
        if (!this.hideTimeout)
            app.sound.play("gun_show").volume(0.4).rate(1.0);
    },
    stop() {
        if (!this.running)
            return;
        this.running = false;
        if (this.soundLoop) {
            this.soundLoop.fadeOut(0.5);
            this.soundLoop.rateTo(0, 0.5);
            this.soundLoop = null;
        }
        this.sprite.range = [9, 13];
        this.sprite.loop = false;
        this.sprite.duration = 0.25;
        this.sprite.time = 0;
        this.sprite.timeScale = 1.0;
        this.hideTimeout = 3.0;
        app.tween(this.sprite.scale).discard().to({
            y: 1.75
        }, 0.1, "outBounce").to({
            y: 1.0
        }, 0.1);
        app.sound.play("gun_fire").volume(0.5).rate(0.6)
    },
    step(dt) {
        if (this.hideTimeout && !this.running) {
            this.hideTimeout -= dt;
            if (this.hideTimeout <= 0) {
                this.hideTimeout = 0;
                app.tween(this.sprite.scale).to({
                    x: 0.5,
                }, 0.35, "outElastic");
                app.sound.play("gun_hide").volume(0.4).rate(0.8);
            }
        }
        if (this.soundLoop) {
            this.time += dt;
            let progress = this.time / this.chargeDuration;
            if (progress > 1.0)
                progress = 1.0;
            this.soundLoop.rate(0.2 + progress * 1.0);
            this.sprite.timeScale = 1.0 + progress * 6;
        }
        this.sprite.step(dt);
    },
    render() {
        let gunOrbit = 8;
        this.sprite.pivot.x = 0.0;
        this.sprite.x = this.parent.x + Math.cos(this.parent.direction) * gunOrbit;
        this.sprite.y = this.parent.y + Math.sin(this.parent.direction) * gunOrbit;
        this.sprite.rotation = this.parent.direction;
        this.sprite.render();
    }
};
CLIENT.ImageBatch = function() {
    this.x = 0;
    this.y = 0;
    this.width = -1;
    this.height = -1;
    this.scale = {
        x: 1.0,
        y: 1.0
    };
    this.color = app.color(0x000000, 0.0);
    this.alpha = 1.0;
    this.dissolve = 0.0;
    this.index_counter = 0;
    this.elements = [];
    this.uv = null;
    this.mesh = null;
    this.meshBuffer = app.gl.createBuffer();
    this.uvBuffer = app.gl.createBuffer();
    this.needRebuild = false;
    this.texture = app.textures.spritesheet;
    this.matrix = Matrix3.create();
    this.program = app.programs.gui;
}
;
CLIENT.ImageBatch.prototype = {
    constructor: CLIENT.ImageBatch,
    add(sprite=null, region=null) {
        return this.create(sprite, region);
    },
    create(sprite=null, region=null) {
        this.needRebuild = true;
        let element = new CLIENT.ImageBatchElement(this);
        this.elements.push(element);
        if (sprite)
            element.setSprite(...sprite);
        if (region)
            element.setRegion(...region);
        return element;
    },
    clear() {
        this.elements.length = 0;
        this.needRebuild = true;
    },
    remove(element) {
        Utils.pull(this.elements, element);
        this.needRebuild = true;
    },
    removeArray(elements) {
        for (let element of elements)
            this.remove(element);
    },
    rebuild() {
        let gl = app.gl;
        let mesh = [];
        let uv = [];
        for (var i = 0; i < this.elements.length; i++) {
            let element = this.elements[i];
            let x = element.x;
            let y = element.y;
            let w = element.width;
            let h = element.height;
            mesh.push(x + 0, y + 0, x + w, y + 0, x + w, y + h, x + w, y + h, x + 0, y + h, x + 0, y + 0);
            x = element.sprite[0] / this.texture.width;
            y = element.sprite[1] / this.texture.height;
            w = element.sprite[2] / this.texture.width;
            h = element.sprite[3] / this.texture.height;
            uv.push(x + 0, y + 0, x + w, y + 0, x + w, y + h, x + w, y + h, x + 0, y + h, x + 0, y + 0);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
        this.needRebuild = false;
    },
    render() {
        if (this.dissolve >= 1.0)
            return;
        if (!this.elements.length)
            return;
        let gl = app.gl;
        let program = this.program;
        if (this.needRebuild)
            this.rebuild();
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(program.native);
        gl.enableVertexAttribArray(program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshBuffer);
        gl.vertexAttribPointer(program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, app.textures.palette);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.enableVertexAttribArray(program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        program.set("texture", 0);
        program.set("color", this.color.r, this.color.g, this.color.b, this.color.a * this.alpha);
        program.set("alpha", this.alpha);
        program.set("paletteTexture", 1);
        program.set("palette", 0);
        program.set("dissolve", this.dissolve);
        Matrix3.reset(this.matrix);
        Matrix3.translate(this.matrix, this.x | 0, this.y | 0);
        Matrix3.scale(this.matrix, this.scale.x, this.scale.y);
        program.set("modelMatrix", this.matrix);
        gl.drawArrays(gl.TRIANGLES, 0, this.elements.length * 6);
    }
};
CLIENT.ImageBatchElement = function(batch) {
    this.batch = batch;
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
    this.sprite = [0, 0, 1, 1];
}
;
CLIENT.ImageBatchElement.prototype = {
    constructor: CLIENT.ImageBatchElement,
    remove() {
        this.batch.remove(this);
        return this;
    },
    setSprite(x, y, w, h) {
        this.sprite[0] = x;
        this.sprite[1] = y;
        this.sprite[2] = w;
        this.sprite[3] = h;
        this.batch.needRebuild = true;
        return this;
    },
    setRegion(x, y, w=0, h=0) {
        if (!w)
            w = this.sprite[2];
        if (!h)
            h = this.sprite[3];
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.batch.needRebuild = true;
        return this;
    },
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.batch.needRebuild = true;
        return this;
    }
};
CLIENT.QuickChat = function() {
    let template = `
      <div class="absolute center quickChat">
        <input type=text maxlength=32 class="full-width">
        <p>hit ENTER to send or ESC to CANCEL</p>
      </div>
    `;
    this.$element = $(template).appendTo("body");
    this.$element.hide();
    this.$input = this.$element.find("input");
    this.$input.on("change keyup", this.validate.bind(this));
}
;
CLIENT.QuickChat.prototype = {
    validate() {
        let $input = this.$input;
        let val = $input.val();
        val = COMMON.validateChatCharacters(val);
        $input.val(val);
    },
    show() {
        this.$input.val("");
        this.$element.show();
        this.$input.focus();
    },
    hide() {
        this.$element.hide();
    },
    send() {
        this.validate();
        let text = this.$input.val();
        app.game.send("quick_chat", {
            text: text
        });
    }
};
CLIENT.SelectorFirefly = function(args) {
    Object.assign(this, args);
}
;
CLIENT.SelectorFirefly.prototype = {
    render() {},
    step() {}
};
CLIENT.Selector = function(game) {
    this.game = game;
    this.lifetime = 0;
    this.fireflies = [];
    this.selected = null;
}
;
CLIENT.Selector.prototype = {
    step(dt) {
        if (this.selected) {
            this.fireflies.push({
                lifetime: Math.random(),
                duration: 2 + Math.random() * 2,
                follow: this.selected
            });
        }
    },
    render() {
        for (var i = 0; i < this.fireflies.length; i++) {
            let firefly = this.fireflies[i];
            let x = firefly.follow.x + Math.cos(firefly.lifetime) * 32;
            let y = firefly.follow.y + Math.sin(firefly.lifetime) * 16 - lifetime * 16;
            firefly.lifetime += app.elapsed;
            if (firefly.lifetime > firefly.duration)
                this.fireflies.splice(i--, 1);
            app.painter.reset();
            app.painter.color(0xffffff);
            app.painter.fillCircle(x, y, 2);
        }
    }
};
CLIENT.State = function(parent, states) {
    this.parent = parent;
    this.current = {};
    this.states = states;
    this.data = {};
    this.runs = new Set;
    this.timeout = 0;
    this.timeoutArgs = [];
    this.lifetime = 0;
    this.elapsed = 0;
}
;
CLIENT.State.prototype = {
    runOnce: function(timeout) {
        if (!this.runs.has(timeout) && this.elapsed > timeout) {
            this.runs.add(timeout);
            return true;
        }
        return false;
    },
    setTimeout: function(state, timeout, a, b, c) {
        this.timeoutArgs[0] = state;
        this.timeoutArgs[2] = a;
        this.timeoutArgs[3] = b;
        this.timeoutArgs[4] = c;
        this.timeout = this.lifetime + timeout;
    },
    set: function(state, a, b, c) {
        this.timeout = 0;
        this.prev = this.key;
        if (typeof state === "string") {
            this.key = state;
            state = this.states[state];
        }
        if (this.current && this.current.leave)
            this.current.leave(this.parent, this, a, b, c);
        if (typeof state === "function")
            state = new state;
        this.lifetime = 0;
        this.elapsed = 0;
        this.current = state;
        this.runs.clear();
        if (this.current && this.current.enter)
            this.current.enter(this.parent, this, a, b, c);
    },
    step: function(dt) {
        this.lifetime += dt;
        this.elapsed += dt;
        if (this.timeout && this.lifetime >= this.timeout) {
            this.set(this.timeoutArgs[0], this.timeoutArgs[1], this.timeoutArgs[2], this.timeoutArgs[3]);
        }
        if (this.current && this.current.step)
            this.current.step(this.parent, this, dt);
    },
    call: function(methodName, a, b, c) {
        if (this.current && this.current[methodName])
            this.current[methodName](this.parent, this, a, b, c);
    },
    once: function() {},
    back() {
        this.set(this.prev);
    }
};
NAMESPACE.Tween = function(context) {
    this.context = context;
    this.tweensMap = new Map;
    this.tweensArray = [];
    this.easing = "linear";
}
;
NAMESPACE.Tween.LINEAR = 0;
NAMESPACE.Tween.CIRC = 1;
NAMESPACE.Tween.prototype = {
    to: function(property, value, duration, mode=0) {
        if (!duration) {
            this.context[property] = value;
            return;
        }
        var tween = this.tweensMap.get(property);
        if (!tween) {
            var tween = {};
            this.tweensMap.set(property, tween)
            this.tweensArray.push(tween);
        }
        tween.property = property;
        tween.before = this.context[property];
        tween.after = value;
        tween.duration = duration;
        tween.lifetime = 0;
        tween.mode = mode;
        if (tween.mode === NAMESPACE.Tween.LINEAR) {
            tween.diff = value - tween.before;
        } else if (tween.mode === NAMESPACE.Tween.CIRC) {
            tween.diff = Utils.circDistance(value, tween.before);
        }
    },
    step: function(dt) {
        for (var i = 0; i < this.tweensArray.length; i++) {
            var tween = this.tweensArray[i];
            tween.lifetime += dt;
            var progress = tween.lifetime / tween.duration;
            if (progress > 1.0)
                progress = 1.0;
            if (tween.mode === NAMESPACE.Tween.LINEAR) {
                this.context[tween.property] = tween.before + tween.diff * app.ease(progress, this.easing);
            } else if (tween.mode === NAMESPACE.Tween.CIRC) {
                this.context[tween.property] = Utils.circWrapTo(tween.before, tween.after, tween.diff * app.ease(progress, this.easing));
            }
            if (progress === 1.0) {
                this.tweensMap.delete(tween.property);
                this.tweensArray.splice(i--, 1);
            }
        }
    }
};
CLIENT.Plant = function(args) {
    Object.assign(this, args);
    this.update(this.shared);
    this.stage = 0;
    this.temp = {};
    this.pop();
}
;
CLIENT.Plant.prototype = {
    constructor: CLIENT.Plant,
    radius: 32,
    shape: COMMON.CIRCLE,
    groups: ["obstacles"],
    obstacleRadius: 16,
    systemShadow: 6,
    pop() {
        if (!this.game.camera.inView(this.x, this.y))
            return;
        app.sound.play("action/plant").gpan(this);
    },
    die() {
        if (this.inView) {
            let leaves = this.collection.add("Sprite");
            leaves.set("fx/leaves");
            leaves.rotation = Math.random() * 6.28;
            leaves.scale.x = 0.5;
            leaves.scale.y = 0.5;
            leaves.x = this.x;
            leaves.y = this.y + 4;
            leaves.z = 6;
            leaves.duration = 1.0;
            leaves.color = app.color(0x6abe30);
            leaves.shadow = true;
        }
        this.lifespan = 0.5;
    },
    update(data) {
        if (data.x !== undefined)
            this.x = data.x;
        if (data.y !== undefined)
            this.y = data.y;
        Object.assign(this.shared, data);
        let stage = this.shared.grown * 5 | 0;
        if (data.key) {
            this.def = COMMON.items[data.key];
            this.obstacleRadius = this.def.obstacleRadius;
        }
        if (this.stage !== stage) {
            this.prevStage = this.stage;
            this.stage = stage;
            this.transition = 1.0;
        }
        if (data.remove) {
            this.die();
            if (this.def.growInto)
                this.collection.remove(this);
        }
    },
    render() {
        this.transition = Math.max(0, this.transition - app.elapsed);
        app.painter.reset();
        app.painter.align(0.5, 0.9);
        if (this.lifespan)
            app.painter.creation(1.0 - 2.0 * this.lifespan);
        if (this.shared.grown < 1.0) {
            if (this.transition > 0) {
                app.painter.creation(1.0 - this.transition);
                app.painter.drawSprite("plant/sprout", this.x, this.y, this.prevStage, 0);
                app.painter.creation(this.transition);
            }
            app.painter.drawSprite("plant/sprout", this.x, this.y, this.stage, 0);
        } else {
            app.painter.drawImageRegion(app.textures.spritesheet, ...this.def.image, this.x, this.y);
        }
    }
};

CLIENT.Arrow = function(args) {
    this.x = 0;
    this.y = 0;
    this.z = 10;
    this.delay = 0;
    this.miss = false;
    this.straight = false;
    this.lifetime = 0;
    this.direction = 0;
    this.duration = 1.0;
    this.target = null;
    Object.assign(this, args);
    this.sprite = new CLIENT.Sprite;
    this.sprite.set("arrow");
    this.sprite.scale.x = 0.5;
    this.sprite.scale.y = 0.5;
    this.shadow = new CLIENT.Sprite;
    this.shadow.set("arrow");
    this.shadow.scale.x = 0.5;
    this.shadow.scale.y = 0.5;
    this.shadow.color = 0x000000;
    this.scale = 1.0;
    this.tween = new CLIENT.FollowingTween(this);
    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
}
;
CLIENT.Arrow.prototype = {
    zIndex: 3,
    stretchMod: 5.0,
    shape: COMMON.CIRCLE,
    radius: 6,
    run() {
        if (!this.target)
            return this.collection.remove(this);
        if (this.miss) {
            this.targetOffsetX = Utils.random(-16, 16);
            this.targetOffsetY = Utils.random(-16, 16);
        }
        this.tween.to(this.target, "x", "x", this.targetOffsetX, this.duration, "linear");
        this.tween.to(this.target, "y", "y", this.targetOffsetY, this.duration, "linear");
        if (!this.straight) {
            app.tween(this).to({
                z: this.z + this.duration * 20
            }, this.duration * 0.5, "outSine").to({
                z: 0
            }, this.duration * 0.5, "inSine");
            this.sprite.duration = this.duration;
        } else {
            if (this.miss) {
                app.tween(this).to({
                    z: 0
                }, this.duration);
            } else if (this.z > 10) {
                app.tween(this).to({
                    z: 10
                }, this.duration);
            }
            this.sprite.duration = 0.01;
        }
    },
    _destruct: function() {},
    step: function(dt) {
        if (this.delay > 0)
            return this.delay -= dt;
        if (this.hasHit) {} else {
            this.tween.step(dt);
        }
        this.lifetime += dt;
        if (this.lifetime > this.duration && !this.hasHit) {
            this.hasHit = true;
            if (!this.miss) {
                app.sound.play("bow/hit").rrate(0.1).gpan(this);
                if (this.target.handleHit) {
                    this.target.fallDirection = this.direction;
                    this.target.handleHit(0, this);
                }
            }
            let debris = this.collection.add("Sprite");
            debris.set("fx/debris");
            debris.scale.x = 0.3;
            debris.scale.y = 0.1;
            debris.rotation = this.direction - Math.HPI;
            debris.x = this.x;
            debris.y = this.y;
            debris.duration = 0.5;
            if (this.miss) {
                app.sound.play("weapon/arrow_miss").gpan(this).rate(1.5).rrate(0.3);
            }
            if (this.miss) {
                this.lifespan = 5.0;
            } else {
                this.collection.remove(this);
            }
        }
    },
    render: function(dt) {
        if (this.delay > 0)
            return this.delay -= dt;
        if (!this.hasHit)
            this.direction = Utils.lookAt(this.x, this.y, this.target.x + this.targetOffsetX, this.target.y + this.targetOffsetY);
        this.shadow.row = Utils.dirrow(this.direction, 16);
        this.shadow.x = this.x;
        this.shadow.y = this.y;
        this.shadow.alpha = 0.25;
        this.shadow.step(app.elapsed);
        this.shadow.render();
        this.sprite.row = Utils.dirrow(this.direction, 16);
        this.sprite.x = this.x;
        this.sprite.y = this.y - this.z;
        this.scale = 0.5 + this.z * 0.01;
        this.sprite.scale.x = this.scale;
        this.sprite.scale.y = this.scale;
        this.sprite.step(app.elapsed);
        this.sprite.render();
    }
};
CLIENT.Bird = function(args) {
    this.x = 0;
    this.y = 0;
    this.z = 40;
    this.speed = 64;
    this.delay = 0.0;
    this.key = "pigeon";
    this.lifetime = 0.0;
    this.flaptime = 0.0;
    this.direction = Math.random() * 6.28;
    Object.assign(this, args)
}
;
CLIENT.Bird.prototype = {
    constructor: CLIENT.Bird,
    shape: COMMON.CIRCLE,
    radius: 4,
    zIndex: 5,
    leaveview() {
        this.lifespan = 5.0;
    },
    run() {
        app.sound.play("bird/takeoff").delay(0.25).gpan(this);
        app.sound.play("bird/" + this.key).rrate(0.2).gpan(this);
    },
    step(dt) {
        if (this.delay > 0) {
            this.delay -= dt;
            if (this.delay <= 0)
                this.run();
            return;
        }
        let flapmod = 1.0 + Math.max(0, 1.0 - this.lifetime / 1.0) * 6.0;
        this.flaptime += dt * this.speed * 0.3 * flapmod;
        this.lifetime += dt;
        this.x += Math.cos(this.direction) * this.speed * dt;
        this.y += Math.sin(this.direction) * this.speed * dt;
    },
    render() {
        if (this.delay > 0)
            return;
        let frame = this.flaptime;
        let row = Utils.dirrow(this.direction, 16);
        app.painter.reset();
        app.painter.alpha(0.25);
        app.painter.color(0x000000);
        app.painter.drawSprite("bird", this.x, this.y, frame, row);
        app.painter.color(this.key === "crow" ? 0x222034 : -1);
        app.painter.alpha(1.0);
        app.painter.drawSprite("bird", this.x, this.y - this.z, frame, row);
    }
}
CLIENT.Bubble = function(args) {
    this.x = 0;
    this.y = 0;
    this.stretch = 0;
    Object.assign(this, args);
    this.image = new CLIENT.Image;
    this.image.setTexture("bubble");
    this.image.blendDst = app.gl.ONE;
    this.image.zIndex = 3;
    this.lifetime = 0;
    this.tween = new CLIENT.Tween(this);
    this.x = this.shared.x;
    this.y = this.shared.y;
    this.update(this.shared);
}
;
CLIENT.Bubble.prototype = {
    zIndex: 3,
    shape: COMMON.CIRCLE,
    radius: 16,
    update(data) {
        Object.assign(this.shared, data);
        if (data.x !== undefined)
            this.tween.to("x", data.x, COMMON.TWEEN_DURATION);
        if (data.y !== undefined)
            this.tween.to("y", data.y, COMMON.TWEEN_DURATION);
        if (data.remove)
            this.lifespan = COMMON.TWEEN_DURATION;
    },
    step(dt) {
        if (this.stretch > 0)
            this.stretch -= dt * 2.0;
        let s = 0.3 + (this.shared.size / 2) * 0.7;
        this.image.scale.x = s + Math.sin(app.lifetime * 30) * (0.1 + this.stretch);
        this.image.scale.y = s + Math.cos(app.lifetime * 30) * (0.1 + this.stretch);
        this.tween.step(dt);
    },
    render() {
        this.image.x = this.x;
        this.image.y = this.y;
        this.image.render();
    }
};

CLIENT.Bullet = function(args) {
    this.x = 0;
    this.y = 0;
    this.ex = 0;
    this.ey = 0;
    Object.assign(this, {
        damage: 1.0,
        radius: 3,
        innerRadius: 3,
        width: 0.25,
        length: 1.0,
        range: 600,
        dyingMod: 1.0,
        mining: 0.0
    }, args);
    this.bullet = this.bullets[Utils.random(1, 6)];
    this.image = new CLIENT.Image;
    this.image.setTexture("spritesheet");
    this.image.setRegion(...this.bullet.sprite);
    this.lifetime = 0;
    this.direction = 0;
    this.distance = 0;
    this.duration = 1.0;
    this.finalDuration = 1.0;
    this.tween = new CLIENT.FollowingTween(this);
}
;
CLIENT.Bullet.prototype = {
    zIndex: 3,
    stretchMod: 5.0,
    bullets: {
        "1": {
            color: 0xffc400,
            sprite: [182, 9, 6, 25]
        },
        "2": {
            color: 0x86e423,
            sprite: [191, 9, 6, 25]
        },
        "3": {
            color: 0x36dbff,
            sprite: [200, 9, 6, 25]
        },
        "4": {
            color: 0xbe3dff,
            sprite: [209, 9, 6, 25]
        },
        "5": {
            color: 0x36dbff,
            sprite: [183, 40, 10, 16]
        },
        "6": {
            color: 0xff6900,
            sprite: [201, 42, 19, 22]
        }
    },
    run() {
        this.distance = Utils.distance(this, this.target);
        this.finalDuration = this.duration * 1.25;
        let rx = Utils.random(-8, 8);
        let ry = Utils.random(-8, 8);
        this.direction = Utils.lookAt(this, this.target);
        this.x = this.x + Math.cos(this.direction) * 16;
        this.y = this.y + Math.sin(this.direction) * 16;
        this.ex = this.x + Math.cos(this.direction - Math.PI) * 16;
        this.ey = this.y + Math.sin(this.direction - Math.PI) * 16;
        this.tween.to(this.target, "x", "x", 0, this.duration, "inSine");
        this.tween.to(this.target, "y", "y", 0, this.duration, "inSine");
        this.tween.to(this.target, "ex", "x", 0, this.finalDuration, "inSine");
        this.tween.to(this.target, "ey", "y", 0, this.finalDuration, "inSine");
        let muzzle = this.collection.add("Sprite");
        muzzle.set("fx/muzzle");
        muzzle.rotation = this.direction - Math.HPI;
        muzzle.x = this.x;
        muzzle.y = this.y;
        muzzle.duration = 0.25;
        muzzle.color = this.bullet.color;
    },
    shape: COMMON.CIRCLE,
    _destruct: function() {},
    step: function(dt) {
        this.tween.step(dt);
        this.lifetime += dt;
        if (this.lifetime > this.finalDuration) {
            this.collection.remove(this);
        }
        if (this.lifetime > this.duration && !this.hasHit) {
            this.hasHit = true;
            let debris = this.collection.add("Sprite");
            debris.set("fx/debris");
            debris.scale.x = 0.5;
            debris.scale.y = 0.2;
            debris.rotation = this.direction - Math.HPI;
            debris.x = this.x;
            debris.y = this.y;
            debris.duration = 0.5;
            debris.color = this.bullet.color;
        }
        if (this.hasHit) {
            this.x = this.target.x;
            this.y = this.target.y;
        }
    },
    render: function(dt) {
        this.radius = this.bullet.sprite[3];
        let len = Utils.distance(this.x, this.y, this.ex, this.ey);
        this.image.scale.x = 0.25 + (this.lifetime / this.duration) * 0.25;
        this.image.scale.y = len / this.bullet.sprite[3];
        this.image.rotation = Utils.lookAt(this.ex, this.ey, this.x, this.y) + Math.HPI;
        this.image.x = this.x;
        this.image.y = this.y;
        this.image.pivot.y = 0.0;
        this.image.pivot.x = 0.5;
        this.image.render();
    }
};
CLIENT.Campfire = function(args) {
    this.x = 0;
    this.y = 0;
    this.putDown();
    Object.assign(this, args);
    this.update(this.shared);
    this.sprite = new CLIENT.Sprite();
    this.sprite.set("campfire");
    this.sprite.loop = true;
    this.sprite.duration = 2.0;
    this.sprite.scale.x = 0.6;
    this.sprite.scale.y = 0.75;
    this.sprite.pivot.y = 1.0;
    this.image = new CLIENT.Image();
    this.image.setTexture("spritesheet");
    this.image.setRegion(0, 0, 17, 14);
    this.image.creation = 1.0;
    app.tween(this.image).to({
        creation: 0.0
    }, 0.5);
    this.clickable = true;
}
;
CLIENT.Campfire.prototype = {
    constructor: CLIENT.Campfire,
    shape: COMMON.CIRCLE,
    heavy: true,
    zIndex: 1,
    radius: 20,
    collisionRadius: 20,
    groups: ["impassable", "interactive"],
    systemLight: 32,
    systemShadow: 8,
    pointerup() {
        let game = this.game;
        game.cursor.set("snap");
        game.cursor.duration = 0.25;
        app.sound.play("snap")
        game.send("lightCampfire", {
            sid: this.sid
        });
    },
    enterview() {},
    leaveview() {},
    update(data) {
        if (data.x !== undefined)
            this.x = data.x;
        if (data.y !== undefined)
            this.y = data.y;
        if (data.remove) {
            this.collection.remove(this);
        }
        if (data.state !== undefined) {
            if (data.state && !this.shared.state) {
                this.lightUp();
            }
            if (!data.state && this.shared.state) {
                this.putDown();
            }
        }
        Object.assign(this.shared, data);
    },
    lightUp() {
        this.clickable = false;
        if (this.inView)
            app.sound.play("flame").volume(0.5).fadeOut(1.0).rate(1.6).gpan(this);
        this.sprite.scale.x = 0.1;
        this.sprite.scale.y = 0.25;
        app.tween(this.sprite.scale).to({
            x: 0.6,
            y: 0.75
        }, 1.0);
        this.tooltip = "Come closer and sit by the campfire";
    },
    putDown() {
        this.tooltip = "Light it up";
        this.clickable = true;
    },
    step(dt) {},
    render() {
        this.image.x = this.x;
        this.image.y = this.y;
        this.image.render();
        this.sprite.step(app.elapsed);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        if (this.shared.state)
            this.sprite.render();
    }
};
CLIENT.Castle = function(args) {
    Object.assign(this, args);
    this.update(this.shared);
}
;
CLIENT.Castle.prototype = {
    constructor: CLIENT.Castle,
    shape: COMMON.CIRCLE,
    radius: 100,
    zIndex: 10,
    groups: ["castles"],
    update(data) {
        if (data.x !== undefined)
            this.x = data.x;
        if (data.y !== undefined)
            this.y = data.y;
        Object.assign(this.shared, data);
        if (data.remove)
            this.collection.remove(this);
    },
    render() {
        app.painter.reset();
        app.painter.color(COMMON.TEAM_COLOR[this.shared.team].name);
        app.painter.fillText(this.shared.name, this.x, this.y - 32);
        app.painter.font(app.fonts.small);
        app.painter.fillText(String(this.shared.score), this.x, this.y - 42);
    }
}
NAMESPACE.Circle = function(args) {
    this.texture = null;
    this.x = 0;
    this.y = 0;
    this.radius = 1;
    this.lifetime = 0;
    this.alpha = 1.0;
    this.random = Math.random();
    this.color = app.color(0xffffff, 1.0);
    this.blendSrc = app.gl.SRC_ALPHA;
    this.blendDst = app.gl.ONE_MINUS_SRC_ALPHA;
    this.modelMatrix = Matrix3.create();
    this.scale = {
        x: 1.0,
        y: 1.0
    };
    this.program = app.programs.circle;
    this.folow = null;
    this.special = 0;
    Object.assign(this, args);
}
;
Object.assign(NAMESPACE.Circle.prototype, {
    zIndex: -1,
    shape: COMMON.CIRCLE,
    step(dt) {
        this.lifetime += dt;
        if (this.follow) {
            this.x = this.follow.x;
            this.y = this.follow.y;
            if (this.follow._remove)
                this.collection.remove(this);
            if (this.special === 1 && !this.follow.systemLight)
                this.collection.remove(this);
            if (this.special === 2 && !this.follow.systemShadow)
                this.collection.remove(this);
        }
    },
    render() {
        if (this.follow && this.follow.hidden)
            return;
        let gl = app.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(this.program.native);
        gl.enableVertexAttribArray(this.program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(this.program.locations.position, 2, gl.FLOAT, false, 0, 0);
        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            this.program.set("texture", 0);
        }
        gl.enableVertexAttribArray(this.program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(this.program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        let radius = this.radius;
        if (this.color === 0)
            radius = this.radius;
        this.program.set("radius", radius);
        this.program.set("color", this.color.r, this.color.g, this.color.b, this.color.a * this.alpha);
        var matrix = Matrix3.create();
        Matrix3.translate(matrix, this.x, this.y);
        Matrix3.translate(matrix, (-radius) * this.scale.x | 0, (-radius) * this.scale.y | 0);
        if (this.scale.x !== 1.0 || this.scale.y !== 1.0)
            Matrix3.scale(matrix, this.scale.x, this.scale.y);
        this.program.set("modelMatrix", matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
});
CLIENT.Cloud = function(args) {
    this.raining = false;
    this.x = 0;
    this.y = 0;
    this.z = 64;
    this.target = null;
    this.tween = new CLIENT.Tween(this);
    Object.assign(this, args);
    this.update(this.shared);
    this.x = this.shared.sharedX;
    this.y = this.shared.sharedY;
    this.soundLoop = null;
}
;
CLIENT.Cloud.prototype = {
    zIndex: 4,
    shape: COMMON.CIRCLE,
    radius: 50,
    constructor: CLIENT.Cloud,
    enterview() {},
    leaveview() {
        this.stopSoundLoop();
    },
    stopSoundLoop() {
        if (this.soundLoop) {
            this.soundLoop.fadeOut(1);
            this.soundLoop = false;
        }
    },
    update(data) {
        if (this.inView) {
            if (data.sharedX !== undefined)
                this.tween.to("x", data.sharedX, 1.0);
            if (data.sharedY !== undefined)
                this.tween.to("y", data.sharedY, 1.0);
        }
        if (data.target_sid !== undefined)
            this.target = this.collection.sid(this.shared.target_sid);
        Object.assign(this.shared, data);
        if (!this.inView) {
            this.x = this.shared.sharedX;
            this.y = this.shared.sharedY;
        }
    },
    render() {
        app.painter.reset();
        app.painter.rotate(2.5);
        app.painter.color(0x000000);
        app.painter.alpha(0.25);
        app.painter.drawSprite("cloud", this.x, this.y, app.lifetime * 10);
        app.painter.color(0, 0);
        app.painter.alpha(0.8);
        app.painter.drawSprite("cloud", this.x, this.y - this.z, app.lifetime * 10);
        let prevRaining = this.raining;
        this.raining = this.target && Utils.quickPointInRange(this.x, this.y, this.target.x, this.target.y, 64);
        if (this.raining && !prevRaining) {
            this.soundLoop = app.sound.play("ambient/rain").fadeIn(1.0).loop().rrate(0.5).volume(0.0);
        }
        if (prevRaining && !this.raining) {
            this.stopSoundLoop();
        }
        if (this.raining) {
            let raindrop = this.collection.add("Sprite");
            raindrop.set("fx/raindrop");
            raindrop.duration = 0.5;
            raindrop.blendDst = app.gl.ONE;
            raindrop.color.set(Utils.random([0x639bff, 0xcbdbfc]));
            raindrop.alpha = 0.5;
            raindrop.z = this.z;
            raindrop.x = this.x + Utils.random(-32, 32);
            raindrop.y = this.y + Utils.random(-32, 32);
            raindrop.zIndex = this.zIndex;
            app.tween(raindrop).to({
                z: 0,
                rotation: Utils.randomf(-0.5, 0.5)
            }, 0.1);
            if (this.soundLoop)
                this.soundLoop.volume(0.3);
        }
    },
    step(dt) {
        this.tween.step(dt);
        if (this.soundLoop)
            this.soundLoop.gpan(this);
    }
};
CLIENT.Collectible = function(args) {
    this.hidden = false;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.scale = 1.0;
    this.random = Math.random();
    Object.assign(this, args);
    this.update(this.shared);
    this.def = COMMON.items[this.shared.key];
    this.moveGrass = true;
    if (this.shared.key === "chest") {
        this.groups = ["radar"];
        this.radar = {
            color: 0xffe000,
            size: 1
        }
    }
}
;
CLIENT.Collectible.prototype = {
    constructor: CLIENT.Collectible,
    shape: COMMON.CIRCLE,
    heavy: true,
    zIndex: 1,
    radius: 1,
    systemShadow: 5,
    beingCollected(by) {
        app.sound.play("action/collect").gpan(this);
    },
    enterview() {
        this.image = new CLIENT.Image();
        this.image.setTexture("spritesheet");
        this.image.setRegion(...this.def.sprite);
        app.tween(this).to({
            z: 30
        }, 0.25, "outSine").to({
            z: 0
        }, 0.35, "outBounce");
        app.tween(this).to({
            x: this.x + Math.cos(this.random * Math.TAU) * 32,
            y: this.y + Math.sin(this.random * Math.TAU) * 32
        }, 0.6);
    },
    leaveview() {},
    update(data) {
        if (data.x !== undefined)
            this.x = data.x;
        if (data.y !== undefined)
            this.y = data.y;
        if (data.from !== undefined) {
            let from = this.collection.sid(data.from);
            if (from) {
                this.x = from.x;
                this.y = from.y;
            }
        }
        Object.assign(this.shared, data);
        if (data.remove)
            this.lifespan = 2.0;
    },
    blink() {
        let debris = this.collection.add("Sprite");
        debris.set("fx/blink");
        debris.follow = this;
        debris.duration = 0.25;
        debris.scale.x = 0.5;
        debris.scale.y = 0.5;
        debris.z = this.z;
        debris.zIndex = 1;
    },
    step(dt) {},
    render() {
        this.image.x = this.x;
        this.image.y = this.y - this.z;
        this.image.scale.x = this.image.scale.y = (1.0 + this.z * 0.02) * this.scale;
        this.image.render();
        this.zIndex = (this.z > 0) * 1.0;
    }
};
CLIENT.Flag = function(args) {
    this.x = 0;
    this.y = 0;
    Object.assign(this, args);
    this.team = 0;
}
;
CLIENT.Flag.prototype = {
    shape: COMMON.CIRCLE,
    radius: 8,
    poleSprite: [125, 55, 21, 33],
    zIndex: 1,
    render() {
        if (this.team < 0)
            return;
        app.painter.reset();
        app.painter.align(0, 0);
        app.painter.drawImageRegion(app.textures.spritesheet, ...this.poleSprite, this.x - 6, this.y - this.poleSprite[3]);
        if (this.team > -1) {
            app.painter.color(0x000000);
            app.painter.alpha(0.25);
            app.painter.rotate(Math.QPI);
            app.painter.drawSprite("flag", this.x + 16 - 1, this.y - 18);
            app.painter.color(COMMON.TEAM_COLOR[this.team].mid)
            app.painter.alpha(1.0);
            app.painter.rotate(0);
            app.painter.drawSprite("flag", this.x + 1, this.y - 30);
        }
    }
};

CLIENT.FloatingText = function(args) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.font = "fat";
    this.delay = 0.00001;
    this.duration = 1.5;
    this.lifetime = 0;
    this.text = "";
    this.colors = [];
    this.color = 0xffffff;
    Object.assign(this, args);
}
;
CLIENT.FloatingText.prototype = {
    constructor: CLIENT.FloatingText,
    shape: COMMON.CIRCLE,
    radius: 1,
    zIndex: 20,
    run() {
        this.lifespan = this.duration;
    },
    step(dt) {
        if (this.delay >= 0) {
            this.delay -= dt;
            if (this.delay <= 0)
                this.run();
            else
                return;
        }
        this.z += dt * 16;
    },
    render() {
        if (this.delay > 0)
            return;
        app.painter.reset();
        let eased = app.ease(1.0 - this.lifespan / this.duration, "inExpo");
        app.painter.scale(1.0 + eased, 1.0 - eased);
        if (this.colors.length) {
            let progress = app.lifetime % 0.5 / 0.5;
            app.painter.color(this.colors[this.colors.length * progress | 0]);
        } else {
            app.painter.color(this.color);
        }
        app.painter.font(this.font);
        app.painter.fillText(String(this.text), this.x, this.y - this.z);
    }
};
NAMESPACE.Foreground = function(args) {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.zoom = 1.0;
    this.options = null;
    this.ready = false;
    this.rotation = 0.0;
    this.lifetime = 0;
    this.scale = 1.0;
    this.alpha = 1.0;
    this.repeatX = 1.0;
    this.repeatY = 1.0;
    this.repeatOffsetX = 0.0;
    this.repeatOffsetY = 0.0;
    this.blendSrc = app.gl.SRC_ALPHA;
    this.blendDst = app.gl.ONE;
    this.needUpdateUV = false;
    Object.assign(this, args);
    this.setup();
    let gl = app.gl;
    if (!NAMESPACE.Foreground.prototype.uvBuffer) {
        let uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]), gl.STATIC_DRAW);
        NAMESPACE.Foreground.prototype.uvBuffer = uvBuffer;
    }
}
;
Object.assign(NAMESPACE.Foreground.prototype, {
    zIndex: 10,
    setTexture(key) {
        if (typeof key === "string") {
            this.src = key;
            this.ready = false;
            if (!app.textures[key]) {
                app.loadTexture(key).then(()=>{
                    this.run(app.textures[this.src]);
                }
                );
            } else {
                this.run(app.textures[this.src]);
            }
        } else {
            this.run(key);
        }
    },
    meshArray: new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]),
    run(texture) {
        this.texture = texture;
        this.ready = true;
    },
    setup() {
        let gl = app.gl;
        let program = this.program = app.programs.foreground;
        this.modelMatrix = Matrix3.create();
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.meshArray, gl.STATIC_DRAW);
    },
    step(dt) {
        this.lifetime += dt;
        this.box[0] = this.x;
        this.box[1] = this.y;
        this.box[2] = this.width;
        this.box[3] = this.height;
    },
    render() {
        if (!this.ready)
            return;
        let gl = app.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(this.blendSrc, this.blendDst);
        gl.useProgram(this.program.native);
        gl.enableVertexAttribArray(this.program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.enableVertexAttribArray(this.program.locations.uv);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(this.program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        this.program.set("time", app.lifetime);
        this.program.set("alpha", this.alpha);
        this.program.set("width", this.width);
        this.program.set("height", this.height);
        this.program.set("repeatX", (this.width / this.texture.width) / this.zoom);
        this.program.set("repeatY", (this.height / this.texture.height) / this.zoom);
        this.program.set("repeatOffsetX", this.repeatOffsetX / this.texture.width);
        this.program.set("repeatOffsetY", this.repeatOffsetY / this.texture.height);
        this.program.set("texture", 0);
        var matrix = Matrix3.create();
        Matrix3.translate(matrix, this.x, this.y);
        if (this.rotation)
            Matrix3.rotate(matrix, -this.rotation);
        if (this.scale !== 1.0)
            Matrix3.scale(matrix, this.scale, this.scale);
        this.program.set("modelMatrix", matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
});
CLIENT.Generic = function(args) {
    this.x = 0;
    this.y = 0;
    Object.assign(this, args);
    this.soundLoop = null;
}
;
CLIENT.Generic.prototype = {
    groups: ["impassable"],
    shape: COMMON.CIRCLE,
    radius: 100,
    collisionRadius: 24,
    heavy: true,
    enterview() {
        this.soundLoop = app.sound.play("ambient/stream").gpan(this).loop().rate(0.7).volume(0.5);
    },
    leaveview() {
        if (this.soundLoop) {
            this.soundLoop.fadeOut(0.5);
            this.soundLoop = null;
        }
    },
    render() {
        if (this.soundLoop)
            this.soundLoop.gpan(this);
        app.painter.reset();
        app.painter.drawSprite("waterfall", this.x, this.y, app.lifetime * 5.0);
        app.painter.alpha(0.35);
        app.painter.drawSprite("waterfall", this.x, this.y, app.lifetime * 5.0 - 1);
        app.painter.alpha(0.2);
        app.painter.drawSprite("waterfall", this.x, this.y, app.lifetime * 5.0 - 2);
    }
};
CLIENT.Grass = function(args) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.creation = 0;
    Object.assign(this, args);
    this.temp = {};
}
;
CLIENT.Grass.prototype = {
    constructor: CLIENT.Grass,
    shape: COMMON.CIRCLE,
    radius: 8,
    groups: ["interactive"],
    tooltip: "You can try your luck mowing the grass with a scythe.\nRemember though it is food for many animals.",
    step() {},
    render() {
        app.painter.reset();
        app.painter.creation(this.creation);
        app.painter.drawImageRegion(app.textures.spritesheet, 53, 49, 17, 15, this.x + this.offsetX, this.y + this.offsetY);
    }
};
NAMESPACE.MapEdge = function() {
    this.x = 0;
    this.y = 0;
    this.width = -1;
    this.height = -1;
    this.options = null;
    this.rotation = 0.0;
    this.lifetime = 0;
    this.scale = 1.0;
    this.random = Math.random();
    this.repeatX = 1.0;
    this.repeatY = 1.0;
    this.repeatOffsetX = 0.0;
    this.repeatOffsetY = 0.0;
    this.blendSrc = app.gl.SRC_ALPHA;
    this.blendDst = app.gl.ONE_MINUS_SRC_ALPHA;
    this.needUpdateUV = false;
    this.setup();
    let gl = app.gl;
    let countX = 10;
    let countY = 10;
    let stepX = 1.0 / countX;
    let stepY = 1.0 / countY;
    this.numVertices = (countX * countY) * 6;
    if (!NAMESPACE.MapEdge.prototype.uvBuffer) {
        let array = [];
        let uvBuffer = gl.createBuffer();
        for (let x = 0; x < countX; x++) {
            for (let y = 0; y < countY; y++) {
                array.push(x * stepX, y * stepY, x * stepX + stepX, y * stepY, x * stepX + stepX, y * stepY + stepY, x * stepX + stepX, y * stepY + stepY, x * stepX, y * stepY + stepY, x * stepX, y * stepY);
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
        NAMESPACE.MapEdge.prototype.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, NAMESPACE.MapEdge.prototype.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
        NAMESPACE.MapEdge.prototype.uvBuffer = uvBuffer;
    }
}
;
Object.assign(NAMESPACE.MapEdge.prototype, {
    positionBuffer: null,
    zIndex: 0,
    meshArray: new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]),
    setup() {
        let gl = app.gl;
        let program = this.program = app.programs.map_edge;
        this.modelMatrix = Matrix3.create();
    },
    step(dt) {
        this.lifetime += dt;
    },
    setTexture(key) {
        this.texture = app.textures[key];
    },
    render() {
        let gl = app.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(this.blendSrc, this.blendDst);
        gl.useProgram(this.program.native);
        gl.enableVertexAttribArray(this.program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(this.program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        this.program.set("texture", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        let width = this.width;
        if (this.width < 0) {
            width = this.texture.width;
        }
        let height = this.height;
        if (this.height < 0) {
            height = this.texture.height;
        }
        this.program.set("width", width);
        this.program.set("height", height);
        this.program.set("repeatX", this.repeatX);
        this.program.set("repeatY", this.repeatY);
        this.program.set("repeatOffsetX", this.repeatOffsetX / this.texture.width);
        this.program.set("repeatOffsetY", this.repeatOffsetY / this.texture.height);
        this.program.set("time", app.lifetime + this.random);
        var matrix = Matrix3.create();
        Matrix3.translate(matrix, this.x, this.y);
        if (this.rotation)
            Matrix3.rotate(matrix, -this.rotation);
        if (this.scale !== 1.0)
            Matrix3.scale(matrix, this.scale, this.scale);
        this.program.set("modelMatrix", matrix);
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }
});
CLIENT.Herd = function(args) {
    this.x = 0;
    this.y = 0;
    this.lifetime = 0;
    Object.assign(this, args);
    this.tween = new CLIENT.Tween(this);
    this.members = [];
    this.moving = 0.0;
    this.palette = 0;
    this.update(this.shared);
}
;
CLIENT.Herd.prototype = {
    zIndex: -1,
    constructor: CLIENT.Herd,
    shape: COMMON.CIRCLE,
    radius: 100,
    groups: [],
    pointerup() {
        this.enterview();
    },
    enterview() {},
    leaveview() {},
    addMember(member) {
        member.i = this.members.length;
        this.members.push(member);
    },
    update(data) {
        if (data.x !== undefined) {
            this.tween.to("x", data.x, this.inView * COMMON.TWEEN_DURATION);
            this.moving = 1.0;
        }
        if (data.y !== undefined) {
            this.tween.to("y", data.y, this.inView * COMMON.TWEEN_DURATION);
            this.moving = 1.0;
        }
        if (data.remove)
            this.collection.remove(this);
        Object.assign(this.shared, data);
    },
    step(dt) {
        this.lifetime += dt;
        if (this.moving > 0)
            this.moving -= dt;
        this.tween.step(dt);
    },
    checkVisibility() {
        for (let m of this.members) {
            if (m.inView)
                continue;
            m.x = this.shared.x + Utils.random(-16, 16);
            m.y = this.shared.y + Utils.random(-16, 16);
            m.updateTask();
        }
    },
    render() {}
};
NAMESPACE.Image = function(args) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.follow = null;
    this.width = -1;
    this.height = -1;
    this.options = null;
    this.ready = false;
    this.rotation = 0.0;
    this.lifetime = 0;
    this.color = app.color(0x000000, 0.0);
    this.alpha = 1.0;
    this.creation = 0.0;
    this.scale = {
        x: 1.0,
        y: 1.0
    };
    this.pivot = {
        x: 0.5,
        y: 0.5
    };
    this.region = null;
    this.a = 1.0;
    this.blendSrc = app.gl.SRC_ALPHA;
    this.blendDst = app.gl.ONE_MINUS_SRC_ALPHA;
    this.random = Math.random();
    this.setup();
    let gl = app.gl;
    this.temp = {};
    this.palette = -1.0;
    Object.assign(this, args);
}
;
Object.assign(NAMESPACE.Image.prototype, {
    zIndex: 0,
    radius: 100,
    shape: COMMON.CIRCLE,
    setTexture(key) {
        if (this.src === key)
            return;
        if (typeof key === "string") {
            this.src = key;
            this.ready = false;
            if (!app.textures[key]) {
                app.loadTexture(key).then(()=>{
                    this.run(app.textures[this.src]);
                }
                );
            } else {
                this.run(app.textures[this.src]);
            }
        } else {
            this.run(key);
        }
    },
    meshArray: new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]),
    setRegion(x, y, w, h) {
        this.region = [x, y, w, h];
        this.radius = Math.max(w, h) / 2;
    },
    run(texture) {
        this.texture = texture;
        this.ready = true;
    },
    setup() {
        let gl = app.gl;
        let program = this.program = app.programs.image;
        this.modelMatrix = Matrix3.create();
    },
    step(dt) {
        if (this.follow) {
            this.x = this.follow.x;
            this.y = this.follow.y;
            this.z = this.follow.z;
        }
        this.lifetime += dt;
    },
    render() {
        if (!this.ready)
            return;
        let gl = app.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(this.blendSrc, this.blendDst);
        gl.useProgram(this.program.native);
        gl.enableVertexAttribArray(this.program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(this.program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.program.locations.uv);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(this.program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        let width = this.width;
        if (this.width < 0) {
            if (this.region)
                width = this.region[2];
            else
                width = this.texture.width;
        }
        let height = this.height;
        if (this.height < 0) {
            if (this.region)
                height = this.region[3];
            else
                height = this.texture.height;
        }
        this.program.set("width", width);
        this.program.set("height", height);
        this.program.set("color", this.color.r, this.color.g, this.color.b, this.color.a);
        this.program.set("alpha", this.alpha);
        this.program.set("creation", this.creation);
        if (this.region) {
            this.program.set("tx", this.region[0] / this.texture.width);
            this.program.set("ty", this.region[1] / this.texture.height);
            this.program.set("tw", this.region[2] / this.texture.width);
            this.program.set("th", this.region[3] / this.texture.height);
        } else {
            this.program.set("tx", 0.0);
            this.program.set("ty", 0.0);
            this.program.set("tw", 1.0);
            this.program.set("th", 1.0);
        }
        this.program.set("texture", 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, app.textures.palette);
        let palette = this.palette;
        if (palette < 0 && this.texture.paletteReady)
            palette = 0;
        this.program.set("paletteTexture", 1);
        this.program.set("palette", palette);
        var matrix = Matrix3.create();
        Matrix3.translate(matrix, this.x + this.offsetX | 0, this.y + this.offsetY - this.z | 0);
        if (this.rotation)
            Matrix3.rotate(matrix, -this.rotation);
        Matrix3.translate(matrix, (-width * this.pivot.x) * this.scale.x | 0, (-height * this.pivot.y) * this.scale.y | 0);
        if (this.scale.x !== 1.0 || this.scale.y !== 1.0)
            Matrix3.scale(matrix, this.scale.x, this.scale.y);
        this.program.set("modelMatrix", matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
});
NAMESPACE.MapEdge = function(args) {
    this.x = 0;
    this.y = 0;
    this.width = -1;
    this.height = -1;
    this.options = null;
    this.rotation = 0.0;
    this.lifetime = 0;
    this.scale = 1.0;
    this.flip = false;
    this.random = Math.random();
    this.repeatX = 1.0;
    this.repeatY = 1.0;
    this.repeatOffsetX = 0.0;
    this.repeatOffsetY = 0.0;
    this.blendSrc = app.gl.SRC_ALPHA;
    this.blendDst = app.gl.ONE_MINUS_SRC_ALPHA;
    this.needUpdateUV = false;
    Object.assign(this, args);
    this.setup();
    let gl = app.gl;
    if (!NAMESPACE.MapEdge.prototype.uvBuffer) {
        let array = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
        let uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
        NAMESPACE.MapEdge.prototype.uvBuffer = uvBuffer;
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
        NAMESPACE.MapEdge.prototype.positionBuffer = positionBuffer;
    }
}
;
Object.assign(NAMESPACE.MapEdge.prototype, {
    positionBuffer: null,
    uvBuffer: null,
    zIndex: 2,
    meshArray: new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]),
    setup() {
        let gl = app.gl;
        let program = this.program = app.programs.map_edge;
        this.modelMatrix = Matrix3.create();
    },
    step(dt) {
        this.lifetime += dt;
        this.box[0] = this.x;
        this.box[1] = this.y;
        this.box[2] = this.width;
        this.box[3] = this.height;
    },
    setTexture(key) {
        this.texture = app.textures[key];
    },
    render() {
        let gl = app.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(this.blendSrc, this.blendDst);
        gl.useProgram(this.program.native);
        gl.enableVertexAttribArray(this.program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(this.program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        this.program.set("texture", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        if (this.width < 0) {
            this.width = this.texture.width;
        }
        if (this.height < 0) {
            this.height = this.texture.height;
        }
        let width = this.width;
        let height = this.height;
        this.program.set("width", width);
        this.program.set("height", height);
        this.program.set("flip", this.flip);
        this.program.set("repeatX", this.width / this.texture.width);
        this.program.set("repeatY", this.height / this.texture.height);
        this.program.set("repeatOffsetX", this.repeatOffsetX / this.texture.width);
        this.program.set("repeatOffsetY", this.repeatOffsetY / this.texture.height);
        this.program.set("time", app.lifetime + this.random);
        var matrix = Matrix3.create();
        Matrix3.translate(matrix, this.x, this.y);
        if (this.rotation)
            Matrix3.rotate(matrix, -this.rotation);
        if (this.scale !== 1.0)
            Matrix3.scale(matrix, this.scale, this.scale);
        this.program.set("modelMatrix", matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
});
CLIENT.Meadow = function(args) {
    this.x = 0;
    this.y = 0;
    this.lifetime = 0.0;
    Object.assign(this, args);
    this.circle = null;
    this.updateEntitiesTimeout = 0.0;
    this.entities = [];
    this.grass = [];
    this.flag = this.collection.add("Flag");
    this.team = -1;
    this.color = COMMON.MEADOW_COLOR;
    this.update(args.shared);
    Object.assign(this.flag, this.rpos());
}
;
CLIENT.Meadow.prototype = {
    zIndex: 0,
    shape: COMMON.CIRCLE,
    radius: 80,
    groups: ["meadows"],
    enterview() {
        if (!this.circle) {
            this.circle = this.collection.add("Circle");
            this.circle.program = app.programs.meadow;
            this.circle.x = this.x;
            this.circle.y = this.y;
            this.circle.radius = this.radius;
            this.circle.scale.y = 0.75;
            this.circle.zIndex = -2;
            this.circle.texture = app.textures.spritesheet;
            this.circle.color.set(this.color);
        }
        this.updateGrass();
    },
    leaveview() {},
    _pos: {
        x: 0,
        y: 0
    },
    rpos() {
        let r = Math.random();
        let rx = Utils.random(32, this.radius);
        let ry = Utils.random(32, this.radius * 0.75);
        this._pos.x = this.x + Math.cos(r * 6.14) * rx;
        this._pos.y = this.y + Math.sin(r * 6.14) * ry;
        return this._pos;
    },
    updateGrass() {
        if (this.shared.grass > this.grass.length) {
            let count = this.shared.grass - this.grass.length;
            while (count--) {
                let grass = this.collection.add("Grass");
                grass.creation = 1.0;
                grass.temp.eaten = 0;
                Object.assign(grass, this.rpos());
                app.tween(grass).to({
                    creation: 0.0
                }, 1.0);
                this.grass.push(grass);
            }
        }
        if (this.shared.grass < this.grass.length) {
            let count = this.grass.length - this.shared.grass;
            while (count--) {
                let grass = Utils.maxBy(this.grass, this.mostEaten);
                this.removeGrass(grass);
            }
        }
    },
    removeObject(context) {
        context.collection.remove(context);
    },
    removeGrass(grass) {
        let index = this.grass.indexOf(grass);
        if (index > -1)
            this.grass.splice(index, 1);
        app.tween(grass).to({
            creation: 1.0
        }, 0.5).then(this.removeObject);
        if (grass.temp.eaten > 1.0) {
            let leaves = this.collection.add("Sprite");
            leaves.set("fx/leaves");
            leaves.rotation = Math.random() * 6.28;
            leaves.scale.x = 0.5;
            leaves.scale.y = 0.5;
            leaves.x = grass.x;
            leaves.y = grass.y + 4;
            leaves.z = 6;
            leaves.duration = 1.0;
            leaves.color = app.color(0x6abe30);
            leaves.shadow = true;
        }
    },
    mostEaten(o) {
        return o.temp.eaten;
    },
    step(dt) {
        if (!this.inView)
            return;
        this.lifetime += dt;
        if ((this.updateEntitiesTimeout -= dt) <= 0) {
            this.updateEntitiesTimeout = 0.25;
            this.updateEntities();
        }
        for (let grass of this.grass) {
            grass.temp.eaten -= dt;
        }
    },
    update(data) {
        Object.assign(this.shared, data);
        this.x = this.shared.x;
        this.y = this.shared.y;
        this.radius = this.shared.radius;
        if (data.grass !== undefined && this.inView)
            this.updateGrass();
        if (data.team !== undefined) {
            this.team = data.team;
            this.flag.team = this.team;
            this.game.needRefreshMap = true;
            if (data.team > -1) {}
        }
        if (data.water !== undefined) {
            this.color = Utils.RGBToInt(Utils.lerp(Utils.intToRGBA(COMMON.DRY_MEADOW_COLOR), Utils.intToRGBA(COMMON.MEADOW_COLOR), data.water / (this.radius * 0.2)));
            if (this.circle)
                this.circle.color.set(this.color);
        }
    },
    updateEntities() {
        let entities = this.collection.inView;
        for (let entity of this.entities) {
            entity.inGrass = false;
        }
        this.entities.length = 0;
        for (let entity of entities) {
            if (!entity.moveGrass)
                continue;
            if (!Utils.pointInEllipse(entity.x, entity.y, this.x, this.y, this.radius * 0.9, this.radius * 0.9 * 0.75))
                continue;
            entity.inGrass = true;
            this.entities.push(entity);
        }
    },
    render() {
        if (!this.circle)
            return;
        for (var i = 0; i < this.entities.length; i++) {
            let entity = this.entities[i];
            if (entity.z > 0)
                continue;
            app.painter.reset();
            app.painter.values.rotation = Math.sin(entity.y * 0.1 + entity.x * 0.025) * 0.25;
            app.painter.drawImageRegion(app.textures.spritesheet, 53, 38, 17, 6, entity.x + (entity.ox | 0), entity.y + (entity.oy | 0), 17, 6);
        }
    }
};
NAMESPACE.Monster = function(args) {
    this.lifetime = Math.random();
    this.speed = 1.0;
    this.x = Math.random() * 100;
    this.y = Math.random() * 100;
    this.z = 0;
    this.ox = 0;
    this.oy = 0;
    this.force = 0;
    this.forceDirection = 0;
    this.direction = Math.random() * 6;
    this.health = 10;
    this.destinationDistance = 0;
    this.dead = false;
    this.destination = {
        x: 0,
        y: 0
    };
    this.lookAt = null;
    Object.assign(this, args);
    this.sprite = new CLIENT.Sprite;
    this.sprite.prefix = "ogre/";
    this.sprite.set("run");
    this.sprite.loop = true;
    this.random = Math.random();
    this.state = new CLIENT.State(this,CLIENT.Monster.Ogre);
    this.x = this.destination.x = this.shared.x;
    this.y = this.destination.y = this.shared.y;
    this.moveGrass = true;
    this.sin = Math.sin(this.random * 6.28);
    this.cos = Math.cos(this.random * 6.28);
    this.update(this.shared);
    this.baseX = this.x;
    this.baseY = this.y;
    this.sprite.creation = 1.0;
    app.tween(this.sprite).to({
        creation: 0.0
    }, 2.0);
}
;
Object.assign(NAMESPACE.Monster.prototype, {
    zIndex: 1,
    radius: 8,
    collisionRadius: 8,
    ignorePointer: true,
    shape: COMMON.CIRCLE,
    systemShadow: 10,
    groups: ["movable"],
    update(data) {
        if (data.health < this.shared.health && this.inView) {
            app.sound.play("human/hit_flesh").rrate(0.2).gpan(this);
            app.sound.play("weapon/hit").rrate(0.2).gpan(this);
            if (data.health > 0) {
                app.sound.play("ogre/pain_" + Utils.random(1, 3)).rrate(0.2).gpan(this);
            } else {
                app.sound.play("ogre/death").rrate(0.1).gpan(this);
            }
            this.hitLifespan = 0.5;
            let blood = this.collection.add("Sprite");
            blood.set("fx/blood_1");
            blood.follow = this;
            blood.duration = 0.6;
            blood.rotation = Math.random() * 6.28;
            blood.scale.x = 1.0;
            blood.scale.y = 1.0;
        }
        if (!this.dead && data.occupation !== undefined) {
            this.task = data.occupation % 100;
            this.detail = data.occupation / 100 % 10000000 | 0;
            this.state.set("idle");
        }
        if (data.remove) {
            if (this.inView) {
                this.lifespan = 5.0;
                app.tween(this.sprite).delay(3.0).to({
                    creation: 1.0
                }, 2.0);
            } else {
                this.collection.remove(this);
            }
        }
        Object.assign(this.shared, data);
    },
    step(dt) {
        this.lifetime += dt;
        if (this.force) {
            this.force = Utils.moveTo(this.force, 0, 200 * dt);
            this.x += Math.cos(this.forceDirection) * this.force * dt;
            this.y += Math.sin(this.forceDirection) * this.force * dt;
        }
        if (this.hitLifespan > 0.0)
            this.hitLifespan -= dt;
        if (this.shared.health > 0) {
            let distance = Utils.distance(this, this.destination);
            this.destinationDistance = distance;
            if (distance > 1) {
                let destinationAngle = Utils.lookAt(this, this.destination);
                this.x += Math.cos(destinationAngle) * (distance + 48) * dt * this.speed;
                this.y += Math.sin(destinationAngle) * (distance + 48) * dt * this.speed;
            }
            if (this.lookAt) {
                if (typeof this.lookAt === "number") {
                    this.direction = Utils.circWrapTo(this.direction, this.lookAt, 6 * app.elapsed);
                } else {
                    this.direction = Utils.circWrapTo(this.direction, Utils.lookAt(this, this.lookAt), 6 * app.elapsed);
                }
            }
        }
        this.state.step(dt);
    },
    render() {
        if (!this.sprite.data)
            return;
        let row = Utils.dirrow(this.direction, this.sprite.data.rows);
        if (this.hitLifespan > 0.0) {
            this.sprite.color.set(0xffffff, 1.0);
        } else {
            this.sprite.color.set(0, 0);
        }
        this.sprite.step(app.elapsed);
        this.sprite.x = this.x + this.ox;
        this.sprite.y = this.y - this.z + this.oy - 6;
        this.sprite.row = row;
        this.sprite.render();
    }
});
CLIENT.Monster.Ogre = {
    idle: {
        enter(monster, manager) {
            monster.sprite.set("run");
            monster.sprite.loop = true;
            if (monster.task === COMMON.TASKS.FIGHT)
                manager.set("fight");
            else if (monster.task === COMMON.TASKS.DIE)
                manager.set("dead");
        },
        leave(monster) {
            monster.sprite.paused = false;
        },
        step(monster, manager) {
            if (monster.destinationDistance > 2) {
                monster.sprite.paused = false;
            } else {
                monster.sprite.paused = true;
            }
            if (Utils.interval(monster, "random_movement", 2.0)) {
                monster.destination.x = monster.baseX + Utils.random(-50, 50);
                monster.destination.y = monster.baseY + Utils.random(-50, 50);
                monster.lookAt = monster.destination;
                monster.speed = 0.25;
            }
        }
    },
    fight: {
        enter(monster, manager) {
            manager.data.target = monster.collection.sid(monster.detail);
        },
        step(monster, manager) {
            if (!manager.data.target)
                return;
            monster.destination.x = manager.data.target.x + monster.sin * 24;
            monster.destination.y = manager.data.target.y + monster.cos * 24;
            monster.lookAt = manager.data.target;
        }
    },
    dead: {
        enter(monster, manager) {
            monster.sprite.set("death");
            monster.sprite.duration = 2.0;
        }
    },
    attack: {
        enter(monster, manager) {
            monster.sprite.set("attack");
            monster.sprite.duration = 1.0;
        },
        step(monster, manager) {
            if (manager.runOnce(0.5)) {
                app.sound.play("impact/ground_medium").gpan(monster);
                app.game.fxRocks(monster.x + Math.cos(monster.direction) * 16, monster.y + Math.sin(monster.direction) * 16, 6);
                app.game.fxCameraStomp();
            }
            if (manager.runOnce(1.25))
                manager.set("idle");
        }
    }
};
CLIENT.Mushroom = function(args) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.def = null;
    this.scale = 1.0;
    this.lifetime = 0;
    this.creation = 0.0;
    Object.assign(this, args);
    this.update(this.shared);
    this.interactive = true;
    this.clickable = true;
    this.parent = this.collection.sid(this.shared.parent_sid);
    if (this.parent) {
        Object.assign(this, this.parent.rpos());
    }
}
;
CLIENT.Mushroom.prototype = {
    shape: COMMON.CIRCLE,
    radius: 8,
    constructor: CLIENT.Mushroom,
    interactiveIndex: 2,
    systemShadow: 4,
    groups: ["interactive"],
    tooltip: "mushroom",
    appear() {
        this.creation = 1.0;
        app.tween(this).to({
            creation: 0.0
        }, 1.0);
    },
    enterview() {
        if (this.lifetime < 0.5) {
            this.appear();
        }
    },
    beingCollected() {
        app.sound.play("human/eat_2").gpan(this);
    },
    pointerup() {
        this.game.order(this);
        this.game.action.set("snap");
    },
    update(data) {
        if (data.key !== undefined) {
            this.def = COMMON.items["mushroom_" + data.key];
        }
        if (data.remove)
            this.lifespan = 2.0;
        Object.assign(this.shared, data);
    },
    blink() {
        let debris = this.collection.add("Sprite");
        debris.set("fx/blink");
        debris.follow = this;
        debris.duration = 0.25;
        debris.scale.x = 0.5;
        debris.scale.y = 0.5;
        debris.z = this.z;
        debris.zIndex = 1;
    },
    step(dt) {
        this.lifetime += dt;
    },
    render() {
        app.painter.reset();
        app.painter.scale(this.scale, this.scale);
        app.painter.align(0.5, 0.9);
        app.painter.creation(this.creation);
        app.painter.drawImageRegion(app.textures.spritesheet, ...this.def.sprite, this.x, this.y - this.z);
        if (this.game.hovered === this) {
            app.painter.alpha(Utils.saw(4 * app.lifetime % 1.0));
            app.painter.color(0xffff00);
            app.painter.drawImageRegion(app.textures.spritesheet, ...this.def.sprite, this.x, this.y - this.z);
        }
    }
}
CLIENT.Net = function(args) {
    this.x = 0;
    this.y = 0;
    this.direction = 0;
    this.lifetime = Math.random() * 10;
    this.partner = null;
    Object.assign(this, args);
    this.image = new CLIENT.Image();
    this.image.setTexture("net");
    this.image.setRegion(0, 0, 256, 64);
}
;
CLIENT.Net.prototype = {
    constructor: CLIENT.Net,
    shape: COMMON.CIRCLE,
    radius: 10,
    zIndex: 1,
    step(dt) {
        this.lifetime += dt;
        this.updatePosition();
    },
    updatePosition() {
        let distance = Utils.distance(this.a, this.b);
        this.image.width = distance;
        this.image.height = 20;
        Utils.limit(1 - distance / 150, 0.5, 1.0) * 32;
        this.radius = distance / 2;
        this.x = this.a.x + (this.b.x - this.a.x) * 0.5;
        this.y = this.a.y + (this.b.y - this.a.y) * 0.5;
    },
    render() {
        if (this.image.ready) {
            this.updatePosition();
            this.image.x = this.x;
            this.image.y = this.y;
            this.image.rotation = Utils.lookAt(this.a, this.b)
            this.image.render();
        }
    }
};
CLIENT.Node = function(args) {
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.connections = 0;
    this.creation = 1.0;
    this.lifetime = 0;
    app.tween(this).to({
        creation: 0.0
    }, 0.5);
    Object.assign(this, args);
    this.roof = this.collection.add("Sprite");
    this.roof.set("building/node_roof");
    this.roof.auto = false;
    this.roof.follow = this;
    this.roof.creation = 1.0;
    this.roof.hide();
    app.tween(this.roof).to({}, 0.5);
    this.sprite = "building/node_wireframe";
    this.update(this.shared);
    this.run();
    this.interactive = true;
    this.clickable = true;
}
;
CLIENT.Node.prototype = {
    shape: COMMON.CIRCLE,
    radius: 24,
    zIndex: 1,
    interactiveRadius: 24,
    interactiveIndex: 1,
    groups: ["interactive"],
    _destruct() {
        this.game.walls.delete(this.shared.gx, this.shared.gy, this);
    },
    tooltip: "Buld a tower",
    pointerup(e) {
        if (e.button === "left") {
            this.game.action.data.sx = this.shared.gx;
            this.game.action.data.sy = this.shared.gy;
            this.game.action.set("buildWallB");
        } else {
            app.game.send("tower", {
                node_sid: this.sid
            });
        }
    },
    update(data) {
        Object.assign(this.shared, data);
        if (data.gx !== undefined)
            this.x = data.gx * COMMON.GRID_WIDTH;
        if (data.gy !== undefined)
            this.y = data.gy * COMMON.GRID_HEIGHT;
    },
    step(dt) {
        this.lifetime += dt;
    },
    run() {
        this.game.walls.set(this.shared.gx, this.shared.gy, this);
    },
    render() {
        app.painter.reset();
        app.painter.drawSprite(this.sprite, this.x, this.y);
    }
};
CLIENT.ParabolicMissile = function(args) {
    this.x = 0;
    this.y = 0;
    this.z = 10;
    this.tx = 0;
    this.ty = 0;
    this.lifetime = 0;
    this.duration = 1.0;
    this.delay = 0.0;
    Object.assign(this, args);
}
;
CLIENT.ParabolicMissile.prototype = {
    zIndex: 3,
    shape: COMMON.CIRCLE,
    radius: 16,
    collisionRadius: 50,
    heavy: true,
    groups: ["impassable"],
    run() {
        if (!this.game.camera.inView(this.x, this.y) && !this.game.camera.inView(this.tx, this.ty))
            return;
        app.tween(this).delay(this.delay).to({
            x: this.tx,
            y: this.ty
        }, this.duration, "linear");
        app.tween(this).delay(this.delay).to({
            z: this.z + 80
        }, this.duration * 0.5, "outSine").to({
            z: 0
        }, this.duration * 0.5, "inSine");
        this.lifespan = this.duration;
    },
    step: function(dt) {
        this.lifetime += dt;
        this.delay -= dt;
    },
    _destruct() {
        if (!this.inView)
            return;
        let explosion = this.collection.add("Sprite");
        explosion.set("fx/ground_hit");
        explosion.x = this.x;
        explosion.y = this.y;
        explosion.zIndex = 1;
        explosion.pivot.y = 0.9;
        explosion.duration = 0.4;
        this.game.fxExplodeSprite("fx/stone", this.x, this.y, 0, 0, 1.5, {
            spread: 4.0,
            altitude: 40.0
        });
        this.game.fxExplodeSprite("fx/stone", this.x, this.y, 0, 0, 1.0, {
            spread: 1.0
        });
        app.sound.play("explosion/rock").gpan(this).rrate(0.2);
        app.game.camera.shake(3, 0.2);
    },
    render: function(dt) {
        if (this.delay > 0)
            return;
        let scale = 1.0 + this.z / 140;
        app.painter.reset();
        app.painter.color(0x000000);
        app.painter.alpha(0.25);
        app.painter.scale(scale, scale);
        app.painter.drawSprite("fx/stone", this.x, this.y, app.lifetime * 50);
        app.painter.alpha(1.0);
        app.painter.color(-1);
        app.painter.drawSprite("fx/stone", this.x, this.y - this.z, app.lifetime * 50);
    }
};
NAMESPACE.Polygon = function() {
    this.x = 0;
    this.y = 0;
    this.options = null;
    this.ready = false;
    this.rotation = 0.0;
    this.lifetime = 0;
    this.scale = 1.0;
    this.pivot = {
        x: 0,
        y: 0
    }
    this.needUpdateUV = false;
    this.setup();
}
;
Object.assign(NAMESPACE.Polygon.prototype, {
    zIndex: 0,
    checkUpdates() {
        if (this.needUpdateUV)
            this.updateUV();
    },
    setTexture(key) {
        this.src = key;
        this.ready = false;
        if (!app.sprites[key]) {
            app.loadTexture(key).then(()=>{
                this.run();
            }
            );
        } else {
            this.run();
        }
    },
    setVertices(vertices) {
        let gl = app.gl;
        let indices = earcut(vertices);
        this.indices = indices;
        this.meshArray = new Float32Array(vertices);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.meshArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.positionIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    },
    setUV(map) {
        this.uvMap = map;
        if (this.ready) {
            this.updateUV();
        } else
            this.needUpdateUV = true;
    },
    updateUV() {
        if (!this.meshArray)
            return;
        let gl = app.gl;
        let map = this.uvMap;
        let uvArray = new Float32Array(this.meshArray.length);
        for (var i = 0; i < map.length; i += 2) {
            uvArray[i] = map[i] / this.texture.width;
            uvArray[i + 1] = map[i + 1] / this.texture.height;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uvArray, gl.STATIC_DRAW);
        this.needUpdateUV = false;
    },
    run() {
        this.texture = app.textures[this.src];
        this.ready = true;
        this.checkUpdates();
    },
    setup() {
        let gl = app.gl;
        this.program = app.programs.polygon;
        this.positionBuffer = gl.createBuffer();
        this.positionIndexBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();
    },
    step(dt) {
        this.lifetime += dt;
    },
    render() {
        if (!this.ready)
            return;
        this.checkUpdates();
        let gl = app.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(this.program.native);
        gl.enableVertexAttribArray(this.program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.positionIndexBuffer);
        gl.enableVertexAttribArray(this.program.locations.uv);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(this.program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        this.program.set("texture", 0);
        this.program.set("rgba", 1.0, 1.0, 1.0, 1.0);
        var matrix = Matrix3.create();
        Matrix3.translate(matrix, this.x, this.y);
        if (this.rotation)
            Matrix3.rotate(matrix, this.rotation);
        Matrix3.translate(matrix, this.pivot.x, -this.pivot.y);
        if (this.scale !== 1.0)
            Matrix3.scale(matrix, this.scale, this.scale);
        this.program.set("modelMatrix", matrix);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
});
NAMESPACE.Rectangle = function(args) {
    this.x = 0;
    this.y = 0;
    this.width = -1;
    this.height = -1;
    this.options = null;
    this.rotation = 0.0;
    this.lifetime = 0;
    this.scale = 1.0;
    this.random = Math.random();
    this.repeat = false;
    this.repeatX = 1.0;
    this.repeatY = 1.0;
    this.repeatOffsetX = 0.0;
    this.repeatOffsetY = 0.0;
    this.blendSrc = app.gl.SRC_ALPHA;
    this.blendDst = app.gl.ONE_MINUS_SRC_ALPHA;
    this.needUpdateUV = false;
    Object.assign(this, args);
    this.setup();
    let gl = app.gl;
    if (!NAMESPACE.Rectangle.prototype.uvBuffer) {
        let array = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
        let uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
        NAMESPACE.Rectangle.prototype.uvBuffer = uvBuffer;
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
        NAMESPACE.Rectangle.prototype.positionBuffer = positionBuffer;
    }
}
;
Object.assign(NAMESPACE.Rectangle.prototype, {
    positionBuffer: null,
    uvBuffer: null,
    zIndex: 0,
    meshArray: new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]),
    setup() {
        let gl = app.gl;
        let program = this.program = app.programs.map_edge;
        this.modelMatrix = Matrix3.create();
    },
    step(dt) {
        this.lifetime += dt;
        this.box[0] = this.x;
        this.box[1] = this.y;
        this.box[2] = this.width;
        this.box[3] = this.height;
    },
    setTexture(key) {
        this.texture = app.textures[key];
    },
    render() {
        let gl = app.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(this.blendSrc, this.blendDst);
        gl.useProgram(this.program.native);
        gl.enableVertexAttribArray(this.program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(this.program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        this.program.set("texture", 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        if (this.texture) {
            if (this.width < 0) {
                this.width = this.texture.width;
            }
            if (this.height < 0) {
                this.height = this.texture.height;
            }
        }
        let width = this.width;
        let height = this.height;
        this.program.set("width", width);
        this.program.set("height", height);
        this.program.set("repeatX", this.width / this.texture.width);
        this.program.set("repeatY", this.height / this.texture.height);
        this.program.set("repeatOffsetX", this.repeatOffsetX / this.texture.width);
        this.program.set("repeatOffsetY", this.repeatOffsetY / this.texture.height);
        this.program.set("time", app.lifetime + this.random);
        var matrix = Matrix3.create();
        Matrix3.translate(matrix, this.x, this.y);
        if (this.rotation)
            Matrix3.rotate(matrix, -this.rotation);
        if (this.scale !== 1.0)
            Matrix3.scale(matrix, this.scale, this.scale);
        this.program.set("modelMatrix", matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
});
CLIENT.Rocks = function(args) {
    this.x = 0;
    this.y = 0;
    this.hitLifespan = 0;
    this.minePosition = {};
    Object.assign(this, args);
    this.rocks = [];
    this.rocks.sort(this.sortCallback);
    this.update(this.shared);
    this.parent = this.collection.sid(this.shared.parent_sid);
    if (this.parent) {
        Object.assign(this, this.parent.rpos());
    }
}
CLIENT.Rocks.prototype = {
    radius: 20,
    shape: COMMON.CIRCLE,
    constructor: CLIENT.Rocks,
    tooltip: "rocks",
    groups: ["interactive"],
    zIndex: 2,
    sprites: [[146, 2, 25, 31], [178, 5, 18, 25], [149, 36, 17, 26], [169, 37, 11, 18], [183, 33, 9, 33], [196, 33, 13, 33], [149, 69, 13, 20], [166, 70, 16, 18], [187, 68, 14, 22]],
    enterview() {
        this.updateRocks();
    },
    leaveview() {
        this.removeRocks();
    },
    destruct() {},
    updateRocks() {
        let count = this.shared.count;
        if (count > this.rocks.length) {
            let len = count - this.rocks.length;
            for (let i = 0; i < len; i++) {
                this.addRock();
            }
        }
        if (count < this.rocks.length) {
            let len = this.rocks.length - count;
            while (len-- > 0)
                this.killRock();
        }
        let first = this.rocks[0];
        if (first) {
            this.minePosition = {
                x: first.x,
                y: first.y
            };
        }
    },
    removeRocks() {
        while (this.rocks.length) {
            let rock = this.rocks.shift();
            rock.collection.remove(rock);
        }
    },
    mine() {
        let first = this.rocks[0];
        if (!first)
            return;
        this.debris(first.x, first.y, 5, 0.25);
        app.sound.play("action/mine_" + Utils.random(1, 2)).gpan(this).rrate(0.1);
        let blink = this.collection.add("Sprite");
        blink.set("fx/blink");
        blink.follow = first;
        blink.duration = 0.25;
        blink.scale.x = 0.5;
        blink.scale.y = 0.5;
        blink.zIndex = 2;
        this.hitLifespan = 0.3;
    },
    debris(x, y, count=5, scale=0.5) {
        for (var i = 0; i < count; i++) {
            let debris = this.collection.add("Sprite");
            let duration = Utils.randomf(0.5, 1.5);
            debris.set("fx/stone");
            debris.shadow = true;
            debris.scale.x = scale;
            debris.scale.y = scale;
            debris.x = x + Utils.random(-8, 8);
            debris.y = y + Utils.random(-8, 8);
            ;debris.z = 8;
            debris.shadow = true;
            debris.loop = true;
            debris.duration = duration * 0.3;
            app.tween(debris).to({
                z: 30
            }, duration * 0.5, "inSine").to({
                z: 0
            }, duration * 0.5, "outBounce");
            app.tween(debris).to({
                x: debris.x + Utils.random(-50, 50),
                y: debris.y + Utils.random(-50, 50)
            }, duration);
            app.tween(debris.scale).delay(duration * 0.5).to({
                x: 0,
                y: 0,
            }, duration * 0.5);
            debris.lifespan = duration;
        }
    },
    update(data) {
        Object.assign(this.shared, data);
        if (data.remove) {
            this.lifespan = 1.0;
        }
        if (data.count !== undefined) {
            if (this.inView)
                this.updateRocks();
        }
    },
    addRock() {
        let rock = this.collection.add("Image");
        rock.setTexture(app.textures.spritesheet);
        rock.x = this.x + Utils.random(-this.radius, this.radius);
        rock.y = this.y + Utils.random(-this.radius, this.radius);
        rock.zIndex = 1;
        rock.pivot.y = 0.3;
        let sprite = Utils.random(this.sprites);
        rock.setRegion(...sprite);
        rock.duration = 1.0 + Math.random() * 2.0;
        rock.region[3] = 0;
        app.tween(rock.region).delay(rock.duration * 0.25).to({
            3: sprite[3]
        }, rock.duration * 0.75);
        rock.radius = 2;
        this.rocks.push(rock);
    },
    killRock() {
        let rock = this.rocks.shift();
        rock.collection.remove(rock);
        app.sound.play("explosion/rock").gpan(this).rrate(0.1);
        this.debris(rock.x, rock.y, 8, 0.5);
    },
    sortCallback(a, b) {
        return (a.y - b.y) || (a.x - b.x);
    },
    step() {},
    render() {
        app.painter.reset();
        app.painter.align(0.5, 1.0);
        for (let rock of this.rocks) {
            if (rock.lifetime <= rock.duration) {
                let progress = rock.lifetime / rock.duration;
                rock.scale.x = progress;
                rock.scale.y = progress;
                app.painter.scale(progress * rock.region[2] / 32, 2.0 * Utils.saw(progress));
                app.painter.drawSprite("fx/earthline", rock.x, rock.y + 8, app.lifetime * 10);
                rock.offsetX = Math.sin(app.lifetime * 40 + rock.random * 40) * 2.0 | 0;
            }
        }
        if (this.hitLifespan > 0) {
            this.hitLifespan -= app.elapsed;
            let first = this.rocks[0];
            if (first) {
                first.offsetX = Utils.random(-1, 1);
            }
        }
    }
}
CLIENT.ShipData = function(args) {
    Object.assign(this, args);
    this.fleet = this.collection.sid(this.shared.fleet_sid);
    this.fleet.addShip(this);
    this.update(this.shared);
}
;
CLIENT.ShipData.prototype = {
    constructor: CLIENT.ShipData,
    update(data) {}
};
NAMESPACE.Sprite = function(args) {
    this.auto = true;
    this.region = [0, 0, 0, 0];
    this.delay = 0.0;
    this.alpha = 1.0;
    this.shadow = false;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.frame = -1;
    this.key = "";
    this.prefix = "";
    this.fullKey = "";
    this.random = Math.random();
    this.blendDst = app.gl.ONE_MINUS_SRC_ALPHA;
    this.inverse = false;
    this.a = 1.0;
    this.data = null;
    this.options = null;
    this.row = 0;
    this.ready = false;
    this.rotation = 0.0;
    this.lifetime = 0;
    this.lifespan = 0.0;
    this.time = 0;
    this.progress = 0.0;
    this.timeScale = 1.0;
    this.scale = {
        x: 1.0,
        y: 1.0
    };
    this.pivot = {
        x: 0.5,
        y: 0.5
    };
    this.trim = [0, 0];
    this.loop = false;
    this.duration = 1.0;
    this.easing = false;
    this.color = app.color(0x000000, 0.0);
    this.range = null;
    this.paused = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dissolve = 0.0;
    this.creation = 0.0;
    this.follow = null;
    this.palette = -1.0;
    this.hidden = false;
    Object.assign(this, args);
    this.dissolveMap = app.textures.noise;
    this.setup();
}
;
NAMESPACE.Sprite.prototype = {
    zIndex: 3,
    shape: COMMON.CIRCLE,
    radius: 10,
    set(key) {
        this.progress = 0.0;
        this.range = null;
        this.inverse = false;
        this.loop = false;
        this.key = key;
        this.ready = false;
        let fullKey = this.prefix + key;
        this.fullKey = fullKey;
        if (!app.sprites[this.prefix + key]) {
            app.loadSprite(this.prefix + key).then(()=>{
                if (this.prefix + this.key === fullKey)
                    this.run();
            }
            );
        } else {
            this.run();
        }
    },
    meshArray: new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]),
    uvArray: new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]),
    run() {
        this.time = 0;
        this.data = app.sprites[this.prefix + this.key];
        this.texture = app.textures["sprites/" + this.prefix + this.key];
        if (this.texture.paletteReady && this.palette < 0)
            this.palette = 0;
        this.setFrame(0);
        this.ready = true;
    },
    setFrame(index) {
        let gl = app.gl;
        this.frame = index;
        this.absFrame = this.row * this.data.frames + this.frame;
        if (this.data.regions) {
            var regionIndex = this.absFrame * 4;
            this.region[0] = this.data.regions[regionIndex + 0];
            this.region[1] = this.data.regions[regionIndex + 1];
            this.region[2] = this.data.regions[regionIndex + 2];
            this.region[3] = this.data.regions[regionIndex + 3];
            var trimIndex = this.absFrame * 2;
            if (this.data.trim) {
                this.trim[0] = this.data.trim[trimIndex + 0];
                this.trim[1] = this.data.trim[trimIndex + 1];
            } else {
                this.trim[0] = 0;
                this.trim[1] = 0;
            }
        } else {
            let cols = this.data.cols || (this.texture.width / this.data.width | 0);
            if (this.data.rows) {
                var x = this.frame % this.data.frames;
                var y = this.row + this.frame / this.data.frames | 0;
            } else {
                var x = this.frame % cols;
                var y = this.frame / cols | 0;
            }
            this.region[0] = x * this.data.width;
            this.region[1] = y * this.data.height;
            this.region[2] = this.data.width;
            this.region[3] = this.data.height;
            this.trim[0] = 0;
            this.trim[1] = 0;
        }
        this.needMatrixUpdate = true;
    },
    play() {},
    setup() {
        let gl = app.gl;
        let program = this.program = app.programs.sprite;
        this.modelMatrix = Matrix3.create();
        this.positionBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();
    },
    step(dt) {
        if (this.delay > 0) {
            this.delay -= dt;
            return;
        }
        if (!this.paused) {
            this.lifetime += dt;
            this.time += dt * this.timeScale;
        }
        if (!this.ready)
            return;
        if (this.follow) {
            this.x = this.follow.x;
            this.y = this.follow.y;
        }
        let progress;
        progress = this.time / this.duration;
        if (this.loop) {
            this.time = this.time % this.duration;
            progress = progress % 1.0;
        } else {
            if (progress > 1.0)
                progress = 1.0;
        }
        this.progress = progress;
        if (this.easing)
            progress = app.ease(progress, this.easing);
        let frame;
        this.progress = progress;
        if (this.range) {
            let frames = this.range[1] - this.range[0];
            if (!this.loop && progress >= 1.0)
                frame = this.range[0] + frames;
            else {
                frame = (frames + 1) * progress;
                frame = frame % (frames + 1);
                frame = this.range[0] + frame | 0;
            }
        } else {
            if (!this.loop && progress >= 1.0)
                frame = this.data.frames - 1;
            else {
                frame = this.data.frames * progress;
                if (this.loop)
                    frame = frame % this.data.frames;
                frame = frame | 0;
            }
        }
        if (this.inverse)
            frame = (this.data.frames - 1) - frame;
        this.setFrame(frame);
        if (this.auto && !this.lifespan && this.time > this.duration && this.collection && !this.loop)
            this.collection.remove(this);
    },
    pause() {
        this.paused = true;
    },
    unpause() {
        this.paused = false;
    },
    hide() {
        this.hidden = true;
    },
    show() {
        this.hidden = false;
    },
    restart() {
        this.time = 0;
        this.progress = 0;
        if (this.ready)
            this.setFrame(0);
    },
    render() {
        if (this.delay > 0)
            return;
        if (this.hidden)
            return;
        if (!this.ready)
            return;
        let gl = app.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, this.blendDst);
        gl.useProgram(this.program.native);
        gl.enableVertexAttribArray(this.program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(this.program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.dissolveMap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, app.textures.palette);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.enableVertexAttribArray(this.program.locations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, app.quad);
        gl.vertexAttribPointer(this.program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        this.program.set("texture", 0);
        this.program.set("paletteTexture", 1);
        this.program.set("dissolveMap", 2);
        this.program.set("palette", this.palette);
        this.program.set("dissolve", this.dissolve);
        this.program.set("creation", this.creation);
        this.program.set("rw", this.region[2]);
        this.program.set("rh", this.region[3]);
        this.program.set("alpha", this.alpha);
        this.program.set("tx", this.region[0] / this.texture.width);
        this.program.set("ty", this.region[1] / this.texture.height);
        this.program.set("tw", this.region[2] / this.texture.width);
        this.program.set("th", this.region[3] / this.texture.height);
        this.program.set("color", this.color.r, this.color.g, this.color.b, this.color.a);
        var matrix = this.modelMatrix;
        if (true || this.needMatrixUpdate)
            this.updateMatrix();
        this.program.set("modelMatrix", this.modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        if (this.shadow) {
            let z = this.z;
            this.z = 0;
            this.updateMatrix();
            this.program.set("color", 0x000000);
            this.program.set("alpha", 0.25);
            this.program.set("modelMatrix", this.modelMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            this.z = z;
        }
    },
    updateMatrix() {
        let matrix = this.modelMatrix;
        Matrix3.reset(matrix);
        Matrix3.translate(matrix, this.x + this.offsetX | 0, this.y + this.offsetY - this.z | 0);
        Matrix3.rotate(matrix, -this.rotation);
        Matrix3.translate(matrix, this.trim[0] * this.scale.x - this.scale.x * this.data.width * this.pivot.x | 0, this.trim[1] * this.scale.y - this.scale.y * this.data.height * this.pivot.y | 0);
        if (this.scale.x !== 1.0 || this.scale.y !== 1.0)
            Matrix3.scale(matrix, this.scale.x, this.scale.y);
        this.needMatrixUpdate = false;
    }
};
PLAYGROUND.Application.prototype.spritePromises = {};
PLAYGROUND.Application.prototype.loadSprite = function(key) {
    var app = this;
    if (app.spritePromises[key])
        return app.spritePromises[key];
    if (!app.sprites)
        app.sprites = {};
    if (app.sprites[key])
        return;
    this.loader.add();
    var json_url = app.rewriteURL("sprites/" + key + ".json");
    var path = key.split("/");
    path.pop();
    path = path.join("/");
    var promise = new Promise(function(resolve, reject) {
        return app.request(json_url).then(function(request) {
            var raw = request.responseText;
            var json = JSON.parse(raw);
            var url = json.src ? json.src : (key + ".png");
            let textureOptions = {};
            if (json.usePalette)
                textureOptions.usePalette = true;
            var result = app.loadTexture("<sprites/" + url + "> sprites/" + key, textureOptions);
            result.then(function(texture) {
                json.texture = texture;
                app.insertAsset(json, app.sprites, key);
                app.loader.success("sprite " + key);
                resolve();
            });
            return result;
        });
    }
    );
    app.spritePromises[key] = promise;
    return promise;
}
;
NAMESPACE.Sprite.getRegion = function(sprite, frame, row) {
    let data = app.sprites[sprite];
    frame = frame % data.frames | 0;
    row = row % data.rows | 0;
    let absFrame = row * data.frames + frame;
    let result = [];
    var regionIndex = absFrame * 4;
    result[0] = data.regions[regionIndex + 0];
    result[1] = data.regions[regionIndex + 1];
    result[2] = data.regions[regionIndex + 2];
    result[3] = data.regions[regionIndex + 3];
    return result;
}
;
NAMESPACE.Sprite.getTrim = function(sprite, frame, row) {
    let data = app.sprites[sprite];
    frame = frame % data.frames | 0;
    row = row % data.rows | 0;
    let absFrame = row * data.frames + frame;
    let result = [];
    var regionIndex = absFrame * 2;
    result[0] = data.trim[regionIndex + 0];
    result[1] = data.trim[regionIndex + 1];
    return result;
}
;
CLIENT.Text = function(args) {
    this.x = 0;
    this.y = 0;
    Object.assign(this, args);
    this.image = new CLIENT.Image;
    this.colorsCycle = null;
    this.colorsCycleInterval = 0.2;
    this.colorsCycleTimestamp = -1.0;
    this.colorsCycleIndex = 0;
}
;
CLIENT.Text.prototype = {
    constructor: CLIENT.Text,
    set text(text) {
        this._text = text;
        this.refresh();
    },
    get text() {
        return this._text;
    },
    setColorCycle(colors, interval=0.2) {
        this.colorsCycle = colors;
        this.colorsCycleInterval = interval;
        this.colorsCycleTimestamp = -interval;
        this.colorsCycleIndex = 0;
    },
    refresh() {
        let canvas = app.tempCanvas;
        let ctx = app.tempCanvas.ctx;
        let fontSize = 16;
        ctx.font = fontSize + "px 'generic'";
        let width = ctx.measureText(this.text).width;
        let height = fontSize * 2;
        canvas.width = Utils.nearestPOT(width);
        canvas.height = Utils.nearestPOT(height);
        ctx.font = fontSize + "px 'generic'";
        ctx.fillStyle = "#fff";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, 0.0, (height / 2 | 0) + 0.5);
        this.image.setTexture(app.textureFromCanvas(canvas));
        this.image.setRegion(0, 0, width, height);
        canvas.style.position = "absolute";
        canvas.style.zIndex = "1";
    },
    step() {},
    render() {
        this.image.x = this.x;
        this.image.y = this.y;
        this.image.scale = 0.5;
        if (this.colorsCycle) {
            if (app.lifetime - this.colorsCycleTimestamp > this.colorsCycleInterval) {
                this.colorsCycleIndex = (this.colorsCycleIndex + 1) % this.colorsCycle.length;
                this.colorsCycleTimestamp = app.lifetime;
                let color = this.colorsCycle[this.colorsCycleIndex];
                this.image.r = color[0];
                this.image.g = color[1];
                this.image.b = color[2];
            }
        }
        this.image.render();
    }
};
NAMESPACE.TilingImage = function() {
    this.x = 0;
    this.y = 0;
    this.width = -1;
    this.height = -1;
    this.options = null;
    this.ready = false;
    this.rotation = 0.0;
    this.lifetime = 0;
    this.scale = 1.0;
    this.alpha = 1.0;
    this.repeatX = 1.0;
    this.repeatY = 1.0;
    this.repeatOffsetX = 0.0;
    this.repeatOffsetY = 0.0;
    this.blendSrc = app.gl.SRC_ALPHA;
    this.blendDst = app.gl.ONE_MINUS_SRC_ALPHA;
    this.needUpdateUV = false;
    this.setup();
    let gl = app.gl;
    if (!NAMESPACE.TilingImage.prototype.uvBuffer) {
        let uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]), gl.STATIC_DRAW);
        NAMESPACE.TilingImage.prototype.uvBuffer = uvBuffer;
    }
}
;
Object.assign(NAMESPACE.TilingImage.prototype, {
    zIndex: 0,
    setTexture(key) {
        if (typeof key === "string") {
            this.src = key;
            this.ready = false;
            if (!app.textures[key]) {
                app.loadTexture(key).then(()=>{
                    this.run(app.textures[this.src]);
                }
                );
            } else {
                this.run(app.textures[this.src]);
            }
        } else {
            this.run(key);
        }
    },
    meshArray: new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]),
    run(texture) {
        this.texture = texture;
        this.ready = true;
    },
    setup() {
        let gl = app.gl;
        let program = this.program = app.programs.tiling_image;
        this.modelMatrix = Matrix3.create();
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.meshArray, gl.STATIC_DRAW);
    },
    step(dt) {
        this.lifetime += dt;
    },
    render() {
        if (!this.ready)
            return;
        let gl = app.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(this.blendSrc, this.blendDst);
        gl.useProgram(this.program.native);
        gl.enableVertexAttribArray(this.program.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.program.locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.enableVertexAttribArray(this.program.locations.uv);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(this.program.locations.uv, 2, gl.FLOAT, false, 0, 0);
        let width = this.width;
        if (this.width < 0) {
            width = this.texture.width;
        }
        let height = this.height;
        if (this.height < 0) {
            height = this.texture.height;
        }
        this.program.set("alpha", this.alpha);
        this.program.set("width", width);
        this.program.set("height", height);
        this.program.set("repeatX", this.repeatX);
        this.program.set("repeatY", this.repeatY);
        this.program.set("repeatOffsetX", this.repeatOffsetX / this.texture.width);
        this.program.set("repeatOffsetY", this.repeatOffsetY / this.texture.height);
        this.program.set("texture", 0);
        var matrix = Matrix3.create();
        Matrix3.translate(matrix, this.x, this.y);
        if (this.rotation)
            Matrix3.rotate(matrix, -this.rotation);
        if (this.scale !== 1.0)
            Matrix3.scale(matrix, this.scale, this.scale);
        this.program.set("modelMatrix", matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
});
CLIENT.Totem = function(args) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    Object.assign(this, args);
    this.tween = new CLIENT.Tween(this);
    this.interactive = true;
    this.clickable = true;
    this.lifetime = 0.0;
    this.liftLifespan = 0.0;
    this.lifted = false;
    this.z = 50;
    this.put();
    this.level = 0;
    this.prev = 0;
}
;
CLIENT.Totem.prototype = {
    zIndex: 1,
    constructor: CLIENT.Totem,
    shape: COMMON.CIRCLE,
    radius: 4,
    interactiveRadius: 16,
    interactiveIndex: 3,
    ignoreDistance: true,
    groups: ["interactive"],
    systemShadow: 8,
    tooltip: "totem",
    die() {
        let region = app.sprites.totem.regions.slice(0, 4);
        if (this.inView) {
            app.game.fxExplode(this.x - region[2] * 0.5 | 0, this.y - this.z - region[3] * 0.8 | 0, app.sprites.totem.texture, region, 2.0, {
                palette: this.group.palette === 0 ? 30 : this.group.palette
            });
        }
        this.lifespan = 2.0;
    },
    lift() {
        this.lifted = true;
        if (this.player) {
            app.sound.play("organic/rock_debris").rate(0.75).rrate(0.2);
            this.zIndex = 1.1;
        }
        this.liftLifespan = 0.5;
        app.tween(this).discard().to({
            z: 24 + (PLAYGROUND.MOBILE ? -COMMON.MOBILE_CURSOR_OFFSET : 0)
        }, 0.1);
    },
    put() {
        this.lifted = false;
        app.tween(this).to({
            z: 0
        }, 0.5, "outBounce");
        let debris = this.collection.add("Sprite");
        let scale = 0.5;
        debris.delay = 0.2;
        debris.set("fx/dust");
        debris.scale.x = scale;
        debris.scale.y = scale;
        debris.x = this.x;
        debris.y = this.y;
        debris.zIndex = 0;
        debris.duration = 1.0;
        if (this.inView && this.player) {
            app.sound.play("impact/ground_medium").delay(debris.delay).gpan(this).volume(0.25);
            app.game.fxCameraStomp();
        }
    },
    pointerdown() {
        if (!this.player)
            return;
        if (!PLAYGROUND.MOBILE)
            this.game.action.set("moveTotem", this);
    },
    dragstart() {
        if (!this.player)
            return;
        if (PLAYGROUND.MOBILE)
            this.game.action.set("moveTotem", this);
    },
    enterview() {},
    leaveview() {},
    debris() {
        let debris = this.collection.add("Sprite");
        let duration = this.z * 0.02;
        debris.set("fx/stone");
        let scale = Utils.randomf(0.1, 0.25);
        debris.shadow = true;
        debris.scale.x = scale;
        debris.scale.y = scale;
        debris.x = this.x + Utils.random(-8, 8);
        debris.y = this.y + Utils.random(-8, 8);
        debris.z = this.z;
        debris.shadow = true;
        debris.loop = true;
        debris.duration = duration * 0.3;
        app.tween(debris).to({
            z: 0
        }, duration, "outBounce");
        app.tween(debris.scale).delay(duration * 0.5).to({
            x: 0,
            y: 0,
        }, duration);
        debris.lifespan = duration;
    },
    step(dt) {
        if (this.group === this.game.player) {
            this.interactiveIndex = 10;
            if (this.lifted) {
                this.x = app.game.pointer.x;
                this.group.tx | 0;
                this.y = app.game.pointer.y;
                this.group.ty | 0;
            } else {
                this.x = this.group.tx | 0;
                this.y = this.group.ty | 0;
            }
        } else {
            this.x = this.group.x | 0;
            this.y = this.group.y | 0;
        }
        this.tween.step(dt);
        this.lifetime += dt;
        if (this.liftLifespan > 0) {
            this.liftLifespan -= dt;
            if (Utils.interval(this, "lifted", (0.5 - this.liftLifespan) * 0.2))
                this.debris();
        }
    },
    setLevel(level) {
        this.levelChange = 1.0;
        this.prev = this.level;
        this.level = level;
    },
    render() {
        if (this.lifespan)
            return;
        if (NAMESPACE.HIDE_TOTEMS)
            return;
        if (!this.group)
            return;
        if (!this.player) {
            this.x = this.group.x;
            this.y = this.group.y;
            let lift = this.group.x !== this.group.shared.x || this.group.y !== this.group.shared.y;
            if (lift && !this.lifted)
                this.lift();
            if (!lift && this.lifted)
                this.put();
        }
        app.painter.reset();
        if (this.group.shared.name) {
            app.painter.color(this.group.color);
            app.painter.font("small_shadeless");
            app.painter.fillText(this.group.shared.name, this.x, this.y - 32 - this.z);
            app.painter.color(-1);
        }
        app.painter.palette(this.group.palette === 0 ? 30 : this.group.palette);
        app.painter.align(0.5, 0.8);
        if (this.lifespan) {}
        app.painter.drawSprite("totem", this.x | 0, this.y - this.z | 0);
        app.painter.reset();
        if (this.levelChange > 0) {
            this.levelChange = Math.max(0, this.levelChange - app.elapsed);
            app.painter.creation(1.0 - this.levelChange);
            app.painter.drawImageRegion(app.textures.leaderboards, (this.prev % 8) * 15, (this.prev / 8 | 0) * 16, 15, 16, this.x, this.y - this.z - 16);
        }
        app.painter.creation(this.levelChange);
        app.painter.drawImageRegion(app.textures.leaderboards, (this.level % 8) * 15, (this.level / 8 | 0) * 16, 15, 16, this.x, this.y - this.z - 16);
        app.painter.reset();
        if (!this.player && this.z > 0) {
            app.painter.drawSprite("cursor/grip", this.x + 4, this.y - this.z, 4, 48);
            app.painter.alpha(0.25);
            app.painter.color(this.group.color);
            app.painter.drawSprite("cursor/grip", this.x + 4, this.y - this.z, 4, 48);
        }
    }
};
CLIENT.Trail = function() {
    this.follow = null;
}
;
Object.assign(CLIENT.Trail.prototype, {
    create() {
        this.lastX = this.follow.position.x;
        this.lastZ = this.follow.position.z;
        var material = app.materials.trail.clone();
        material.side = THREE.DoubleSide;
        material.depthWrite = false;
        this.geometry = new THREE.PlaneGeometry(2,2,1,6);
        var mesh = new THREE.Mesh(this.geometry,material);
        CLIENT.Game.scene.add(mesh);
        this.mesh = mesh;
        this.mesh.position.y = 0.0;
    },
    step(dt) {
        let dx = this.mesh.position.x - this.follow.position.x;
        let dz = this.mesh.position.z - this.follow.position.z;
        this.mesh.position.x = this.follow.position.x;
        this.mesh.position.z = this.follow.position.z;
        this.geometry.verticesNeedUpdate = true;
        this.geometry.vertices[0].x = 0;
        this.geometry.vertices[0].z = 0;
        this.geometry.vertices[0].y = 0;
        this.geometry.vertices[1].x = 0;
        this.geometry.vertices[1].z = 0;
        this.geometry.vertices[1].y = 0;
        let angle = Utils.atan2(dz, dx);
        let r = 1.0;
        this.geometry.vertices[0].x += Math.cos(angle - Math.HPI) * r;
        this.geometry.vertices[0].z += Math.sin(angle - Math.HPI) * r;
        this.geometry.vertices[1].x += Math.cos(angle + Math.HPI) * r;
        this.geometry.vertices[1].z += Math.sin(angle + Math.HPI) * r;
        this.geometry.vertices[0].y -= this.follow.roll * r;
        this.geometry.vertices[1].y += this.follow.roll * r;
        for (var i = 2; i < this.geometry.vertices.length; i++) {
            this.geometry.vertices[i].x += dx;
            this.geometry.vertices[i].z += dz;
        }
        if (!Utils.interval(this, "trail", 0.15))
            return;
        for (var i = this.geometry.vertices.length - 1; i > 1; i--) {
            this.geometry.vertices[i].copy(this.geometry.vertices[i - 2]);
        }
        for (var i = this.geometry.vertices.length - 1; i > 1; i--) {
            this.geometry.vertices[i].x = Utils.lerp(this.geometry.vertices[i].x, this.geometry.vertices[i - 1].x, 0.075);
            this.geometry.vertices[i].z = Utils.lerp(this.geometry.vertices[i].z, this.geometry.vertices[i - 1].z, 0.075);
        }
    },
    xstep(dt) {
        let dx = this.mesh.position.x - this.follow.position.x;
        let dz = this.mesh.position.z - this.follow.position.z;
        this.mesh.position.x = this.follow.position.x;
        this.mesh.position.z = this.follow.position.z;
        let next = this.follow.position;
        let cx = Utils.lerp(this.geometry.vertices[0].x, this.geometry.vertices[1].x, 0.5);
        let cz = Utils.lerp(this.geometry.vertices[0].z, this.geometry.vertices[1].z, 0.5);
        this.geometry.vertices[0].copy(next);
        this.geometry.vertices[1].copy(next);
        let angle = Utils.atan2(cz - next.z, cx - next.x);
        let r = 1.0;
        this.geometry.vertices[0].x += Math.cos(angle - Math.HPI) * r;
        this.geometry.vertices[0].z += Math.sin(angle - Math.HPI) * r;
        this.geometry.vertices[1].x += Math.cos(angle + Math.HPI) * r;
        this.geometry.vertices[1].z += Math.sin(angle + Math.HPI) * r;
        this.geometry.vertices[0].y -= this.follow.roll * r;
        this.geometry.vertices[1].y += this.follow.roll * r;
        this.geometry.verticesNeedUpdate = true;
        return
        if (!Utils.interval(this, "trail", 0.1))
            return;
        for (var i = this.geometry.vertices.length - 1; i > 1; i--) {
            this.geometry.vertices[i].copy(this.geometry.vertices[i - 2]);
        }
    }
});
CLIENT.Tree = function(args) {
    this.viewInit = false;
    this.x = 0;
    this.y = 0;
    Object.assign(this, args);
    this.parent = this.collection.sid(this.shared.parent_sid);
    if (this.parent) {}
    this.type = Utils.random(1, 5);
    this.sprite = new CLIENT.Sprite();
    this.sprite.set("tree/" + this.type);
    this.sprite.loop = false;
    this.sprite.duration = 1.0;
    this.dead = false;
    this.hitLifespan = 0.0;
    this.row = Utils.random(0, 3);
    this.sprite.range = [this.row * 6, this.row * 6];
    this.direction = Math.HPI * this.row + Math.QPI;
    this.leaves = [];
    this.lifetime = 0;
    this.update(this.shared);
    this.center = {
        x: this.x + Math.cos(this.direction) * 16,
        y: this.y + Math.sin(this.direction) * 16
    }
}
;
CLIENT.Tree.prototype = {
    constructor: CLIENT.Tree,
    shape: COMMON.CIRCLE,
    heavy: true,
    zIndex: 1,
    radius: 8,
    collisionRadius: 8,
    obstacleRadius: 16,
    groups: ["impassable", "interactive", "obstacles"],
    tooltip: "tree",
    leavesColors: [0xd77bba, 0xd9a066, 0xaa8163, 0xd95763],
    _destruct() {
        if (this.leaves) {
            for (let leaf of this.leaves) {
                leaf.lifespan = 1.0;
            }
        }
    },
    appear() {
        for (let i = 0; i < this.leaves.length; i++) {
            let leaf = this.leaves[i];
            leaf.creation = 1.0;
            app.tween(leaf).delay(1.0 + i * Math.random() * 0.25).to({
                creation: 0.0
            }, 0.5 + Math.random());
        }
        this.sprite.creation = 1.0;
        app.tween(this.sprite).to({
            creation: 0.0
        }, 1.0);
    },
    onHit() {
        if (this.inView) {
            this.hitLifespan = 0.15;
            app.sound.play("tree/chop").rate(0.6).gpan(this);
            let debris = this.collection.add("Sprite");
            debris.set("fx/debris");
            debris.scale.x = 0.3;
            debris.scale.y = 0.3;
            if (this.shared.state === COMMON.TREE_FALLEN) {
                debris.x = this.center.x;
                debris.y = this.center.y + 16;
            } else {
                debris.x = this.x;
                debris.y = this.y + 16;
            }
            debris.duration = 0.5;
            debris.color.set(0xd9a066);
        }
    },
    freeLeaves() {
        if (!this.leaves || !this.leaves.length)
            return;
        for (let leaf of this.leaves) {
            leaf.range = [3, 16];
            leaf.restart();
            leaf.loop = false;
        }
        this.leaves.length = 0;
    },
    poof() {
        this.freeLeaves();
        if (!this.inView)
            return;
        if (Math.random() > 0.6) {
            let birdType = Math.random() > 0.75 ? "crow" : "pigeon";
            let count = Utils.random(1, 5);
            for (var i = 0; i < count; i++) {
                let bird = this.collection.add("Bird");
                bird.x = this.x;
                bird.y = this.y;
                bird.z = 24;
                bird.delay = Math.random() * 0.5;
                bird.key = birdType;
                app.tween(bird).to({
                    z: Utils.random(32, 64)
                }, 2.0);
                bird.speed = Utils.random(50, 80);
            }
        }
        let count = 10;
        for (var i = 0; i < count; i++) {
            let debris = this.collection.add("Sprite");
            debris.set("fx/leaves");
            let scale = 0.2 + Math.random() * 0.5;
            debris.rotation = Math.random() * 6.28;
            debris.scale.x = 0;
            debris.scale.y = 0;
            let range = (i / count) * 40;
            debris.x = this.x + Math.cos(this.direction) * range + Utils.random(-10, 10);
            debris.y = this.y + Math.sin(this.direction) * range;
            debris.duration = 2.0;
            debris.color.set(Utils.random(this.leavesColors));
            debris.delay = (i / count);
            debris.shadow = true;
            app.tween(debris.scale).delay(debris.delay).to({
                x: scale,
                y: scale
            }, 0.25);
            app.tween(debris).delay(debris.delay).to({
                z: 10 + Utils.random(0, 20),
            }, 0.25, "outQuad").to({
                z: 0
            }, 1.0, "inQuad")
        }
        app.sound.play("tree/fall");
    },
    initLeaves() {
        for (var i = 0; i < 6; i++) {
            let debris = this.collection.add("Sprite");
            debris.set("fx/leaves");
            debris.rotation = debris.random * 6.28;
            let scale = 0.5 + Math.random() * 0.5;
            debris.shadow = true;
            debris.scale.x = scale;
            debris.scale.y = scale;
            debris.x = this.x + Utils.random(-20, 20);
            debris.y = this.y;
            debris.z = Utils.random(10, 30);
            debris.color.set(Utils.random(this.leavesColors));
            debris.shadow = true;
            debris.loop = true;
            debris.range = [3, 3];
            this.leaves.push(debris);
        }
    },
    enterview() {
        if (!this.viewInit) {
            this.viewInit = true;
            this.initLeaves();
        }
        if (this.lifetime < 0.5) {
            this.appear();
        }
    },
    leaveview() {},
    update(data) {
        if (data.x !== undefined)
            this.x = data.x;
        if (data.y !== undefined)
            this.y = data.y;
        if (data.state !== undefined) {
            if (data.state === COMMON.TREE_FALLING) {
                if (this.zIndex) {
                    this.poof();
                }
                this.sprite.range = [this.row * 6, this.row * 6 + 5];
                this.sprite.restart();
                this.sprite.duration = 1.0;
                this.zIndex = 0;
                this.dead = true;
            } else if (data.state === COMMON.TREE_FALLEN) {
                this.freeLeaves();
            }
        }
        if (data.remove) {
            app.tween(this.sprite).to({
                creation: 1.0
            }, 2.0);
            this.lifespan = 5.0;
        }
        Object.assign(this.shared, data);
    },
    step(dt) {
        this.lifetime += dt;
        if (this.hitLifespan > 0.0) {
            this.hitLifespan -= dt;
            for (let leaf of this.leaves) {
                leaf.rotation = leaf.random * 6.28 + Math.sin(app.lifetime * 100 * this.hitLifespan * leaf.random) * 0.2;
            }
        }
    },
    render() {
        this.sprite.step(app.elapsed);
        this.sprite.x = this.x;
        this.sprite.y = this.y - 8;
        if (this.hitLifespan > 0.0) {
            this.sprite.x += Utils.random(-1, 1);
            this.sprite.y += Utils.random(-1, 1);
            for (let leaf of this.leaves) {}
        }
        this.sprite.render();
    }
};
ppp = 0;
tnames = ["Wilds", "Wanderers", "Atlanteans", "Elves", "Swamplings", "Barbarians"];
tcolors = [0xd9a066, 0xac3232, 0x639bff, 0x6abe30, 0x37946e, 0xeec39a];

CLIENT.DOMTabs = function(container, tabs) {
    CLIENT.Events.call(this);
    let $container = $(container);
    $container.toggleClass("ui-tabs-panels", true);
    let $panels = $container.children();
    let $tabsContainer = tabs ? $(tabs) : $("<div>").addClass("ui-tabs");
    if (!tabs)
        $tabsContainer.prependTo($container);
    this.$panels = $panels;
    for (panel of $panels) {
        let $panel = $(panel);
        $panel.addClass("ui-tabs-panel");
        let $tab = $(`<a>${panel.dataset.name}</a>`);
        this.$tab = $tab;
        if (panel.dataset.version && panel.dataset.id) {
            if (localStorage.getItem("element_version_" + panel.dataset.id) != panel.dataset.version) {
                $tab.addClass("new");
                localStorage.setItem("element_version_" + panel.dataset.id, panel.dataset.version);
            }
        }
        if (panel.dataset.tabclass) {
            $tab.addClass(panel.dataset.tabclass);
        }
        if (panel.dataset.icon) {
            $tab.prepend(`<img src=${panel.dataset.icon}>`);
        }
        $tab.appendTo($tabsContainer);
        $tab.data("$panel", $panel);
        $panel.data("$tab", $tab);
        $tab.on("click touchend", this.onTabClick.bind(this, $tab));
    }
    this.$tabs = $tabsContainer.children();
    $panels.hide();
    this.select(0);
}
;
CLIENT.DOMTabs.prototype = {
    onTabClick($tab) {
        this.select($tab.data("$panel"));
    },
    select(what) {
        if (typeof what === "number")
            what = this.$panels[0];
        let $panel = $(what);
        this.$panels.hide();
        this.$tabs.toggleClass("selected", false);
        let $tab = $panel.data("$tab");
        $panel.show();
        $tab.toggleClass("selected", true);
        this.value = $panel[0].dataset.value;
        this.trigger("select", $panel[0].dataset.name, this.value);
    }
};
Object.assign(CLIENT.DOMTabs.prototype, CLIENT.Events.prototype);
DOM = CLIENT.DOM = {
    tabs(container, tabs) {
        return new CLIENT.DOMTabs(container,tabs);
    }
};
CLIENT.HelpWindow = function() {
    this.$element = $(this.template);
    this.$element.appendTo(document.body);
    this.$element.find(".close").on("click touchstart", this.closeClick.bind(this));
    this.$element.css("marginTop", "-64px");
    this.$element.animate({
        "marginTop": "0px"
    }, 1000);
    this.$element.find("iframe").css({
        "height": Math.max(640, window.innerHeight * 0.8 | 0) + "px",
        "border": "none",
        "marginBottom": "8px"
    });
    app.fitElementIntoWindow(this.$element);
}
;
CLIENT.HelpWindow.prototype = {
    template: `
  <div class="absolute border-window center text-align-center">
    <iframe src="/tutorial/" width=900 height=640></iframe>
    <div>
      <a class="button close">CLOSE</a>
    </div>

  </div>`,
    closeClick() {
        this.hide();
    },
    hide() {
        this.$element.remove();
    }
};
CLIENT.LeaderboardWindow = function() {
    this.$element = $(this.template);
    this.$element.appendTo(document.body);
    this.$list = this.$element.find(".list");
    setInterval(this.update.bind(this), 5000);
    this.update();
    this.$element.find(".minimize").on("click", this.toggle.bind(this));
    this.$element.css("margin-right", "100px");
}
;
CLIENT.LeaderboardWindow.prototype = {
    template: `
  <div class="absolute right-top LeaderboardWindow">
    
    <div class="window-handle">
      <span class="title">Top castles</span>
      &nbsp;
      <a class="button small minimize"><img src="style/icons/small-circle.png"></a>
    </div>

    <div class="list"></div>

  </div>`,
    setTitle(title) {
        this.$element.find(".title").html(title);
    },
    sortCallback(a, b) {
        return b.shared.score - a.shared.score;
    },
    scoreInput() {
        return [];
    },
    update() {
        let entries = this.scoreInput();
        entries.sort(this.sortCallback);
        this.$list.empty();
        for (let entry of entries.slice(0, 20)) {
            let p = $(`<p>${entry.shared.name} | ${entry.shared.score}</p>`);
            let color = COMMON.TEAM_COLOR[entry.shared.team | 0].namehex;
            p.css("color", color);
            this.$list.append(p);
        }
    },
    toggle() {
        this.$list.toggle();
    }
};
CLIENT.RespawnBelt = function() {
    this.$element = $(this.template);
    this.$element.appendTo(document.body);
    this.$element.find(".respawn").on("click touchstart", this.respawnClick.bind(this));
    this.$element.find(".help").on("click touchstart", this.helpClick.bind(this));
    this.$element.css("marginTop", "-64px");
    this.$element.animate({
        "marginTop": "0px"
    }, 1000);
}
;
CLIENT.RespawnBelt.prototype = {};
CLIENT.RespawnBelt.prototype = {
    template: `

  The game has ended | 
  You are dead | you may <disconnect|respawn> or keep watching.

  <div class="absolute border-window center text-align-center">
    <h2>THE GAME HAS ENDED</h2>
  </div>`,
    helpClick() {
        new CLIENT.HelpWindow();
    },
    respawnClick() {
        let self = this;
        app.adResume = function() {
            app.game.send("respawn");
            self.hide();
        }
        ;
        app.requestAd();
    },
    setScore(score) {
        let best = localStorage.getItem("hiscore") | 0;
        this.$element.find(".score").html(score);
        if (score > best)
            localStorage.setItem("hiscore", score);
        this.$element.find(".best").html(best);
    },
    hide() {
        this.$element.remove();
    }
};
CLIENT.RespawnWindow = function() {
    this.$element = $(this.template);
    this.$element.appendTo(document.body);
    this.$element.find(".respawn").on("click touchstart", this.respawnClick.bind(this));
    this.$element.find(".help").on("click touchstart", this.helpClick.bind(this));
    this.$element.find(".minimize").on("click touchstart", this.minimizeClick.bind(this));
    this.$element.find(".disconnect").on("click touchstart", this.disconnectClick.bind(this));
    if (!app.game.controller.canRespawn)
        this.$element.find(".respawn").hide();
    if (!app.game.controller.canDisconnect)
        this.$element.find(".disconnect").hide();
    this.$element.find(".gameoverText").html(app.game.controller.gameoverText || "");
    if (app.game.controller.foldRespawnWindow)
        this.minimize();
    if (app.isOwn)
        this.showAd();
}
;
CLIENT.RespawnWindow.prototype = {
    template: `
  <div class="absolute border-window center text-align-center" style="max-width:400px">
    
    <div class="window-handle">
      <span>Game Over</span>
      <a class="button small minimize"><img src="style/icons/small-close.png"></a>
    </div>

    <div class="gameoverText"></div>

    <div>
      <a class="button respawn">RESPAWN</a>
      <a class="button disconnect">DISCONNECT</a>
      <a class="button help">HELP</a>
    </div>

    <div class="top-separator">
      <p><a href="https://twitter.com/rezoner/media" target="_blank">Check news on twitter</a></p>
      <p><a href="https://wanderers.userecho.com/" target="_blank">Post your ideas or bugs.</a></p>
    </div>

  </div>`,
    showAd() {
        if (window.innerWidth < 800)
            return;
        let menu = this.$element;
        let $ad = $(".banner-ad");
        let marginLeft = Math.max(0, -(window.innerWidth / 2 - menu.outerWidth() / 2 - 64 - $ad.outerWidth()));
        if (marginLeft > 0) {
            menu.css({
                marginLeft: marginLeft + "px"
            });
        }
        $ad.css({
            left: (menu.offset().left - $ad.outerWidth() - 48) + "px",
            top: (menu.offset().top + menu.outerHeight() / 2 - $ad.outerHeight() / 2) + "px"
        });
        if (menu.offset().top < 0) {
            this.hideAd();
            menu.css({
                marginTop: "0px"
            });
        }
    },
    xshowAd() {
        aiptag.cmd.display.push(function() {
            aipDisplayTag.refresh('wanderers-io_300x250');
        });
        let menu = this.$element;
        let $ad = $(".banner-ad");
        $ad.css({
            left: (menu.offset().left - $ad.outerWidth() - 48) + "px",
            top: (menu.offset().top + menu.outerHeight() / 2 - $ad.outerHeight() / 2) + "px"
        });
        if (menu.offset().top < 0) {
            this.hideAd();
            menu.css({
                marginTop: "0px"
            });
        }
    },
    hideAd() {
        let $ad = $(".banner-ad");
        $ad.css({
            top: "-1000px"
        });
    },
    helpClick() {
        new CLIENT.HelpWindow();
    },
    disconnectClick() {
        window.location.reload();
    },
    minimizeClick() {
        if (this.minimized)
            this.maximize();
        else
            this.minimize();
    },
    respawnClick() {
        let self = this;
        if (app.isOwn)
            this.hideAd();
        app.ad.interstitial(()=>{
            app.game.send("respawn");
            self.close();
        }
        );
    },
    minimize() {
        this.minimized = true;
        this.$element.children().hide();
        this.$element.children(".window-handle").show();
        this.$element.removeClass("center");
        this.$element.addClass("center-top");
        this.$element.find(".window-handle .minimize img").attr("src", "style/icons/small-drop-down.png");
        this.hideAd();
    },
    maximize() {
        this.minimized = false;
        this.$element.children().show();
        this.$element.addClass("center");
        this.$element.removeClass("center-top");
        this.$element.find(".window-handle .minimize img").attr("src", "style/icons/small-close.png");
        if (app.isOwn)
            this.showAd();
    },
    close() {
        this.$element.remove();
        this.hideAd();
    }
};
CLIENT.Manipulators.debris = function(object, data, dt) {
    if (Utils.interval(object, "debris", 0.1) && object.lifetime > data.delay) {
        let tail = object.collection.add("Sprite");
        tail.set("explosion/small");
        tail.scale.x = 0.1 + Math.random() * 0.05;
        tail.scale.y = 0.1 + Math.random() * 0.05;
        tail.x = object.x + Utils.random(-2, 2);
        tail.y = object.y + Utils.random(-2, 2);
        tail.z = object.z;
        tail.duration = 1.0;
        tail.zIndex = 1;
        app.tween(tail).to({
            z: tail.z + Utils.random(10, 20)
        }, 1.0);
        if (Math.random() > 0.8)
            tail.color = app.color(0x9badb7);
        else if (Math.random() > 0.6)
            tail.color = app.color(0x696a6a);
        else
            tail.color = app.color(0x847e87);
        return true;
    }
}
;
CLIENT.Manipulators.follow = function(object, data, dt) {
    object.x = data.follow.x;
    object.y = data.follow.y;
}
;
CLIENT.Manipulators.force = function(object, data, dt) {
    object.x += Math.cos(data.direction) * data.force * dt;
    object.y += Math.sin(data.direction) * data.force * dt;
    data.force = Utils.moveTo(data.force, 0, data.damping * dt);
}
;
CLIENT.Manipulators.pickup = function(object, data, dt) {
    if (!data.created) {
        data.tween = app.tween(object).to({
            x: object.x + Utils.random(-16, 16),
            y: object.y - 150
        }, 0.35, "outQuad");
        data.lifetime = 0;
        data.created = true;
        data.speed = 16;
        data.row = object.row;
    }
    data.row += dt * 48;
    data.lifetime += dt;
    let scale = 1.0 + Math.max(-0.25, Utils.saw(data.lifetime / 0.7));
    object.scale.x = scale;
    object.scale.y = scale;
    object.row = (data.row | 0) % object.data.rows;
    if (data.tween.finished) {
        data.speed += 512 * dt;
        let angle = Utils.lookAt(object, data.target);
        let distance = Utils.distance(object, data.target);
        object.x += Math.cos(angle) * (data.speed) * dt;
        object.y += Math.sin(angle) * (data.speed) * dt;
        if (distance < data.target.radius) {
            object.collection.remove(object);
            app.sound.play("collect").rrate(0.1);
            let blink = object.collection.add("Sprite");
            blink.set("fx/blink");
            blink.x = object.x;
            blink.y = object.y;
            blink.duration = 0.3;
            blink.zIndex = 3;
            return true;
        }
    }
}
;

NAMESPACE.Sharer = function(descriptors) {
    this.listeners = {};
    this.descriptors = descriptors;
    this.keyToIndex = new Map;
    this.indexToKey = new Map;
    this.keys = [];
    this.keysQueue = [];
    this.symbol_last_update = Symbol.for("last_update");
    this.symbol_last_share = Symbol.for("last_share");
    this.getKeyIndex("snapshot");
}
;
NAMESPACE.Sharer.prototype = {
    keyIndex: 0,
    emptyKey: "the_key_was_empty",
    DONT_ENCODE: 1,
    setKey: function(index, key) {
        this.keyToIndex.set(key, index);
        this.indexToKey.set(index, key);
        this.keys.push(index, key);
        this.keysQueue.push(index, key);
        this.trigger("addkey", index, key);
    },
    setKeys: function(array) {
        if (!array)
            return;
        for (var i = 0; i < array.length; i += 2) {
            this.setKey(array[i], array[i + 1]);
        }
    },
    getKey: function(index) {
        return this.indexToKey.get(index);
    },
    getKeyIndex: function(key) {
        if (!this.keyToIndex.has(key)) {
            this.setKey(++this.keyIndex, key);
        }
        return this.keyToIndex.get(key);
    },
    serialize: function(object) {
        var result = [];
        for (var key in object) {
            result.push(this.getKeyIndex(key), object[key]);
        }
        return result;
    },
    unserialize: function(array) {
        var object = {};
        for (var i = 0; i < array.length; i += 2) {
            var key = this.getKey(array[i]);
            object[key] = array[i + 1];
        }
        return object;
    },
    encode: function(code, source, full, partial, ignoreUndefined=false) {
        var symbol_last_update = Symbol.for("last_update");
        var symbol_last_share = Symbol.for("last_share");
        if (!full)
            full = [];
        var changes = 0;
        var changesCount = 0;
        var desc = this.descriptors[code];
        if (partial)
            partial.length = desc.length + 1;
        for (var i = 0; i < desc.length; i++) {
            var property = desc[i][0];
            var type = desc[i][1];
            var val = desc[i][2] ? source[desc[i][2]] : source[property];
            var skip = false;
            var force = false;
            if (ignoreUndefined && typeof val === "undefined")
                skip = true;
            if (!skip)
                switch (type) {
                case "key":
                    val = this.getKeyIndex(val);
                    break;
                case "queue":
                    if (val.length) {
                        val = [].concat(val);
                        source[property].length = 0;
                    } else {
                        skip = true;
                    }
                    break;
                case "bool":
                    val = Boolean(val);
                    break;
                case "int":
                    val = val | 0;
                    break;
                case "float":
                    val = val * 100 | 0;
                    break;
                case "sfloat":
                    val = val * 10 | 0;
                    break;
                case "object":
                    if ((val[symbol_last_update] | 0) !== val[symbol_last_share]) {
                        val[symbol_last_update] = val[symbol_last_update] | 0;
                        val[symbol_last_share] = val[symbol_last_update];
                        force = true;
                    } else {
                        skip = true;
                    }
                    break;
                default:
                    break;
                }
            if (!skip && (force || (full[i] !== val || type === "always"))) {
                full[i] = val;
                if (partial)
                    partial[changesCount + 1] = val;
                changes = changes | Math.pow(2, i);
                changesCount++;
            }
        }
        if (partial) {
            partial[0] = changes;
            partial.length = changesCount + 1;
        }
        return partial || full;
    },
    decode: function(code, data, partial) {
        var properties = this.descriptors[code];
        var result = {};
        if (partial) {
            var changes = data[0];
            var index = 1;
            for (var i = 0; i < properties.length; i++) {
                if (changes >= 0 && !(changes & Math.pow(2, i)))
                    continue;
                var property = properties[i][0];
                var type = properties[i][1];
                var value = data[index];
                switch (type) {
                case "key":
                    value = this.getKey(value);
                    break;
                case "float":
                    value /= 100;
                    break;
                case "sfloat":
                    value /= 10;
                    break;
                }
                result[property] = value;
                index++;
                if (index >= data.length)
                    break;
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                var property = properties[i][0];
                var type = properties[i][1];
                var value = data[i];
                switch (type) {
                case "key":
                    value = this.getKey(value);
                    break;
                case "float":
                    value /= 100;
                    break;
                case "sfloat":
                    value /= 10;
                    break;
                }
                result[property] = value;
            }
        }
        return result;
    },
    defaultValues: {
        "float": 0,
        "sfloat": 0,
        "int": 0,
        "string": "",
        "key": "",
        "always": 0,
        "bool": false
    },
    defaults: function(key) {
        var result = {};
        var properties = this.descriptors[key];
        for (var i = 0; i < properties.length; i++) {
            var name = properties[i][0];
            var type = properties[i][1];
            result[name] = this.defaultValues[type];
        }
        return result;
    },
    markUpdate(object) {
        object[this.symbol_last_update] = object[this.symbol_last_update] + 1 | 0;
    },
    poke(object) {
        object[this.symbol_last_update] = object[this.symbol_last_update] + 1 | 0;
    },
    getUpdateMark(object) {
        return object[this.symbol_last_update] | 0;
    },
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
            if (this.listeners[event][i]._remove) {
                this.listeners[event].splice(i--, 1);
                len--;
            }
        }
    },
    trigger: function(event, a, b, c) {
        if (this.listeners.event) {
            for (var i = 0, len = this.listeners.event.length; i < len; i++) {
                var listener = this.listeners.event[i];
                listener.callback.call(listener.context, event, a, b, c);
            }
        }
        if (this.listeners[event]) {
            for (var i = 0, len = this.listeners[event].length; i < len; i++) {
                var listener = this.listeners[event][i];
                listener.callback.call(listener.context || this, a, b, c);
                if (listener.once) {
                    this.listeners[event].splice(i--, 1);
                    len--;
                }
            }
        }
    }
};
NAMESPACE.WallSystem = function(game) {
    this.game = game;
    this.map = new Map;
    NAMESPACE.Events.call(this);
}
;
NAMESPACE.WallSystem.prototype = {
    canBuildOnWall(wall) {
        if (wall.angleIndex === 2 || wall.angleIndex === 6 || wall.angleIndex === 10 || wall.angleIndex === 14)
            return;
        return true;
    },
    canPlaceNode(x, y) {
        let node = this.get(x, y);
        if (node && node.connections > 1)
            return;
        for (let o of COMMON.o4) {
            let key = this.key(x + o[0], y + o[1]);
            if (this.map.has(key))
                return false;
        }
        if (!this.game.obstacles.canPlace(x * COMMON.GRID_WIDTH, y * COMMON.GRID_HEIGHT, 16, true))
            return;
        return true;
    },
    isAllowedOffset(sx, sy, x, y) {
        if (!this.canPlaceNode(x, y))
            return false;
        for (let o of COMMON.nodeOffsets) {
            if (sx + o[0] === x && sy + o[1] === y)
                return true;
        }
        return false;
    },
    canConnect(sx, sy, ex, ey) {
        if (!this.isAllowedOffset(sx, sy, ex, ey))
            return false;
        if (!this.canPlaceNode(sx, sy))
            return false;
        if (!this.canPlaceNode(ex, ey))
            return false;
        let node;
        node = this.map.get(this.key(sx, sy));
        if (node && node.connections > 1)
            return false;
        node = this.map.get(this.key(ex, ey));
        if (node && node.connections > 1)
            return false;
        return true;
    },
    getEmptyNodes(x, y) {
        let pool = [];
        for (let o of COMMON.nodeOffsets) {
            let can = false;
            let node = this.map.get(this.key(x + o[0], y + o[1]));
            if (!this.canPlaceNode(x + o[0], y + o[1]))
                continue;
            if (!node)
                can = true;
            else
                can = node.connections < 2;
            if (can)
                pool.push([x + o[0], y + o[1]]);
        }
        return pool;
    },
    getPossibleConnections(x, y) {
        let pool = [];
        for (let o of COMMON.nodeOffsets) {
            if (this.canConnect(x, y, x + o[0], y + o[1]))
                pool.push([x + o[0], y + o[1]]);
        }
        return pool;
    },
    assertTeam(x, y, team) {
        let node = this.get(x, y);
        return !node || (node.team === team);
    },
    get(x, y) {
        return this.map.get(this.key(x, y));
    },
    set(x, y, o) {
        this.map.set(this.key(x, y), o);
    },
    delete(x, y) {
        this.map.delete(this.key(x, y));
    },
    addWall(x1, y1, x2, y2, team) {
        let a = this.map.get(this.key(x1, y1));
        if (!a) {
            a = this.game.entities.add("Building");
            a.key = "stone_node";
            a.siblings = [];
            a.x = x1 * COMMON.GRID_WIDTH;
            a.y = y1 * COMMON.GRID_HEIGHT;
            a.gx = x1;
            a.gy = y1;
            a.team = team;
            a.run();
        }
        let b = this.map.get(this.key(x2, y2));
        if (!b) {
            b = this.game.entities.add("Building");
            b.key = "stone_node";
            b.siblings = [];
            b.x = x2 * COMMON.GRID_WIDTH;
            b.y = y2 * COMMON.GRID_HEIGHT;
            b.gx = x2;
            b.gy = y2;
            b.team = team;
            b.run();
        }
        let wall = this.game.entities.add("Building");
        wall.key = "stone_wall";
        wall.angle = Utils.lookAt(a, b);
        wall.angleIndex = Utils.dirrowp(wall.angle, COMMON.WALL_ANGLES);
        wall.team = team;
        wall.a = a;
        wall.b = b;
        wall.sx = a.x - Math.cos(wall.angle) * 6;
        wall.sy = a.y - Math.sin(wall.angle) * 6;
        wall.ex = b.x + Math.cos(wall.angle) * 6;
        wall.ey = b.y + Math.sin(wall.angle) * 6;
        wall.run();
        Object.assign(wall, Utils.lerp(a, b));
        wall.x = wall.x | 0;
        wall.y = wall.y | 0;
        this.map.set(this.key(x1, y1), a);
        this.map.set(this.key(x2, y2), b);
        this.trigger("updateNode", a);
        this.trigger("updateNode", b);
    },
    key(x, y) {
        return x + "_" + y;
    },
    canJoin(x1, y1, x2, y2) {
        for (let o of COMMON.nodeOffsets) {
            if (x1 + o[0] === x2 && y1 + o[1] === y2)
                return true;
        }
        return false;
    },
    buildWall(x1, y1, x2, y2) {},
    connect(a, b) {
        a.connections++;
        b.connections++;
        a.siblings.push(b);
        b.siblings.push(a);
        this.trigger("updateNode", a);
        this.trigger("updateNode", b);
    },
    disconnect(a, b) {
        a.connections--;
        b.connections--;
        Utils.pull(a.siblings, b);
        Utils.pull(b.siblings, a);
        this.trigger("updateNode", a);
        this.trigger("updateNode", b);
    }
};
Utils.extend(NAMESPACE.WallSystem.prototype, NAMESPACE.Events.prototype);
NAMESPACE.ObstacleSystem = function(game) {
    this.game = game;
}
;
NAMESPACE.ObstacleSystem.prototype = {
    constructor: NAMESPACE.ObstacleSystem,
    canPlace(x, y, radius, ignoreWallParts=false) {
        let obstacles = this.game.entities.groups.obstacles;
        let radius2 = radius * radius;
        for (let obstacle of obstacles) {
            if (ignoreWallParts && obstacle.isWallPart)
                continue;
            let obstacleRadius2 = obstacle.obstacleRadius * obstacle.obstacleRadius;
            if (Utils.distance(x, y, obstacle.x, obstacle.y) < radius + obstacle.obstacleRadius)
                return false;
        }
        return true;
    },
    canPlant(x, y, radius) {
        let obstacles = this.game.entities.groups.obstacles;
        let radius2 = radius * radius;
        for (let obstacle of obstacles) {
            let obstacleRadius2 = obstacle.obstacleRadius * obstacle.obstacleRadius;
            if (Utils.distance(x, y, obstacle.x, obstacle.y) < radius + obstacle.obstacleRadius)
                return false;
        }
        let meadows = this.game.entities.groups.meadows;
        for (let meadow of meadows) {
            if (Utils.pointInEllipse(x, y, meadow.x, meadow.y, meadow.radius, meadow.radius * 0.75))
                return true;
        }
        return false;
    },
    renderObstacleLayer() {
        let gl = app.gl;
        let obstacles = this.game.entities.groups.obstacles;
        app.painter.reset();
        for (let obstacle of obstacles) {
            if (!obstacle.inView)
                continue;
            app.painter.color(0xff0000);
            app.painter.alpha(0.25);
            app.painter.fillCircle(obstacle.x, obstacle.y, obstacle.obstacleRadius);
        }
    }
};
CLIENT.Lobby = {
    template: ``,
    enter() {
        this.music = app.music.play("music/menu").loop().fadeIn(2.0);
        gtag('event', 'lobbyenter');
        this.$element = $("#lobby");
        this.$element.show();
        this.$element.find(".start").on("click touchstart", this.start.bind(this));
        this.$element.find(".tutorial").on("click touchstart", this.tutorial.bind(this));
        this.$element.find(".showMainMenu").on("click touchstart", this.menuClick.bind(this));
        this.$element.find(".moreGames").on("click touchstart", this.moreGamesClick.bind(this));
        this.$element.find(".mainMenu").hide();
        this.$element.find(".tribeName").on("change keyup", this.validateTribeName.bind(this));
        this.$element.find(".tribeName").val(localStorage.getItem("tribeName"));
        this.$element.find(".groupName").on("change keyup", Utils.debounce(this.onGroupChange, 300).bind(this));
        this.$element.find(".groupName").val(localStorage.getItem("group"));
        this.selectMode("Sandbox");
        this.tabs = DOM.tabs(this.$element.find(".mainMenu")).on("select", this.onTabChange.bind(this));
        this.modePicker = DOM.tabs(this.$element.find(".modePicker"));
        this.modePicker.on("select", this.onModePicker.bind(this));
        this.modePicker.select(0);
    },
    onTabChange() {
        if (app.isOwn)
            this.showAd();
    },
    onModePicker(name, mode) {
        this.selectMode(mode);
    },
    selectMode(mode) {
        this.mode = mode;
        this.findServer();
    },
    findServer() {
        fetch("client/server/EU/" + this.mode + "/" + this.group).then(function(response) {
            return response.text()
        }).then((url)=>{
            if (!url) {} else {
                CLIENT.Game.server_url = url;
            }
        }
        );
    },
    leave() {
        this.music.fadeOut(1.0);
        this.$element.remove();
        this.hideAd();
    },
    async showAd() {
        if (window.innerWidth < 800)
            return;
        let menu = this.$element.find(".mainMenu");
        if (window.CHECKQUEREDINK) {
            let info = await fetch("/checkqueredink/info.json?" + Date.now()).then((r)=>r.json());
            let item = Utils.random(info.items);
            let $ad = $(".ci-ad");
            let img = new Image;
            $ad.show();
            img.src = `/checkqueredink/${item.name}?=${info.timestamp}`;
            $ad.html(`<a href='${item.url}' target="_blank"></a>`);
            $ad.children("a").append(img);
            img.addEventListener("load", ()=>{
                $ad.css({
                    left: (menu.offset().left + menu.outerWidth() + 64) + "px",
                    top: (menu.offset().top + menu.outerHeight() / 2 - $ad.outerHeight() / 2) + "px"
                });
            }
            );
        } else {
            let $ad = $(".banner-ad");
            let marginLeft = Math.max(0, -(window.innerWidth / 2 - menu.outerWidth() / 2 - 64 - $ad.outerWidth()));
            if (marginLeft > 0) {
                menu.css({
                    marginLeft: marginLeft + "px"
                });
            }
            $ad.css({
                left: (menu.offset().left - $ad.outerWidth() - 48) + "px",
                top: (menu.offset().top + menu.outerHeight() / 2 - $ad.outerHeight() / 2) + "px"
            });
            if (menu.offset().top < 0) {
                this.hideAd();
                menu.css({
                    marginTop: "0px"
                });
            }
        }
    },
    hideAd() {
        let $ad = $(".banner-ad");
        $ad.css({
            top: "-1000px"
        });
        $(".ci-ad").hide();
    },
    validateTribeName() {
        let $input = this.$element.find(".tribeName");
        let val = $input.val();
        val = val.replace(/[^a-zA-Z0-9_]/g, '');
        $input.val(val);
        localStorage.setItem("tribeName", val);
    },
    onGroupChange() {
        let $input = this.$element.find(".groupName");
        let val = $input.val();
        val = val.replace(/[^a-zA-Z0-9_]/g, '');
        $input.val(val);
        localStorage.setItem("group", val);
        this.group = val;
        this.findServer();
    },
    menuClick() {
        this.$element.find(".mainMenu").show();
        if (app.isOwn)
            this.showAd();
    },
    moreGamesClick() {
        app.iog.promo();
    },
    start() {
        if (this.startClicked)
            return;
        this.startClicked = true;
        app.sound.play("empty");
        if (app.isOwn)
            this.hideAd();
        if (window.NOADBLOCK)
            gtag('event', 'interstitial_start');
        if (!window.NOADBLOCK)
            gtag('event', 'adblock');
        app.ad.interstitial(()=>{
            if (window.NOADBLOCK)
                gtag('event', 'interstitial_end');
            CLIENT.Game.tribeName = this.$element.find(".tribeName").val();
            CLIENT.Game.groupName = this.$element.find(".groupName").val();
            CLIENT.Game.mode = this.mode;
            app.setState(CLIENT.Game);
        }
        );
    },
    tutorial() {
        new CLIENT.HelpWindow();
        this.hideAd();
    },
    render() {
        app.gl.clearColor(0.34, 0.33, 0.32, 1.0);
        app.gl.clear(app.gl.COLOR_BUFFER_BIT);
    },
    resize() {}
};
CLIENT.Test = {
    enter() {
        this.entities = new CLIENT.Entities(this);
        this.camera = new CLIENT.Camera(this);
        this.camera.set(0, 0, app.width, app.height);
        this.walls = new NAMESPACE.WallSystem(this);
    },
    step(dt) {
        this.camera.step(dt);
        this.entities.step(dt);
    },
    render() {
        let gl = app.gl;
        var projectionMatrix = Matrix3.projection(app.canvas.width, app.canvas.height);
        this.viewMatrix = Matrix3.create();
        this.projectionMatrix = projectionMatrix;
        gl.clearColor(0, 0, 0, 1.0);
        gl.colorMask(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        Matrix3.reset(this.viewMatrix);
        Matrix3.multiply(this.viewMatrix, projectionMatrix);
        for (var key in app.programs) {
            let program = app.programs[key];
            gl.useProgram(program.native);
            program.set("viewMatrix", this.viewMatrix);
        }
        for (var i = 0; i < this.entities.children.length; i++) {
            let entity = this.entities.children[i];
            entity.render();
        }
        if (!this.state) {
            app.painter.reset();
            if (this.walls.can0(this.gx, this.gy))
                app.painter.color(0xffffff);
            else
                app.painter.color(0xff0000);
            app.painter.fillCircle(this.gx * COMMON.GRID_WIDTH, this.gy * COMMON.GRID_HEIGHT, 4);
        } else {
            let pool = this.walls.getPossibleNodes(this.sx, this.sy);
            for (let pos of pool) {
                app.painter.reset();
                app.painter.color(0xffffff);
                app.painter.fillCircle(pos[0] * COMMON.GRID_WIDTH, pos[1] * COMMON.GRID_HEIGHT, 2);
            }
            app.painter.reset();
            app.painter.color(0xffffff);
            app.painter.fillCircle(this.gx * COMMON.GRID_WIDTH, this.gy * COMMON.GRID_HEIGHT, 4);
        }
    },
    pointermove(e) {
        this.gx = e.x / COMMON.GRID_WIDTH | 0;
        this.gy = e.y / COMMON.GRID_HEIGHT | 0;
    },
    pointerdown(e) {
        if (!this.state) {
            this.state = true;
            this.sx = this.gx;
            this.sy = this.gy;
        } else {
            this.state = false;
            this.walls.placeWall(this.sx, this.sy, this.gx, this.gy);
        }
    },
    keydown(e) {
        if (e.key === "w")
            COMMON.GRID_HEIGHT--;
        if (e.key === "s")
            COMMON.GRID_HEIGHT++;
        if (e.key === "a")
            COMMON.GRID_WIDTH--;
        if (e.key === "d")
            COMMON.GRID_WIDTH++;
    },
    fxImplode() {
        return CLIENT.Game.fxImplode.apply(this, Array.from(arguments));
    },
    mousewheel(e) {}
};
CLIENT.Game = {
    palette: 0,
    enter() {
        this.walls = new NAMESPACE.WallSystem(this);
        this.obstacles = new NAMESPACE.ObstacleSystem(this);
        $(app.canvas).addClass("cursor-none");
        this.data = {};
        this.needRefreshMap = true;
        gtag('event', 'gameenter');
        this.groundColor = Utils.intToRGBA(COMMON.GROUND_COLOR);
        this.inputMode = "default";
        this.quickChat = new CLIENT.QuickChat;
        this.nextTribesmanPosition = null;
        this.pointer = {
            x: 0,
            y: 0,
            alert: null,
            entity: null
        };
        this.cursorDirection = 0;
        this.cursorFinalDirection = 0;
        this.manipulators = [];
        if ($_HASH['server']) {
            this.socket = new WebSocket($_HASH['server']);
        } else {
            this.socket = new WebSocket(`wss://${this.server_url}.wanderers.io`);
        }
        this.socket.binaryType = "arraybuffer";
        this.socket.addEventListener("open", this.onconnect.bind(this));
        this.socket.addEventListener("message", this.onmessage.bind(this));
        this.socket.addEventListener("close", this.ondisconnect.bind(this));
        this.timeouts = [];
        this.gui = new CLIENT.GUI();
        this.guiElements = {};
        this.cursor = new CLIENT.Sprite();
        this.cursor.prefix = "cursor/";
        this.cursor.set("point");
        this.action = new CLIENT.GameActionManager(this,CLIENT.Game.Actions);
        this.action.set("none");
        this.selector = new CLIENT.Selector(this);
        this.tooltip = this.gui.add("Text");
        this.tooltip.font = app.fonts.default;
        this.showTooltip("test");
        this.hideTooltip();
        this.orders = [];
        this.clearOrderTimeout = COMMON.CLEAR_ORDER_INTERVAL;
    },
    updateBorder() {
        this.left = +Infinity;
        this.top = +Infinity;
        this.right = -Infinity;
        this.bottom = -Infinity;
        for (let meadow of this.entities.groups.meadows) {
            if (meadow.x < this.left)
                this.left = meadow.x;
            if (meadow.x > this.right)
                this.right = meadow.x;
            if (meadow.y < this.top)
                this.top = meadow.y;
            if (meadow.y > this.bottom)
                this.bottom = meadow.y;
        }
        this.left -= COMMON.BORDER;
        this.top -= COMMON.BORDER;
        this.right += COMMON.BORDER;
        this.bottom += COMMON.BORDER;
        this.width = Math.abs(this.left - this.right);
        this.height = Math.abs(this.top - this.bottom);
    },
    updateMapTexture() {
        this.updateBorder();
        let mapWidth = 64;
        let mapHeight = 64;
        let scaleX = mapWidth / this.width;
        let scaleY = mapHeight / this.height;
        this.mapScaleX = scaleX;
        this.mapScaleY = scaleY;
        let map = cq(mapWidth, mapHeight);
        map.smoothing = false;
        for (let meadow of this.entities.groups.meadows) {
            let x = meadow.x - this.left;
            let y = meadow.y - this.top;
            if (meadow.team === -1) {
                map.fillStyle("#638538");
            } else {
                map.fillStyle(Utils.hexToString(COMMON.TEAM_COLOR[meadow.team].mid));
            }
            map.save();
            map.translate(x * scaleX, y * scaleY);
            map.fillCircle(0, 0, 1 + meadow.radius * scaleX | 0);
            map.restore();
        }
        for (let entity of this.entities.groups.buildings) {
            let x = entity.x - this.left;
            let y = entity.y - this.top;
            map.fillStyle(Utils.hexToString(COMMON.TEAM_COLOR[entity.shared.team].mid));
            map.fillRect(x * scaleX | 0, y * scaleY | 0, 1, 1);
        }
        for (let entity of this.entities.children) {
            let color = false;
            if (!color)
                continue;
            if (entity.constructorName === "Tree")
                color = "#d9a066";
            else if (entity.constructorName === "Rocks")
                color = "#9badb7";
            let x = entity.x - this.left;
            let y = entity.y - this.top;
            map.save();
            map.translate(x * scaleX | 0, y * scaleY | 0);
            map.fillStyle(color);
            map.fillRect(-1, -1, 2, 2);
            map.restore();
        }
        let gl = app.gl;
        let texture = app.gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, map.canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        texture.width = map.width;
        texture.height = map.height;
        this.mapTexture = texture;
    },
    order(what) {
        let id = what.sid;
        if (this.orders.indexOf(id) > -1)
            return;
        this.clearOrderTimeout = COMMON.CLEAR_ORDER_INTERVAL;
        this.send("order", id);
        this.orders.push(id);
    },
    renderCost(equation, x, y) {
        let textHeight = app.fonts.default.getSize("x").height;
        let queue = [];
        let px = 0;
        let py = 0;
        for (let i = 0; i < equation.length; i += 2) {
            let text = equation[i];
            if (typeof text === "number") {
                text = String(text);
                let item = COMMON.items[equation[i + 1]];
                queue.push(2, "color", 0xffffff);
                queue.push(4, "fillText", text, px, py);
                px += app.fonts.default.getSize(text).width + 4;
                queue.push(2, "color", -1);
                queue.push(8, "drawImageRegion", app.textures.spritesheet, ...item.sprite, px, py + textHeight / 2 - item.sprite[3] / 2 | 0);
                px += item.sprite[2];
            } else {
                queue.push(2, "color", 0xffffff);
                queue.push(4, "fillText", text, px, py);
                px += app.fonts.default.getSize(text).width;
                i--;
            }
            if (i < equation.length - 2)
                px += 4;
        }
        app.painter.reset();
        app.painter.align(0, 0);
        app.painter.font(app.fonts.default);
        app.painter.textAlign("left");
        app.painter.translate(x - px / 2 | 0, y);
        for (let i = 0; i < queue.length; i) {
            let count = queue[i];
            app.painter[queue[i + 1]].apply(app.painter, queue.slice(i + 2, i + 2 + count - 1));
            i += count + 1;
        }
    },
    createSoundButtons() {
        var button = this.gui.add("ActionButton");
        button.icon = [218, 2, 11, 12];
        button.tooltip = "sound";
        button.x = 48;
        button.y = 2;
        button.on("click", this.muteClick.bind(this, "sound"));
        this.soundButton = button;
        var button = this.gui.add("ActionButton");
        button.icon = [233, 3, 16, 10];
        button.tooltip = "sound";
        button.x = 48 + 24;
        button.y = 2;
        button.on("click", this.muteClick.bind(this, "music"));
        this.musicButton = button;
        if (localStorage.getItem("sound") !== null)
            app.sound.volume(localStorage.getItem("sound") | 0);
        if (localStorage.getItem("music") !== null)
            app.music.volume(localStorage.getItem("music") | 0);
        this.updateSoundButtons();
    },
    muteClick(channel, val) {
        val = !(app[channel].volume());
        if (!val) {
            app[channel].volume(0.0);
        } else {
            app[channel].volume(1.0);
        }
        localStorage.setItem(channel, app[channel].volume());
        this.updateSoundButtons();
    },
    updateSoundButtons() {
        this.musicButton.disabled = !Boolean(app.music.volume());
        this.soundButton.disabled = !Boolean(app.sound.volume());
        this.musicButton.needRefresh = true;
        this.soundButton.needRefresh = true;
    },
    createButtons() {
        this.createSoundButtons();
        this.buttons = [];
        this.experienceBottle = this.gui.add("ExperienceBottle");
        var resources = this.gui.add("Resources");
        this.guiResources = resources;
        this.guiResources.on("click", function(e) {
            let resource = ["food", "wood", "gold", "water"][(e.x - app.game.guiResources.x) / 24 | 0];
            app.game.send("drop", {
                key: resource
            });
        });
        this.panels = {
            left: [],
            right: [],
            bottom: []
        };
        for (let building of ["stone_wall", "stone_gate", "stone_tower", "wood_storage", "food_storage", "well", "stationary_catapult"]) {
            let def = COMMON.items[building];
            var button = this.gui.add("ActionButton");
            button.icon = def.icon;
            button.tooltip = def.tooltip;
            button.subtip = def.subtip;
            button.key = building;
            button.resource = def.resource;
            button.cost = def.cost;
            this.panels.bottom.push(button);
            this.buttons[building] = button;
            button.on(PLAYGROUND.MOBILE ? "dragstart" : "click", this.buildClick.bind(this, button, building));
            this.buttons.push(button);
        }
        for (let plant of ["corn", "tree_plant"]) {
            let def = COMMON.items[plant];
            var button = this.gui.add("ActionButton");
            button.icon = def.icon;
            button.tooltip = def.tooltip;
            button.subtip = def.subtip;
            button.key = plant;
            button.resource = def.resource;
            button.cost = def.cost;
            this.panels.bottom.push(button);
            this.buttons[plant] = button;
            button.on(PLAYGROUND.MOBILE ? "dragstart" : "click", this.plantClick.bind(this, button, plant));
            this.buttons.push(button);
        }
        var button = this.gui.add("ActionButton");
        button.icon = [237, 72, 16, 16];
        button.tooltip = "Destroy building";
        button.subtip = "Costs as much gold as much structure points the building has";
        button.key = "destroyBuilding";
        button.on(PLAYGROUND.MOBILE ? "dragstart" : "click", this.destroyBuildingClick.bind(this, button));
        this.panels.bottom.push(button);
        var button = this.gui.add("ActionButton");
        button.sprite = "campfire";
        button.spriteScale = 0.5;
        button.spriteAlignY = 0.85;
        button.cost = 2;
        button.resource = "wood";
        button.key = "campfire";
        button.tooltip = "Start a campfire"
        button.subtip = "Heal 1 HP for 1 food"
        this.guiElements.campfire = button;
        this.panels.left.push(button);
        button.on(PLAYGROUND.MOBILE ? "dragstart" : "click", ()=>{
            this.action.set("place_campfire");
        }
        );
        this.buttons.push(button);
        var button = this.gui.add("ActionButton");
        button.sprite = "tribesman/tribesman";
        button.cost = 2;
        button.spriteRow = 2;
        button.key = "recruit";
        this.buttons.recruit = button;
        button.resource = "food";
        button.tooltip = "Recruit new member;";
        button.subtip = "get an unequipped minion";
        button.action = "recruit";
        button.palette = 0;
        this.guiElements.recruit = button;
        this.panels.left.push(button);
        button.on("enter", function() {
            this.sprite = "tribesman/male/roll";
        });
        button.on("leave", function() {
            this.sprite = "tribesman/tribesman";
        });
        button.on(PLAYGROUND.MOBILE ? "dragstart" : "click", this.onActionButtonClick.bind(this, button));
        this.buttons.push(button);
        var button = this.gui.add("ActionButton");
        button.icon = COMMON.items.stay.icon;
        button.key = "stay";
        button.tooltip = COMMON.items.stay.tooltip;
        button.subtip = COMMON.items.stay.subtip;
        this.panels.left.push(button);
        button.on(PLAYGROUND.MOBILE ? "dragstart" : "click", ()=>{
            this.action.set("stay");
        }
        );
        this.panels.bottom.push(button);
        let equipment = ["axe", "bow", "hammer", "sword", "scythe", "dagger", "wooden_shield", "reinforced_shield", "steel_shield", "hood", "viking_helmet", "legion_helmet"];
        for (let key of equipment) {
            let def = COMMON.items[key];
            let button = this.gui.add("ActionButton");
            button.palette = 0;
            let spriteKey = def.sprite || key;
            button.sprite = `tribesman/${spriteKey}/turntable`;
            button.def = def;
            button.cost = def.cost;
            button.resource = def.resource;
            button.action = "equip";
            button.key = key;
            button.tooltip = def.tooltip;
            button.subtip = def.subtip;
            if (def.palette)
                button.spritePalette = def.palette;
            button.on(PLAYGROUND.MOBILE ? "dragstart" : "click", this.onActionButtonClick.bind(this, button));
            this.buttons.push(button);
            this.buttons[key] = button;
            if (def.slot === "helmet" || def.slot === "shield") {
                this.panels.right.push(button);
            } else {
                this.panels.left.push(button);
            }
        }
        this.arrangeButtons();
    },
    layout: 1,
    buildClick(button, building) {
        if (this.disabledCheck(button))
            return;
        let def = COMMON.items[building];
        this.action.set(def.buildMethod, building, "building/" + building);
    },
    plantClick(button, plant) {
        if (this.disabledCheck(button))
            return;
        this.action.set("PlantAPlant", plant);
    },
    destroyBuildingClick(button, plant) {
        this.action.set("destroyBuilding", plant);
    },
    arrangeButtons() {
        this.guiResources.x = app.width / 2 - 36 | 0;
        this.guiResources.y = 8;
        this.experienceBottle.x = 8;
        this.experienceBottle.y = app.height - 38;
        var x = 4;
        var y = app.height / 2 - (this.panels.left.length * 24 / 2) | 0;
        for (let button of this.panels.left) {
            button.hidden = this.inventions.indexOf(button.key) === -1;
            button.x = x;
            button.y = y;
            button.tokensPosition = "right";
            y += 24;
        }
        var x = app.width - 24;
        var y = app.height / 2 - (this.panels.right.length * 24 / 2) | 0;
        for (let button of this.panels.right) {
            button.hidden = this.inventions.indexOf(button.key) === -1;
            button.x = x;
            button.y = y;
            button.tokensPosition = "left";
            y += 24;
        }
        var x = app.width / 2 - this.panels.bottom.length * 24 / 2 | 0;
        var y = app.height - 32;
        for (let button of this.panels.bottom) {
            button.hidden = this.inventions.indexOf(button.key) === -1;
            button.y = y;
            button.x = x;
            x += 24;
        }
    },
    updateButtons() {
        for (let button of this.buttons)
            this.updateButton(button);
    },
    updateButton(button) {
        let disabled = button.disabled;
        if (!button.cost)
            button.disabled = false;
        else if (this.playerData.resources[button.resource] < button.cost) {
            button.disabled = true;
            button.disabledReason = "Not enough " + button.resource;
        } else {
            button.disabled = false;
        }
        button.needRefresh = true;
    },
    deny(text) {
        app.sound.play("gui/disabled_click");
        this.showTooltip(text);
        this.tooltip.color.set(0xdd4400);
        this.tooltipLifespan = 3.0;
    },
    disabledCheck(button) {
        if (button.disabled) {
            app.sound.play("gui/disabled_click");
            if (button.disabledReason) {
                this.showTooltip(button.disabledReason);
                this.tooltip.color.set(0xdd4400);
                this.tooltipLifespan = 3.0;
            }
            return true;
        }
        return false;
    },
    onActionButtonClick(button) {
        if (this.disabledCheck(button))
            return;
        if (button.action === "invent") {
            this.send("invent", {
                key: button.key
            });
            app.sound.play("gui/invent");
            this.inventions.push(button.key);
            let next = Utils.find(this.buttons, (b)=>b.key === button.key);
            if (next) {
                this.arrangeButtons();
                let x = next.x;
                let y = next.y;
                next.x = button.x;
                next.y = button.y;
                let duration = Utils.distance(x, y, next.x, next.y) / 400;
                app.tween(next).to({
                    x: x - Utils.sign(x - app.width / 2) * 32
                }, duration * 0.25).to({
                    y: y
                }, duration * 0.25).to({
                    x: x
                }, 0.4, "outBounce");
            }
            button.gui.remove(button);
            this.experienceBottle.levels--;
            if (this.experienceBottle.levels > 0) {
                this.experienceBottle.showInventions();
            } else {
                this.experienceBottle.hideInventions();
            }
        } else if (button.action === "recruit") {
            this.action.set("recruit");
        } else if (button.action === "equip") {
            this.action.set("equip", button.key);
        }
    },
    sortInteractive(a, b) {
        let diff;
        diff = (b.interactiveIndex | 0) - (a.interactiveIndex | 0);
        if (diff)
            return diff;
        return b.id - a.id;
    },
    getEntityAtCursor() {
        this.entities.groups.interactive.sort(this.sortInteractive);
        for (let entity of this.entities.groups.interactive) {
            if (!entity.inView)
                continue;
            let radius = entity.interactiveRadius || entity.radius;
            if (Utils.pointInRect(this.pointer.x, this.pointer.y, entity.x - radius, entity.y - radius, radius * 2, radius * 2)) {
                return entity;
            }
        }
        return null;
    },
    inspect(x, y) {
        for (let entity of this.entities.children) {
            let radius = entity.radius;
            if (Utils.pointInRect(x, y, entity.x - radius, entity.y - radius, radius * 2, radius * 2)) {
                console.log("-- local inspector --");
                console.log(entity);
                if (entity.sid)
                    this.send("inspect", {
                        sid: entity.sid
                    });
            }
        }
        return null;
    },
    create: function() {
        this.sharer = new CLIENT.Sharer(app.data.shared);
        this.camera = new CLIENT.Camera();
        this.viewMatrix = Matrix3.create();
    },
    start(data) {
        this.controller = CLIENT.Game[data.mode + "Mode"];
        gtag('event', data.mode + "Mode");
        this.inventions = ["campfire", "recruit", "axe", "bow"];
        this.playerData = {
            resources: {
                food: 0,
                wood: 0,
                gold: 0,
                water: 0
            }
        };
        this.speed = data.speed;
        this.ready = true;
        this.request_id = 1;
        this.privateData = {
            totemX: 0,
            totemY: 0,
            score: 0,
            level: 0,
            exp: 0
        };
        this.sharer.setKeys(data.sharedKeys);
        this.lifetime = 0;
        this.entities = new CLIENT.Entities(this);
        this.entities.createGroup("tribesman");
        this.entities.createGroup("castles");
        this.entities.createGroup("interactive");
        this.entities.createGroup("movable");
        this.entities.createGroup("impassable");
        this.entities.createGroup("radar");
        this.entities.createGroup("buildings");
        this.entities.createGroup("obstacles");
        for (var i = 0; i < data.entities.length; i++) {
            var encoded = data.entities[i];
            if (!encoded)
                continue;
            var constructorName = this.sharer.getKey(encoded[1]);
            var decoded = this.sharer.decode(constructorName, encoded);
            if (!constructorName)
                continue;
            this.entities.add(constructorName, {
                shared: decoded
            });
        }
        this.resize();
        this.createButtons();
        if (this.controller.start)
            this.controller.start();
    },
    send: function(message, data) {
        if (app.data.shared[message]) {
            data = this.sharer.encode(message, data, false, [], true);
            message = this.sharer.getKeyIndex(message);
        }
        var packet = msgpack.encode([message, data]);
        this.socket.send(packet);
    },
    sendDiff: function(message, data) {
        if (app.data.shared[message]) {
            data = this.sharer.encode(message, data, null, [], true);
            message = this.sharer.getKeyIndex(message);
        }
        var packet = msgpack.encode([message, data]);
        this.socket.send(packet);
    },
    manipulate(object, func, data) {
        let entry = Object.create(null);
        entry.object = object;
        entry.func = func;
        entry.data = data;
        this.manipulators.push(entry);
    },
    handleMessage: function(message, data) {
        if (typeof message === "number")
            message = this.sharer.getKey(message);
        if (app.data.shared[message])
            data = this.sharer.decode(message, data, true);
        if (CLIENT.GameMessageHandler[message]) {
            CLIENT.GameMessageHandler[message](this, data);
        }
    },
    timeout() {
        let timeout = arguments[arguments.length - 1];
        this.timeouts.push(Array.from(arguments));
    },
    updateSharedEntity: function(data) {
        if (!this.entities)
            return;
        var sid = data[1];
        var entity = this.entities.sid(sid);
        if (!entity) {
            var cname = this.sharer.getKey(data[2]);
            var changes = this.sharer.decode(cname, data, true);
            entity = this.entities.add(cname, {
                shared: changes
            });
        } else {
            var changes = this.sharer.decode(entity.constructorName, data, true);
            entity.update(changes);
        }
    },
    onmessage: function(event) {
        var packet = msgpack.decode(new Uint8Array(event.data));
        var message = packet[0];
        var data = packet[1];
        this.handleMessage(message, data);
    },
    onconnect: function() {
        this.send("hello", {
            name: this.tribeName,
            group: this.groupName,
            mode: this.mode
        });
    },
    ondisconnect: function() {
        $(`<div class="absolute border-window center text-align-center">
    <h2>SERVER IS DEAD</h2>
    <p>Please reload the game in a minute.</p>
    <p>I am probably updating something</p>
    <p>Sorry if you have lost your tribe :(</p>    
  </div>`).appendTo(document.body);
    },
    parseQueue: function(queue) {
        while (queue.length) {
            var packet = queue.shift();
            var message = packet[0];
            var data = packet[1];
            this.handleMessage(message, data);
        }
    },
    hit(entity) {
        entity.hitLifespan = 0.3;
        let blood = entity.collection.add("Sprite");
        blood.x = entity.x;
        blood.y = entity.y;
        blood.set("blood_1");
        blood.duration = 0.5;
        blood.color.set(0xcc5500);
        blood.zIndex = 3;
        app.sound.play("pain_quick").gpan(entity).rate(1.2).volume(0.4);
    },
    render() {
        if (!this.ready)
            return;
        if (this.needRefreshMap) {
            this.updateMapTexture();
            this.needRefreshMap = false;
        }
        let gl = app.gl;
        var projectionMatrix = Matrix3.projection(app.canvas.width, app.canvas.height);
        this.projectionMatrix = projectionMatrix;
        gl.clearColor(this.groundColor[0], this.groundColor[1], this.groundColor[2], this.groundColor[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);
        Matrix3.reset(this.viewMatrix);
        Matrix3.reset(this.camera.matrix);
        Matrix3.multiply(this.viewMatrix, projectionMatrix);
        for (var key in app.programs) {
            let program = app.programs[key];
            gl.useProgram(program.native);
            program.set("viewMatrix", this.viewMatrix);
        }
        Matrix3.reset(this.viewMatrix);
        Matrix3.reset(this.camera.matrix);
        app.painter.reset();
        Matrix3.scale(this.camera.matrix, this.camera.scale, this.camera.scale);
        Matrix3.translate(this.camera.matrix, -this.camera.x | 0, -this.camera.y | 0);
        Matrix3.multiply(this.viewMatrix, projectionMatrix);
        Matrix3.multiply(this.viewMatrix, this.camera.matrix);
        for (var key in app.programs) {
            let program = app.programs[key];
            gl.useProgram(program.native);
            program.set("viewMatrix", this.viewMatrix);
        }
        for (var i = 0; i < this.entities.inView.length; i++) {
            let entity = this.entities.inView[i];
            if (entity.systemLight) {
                if (entity.oz)
                    continue;
                app.painter.reset();
                app.painter.alpha(1.0);
                app.painter.color(COMMON.LIGHT_COLOR);
                app.painter.values.scale.y = 0.75;
                app.painter.fillCircle(entity.x | 0, entity.y - (entity.oz | 0) | 0, entity.systemLight);
            }
        }
        for (var i = 0; i < this.entities.children.length; i++) {
            let entity = this.entities.children[i];
            if (!entity.inView)
                continue;
            if (entity.systemShadow) {
                app.painter.reset();
                app.painter.color(0x000000);
                app.painter.values.alpha = 0.25;
                app.painter.values.scale.y = 0.75;
                app.painter.fillCircle(entity.x | 0, entity.y - (entity.oz | 0) | 0, entity.systemShadow);
            }
            entity.render();
        }
        this.action.call("render");
        app.painter.reset();
        for (var i = 0; i < this.orders.length; i++) {
            let sid = this.orders[i];
            let entity = this.entities.sid(sid);
            if (!entity || !entity.inView)
                continue;
            app.painter.drawImageRegion(app.textures.spritesheet, 32, 75, 7, 6, entity.x, entity.box[1] - 8);
        }
        if (this.controller.render)
            this.controller.render();
        Matrix3.reset(this.viewMatrix);
        Matrix3.reset(this.camera.matrix);
        Matrix3.multiply(this.viewMatrix, projectionMatrix);
        for (var key in app.programs) {
            let program = app.programs[key];
            gl.useProgram(program.native);
            program.set("viewMatrix", this.viewMatrix);
        }
        if (this.controller.postrender)
            this.controller.postrender();
        this.renderMap();
        this.selector.render();
        this.gui.render();
        this.action.call("postrender");
        this.cursorDirection = Utils.circWrapTo(this.cursorDirection, this.cursorFinalDirection, 12 * app.elapsed);
        this.cursor.row = Utils.dirrow(this.cursorDirection, 64);
        this.cursor.step(app.elapsed);
        this.cursor.x = app.pointer.x;
        this.cursor.y = app.pointer.y + (PLAYGROUND.MOBILE ? COMMON.MOBILE_CURSOR_OFFSET : 0);
        if (!PLAYGROUND.MOBILE || (this.cursor.key !== "point" && this.cursor.key !== "thump")) {
            this.cursor.render();
        }
        app.painter.reset();
        if (this.scoreLifespan > 0) {
            this.scoreLifespan -= app.elapsed;
            let progress = app.lifetime % 0.5 / 0.5;
            app.painter.color(this.SCORE_COLORS[this.SCORE_COLORS.length * progress | 0]);
        } else {
            app.painter.color(0xffffff);
        }
        app.painter.textAlign("right");
        app.painter.font(app.fonts.fat);
        app.painter.fillText(String(this.privateData.score), app.width - 4, 4);
        this.camera.step(app.elapsed);
        this.updatePointerPosition();
    },
    renderMap() {
        if (!this.player)
            return;
        if (!this.mapTexture)
            this.updateMapTexture();
        let scaleX = 0.5;
        let scaleY = 0.5;
        let mapRadius = this.mapTexture.width / 2;
        app.painter.reset();
        app.painter.scale(1.0, 0.75)
        app.painter.translate(app.width - 40, app.height - 40);
        app.painter.color(0x000000, 0.5);
        app.painter.fillCircle(0, 0, mapRadius);
        app.painter.color(0, 0);
        app.painter.drawImage(this.mapTexture, 0, 0);
        app.painter.color(0xffffff);
        app.painter.color(0, 0);
        app.painter.scale(1.0, 1.0)
        app.painter.drawImageRegion(app.textures.spritesheet, 67, 118, 72, 65, 0, 0);
        app.painter.reset();
        app.painter.translate(app.width - 40, app.height - 40);
        for (let tribe of this.entities.groups.tribes) {
            if (tribe === this.player)
                continue;
            let r = Math.ceil((tribe.members.length + 1) / 2);
            app.painter.color(tribe.team === this.player.team ? 0x99e550 : 0xff0000);
            app.painter.fillRect((tribe.x - this.left) * this.mapScaleX - mapRadius - r / 2 | 0, (tribe.y - this.top) * this.mapScaleY * 0.75 - mapRadius * 0.75 - r / 2 | 0, r, r);
        }
        for (let entity of this.entities.groups.radar) {
            app.painter.color(entity.radar.color);
            app.painter.fillRect((entity.x - this.left) * this.mapScaleX - mapRadius, (entity.y - this.top) * this.mapScaleY * 0.75 - mapRadius * 0.75, 1, 1);
        }
        app.painter.color(0xffffff);
        app.painter.fillCircle((this.camera.center.x - this.left) * this.mapScaleX - mapRadius, (this.camera.center.y - this.top) * this.mapScaleY * 0.75 - mapRadius * 0.75, 1);
    },
    addScore(score) {
        if (score <= 0)
            return;
        this.scoreLifespan = 2.0;
        if (this.privateData.level >= COMMON.MAX_LEVEL)
            return;
        var nextLevelExp = 0;
        while (score--) {
            nextLevelExp = COMMON.levelToExp(this.privateData.level + 1);
            this.privateData.exp++;
            if (this.privateData.exp >= nextLevelExp) {
                this.privateData.exp = 0;
                this.levelUp();
            }
        }
        this.experienceBottle.setProgress(this.privateData.exp / nextLevelExp);
    },
    levelUp() {
        app.sound.play("gui/levelup")
        this.privateData.level++;
        this.experienceBottle.levels++;
        this.experienceBottle.level = this.privateData.level;
        this.experienceBottle.showInventions();
    },
    score(score, x, y) {
        app.sound.play("gui/score").volume(0.5).rate(1.4);
        this.entities.add("FloatingText", {
            x,
            y,
            text: score,
            colors: this.SCORE_COLORS,
        });
    },
    SCORE_COLORS: [0xffffff, 0x639bff, 0xfbf236, 0xe51f1f],
    step(dt) {
        app.elapsed *= this.speed;
        if (!this.ready)
            return;
        dt *= this.speed;
        this.lifetime += dt;
        this.entities.step(dt);
        for (let i = 0; i < this.manipulators.length; i++) {
            let manipulator = this.manipulators[i];
            let result = manipulator.object._remove || manipulator.func(manipulator.object, manipulator.data, dt);
            if (result)
                this.manipulators.splice(i--, 1);
        }
        for (let i = 0; i < this.timeouts.length; i++) {
            let timeout = this.timeouts[i];
            if ((timeout[timeout.length - 1] -= dt) <= 0) {
                timeout[0](timeout[1], timeout[2], timeout[3]);
                this.timeouts.splice(i--, 1);
            }
        }
        this.checkCollisions();
        if (app.keyboard.keys.f) {}
        this.action.step(dt);
        this.gui.step(dt);
        if (Utils.interval(this, "hover", 0.1)) {
            this.updatePointer();
        }
        if (this.inputMode !== "chat") {
            if (app.keyboard.keys.dash) {
                this.camera.scale -= (0.2 + 0.5 * this.camera.scale) * dt;
                this.camera.jump();
            }
            if (app.keyboard.keys.equal) {
                this.camera.scale += (0.2 + 0.5 * this.camera.scale) * dt;
                this.camera.jump();
            }
        }
        this.selector.step(dt);
        this.tooltip.x = app.width / 2 - this.tooltip.size.width / 2 | 0;
        this.tooltip.y = app.height - this.tooltip.size.height - 32;
        if (this.clearOrderTimeout > 0.0) {
            this.clearOrderTimeout -= dt;
            if (this.clearOrderTimeout <= 0) {
                this.orders.shift();
                this.clearOrderTimeout = COMMON.CLEAR_ORDER_INTERVAL;
            }
        }
        if (this.tooltipLifespan > 0) {
            this.tooltipLifespan -= dt;
            if (this.tooltipLifespan <= 0)
                this.hideTooltip();
        }
        if (this.raining) {
            let raindrop = this.entities.add("Sprite");
            raindrop.set("fx/raindrop");
            raindrop.duration = 0.5;
            raindrop.blendDst = app.gl.ONE;
            raindrop.color.set(Utils.random([0x639bff, 0xcbdbfc]));
            raindrop.alpha = 0.5;
            raindrop.x = this.camera.x + Utils.random(0, this.camera.box[2]);
            raindrop.y = this.camera.y + Utils.random(0, this.camera.box[3]);
            raindrop.z = Utils.random(50, 150);
            raindrop.zIndex = 5;
            app.tween(raindrop).to({
                z: 0,
                rotation: Utils.randomf(-0.5, 0.5)
            }, 0.1);
        }
        if (this.player && this.player.members.length >= COMMON.MAX_POPULATION && !this.controller.def.unlimited) {
            this.buttons.recruit.hidden = true;
        } else {
            this.buttons.recruit.hidden = false;
        }
        if (Utils.interval(this, "updateLeaderboards", 5.0))
            this.updateLeaderboards();
        if (this.controller.step)
            this.controller.step(dt);
    },
    updateLeaderboards() {
        let tribes = Utils.filter(this.entities.groups.tribes, this.notBarbarian);
        tribes.sort(function(a, b) {
            return b.shared.score - a.shared.score;
        });
        tribes = tribes.slice(0, 11);
        for (let i = 0; i < tribes.length; i++) {
            let totem = tribes[i].totem;
            if (totem)
                totem.setLevel(tribes.length - i);
        }
    },
    setPlayer(entity) {
        this.cancelRespawnWindow();
        gtag('event', 'gamestart');
        this.experienceBottle.levels = 0;
        this.experienceBottle.level = 0;
        this.experienceBottle.hideInventions();
        this.privateData.level = 0;
        this.inventions = ["campfire", "recruit", "axe", "bow"];
        if (this.controller.def.advancedContent)
            this.inventions.push("stone_wall", "stone_gate", "stone_tower", "wood_storage", "food_storage", "well", "stationary_catapult", "tree_plant", "corn", "destroyBuilding");
        this.player = entity;
        for (let t of this.entities.groups.tribes) {
            t.setTeam(t.shared.team);
        }
        this.camera.follow = entity;
        this.camera.limiter = entity;
        this.totem = entity.totem;
        this.totem.player = true;
        this.totem.group = this.player;
        this.camera.setFollow(this.totem);
        this.privateData.totemX = this.totem.x = this.player.x;
        this.privateData.totemY = this.totem.y = this.player.y;
        this.updatePrices();
        this.arrangeButtons();
        if (this.controller.onRespawn)
            this.controller.onRespawn();
    },
    updatePointer() {
        let prev = this.hovered;
        this.hovered = this.getEntityAtCursor();
        if (this.action.current.tooltips === false) {
            this.hideTooltip();
        } else if (this.hovered !== prev) {
            if (prev && prev.tooltip)
                this.hideTooltip();
            if (this.hovered && this.hovered.tooltip)
                this.showTooltip(this.hovered.tooltip, this.hovered);
        }
    },
    hideTooltip() {
        if (!this.tooltipShown)
            return;
        this.tooltipShown = false;
        app.tween(this.tooltip.batch).to({
            dissolve: 1.0
        }, 0.1);
    },
    showTooltip(text, subject) {
        this.tooltipShown = true;
        if (CLIENT.Game.Tooltips[text]) {
            text = CLIENT.Game.Tooltips[text](subject);
        }
        if (!text)
            return;
        this.tooltipLifespan = 0.0;
        this.tooltip.batch.dissolve = 1.0;
        app.tween(this.tooltip.batch).to({
            dissolve: 0.0
        }, 0.1);
        this.tooltip.font = app.fonts.default;
        this.tooltip.size = this.tooltip.font.getSize(text);
        this.tooltip.text = text
        this.tooltip.color.set(0xcbdbfc, 0.75);
    },
    collisionRadius: 50,
    checkCollisions() {
        let collision = true;
        while (collision) {
            collision = false;
            let entitiesA = this.entities.groups.movable;
            let entitiesB = this.entities.groups.impassable;
            for (let i = 0; i < entitiesA.length; i++) {
                let a = entitiesA[i];
                if (!a.inView)
                    continue;
                if (a.dead)
                    continue;
                if (a.force)
                    continue;
                if (a.z)
                    continue;
                if (a.ignorePointer)
                    continue;
                if (a.tempIgnoreCollisions > 0)
                    continue;
                if (Utils.distance(a.x, a.y, this.pointer.x, this.pointer.y) < 20) {
                    if (this.action.current.appliesTo && this.action.current.appliesTo(a)) {} else if (!a.ignoreCollisions) {
                        let angle = Utils.lookAt(this.pointer.x, this.pointer.y, a.x, a.y);
                        a.x = this.pointer.x + Math.cos(angle) * 20;
                        a.y = this.pointer.y + Math.sin(angle) * 20;
                    }
                }
                if (a.ignoreCollisions)
                    continue;
                for (let j = 0; j < entitiesB.length; j++) {
                    let b = entitiesB[j];
                    if (a.group === b.group)
                        continue;
                    if (!b.heavy)
                        continue;
                    if (b.dead)
                        continue;
                    if (b.force)
                        continue;
                    let collisionRadius = a.collisionRadius + b.collisionRadius;
                    if (Utils.distance(a, b) < collisionRadius) {
                        let ax = a.x;
                        let ay = a.y;
                        let angle = Utils.lookAt(a, b);
                        let x = a.x + (b.x - a.x) * 0.5;
                        let y = a.y + (b.y - a.y) * 0.5;
                        if (!a.heavy) {
                            a.x = x + Math.cos(angle + Math.PI) * collisionRadius * 0.5;
                            a.y = y + Math.sin(angle + Math.PI) * collisionRadius * 0.5;
                        }
                        if (!b.heavy) {
                            b.x = x + Math.cos(angle) * collisionRadius * 0.5;
                            b.y = y + Math.sin(angle) * collisionRadius * 0.5;
                        }
                    }
                }
            }
        }
    },
    xcheckCollisions() {
        let collision = true;
        let px = app.pointer.x + this.camera.x;
        let py = app.pointer.y + this.camera.y;
        while (collision) {
            collision = false;
            let entities = this.entities.groups.collidable;
            for (let i = 0; i < entities.length; i++) {
                let a = entities[i];
                if (!a.inView)
                    continue;
                if (a.dead)
                    continue;
                if (a.force)
                    continue;
                if (a.heavy)
                    continue;
                if (Utils.distance(a.x, a.y, px, py) > 20)
                    continue;
                let angle = Utils.lookAt(px, py, a.x, a.y);
                a.x = px + Math.cos(angle) * 20;
                a.y = py + Math.sin(angle) * 20;
            }
        }
    },
    updatePrices() {
        this.guiElements.recruit.cost = Math.min(6, this.player.members.length);
        this.guiElements.campfire.cost = Math.min(6, this.player.members.length);
        this.updateButton(this.guiElements.campfire);
        this.updateButton(this.guiElements.recruit);
        for (let button of this.buttons) {
            if (!button.def)
                continue;
            if (button.def.scaleCost) {
                button.cost = Math.min(6, this.player.members.length - 1);
            }
            this.updateButton(button);
        }
    },
    resize() {
        if (this.camera) {
            this.camera.set(0, 0, app.width, app.height);
            this.camera.skip();
        }
        if (this.experienceBottle) {
            this.arrangeButtons();
        }
    },
    keymap: {},
    keydown(e) {
        if (this.inputMode === "chat") {
            switch (e.key) {
            case "enter":
                this.quickChat.send();
                this.quickChat.hide();
                this.inputMode = "default";
                break;
            case "escape":
                this.quickChat.hide();
                this.inputMode = "default";
                break;
            }
        } else {
            let input = this.keymap[e.key]
            if (input)
                this.send("press", input);
            switch (e.key) {
            case "enter":
                this.inputMode = "chat";
                this.quickChat.show();
                break;
            }
        }
    },
    keyup(e) {
        if (this.inputMode === "chat") {} else {
            let input = this.keymap[e.key]
            if (input)
                this.send("release", input);
        }
    },
    emote(entity, emote) {
        let image = this.entities.add("Image");
        image.follow = entity;
        image.offsetY = -10;
        image.setTexture(app.textures.spritesheet);
        image.setRegion(...COMMON.items[emote].icon);
        image.lifespan = 3.0;
        app.tween(image).to({
            offsetY: -24
        }, 0.5, "outElastic");
        app.tween(image.scale).delay(2.0).to({
            y: 0.0
        }, 0.6, "outBounce");
    },
    updatePointerPosition() {
        this.pointer.x = this.camera.x + app.pointer.x / this.camera.scale | 0;
        this.pointer.y = this.camera.y + app.pointer.y / this.camera.scale | 0;
        this.pointer.gx = Math.floor(this.pointer.x / COMMON.GRID_WIDTH);
        this.pointer.gy = Math.floor(this.pointer.y / COMMON.GRID_HEIGHT);
        this.pointer.xg = this.pointer.gx * COMMON.GRID_WIDTH;
        this.pointer.yg = this.pointer.gy * COMMON.GRID_HEIGHT;
    },
    pointermove(e) {
        this.updatePointerPosition();
        this.gui.pointermove(e);
        this.action.call("pointermove", e);
        if (this.pointer.pressedEntity && this.pointer.pressedEntity.dragstart && !this.pointer.dragging) {
            if (Utils.distance(this.pointer.dragX, this.pointer.dragY, this.pointer.x, this.pointer.y) > 16) {
                this.pointer.pressedEntity.dragstart();
                this.pointer.dragging = true;
                this.pointer.pressedEntity = null;
            }
        }
    },
    pointerdown(e) {
        if (app.keyboard.keys['b']) {
            this.send("building", {
                x: this.pointer.x,
                y: this.pointer.y
            });
        }
        if (app.keyboard.keys['o']) {
            this.send("ogre", {
                x: this.pointer.x,
                y: this.pointer.y
            });
        }
        if (app.keyboard.keys['t']) {
            this.send("enemy", {
                x: this.pointer.x,
                y: this.pointer.y
            });
        }
        if (e.button === "xright") {
            this.entities.add("Generic", {
                x: this.pointer.x,
                y: this.pointer.y
            })
        }
        if (app.keyboard.keys.shift) {
            this.inspect(this.pointer.x, this.pointer.y);
            return;
        }
        this.pointermove(e);
        this.pointer.dragX = this.pointer.x;
        this.pointer.dragY = this.pointer.y;
        this.pointer.pressedEntity = this.getEntityAtCursor();
        this.updatePointer();
        if (this.gui.pointerdown(e)) {
            this.cursor.set("press");
            this.cursor.duration = 0.05;
            this.cursor.inverse = false;
        } else {
            this.action.call("pointerdown", e);
        }
    },
    pointerup(e) {
        if (app.keyboard.keys.shift) {
            return;
        }
        if (this.gui.pointerup(e)) {
            if (this.cursor.key === "press") {
                this.cursor.set("press");
                this.cursor.duration = 0.15;
                this.cursor.inverse = true;
            }
            return;
        } else {
            this.action.call("pointerup", e);
        }
        this.send("release", e.button === "left" ? "gun" : "move");
        this.pointer.pressedEntity = null;
        this.pointer.dragging = false;
    },
    errorMessage(text) {
        app.sound.play("gui/disabled_click");
        this.showTooltip(text);
        this.tooltip.color.set(0xdd4400, 0.8);
        this.tooltipLifespan = 3.0;
    },
    fxStoneHit(x, y) {
        app.sound.play("impact/ground_medium");
        {
            let count = Utils.random(4, 8);
            let delay = 0;
            for (var i = 0; i < count; i++) {
                let debris = this.entities.add("Sprite");
                let duration = 0.5;
                delay += Math.random() * 0.1;
                debris.set("fx/stone");
                let scale = Utils.randomf(0.1, 0.25);
                debris.delay = delay;
                debris.shadow = true;
                debris.scale.x = scale;
                debris.scale.y = scale;
                debris.x = x + Utils.random(-8, 8);
                debris.y = y + Utils.random(-8, 8);
                debris.z = 16;
                debris.shadow = true;
                debris.loop = true;
                debris.duration = duration;
                app.tween(debris).delay(delay).to({
                    z: 0
                }, duration, "outBounce");
                app.tween(debris.scale).delay(delay).delay(duration * 0.5).to({
                    x: 0,
                    y: 0,
                }, duration);
                debris.lifespan = duration;
            }
        }
        {
            let count = Utils.random(1, 3);
            for (var i = 0; i < count; i++) {
                let debris = this.entities.add("Sprite");
                let duration = Utils.randomf(0.5, 1.5);
                debris.set("fx/stone");
                debris.shadow = true;
                debris.scale.x = 0.5;
                debris.scale.y = 0.5;
                debris.x = x + Utils.random(-8, 8);
                debris.y = y + Utils.random(-8, 8);
                ;debris.z = 8;
                debris.shadow = true;
                debris.loop = true;
                debris.duration = duration * 0.3;
                app.tween(debris).to({
                    z: 30
                }, duration * 0.5, "inSine").to({
                    z: 0
                }, duration * 0.5, "outBounce");
                app.tween(debris).to({
                    x: debris.x + Utils.random(-50, 50),
                    y: debris.y + Utils.random(-50, 50)
                }, duration);
                app.tween(debris.scale).delay(duration * 0.5).to({
                    x: 0,
                    y: 0,
                }, duration * 0.5);
                debris.lifespan = duration;
            }
        }
    },
    drawSpriteDamage(spriteName, x, y, frame, row, damage) {
        if (!app.sprites[spriteName])
            return app.loadSprite(spriteName);
        let sprite = app.sprites[spriteName];
        let region = NAMESPACE.Sprite.getRegion(spriteName, frame, row);
        let trim = NAMESPACE.Sprite.getTrim(spriteName, frame, row);
        app.painter.program(app.programs.damage);
        app.gl.useProgram(app.programs.damage.native);
        app.gl.activeTexture(app.gl.TEXTURE4);
        app.gl.bindTexture(app.gl.TEXTURE_2D, app.textures.damage);
        app.programs.damage.set("damageTexture", 4);
        app.painter.alpha(1.0 - damage * 0.5);
        app.painter.align(0.0, 0.0);
        app.painter.drawImageRegion(app.sprites[spriteName].texture, ...region, x - (sprite.width) * 0.5 + trim[0] | 0, y - (sprite.height) * 0.5 + trim[1] | 0);
    },
    fxImplodeSprite(spriteKey, x, y, frame=0, row=0, duration=1.0, options) {
        app.loadSprite(spriteKey).then(()=>{
            let spriteData = app.sprites[spriteKey];
            let trim = CLIENT.Sprite.getTrim(spriteKey, frame, row);
            this.fxImplode(x + trim[0] - spriteData.width / 2 | 0, y + trim[1] - spriteData.height / 2 | 0, "sprites/" + spriteKey, CLIENT.Sprite.getRegion(spriteKey, frame, row), -1, 8, 1.0);
        }
        );
    },
    fxExplodeOptions: {
        palette: -1,
        spread: 1.0,
        altitude: 5.0
    },
    fxExplodeSprite(spriteKey, x, y, frame=0, row=0, duration=1.0, options) {
        app.loadSprite(spriteKey).then(()=>{
            let spriteData = app.sprites[spriteKey];
            let trim = CLIENT.Sprite.getTrim(spriteKey, frame, row);
            let region = CLIENT.Sprite.getRegion(spriteKey, frame, row);
            this.fxExplode(x + trim[0] - spriteData.width / 2 | 0, y + trim[1] - spriteData.height / 2 | 0, app.sprites[spriteKey].texture, region, duration, options);
        }
        );
    },
    fxExplode(x, y, texture, region, durationMod=2.0, options) {
        options = options || Object.assign(options, this.fxExplodeOptions);
        let palette = options.palette;
        let w = region[2] / 6 | 0;
        let h = region[2] / 4 | 0;
        let cx = region[2] / w;
        let cy = region[3] / h;
        for (var i = 0; i < cx; i++) {
            for (var j = 0; j < cy; j++) {
                let image = this.entities.add("Image");
                image.x = x + w * i + w / 2 | 0;
                image.y = y + region[3];
                image.z = region[3] - h * j + h / 2 | 0;
                image.setTexture(texture);
                image.setRegion(i * w, j * h, w, h);
                image.palette = palette;
                let delay = Utils.randomf(-0.1, 0.1);
                let duration = (1.0 - j / cy) * durationMod;
                let mx = (1.0 - j / cy);
                app.tween(image).delay(delay).to({
                    z: image.z + 1.0 + Utils.random(1, options.altitude)
                }, duration * 0.25, "outSine").to({
                    z: mx * region[3] * 0.25
                }, duration * 0.75, "outBounce");
                app.tween(image).delay(delay).to({
                    x: image.x + Utils.random(-region[2] * mx, +region[2] * mx) * options.spread,
                    y: image.y + Utils.random(-region[2] * 0.25, +region[2] * 0.25) * options.spread,
                    rotation: Utils.randomf(-1.0, 1.0),
                }, duration, "inSine");
                app.tween(image.scale).delay(delay + duration).to({
                    y: 0
                }, 0.5);
                this.manipulate(image, CLIENT.Manipulators.debris, {
                    delay: delay + duration * 0.75,
                    duration: delay + duration
                });
                image.lifespan = duration + delay + 0.5;
                image.zIndex = 2;
            }
        }
    },
    fxImplode(x, y, texture, region, palette=-1, d, durationMod=1.0, map) {
        let w = region[2] / 6 | 0;
        let h = region[2] / 4 | 0;
        let cx = region[2] / w | 0;
        let cy = region[3] / h | 0;
        for (var i = 0; i < cx; i++) {
            for (var j = 0; j < cy; j++) {
                let image = this.entities.add("Image");
                image.x = x + w * i + w / 2;
                image.y = y + region[3];
                image.z = region[3] * Utils.randomf(1.0, 3.0);
                image.scale.y = 3.0;
                image.scale.x = 3.0;
                image.rotation = Utils.randomf(-0.5, 0.5)
                let delay = 0;
                let duration = Utils.randomf(0.25 * durationMod, durationMod);
                app.tween(image).delay(delay).to({
                    x: x + w * i + w / 2 | 0,
                    y: y + region[3],
                    rotation: 0
                }, duration);
                app.tween(image).delay(delay).to({
                    z: region[3] - h * j - h / 2 | 0
                }, duration, "outBounce");
                image.setTexture(texture);
                image.setRegion(region[0] + i * w, region[1] + j * h, w, h);
                image.palette = palette;
                app.tween(image.scale).delay(delay).to({
                    y: 1.0,
                    x: 1.0
                }, duration);
                image.lifespan = durationMod + delay;
                if (map)
                    map(image);
            }
        }
    },
    fxRocks(x, y, count=5, scale=0.5) {
        for (var i = 0; i < count; i++) {
            let debris = this.entities.add("Sprite");
            let duration = Utils.randomf(0.5, 1.5);
            debris.set("fx/stone");
            debris.shadow = true;
            debris.scale.x = scale;
            debris.scale.y = scale;
            debris.x = x + Utils.random(-8, 8);
            debris.y = y + Utils.random(-8, 8);
            ;debris.z = 8;
            debris.shadow = true;
            debris.loop = true;
            debris.duration = duration * 0.3;
            app.tween(debris).to({
                z: 30
            }, duration * 0.5, "inSine").to({
                z: 0
            }, duration * 0.5, "outBounce");
            app.tween(debris).to({
                x: debris.x + Utils.random(-50, 50),
                y: debris.y + Utils.random(-50, 50)
            }, duration);
            app.tween(debris.scale).delay(duration * 0.5).to({
                x: 0,
                y: 0,
            }, duration * 0.5);
            debris.lifespan = duration;
        }
    },
    fxCoin(x, y) {
        let coin = this.entities.add("Sprite");
        coin.set("fx/coin");
        coin.rotation = -Math.HPI;
        coin.x = x || this.pointer.x;
        coin.y = y || this.pointer.y;
        coin.duration = 0.4;
        coin.loop = true;
        app.tween(coin).to({
            offsetY: -40
        }, 0.35, "outSine").to({
            offsetY: -16
        }, 0.35, "inSine");
        app.tween(coin.scale).delay(0.35).to({
            y: 0,
            x: 0
        }, 0.5);
        coin.lifespan = 2.0;
    },
    fxToss(key) {
        let def = COMMON.items[key];
        let image = this.entities.add("Image");
        image.setTexture("spritesheet");
        image.setRegion(...def.sprite);
        image.scale.x = 2.0;
        image.scale.y = 2.0;
        app.tween(image).to({
            offsetY: -40
        }, 0.35, "outSine").to({
            offsetY: -16
        }, 0.35, "inSine");
        image.x = this.pointer.x;
        image.y = this.pointer.y;
        app.tween(image.scale).delay(0.35).to({
            y: 0,
            x: 0
        }, 0.5);
        image.lifespan = 2.0;
    },
    fxCameraStomp() {
        app.tween(this.camera).delay(0.2).to({
            offsetY: 6
        }, 0.3, "outBounce").to({
            offsetY: 0
        }, 0.2)
    },
    cancelRespawnWindow() {
        if (!this.respawnWindow)
            return;
        if (typeof this.respawnWindow === "number")
            clearTimeout(this.respawnWindow);
        else
            this.respawnWindow.close();
        this.respawnWindow = null;
    },
    plink(x, y) {
        let sprite = this.entities.add("Sprite");
        sprite.x = x;
        sprite.y = y;
        sprite.set("fx/ping");
        sprite.duration = 0.25;
        sprite.inverse = true;
        app.sound.play("gui/build").gpan({
            x,
            y
        }).rate(1.5);
    },
    onDeath() {
        this.respawnWindow = setTimeout(()=>{
            this.respawnWindow = new CLIENT.RespawnWindow();
        }
        , 3000);
        this.followNearestTribe();
        if (this.controller.onDeath)
            this.controller.onDeath();
    },
    nearest(x, y, range, filter, collection) {
        collection = collection || this.entities.children;
        let pool = Utils.filter(collection, filter);
        for (let i = 0; i < pool.length; i++) {
            let entity = pool[i];
            if (!Utils.quickPointInRange(entity.x, entity.y, x, y, range))
                pool.splice(i--, 1);
        }
        return Utils.nearestxy(x, y, pool);
    },
    followNearestTribe() {
        let pool = Utils.filter(this.entities.groups.tribes, (t)=>{
            return !t._remove;
        }
        );
        if (!pool.length)
            return;
        let follow = Utils.nearest(this.camera.center, pool);
        this.camera.setFollow(follow);
        this.camera.limiter = null;
    },
    followNextTribe() {
        let pool = Utils.filter(this.entities.groups.tribes, (t)=>{
            return !t._remove && t.team !== COMMON.BARBARIAN_TEAM && t !== this.camera.follow;
        }
        );
        if (!pool.length)
            return;
        let id = 0;
        if (this.camera.follow)
            id = this.camera.follow.id;
        let any = false;
        while (true) {
            let result = null;
            for (let t of pool) {
                if (t.id < id && !any)
                    continue;
                result = t.id;
                break;
            }
            if (result) {
                this.camera.follow = result;
                this.camera.limiter = null;
                break;
            }
        }
    }
};
CLIENT.Game.SandboxMode = {
    canRespawn: true,
    canDisconnect: false,
    def: COMMON.modes.Sandbox,
    start() {
        app.game.entities.add("Generic", {
            x: 1000,
            y: 1000
        });
        let leaderboards = new CLIENT.LeaderboardWindow;
        let filter = function(t) {
            return t.shared.team !== COMMON.BARBARIAN_TEAM;
        }
        leaderboards.scoreInput = function() {
            return Utils.filter(app.game.entities.groups.tribes, filter);
        }
        leaderboards.setTitle("Top tribes");
    },
    summary() {
        let score = app.game.privateData.score;
        let $element = $(` <h2>YOUR SCORE</h2>
    <h1 class="score">2048</h1>
    <h3>YOUR BEST</h3>
    <h2 class="best">2048</h2>`);
        let best = localStorage.getItem("hiscore") | 0;
        $element.find(".score").html(score);
        if (score > best)
            localStorage.setItem("hiscore", score);
        $element.find(".best").html(best);
        return $element;
    },
    onRespawn() {
        if (app.game.music)
            app.game.music.fadeOut(1.0);
        app.game.music = app.music.play("music/one").loop().volume(0.5);
    },
    onDeath() {
        app.game.music.fadeOut(0.25);
        app.game.music = app.music.play("music/gameover").loop();
    }
};
CLIENT.Game.CastleMode = {
    canRespawn: true,
    canDisconnect: false,
    def: COMMON.modes.Castle,
    start() {
        app.game.entities.add("Generic", {
            x: 1000,
            y: 1000
        });
        let leaderboards = new CLIENT.LeaderboardWindow;
        leaderboards.scoreInput = function() {
            let castles = [].concat(app.game.entities.groups.castles);
            return castles
        }
    },
    summary() {
        let score = app.game.privateData.score;
        let $element = $(` <h2>YOUR SCORE</h2>
    <h1 class="score">2048</h1>
    <h3>YOUR BEST</h3>
    <h2 class="best">2048</h2>`);
        let best = localStorage.getItem("hiscore") | 0;
        $element.find(".score").html(score);
        if (score > best)
            localStorage.setItem("hiscore", score);
        $element.find(".best").html(best);
        return $element;
    },
    onRespawn() {
        if (app.game.music)
            app.game.music.fadeOut(1.0);
        app.game.music = app.music.play("music/one").loop().volume(0.5);
    },
    onDeath() {
        app.game.music.fadeOut(0.25);
        app.game.music = app.music.play("music/gameover").loop();
    }
};
CLIENT.Game.BattleRoyale = {
    canRespawn: true,
    canExit: true,
    foldRespawnWindow: false,
    def: COMMON.modes.BattleRoyale,
    start() {
        this.shared = {};
        this.radius = this.targetRadius = 5000;
        this.def = COMMON.modes.BattleRoyale;
    },
    update(data) {
        Object.assign(this.shared, data);
        if (data.state_key) {
            if (data.state_key === "play")
                this.play();
            if (data.state_key === "finished")
                this.finish();
        }
        if (data.radius) {
            this.targetRadius = data.radius;
        }
    },
    play() {
        app.sound.play("battle_royale/start");
        if (app.game.music) {
            app.game.music.fadeOut(0.5);
        }
        app.game.music = app.music.play("ambient/spiritual").loop();
        this.canRespawn = false;
        this.foldRespawnWindow = true;
    },
    finish() {
        app.game.music.fadeOut(0.25);
        app.game.music = app.music.play("music/victory");
        app.game.cancelRespawnWindow();
        this.summary();
    },
    onDeath() {
        if (this.canRespawn) {
            this.gameoverText = "The real game haven't started yet. You can respawn if you want or wait for the game to start.";
        } else {
            this.gameoverText = "Unfortunately you haven't made it to the end.<br>You can wait for the results or disconnect and have another try.";
        }
    },
    summary() {
        if (!app.game.data.summary)
            return "";
        let $table = $(`<table class='results'>
      <tr>
        <th class="place"></th>
        <th class="name">name</th>
        <th class="kills">kills</th>
        <th class="deaths">deaths</th>
      </tr>
      </table>`);
        let i = 0;
        for (let entry of app.game.data.summary) {
            i++;
            let $row = $(`<tr>
      <td class="place"></td>
      <td class="name"></td>
      <td class="kills"></td>
      <td class="deaths"></td>
      </tr>`);
            $row.children(".place").html(i + ".");
            $row.children(".name").html(entry.name);
            $row.children(".kills").html(entry.kills);
            $row.children(".deaths").html(entry.deaths);
            $row.appendTo($table);
        }
        let $element = $(`<div class="center overlay-window absolute fit-height flex-column flex-no-shrink">
      <div class="window-handle">Game summary</div>
      <div class="scroll summary flex-shrink"></div>
      <div class="flex-justify-center flex"><a class="button disconnect">Disconnect</a></div>
    </div>`);
        $table.appendTo($element.children(".summary"));
        $element.appendTo(document.body);
        $element.find(".disconnect").on("click touchstart", function() {
            window.location.reload();
        });
        return $table;
    },
    step(dt) {
        this.radius = Utils.moveTo(this.radius, this.targetRadius, Math.abs(this.targetRadius - this.radius) * dt);
        if (app.game.player)
            this.limitTribe();
    },
    limitTribe() {
        let r = this.radius - 16;
        let r2 = r * r;
        let t = app.game.player;
        if (Utils.distance2(0, 0, t.tx, t.ty) > r2) {
            let a = Utils.lookAt(0, 0, t.tx, t.ty);
            t.tx = Math.cos(a) * (r);
            t.ty = Math.sin(a) * (r);
        }
    },
    render() {},
    postrender() {
        let lw = Math.max(app.width / 2, this.radius)
        let lh = Math.max(app.height / 2, this.radius)
        let s = app.width / app.height;
        app.game.camera.limit = [-lw, -lh, lw, lh];
        app.painter.reset();
        app.painter.align(0.5, 0.5);
        app.gl.useProgram(app.programs.world_eclipse.native);
        app.programs.world_eclipse.set("radius", this.radius / app.width);
        app.programs.world_eclipse.set("border", 48 / app.width);
        app.programs.world_eclipse.set("x", -(app.game.camera.x + app.width / 2 | 0) / app.width);
        app.programs.world_eclipse.set("y", -(app.game.camera.y + app.width / 2 | 0) / app.width);
        app.painter.program(app.programs.world_eclipse);
        app.painter.color(0x000000, 0.8);
        app.painter.fillRect(app.width / 2, app.width / 2, app.width, app.width);
        if (this.shared.text) {
            app.painter.textAlign("center");
            app.painter.color(0xffffff);
            app.painter.font(app.fonts.default);
            app.painter.fillText(String(this.shared.text), app.width / 2, 32);
        }
    }
};
CLIENT.Game.Actions = {};
CLIENT.Game.Actions.transition = {
    enter(game) {
        if (game.cursor.range) {
            game.cursor.range[0] = game.cursor.frame;
            game.cursor.range[1] = game.cursor.data.frames;
        }
        game.cursor.loop = false;
        game.cursor.restart();
    },
    step(game, manager) {
        if (game.cursor.progress >= 1.0)
            manager.set("none");
        if (manager.elapsed >= 2.0)
            manager.set("none");
    },
    leave(game) {
        if (game.cursor.range) {
            game.cursor.range[0] = 0;
            game.cursor.range[1] = 0;
        }
    }
};
CLIENT.Game.Actions.none = {
    enter(game, manager) {
        manager.data.pressedEntity = null;
        manager.data.dragging = false;
    },
    canInteract(game) {
        if (game.hovered.ignoreDistance)
            return true;
        let pointer = game.pointer;
        if (Utils.distance(game.player, game.hovered) > COMMON.MAX_INTERACT_RADIUS)
            return game.deny("Too far"),
            false;
        return true;
    },
    interact(game, manager, e) {
        if (this.canInteract(game)) {
            game.hovered.interact();
            manager.data.hovered = null;
            manager.data.delay = 0.25;
            manager.data.state = 0;
        }
    },
    pointermove(game, manager, e) {
        if (manager.data.pressedEntity && manager.data.pressedEntity.drag) {
            if (!manager.data.dragging && Utils.distance(game.pointer, manager.data.dragPoint) > 10) {
                manager.data.dragging = true;
                if (manager.data.pressedEntity.dragstart)
                    manager.data.pressedEntity.dragstart(e);
            }
            if (manager.data.dragging)
                manager.data.pressedEntity.drag(e);
        }
    },
    pointerdown(game, manager, e) {
        manager.data.dragPoint = {
            x: game.pointer.x,
            y: game.pointer.y
        };
        if (game.hovered && !manager.data.pressedEntity && this.canInteract(game))
            manager.data.pressedEntity = game.hovered;
        if (game.hovered && game.hovered.pointerdown) {
            if (this.canInteract(game)) {
                game.hovered.pointerdown(e);
                manager.data.delay = 0.25;
                manager.data.state = 0;
            }
        }
    },
    pointerup(game, manager, e) {
        if (game.hovered && game.hovered.pointerup) {
            if (this.canInteract(game)) {
                game.hovered.pointerup(e);
                manager.data.delay = 0.25;
                manager.data.state = 0;
            }
        }
        if (manager.data.pressedEntity) {
            if (manager.data.dragging && manager.data.pressedEntity.dragend)
                manager.data.pressedEntity.dragend(e);
        }
        manager.data.pressedEntity = null;
        manager.data.dragging = false;
        manager.data.dragPoint = null;
    },
    step(game, manager, dt) {
        let STATE_GUI = 1;
        let STATE_INTERACT = 2;
        let state = 0;
        if (game.gui.hoveredElement)
            state = STATE_GUI;
        else if (game.hovered && game.hovered.clickable)
            state = STATE_INTERACT;
        else
            state = 0;
        if (manager.data.state !== state) {
            switch (state) {
            case STATE_INTERACT:
                game.cursor.set("interact");
                game.cursor.loop = true;
                game.cursor.duration = 0.5;
                break;
            default:
                game.cursor.set("point");
                break;
            }
            manager.data.state = state;
        }
        switch (state) {
        default:
            game.cursorFinalDirection = Utils.lookAt((app.width / 2 - app.pointer.x), app.height, 0, 0);
            break;
        }
    }
};
CLIENT.Game.Actions.buildWall = {
    enter(game, manager) {},
    pointerdown() {},
    pointerup(game, manager) {
        if (game.walls.canPlaceNode(game.pointer.gx, game.pointer.gy)) {
            manager.data.sx = game.pointer.gx;
            manager.data.sy = game.pointer.gy;
            manager.set("buildWallB");
            game.plink(game.pointer.gx * COMMON.GRID_WIDTH, game.pointer.gy * COMMON.GRID_HEIGHT);
        } else {
            manager.set("transition");
        }
    },
    render(game, manager) {
        let data = manager.data;
        let def = COMMON.items.stone_wall;
        app.painter.reset();
        let sx = Math.floor(game.camera.x / COMMON.GRID_WIDTH);
        let sy = Math.floor(game.camera.y / COMMON.GRID_HEIGHT);
        let sw = Math.floor(game.camera.width / COMMON.GRID_WIDTH);
        let sh = Math.floor(game.camera.height / COMMON.GRID_HEIGHT);
        app.painter.color(0xffffff);
        for (let x = sx; x <= sx + sw; x++) {
            for (let y = sy; y <= sy + sh; y++) {
                if (!game.walls.canPlaceNode(x, y))
                    continue;
                app.painter.fillCircle(x * COMMON.GRID_WIDTH, y * COMMON.GRID_HEIGHT, 2);
            }
        }
        let canPlace = game.walls.canPlaceNode(game.pointer.gx, game.pointer.gy);
        app.painter.color(canPlace ? 0xffffff : 0xff0000);
        app.painter.fillCircle(game.pointer.gx * COMMON.GRID_WIDTH, game.pointer.gy * COMMON.GRID_HEIGHT, 4);
        if (canPlace)
            game.renderCost([def.cost, def.resource, "+", def.maxHealth / COMMON.STRUCTURE_PER_WOOD, "wood"], game.pointer.xg, game.pointer.yg - 16);
    }
};
CLIENT.Game.Actions.buildWallB = {
    render(game, manager) {
        let def = COMMON.items.stone_wall;
        let sx = manager.data.sx;
        let sy = manager.data.sy;
        app.painter.reset();
        let pool = game.walls.getPossibleConnections(sx, sy);
        for (let pos of pool) {
            app.painter.reset();
            app.painter.color(0xffffff);
            app.painter.fillCircle(pos[0] * COMMON.GRID_WIDTH, pos[1] * COMMON.GRID_HEIGHT, 2);
        }
        let canPlace = game.walls.canConnect(sx, sy, game.pointer.gx, game.pointer.gy)
        app.painter.reset();
        app.painter.color(canPlace ? 0xffffff : 0xff0000);
        app.painter.fillCircle(game.pointer.gx * COMMON.GRID_WIDTH, game.pointer.gy * COMMON.GRID_HEIGHT, 4);
        app.painter.drawLine(sx * COMMON.GRID_WIDTH, sy * COMMON.GRID_HEIGHT, game.pointer.gx * COMMON.GRID_WIDTH, game.pointer.gy * COMMON.GRID_HEIGHT, 4);
        if (canPlace)
            game.renderCost([def.cost, def.resource, "+", def.maxHealth / COMMON.STRUCTURE_PER_WOOD, "wood"], game.pointer.xg, game.pointer.yg - 16);
    },
    pointerup(game, manager) {
        if (game.walls.canConnect(manager.data.sx, manager.data.sy, game.pointer.gx, game.pointer.gy)) {
            game.send("buildWall", {
                sx: manager.data.sx,
                sy: manager.data.sy,
                ex: game.pointer.gx,
                ey: game.pointer.gy
            });
            game.plink(game.pointer.gx * COMMON.GRID_WIDTH, game.pointer.gy * COMMON.GRID_HEIGHT);
            manager.data.sx = game.pointer.gx;
            manager.data.sy = game.pointer.gy;
            manager.set("transition");
        } else {
            manager.set("transition");
        }
    }
};
CLIENT.Game.Actions.buildOnWall = {
    enter(game, manager, key, sprite) {
        manager.data.sprite = sprite;
        manager.data.key = key;
    },
    render(game, manager) {
        for (let b of game.entities.groups.buildings) {
            if (!b.inView || !b.isWall)
                continue;
            if (!game.walls.canBuildOnWall(b))
                continue;
            if (b.children.length)
                continue;
            app.painter.reset();
            app.painter.color(0xffff00);
            app.painter.alpha(0.25);
            app.painter.drawSprite(b.sprite, b.x, b.y, 0, b.angleIndex);
        }
        let target = game.nearest(game.pointer.x, game.pointer.y, 50, function(e) {
            if (!e.isWall)
                return;
            return true;
        }, game.entities.groups.buildings);
        manager.data.target = target;
        if (target) {
            app.painter.reset();
            app.painter.drawSprite(manager.data.sprite, target.x, target.y, 0, target.angleIndex);
            let def = COMMON.items[manager.data.key];
            game.renderCost([def.cost, def.resource, "+", def.maxHealth / COMMON.STRUCTURE_PER_WOOD, "wood"], target.x, target.y - 16);
        }
    },
    postrender(game, manager) {},
    pointerup(game, manager) {
        if (manager.data.target) {
            let wall = manager.data.target;
            game.send("buildOnWall", {
                key: manager.data.key,
                wall_sid: wall.sid
            });
            game.plink(wall.x, wall.y);
        }
        manager.set("transition");
    }
};
CLIENT.Game.Actions.destroyBuilding = {
    enter(game, manager, key, sprite) {
        manager.data.sprite = sprite;
        manager.data.key = key;
    },
    render(game, manager) {
        let pool = Utils.filter(game.entities.groups.buildings, function(b) {
            if (!Utils.quickPointInRange(b.x, b.y, game.pointer.x, game.pointer.y, 48))
                return false;
            if (b.team !== game.player.team)
                return false;
            if (b.def.protected)
                return false;
            return true;
        });
        let building = Utils.nearest(app.game.pointer, pool);
        manager.data.building = building;
        if (building) {
            app.painter.reset();
            app.painter.color(0xff0000);
            app.painter.alpha(0.35);
            app.painter.drawSprite(building.sprite, building.x, building.y, 0, building.angleIndex);
            let def = building.def;
            game.renderCost([def.maxHealth, "gold"], building.x, building.y - 16);
        }
    },
    postrender(game, manager) {},
    pointerup(game, manager) {
        if (manager.data.building) {
            let building = manager.data.building;
            game.send("destroyBuilding", {
                building_sid: building.sid
            });
            game.plink(building.x, building.y);
        }
        manager.set("transition");
    }
};
CLIENT.Game.Actions.PlantAPlant = {
    enter(game, manager, key) {
        let def = COMMON.items[key];
        game.cursor.set("place");
        game.cursor.range = [0, 2];
        game.cursor.duration = 0.25;
        manager.data.key = key;
        manager.data.radius = def.obstacleRadius;
    },
    render(game, manager) {
        game.obstacles.renderObstacleLayer();
    },
    step(game) {
        game.cursorFinalDirection = Utils.lookAt(app.width * 0.1, app.pointer.y, 0, app.height / 2);
    },
    postrender(game, manager) {
        let def = COMMON.items[manager.data.key];
        let canPlace = game.obstacles.canPlant(game.pointer.x, game.pointer.y, manager.data.radius);
        app.painter.reset();
        app.painter.drawSprite("plant/sprout", app.pointer.x, app.pointer.y - 8, 0, 0);
        app.painter.alpha(0.25);
        app.painter.color(canPlace ? 0x66ff00 : 0xff0000);
        app.painter.fillCircle(app.pointer.x, app.pointer.y, manager.data.radius);
        if (canPlace) {
            game.renderCost([def.cost, def.resource], app.pointer.x, app.pointer.y + 16);
        }
    },
    pointerup(game, manager) {
        game.send("plantPlant", {
            x: game.pointer.x,
            y: game.pointer.y,
            key: manager.data.key
        });
        manager.set("transition");
    }
};
CLIENT.Game.Actions.buildOnMeadow = {
    enter(game, manager, key) {
        let def = COMMON.items[key];
        game.cursor.set("place");
        game.cursor.range = [0, 2];
        game.cursor.duration = 0.25;
        manager.data.key = key;
        manager.data.radius = def.obstacleRadius;
    },
    render(game, manager) {
        game.obstacles.renderObstacleLayer();
    },
    step(game) {
        game.cursorFinalDirection = Utils.lookAt(app.width * 0.1, app.pointer.y, 0, app.height / 2);
    },
    postrender(game, manager) {
        let def = COMMON.items[manager.data.key];
        let canPlace = game.obstacles.canPlant(game.pointer.x, game.pointer.y, manager.data.radius);
        app.painter.reset();
        app.painter.alpha(0.25);
        app.painter.color(canPlace ? 0x66ff00 : 0xff0000);
        app.painter.fillCircle(app.pointer.x, app.pointer.y, manager.data.radius);
        if (canPlace) {
            game.renderCost([def.cost, def.resource], app.pointer.x, app.pointer.y + 16);
        }
    },
    pointerup(game, manager) {
        game.send("buildOnMeadow", {
            x: game.pointer.x,
            y: game.pointer.y,
            key: manager.data.key
        });
        manager.set("transition");
    }
};
CLIENT.Game.Actions.buildAnywhere = {
    enter(game, manager, key) {
        let def = COMMON.items[key];
        game.cursor.set("place");
        game.cursor.range = [0, 2];
        game.cursor.duration = 0.25;
        manager.data.key = key;
        manager.data.radius = def.obstacleRadius;
    },
    render(game, manager) {
        game.obstacles.renderObstacleLayer();
    },
    step(game) {
        game.cursorFinalDirection = Utils.lookAt(app.width * 0.1, app.pointer.y, 0, app.height / 2);
    },
    postrender(game, manager) {
        let def = COMMON.items[manager.data.key];
        let canPlace = game.obstacles.canPlace(game.pointer.x, game.pointer.y, manager.data.radius);
        app.painter.reset();
        app.painter.alpha(0.25);
        app.painter.color(canPlace ? 0x66ff00 : 0xff0000);
        app.painter.fillCircle(app.pointer.x, app.pointer.y, manager.data.radius);
        if (canPlace) {
            game.renderCost([def.cost, def.resource], app.pointer.x, app.pointer.y + 16);
        }
    },
    pointerup(game, manager) {
        game.send("buildAnywhere", {
            x: game.pointer.x,
            y: game.pointer.y,
            key: manager.data.key
        });
        manager.set("transition");
    }
};
CLIENT.Game.Actions.buildOnNode = {
    enter(game, manager, key, sprite) {
        manager.data.sprite = sprite;
        manager.data.key = key;
    },
    render(game, manager) {
        for (let b of game.entities.groups.buildings) {
            if (!b.inView || !b.isNode)
                continue;
            if (b.children.length)
                continue;
            app.painter.reset();
            app.painter.color(0xffff00);
            app.painter.alpha(0.25);
            app.painter.drawSprite(b.sprite, b.x, b.y, 0, b.angleIndex);
        }
        let target = game.nearest(game.pointer.x, game.pointer.y, 24, function(e) {
            if (!e.isNode)
                return;
            if (e.children.length)
                return;
            return true;
        });
        manager.data.target = target;
        if (target) {
            app.painter.reset();
            app.painter.drawSprite(manager.data.sprite, target.x, target.y, 0, target.angleIndex);
            let def = COMMON.items[manager.data.key];
            game.renderCost([def.cost, def.resource, "+", def.maxHealth / COMMON.STRUCTURE_PER_WOOD, "wood"], target.x, target.y - 16);
        }
    },
    pointerup(game, manager) {
        if (manager.data.target) {
            let node = manager.data.target;
            game.send("buildOnNode", {
                key: manager.data.key,
                node_sid: node.sid
            });
            game.plink(node.x, node.y);
        }
        manager.set("transition");
    }
};
CLIENT.Game.Actions.snap = {
    enter(game, manager) {
        app.sound.play("snap")
        game.cursor.set("snap");
        game.cursor.duration = 0.25;
        manager.set("transition");
    },
    step(game, manager) {}
};
CLIENT.Game.Actions.moveTotem = {
    moving: 0,
    tooltips: false,
    enter(game, manager, totem) {
        manager.data.totem = totem;
        game.cursor.set("grip");
        game.cursor.range = [0, 4];
        game.cursor.duration = 0.25;
        this.moving = 0;
        manager.data.totem.lift();
        app.tween(game.cursor).discard().to({
            z: 24,
            offsetX: 4
        }, 0.1);
        totem.zIndex = 5;
    },
    leave(game, manager) {},
    step(game, manager, dt) {
        if (this.moving > 0) {
            this.moving -= dt;
            if (this.moving < 0) {}
        }
        if (this.soundLoop)
            this.soundLoop.gpan(game.pointer);
        game.cursorFinalDirection = Math.PI * 1.5;
        game.player.tx = game.pointer.x;
        game.player.ty = game.pointer.y;
        if (Utils.interval(game, "move", 0.1)) {
            game.send("move", {
                x: game.pointer.x,
                y: game.pointer.y
            });
        }
    },
    pointermove(game, manager) {
        let totem = manager.data.totem;
        if (this.moving <= 0) {}
        this.moving = 0.25;
    },
    pointerup(game, manager) {
        if (this.soundLoop) {
            this.soundLoop.fadeOut(0.25);
            this.soundLoop = null;
        }
        manager.data.totem.put();
        app.tween(game.cursor).discard().to({
            z: 0,
            offsetX: 0
        }, 0.5);
        manager.data.totem.zIndex = 1;
        game.send("move", {
            x: game.pointer.x,
            y: game.pointer.y
        });
        manager.set("transition");
    },
    postrender(game, manager) {}
};
CLIENT.Game.Actions.place_campfire = {
    oy: PLAYGROUND.MOBILE ? -32 : 0,
    enter(game, manager) {
        manager.data.campfire = new CLIENT.Image;
        manager.data.campfire.setTexture("spritesheet");
        manager.data.campfire.setRegion(0, 0, 17, 14);
        game.cursor.set("place");
        game.cursor.range = [0, 2];
        game.cursor.duration = 0.25;
    },
    postrender(game, manager) {
        let campfire = manager.data.campfire;
        campfire.x = app.pointer.x;
        campfire.y = app.pointer.y + this.oy;
        campfire.render();
    },
    leave(game, manager) {
        manager.data.campfire = null;
    },
    step(game, manager, dt) {
        game.cursorFinalDirection = Utils.lookAt(app.pointer.x, app.height, app.width / 2, 0);
        game.cursorFinalDirection = Utils.lookAt(app.width * 0.1, app.pointer.y, 0, app.height / 2);
    },
    pointerup(game, manager) {
        manager.set("transition");
        app.game.send("placeCampfire", {
            x: game.pointer.x,
            y: game.pointer.y
        });
    }
};
CLIENT.Game.Actions.stay = {
    oy: PLAYGROUND.MOBILE ? -32 : 0,
    inRange(x, y) {
        if (PLAYGROUND.MOBILE) {
            return Utils.quickPointInRange(x, y, app.game.pointer.x, app.game.pointer.y, 40);
        } else {
            return Utils.pointInRect(x, y, app.game.pointer.x - 16, app.game.pointer.y, 32, 32);
        }
    },
    appliesTo(e) {
        return (e instanceof CLIENT.Tribesman) && (e.group == app.game.player);
    },
    select() {
        let pool = Utils.filter(app.game.player.members, (tribesman)=>{
            if (!this.inRange(tribesman.x, tribesman.y))
                return;
            return true;
        }
        );
        if (!pool.length)
            return;
        return Utils.nearest(app.game.pointer, pool)
    },
    enter(game, manager) {
        game.cursor.set("thump");
        game.cursor.range = [2, 2];
        game.cursor.duration = 0.25;
    },
    postrender(game, manager) {},
    leave(game, manager) {},
    postrender(game) {
        app.painter.reset();
        app.painter.rotate(game.cursorFinalDirection);
        app.painter.align(0.0, 1.0);
        app.painter.drawImageRegion(app.textures.spritesheet, ...COMMON.items.stay.icon, app.pointer.x, app.pointer.y + this.oy);
    },
    step(game, manager, dt) {
        game.cursorFinalDirection = Utils.lookAt(app.pointer.x, app.pointer.y, app.width, app.height);
    },
    pointerup(game, manager) {
        if (manager.selection) {
            if (manager.selection.hooray)
                manager.selection.hooray();
            app.game.emote(manager.selection, "stay");
            app.game.send("stay", {
                target: manager.selection.sid
            });
        }
        game.cursor.duration = 0.25;
        app.sound.play("thump");
        manager.set("transition");
    }
};
CLIENT.Game.Actions.recruit = {
    enter(game, manager) {
        gtag('event', 'action_recruit');
        game.cursor.set("place");
        game.cursor.range = [0, 2];
        game.cursor.duration = 0.25;
    },
    leave(game) {
        game.cursor.rotation = 0;
    },
    oy: PLAYGROUND.MOBILE ? -32 : 0,
    postrender(game, manager) {
        let row = 2 + (Utils.saw((app.lifetime * 2.0) % 1.0) - 0.5) * 4.0;
        app.painter.reset();
        app.painter.color(0x000000);
        app.painter.values.alpha = 0.25;
        app.painter.values.scale.y = 0.75;
        app.painter.values.scale.x = 1.25;
        app.painter.drawSprite(`tribesman/male/legs_run`, app.pointer.x, app.pointer.y + 3 + this.oy, app.lifetime * 16, row);
        app.painter.drawSprite(`tribesman/male/stunned`, app.pointer.x, app.pointer.y + 32 + this.oy, app.lifetime * 16, row);
        app.painter.reset();
        app.painter.palette(0);
        app.painter.drawSprite(`tribesman/male/legs_run`, app.pointer.x, app.pointer.y + this.oy, app.lifetime * 16, row);
        app.painter.drawSprite(`tribesman/male/stunned`, app.pointer.x, app.pointer.y + this.oy, app.lifetime * 16, row);
        game.cursor.rotation = -row * 0.1;
    },
    step(game, manager, dt) {
        game.cursorFinalDirection = Utils.lookAt(app.pointer.x, app.height, app.width / 2, 0);
        game.cursorFinalDirection = Utils.lookAt(app.width * 0.1, app.pointer.y, 0, app.height / 2);
    },
    pointerup(game, manager) {
        manager.set("transition");
        app.game.send("recruit");
        app.game.nextTribesmanPosition = {
            x: game.pointer.x,
            y: game.pointer.y + 32 + this.oy
        };
    }
};
CLIENT.Game.Actions.equip = {
    inRange(x, y) {
        if (PLAYGROUND.MOBILE) {
            return Utils.quickPointInRange(x, y, app.game.pointer.x, app.game.pointer.y, 40);
        } else {
            return Utils.pointInRect(x, y, app.game.pointer.x - 16, app.game.pointer.y, 32, 32);
        }
    },
    appliesTo(e) {
        return (e instanceof CLIENT.Tribesman) && (e.group == app.game.player) && COMMON.canEquip(e, app.game.action.data.equipment);
    },
    select() {
        let pool = Utils.filter(app.game.player.members, (tribesman)=>{
            if (!COMMON.canEquip(tribesman, app.game.action.data.equipment))
                return false;
            if (!this.inRange(tribesman.x, tribesman.y))
                return;
            return true;
        }
        );
        if (!pool.length)
            return;
        return Utils.nearest(app.game.pointer, pool)
    },
    enter(game, manager, equipment) {
        gtag('event', 'action_equip');
        manager.data.equipment = equipment;
        game.cursor.set("place");
        game.cursor.range = [0, 2];
        game.cursor.duration = 0.25;
        game.pointer.alert = "cursorReach";
    },
    leave() {
        tribesman.game.pointer.alert = false;
    },
    postrender(game, manager) {
        let key = manager.data.equipment;
        let oy = 0;
        if (PLAYGROUND.MOBILE)
            oy = -32;
        app.painter.reset();
        app.painter.color(0x000000);
        app.painter.values.alpha = 0.25;
        app.painter.values.rotation = -1.0;
        app.painter.values.align.y = 0.6;
        app.painter.drawSprite(`tribesman/${key}/turntable`, app.pointer.x, app.pointer.y + 4 + oy, 4 + Math.sin(app.lifetime * 2) * 2.0);
        app.painter.reset();
        app.painter.drawSprite(`tribesman/${key}/turntable`, app.pointer.x, app.pointer.y + oy, 4 + Math.sin(app.lifetime * 2) * 2.0);
    },
    leave(game, manager) {
        manager.data.campfire = null;
        game.pointer.alert = null;
    },
    step(game, manager, dt) {
        game.cursorFinalDirection = Utils.lookAt(app.pointer.x, app.height, app.width / 2, 0);
        game.cursorFinalDirection = Utils.lookAt(app.width * 0.1, app.pointer.y, 0, app.height / 2);
    },
    pointerup(game, manager) {
        if (manager.selection) {
            if (manager.selection.hooray)
                manager.selection.hooray();
            app.game.send("equip", {
                key: app.game.action.data.equipment,
                target: manager.selection.sid
            });
        }
        manager.set("transition");
    }
};
CLIENT.Game.Tooltips = {
    totem(subject) {
        return subject.player ? "This is how your minions imagine you." : "Other god totem";
    },
    building(subject) {
        if (subject.shared.state_key === "wireframe")
            return "This is just a wireframe.\nYou need wood and a builder with a hammer to finish it";
        let def = COMMON.items[subject.shared.key];
        if (def && def.tooltip)
            return def.tooltip + "\n" + def.subtip;
        if (subject.shared.key === "wood_storage")
            return "┌ Take wood | ┐ Put wood";
        else if (subject.shared.key === "well")
            return "┌ Take water | ┐ Put water";
        else if (subject.shared.key === "windmill")
            return "Are you hungry? I can sell you a loaf of bread for a coin.";
        else if (subject.shared.key === "lumberjack")
            return "Ahoy! I am always short on wood. I will give you a gold coin for one piece of wood.";
    },
    mushroom(subject) {
        return "I am not sure if it is edible...";
    },
    rocks(subject) {
        if (app.game.player.canMine) {
            return "These rocks are almost as old as me.";
        } else {
            return "If we had a hammer...";
        }
    },
    tree(subject) {
        if (app.game.player.canLumber) {
            return "A Tree. A home for many.";
        } else {
            return "A Tree. A home for many.";
        }
    },
};
CLIENT.GameMessageHandler = {
    inspect(game, data) {
        console.log("-- inspect --");
        console.log(data.constructorName);
        console.log(data);
    },
    console(game, data) {
        console.log(data.text);
    },
    DominationMode(game, data) {
        console.log("DOMINATION", data);
    },
    BattleRoyaleMode(game, data) {
        game.controller.update(data);
    },
    deny(game, data) {
        game.deny(data.text);
    },
    data(game, data) {
        game.data[data.key] = data.value;
    },
    setFollow(game, data) {
        let entity = game.entities.sid(data.entity_sid);
        if (!entity)
            return;
        game.camera.setFollow(entity);
        game.camera.limiter = null;
    },
    die(game, data) {
        let entity = game.entities.sid(data.entity_sid);
        if (!entity)
            return;
        let killer = game.entities.sid(data.killer_sid);
        if (!killer)
            return;
        if (entity.getScore && killer.group && killer.group === game.player) {
            game.score(entity.getScore(), entity.x, entity.y - 16);
        }
    },
    quick_chat(game, data) {
        let entity = game.entities.sid(data.entity_sid);
        if (!entity)
            return;
        if (!entity.inView)
            return;
        entity.say(data.text);
    },
    poison(game, data) {
        let entity = game.entities.sid(data.entity);
        if (!entity)
            return;
        if (!entity.inView)
            return;
        let debris = game.entities.add("Sprite");
        debris.set("fx/poison");
        debris.follow = entity;
        debris.duration = 1.5;
        debris.zIndex = 3;
        debris.offsetY = -16;
        app.sound.play("human/poisoned").rate(1.5).gpan(entity);
        if (entity.group === game.player) {
            game.showTooltip("This one was poisonous. I should finally learn all the mushrooms.");
            game.tooltip.color.set(0xdd4400, 0.8);
            game.tooltipLifespan = 3.0;
        }
    },
    eat(game, data) {
        let entity = game.entities.sid(data.entity);
        let campfire = game.entities.sid(data.campfire);
        if (!campfire || !entity)
            return;
        if (!campfire.inView)
            return;
        let food = COMMON.items.food;
        let image = game.entities.add("Image");
        image.setTexture("spritesheet");
        image.setRegion(...food.sprite);
        image.x = campfire.x;
        image.y = campfire.y;
        image.systemShadow = 4;
        image.zIndex = 1;
        app.tween(image).to({
            z: 30
        }, 0.25, "outSine").to({
            z: 0
        }, 0.35, "inSine");
        app.tween(image).to({
            x: entity.x,
            y: entity.y,
            rotation: 6.14
        }, 0.6);
        image.lifespan = 0.6;
        app.sound.play("human/eat_" + Utils.random(1, 3)).delay(0.6).gpan(entity).rrate(0.1);
        let debris = game.entities.add("Sprite");
        debris.set("fx/blink");
        debris.follow = image;
        debris.duration = 0.25;
        debris.scale.x = 0.5;
        debris.scale.y = 0.5;
        debris.zIndex = 2;
        debris.delay = 0.6;
        app.tween(entity).to({
            timeScale: 1.0
        }, 1.0);
    },
    resources(game, data) {
        Object.assign(game.guiResources.count, data);
        game.playerData.resources = data;
        game.guiResources.refreshText();
        game.updateButtons();
    },
    attack(game, data) {
        let attacker = game.entities.sid(data.attacker);
        if (attacker.inView) {
            attacker.state.set("attack");
        }
    },
    demolish(game, data) {
        let attacker = game.entities.sid(data.attacker);
        if (attacker.inView) {
            attacker.state.set("attack");
        }
    },
    block(game, data) {
        let defender = game.entities.sid(data.defender);
        if (!defender.inView)
            return;
        if (defender) {
            defender.state.set("block");
        }
        let attacker = game.entities.sid(data.attacker);
        if (attacker) {
            attacker.state.set(Math.random() > 0.5 ? "fallBack" : "hurt");
        }
    },
    chop(game, data) {
        let attacker = game.entities.sid(data.attacker);
        if (attacker.inView) {
            attacker.state.set("chop");
        }
    },
    harvest(game, data) {
        let attacker = game.entities.sid(data.attacker);
        if (attacker.inView) {
            attacker.state.set("harvest");
        }
    },
    mine(game, data) {
        let attacker = game.entities.sid(data.attacker);
        if (attacker.inView) {
            attacker.state.set("mine");
        }
    },
    build(game, data) {
        let builder = game.entities.sid(data.builder);
        if (builder.inView) {
            builder.state.set("build");
        }
    },
    shoot(game, data) {
        let attacker = game.entities.sid(data.attacker);
        if (attacker && attacker.inView) {
            attacker.state.set("shoot", data);
        }
    },
    hit(game, data) {
        let entity = game.entities.sid(data.entity);
        if (!entity)
            return;
        entity.onHit(data);
    },
    fire(game, data) {
        let attacker = game.entities.sid(data.attacker);
        let defender = game.entities.sid(data.defender);
        if (!attacker || !defender)
            return;
        let bullet = game.entities.add("Bullet");
        bullet.x = bullet.ex = attacker.x;
        bullet.y = bullet.ey = attacker.y;
        bullet.target = defender;
        bullet.duration = data.duration;
        bullet.run();
    },
    key(game, data) {
        game.sharer.setKeys(data);
    },
    update(game, data) {
        if (data.sharedKeys) {
            game.sharer.setKeys(data.sharedKeys);
        }
        data.entities.forEach(game.updateSharedEntity, game);
        game.parseQueue(data.queue);
    },
    snapshot(game, data) {
        game.start(data);
    },
    setPlayer(game, data) {
        let player = game.entities.sid(data);
        game.setPlayer(player);
    },
    speed(game, data) {
        game.speed = data;
        document.title = data;
    },
    fx(game, data) {
        let entity = game.entities.sid(data.entity_sid);
        if (!entity || !entity.inView)
            return;
        app.sound.play("fish/piranha_bite").gpan(entity).rate(2.5).rrate(0.1);
        app.sound.play("fish/piranha_miss").gpan(entity).rate(1.4).rrate(0.3).volume(0.6);
        let bubble = entity.collection.add("Sprite");
        bubble.set("fx/bubble");
        bubble.x = entity.x;
        bubble.y = entity.y;
        bubble.duration = 1.0;
        bubble.scale.x = 2.0;
        bubble.scale.y = 2.0;
    },
    private_data(game, data) {
        if (data.score !== undefined)
            game.addScore(data.score - game.privateData.score);
        Object.assign(game.privateData, data);
    }
};
CLIENT.Game.fxDebris = function(x, y) {
    let debris = this.entities.add("Image");
    debris.setTexture("spritesheet");
    debris.setRegion(...Utils.random(app.data.debris));
    debris.x = x;
    debris.y = y;
    this.manipulate(debris, CLIENT.Manipulators.debris, {});
    this.manipulate(debris, CLIENT.Manipulators.force, {
        direction: Math.random() * Math.TAU,
        force: Utils.random(200, 300),
        damping: 250
    });
}
;
CLIENT.Game.fxSpark = function(object, type) {
    let spark = this.entities.add("Sprite");
    spark.x = object.x;
    spark.y = object.y;
    spark.set("spark/" + type)
    spark.duration = 0.5;
    this.manipulate(spark, CLIENT.Manipulators.follow, {
        follow: object
    });
}
;
var $_GET = {};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    $_GET[key] = value;
});
var $_HASH = {};
window.location.hash.replace(/[#&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    $_HASH[key] = value;
});
var app = new PLAYGROUND.Application({
    sprites: {},
    shouldUsePalette(url) {
        return url.indexOf("tribesman/") > -1 || url.indexOf("rabbit/") > -1;
    },
    fitElementIntoWindow(element) {
        let $element = $(element);
        setTimeout(function() {
            if ($element.outerHeight() > window.innerHeight) {
                var scale = window.innerHeight / ($element.outerHeight() + 32);
                $element.css("transform", `translate(-50%, -50%) scale(${scale})`);
            }
        }, 1000);
    },
    create() {
        this.iog = new InstantOnlineGaming();
        this.ad = new PLAYGROUND.Ad();
        this.ad.threshold = 3;
        this.isOwn = $_GET['referrer'] === "wanderers.io" || !$_GET['referrer'];
        this.mouse.releaseButtonsWhenOffscreen = false;
        if (!window.gtag)
            window.gtag = function() {}
            ;
        this.paths.rewriteURL = window.REWRITE_URL ? window.REWRITE_URL : {};
        this.dataSource = window.JSONS || {};
        this.tempCanvas = document.createElement("canvas");
        this.tempCanvas.ctx = this.tempCanvas.getContext("2d");
        this.canvas = document.createElement("canvas");
        this.canvas.width = window.innerWidth / 2 | 0;
        this.canvas.height = window.innerHeight / 2 | 0;
        this.canvas.classList.toggle("main", true);
        document.body.appendChild(this.canvas);
        this.gl = this.canvas.getContext('webgl', {
            alpha: false,
            antialias: false,
            premultipliedAlpha: false,
            depth: false,
            stencil: false
        });
        let gl = this.gl;
        this.painter = new PLAYGROUND.Painter(this);
        gl.disable(gl.DEPTH_TEST);
        this.loadData("<common/data/shared.json> shared");
        this.loadData("<common/data/ships.json> ships");
        this.loadProgram("sprite", "sprite_vertex", "sprite_fragment");
        this.loadProgram("polygon", "polygon_vertex", "polygon_fragment");
        this.loadProgram("ship", "ship_vertex", "ship_fragment");
        this.loadProgram("gui", "gui_vertex", "gui_fragment");
        this.loadProgram("text", "gui_vertex", "text_fragment");
        this.loadProgram("circle", "circle_vertex", "circle_fragment");
        this.loadProgram("world_edge", "circle_vertex", "world_edge_fragment");
        this.loadProgram("world_eclipse", "rect_vertex", "world_eclipse_fragment");
        this.loadProgram("meadow", "circle_vertex", "meadow_fragment");
        this.loadProgram("rect", "rect_vertex", "rect_fragment");
        this.loadProgram("damage", "image_vertex", "damage_fragment");
        this.paletteMap = {};
        for (let i = 0; i < cq.palettes.db32.length; i++) {
            let color = cq.palettes.db32[i];
            this.paletteMap[color] = cq.color([i * 256 / 32, 0, 0]).toHex();
        }
        this.loadTexture("damage");
        this.loadTexture("leaderboards");
        this.loadTexture("spritesheet");
        this.loadTexture("spritesheet_p", {
            usePalette: true
        });
        this.loadTexture(`<textures/${COMMON.PALETTE}> palette`);
        this.loadTexture("bg1");
        this.loadTexture("grass_tile");
        this.loadTexture("checkerboard");
        this.loadTexture("planet1");
        this.loadTexture("grid");
        this.loadTexture("map_edge");
        this.loadTexture("map_edge_vegetation");
        this.loadTexture("water/water1");
        this.loadTexture("noise");
        this.loadImage("<textures/spritesheet.png> spritesheet");
        this.loadData("debris");
        this.loadSprite("building/stone_wall_short");
        this.loadSprite("building/stone_wall_long");
        this.loadSprite("building/stone_wall_short_wireframe");
        this.loadSprite("building/stone_wall_long_wireframe");
        this.loadSprite("building/stone_node");
        this.loadSprite("building/stone_node_wireframe");
        this.loadSprite("building/stone_tower");
        this.loadSprite("building/stone_tower_wireframe");
        this.loadSprite("building/stone_gate");
        this.loadSprite("building/stone_gate_wireframe");
        this.loadSprite("building/stationary_catapult");
        this.loadSprite("building/stationary_catapult_wireframe");
        this.loadSprite("building/wood_storage");
        this.loadSprite("building/well");
        this.loadSprite("building/food_storage");
        this.loadSprite("building/windmill");
        this.loadSprite("building/lumberjack");
        this.sound = this.audio.channel("sound");
        if (this.sound.compressor) {
            app.sound.compressor.threshold.value = -10;
            app.sound.compressor.knee.value = 10;
        }
        this.music = this.audio.channel("music");
        this.music.compressorEnabled = false;
        this.music.route();
        this.initNGon(4);
        this.initNGon(8);
        this.initNGon(16);
        this.initNGon(24);
        this.initNGon(32);
        {
            let vertices = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
            let meshBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            this.quad = meshBuffer;
        }
    },
    adStart() {
        if (app.sound.reconnect) {
            app.sound.disconnect();
            app.music.disconnect();
        }
    },
    adEnd() {
        if (app.sound.reconnect) {
            app.sound.reconnect();
            app.music.reconnect();
        }
    },
    initNGon(sides) {
        let gl = this.gl;
        if (!this.ngons)
            this.ngons = Object.create(null);
        let temp = [];
        let angleStep = Math.TAU / sides;
        for (var i = 0; i < sides; i++) {
            temp.push(0.5 + Math.cos(i * angleStep) * 0.5, 0.5 + Math.sin(i * angleStep) * 0.5);
        }
        let vertices = new Float32Array(temp);
        let meshBuffer = gl.createBuffer();
        let indicesBuffer = gl.createBuffer();
        let indices = new Uint16Array(earcut(temp));
        indicesBuffer.count = indices.length;
        gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        this.ngons[sides] = {
            mesh: meshBuffer,
            indices: indicesBuffer
        };
    },
    resize() {
        let scale = 1;
        if (window.innerHeight < 480) {
            scale = window.innerHeight / 216;
        } else {
            scale = Math.max(1, Math.ceil(window.innerWidth / 639));
            scale = Math.min(scale, 3);
        }
        var ww = window.innerWidth;
        var wh = window.innerHeight;
        if (app.forceScale)
            scale = app.forceScale;
        var vs = window.innerWidth / scale;
        var s = 1.0;
        var w = 0;
        var h = 0;
        if (ww > wh) {
            s = vs / ww;
            w = vs;
            h = wh * s;
        } else {
            s = vs / wh;
            w = ww * s;
            h = vs;
        }
        if (this.canvas) {
            this.canvas.width = w;
            this.canvas.height = h;
            this.canvas.style.transform = "scale(" + (1 / s) + ")";
            this.canvas.style.transformOrigin = "left top";
            this.width = w;
            this.height = h;
            this.scale = 1 / s;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.pixelWidth = 1.0 / this.width;
            this.pixelHeight = 1.0 / this.height;
        }
    },
    ready() {
        $(".banner-ad").css("top", "-1000px");
        this.fonts = {};
        this.fonts.default = new CLIENT.BitmapFont(this.images.spritesheet,[0, 231, 222, 11, "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTt()[]?"],[0, 243, 222, 11, "UuVvWwXxYyZz0123456789.,|!\"/-+_%*❤Ã┌┐┼"]);
        this.fonts.small = new CLIENT.BitmapFont(this.images.spritesheet,[0, 191, 101, 8, "abcdefghijklmnopqrstuvwxyz"],[0, 201, 180, 8, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?()[]/:'"]);
        this.fonts.fat = new CLIENT.BitmapFont(this.images.spritesheet,[0, 220, 55, 9, "0123456789"]);
        this.fonts.small_shadeless = new CLIENT.BitmapFont(this.images.spritesheet,[0, 255, 101, 8, "abcdefghijklmnopqrstuvwxyz"],[0, 265, 173, 8, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?()[]/"]);
        this.game = CLIENT.Game;
        fetch("client/server").then(function(response) {
            return response.text()
        }).then((url)=>{
            if (!url) {} else {
                CLIENT.Game.server_url = url;
                this.setState(CLIENT.Lobby);
            }
        }
        );
    },
    pointerdown(e) {},
    pointermove(e) {},
    step(dt) {},
    prerender() {}
});
PLAYGROUND.Application.prototype.promises = {};
SoundOnDemand.Sound.prototype.gpan = function(o) {
    var distX = (o.x - app.game.camera.center.x) / (app.width * 0.5);
    var distY = Math.abs((o.y - app.game.camera.center.y) / (app.width * 0.5));
    var pan = distX;
    this.pan(pan || 0);
    return this;
}
{
    if (Utils.intToHexColor) {
        for (let s of COMMON.TEAM_COLOR) {
            for (let key in s) {
                s[key + _ + "hex"] = Utils.intToHexColor(s[key]);
            }
        }
    }
}
