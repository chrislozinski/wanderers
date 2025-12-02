// this is for the tribe you have following you 

CLIENT.Tribe = function(args) {
    this.x = 0;
    this.y = 0;
    Object.assign(this, args);
    this.tween = new CLIENT.Tween(this);
    this.update(this.shared);
}
;
CLIENT.Tribe.prototype = {
    constructor: CLIENT.Tribe,
    shape: COMMON.CIRCLE,
    radius: 100,
    enterview() {},
    leaveview() {},
    addMember(ship) {
        this.ships.push(ship);
    },
    update(data) {
        if (this.inView) {
            if (data.x !== undefined)
                this.tween.to("x", data.x, COMMON.TWEEN_DURATION);
            if (data.y !== undefined)
                this.tween.to("y", data.y, COMMON.TWEEN_DURATION);
        } else {
            if (data.x !== undefined)
                this.x = data.x;
            if (data.y !== undefined)
                this.y = data.y;
        }
        Object.assign(this.shared, data);
    },
    step(dt) {
        this.tween.step(dt);
    },
    render() {}
};

CLIENT.Tribe = function(args) {
    this.tx = 0;
    this.ty = 0;
    this.x = 0;
    this.y = 0;
    this.level = 0;
    Object.assign(this, args);
    this.tween = new CLIENT.Tween(this);
    this.members = [];
    this.palette = ppp;
    ppp = (ppp + 1) % 4;
    this.update(this.shared);
    this.updateAbilities();
    this.tx = this.x = this.shared.x;
    this.ty = this.y = this.shared.y;
    this.palette = this.shared.team;
    this.setTeam(this.shared.team);
    if (this.shared.team !== COMMON.BARBARIAN_TEAM && !this.shared.stay) {
        this.totem = this.collection.add("Totem");
        this.totem.group = this;
    }
    this.words = [];
    this.wordTimeout = 0.0;
    this.wordMemberIndex = 0;
}
;
CLIENT.Tribe.prototype = {
    zIndex: 1,
    constructor: CLIENT.Tribe,
    shape: COMMON.CIRCLE,
    radius: 4,
    groups: ["tribes"],
    enterview() {},
    leaveview() {},
    updateAbilities() {
        this.canHunt = false;
        this.canMine = false;
        this.canLumber = false;
        for (let member of this.members) {
            this.canHunt = this.canHunt || member.weaponDef.ranged;
            this.canMine = this.canMine || member.weaponDef.mine;
            this.canLumber = this.canLumber || member.weaponDef.lumber;
        }
    },
    setTeam(team) {
        if (this.game.controller.def.ffa) {
            if (this === this.game.player) {
                team = 0;
            } else {
                team = Utils.random(1, 4);
            }
        }
        this.team = team;
        this.palette = team;
        this.color = [0xaa6622, 0xcc2244, 0x44aaff, 0x88cc00, 0x6abe30, 0xd9a066, 0xffffff][this.palette];
        this.color = COMMON.TEAM_COLOR[this.palette].name;
        for (let member of this.members)
            member.setTeam(this.team);
    },
    addMember(tribesman) {
        tribesman.i = this.members.length;
        this.members.push(tribesman);
        if (app.game.player === this)
            app.game.updatePrices();
        tribesman.team = this.team;
        this.updateAbilities();
        tribesman.setTeam(this.team);
    },
    removeMember(tribesman) {
        Utils.pull(this.members, tribesman);
        tribesman.group = null;
        if (app.game.player === this)
            app.game.updatePrices();
        this.updateAbilities();
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
    update(data) {
        if (data.remove) {
            if (this.totem) {
                this.totem.die();
            }
            if (this.inView) {
                for (let tribe of this.collection.groups.tribes) {
                    if (tribe.inView && tribe !== this && tribe.team !== this.team)
                        tribe.hooray();
                }
            }
            if (this === app.game.player)
                app.game.onDeath();
            this.lifespan = 5.0;
        }
        if (this.inView) {
            if (data.x !== undefined)
                this.tween.to("x", data.x, COMMON.TWEEN_DURATION * 2.0);
            if (data.y !== undefined)
                this.tween.to("y", data.y, COMMON.TWEEN_DURATION * 2.0);
        } else {
            if (data.x !== undefined)
                this.x = data.x;
            if (data.y !== undefined)
                this.y = data.y;
        }
        if (data.team !== undefined)
            this.setTeam(data.team);
        Object.assign(this.shared, data);
    },
    step(dt) {
        this.tween.step(dt);
        if (this.words.length && this.wordTimeout <= 0) {
            this.wordTimeout = 0.35;
            this.collection.add("FloatingText", {
                x: this.totem.x,
                y: this.totem.y - 40,
                font: "small",
                text: this.words.shift(),
                color: this.color,
                duration: 4.5
            });
        } else {
            this.wordTimeout -= dt;
        }
    },
    hooray() {
        for (let member of this.members) {
            member.hooray(Math.random());
        }
    },
    setPalette(palette) {
        this.palette = palette;
        for (let t of this.members) {
            t.bodySprite.palette = t.group.palette;
            t.helmetSprite.palette = t.group.palette;
            t.legsSprite.palette = t.group.palette;
            for (let s of t.sprites) {
                s.creation = 1.0;
                app.tween(s).to({
                    creation: 0.0
                }, 0.5);
            }
            t.legsSprite.creation = 1.0;
            app.tween(t.legsSprite).to({
                creation: 0.0
            }, 0.5);
            if (palette === COMMON.BARBARIAN_TEAM)
                t.helmetSprite.palette = 0;
        }
    },
    say(text) {
        let words = text.split(" ");
        this.words = words;
    },
    render() {
        if (this === this.game.player) {
            app.painter.reset();
            app.painter.color(0xffffff);
            app.painter.drawLine(this.x, this.y, this.shared.x, this.shared.y, 2);
        }
    }
};