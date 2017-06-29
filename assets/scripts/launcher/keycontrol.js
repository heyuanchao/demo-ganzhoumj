cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        // 设置为常驻节点
        cc.game.addPersistRootNode(this.node)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this)
    },

    onKeyDown(event) {
        cc.log('keyCode: ' + event.keyCode);
        switch (event.keyCode) {
            case cc.KEY.a:
                // cc.find('Bgm').getComponent('bgm').pause();
                break;
            case cc.KEY.b:
                // cc.find('Bgm').getComponent('bgm').resume();
                break;
            case cc.KEY.back: // 6, 返回键
                showExitDialog()
                break;
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
