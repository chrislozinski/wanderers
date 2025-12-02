//utils
Utils = {
    hexToString(hex) {
        return "#" + hex.toString(16);
    },
    intToHexColor(hex) {
        let a = this.intToRGBA(hex);
        return "#" + (a[0] * 255).toString(16).padStart(2, "0") + (a[1] * 255).toString(16).padStart(2, "0") + (a[2] * 255).toString(16).padStart(2, "0");
    },
    intToRGBA(color) {
        let temp = [];
        temp[0] = (color / 65536 % 256 | 0) / 255.0;
        temp[1] = (color / 256 % 256 | 0) / 255.0;
        temp[2] = (color % 256) / 255.0;
        temp[3] = 1.0;
        return temp;
    },
    RGBToInt(rgb) {
        return rgb[2] * 255 | (rgb[1] * 255 << 8) | (rgb[0] * 255 << 16);
    },
    arrayCall(array, methodName, a=0, b=0, c=0) {
        for (let i = 0; i < array.length; i++)
            array[i][methodName](a, b, c);
    },
    arraySet(array, propertyName, value) {
        for (let i = 0; i < array.length; i++)
            array[i][propertyName] = value;
    },
    pullOne(array, element) {
        let index = array.indexOf(element);
        if (index < 0)
            return;
        array.splice(index, 1);
    },
    hash: function(string) {
        var hash = 0, i, chr;
        if (string.length === 0)
            return hash;
        for (i = 0; i < string.length; i++) {
            chr = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    },
    dcopy: function(o) {
        return JSON.parse(JSON.stringify(o));
    },
    escapeHTML: function(s) {
        return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    unescapeHTML: function(s) {
        return s.replace('&amp;', '&').replace('&quot;', '"').replace('&lt;', "<").replace('&gt;', ">");
    },
    captureTrace: function() {
        try {
            throw new Error();
        } catch (e) {
            return JSON.stringify(e.stack, null, 2);
        }
    },
    ucfirst: function(str) {
        return str[0].toUpperCase() + str.slice(1);
    },
    dirrow: function(direction, angles) {
        angles = angles || 8;
        var fo = -0.5 * Math.TAU / angles;
        return (Utils.circWrap(direction - fo) / Math.TAU) * angles | 0;
    },
    dirrowp: function(direction, angles) {
        direction = Utils.atan2(Math.sin(direction) * 1.456, Math.cos(direction));
        angles = angles || 8;
        var fo = -0.5 * Math.TAU / angles;
        return (Utils.circWrap(direction - fo) / Math.TAU) * angles | 0;
    },
    tryParseJSON: function(json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    },
    repeatInterval: function(callback, times, interval) {
        callback();
        var counter = 1;
        if (counter >= times)
            return;
        var timer = setInterval(function() {
            callback(counter++);
            if (counter >= times) {
                clearInterval(timer);
            }
            ;
        }, interval * 1000);
    },
    create: function(prototype, args) {
        var object = Object.create(prototype);
        return this.extend(object, args);
    },
    strTemplate: function(str, obj) {
        return str.replace(/{(\w+)}/g, function(_, k) {
            return obj[k];
        });
    },
    urlTemplate: function(template, data) {
        for (var key in data) {
            var value = encodeURIComponent(data[key]);
            template = template.replace("{" + key + "}", value);
        }
        return template;
    },
    existend: function() {
        var result = Utils.extend({}, arguments[0]);
        for (var key in result) {
            for (var i = 1; i < arguments.length; i++) {
                if (!arguments[i])
                    continue;
                var value = arguments[i][key];
                if (value !== undefined)
                    result[key] = value;
            }
        }
        return result;
    },
    cycle: function(array) {
        array.push(array.shift());
        return array[0];
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
    distance2: function(x1, y1, x2, y2) {
        if (arguments.length > 2) {
            var dx = x1 - x2;
            var dy = y1 - y2;
            return dx * dx + dy * dy;
        } else {
            var dx = x1.x - y1.x;
            var dy = x1.y - y1.y;
            return dx * dx + dy * dy;
        }
    },
    limit: function(value, min, max) {
        return value < min ? min : value > max ? max : value;
    },
    nearest: function(from, entities) {
        var min = -1;
        var result = null;
        for (var i = 0; i < entities.length; i++) {
            var to = entities[i];
            if (from === to)
                continue;
            var distance = this.distance2(from, to);
            if (distance < min || min < 0) {
                min = distance;
                result = to;
            }
        }
        return result;
    },
    nearestxy: function(x, y, entities) {
        var min = -1;
        var result = null;
        for (var i = 0; i < entities.length; i++) {
            var to = entities[i];
            var distance = this.distance2(x, y, to.x, to.y);
            if (distance < min || min < 0) {
                min = distance;
                result = to;
            }
        }
        return result;
    },
    sign: function(value) {
        return value == 0 ? 0 : value / Math.abs(value);
    },
    sincos: function(angle, radius) {
        if (arguments.length === 1) {
            var a = Math.random() * 6.28;
            return {
                x: Math.cos(a) * angle,
                y: Math.sin(a) * angle
            };
        } else {
            return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            };
        }
    },
    ground: function(num, threshold) {
        return (num / threshold | 0) * threshold;
    },
    thresholdFloor: function(num, threshold) {
        return (num / threshold | 0) * threshold;
    },
    thresholdCeil: function(num, threshold) {
        return Math.ceil(num / threshold) * threshold;
    },
    groundAngle: function(direction, angles) {
        angles = angles || 8;
        var fo = -0.5 * Math.TAU / angles;
        return Utils.ground(direction - fo, Math.TAU / angles);
    },
    rotate: function(pointX, pointY, originX, originY, angle) {
        return [originX + (pointX - originX) * Math.cos(angle) - (pointY - originY) * Math.sin(angle), originY + (pointX - originX) * Math.sin(angle) + (pointY - originY) * Math.cos(angle)];
    },
    pointInRect: function(x, y, rx, ry, rw, rh) {
        return !(x < rx || y < ry || x >= rx + rw || y >= ry + rh);
    },
    pointInEllipse: function(px, py, ex, ey, ew, eh) {
        let dx = px - ex;
        let dy = py - ey;
        return (dx * dx) / (ew * ew) + (dy * dy) / (eh * eh) <= 1;
    },
    rectInRect: function(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
        return !(r2x > r1x + r1w || r2x + r2w < r1x || r2y > r1y + r1h || r2y + r2h < r1y);
    },
    pointInRotatedRect: function(pointX, pointY, rectX, rectY, rectWidth, rectHeight, rotation) {
        var x = rectX + (pointX - rectX) * Math.cos(-rotation) - (pointY - rectY) * Math.sin(-rotation);
        var y = rectY + (pointX - rectX) * Math.sin(-rotation) + (pointY - rectY) * Math.cos(-rotation);
        return this.pointInRect(x, y, rectX - rectWidth / 2, rectY - rectHeight / 2, rectWidth, rectHeight);
    },
    quickPointInRange: function(ax, ay, bx, by, range) {
        if (Math.abs(ax - bx) > range)
            return false;
        if (Math.abs(ay - by) > range)
            return false;
        return true;
    },
    pointInPolygon: function(x, y, vertices) {
        var inside = false;
        for (var i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            var xi = vertices[i][0]
              , yi = vertices[i][1];
            var xj = vertices[j][0]
              , yj = vertices[j][1];
            var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect)
                inside = !inside;
        }
        return inside;
    },
    atan2: function(y, x) {
        if (y === 0 && x === 0)
            return 0;
        var r;
        var ax = Math.abs(x);
        var ay = Math.abs(y);
        var a = Math.min(ax, ay) / Math.max(ax, ay);
        var s = a * a;
        r = ((-0.0464964749 * s + 0.15931422) * s - 0.327622764) * s * a + a
        if (ay > ax)
            r = 1.57079637 - r;
        if (x < 0)
            r = 3.14159274 - r;
        if (y < 0)
            r = -r;
        return r;
    },
    lookAt: function(a, b, c, d) {
        if (arguments.length > 2) {
            var angle = this.atan2(d - b, c - a);
            if (angle < 0)
                angle = Math.PI * 2 + angle;
        } else {
            var angle = this.atan2(b.y - a.y, b.x - a.x);
            if (angle < 0)
                angle = Math.PI * 2 + angle;
        }
        return angle;
    },
    atanxy: function(x, y) {
        var angle = Math.atan2(y, x);
        if (angle < 0)
            angle = Math.PI * 2 + angle;
        return angle;
    },
    moveTo: function(value, target, step) {
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
    },
    circWrap: function(val) {
        while (val >= Math.PI * 2)
            val -= Math.PI * 2;
        while (val < 0)
            val += Math.PI * 2;
        return val;
    },
    wrap: function(value, min, max) {
        if (value < min) {
            return max + (value - min);
        }
        if (value >= max) {
            return min + (value - max);
        }
        return value;
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
    circWrapTo: function(value, target, step) {
        return this.wrapTo(value, target, Math.PI * 2, step);
    },
    circDistance: function(a, b) {
        return this.wrappedDistance(a, b, Math.PI * 2);
    },
    circDistanceAbs: function(a, b) {
        return Math.abs(this.wrappedDistance(a, b, Math.PI * 2));
    },
    circDistanceFactor: function(a, b) {
        return Math.abs(this.wrappedDistance(a, b, Math.PI * 2)) / Math.PI;
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
    randomPolygon: function(vertices, scale) {
        var angleStep = Math.PI * 2 / vertices;
        var polygon = [];
        var angleOffset = Math.PI * 2 * Math.random();
        for (var i = 0; i < vertices; i++) {
            var angle = angleOffset + i * angleStep - Math.random() * angleStep * 0.5;
            var r = 0.5 + Math.random() * 0.5;
            var x = Math.cos(angle) * r;
            var y = Math.sin(angle) * r;
            polygon.push([x * scale, y * scale]);
        }
        return polygon;
    },
    seed: function(value) {
        var seed = value;
        for (var i = 0; i < (value % 1000); i++)
            seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    },
    randomf: function(a, b) {
        return a + (b - a) * Math.random();
    },
    random: function(a, b) {
        if (a === undefined) {
            return Math.random();
        } else if (b !== undefined) {
            return Math.floor(a + Math.random() * Math.abs(b - a + 1));
        } else {
            if (a instanceof Array)
                return a[(a.length + 1) * Math.random() - 1 | 0];
            else {
                return a[this.random(Object.keys(a))];
            }
        }
    },
    randomSign: function() {
        return Math.random() > 0.5 ? -1 : 1;
    },
    signedRandom: function(max) {
        return Math.random() * max * (Math.random() > 0.5 ? -1 : 1);
    },
    lerp(a, b, factor=0.5) {
        if (typeof a === "number") {
            return a + (b - a) * factor;
        } else if (a instanceof Array) {
            let result = [];
            for (let i = 0; i < a.length; i++) {
                result[i] = this.lerp(a[i], b[i], factor);
            }
            return result;
        } else {
            return {
                x: this.lerp(a.x, b.x, factor),
                y: this.lerp(a.y, b.y, factor)
            };
        }
    },
    interpolatePoints: function(ax, ay, bx, by, f) {
        return [f * ax + (1 - f) * bx, f * ay + (1 - f) * by];
    },
    lineCircleIntersection: function(ax, ay, bx, by, cx, cy, r) {
        var result = {
            inside: false,
            tangent: false,
            intersects: false,
            enter: null,
            exit: null
        };
        var a = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
        var b = 2 * ((bx - ax) * (ax - cx) + (by - ay) * (ay - cy));
        var cc = cx * cx + cy * cy + ax * ax + ay * ay - 2 * (cx * ax + cy * ay) - r * r;
        var deter = b * b - 4 * a * cc;
        result.distance = Math.sqrt(a);
        if (deter <= 0) {
            result.inside = false;
        } else {
            var e = Math.sqrt(deter);
            var u1 = (-b + e) / (2 * a);
            var u2 = (-b - e) / (2 * a);
            if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
                if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
                    result.inside = false;
                } else {
                    result.inside = true;
                }
            } else {
                if (0 <= u2 && u2 <= 1) {
                    result.enter = this.interpolatePoints(ax, ay, bx, by, 1 - u2);
                }
                if (0 <= u1 && u1 <= 1) {
                    result.exit = this.interpolatePoints(ax, ay, bx, by, 1 - u1);
                }
                result.intersects = true;
                if (result.exit != null && result.enter != null && result.exit[0] == result.enter[0] && result.exit[1] == result.enter[1]) {
                    result.tangent = true;
                }
            }
        }
        return result.intersects ? result : false;
    },
    lineCircleCollision: function(ax, ay, bx, by, cx, cy, r) {
        var result = false;
        var a = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
        var b = 2 * ((bx - ax) * (ax - cx) + (by - ay) * (ay - cy));
        var cc = cx * cx + cy * cy + ax * ax + ay * ay - 2 * (cx * ax + cy * ay) - r * r;
        var deter = b * b - 4 * a * cc;
        if (deter <= 0) {} else {
            var e = Math.sqrt(deter);
            var u1 = (-b + e) / (2 * a);
            var u2 = (-b - e) / (2 * a);
            if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {} else {
                result = true;
            }
        }
        return result;
    },
    repulse: function(a, b, radius) {
        var angle = this.lookAt(b, a);
        a.x = b.x + Math.cos(angle) * radius;
        a.y = b.y + Math.sin(angle) * radius;
    },
    interval: function(object, key, interval) {
        if (!object.throttles)
            object.throttles = {};
        if (!object.throttles[key])
            object.throttles[key] = -interval;
        if (object.lifetime - object.throttles[key] >= interval) {
            object.throttles[key] = object.lifetime;
            return true;
        } else
            return false;
    },
    intervalRange: function(object, key, min, max) {
        if (!object.throttles)
            object.throttles = {};
        if (!object.throttles[key])
            object.throttles[key] = object.lifetime - max;
        if (object.throttles[key] - object.lifetime <= 0) {
            object.throttles[key] = object.lifetime + Utils.randomf(min, max);
            return true;
        } else
            return false;
    },
    onceAfter: function(key, wait, object) {
        if (!object.onceAfters)
            object.onceAfters = {};
        if (!object.onceAfters[key])
            object.onceAfters[key] = object.lifetime - wait;
        if (object.lifetime - object.onceAfters[key] >= wait) {
            object.onceAfters[key] = object.lifetime;
            return true;
        } else {
            object.onceAfters[key] = object.lifetime;
            return false;
        }
    },
    updateBox: function(e, radius) {
        if (!e.box)
            e.box = [];
        e.box[0] = e.x - radius;
        e.box[1] = e.y - radius;
        e.box[2] = radius * 2;
        e.box[3] = radius * 2;
    },
    saw: function(t) {
        if (t < 0.5) {
            return t / 0.5;
        } else {
            return 1 - (t - 0.5) / 0.5;
        }
    },
    vecNormalize: function(v) {
        var d = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        return [v[0] / d, v[1] / d];
    },
    vecDot: function(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    },
    vecSub: function(a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    },
    getDirectionKey: function(direction) {
        if (direction === 0)
            return "right";
        else if (direction === Math.PI * 0.5)
            return "down";
        else if (direction === Math.PI * 1.0)
            return "left";
        else if (direction === Math.PI * 1.5)
            return "up";
    },
    offsetToDirectionKey: function(ox, oy) {
        if (ox < 0)
            return "left";
        if (ox > 0)
            return "right";
        if (oy < 0)
            return "up";
        if (oy > 0)
            return "down";
    },
    minValue: function(collection, test) {
        var min = false;
        if (collection instanceof Array) {
            for (var i = 0; i < collection.length; i++) {
                var value = test(collection[i]);
                if (min === false || value < min)
                    min = value;
            }
        } else {
            for (var key in collection) {
                var value = test(collection[key]);
                if (min === false || value < min)
                    min = value;
            }
        }
        return min;
    },
    maxValue: function(collection, test) {
        var max = false;
        if (collection instanceof Array) {
            for (var i = 0; i < collection.length; i++) {
                var value = test(collection[i]);
                if (max === false || value > max)
                    max = value;
            }
        } else {
            for (var key in collection) {
                var value = test(collection[key]);
                if (max === false || value > max)
                    max = value;
            }
        }
        return max;
    },
    darkerCache: {},
    darker: function(color) {
        if (!this.darkerCache[color]) {
            this.darkerCache[color] = cq.color(color).shiftHsl(-0.05, -0.1, -0.2).toHex();
        }
        return this.darkerCache[color];
    },
    gnearest: function(from, entities) {
        var min = -1;
        var result = null;
        for (var i = 0; i < entities.length; i++) {
            var to = entities[i];
            if (from === to)
                continue;
            var distance = this.distance(from, to);
            if (distance < min || min < 0) {
                min = distance;
                result = to;
            }
        }
        return result;
    },
    gdistance: function(x1, y1, x2, y2) {
        if (arguments.length > 2) {
            var dx = x1 - x2;
            var dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy);
        } else {
            var dx = x1.gx - y1.gx;
            var dy = x1.gy - y1.gy;
            return Math.sqrt(dx * dx + dy * dy);
        }
    },
    smhd: function(s=0, m=0, h=0, d=0) {
        return s * 1000 + m * 60 * 1000 + h * 60 * 60 * 1000 + d * 24 * 60 * 60 * 1000;
    },
    xget: function(url, object, callback) {
        callback = callback || function() {}
        ;
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.onreadystatechange = function() {
                if (request.readyState != 4 || request.status != 200)
                    return;
                callback(false, request.responseText);
                resolve(request.responseText);
            }
            ;
            request.onerror = function() {
                callback(true);
                reject();
            }
            ;
            request.timeout = 5000;
            request.ontimeout = function() {
                callback(true);
                reject();
            }
            request.send();
        }
        );
    },
    xpost: function(url, object, callback) {
        callback = callback || function() {}
        ;
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open("POST", url, true);
            request.onreadystatechange = function() {
                if (request.readyState != 4 || request.status != 200)
                    return;
                if (callback)
                    callback(false, request.responseText);
                resolve(request.responseText);
            }
            ;
            request.onerror = function() {
                if (callback)
                    callback(true);
                reject();
            }
            ;
            request.timeout = 2000;
            request.ontimeout = function() {
                if (callback)
                    callback(true);
                reject();
            }
            request.send(JSON.stringify(object));
        }
        );
    },
    nearestPOT(value, pow) {
        pow = pow || 1;
        while (pow < value) {
            pow *= 2;
        }
        return pow;
    },
    timer: function(callback, interval) {
        var lastTick = Date.now();
        var timer = setInterval(function() {
            var dt = (Date.now() - lastTick) / 1000;
            lastTick = Date.now();
            callback(dt);
        }, interval);
        return timer;
    },
    lzwEncode: function(s) {
        var dict = {};
        var data = (s + "").split("");
        var out = [];
        var currChar;
        var phrase = data[0];
        var code = 256;
        for (var i = 1; i < data.length; i++) {
            currChar = data[i];
            if (dict[phrase + currChar] != null) {
                phrase += currChar;
            } else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase = currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        for (var i = 0; i < out.length; i++) {
            out[i] = String.fromCharCode(out[i]);
        }
        return out.join("");
    },
    lzwDecode: function(s) {
        var dict = {};
        var data = (s + "").split("");
        var currChar = data[0];
        var oldPhrase = currChar;
        var out = [currChar];
        var code = 256;
        var phrase;
        for (var i = 1; i < data.length; i++) {
            var currCode = data[i].charCodeAt(0);
            if (currCode < 256) {
                phrase = data[i];
            } else {
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            dict[code] = oldPhrase + currChar;
            code++;
            oldPhrase = phrase;
        }
        return out.join("");
    }
};
_.defaults(Utils, _);
Utils.filterKeys = function(object, filter) {
    var result = [];
    for (var key in object) {
        if (filter(object[key]))
            result.push(key);
    }
    return result;
}
;
Utils.filterObject = function(object, filter) {
    var result = {};
    for (var key in object) {
        if (filter(object[key]))
            result[key] = object[key];
    }
    return result;
}
;
Utils.filters = {
    hasTags: function() {
        var tags = Array.from(arguments);
        return function(object) {
            if (!object.tags)
                return false;
            for (var i = 0; i < tags.length; i++) {
                if (object.tags.indexOf(tags[i]) === -1)
                    return false;
            }
            return true;
        }
    }
};