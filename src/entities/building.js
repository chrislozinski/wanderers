// building code


CLIENT.Building = function(args) {
    this.color = 0xaaaaaa;
    this.temp = {};
    this.state_key = "none";
    this.x = 0;
    this.y = 0;
    this.gx = 0;
    this.gy = 0;
    this.sortX = 0;
    this.sortY = 0;
    this.frame = 0;
    this.connections = 0;
    this.lifetime = 0;
    this.angleIndex = 0;
    this.spriteName = "building/stone_tower";
    this.isWallPart = false;
    this.children = [];
    Object.assign(this, args);
    this.update(this.shared);
    this.game.needRefreshMap = true;
    this.random = Math.random();
}
;
CLIENT.Building.prototype = {
    get sprite() {
        return this.spriteName;
    },
    zIndex: 1,
    shape: COMMON.CIRCLE,
    radius: 30,
    collisionRadius: 30,
    interactiveRadius: 30,
    obstacleRadius: 16,
    heavy: true,
    groups: ["impassable", "interactive", "buildings", "obstacles"],
    tooltip: "building",
    clickable: true,
    _destruct() {
        if (this.controller.buildOnNode)
            this.unsetNode();
        if (this.controller._destruct)
            this.controller._destruct(this);
    },
    get def() {
        return COMMON.items[this.shared.key]
    },
    setNode() {
        let node = this.game.walls.get(this.gx, this.gy);
        if (!node)
            return;
        node.children.push(this);
    },
    unsetNode() {
        let node = this.game.walls.get(this.gx, this.gy);
        if (!node)
            return;
        Utils.pull(node.children, this);
    },
    build(x, y) {
        let plank = this.collection.add("Sprite");
        let angle = Utils.lookAt(x, y, this.x, this.y);
        plank.set("fx/build_wood");
        plank.duration = 0.5;
        plank.x = x;
        plank.y = y
        plank.z = Utils.random(0, 16);
        plank.scale.x = plank.scale.y = Utils.randomf(0.5, 1.0);
        plank.shadow = true;
        plank.row = Utils.dirrowp(Utils.lookAt(plank, this), 16);
        plank.zIndex = 2;
        app.sound.play("action/build" + Utils.random(1, 3));
    },
    canInteract() {
        if (!this.def.operable)
            return true;
        if (this.shared.operator_sid && this.shared.operator_sid !== app.game.player.sid)
            return this.game.deny("Someone else is operating this building now");
        if (this.shared.cooldown > 0)
            return this.game.deny("Building on cooldown");
        return true;
    },
    pointerdown(e) {
        if (!this.canInteract())
            return;
        if (this.controller.pointerdown)
            this.controller.pointerdown(this, e);
    },
    drag(e) {
        if (!this.canInteract())
            return;
        if (this.controller.drag)
            this.controller.drag(this, e);
    },
    dragstart(e) {
        if (!this.canInteract())
            return;
        if (this.controller.dragstart)
            this.controller.dragstart(this, e);
    },
    dragend(e) {
        if (!this.canInteract())
            return;
        if (this.controller.dragend)
            this.controller.dragend(this, e);
    },
    pointerup(e) {
        if (!this.canInteract())
            return;
        if (this.def.trade) {
            let trade = this.def.trade;
            if (this.game.playerData.resources[trade[0]] < trade[1]) {
                return this.game.errorMessage(`Not enough ${trade[0]}`);
            }
            app.sound.play("action/purchase");
            this.game.action.set("snap");
            if (trade[0] === "gold")
                this.game.fxCoin();
            else
                this.game.fxToss(trade[0]);
        }
        this.game.send("interact", {
            entity_sid: this.sid,
            alt: e.button !== "left"
        });
        if (this.controller.pointerup)
            this.controller.pointerup(this, e);
    },
    enterview() {
        if (this.shared.key === "windmill") {
            this.soundLoop = app.sound.play("building/windmill_loop").loop().rate(0.8).volume(0.4);
        }
        if (!this.circle && this.def.meadow) {
            this.circle = this.collection.add("Circle");
            this.circle.program = app.programs.meadow;
            this.circle.x = this.x;
            this.circle.y = this.y + (this.def.meadow.y | 0);
            this.circle.radius = this.def.meadow.radius;
            this.circle.scale.y = 0.75;
            this.circle.zIndex = -2;
            this.circle.texture = app.textures.spritesheet;
            this.circle.color.set(this.def.meadow.color);
        }
    },
    leaveview() {
        if (this.circle) {
            this.circle.collection.remove(this.circle);
        }
        if (this.soundLoop) {
            this.soundLoop.fadeOut(0.5);
            this.soundLoop = null;
        }
    },
    step(dt) {
        this.lifetime += dt;
        if (this.shared.key === "windmill" && this.inView && Utils.interval(this, "woof", 1.7)) {
            app.sound.play("building/windmill_sail").gpan(this).volume(0.5);
        }
        if (this.soundLoop)
            this.soundLoop.gpan(this);
        if (this.controller.step)
            this.controller.step(this, dt);
    },
    goWireframe() {
        this.heavy = false;
        if (!this.game.camera.inView(this.x, this.y))
            return;
        let building = this;
        let spriteData = app.sprites[this.spriteKey];
        let trim = CLIENT.Sprite.getTrim(this.spriteKey, 0, this.angleIndex);
        building.game.fxImplode(building.x + trim[0] - spriteData.width / 2 | 0, building.y + trim[1] - spriteData.height / 2 | 0, "sprites/" + this.spriteKey, CLIENT.Sprite.getRegion(building.spriteKey, 0, building.angleIndex), -1, 8, 1.0, (i)=>{
            i.zIndex = building.zIndex;
            i.sortX = building.sortX;
            i.sortY = building.sortY;
        }
        );
        this.delayRender = 1.0;
        app.sound.play("action/wireframe" + Utils.random(1, 2)).gpan(this).rrate(0.2);
    },
    goFinished() {
        this.heavy = true;
        if (!this.game.camera.inView(this.x, this.y))
            return;
        let building = this;
        let spriteData = app.sprites[this.spriteKey];
        let trim = CLIENT.Sprite.getTrim(this.spriteKey, 0, this.angleIndex);
        building.game.fxImplode(building.x + trim[0] - spriteData.width / 2 | 0, building.y + trim[1] - spriteData.height / 2 | 0, "sprites/" + this.spriteKey, CLIENT.Sprite.getRegion(building.spriteKey, 0, building.angleIndex), -1, 8, 1.0, (i)=>{
            i.zIndex = building.zIndex;
            i.sortX = building.sortX;
            i.sortY = building.sortY;
        }
        );
        this.delayRender = 1.0;
        app.sound.play("building/building_ready").gpan(this);
    },
    goDestroyed() {
        if (!this.sprite)
            return;
        if (this.inView) {
            let spriteData = app.sprites[this.spriteKey];
            let trim = CLIENT.Sprite.getTrim(this.spriteKey, 0, this.angleIndex);
            let region = CLIENT.Sprite.getRegion(this.spriteKey, 0, this.angleIndex);
            this.game.fxExplode(this.x + trim[0] - spriteData.width / 2 | 0, this.y + trim[1] - spriteData.height / 2 | 0, app.sprites[this.spriteKey].texture, region, 1.0, {
                spread: 2.0
            });
            this.game.fxExplode(this.x + trim[0] - spriteData.width / 2 | 0, this.y + trim[1] - spriteData.height / 2 | 0, app.sprites[this.spriteKey].texture, region, 1.0, {
                spread: 1.0
            });
            app.sound.play("explosion/building").gpan(this);
            app.game.camera.shake(4, 0.5);
        }
    },
    update(data) {
        Object.assign(this.shared, data);
        this.x = this.shared.x;
        this.y = this.shared.y;
        this.gx = Math.floor(this.shared.x / COMMON.GRID_WIDTH);
        this.gy = Math.floor(this.shared.y / COMMON.GRID_HEIGHT);
        if (data.team !== undefined) {
            this.color = COMMON.TEAM_COLOR[data.team].mid;
            this.team = data.team;
        }
        if (data.key) {
            this.spriteName = "building/" + data.key;
            this.def = COMMON.items[data.key];
            this.isWallPart = Boolean(this.def.wallPart);
        }
        if (data.angle !== undefined) {
            this.angleIndex = Utils.dirrowp(data.angle, this.def.angles || 16);
        }
        if (data.key) {
            if (this.def.obstacleRadius)
                this.obstacleRadius = this.def.obstacleRadius;
            this.controller = CLIENT.Building[this.def.controller || data.key];
            if (this.controller.init)
                this.controller.init(this);
            if (this.controller.buildOnNode)
                this.setNode();
        }
        if (this.controller.update)
            this.controller.update(this, data);
        if (data.connections !== undefined) {
            this.connections = data.connections;
        }
        if (data.state_key) {
            if (data.state_key === "wireframe") {
                this.spriteKey = this.spriteName + "_wireframe";
            } else if (data.state_key === "finished") {
                this.spriteKey = this.spriteName;
            }
        }
        if (data.state_key !== undefined) {
            if (data.state_key === "wireframe")
                this.goWireframe();
            if (data.state_key === "finished")
                this.goFinished();
            if (data.state_key === "destroyed")
                this.goDestroyed();
        }
        if (data.remove) {
            this.collection.remove(this);
        }
    },
    render() {
        if (!this.def.noflag) {
            app.painter.reset();
            app.painter.palette(this.team);
            app.painter.align(0.5, 1.0);
            app.painter.drawImageRegion(app.textures.spritesheet_p, 19, 25, 9, 33, this.x, this.y - 16);
        }
        if (this.delayRender - app.elapsed > 0)
            return this.delayRender -= app.elapsed;
        if (this.exploded)
            return;
        app.painter.reset();
        if (this.shared.state_key === "wireframe") {
            app.painter.drawSprite(this.spriteName + "_wireframe", this.x, this.y, 0, this.angleIndex);
        } else if (this.shared.state_key === "finished") {
            app.painter.drawSprite(this.spriteName, this.x, this.y, this.frame, this.angleIndex);
        }
        if (this.shared.state_key === "finished" && this.shared.health < this.def.maxHealth) {
            let sprite = app.sprites[this.spriteName];
            if (sprite) {
                let region = NAMESPACE.Sprite.getRegion(this.spriteName, 0, this.angleIndex);
                let trim = NAMESPACE.Sprite.getTrim(this.spriteName, 0, this.angleIndex);
                app.painter.program(app.programs.damage);
                app.gl.useProgram(app.programs.damage.native);
                app.gl.activeTexture(app.gl.TEXTURE4);
                app.gl.bindTexture(app.gl.TEXTURE_2D, app.textures.damage);
                app.programs.damage.set("damageTexture", 4);
                app.painter.alpha((1.0 - this.shared.health / this.def.maxHealth) * 0.5);
                app.painter.align(0.0, 0.0);
                app.painter.drawImageRegion(app.sprites[this.spriteName].texture, ...region, this.x - (sprite.width) * 0.5 + trim[0] | 0, this.y - (sprite.height) * 0.5 + trim[1] | 0);
            }
        }
        if (this.controller.render)
            this.controller.render(this);
        if (this.shared.cooldown > 0) {
            let w = 16;
            app.painter.reset();
            app.painter.color(0x000000);
            app.painter.fillRect(this.x, this.y + 8, w + 2, 4);
            app.painter.color(0xffffff);
            app.painter.fillRect(this.x, this.y + 8, w * this.shared.cooldown, 2);
        }
        if (app.game.hovered === this) {
            if (this.shared.health < this.def.maxHealth) {
                let w = 32;
                let p = this.shared.health / this.def.maxHealth;
                app.painter.reset();
                app.painter.color(0x000000);
                app.painter.fillRect(this.x, this.y, w + 2, 4);
                app.painter.color(this.color);
                app.painter.fillRect(this.x, this.y, w * p, 2);
            }
        }
    },
    minionEnter(minion) {
        if (this.controller.minionEnter)
            this.controller.minionEnter(this, minion);
    },
    minionLeave(minion) {
        if (this.controller.minionLeave)
            this.controller.minionLeave(this, minion);
    },
    handleHit() {
        app.game.fxStoneHit(this.x, this.y - 8);
    }
};
CLIENT.Building.food_storage = {
    init(building) {
        building.frame = 5;
    },
    update(building, data) {
        building.frame = data.counter;
    },
    pointerup(building, e) {
        app.sound.play(e.button === "left" ? "gui/take" : "gui/put");
    }
};
CLIENT.Building.lumberjack = {
    render(building) {
        app.painter.reset();
        app.painter.color(0x000000);
        app.painter.alpha(0.25);
        app.painter.rotate(Math.PI * 0.25);
        app.painter.align(0.4, 0.6);
        app.painter.drawSprite("building/lumberjack", building.x, building.y, app.lifetime * 6.0);
        app.painter.reset();
        app.painter.drawSprite("building/lumberjack", building.x, building.y - 6, app.lifetime * 6.0);
        app.painter.drawImageRegion(app.textures.spritesheet, 57, 76, 23, 19, building.x - 28, building.y + 16);
        app.painter.range(2, 7);
        app.painter.drawSprite("tribesman/male/sit", building.x + 4, building.y + 20, app.lifetime * 3.0, 3);
        app.painter.drawSprite("tribesman/axe/sit", building.x + 4, building.y + 20, app.lifetime * 3.0, 3);
        app.painter.range();
        app.painter.color(0x9badb7);
        app.painter.drawSprite("fx/smoke_column", building.x, building.y - 38, app.lifetime * 10.0);
    }
}
CLIENT.Building.node = {
    _destruct(building) {
        building.game.walls.delete(building.gx, building.gy);
    },
    init(building) {
        building.isNode = true;
    },
    update(building, data) {
        if (data.x !== undefined || data.y !== undefined) {
            building.game.walls.set(building.gx, building.gy, building);
        }
    }
};
CLIENT.Building.stationary_catapult = {
    init(building) {
        building.temp.rotation = 0;
        building.temp.state = "empty";
    },
    update(building, data) {
        if (data.key1 !== undefined) {
            this.setState(building, data.key1, building.temp.state);
        }
    },
    setState(building, state, prev) {
        switch (state) {
        case "loaded":
            app.tween(building).to({
                frame: 8
            }, building.inView ? 0.5 : 0.0);
            if (building.inView) {
                app.sound.play("bow/pull").rate(0.5).volume(1.0).gpan(building);
                app.sound.play("action/purchase").gpan(building);
                building.game.fxCoin(building.x, building.y - 16);
            }
            break;
        case "empty":
            app.tween(building).to({
                frame: 0
            }, building.inView ? 0.2 : 0.0);
            if (prev === "loaded") {
                let tx = building.x + Math.cos(building.shared.float1) * building.shared.float2;
                let ty = building.y + Math.sin(building.shared.float1) * building.shared.float2;
                if (building.inView || building.game.camera.inView(tx, ty)) {
                    app.sound.play("bow/shoot").rate(0.5).gpan(building);
                    let missile = building.collection.add("ParabolicMissile");
                    missile.x = building.x;
                    missile.y = building.y;
                    missile.z = 50;
                    missile.tx = tx;
                    missile.ty = ty;
                    missile.delay = 0.15;
                    missile.duration = 1.2;
                    missile.run();
                }
            }
            break;
        }
        building.temp.state = state;
    },
    render(building) {
        if (building.shared.state_key !== "finished")
            return;
        if (!building.temp.dragging && building.temp.state === "loaded")
            building.temp.rotation = Utils.circWrapTo(building.temp.rotation, building.shared.float1, app.elapsed * 6);
        let rotation = building.temp.rotation;
        let row = Utils.dirrowp(rotation, 16);
        app.painter.reset();
        app.painter.drawSprite("building/stationary_catapult_arm", building.x, building.y, building.frame, row);
        if (building.shared.health < building.def.maxHealth)
            app.game.drawSpriteDamage("building/stationary_catapult_arm", building.x, building.y, building.frame, row, building.shared.health / building.def.maxHealth);
        if (building.temp.dragging) {
            let x = building.x + Math.cos(rotation) * building.temp.dragPower;
            let y = building.y + Math.sin(rotation) * building.temp.dragPower;
            app.painter.reset();
            app.painter.drawSprite("fx/crosshair_horizontal", x, y, app.lifetime * 10);
        }
        if (!building.shared.cooldown && building.temp.state === "empty") {
            app.painter.drawImageRegion(app.textures.spritesheet, ...COMMON.INSERT_ARROW, building.x, building.y - 48 + Math.sin(app.lifetime * 6) * 2);
            app.painter.drawImageRegion(app.textures.spritesheet, ...COMMON.items.gold.sprite, building.x, building.y - 48 + Math.sin(app.lifetime * 6) * 2 - 8);
        }
    },
    dragstart(building, e) {
        if (app.game.playerData.resources.gold <= 0)
            return app.game.deny("Not enough gold");
        building.temp.dragging = true;
        building.temp.dragStartX = app.game.pointer.x;
        building.temp.dragStartY = app.game.pointer.y;
        app.game.send("operate", {
            sid: building.sid,
            int1: 1
        });
    },
    dragend(building, e) {
        building.temp.dragging = false;
        app.game.send("operate", {
            sid: building.sid,
            int1: 2,
            float2: building.temp.dragPower
        });
    },
    drag(building, e) {
        if (building.temp.state === "loaded") {
            let rotation = Utils.lookAt(building.game.pointer.x, building.game.pointer.y, building.temp.dragStartX, building.temp.dragStartY);
            building.temp.rotation = building.shared.float1 = rotation;
            building.temp.dragPower = Utils.distance(building.temp.dragStartX, building.temp.dragStartY, building.game.pointer.x, building.game.pointer.y) * 2;
            this.sendRotation(building.sid, rotation, building.temp.dragPower);
        }
    },
    sendRotation: Utils.throttle(function(sid, rotation) {
        app.game.send("operate", {
            sid: sid,
            float1: rotation
        });
    }, 100)
};
CLIENT.Building.stationary_catapult = {
    init(building) {
        building.temp.rotation = 0;
        building.temp.state = "empty";
    },
    update(building, data) {
        if (data.int1 !== undefined) {
            if (data.int1)
                building.target = building.collection.sid(data.int1);
            else
                building.target = null;
        }
        if (data.key1 !== undefined) {
            this.setState(building, data.key1, building.temp.state);
        }
    },
    setState(building, state, prev) {
        switch (state) {
        case "loaded":
            if (building.inView) {
                app.sound.play("bow/pull").rate(0.5).volume(1.0).gpan(building);
            }
            app.tween(building).to({
                frame: 8
            }, building.inView ? 0.5 : 0.0);
            break;
        case "empty":
            building.frame = 0;
            break;
        case "fire":
            var tx, ty;
            app.tween(building).to({
                frame: 0
            }, building.inView ? 0.2 : 0.0);
            if (building.target) {
                tx = building.target.x;
                ty = building.target.y;
            } else {
                tx = building.x + Utils.random(-100, 100);
                ty = building.y + Utils.random(-100, 100);
            }
            if (building.inView || building.game.camera.inView(tx, ty)) {
                app.sound.play("bow/shoot").rate(0.5).gpan(building);
                let missile = building.collection.add("ParabolicMissile");
                missile.x = building.x;
                missile.y = building.y;
                missile.z = 50;
                missile.tx = tx;
                missile.ty = ty;
                missile.delay = 0.15;
                missile.duration = 1.2;
                missile.run();
            }
            break;
        }
        building.temp.state = state;
    },
    pointerup(building) {
        if (building.game.playerData.resources.gold > 0) {
            app.sound.play("action/purchase").gpan(building);
            building.game.fxCoin(building.x, building.y - 16);
        }
    },
    render(building) {
        if (building.shared.state_key !== "finished")
            return;
        if (building.target)
            building.temp.rotation = Utils.circWrapTo(building.temp.rotation, Utils.lookAt(building, building.target), app.elapsed * 6);
        let row = Utils.dirrowp(building.temp.rotation, 16);
        app.painter.reset();
        app.painter.drawSprite("building/stationary_catapult_arm", building.x, building.y, building.frame, row);
        if (building.shared.health < building.def.maxHealth)
            app.game.drawSpriteDamage("building/stationary_catapult_arm", building.x, building.y, building.frame, row, building.shared.health / building.def.maxHealth);
        if (building.temp.state === "empty" && building.shared.counter === 0) {
            app.painter.drawImageRegion(app.textures.spritesheet, ...COMMON.INSERT_ARROW, building.x, building.y - 48 + Math.sin(app.lifetime * 6) * 2);
            app.painter.drawImageRegion(app.textures.spritesheet, ...COMMON.items.gold.sprite, building.x, building.y - 48 + Math.sin(app.lifetime * 6) * 2 - 8);
        }
    }
};
CLIENT.Building.tower = {
    buildOnNode: true,
    render(building) {},
    minionEnter(building, minion) {
        minion.ignoreCollisions = true;
        app.tween(minion).delay(0.8).then(function() {
            minion.state.data.delay = 1.3;
            Utils.arrayCall(minion.sprites, "set", "roll");
            Utils.arraySet(minion.sprites, "duration", 0.5);
        }).to({
            oz: 50
        }, 0.3).to({
            oz: 30
        }, 0.2);
        minion.zIndex = 2;
    },
    minionLeave(building, minion) {
        minion.state.data.delay = 1.0;
        Utils.arrayCall(minion.sprites, "set", "roll");
        Utils.arraySet(minion.sprites, "duration", 0.5);
        app.tween(minion).to({
            oz: minion.oz + 20
        }, 0.25).to({
            oz: 0
        }, 0.5, "outBounce").set("ignoreCollisions", false);
        minion.zIndex = 1;
    }
};
CLIENT.Building.wall = {
    init(building) {
        building.isWall = true;
    },
    _destruct(building) {
        let node;
    },
    update(building, data) {
        building.sortX = building.x;
        building.sortY = building.y - 1;
        if (building.def.gate) {
            building.spriteName = `building/${building.shared.key}`;
        } else {
            if (building.angleIndex === 2 || building.angleIndex === 6 || building.angleIndex === 10 || building.angleIndex === 14) {
                building.spriteName = `building/${building.shared.key}_short`;
            } else {
                building.spriteName = `building/${building.shared.key}_long`;
            }
        }
        if (data.angle !== undefined) {
            let offset, node;
        }
    },
    render(building) {}
};
CLIENT.Building.well = {
    init(building) {
        building.frame = 5;
    },
    update(building, data) {
        building.frame = data.counter;
    },
    pointerup(building, e) {
        app.sound.play(e.button === "left" ? "gui/take" : "gui/put");
    }
};
CLIENT.Building.windmill = {
    render(building) {
        app.painter.reset();
        app.painter.drawImageRegion(app.textures.spritesheet, 57, 96, 23, 19, building.x - 28, building.y + 4);
        app.painter.color(0x000000);
        app.painter.alpha(0.25);
        app.painter.rotate(Math.PI * 0.25);
        app.painter.align(0.4, 0.6);
        app.painter.drawSprite("building/windmill", building.x, building.y, app.lifetime * 6.0);
        app.painter.reset();
        app.painter.drawSprite("building/windmill", building.x, building.y, app.lifetime * 6.0);
        app.painter.drawSprite("building/windmill_flour", building.x - 12, building.y + 14, app.lifetime * 8.0);
        app.painter.drawSprite("tribesman/male/operate_ground", building.x + 16, building.y + 17, app.lifetime * 3.0, 3);
        app.painter.drawSprite("tribesman/scythe/operate_ground", building.x + 16, building.y + 17, app.lifetime * 3.0, 3);
        app.painter.drawImageRegion(app.textures.spritesheet, 72, 56, 17, 18, building.x + 8, building.y + 28);
    }
};
CLIENT.Building.wood_storage = {
    init(building) {
        building.frame = 5;
    },
    update(building, data) {
        building.frame = data.counter;
    },
    pointerup(building, e) {
        app.sound.play(e.button === "left" ? "gui/take" : "gui/put");
    }
};