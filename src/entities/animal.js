// animal code

NAMESPACE.Animal = function(args) {
    this.lifetime = Math.random();
    this.fallDirection = 0;
    this.speed = 1.0;
    this.x = Math.random() * 100;
    this.y = Math.random() * 100;
    this.z = 0;
    this.i = 0;
    this.ox = 0;
    this.oy = 0;
    this.force = 0;
    this.forceDirection = 0;
    this.direction = Math.random() * 6;
    this.destinationDistance = 0;
    this.dead = false;
    this.destination = {};
    this.lookAt = null;
    Object.assign(this, args);
    this.tween = new CLIENT.FollowingTween(this);
    this.group = this.collection.sid(this.shared.group_sid);
    this.inX = Utils.random(-16, 16);
    this.inY = Utils.random(-16, 16);
    if (this.group) {
        this.x = this.group.x + Utils.random(-16, 16);
        this.y = this.group.y + Utils.random(-16, 16);
        this.group.addMember(this);
    } else {
        this.x = args.shared.x + Utils.random(-COMMON.TRIBE_RADIUS * 0.5, COMMON.TRIBE_RADIUS * 0.5);
        this.y = args.shared.y + Utils.random(-COMMON.TRIBE_RADIUS * 0.5, COMMON.TRIBE_RADIUS * 0.5);
    }
    this.state = new CLIENT.State(this,CLIENT.Animal.Rabbit);
    this.sprite = new CLIENT.Sprite;
    this.sprite.set("rabbit/run");
    this.sprite.loop = true;
    this.random = Math.random();
    this.task = 0;
    this.detail = 0;
    this.destination.x = this.x;
    this.destination.y = this.y;
    this.moveGrass = true;
    this.sin = Math.sin(this.random * 6.28);
    this.cos = Math.cos(this.random * 6.28);
    this.palette = Utils.random(0, 2);
    if (this.palette > 0)
        this.palette += COMMON.ANIMAL_PALETTE - 1;
    this.sprite.palette = this.palette;
    this.update(this.shared);
}
;
NAMESPACE.Animal.prototype = {
    constructor: NAMESPACE.Animal,
    zIndex: 1,
    radius: 8,
    collisionRadius: 1,
    shape: COMMON.CIRCLE,
    systemLight: 12,
    systemShadow: 5,
    tooltip: "A minion with a bow\ncan hunt down animals.",
    groups: ["interactive"],
    _destruct: function() {},
    enterview() {
        this.updateTask();
    },
    getScore() {
        return 1;
    },
    handleHit(damage, projectile) {
        if (this.inView) {
            app.sound.play("animal/rabbit/pain").rate(6.0).rrate(0.1).gpan(this);
        }
        this.hitLifespan = 0.4;
        let blood = this.collection.add("Sprite");
        blood.follow = this;
        blood.set("fx/blood_1");
        blood.duration = 0.5;
        blood.rotation = Math.random() * 6.28;
        blood.scale.x = 0.35;
        blood.scale.y = 0.35;
    },
    die() {
        this.state.set("dead");
        this.dead = true;
        if (this.inView)
            app.sound.play("animal/rabbit/death").rate(4.0).rrate(0.1).gpan(this);
    },
    get groupInView() {
        return true;
        return (this.group && this.group.inView) || this.inView;
    },
    update(data) {
        if (data.remove) {
            if (this.groupInView) {
                this.lifespan = 5.0;
                app.tween(this.sprite).delay(3.0).to({
                    creation: 1.0
                }, 2.0);
            } else {
                this.collection.remove(this);
            }
        }
        if (data.health !== undefined) {
            if (data.health < this.shared.health) {}
            if (data.health <= 0)
                this.die();
        }
        if (data.status !== undefined) {
            if (data.status & COMMON.STATUS.LOOTED) {}
        }
        if (data.x !== undefined && !this.inView)
            this.x = data.x;
        if (data.y !== undefined && !this.inView)
            this.y = data.y;
        if (!this.dead && data.occupation !== undefined) {
            this.task = data.occupation % 100;
            this.detail = data.occupation / 100 % 10000000 | 0;
            this.updateTask();
        }
        Object.assign(this.shared, data);
    },
    updateTask() {
        if (this.task === COMMON.TASKS.RUN) {
            this.state.set("run");
        } else if (this.task === COMMON.TASKS.FIGHT) {} else if (this.task === COMMON.TASKS.EAT) {
            this.state.set("eat");
        } else if (this.task === COMMON.TASKS.RECOVER) {
            this.state.set("recover");
        } else {
            this.state.set("idle");
        }
    },
    step(dt) {
        if (!this.inView) {
            if (this.group) {
                this.x = this.group.x;
                this.y = this.group.y;
                this.destination.x = this.x;
                this.destination.y = this.y;
            }
            return;
        }
        this.lifetime += dt;
        this.state.step(app.elapsed);
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
            if (distance > 1) {
                if (!this.inView)
                    this.speed = 1.0;
                let destinationAngle = Utils.lookAt(this, this.destination);
                this.x += Math.cos(destinationAngle) * (distance + 8) * dt * this.speed;
                this.y += Math.sin(destinationAngle) * (distance + 8) * dt * this.speed;
            }
            if (this.lookAt) {
                if (typeof this.lookAt === "number") {
                    this.direction = Utils.circWrapTo(this.direction, this.lookAt, 6 * app.elapsed);
                } else {
                    this.direction = Utils.circWrapTo(this.direction, Utils.lookAt(this, this.lookAt), 6 * app.elapsed);
                }
            }
            CLIENT.Animal.Rabbit.movement(this);
        }
    },
    processTask(dt) {
        if (this.task === COMMON.TASKS.RUN) {
            this.destination.x = this.group.x + this.inX;
            this.destination.y = this.group.y + this.inY;
            this.lookAt = this.destination;
        } else if (this.task === COMMON.TASKS.LOOT) {} else {}
    },
    render() {
        let row = Utils.dirrow(this.direction, 16);
        if (this.hitLifespan > 0.0) {
            if (app.lifetime % 0.1 < 0.05)
                this.sprite.color.set(0xffffff, 1.0);
            else
                this.sprite.color.set(0, 0);
        } else {
            this.sprite.color.set(0, 0);
        }
        this.sprite.step(app.elapsed);
        this.sprite.x = this.x + this.ox;
        this.sprite.y = this.y - this.z + this.oy - 6;
        this.sprite.row = row;
        this.sprite.render();
    }
};
CLIENT.Animal.Rabbit = {};
CLIENT.Animal.Rabbit.movement = function(rabbit) {
    if (rabbit.destinationDistance > 2) {
        rabbit.speed = (rabbit.sprite.frame >= 1 && rabbit.sprite.frame < 6) ? 0.5 * (5 - rabbit.sprite.frame) : 0.0;
        rabbit.sprite.z = rabbit.speed * 2;
    } else
        rabbit.sprite.z = 0.0;
}
;
CLIENT.Animal.Rabbit.run = {
    enter(rabbit, manager) {
        rabbit.speed = 1.0;
        rabbit.sprite.set("rabbit/run");
        rabbit.sprite.loop = true;
        rabbit.sprite.duration = 0.5;
        rabbit.sprite.delay = Math.random();
    },
    step(rabbit) {}
};
CLIENT.Animal.Rabbit.eat = {
    enter(rabbit, manager) {
        manager.data.meadow = rabbit.collection.sid(rabbit.detail);
        manager.data.grass = null;
        manager.data.change_grass_timeout = Utils.random(5, 16);
        manager.data.delay = Math.random() * 2.0;
    },
    leastEaten(o) {
        return o.temp.eaten;
    },
    step(rabbit, manager, dt) {
        let data = manager.data;
        if (data.delay > 0)
            return data.delay -= dt;
        if (!data.meadow)
            return;
        if (data.grass && data.grass._remove)
            data.grass = null;
        if (data.grass && data.grass.creation)
            data.grass = null;
        if (Utils.interval(rabbit, "change_grass", manager.data.change_grass_timeout)) {
            manager.data.change_grass_timeout = Utils.random(5, 16);
            data.grass = null;
        }
        if (!data.grass && data.meadow.grass.length) {
            data.grass = Utils.random(data.meadow.grass);
        }
        if (data.grass) {
            rabbit.destination.x = data.grass.x + rabbit.sin * 8;
            rabbit.destination.y = data.grass.y + rabbit.cos * 8;
            rabbit.lookAt = data.grass;
            if (rabbit.destinationDistance > 2 && rabbit.sprite.key !== "rabbit/run") {
                rabbit.sprite.set("rabbit/run");
                rabbit.sprite.loop = true;
                rabbit.sprite.duration = 0.5;
            }
            if (rabbit.destinationDistance <= 2 && rabbit.sprite.key !== "rabbit/idle") {
                rabbit.sprite.set("rabbit/idle");
                rabbit.sprite.loop = true;
                rabbit.sprite.duration = 1.0;
            }
            if (rabbit.destinationDistance <= 2) {
                data.grass.temp.eaten = 1.0;
                data.grass.offsetX = Math.sin(app.lifetime * 2);
                data.grass.offsetY = Math.cos(app.lifetime * 4);
            }
        }
    }
};
CLIENT.Animal.Rabbit.idle = {
    enter(rabbit, manager) {
        manager.data.moveCooldown = Math.random() * 5.0;
        manager.data.alertCooldown = 1.0 + Math.random() * 5.0;
        manager.data.rotationTimeout = Math.random() * 2.0;
        manager.data.lifetime = 0.0;
        rabbit.sprite.set("rabbit/run");
        rabbit.sprite.loop = true;
        rabbit.sprite.duration = 5.5;
    },
    step(rabbit, manager, dt) {
        if (manager.data.delay > 0) {
            manager.data.delay -= dt;
            return;
        }
        manager.data.lifetime += dt;
        if (Utils.interval(manager.data, "think", 0.1)) {
            if (Utils.interval(manager.data, "change_position", manager.data.moveCooldown)) {
                manager.data.moveCooldown = 3.0 + Math.random() * 8.0;
                manager.data.alertCooldown = 1.0 + Math.random() * 10.0;
                if (rabbit.group) {
                    rabbit.destination.x = rabbit.group.x + Utils.random(-50, 50);
                    rabbit.destination.y = rabbit.group.y + Utils.random(-50, 50);
                }
                return;
            }
            if (rabbit.destinationDistance > 2) {
                rabbit.lookAt = rabbit.destination;
                if (rabbit.sprite.key !== "rabbit/run") {
                    rabbit.sprite.set("rabbit/run");
                    rabbit.sprite.loop = true;
                    rabbit.sprite.duration = 0.5;
                }
            } else {
                if (Utils.interval(manager.data, "alert", manager.data.alertCooldown)) {
                    manager.data.delay = 1.0 + Math.random() * 3.0;
                    manager.data.alertCooldown = manager.data.delay + 1.0 + Math.random() * 10.0;
                    rabbit.sprite.set("rabbit/alert");
                    rabbit.sprite.duration = 0.25;
                } else if (rabbit.sprite.key !== "rabbit/idle") {
                    rabbit.sprite.set("rabbit/idle");
                    rabbit.sprite.loop = true;
                    rabbit.sprite.duration = 1.0;
                    manager.data.delay = 1.0;
                }
                if (Utils.interval(manager.data, "rotation_timeout", manager.data.rotationTimeout)) {
                    manager.data.rotationTimeout = 0.5 + Math.random() * 2.0;
                    rabbit.lookAt = Math.random() * 6.28;
                }
            }
        }
    }
};
CLIENT.Animal.Rabbit.dead = {
    enter(rabbit) {
        rabbit.zIndex = 0;
        rabbit.sprite.set("rabbit/death");
        rabbit.sprite.loop = false;
        rabbit.sprite.duration = 0.5;
        rabbit.force = Utils.random(100, 180);
        rabbit.forceDirection = rabbit.fallDirection;
    },
    step(rabbit, manager) {
        if (manager.elapsed < 0.5) {
            if (Math.random() > 0.5) {
                let blood = rabbit.collection.add("Sprite");
                blood.x = rabbit.x;
                blood.y = rabbit.y;
                blood.set("fx/blood_1");
                blood.duration = Utils.randomf(0.25, 1.0);
                blood.rotation = Math.random() * 6.28;
                let bloodScale = Utils.randomf(0.05, 0.2);
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