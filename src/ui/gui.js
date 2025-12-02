// gui 


CLIENT.GUI = function() {
    this.hoveredElement = null;
    this.pressedElement = null;
    this.elements = [];
    this.layerA = new CLIENT.ImageBatch();
    this.layerB = new CLIENT.ImageBatch();
    this.hovered = 0;
    this.hidden = false;
}
;
CLIENT.GUI.prototype = {
    constructor: CLIENT.GUI,
    add(elementName) {
        let element = new CLIENT["GUI" + elementName](this);
        this.elements.push(element);
        return element;
    },
    remove(element) {
        element._remove = true;
    },
    enterElement(element) {
        if (this.hoveredElement === element)
            return;
        element.hovered = true;
        this.hovered = 1.0;
        this.hoveredElement = element;
        if (this.hoveredElement.onEnter)
            this.hoveredElement.onEnter();
        if (this.hoveredElement.tooltip)
            this.showTooltip(this.hoveredElement);
        this.hoveredElement.trigger("enter");
    },
    leaveElement(element) {
        if (!this.dragging && app.pointer.pressed && this.pressedElement)
            this.startDrag(this.hoveredElement);
        element.hovered = false;
        if (this.hoveredElement.onLeave)
            this.hoveredElement.onLeave();
        if (this.hoveredElement.tooltip)
            this.hideTooltip(this.hoveredElement);
        this.hoveredElement.trigger("leave");
        this.hoveredElement = null;
    },
    showTooltip(element) {
        var tooltipElement = this.add("Text");
        let tooltipSize = app.fonts.default.getSize(element.tooltip);
        if (app.game.layout === 0) {
            tooltipElement.x = element.x + element.width / 2 - tooltipSize.width / 2 | 0;
            tooltipElement.y = element.y - tooltipSize.height - 8;
        } else {
            tooltipElement.x = app.width / 2 - tooltipSize.width / 2 | 0;
            tooltipElement.y = app.height - tooltipSize.height - 32;
        }
        tooltipElement.font = app.fonts.default;
        tooltipElement.text = element.tooltip
        tooltipElement.color.set(0xcbdbfc, 0.8);
        element[Symbol.for("tooltipElement")] = tooltipElement;
        tooltipElement.batch.dissolve = 1.0;
        app.tween(tooltipElement.batch).to({
            dissolve: 0.0
        }, 0.1);
        if (element.subtip) {
            let subtipElement = this.add("Text");
            let subtipSize = app.fonts.small.getSize(element.subtip);
            if (app.game.layout === 0) {
                subtipElement.x = element.x + element.width / 2 - subtipSize.width / 2 | 0;
                subtipElement.y = element.y - subtipSize.height - 8;
            } else {
                subtipElement.x = app.width / 2 - subtipSize.width / 2 | 0;
                subtipElement.y = app.height - subtipSize.height - 32;
            }
            tooltipElement.y -= subtipSize.height + 4;
            subtipElement.font = app.fonts.small;
            subtipElement.text = element.subtip
            subtipElement.color.set(0xf5b743, 0.8);
            element[Symbol.for("subtipElement")] = subtipElement;
            subtipElement.batch.dissolve = 1.0;
            app.tween(subtipElement.batch).to({
                dissolve: 0.0
            }, 0.1);
        }
    },
    hideTooltip(element) {
        let tooltipElement = element[Symbol.for("tooltipElement")];
        app.tween(tooltipElement.batch).to({
            dissolve: 1.0
        }, 0.1).then(function() {
            tooltipElement.gui.remove(tooltipElement);
        });
        let subtipElement = element[Symbol.for("subtipElement")];
        if (subtipElement) {
            app.tween(subtipElement.batch).to({
                dissolve: 1.0
            }, 0.1).then(function() {
                subtipElement.gui.remove(subtipElement);
            });
        }
    },
    pointermove(e) {
        let hoveredElement = null;
        for (let i = this.elements.length - 1; i >= 0; i--) {
            let element = this.elements[i];
            if (element.hidden)
                continue;
            if (!Utils.pointInRect(e.x, e.y, element.x, element.y, element.width, element.height))
                continue;
            hoveredElement = element;
            break;
        }
        if (this.hoveredElement !== hoveredElement) {
            if (this.hoveredElement)
                this.leaveElement(this.hoveredElement);
            this.enterElement(hoveredElement);
        } else if (this.hoveredElement && !hoveredElement) {
            this.leaveElement(this.hoveredElement);
        }
    },
    startDrag(element) {
        this.pressedElement = null;
        this.draggedElement = element;
        this.dragging = true;
        this.draggedElement.trigger("dragstart");
    },
    endDrag() {
        this.dragging = false;
        this.draggedElement.trigger("dragend");
        this.draggedElement = null;
    },
    pointerdown(e) {
        if (this.hoveredElement) {
            this.pressedElement = this.hoveredElement;
            this.hoveredElement.pressed = true;
            this.hoveredElement.needRefresh = true;
            if (this.pressedElement.onPress) {
                this.pressedElement.onPress(e);
            }
            return true;
        } else {
            return false;
        }
    },
    pointerup(e) {
        if (this.pressedElement) {
            this.pressedElement.pressed = false;
            this.pressedElement.needRefresh = true;
            if (this.pressedElement.onRelease) {
                this.pressedElement.onRelease();
            }
            this.pressedElement.trigger("click", e);
            this.pressedElement = null;
            return true;
        }
        if (this.dragging) {
            this.endDrag();
        }
    },
    step(dt) {
        if (!this.hoveredElement)
            this.hovered -= dt;
        for (let i = 0; i < this.elements.length; i++) {
            let element = this.elements[i];
            if (element._remove) {
                if (element.destruct)
                    element.destruct();
                this.elements.splice(i--, 1);
            }
        }
    },
    render() {
        if (this.hidden)
            return;
        this.layerA.render();
        for (let element of this.elements) {
            if (element.hidden)
                continue;
            if (element.render)
                element.render();
        }
        this.layerB.render();
    }
};


