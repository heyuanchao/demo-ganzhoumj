cc.Class({
    extends: cc.Component,

    properties: {
        title: cc.Label,
        message: cc.Label,
        frame: cc.Node,
        positiveButton: cc.Button,
        negativeButton: cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        this.node.active = false

        this.initializeButtons()
    },

    initializeButtons: function () {
        this.positiveButton.node.x = 0

        this.negativeButton.node.active = false
        this.negativeButton.node.x = 0
    },

    playOkEffect: function () {
        playEffect("SpecOk.wav")
    },

    playCancelEffect: function () {
        playEffect("SpecCancelOrReturn.wav")
    },
    
    setTitle: function (title) {
        if (title != null && trim(title, " ").length != 0) {
            this.title.string = title
        }

        return this
    },

    setMessage: function (message) {
        this.initializeButtons()
        this.message.string = message

        return this
    },

    setPositiveButton: function (callback) {
        this.positiveButton.node.active = true
        if (callback) {
            if (this.positiveCallback) {
                this.positiveButton.node.off("click", this.positiveCallback, this)
            }

            this.positiveCallback = callback
            this.positiveButton.node.on("click", callback, this)
        }

        return this
    },

    setNegativeButton: function (callback) {
        this.negativeButton.node.active = true
        if (callback) {
            if (this.negativeCallback) {
                this.negativeButton.node.off("click", this.negativeCallback, this)
            }

            this.negativeCallback = callback
            this.negativeButton.node.on("click", callback, this)
        }

        return this
    },

    show: function () {
        if (this.node.active) {
            return
        }

        if (this.positiveButton.node.active && this.negativeButton.node.active) {
            this.positiveButton.node.x = 180
            this.negativeButton.node.x = -180
        }

        Notification.emit("disable")

        this.node.active = true
        this.frame.runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 0.9), cc.scaleTo(0.1, 1)))
    },

    hide: function () {
        if (this.node.active) {
            Notification.emit("enable")

            let self = this
            this.frame.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(function () {
                self.node.active = false
            })))
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
