// 全局通知
window.Notification = {
    _eventMap: [],

    on: function (type, callback, target) {
        if (this._eventMap[type] === undefined) {
            this._eventMap[type] = [];
        }
        this._eventMap[type].push({ callback: callback, target: target });
    },

    emit: function (type, parameter) {
        var array = this._eventMap[type];
        if (array === undefined) return;

        array.forEach(function (element) {
            if (element) element.callback.call(element.target, parameter);
        })

        /*
        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            cc.log(element)
            if (element) element.callback.call(element.target, parameter);
        }
        */
    },

    off: function (type, callback) {
        var array = this._eventMap[type];
        if (array === undefined) return;

        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            if (element && element.callback === callback) {
                array[i] = undefined;
                break;
            }
        }
    },

    offType: function (type) {
        this._eventMap[type] = undefined;
    },
}

window.trim = function (str, s) {
    if (s === null || s === "") {
        s = " "
    }

    while (str.indexOf(s) != -1) {
        str = str.replace(s, "")
    }

    return str
}

window.playEffect = function (audioName) {
    let effectOn = cc.sys.localStorage.getItem("effectOn")
    if (effectOn == "on") {
        let audio = cc.url.raw("resources/audio/" + audioName)
        cc.audioEngine.play(audio, false, 1)
    }
}

// cc.director.loadScene(sceneName)
// cc.sys.localStorage.setItem(itemName, item)
// cc.sys.localStorage.getItem(itemName)
// cc.sys.localStorage.removeItem(itemName)