//

CLIENT.GUIActionButton = function(gui) {
    CLIENT.Events.call(this);
    this.disabled = false;
    this.sprite = null;
    this.palette = -1.0;
    this.tokensPosition = "bottom";
    this.spriteScale = 1.0;
    this.spriteAlignY = 0.5;
    this.spriteRow = 0;
    this.spritePalette = -1;
    this.hoverTime = 0;
    this.properties = {
        x: 0,
        y: 0,
        hidden: false
    };
    this.width = 20;
    this.height = 22;
    this.gui = gui;
    this.icon = null;
    this.needRefresh = true;
    this.hovered = false;
    this.pressed = false;
    this.cost = 0;
    this._cost = -1;
    this.resource = "wood";
    this.tokens = [];
    this.overlay = null;
}
;
CLIENT.GUIActionButton.prototype = {
    constructor: CLIENT.GUIActionButton,
    set x(x) {
        this.properties.x = x;
        this.needRefresh = true;
    },
    get x() {
        return this.properties.x;
    },
    set y(y) {
        this.properties.y = y;
        this.needRefresh = true;
    },
    get y() {
        return this.properties.y;
    },
    set hidden(hidden) {
        this.properties.hidden = hidden;
        if (hidden)
            this.hide();
        this.needRefresh = true;
    },
    get hidden() {
        return this.properties.hidden;
    },
    destruct() {
        this.hide();
    },
    hide() {
        if (this.a)
            this.a.remove();
        if (this.b)
            this.b.remove();
        for (let token of this.tokens) {
            this.gui.layerA.remove(token);
        }
        this.tokens.length = 0;
        if (this.overlay)
            this.overlay.remove();
        this.a = null;
        this.b = null;
        this.overlay = null;
    },
    onEnter() {
        this.needRefresh = true;
        this.hoverTime = 0;
    },
    onLeave() {
        this.needRefresh = true;
    },
    onPress() {
        if (this.disabled)
            return false;
        app.sound.play("button_down");
        return true;
    },
    onRelease() {
        if (this.disabled)
            return false;
        app.sound.play("button_up");
        return true;
    },
    refresh() {
        if (this.hidden)
            return;
        let gui = this.gui;
        this.needRefresh = false;
        if (!this.a)
            this.a = gui.layerA.create();
        if (!this.b)
            this.b = gui.layerA.create();
        if (!this.hovered || this.disabled)
            this.a.setSprite(0, 38, 20, 22);
        else
            this.a.setSprite(0, 61, 20, 22);
        if (this.icon) {
            this.b.setSprite(...this.icon);
        }
        this.a.setRegion(this.x, this.y, 20, 22);
        let oy = this.hovered * -1;
        if (this.icon) {
            this.b.setRegion(this.x + this.width * 0.5 - this.icon[2] * 0.5 | 0, this.y + this.height * 0.5 - this.icon[3] * 0.5 + oy | 0, this.icon[2], this.icon[3]);
        }
        if (this.pressed && !this.disabled) {
            this.a.y += 2;
            this.a.height -= 2;
            this.b.y += 2;
            this.b.height -= 2;
            this.a.x++;
            this.b.x++;
            this.a.width -= 2;
            this.b.width -= 2;
        }
        if (this._cost !== this.cost) {
            this.updateTokens();
        }
        if (this.disabled && !this.overlay) {
            this.overlay = this.gui.layerB.create();
            this.overlay.setSprite(1, 108, 18, 18);
        }
        if (!this.disabled && this.overlay) {
            this.gui.layerB.remove(this.overlay);
            this.overlay = null;
        }
        if (this.overlay) {
            this.overlay.setRegion(this.x + 1, this.y + 1, 18, 18);
        }
    },
    updateTokens() {
        for (let token of this.tokens) {
            this.gui.layerA.remove(token);
        }
        this.tokens.length = 0;
        if (this.cost <= 0)
            return;
        let def = COMMON.itemsByKey[this.resource];
        let tw = this.cost * 3;
        for (let i = 0; i < this.cost; i++) {
            let token = this.gui.layerA.add();
            token.setSprite(def.token[0] - 1, def.token[1] - 1, 4, 4);
            if (this.tokensPosition === "bottom") {
                token.setRegion(this.x + this.width * 0.5 - tw * 0.5 + i * 3 | 0, this.y + this.height + 2, 4, 4);
            } else if (this.tokensPosition === "right") {
                token.setRegion(this.x + this.width + 2, this.y + this.height * 0.5 - tw * 0.5 + i * 3 | 0, 4, 4);
            } else if (this.tokensPosition === "left") {
                token.setRegion(this.x - 6, this.y + this.height * 0.5 - tw * 0.5 + i * 3 | 0, 4, 4);
            }
            this.tokens.push(token);
        }
    },
    step() {},
    render() {
        if (this.needRefresh)
            this.refresh();
        if (this.hovered && !this.disabled)
            this.hoverTime += app.elapsed;
        if (this.sprite) {
            app.painter.reset();
            app.painter.palette(this.palette);
            app.painter.values.align.y = this.spriteAlignY;
            app.painter.values.scale.x = this.spriteScale;
            app.painter.values.scale.y = this.spriteScale;
            if (this.hovered && !this.disabled) {
                app.painter.values.scale.x = 1.25 * this.spriteScale;
                app.painter.values.scale.y = 1.25 * this.spriteScale;
            }
            if (this.pressed && !this.disabled) {
                app.painter.values.scale.x = 0.75 * this.spriteScale;
                app.painter.values.scale.y = 0.75 * this.spriteScale;
            }
            app.painter.palette(this.spritePalette);
            app.painter.drawSprite(this.sprite, this.x + this.width / 2, this.y + this.height / 2, this.hovered ? 4 + this.hoverTime * 12.0 : 4, this.spriteRow);
        }
        if (this.icon) {}
        if (this.hovered && this.hoveredIcon) {
            app.painter.reset();
            app.painter.drawImageRegion(app.textures.spritesheet, ...this.hoveredIcon, this.x + this.width / 2, this.y - 12);
        }
    }
};
Object.assign(CLIENT.GUIActionButton.prototype, CLIENT.Events.prototype);
CLIENT.GUIElement = function(gui) {
    CLIENT.Events.call(this);
    this.properties = {
        x: 0,
        y: 0
    };
    this.gui = gui;
}
;
CLIENT.GUIElement.prototype = {
    set x(x) {
        this.properties.x = x;
        this.needRefresh = true;
    },
    get x() {
        return this.properties.x;
    },
    set y(y) {
        this.properties.y = y;
        this.needRefresh = true;
    },
    get y() {
        return this.properties.y;
    },
    render() {
        if (this.needRefresh)
            this.refresh();
    }
};
Object.assign(CLIENT.GUIElement.prototype, CLIENT.Events.prototype);
CLIENT.GUIExperienceBottle = class extends CLIENT.GUIElement {
    constructor(gui) {
        super(gui);
        this.width = 1;
        this.height = 1;
        this.shelf = this.gui.layerA.create();
        this.bottle = this.gui.layerA.create();
        this.bottleOverlay = this.gui.layerA.create();
        this.rightEdge = this.gui.layerA.create();
        this.exp = 0;
        this.progress = 0;
        this.buttons = [];
        this.levels = 0;
        this.level = 0;
    }
    hideInventions() {
        for (let button of this.buttons) {
            this.gui.remove(button);
        }
        this.buttons.length = 0;
        this.needRefresh = true;
    }
    showInventions() {
        this.hideInventions();
        for (let def of COMMON.tags.invention) {
            if (app.game.inventions.indexOf(def.key) > -1)
                continue;
            if (def.require && app.game.inventions.indexOf(def.require) < 0)
                continue;
            let button = this.gui.add("ActionButton");
            button.palette = 0;
            if (!def.icon) {
                button.sprite = `tribesman/${def.key}/turntable`;
            }
            if (def.icon) {
                button.icon = def.icon;
            }
            button.action = "invent";
            button.key = def.key;
            button.tooltip = def.tooltip;
            button.subtip = def.subtip;
            button.hoveredIcon = [169, 140, 13, 17];
            button.on(PLAYGROUND.MOBILE ? "dragstart" : "click", app.game.onActionButtonClick.bind(app.game, button));
            this.buttons.push(button);
        }
        this.refresh();
        for (let i = 0; i < this.buttons.length; i++) {
            let button = this.buttons[i];
            let y = button.y;
            button.y += 50;
            app.tween(button).to({
                y: y
            }, 0.2 + i * 0.2, "outElastic")
        }
    }
    setProgress(progress) {
        this.progress = progress;
        this.needRefresh = true;
    }
    render() {
        super.render();
        if (this.levels) {
            app.painter.reset();
            app.painter.drawSprite("gui/exp_coord", this.x + 17, this.y + 11, app.lifetime * 10);
        }
    }
    refresh() {
        this.needRefresh = false;
        this.bottle.setSprite(145, 94, 36, 38);
        this.bottle.setRegion(this.x, this.y);
        let x = 0;
        for (let button of this.buttons) {
            button.y = this.y + 9;
            button.x = this.x + 31 + x;
            x += 24;
        }
        this.shelf.setSprite(202, 100, 2, 28);
        this.rightEdge.setSprite(205, 100, 4, 28);
        if (this.buttons.length) {
            this.shelf.setRegion(this.x + 36, this.y + 6, this.buttons.length * 23 + 3);
            this.rightEdge.setRegion(this.x + this.buttons[this.buttons.length - 1].x + 13, this.y + 6);
        } else {
            this.shelf.setRegion(this.x + 36, this.y + 6, 8);
            this.rightEdge.setRegion(this.x + 36 + 8, this.y + 6);
        }
        if (this.level >= COMMON.MAX_LEVEL) {
            this.bottleOverlay.setSprite(213, 104, 20, 19);
            this.bottleOverlay.setRegion(this.x, this.y + 28 - 19, 20, 19);
        } else {
            this.bottleOverlay.setSprite(145, 140 + 19 - 19 * this.progress, 20, 19 * this.progress);
            this.bottleOverlay.setRegion(this.x, this.y + 28 - 19 * this.progress, 20, 19 * this.progress);
        }
    }
}
;
CLIENT.GUIResources = function(gui) {
    this.gui = gui;
    CLIENT.Events.call(this);
    this.properties = {
        x: 0,
        y: 0
    };
    this.width = 72;
    this.height = 36;
    this.imageBatch = this.gui.layerA;
    this.needRefresh = true;
    this.hovered = false;
    this.pressed = false;
    this.tokens = [];
    this.count = {
        "food": 3,
        "wood": 4,
        "gold": 5,
        "water": 0
    };
    this.refresh();
    this.refreshText();
}
;
CLIENT.GUIResources.prototype = {
    constructor: CLIENT.GUIResources,
    set x(x) {
        this.properties.x = x;
        this.needRefresh = true;
    },
    get x() {
        return this.properties.x;
    },
    set y(y) {
        this.properties.y = y;
        this.needRefresh = true;
    },
    get y() {
        return this.properties.y;
    },
    onEnter() {
        this.needRefresh = true;
    },
    onLeave() {
        this.needRefresh = true;
    },
    refresh() {
        this.needRefresh = false;
        if (!this.created) {
            this.created = true;
            this.foodIcon = this.imageBatch.add(COMMON.items.food.sprite, [0, 0]);
            this.woodIcon = this.imageBatch.add(COMMON.items.wood.sprite, [24, 0]);
            this.goldIcon = this.imageBatch.add(COMMON.items.gold.sprite, [48, 0]);
            this.waterIcon = this.imageBatch.add(COMMON.items.water.sprite, [72, 0]);
            this.foodText = this.gui.add("Text");
            this.woodText = this.gui.add("Text");
            this.goldText = this.gui.add("Text");
            this.waterText = this.gui.add("Text");
            this.foodText.text = "24";
            this.woodText.text = "24";
            this.goldText.text = "24";
            this.waterText.text = "24";
            this.foodText.font = app.fonts.fat;
            this.woodText.font = app.fonts.fat;
            this.goldText.font = app.fonts.fat;
            this.waterText.font = app.fonts.fat;
            this.foodText.color.set(0xd95763);
            this.woodText.color.set(0xd9a066);
            this.goldText.color.set(0xfbf236);
            this.waterText.color.set(0x5fcde4);
        }
        this.foodIcon.setPosition(this.x + 0, this.y);
        this.woodIcon.setPosition(this.x + 24, this.y);
        this.goldIcon.setPosition(this.x + 48, this.y);
        this.waterIcon.setPosition(this.x + 72, this.y);
        this.foodText.x = this.x + 0 + 10;
        this.woodText.x = this.x + 24 + 10;
        this.goldText.x = this.x + 48 + 10;
        this.waterText.x = this.x + 72 + 10;
        this.foodText.y = this.y - 1;
        this.woodText.y = this.y - 1;
        this.goldText.y = this.y - 1;
        this.waterText.y = this.y - 1;
    },
    resourceY: {
        "food": 3,
        "wood": 14,
        "gold": 25
    },
    resourceX: {
        "food": 3,
        "wood": 14,
        "gold": 25
    },
    refreshText() {
        this.foodText.text = String(this.count.food);
        this.woodText.text = String(this.count.wood);
        this.goldText.text = String(this.count.gold);
        this.waterText.text = String(this.count.water);
    },
    step() {},
    render() {
        if (this.needRefresh)
            this.refresh();
        app.painter.reset();
    }
};
Object.assign(CLIENT.GUIResources.prototype, CLIENT.Events.prototype);
CLIENT.GUIText = function(gui) {
    CLIENT.Events.call(this);
    this.gui = gui;
    this.textUpdated = false;
    this.font = app.fonts.default;
    this.text = "";
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
    this.batch = new CLIENT.ImageBatch();
    this.batch.alpha = 1.0;
    this.batch.program = app.programs.text;
}
;
CLIENT.GUIText.prototype = {
    constructor: CLIENT.GUIText,
    get color() {
        return this.batch.color;
    },
    set text(text) {
        if (this._text === text)
            return;
        this._text = text;
        this.textUpdated = true;
    },
    get text() {
        return this._text;
    },
    updateText() {
        let text = this.text;
        this.textUpdated = false;
        this.batch.clear();
        let x = 0;
        let y = 0;
        for (var i = 0; i < text.length; i++) {
            let letter = text[i];
            if (letter === "\n") {
                y += this.font.height + 1;
                x = 0;
            } else if (letter === " ") {
                x += this.font.spaceWidth;
                continue;
            }
            if (!this.font.regions[letter])
                continue;
            let sprite = this.batch.add();
            let region = this.font.regions[letter];
            sprite.setSprite(region[0], region[1], region[2], region[3]);
            sprite.setRegion(x, y, region[2], region[3]);
            x += 1 + region[2];
        }
    },
    render() {
        if (this.textUpdated)
            this.updateText();
        let color = this.color.num;
        let a = this.color.a;
        this.batch.x = this.x;
        this.batch.y = this.y;
        this.color.set(0x111111);
        this.batch.y++;
        this.batch.render();
        this.color.set(color, a);
        this.batch.y--;
        this.batch.render();
    }
};
Object.assign(CLIENT.GUIText.prototype, CLIENT.Events.prototype);