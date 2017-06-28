cc.Class({
    extends: cc.Component,

    properties: {
        frame: cc.Node,
        btn_switch: cc.Button,
        btn_disband: cc.Button,
        toggle_music: cc.Toggle,        
        toggle_effect: cc.Toggle,
    },

    // use this for initialization
    onLoad: function () {
        this.node.active = false

        let musicOn = cc.sys.localStorage.getItem("musicOn")
        if (musicOn == "on") {
            this.toggle_music.isChecked = true
        } else if (musicOn == "off") {
            this.toggle_music.isChecked = false
        }

        let effectOn = cc.sys.localStorage.getItem("effectOn")
        if (effectOn == "on") {
            this.toggle_effect.isChecked = true
        } else if (effectOn == "off") {
            this.toggle_effect.isChecked = false
        }
    },

    playOkEffect: function () {
        playEffect("SpecOk.wav")
    },

    playCancelEffect: function () {
        playEffect("SpecCancelOrReturn.wav")
    },

    togglePlayMusic: function () {
        if (this.toggle_music.isChecked) {
            cc.sys.localStorage.setItem("musicOn", "on")
        } else {
            cc.sys.localStorage.setItem("musicOn", "off")
        }
    },

    togglePlayEffect: function () {
        if (this.toggle_effect.isChecked) {
            cc.sys.localStorage.setItem("effectOn", "on")
        } else {
            cc.sys.localStorage.setItem("effectOn", "off")
        }
    },

    switchAccount: function () {
        cc.sys.localStorage.removeItem("token")
        cc.director.loadScene(login, function () {
            closeWebSocket()
        })
    },

    hideSwitchAccount: function () {
        this.btn_switch.node.active = false

        return this
    },

    disbandRoom: function () {
        sendExitOrDisbandRoom()
    },

    hideDisbandRoom: function () {
        this.btn_disband.node.active = false

        return this
    },

    show: function () {
        Notification.emit("disable")

        this.node.active = true
        this.frame.runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 0.9), cc.scaleTo(0.1, 1)))
    },

    hide: function () {
        Notification.emit("enable")

        let self = this
        this.frame.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(function () {
            self.node.active = false
        })))
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
