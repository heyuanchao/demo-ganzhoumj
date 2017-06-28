cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: cc.Prefab,
        loadingPrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.btnWeChatLogin = cc.find("Canvas/bg/btn_wechat_login").getComponent(cc.Button)

        this.dialog = cc.instantiate(this.dialogPrefab)
        this.node.addChild(this.dialog)

        this.loading = cc.instantiate(this.loadingPrefab)
        this.node.addChild(this.loading)

        let self = this
        Notification.on("onopen", function () {
            let token = cc.sys.localStorage.getItem("token")
            if (token) {
                sendTokenLogin()
                return
            }

            if (userInfo.unionid) {
                sendWeChatLogin()
                return
            }
        }, this)

        Notification.on("onmessage", this.onResult, this)

        Notification.on("onerror", function () {
            self.loading.getComponent("loading").hide()
            self.dialog.getComponent("dialog").setMessage("登录失败，请稍后重试").setPositiveButton(null).show()
        }, this)

        Notification.on("enable", function () {
            self.btnWeChatLogin.enabled = true
        })

        Notification.on("disable", function () {
            self.btnWeChatLogin.enabled = false
        })

        cc.log("login onLoad")
    },

    start: function () {
        cc.log("login start")
        let token = cc.sys.localStorage.getItem("token")
        if (token) {
            this.requestLogin()
        }
    },

    onDestroy: function () {
        Notification.offType("onopen")
        Notification.offType("onmessage")
        Notification.offType("onerror")

        Notification.offType("enable")
        Notification.offType("disable")
    },

    playOkEffect: function () {
        playEffect("SpecOk.wav")
    },

    playCancelEffect: function () {
        playEffect("SpecCancelOrReturn.wav")
    },

    updateLoadingLabel() {
        this.loading_txt.string += '.'
        this.dotCount += 1;
        if (this.dotCount > 3) {
            this.dotCount = 0
            this.loading_txt.string = trim(this.loading_txt.string, '.')
        }
    },

    // Java 调用
    setWeChatLoginEnabled() {
        this.btnWeChatLogin.enabled = true
    },

    wechatLogin: function () {
        let self = this
        this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            self.node.stopAllActions()
            self.btnWeChatLogin.enabled = false

            if (cc.sys.isMobile) {
                // cc.find('Bgm').getComponent('bgm').pause();
                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    var className = "org/cocos2dx/javascript/AppActivity"
                    var methodName = "wechatLogin"
                    var methodSignature = "()V"
                    jsb.reflection.callStaticMethod(className, methodName, methodSignature)
                }
            } else if (cc.sys.isBrowser) {
                // userInfo = JSON.parse("{\"openid\":\"ogveqvz3OnJdvicWmZDFXf1I8Xt4\",\"nickname\":\"我是谁\",\"sex\":1,\"language\":\"zh_CN\",\"city\":\"Shenzhen\",\"province\":\"Guangdong\",\"country\":\"CN\",\"headimgurl\":\"http:\/\/wx.qlogo.cn\/mmopen\/Po9mkm3Z42tolYpxUVpY6mvCmqalibOpcJ2jG3Qza5qgtibO1NLFNUF7icwCibxPicbGmkoiciaqKEIdvvveIBfEQqal8vkiavHIeqFT\/0\",\"privilege\":[],\"unionid\":\"o8c-nt6tO8aIBNPoxvXOQTVJUxY0\"}");
                // userInfo = JSON.parse("{\"openid\":\"ogveqvz3OnJdvicWmZDFXf1I8Xt4\",\"nickname\":\"我是谁\",\"sex\":1,\"language\":\"zh_CN\",\"city\":\"Shenzhen\",\"province\":\"Guangdong\",\"country\":\"CN\",\"headimgurl\":\"http:\/\/wx.qlogo.cn\/mmopen\/Po9mkm3Z42tolYpxUVpY6mvCmqalibOpcJ2jG3Qza5qgtibO1NLFNUF7icwCibxPicbGmkoiciaqKEIdvvveIBfEQqal8vkiavHIeqFT\/0\",\"privilege\":[],\"unionid\":\"o18ETxEjvn-4_04LWW5_tRBdexcQ\"}");
                userInfo = JSON.parse("{\"openid\":\"ogveqvz3OnJdvicWmZDFXf1I8Xt4\",\"nickname\":\"在努力的龙小博\",\"sex\":1,\"language\":\"zh_CN\",\"city\":\"Shenzhen\",\"province\":\"Guangdong\",\"country\":\"CN\",\"headimgurl\":\"http:\/\/wx.qlogo.cn\/mmopen\/WT9MJf6I7WAkic7ficWBuYbvkMscic97pBa0BbicwKCmOvicsPr1GozNMWnp4gfwMib0A5zdDyUOjaFFSdrz0viao3oKpsXqAeF9ZJ1\/0\",\"privilege\":[],\"unionid\":\"o8c-nt2jC5loIHg1BQGgYW6aqe60\"}");
                // userInfo = JSON.parse("{\"openid\":\"ogveqvz3OnJdvicWmZDFXf1I8Xt4\",\"nickname\":\"honey\",\"sex\":1,\"language\":\"zh_CN\",\"city\":\"Shenzhen\",\"province\":\"Guangdong\",\"country\":\"CN\",\"headimgurl\":\"http:\/\/wx.qlogo.cn\/mmopen\/Po9mkm3Z42vkKC5g0b6kzjwUiaCice6Znv9wpCpOIpUjM4fTicPrldibAww7YtTZMlW3teKndBe9GcqBHcStictz3KPayVWnwGicKF\/0\",\"privilege\":[],\"unionid\":\"o8c-ntxW4cW601v6RjaAsExy98w4\"}");
                self.requestLogin()
            }
        })));
    },

    // Java 调用
    getWeChatLoginResult(result) {
        let r = result.split(",")

        userInfo.serial = r[2]
        userInfo.model = r[3]
        // cc.log(results[4] + ", " + results[5])
        this.getAccessToken(r[0], r[1])
    },

    getAccessToken(code, state) {
        if (debug) {
            cc.log("code: " + code + ", state: " + state)
        }

        var self = this;
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 300)) {
                if (debug) {
                    cc.log(xhr.responseText);
                }
                let tokenInfo = JSON.parse(xhr.responseText);
                self.getUserInfo(tokenInfo.access_token, tokenInfo.openid);
            }
        };
        xhr.open("GET", "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appid + "&secret=" + appsecret + "&code=" + code + "&grant_type=authorization_code", true);
        xhr.send();
    },

    getUserInfo(access_token, openid) {
        var self = this
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 300)) {
                if (debug) {
                    cc.log(xhr.responseText);
                }
                let info = JSON.parse(xhr.responseText)
                // userInfo.openid = info.openid
                userInfo.nickname = info.nickname
                userInfo.sex = info.sex
                // userInfo.language = info.language
                // userInfo.city = info.city
                // userInfo.province = info.province
                // userInfo.country = info.country
                userInfo.headimgurl = info.headimgurl
                userInfo.unionid = info.unionid
                self.requestLogin()
            }
        };
        xhr.open("GET", "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid, true);
        xhr.send();
    },

    requestLogin() {
        this.loading.getComponent("loading").show()

        this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
            if (ws == null) {
                initWebSocket()
            }
        })))
    },

    onResult(result) {
        this.loading.getComponent("loading").hide()

        if (result.S2C_Login) {
            cc.log('login another room: ' + userInfo.anotherRoom)
            if (userInfo.anotherRoom) {
                sendEnterRoom("")
            } else {
                cc.director.loadScene(hall)
            }
        } else if (result.S2C_Close) {
            if (result.S2C_Close.Error === 1) { // S2C_Close_LoginRepeated
                //this.launch_dialog.getComponent('launch_dialog').show('您的账号在其他设备上线，非本人操作请注意修改密码')
            } else if (result.S2C_Close.Error === 2) { // S2C_Close_InnerError
                this.dialog.getComponent("dialog").setMessage("登录出错，请联系客服").show()
            } else if (result.S2C_Close.Error === 3) { // S2C_Close_TokenInvalid
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录态失效，请您重新登录").show()
            } else if (result.S2C_Close.Error === 4) { // S2C_Close_UnionidInvalid
                this.dialog.getComponent("dialog").setMessage("登录出错，Unionid无效").show()
            } else if (result.S2C_Close.Error === 5) { // S2C_Close_UsernameInvalid
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录态失效，用户名无效").show()
            }
        } else if (result.S2C_EnterRoom) {
            if (result.S2C_EnterRoom.Error === 0) { // S2C_EnterRoom_OK
                cc.director.loadScene(room)
            } else if (result.S2C_EnterRoom.Error === 1) { // S2C_EnterRoom_NotCreated
                this.dialog.getComponent("dialog").setMessage("房间: " + result.S2C_EnterRoom.RoomNumber + " 未创建").
                    setPositiveButton(function () {
                        cc.director.loadScene(hall)
                    }).show()
            } else if (result.S2C_EnterRoom.Error === 2) { // S2C_EnterRoom_NotAllowBystander
                this.dialog.getComponent("dialog").setMessage("房间: " + result.S2C_EnterRoom.RoomNumber + " 玩家人数已满").
                    setPositiveButton(function () {
                        cc.director.loadScene(hall)
                    }).show()
            } else if (result.S2C_EnterRoom.Error === 3) { // S2C_EnterRoom_InOtherRoom
                this.dialog.getComponent("dialog").setMessage("正在其他房间对局，是否回去？").
                    setPositiveButton(function () {

                    }).show()
            } else if (result.S2C_EnterRoom.Error === 4) { // S2C_EnterRoom_Unknown
                let msg = "进入房间出错，请稍后重试"
                let roomNumber = result.S2C_EnterRoom.RoomNumber
                if (roomNumber) {
                    msg = "进入房间：" + roomNumber + " 出错，请稍后重试"
                }

                this.dialog.getComponent("dialog").setMessage(msg).
                    setPositiveButton(function () {
                        cc.director.loadScene(hall)
                    }).show()
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
