cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: cc.Prefab,
        settingPrefab: cc.Prefab,
        loadingPrefab: cc.Prefab,
        avatar: cc.Sprite,
        nickname: cc.Label,
        accountID: cc.Label,
        btnCreateRoom: cc.Button,
        btnEnterRoom: cc.Button,
        btnSetUp: cc.Button,
        btnShare: cc.Button,
        btnInform: cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        this.setting = cc.instantiate(this.settingPrefab)
        this.node.addChild(this.setting)

        this.dialog = cc.instantiate(this.dialogPrefab)
        this.node.addChild(this.dialog)

        this.loading = cc.instantiate(this.loadingPrefab)
        this.node.addChild(this.loading)

        this.inform = cc.find("Canvas/bg/inform")
        this.informFrame = cc.find("Canvas/bg/inform/frame")

        this.createRoom = cc.find("Canvas/bg/create_room")
        this.createRoomFrame = cc.find("Canvas/bg/create_room/frame")

        this.enterRoom = cc.find("Canvas/bg/enter_room")
        this.enterRoomFrame = cc.find("Canvas/bg/enter_room/frame")

        Notification.on("onopen", function () {
            sendTokenLogin()
        }, this)

        Notification.on("onmessage", this.onResult, this)

        let self = this
        Notification.on("onerror", function () {
            self.loading.getComponent("loading").hide()

            self.dialog.getComponent("dialog").setMessage("无法连接服务器，是否继续尝试重连?").
                setPositiveButton(function () {
                    self.loading.getComponent("loading").setMessage("正在连接").show()
                    // 延时0.2秒等待缩放动画完成
                    self.node.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function () {
                        initWebSocket()
                    })));
                }).setNegativeButton(function () {
                    cc.sys.localStorage.removeItem("token")
                    cc.director.loadScene(login)
                }).show()
        }, this)

        Notification.on("onclose", this.reconnect, this)

        Notification.on("onshow", function () {
            this.loading.getComponent("loading").hide()
        }, this)
        cc.log("hall onLoad")
    },

    start: function () {
        cc.log("hall start")
        if (isConnected()) {
            this.loadUserInfo()

            if (userInfo.anotherLogin) {
                userInfo.anotherLogin = false
                this.dialog.getComponent("dialog").setMessage("您的账号刚在其他设备上线，请您检查账号安全").show()
            }
        } else {
            let token = cc.sys.localStorage.getItem("token")
            if (token) {
                this.reconnect()
            } else {
                this.dialog.getComponent("dialog").setMessage("登录态失效，请您重新登录").
                    setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            }
        }
    },

    onDestroy: function () {
        Notification.offType("onopen")
        Notification.offType("onmessage")
        Notification.offType("onerror")
        Notification.offType("onclose")

        Notification.offType("onshow")
    },

    reconnect: function () {
        cc.log("hall reconnect")
        if (this.dialog.active) {
            return
        }

        this.loading.getComponent("loading").show()
        initWebSocket()
    },

    loadUserInfo: function () {
        if (userInfo.nickname) {
            this.nickname.string = userInfo.nickname
        }

        if (userInfo.accountID) {
            this.accountID.string = 'ID:' + userInfo.accountID
        }

        if (!userInfo.headimgurl) {
            userInfo.headimgurl = "http://www.huafeiqipai.com/img/avatar.jpg"
        }

        let self = this
        cc.loader.load({ url: userInfo.headimgurl, type: "jpg" }, function (err, texture) {
            if (err) {
                cc.log(err)
            } else {
                self.avatar.spriteFrame = new cc.SpriteFrame(texture)
            }
        })
    },

    playOkEffect: function () {
        playEffect("SpecOk.wav")
    },

    playCancelEffect: function () {
        playEffect("SpecCancelOrReturn.wav")
    },

    playDisableEffect: function () {
        playEffect("SpecDisable.wav")
    },

    showSetting: function () {
        this.setting.getComponent("setting").hideDisbandRoom().show()
    },

    showExitDialog: function () {
        showExitDialog()
    },

    showCreateRoom: function () {
        this.createRoom.active = true
        this.createRoomFrame.runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 0.9), cc.scaleTo(0.1, 1)))
    },

    hideCreatRoom: function () {
        let self = this
        this.createRoomFrame.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(function () {
            self.createRoom.active = false
        })))
    },

    createGanZhouRoom: function () {
        this.loading.getComponent("loading").show()
        this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            sendCreateGanZhouRoom()
        })))
    },

    createRuiJinRoom: function () {
        this.loading.getComponent("loading").show()
        this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            sendCreateRuiJinRoom()
        })))
    },

    createDaoZhouRoom: function () {
        this.loading.getComponent("loading").show()
        this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
            // sendCreateDaoZhouRoom()
            sendCreateRuiJinRoom()
        })))
    },

    showEnterRoom: function () {
        this.enterRoom.active = true
        this.enterRoomFrame.runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 0.9), cc.scaleTo(0.1, 1)))
    },

    hideEnterRoom: function () {
        let self = this
        this.enterRoomFrame.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(function () {
            self.enterRoom.active = false
        })))
    },

    onRoomNumberChanged: function (text, editbox, customEventData) {
        if (text.length == 6) {
            // this.enterRoom.active = false
            this.loading.getComponent("loading").show()

            this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
                sendEnterRoom(text)
            })))
        }
    },

    showInform: function () {
        Notification.emit("disable")

        this.inform.active = true
        this.informFrame.runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 0.9), cc.scaleTo(0.1, 1)))
    },

    hideInform: function () {
        let self = this
        this.informFrame.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(function () {
            self.inform.active = false
        })))
    },

    setRuiJinRound: function (event, customEventData) {
        ruijinRule.round = customEventData
    },

    onResult(result) {
        cc.log(result)
        if (result.S2C_Login) {
            cc.log('hall another room: ' + userInfo.anotherRoom)
            if (userInfo.anotherRoom) {
                sendEnterRoom("")
            } else {
                this.loading.getComponent("loading").hide()

                this.loadUserInfo()
            }
        } else if (result.S2C_Close) {
            if (result.S2C_Close.Error === 1) { // S2C_Close_LoginRepeated
                this.dialog.getComponent("dialog").setMessage("您的账号在其他设备上线，非本人操作请注意修改密码").
                    setPositiveButton(function () {
                        cc.sys.localStorage.removeItem("token")
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 2) { // S2C_Close_InnerError
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录出错，请您重新登录").
                    setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 3) { // S2C_Close_TokenInvalid
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录态失效，请您重新登录").
                    setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 4) { // S2C_Close_UnionidInvalid
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录出错，微信ID无效").
                    setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 5) { // S2C_Close_UsernameInvalid
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录出错，用户名无效").
                    setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            }
        } else if (result.S2C_CreateRoom) {
            this.createRoom.active = false

            if (result.S2C_CreateRoom.Error === 1) { // S2C_CreateRoom_InnerError
                this.dialog.getComponent("dialog").setMessage("创建房间出错，请联系客服").
                    setPositiveButton(function () {

                    }).show()
            } else if (result.S2C_CreateRoom.Error === 2) { // S2C_CreateRoom_CreateRepeated
                this.dialog.getComponent("dialog").setMessage("房间: " + result.S2C_CreateRoom.RoomNumber + " 已存在").show()
            } else if (result.S2C_CreateRoom.Error === 3) { // S2C_CreateRoom_InOtherRoom
                this.dialog.getComponent("dialog").setMessage("正在其他房间对局，是否回去？").
                    setPositiveButton(function () {

                    }).show()
            }
        } else if (result.S2C_EnterRoom) {
            if (result.S2C_EnterRoom.Error === 0) { // S2C_EnterRoom_OK
                cc.director.loadScene(room)
            } else if (result.S2C_EnterRoom.Error === 1) { // S2C_EnterRoom_NotCreated
                let self = this
                this.dialog.getComponent("dialog").setMessage("房间: " + result.S2C_EnterRoom.RoomNumber + " 未创建").
                    setPositiveButton(function () {
                        self.showEnterRoom()
                    }).show()
            } else if (result.S2C_EnterRoom.Error === 2) { // S2C_EnterRoom_NotAllowBystander
                let self = this
                this.dialog.getComponent("dialog").setMessage("房间: " + result.S2C_EnterRoom.RoomNumber + " 玩家人数已满").
                    setPositiveButton(function () {
                        self.showEnterRoom()
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

                    }).show()
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
