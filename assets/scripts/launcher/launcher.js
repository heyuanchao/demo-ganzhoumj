cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        let musicOn = cc.sys.localStorage.getItem("musicOn")
        if (musicOn == null) {
            cc.sys.localStorage.setItem("musicOn", "on")
        }

        let effectOn = cc.sys.localStorage.getItem("effectOn")
        if (effectOn == null) {
            cc.sys.localStorage.setItem("effectOn", "on")
        }

        this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(function () {
            cc.director.loadScene(login)
        })))
    },

    loadScene: function(event, sceneName) {
        cc.director.loadScene(sceneName)
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
