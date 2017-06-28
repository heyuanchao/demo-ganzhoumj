cc.Class({
    extends: cc.Component,

    properties: {
        message: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.node.active = false

        this.dotCount = 0
    },

    setMessage: function (message) {
        this.message.string = message

        return this
    },

    updateMessage: function () {
        this.message.string += '.'
        this.dotCount += 1
        if (this.dotCount > 3) {
            this.dotCount = 0
            this.message.string = trim(this.message.string, '.')
        }
    },

    show: function () {
        if (this.node.active) {
            return
        }

        Notification.emit("disable")

        this.node.active = true
        this.schedule(this.updateMessage, 0.3, this)
    },

    hide: function () {
        if (this.node.active) {
            Notification.emit("enable")

            this.unschedule(this.updateMessage)
            this.node.active = false
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
