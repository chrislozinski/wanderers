// these are specifically for the tribesmen who are in the tribe and their behaviour 
NAMESPACE.Tribesman = function(args) {
    this.team = 0;
    this.fallDirection = 0;
    this.lifetime = Math.random();
    this.maxHealth = 1;
    this.shieldHit = 0.0;
    this.x = Math.random() * 100;
    this.y = Math.random() * 100;
    this.z = 0;
    this.i = 0;
    this.ox = 0;
    this.oy = 0;
    this.oz = 0;
    this.tempIgnoreCollisions = 0.0;
    this.force = 0;
    this.forceDirection = 0;
    this.destinationDistance = 0;
    this.dead = false;
    this.destination = {};
    this.lookAt = null;
    this.weapon = 0;
    this.helmet = 0;
    this.shield = 0;
    this.weaponDef = {};
    this.helmetDef = {};
    this.shieldDef = {};
    Object.assign(this, args);
    this.tween = new CLIENT.FollowingTween(this);
    this.state = new CLIENT.State(this,CLIENT.Tribesman.States);
    this.direction = this.lookAt = Math.random() * 6.0;
    this.sprites = [];
    this.sprites.push(this.bodySprite = new CLIENT.Sprite);
    this.sprites.push(this.weaponSprite = new CLIENT.Sprite);
    this.sprites.push(this.shieldSprite = new CLIENT.Sprite);
    this.sprites.push(this.helmetSprite = new CLIENT.Sprite);
    this.helmet = 0;
    this.weapon = 0;
    this.shield = 0;
    this.setKind("human");
    this.weaponSprite.prefix = `tribesman/axe/`;
    this.helmetSprite.prefix = `tribesman/hood/`;
    this.shieldSprite.prefix = "tribesman/wooden_shield/";
    this.bodySprite.set("run");
    this.weaponSprite.set("run");
    this.shieldSprite.set("run");
    this.helmetSprite.set("run");
    this.random = Math.random();
    this.random2 = Math.random();
    this.sin = Math.sin(this.random * Math.TAU);
    this.cos = Math.cos(this.random * Math.TAU);
    for (let sprite of this.sprites) {
        sprite.loop = true;
        sprite.time = this.random;
    }
    this.legsSprite = new CLIENT.Sprite;
    this.legsSprite.set("tribesman/male/legs_run");
    this.legsSprite.loop = true;
    this.legsSprite.time = this.random;
    this.task = 0;
    this.detail = 0;
    this.update(this.shared);
    if (this.group && this.group === this.game.player && this.game.nextTribesmanPosition) {
        this.shared.x = this.game.nextTribesmanPosition.x;
        this.shared.y = this.game.nextTribesmanPosition.y;
    }
    this.destination.x = this.x = this.shared.x;
    this.destination.y = this.y = this.shared.y;
    this.needRefreshSprites = true;
    this.basePoint = {
        x: Math.cos(this.random * 6.28) * COMMON.TRIBE_RADIUS,
        y: Math.sin(this.random * 6.28) * COMMON.TRIBE_RADIUS
    };
    this.moveGrass = true;
    this.isKing = false;
    this.updateMaxHealth();
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.setTeam(this.team);
}
;
NAMESPACE.Tribesman.prototype = {
    constructor: NAMESPACE.Tribesman,
    zIndex: 1,
    radius: 16,
    collisionRadius: 1,
    shape: COMMON.CIRCLE,
    systemLight: 16,
    systemShadow: 5,
    groups: ["tribesman", "movable"],
    _destruct: function() {},
    enterview() {
        this.updateTask();
    },
    enterHighlight() {},
    leaveHighlight() {},
    setTeam(team) {
        this.team = team;
        this.bodySprite.palette = this.team;
        this.helmetSprite.palette = this.team;
        this.legsSprite.palette = this.team;
        if (this.group && this.group.palette === COMMON.BARBARIAN_TEAM)
            this.helmetSprite.palette = 0;
    },
    set timeScale(scale) {
        Utils.arraySet(this.sprites, "timeScale", scale);
    },
    get timeScale() {
        return this.bodySprite ? this.bodySprite.timeScale : 1.0;
    },
    updateMaxHealth() {
        this.maxHealth = COMMON.getMaxHealth(this);
    },
    hit(damage, projectile) {},
    hooray(delay=0) {
        if (!this.inView)
            return;
        app.tween(this).delay(delay).to({
            z: 20
        }, 0.25, "outSine").to({
            z: 0
        }, 0.5, "outBounce");
        if (this.team === app.game.player.team)
            app.sound.play("human/hooray_" + Utils.random(3, 5)).delay(delay).gpan(this).rate(1.25).rrate(0.2);
        else
            app.sound.play("human/hooray_" + Utils.random(1, 4)).delay(delay).gpan(this).rate(1.5).rrate(0.2);
        setTimeout(()=>{
            Utils.arrayCall(this.sprites, "set", "roll");
            Utils.arraySet(this.sprites, "duration", 1.0);
        }
        , delay * 1000);
    },
    poke() {
        let duration = 1.5;
        app.tween(this).to({
            scaleY: 1.25,
            scaleX: 0.75
        }, duration * 0.25, "outSine").to({
            scaleY: 1.0,
            scaleX: 1.0
        }, duration * 0.5, "outElastic");
    },
    refreshSprites() {
        this.needRefreshSprites = false;
        let loop = this.bodySprite.loop;
        let time = this.bodySprite.time;
        if (this.weapon) {
            let key = COMMON.itemsByIndex[this.weapon].key;
            this.weaponSprite.show();
            this.weaponSprite.prefix = `tribesman/${key}/`;
            this.weaponSprite.set(this.bodySprite.key);
            this.weaponSprite.loop = loop;
            this.weaponSprite.time = time;
            this.weaponSprite.offsetY = -30;
            app.tween(this.weaponSprite).to({
                offsetY: 0.0
            }, 0.5, "outBounce");
        } else
            this.weaponSprite.hide();
        if (this.helmet) {
            let key = COMMON.itemsByIndex[this.helmet].key;
            this.helmetSprite.show();
            this.helmetSprite.prefix = `tribesman/${key}/`;
            this.helmetSprite.set(this.bodySprite.key);
            this.helmetSprite.loop = loop;
            this.helmetSprite.time = time;
            if (this.helmet === COMMON.itemsByKey.crown.index)
                this.isKing = true;
            this.helmetSprite.offsetY = -30;
            app.tween(this.helmetSprite).to({
                offsetY: 0.0
            }, 0.5, "outBounce");
            this.updateMaxHealth();
        } else
            this.helmetSprite.hide();
        if (this.shield) {
            let key = COMMON.itemsByIndex[this.shield].key;
            this.shieldSprite.show();
            this.shieldSprite.prefix = `tribesman/${key}/`;
            this.shieldSprite.set(this.bodySprite.key);
            this.shieldSprite.loop = loop;
            this.shieldSprite.time = time;
            this.shieldSprite.offsetY = -30;
            app.tween(this.shieldSprite).to({
                offsetY: 0.0
            }, 0.5, "outBounce");
        } else
            this.shieldSprite.hide();
    },
    get groupInView() {
        return (this.group && this.group.inView) || this.inView;
    },
    die() {
        this.systemLight = false;
        this.state.set("dead");
        this.dead = true;
    },
    setKind(kind) {
        if (kind === "human")
            kind = Math.random() > 0.5 ? "female" : "male";
        this.bodySprite.prefix = `tribesman/${kind}/`;
        if (this.bodySprite.key)
            this.bodySprite.set(this.bodySprite.key);
    },
    updateTask() {
        if (this.task === COMMON.TASKS.FIGHT) {
            this.game.emote(this, "emote_alert");
        } else if (this.task === COMMON.TASKS.CAMP) {
            this.state.set("camp");
        } else if (this.task === COMMON.TASKS.MINE) {
            this.lookAt = this.destination;
            this.state.set("mine");
        } else if (this.task === COMMON.TASKS.HARVEST) {
            let object = this.collection.sid(this.detail);
            if (object instanceof CLIENT.Meadow) {
                let grass = Utils.minBy(object.grass, this.getGrassEaten);
                if (grass) {
                    grass.temp.eaten = 0.1;
                    this.lookAt = grass;
                    this.destination.x = grass.x + this.sin * 16;
                    this.destination.y = grass.y + this.cos * 16;
                }
            } else if (object) {
                this.lookAt = object;
                this.destination.x = object.x + this.sin * 16;
                this.destination.y = object.y + this.cos * 16;
            }
        } else if (this.task === COMMON.TASKS.BIRTH) {
            this.state.set("birth");
        } else if (this.task === COMMON.TASKS.LOOT) {
            this.state.set("loot");
        } else if (this.task === COMMON.TASKS.RECOVER) {
            this.state.set("recover");
        } else if (this.task === COMMON.TASKS.COLLECT) {
            this.state.set("collect");
        } else if (this.task === COMMON.TASKS.PANIC) {
            this.state.set("panic");
        } else if (this.task === COMMON.TASKS.DIE) {
            this.die();
        } else {
            this.state.set("idle");
        }
    },
    update(data) {
        if (data.group_sid !== undefined) {
            if (!data.group_sid && this.group)
                this.group.removeMember(this);
            if (data.group_sid) {
                if (this.group)
                    this.group.removeMember(this);
                this.group = this.collection.sid(data.group_sid);
                if (this.group)
                    this.group.addMember(this);
            }
        }
        if (data.x !== undefined && !this.groupInView)
            this.x = data.x;
        if (data.y !== undefined && !this.groupInView)
            this.y = data.y;
        if (data.parent_sid !== undefined) {
            if (!data.parent_sid) {
                if (this.parent) {
                    if (this.parent.minionLeave)
                        this.parent.minionLeave(this);
                }
            }
            if (data.parent_sid) {
                this.parent = this.collection.sid(data.parent_sid);
                if (this.parent) {
                    if (this.parent.minionEnter)
                        this.parent.minionEnter(this);
                }
            }
        }
        if (data.equipment !== undefined) {
            this.weapon = COMMON.itemsByIndex[data.equipment % 256].index;
            this.shield = COMMON.itemsByIndex[(data.equipment / 256 | 0) % 256].index;
            this.helmet = COMMON.itemsByIndex[(data.equipment / 65536 | 0) % 256].index;
            this.weaponDef = COMMON.itemsByIndex[this.weapon];
            this.helmetDef = COMMON.itemsByIndex[this.helmet];
            this.shieldDef = COMMON.itemsByIndex[this.shield];
            this.needRefreshSprites = true;
            if (this.group)
                this.group.updateAbilities();
        }
        if (data.remove) {
            if (this.groupInView) {
                this.lifespan = 5.0;
                app.tween(this.bodySprite).delay(3.0).to({
                    creation: 1.0
                }, 2.0);
                app.tween(this.legsSprite).delay(3.0).to({
                    creation: 1.0
                }, 2.0);
            } else {
                this.collection.remove(this);
            }
        }
        if (data.health !== undefined) {
            if (data.health <= 0)
                this.die();
            if (data.health < this.shared.health) {
                if (data.health > 0) {
                    if (this.inView) {
                        app.sound.play("human/pain_" + Utils.random(1, 3)).rate(3.0).gpan(this);
                        app.sound.play("weapon/hit").rrate(0.2).gpan(this);
                        app.sound.play("human/hit_flesh").rrate(0.2).gpan(this);
                    }
                } else {
                    if (this.inView) {
                        app.sound.play("human/hit_flesh").rrate(0.2).gpan(this);
                        app.sound.play("human/death_" + Utils.random(1, 3)).rate(2.0).rrate(0.1).gpan(this);
                    }
                }
                this.hitLifespan = 0.5;
                if (this.inView) {
                    let blood = this.collection.add("Sprite");
                    blood.set("fx/blood_1");
                    blood.follow = this;
                    blood.duration = 0.6;
                    blood.rotation = Math.random() * 6.28;
                    blood.scale.x = 0.5;
                    blood.scale.y = 0.5;
                }
            }
        }
        if (data.status !== undefined) {
            if (data.status & COMMON.STATUS.LOOTED) {
                this.setKind("corpse");
                Utils.arrayCall(this.sprites, "set", "fall_back");
                Utils.arraySet(this.sprites, "duration", 1.0);
                Utils.arraySet(this.sprites, "loop", false);
                Utils.arraySet(this.sprites, "range", [0, 8]);
                this.bodySprite.time = this.bodySprite.duration * 0.6;
                app.tween(this.weaponSprite).to({
                    dissolve: 1.0
                }, 1.0);
                app.tween(this.shieldSprite).to({
                    dissolve: 1.0
                }, 1.0);
                app.tween(this.helmetSprite).to({
                    dissolve: 1.0
                }, 1.0);
            }
        }
        if (data.occupation !== undefined) {
            this.task = data.occupation % 100;
            this.detail = data.occupation / 100 % 10000000 | 0;
            if (this.groupInView)
                this.updateTask();
        }
        Object.assign(this.shared, data);
    },
    getGrassEaten(g) {
        return g.temp.eaten;
    },
    getScore() {
        return Math.ceil(COMMON.getTribesmanScore(this) * 0.25);
    },
    run(texture) {
        this.texture = texture;
        this.ready = true;
    },
    step(dt) {
        this.tempIgnoreCollisions -= dt;
        if (!this.group && this.shared.group_sid) {
            this.group = this.collection.sid(this.shared.group_sid);
            if (this.group)
                this.group.addMember(this);
        }
        if (this.shared.health <= 0 && !this.dead)
            this.die();
        if (this.group) {
            this.basePoint.x = this.group.x + this.cos * 50;
            this.basePoint.y = this.group.y + this.sin * 50;
        } else {
            this.basePoint.x = this.x;
            this.basePoint.y = this.y;
        }
        if (this.group && this.inView && !Utils.quickPointInRange(this.group.x, this.group.y, this.x, this.y, 50)) {
            this.tempIgnoreCollisions = 1.0;
        }
        if (!this.inView) {
            if (this.group && !Utils.quickPointInRange(this.group.x, this.group.y, this.x, this.y, COMMON.TRIBE_RADIUS)) {
                this.x = this.group.x;
                this.y = this.group.y;
            }
            this.destination.x = this.x;
            this.destination.y = this.y;
            return;
        }
        this.state.step(app.elapsed);
        this.lifetime += dt;
        if (this.force) {
            this.force = Utils.moveTo(this.force, 0, 200 * dt);
            this.x += Math.cos(this.forceDirection) * this.force * dt;
            this.y += Math.sin(this.forceDirection) * this.force * dt;
        }
        if (this.hitLifespan > 0.0)
            this.hitLifespan -= dt;
        this.tween.step(dt);
        if (!this.dead) {
            this.processTask(dt);
            let distance = Utils.distance(this, this.destination);
            this.destinationDistance = distance;
            if (distance > 2 && !this.state.current.cantMove) {
                if (this.group && this.group === app.game.player && Utils.interval(this, "footstep", 0.5)) {
                    if (this.inGrass) {
                        app.sound.play("human/footstep_grass").volume(0.35).gpan(this).rate(1.0).rrate(0.1);
                    } else {
                        app.sound.play("human/footstep_b_" + Utils.random(1, 2)).volume(0.35).gpan(this).rrate(0.1);
                    }
                }
                let destinationAngle = Utils.lookAt(this, this.destination);
                if (this.task === COMMON.TASKS.CAMP)
                    distance *= this.random;
                let speed = distance + 32;
                this.x += Math.cos(destinationAngle) * (speed) * dt;
                this.y += Math.sin(destinationAngle) * (speed) * dt;
                this.legsSprite.unpause();
            } else {
                this.legsSprite.restart();
            }
            if (this.lookAt) {
                if (typeof this.lookAt === "number") {
                    this.direction = Utils.circWrapTo(this.direction, this.lookAt, 6 * app.elapsed);
                } else {
                    this.direction = Utils.circWrapTo(this.direction, Utils.lookAt(this, this.lookAt), 6 * app.elapsed);
                }
            }
        }
    },
    processTask(dt) {
        if (this.game.action.appliesTo && this.game.action.appliesTo(this))
            return;
        if (this.task === COMMON.TASKS.FIGHT) {
            let target = this.collection.sid(this.detail);
            if (!target)
                return;
            let angle = Utils.lookAt(target, this.group);
            if (target.weaponDef && target.weaponDef.melee) {
                let dir = Utils.lookAt(this.basePoint, target.basePoint ? target.basePoint : target) - Math.PI;
                if (target.detail === this.sid && this.id > target.id) {
                    this.destination.x = Utils.lerp(this.basePoint.x, target.group ? target.group.x : this.basePoint.x);
                    this.destination.y = Utils.lerp(this.basePoint.y, target.group ? target.group.y : this.basePoint.y);
                } else {
                    this.destination.x = target.x + this.cos * 24;
                    this.destination.y = target.y + this.sin * 24;
                }
                if (Utils.distance(this, this.group) > 100) {
                    let gangle = Utils.lookAt(this.group, this);
                }
            } else {
                this.destination.x = target.x + this.cos * 24;
                this.destination.y = target.y + this.sin * 24;
            }
            this.lookAt = target;
        } else if (this.task === COMMON.TASKS.CAMP) {
            let target = this.collection.sid(this.detail);
            if (!target)
                return;
            let s = Math.TAU / this.group.members.length;
            this.destination.x = target.x + Math.cos(s * this.i + this.random * 2) * (24 + this.random * 12);
            this.destination.y = target.y + Math.sin(s * this.i + this.random * 2) * (24 + this.random * 12);
            this.lookAt = target;
        } else if (this.task === COMMON.TASKS.MINE) {
            let target = this.collection.sid(this.detail);
            if (!target)
                return;
            let angle = this.random * 6.28;
            this.destination.x = target.minePosition.x + Math.cos(angle - Math.PI) * 16;
            this.destination.y = target.minePosition.y + Math.sin(angle - Math.PI) * 16;
            this.lookAt = target.minePosition;
        } else if (this.task === COMMON.TASKS.BUILD) {
            let target = this.collection.sid(this.detail);
            if (!target)
                return;
            let angle = this.random * 6.28;
            this.destination.x = target.x + Math.cos(angle) * 32;
            this.destination.y = target.y + Math.sin(angle) * 32;
            this.lookAt = target;
        } else if (this.task === COMMON.TASKS.DEMOLISH) {
            let target = this.collection.sid(this.detail);
            if (!target)
                return;
            let angle = Utils.lookAt(target, this);
            this.destination.x = target.x + Math.cos(angle) * 16;
            this.destination.y = target.y + Math.sin(angle) * 16;
            this.lookAt = target;
        } else if (this.task === COMMON.TASKS.LUMBER) {
            let target = this.collection.sid(this.detail);
            if (!target)
                return;
            let angle = this.random * 6.28;
            if (target.shared.state === COMMON.TREE_FALLING) {
                angle = Utils.lookAt(this, target);
                this.destination.x = target.x + Math.cos(angle - Math.PI) * 80;
                this.destination.y = target.y + Math.sin(angle - Math.PI) * 80;
                this.lookAt = target;
            } else if (target.shared.state === COMMON.TREE_FALLEN) {
                this.destination.x = target.center.x + Math.cos(angle) * (target.radius + this.radius);
                this.destination.y = target.center.y + Math.sin(angle) * (target.radius + this.radius);
                this.lookAt = target.center;
            } else {
                this.lookAt = target;
                this.destination.x = target.x + Math.cos(angle) * (target.radius + this.radius);
                this.destination.y = target.y + Math.sin(angle) * (target.radius + this.radius);
            }
        } else if (this.task === COMMON.TASKS.LOOT) {
            let target = this.collection.sid(this.detail);
            if (!target)
                return;
            let angle = Utils.lookAt(target, this);
            this.destination.x = target.x + Math.cos(angle) * 4;
            this.destination.y = target.y + Math.sin(angle) * 4;
            this.lookAt = target;
        } else if (this.task === COMMON.TASKS.COLLECT) {
            let target = this.collection.sid(this.detail);
            if (target && !this.state.data.crouching) {
                let angle = Utils.lookAt(target, this);
                this.destination.x = target.x + Math.cos(angle) * 4;
                this.destination.y = target.y + Math.sin(angle) * 4;
                this.lookAt = this.destination;
            }
        } else if (this.task === COMMON.TASKS.GET_INTO_BUILDING) {
            let target = this.collection.sid(this.detail);
            if (target) {
                this.destination.x = target.x;
                this.destination.y = target.y;
                this.lookAt = this.destination;
            }
        } else if (this.task === COMMON.TASKS.HUNT) {
            let target = this.collection.sid(this.detail);
            if (!target)
                return;
            if (!this.shared.parent_sid) {
                this.destination.x = this.group.x + Math.cos(this.random * 6.28) * 24;
                this.destination.y = this.group.y + Math.sin(this.random * 6.28) * 24;
            }
            this.lookAt = target;
        } else if (this.task === COMMON.TASKS.LEAD || this.helmet === COMMON.itemsByKey.crown.index) {
            this.destination.x = this.group.shared.x;
            this.destination.y = this.group.shared.y;
            this.lookAt = this.group.shared;
        } else if (this.task === COMMON.TASKS.IDLE) {
            this.destination.x = this.basePoint.x;
            this.destination.y = this.basePoint.y;
            this.destination.x = this.group.x + this.sin * 32;
            this.destination.y = this.group.y + this.cos * 32;
            if (this.group.shared.x !== this.group.x) {
                this.lookAt = Utils.lookAt(this.group, this.group.shared);
            } else {
                this.lookAt = this.group;
            }
        } else if (this.task === COMMON.TASKS.PANIC) {
            if (Utils.intervalRange(this, "panic", 0.25, 1.0)) {
                this.destination.x = this.basePoint.x + Utils.random(-COMMON.TRIBE_RADIUS, COMMON.TRIBE_RADIUS);
                this.destination.y = this.basePoint.y + Utils.random(-COMMON.TRIBE_RADIUS, COMMON.TRIBE_RADIUS);
                this.lookAt = this.destination;
            }
        }
    },
    legsY: [0, 0, 0.12697569202151154, 0.5555609039391696, 0.9148130001424937, 1.0, 1.0, 0.8774320490518326, 0.6621635047624876, 0.3537538161691129, 0.04154450834523172, 0, 0, 0.29563636715257974, 0.8015852396513293, 1, 1, 0.839389527701953, 0.4204586086644027, 0, 0],
    render() {
        if (false && this.group) {
            app.painter.reset();
            app.painter.color(0xffffff);
            app.painter.drawLine(this.x, this.y, this.group.x, this.group.y, 2);
        }
        if (this.needRefreshSprites)
            this.refreshSprites();
        let oy = this.legsY[this.legsSprite.frame] * 3 | 0;
        if (this.legsSprite.hidden)
            oy = 0;
        let row = Utils.dirrow(this.direction);
        this.legsSprite.x = this.x + this.ox;
        this.legsSprite.y = this.y - this.z - 4 - this.oy - this.oz;
        this.legsSprite.row = row;
        this.legsSprite.step(app.elapsed);
        this.legsSprite.render();
        if (this.hitLifespan > 0.0) {
            this.bodySprite.color.set(0xffffff, 1.0);
            this.legsSprite.color.set(0xffffff, 1.0);
            this.helmetSprite.color.set(0xffffff, 1.0);
        } else {
            this.bodySprite.color.set(0x000000, 0.0);
            this.legsSprite.color.set(0x000000, 0.0);
            this.helmetSprite.color.set(0x000000, 0.0);
        }
        if (this.shieldHit > 0.0) {
            this.shieldHit -= app.elapsed;
            this.shieldSprite.color.set(0xffffff);
        } else {
            this.shieldSprite.color.set(0, 0);
        }
        for (let sprite of this.sprites) {
            sprite.step(app.elapsed);
            sprite.x = this.legsSprite.x;
            sprite.y = this.legsSprite.y - oy;
            sprite.row = row;
            sprite.scale.x = this.scaleX;
            sprite.scale.y = this.scaleY;
            sprite.render();
        }
        if (this.highlighted) {
            app.painter.reset();
            app.painter.drawImageRegion(app.textures.spritesheet, 22, 75, 9, 6, this.x, this.y - this.z - this.oz - 20 + Math.sin(app.lifetime * 10.0) * 3 | 0, 9, 6);
            app.painter.color(0xffff00);
            app.painter.alpha(0.5);
            app.painter.drawSprite(this.bodySprite.fullKey, this.bodySprite.x, this.bodySprite.y, this.bodySprite.frame, this.bodySprite.row);
        }
        if (this.state.key === "camp" || app.keyboard.keys.shift) {}
        if (this.shared.health > 0)
            this.renderHealth();
    },
    renderHealth() {
        if (!app.game.player)
            return;
        app.painter.reset();
        let widthA = this.maxHealth * 2 + 1;
        let widthB = this.shared.health * 2;
        let x = this.x - widthA / 2 | 0;
        let y = this.y + 6 - this.oz | 0;
        app.painter.reset();
        app.painter.align(0, 0);
        app.painter.drawImageRegion(app.textures.spritesheet, 22, 82, widthA, 4, x, y, widthA, 4);
        if (this.group === this.game.player) {
            app.painter.drawImageRegion(app.textures.spritesheet, 22, 126, widthB, 4, x, y, widthB, 4);
        } else if (this.team === this.game.player.team) {
            app.painter.drawImageRegion(app.textures.spritesheet, 22, 131, widthB, 4, x, y, widthB, 4);
        } else {
            app.painter.drawImageRegion(app.textures.spritesheet, 22, 87, widthB, 4, x, y, widthB, 4);
        }
    }
};
CLIENT.Tribesman.States = {};
CLIENT.Tribesman.States.idle = {
    enter(tribesman, manager) {
        manager.data.state = "none";
    },
    step(tribesman, manager, dt) {
        if (manager.data.delay > 0) {
            manager.data.delay -= dt;
            return
        }
        let state = "none";
        if (tribesman.game.action.current.appliesTo && tribesman.game.action.current.appliesTo(tribesman)) {
            state = "reaching";
        } else {
            state = "idle";
        }
        if (manager.data.state !== state && tribesman.inView) {
            manager.data.state = state;
            if (state === "reaching") {
                Utils.arrayCall(tribesman.sprites, "set", "reach");
                Utils.arraySet(tribesman.sprites, "range", [0, 1]);
                Utils.arraySet(tribesman.sprites, "duration", 0.25);
                tribesman.legsSprite.show();
                tribesman.lookAt = tribesman.game.pointer;
                manager.data.crouching = false;
                manager.data.reaching = true;
            } else if (state === "idle") {
                manager.data.reaching = false;
                Utils.arrayCall(tribesman.sprites, "set", "run");
                Utils.arraySet(tribesman.sprites, "duration", 1.0);
                Utils.arraySet(tribesman.sprites, "range", false);
                Utils.arraySet(tribesman.sprites, "loop", true);
                tribesman.legsSprite.show();
                tribesman.lookAt = tribesman.group;
            }
        }
    }
};
CLIENT.Tribesman.States.panic = {
    enter(tribesman, manager) {
        Utils.arrayCall(tribesman.sprites, "set", "growl");
        Utils.arraySet(tribesman.sprites, "duration", 1.0);
        Utils.arraySet(tribesman.sprites, "range", false);
        Utils.arraySet(tribesman.sprites, "loop", true);
        tribesman.legsSprite.show();
        tribesman.lookAt = tribesman.destination;
    }
};
CLIENT.Tribesman.States.birth = {
    enter(tribesman) {
        Utils.arrayCall(tribesman.sprites, "set", "roll");
        Utils.arraySet(tribesman.sprites, "duration", 1.5);
        Utils.arraySet(tribesman.sprites, "loop", 0.5);
        tribesman.legsSprite.hide();
        tribesman.z = 32;
        app.tween(tribesman).to({
            z: 0
        }, 2.0, "outBounce");
    },
    step(tribesman, manager) {
        if (manager.elapsed > 3.0)
            manager.set("idle");
        if (manager.runOnce(0.8)) {
            app.sound.play("human/pain_1").gpan(tribesman).rate(1.5).rrate(0.1);
            app.sound.play("impact/ground").gpan(tribesman);
            let debris = tribesman.collection.add("Sprite");
            debris.set("fx/debris");
            debris.scale.x = 0.25;
            debris.scale.y = 0.25;
            debris.x = tribesman.x;
            debris.y = tribesman.y - 8;
            debris.duration = 0.5;
            debris.rotation = Math.PI;
        }
        if (manager.runOnce(1.5)) {
            app.sound.play("impact/ground").gpan(tribesman).delay(0.5).volume(0.6);
            Utils.arrayCall(tribesman.sprites, "set", "fall_front");
            Utils.arraySet(tribesman.sprites, "duration", 1.5);
            Utils.arraySet(tribesman.sprites, "loop", false);
        }
    }
};
CLIENT.Tribesman.States.recover = {
    cantMove: true,
    enter(tribesman) {}
};
CLIENT.Tribesman.States.shoot = {
    enter(tribesman, manager, args) {
        Utils.arrayCall(tribesman.sprites, "set", "charge_bow");
        Utils.arraySet(tribesman.sprites, "duration", 0.5);
        Utils.arraySet(tribesman.sprites, "range", false);
        Utils.arraySet(tribesman.sprites, "loop", false);
        app.sound.play("bow/pull").rate(1.2).volume(0.45).gpan(tribesman);
        manager.data.shoot = false;
        let target = tribesman.collection.sid(tribesman.detail);
        if (!target)
            return manager.set("idle");
        let distance = Utils.distance(tribesman, target);
        manager.data.flightDuration = 0.1 + Math.min(0.9, distance / 100);
        manager.data.miss = args.miss || 0;
        manager.data.count = args.count || 0;
        if (args.shock) {
            manager.data.flightDuration = Math.min(0.5, distance / 300);
        }
        manager.data.shock = args.shock;
    },
    step(tribesman, manager) {
        if (manager.elapsed > 2.0 - manager.data.flightDuration && !manager.data.shoot) {
            manager.data.shoot = true;
            for (var i = 0; i < manager.data.count; i++) {
                let delay = i * 0.2;
                let arrow = tribesman.collection.add("Arrow");
                let target = tribesman.collection.sid(tribesman.detail);
                if (manager.data.shock)
                    arrow.straight = true;
                arrow.sprite.palette = tribesman.group.palette;
                arrow.x = tribesman.x;
                arrow.y = tribesman.y;
                arrow.z = tribesman.z + tribesman.oz;
                arrow.delay = delay;
                arrow.miss = false;
                if (i < manager.data.miss) {
                    arrow.miss = true;
                }
                arrow.duration = manager.data.flightDuration + delay;
                arrow.target = target;
                arrow.run();
            }
            app.sound.play("bow/shoot").rate(manager.data.shock ? 1.5 : 1.0).gpan(tribesman);
            if (manager.data.shock) {
                app.sound.play("bow/shock_arrow").rate(2.8).rrate(0.1).gpan(tribesman);
            }
            Utils.arrayCall(tribesman.sprites, "set", "attack_bow");
            Utils.arraySet(tribesman.sprites, "duration", 0.5);
            Utils.arraySet(tribesman.sprites, "range", false);
            Utils.arraySet(tribesman.sprites, "loop", false);
        }
    }
};
CLIENT.Tribesman.States.chop = {
    enter(tribesman, manager) {
        if (tribesman.inView) {
            let target = tribesman.collection.sid(tribesman.detail);
            manager.data.target = target;
            tribesman.force = 55;
            tribesman.forceDirection = tribesman.direction;
            app.sound.play("weapon/whoosh_" + Utils.random(1, 3)).gpan(tribesman);
            Utils.arrayCall(tribesman.sprites, "set", target.shared.state === COMMON.TREE_FALLEN ? "attack_vertical" : "attack_horizontal");
            Utils.arraySet(tribesman.sprites, "loop", false);
            Utils.arraySet(tribesman.sprites, "duration", 0.3);
            let slash = tribesman.collection.add("Sprite");
            slash.set(target.shared.state === COMMON.TREE_FALLEN ? "slash/vertical" : "slash/horizontal");
            slash.follow = tribesman;
            slash.row = Utils.dirrow(tribesman.direction, 16);
            slash.offsetY = -8;
            slash.duration = 0.25;
            manager.data.hit = false;
        }
    },
    step(tribesman, manager) {
        if (manager.elapsed > 0.15 && !manager.data.hit) {
            tribesman.force = 100;
            tribesman.forceDirection = tribesman.direction - Math.PI;
            manager.data.hit = true;
            if (manager.data.target.onHit)
                manager.data.target.onHit();
        }
        ;if (manager.elapsed > 0.5)
            manager.set("idle");
    }
};
CLIENT.Tribesman.States.harvest = {
    enter(tribesman, manager) {
        if (tribesman.inView) {
            let target = tribesman.lookAt;
            if (target._remove)
                return;
            if (!target)
                return;
            if (!target.temp)
                return;
            target.temp.eaten = 2.0;
            app.sound.play("action/harvest").rate(1.0).rrate(0.2).gpan(tribesman);
            app.sound.play("impact/grass").rate(0.5).gpan(tribesman);
            Utils.arrayCall(tribesman.sprites, "set", "spin");
            Utils.arraySet(tribesman.sprites, "loop", false);
            Utils.arraySet(tribesman.sprites, "duration", 0.4);
            let slash = tribesman.collection.add("Sprite");
            slash.set("slash/spin");
            slash.follow = tribesman;
            slash.row = Utils.dirrow(tribesman.direction, 16);
            slash.offsetY = -8;
            slash.duration = 0.4;
            manager.data.hit = false;
        }
    }
};
CLIENT.Tribesman.States.mine = {
    enter(tribesman, manager) {
        if (tribesman.inView) {
            let target = tribesman.collection.sid(tribesman.detail);
            manager.data.target = target;
            if (!target)
                manager.set("idle");
            tribesman.force = 55;
            tribesman.forceDirection = tribesman.direction;
            app.sound.play("weapon/whoosh_" + Utils.random(1, 3)).gpan(tribesman);
            Utils.arrayCall(tribesman.sprites, "set", "attack_vertical");
            Utils.arraySet(tribesman.sprites, "loop", false);
            Utils.arraySet(tribesman.sprites, "duration", 0.3);
            let slash = tribesman.collection.add("Sprite");
            slash.set("slash/vertical");
            slash.follow = tribesman;
            slash.row = Utils.dirrow(tribesman.direction, 16);
            slash.offsetY = -8;
            slash.duration = 0.25;
            manager.data.hit = false;
        }
    },
    step(tribesman, manager) {
        if (manager.elapsed > 0.15 && !manager.data.hit) {
            tribesman.force = 100;
            tribesman.forceDirection = tribesman.direction - Math.PI;
            manager.data.hit = true;
            let target = manager.data.target;
            if (target)
                target.mine();
        }
        ;if (manager.elapsed > 0.5)
            manager.set("idle");
    }
};
CLIENT.Tribesman.States.build = {
    enter(tribesman, manager) {
        if (tribesman.inView) {
            let target = tribesman.collection.sid(tribesman.detail);
            manager.data.target = target;
            if (!target)
                manager.set("idle");
            tribesman.forceDirection = tribesman.direction;
            app.sound.play("weapon/whoosh_" + Utils.random(1, 3)).gpan(tribesman);
            Utils.arrayCall(tribesman.sprites, "set", "attack_vertical");
            Utils.arraySet(tribesman.sprites, "loop", false);
            Utils.arraySet(tribesman.sprites, "duration", 0.3);
            let slash = tribesman.collection.add("Sprite");
            slash.set("slash/vertical");
            slash.follow = tribesman;
            slash.row = Utils.dirrow(tribesman.direction, 16);
            slash.offsetY = -8;
            slash.duration = 0.25;
            manager.data.hit = false;
        }
    },
    step(tribesman, manager) {
        if (manager.elapsed > 0.15 && !manager.data.hit) {
            manager.data.hit = true;
            let target = manager.data.target;
            let x = tribesman.x + Math.cos(tribesman.direction) * 16;
            let y = tribesman.y + Math.sin(tribesman.direction) * 16;
            if (target)
                target.build(x, y);
        }
        ;if (manager.elapsed > 0.5) {
            manager.set("idle");
            tribesman.random = Math.random();
        }
    }
};
CLIENT.Tribesman.States.block = {
    enter(tribesman, manager) {
        Utils.arrayCall(tribesman.sprites, "set", "block");
        Utils.arraySet(tribesman.sprites, "loop", false);
        Utils.arraySet(tribesman.sprites, "duration", 0.5);
        tribesman.force = 100;
        tribesman.forceDirection = tribesman.direction - Math.PI;
        tribesman.shieldHit = 0.5;
        app.sound.play("weapon/shield_block").gpan(tribesman);
    }
};
CLIENT.Tribesman.States.hurt = {
    enter(tribesman, manager) {
        Utils.arrayCall(tribesman.sprites, "set", "stunned");
        Utils.arraySet(tribesman.sprites, "loop", true);
        Utils.arraySet(tribesman.sprites, "duration", 1.0);
        tribesman.force = 100;
        tribesman.forceDirection = tribesman.direction - Math.PI;
    },
    step(tribesman, manager) {
        if (manager.elapsed > 1.0)
            manager.set("idle");
    }
};
CLIENT.Tribesman.States.fallBack = {
    enter(tribesman, manager) {
        Utils.arrayCall(tribesman.sprites, "set", "fall_back");
        Utils.arraySet(tribesman.sprites, "loop", false);
        Utils.arraySet(tribesman.sprites, "duration", 2.0);
        tribesman.force = 150;
        tribesman.forceDirection = tribesman.direction - Math.PI;
    },
    step(tribesman, manager) {
        if (manager.elapsed > 2.0)
            manager.set("idle");
    }
};
CLIENT.Tribesman.States.attack = {
    moves: ["attack_horizontal", "attack_vertical", "spin", "kick", "spear_attack"],
    slashes: ["horizontal", "vertical", "spin", "vertical", "vertical"],
    enter(tribesman, manager) {
        if (tribesman.inView) {
            manager.data.target = tribesman.collection.sid(tribesman.detail);
            app.sound.play("human/attack_" + Utils.random(1, 3)).rate(2.0).rrate(0.5).gpan(tribesman);
            tribesman.force = 75;
            tribesman.forceDirection = tribesman.direction;
            app.sound.play("weapon/whoosh_" + Utils.random(1, 3)).gpan(tribesman);
            let moveIndex = Utils.random(0, 3);
            if (tribesman.weaponDef.backstab)
                moveIndex = 4;
            Utils.arrayCall(tribesman.sprites, "set", this.moves[moveIndex]);
            Utils.arraySet(tribesman.sprites, "loop", false);
            Utils.arraySet(tribesman.sprites, "duration", 0.25);
            let slash = tribesman.collection.add("Sprite");
            slash.set("slash/" + this.slashes[moveIndex]);
            slash.follow = tribesman;
            slash.row = Utils.dirrow(tribesman.direction, 16);
            slash.offsetY = -8;
            slash.duration = 0.15;
            slash.blendDst = app.gl.ONE;
            if (Math.random() > 0.5) {
                app.tween(tribesman).to({
                    z: 10
                }, 0.3).to({
                    z: 0
                }, 0.7, "outBounce");
            }
        }
    },
    step(tribesman, manager) {
        if (manager.runOnce(0.15)) {
            if (manager.data.target && manager.data.target.handleHit) {
                manager.data.target.handleHit(0, tribesman);
                manager.data.target.fallDirection = Utils.lookAt(tribesman, manager.data.target);
            }
        }
        if (manager.elapsed > 0.5)
            manager.set("idle");
    }
};
CLIENT.Tribesman.States.loot = {
    enter(tribesman, manager) {
        manager.data.crouching = false;
    },
    step(tribesman, manager) {
        if (!manager.data.crouching && (tribesman.destinationDistance < 2)) {
            manager.data.crouching = true;
            Utils.arrayCall(tribesman.sprites, "set", "operate_ground");
            Utils.arraySet(tribesman.sprites, "loop", true);
            Utils.arraySet(tribesman.sprites, "duration", 0.5);
            let target = tribesman.collection.sid(tribesman.detail);
            if (target.team === tribesman.team)
                app.sound.play("human/cry_" + Utils.random(1, 4)).gpan(tribesman).rate(1.4);
            tribesman.legsSprite.hide();
        }
        if (manager.elapsed > 1.0 && Utils.interval(tribesman, "loot", 0.2)) {
            let target = tribesman.collection.sid(tribesman.detail);
            target.oy = Utils.random(-2, 0);
            app.sound.play("action/loot_" + Utils.random(1, 3)).rrate(0.2).volume(Utils.randomf(0.3, 0.8)).gpan(tribesman);
        }
    },
    leave(tribesman) {
        Utils.arrayCall(tribesman.sprites, "set", "operate_ground");
        Utils.arraySet(tribesman.sprites, "loop", false);
        Utils.arraySet(tribesman.sprites, "duration", 0.5);
        Utils.arraySet(tribesman.sprites, "range", [7, 9]);
    }
};
CLIENT.Tribesman.States.collect = {
    enter(tribesman, manager) {
        manager.data.crouching = false;
        manager.data.collected = false;
        manager.data.collectible = tribesman.collection.sid(tribesman.detail);
    },
    step(tribesman, manager) {
        if (!manager.data.collectible)
            return;
        if (manager.data.collectible._remove)
            return manager.set("idle");
        if (!manager.data.crouching && tribesman.destinationDistance < 2) {
            Utils.arrayCall(tribesman.sprites, "set", "operate_ground");
            Utils.arraySet(tribesman.sprites, "loop", true);
            Utils.arraySet(tribesman.sprites, "duration", 2.0);
        }
        if (manager.elapsed > 1.5 && !manager.data.collected) {
            app.sound.play("action/throw").rate(1.5).gpan(tribesman);
            Utils.arrayCall(tribesman.sprites, "set", "operate_ground");
            Utils.arraySet(tribesman.sprites, "loop", false);
            Utils.arraySet(tribesman.sprites, "duration", 0.2);
            manager.data.crouching = true;
            tribesman.legsSprite.hide();
            manager.data.collected = true;
            let target = manager.data.collectible;
            let duration = 0.5;
            if (tribesman.group === app.game.player && target.shared.key === "chest")
                app.game.score(1, target.x, target.y);
            app.tween(target).to({
                z: 20
            }, duration * 0.5).to({
                z: 6,
                scale: 0.0,
            }, duration * 0.5);
            app.tween(target).to({
                x: target.x + Math.cos(tribesman.direction - Math.PI) * 8,
                y: target.y + Math.sin(tribesman.direction - Math.PI) * 8
            }, duration).once("finished", function() {
                target.blink();
                target.hidden = true;
                if (target.beingCollected)
                    target.beingCollected(tribesman);
            });
        }
    },
    leave(tribesman) {}
};
CLIENT.Tribesman.States.camp = {
    enter(tribesman, manager) {
        manager.data.crouching = false;
    },
    step(tribesman, manager) {
        if (tribesman.game.pointer.alert && COMMON.canEquip(tribesman, tribesman.game.action.data.equipment)) {
            if (!manager.data.reaching) {
                Utils.arrayCall(tribesman.sprites, "set", "reach");
                Utils.arraySet(tribesman.sprites, "range", [0, 1]);
                Utils.arraySet(tribesman.sprites, "duration", 0.25);
                tribesman.legsSprite.show();
                tribesman.lookAt = tribesman.game.pointer;
                manager.data.crouching = false;
                manager.data.reaching = true;
            }
            return;
        } else {
            manager.data.reaching = false;
        }
        if (!manager.data.crouching && tribesman.destinationDistance < 2) {
            manager.data.crouching = true;
            Utils.arrayCall(tribesman.sprites, "set", "sit");
            Utils.arraySet(tribesman.sprites, "loop", false);
            Utils.arraySet(tribesman.sprites, "duration", 1.0);
            Utils.arraySet(tribesman.sprites, "range", [0, 2]);
            tribesman.legsSprite.hide();
        } else if (manager.data.crouching && tribesman.bodySprite.progress >= 1.0 && !tribesman.loop) {
            Utils.arrayCall(tribesman.sprites, "set", "sit");
            Utils.arraySet(tribesman.sprites, "loop", true);
            Utils.arraySet(tribesman.sprites, "duration", 1.5);
            Utils.arraySet(tribesman.sprites, "range", [2, 7]);
        }
        if (tribesman.destinationDistance > 3) {
            if (manager.data.crouching) {
                Utils.arraySet(tribesman.sprites, "range", [2, 10]);
                Utils.arraySet(tribesman.sprites, "loop", false);
                Utils.arraySet(tribesman.sprites, "time", tribesman.bodySprite.time * 0.5 / tribesman.bodySprite.duration);
                Utils.arraySet(tribesman.sprites, "duration", 0.5);
                manager.data.crouching = false;
            } else if (tribesman.bodySprite.key === "sit" && tribesman.bodySprite.progress >= 1.0) {
                Utils.arrayCall(tribesman.sprites, "set", "run");
                Utils.arraySet(tribesman.sprites, "duration", 1.0);
                Utils.arraySet(tribesman.sprites, "range", false);
                Utils.arraySet(tribesman.sprites, "loop", true);
                tribesman.legsSprite.show();
            }
        }
    },
    leave(tribesman) {
        Utils.arrayCall(tribesman.sprites, "set", "sit");
        Utils.arraySet(tribesman.sprites, "loop", false);
        Utils.arraySet(tribesman.sprites, "duration", 0.5);
        Utils.arraySet(tribesman.sprites, "range", [8, 11]);
    }
};
CLIENT.Tribesman.States.dead = {
    enter(tribesman) {
        tribesman.dead = true;
        tribesman.zIndex = 0;
        tribesman.force = Utils.random(100, 180);
        tribesman.forceDirection = tribesman.fallDirection;
        if (Math.random() > 0.5) {
            Utils.arrayCall(tribesman.sprites, "set", "fall_back");
        } else {
            Utils.arrayCall(tribesman.sprites, "set", "fall_front");
            app.tween(tribesman).to({
                direction: tribesman.forceDirection + "rad"
            }, 0.5);
        }
        Utils.arraySet(tribesman.sprites, "duration", 1.0);
        Utils.arraySet(tribesman.sprites, "loop", false);
        Utils.arraySet(tribesman.sprites, "range", [0, 8]);
        tribesman.legsSprite.hide();
        if (Math.random() > 0.5) {
            app.tween(tribesman).to({
                z: 10
            }, 0.3).to({
                z: 0
            }, 0.7, "outBounce");
        }
    },
    step(tribesman, manager) {
        if (manager.elapsed < 0.5) {
            if (Math.random() > 0.5) {
                let blood = tribesman.collection.add("Sprite");
                blood.x = tribesman.x;
                blood.y = tribesman.y;
                blood.set("fx/blood_1");
                blood.duration = Utils.randomf(0.25, 1.0);
                blood.rotation = Math.random() * 6.28;
                let bloodScale = Utils.randomf(0.1, 0.3);
                blood.scale.x = bloodScale;
                blood.scale.y = bloodScale;
                app.tween(blood).to({
                    offsetY: -20 * Math.random()
                }, blood.duration * 0.3).to({
                    offsetY: 0
                }, blood.duration * 0.3);
            }
        }
    }
};