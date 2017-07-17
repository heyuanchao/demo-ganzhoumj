window.debug = true

window.appid = "wx2ab2ad4bcd0cf6a9"
window.appsecret = "9cb96f7aa80193667a8e3fbcefbd07e9"

window.userInfo = {}
window.user2Info = {}
window.user3Info = {}
window.user4Info = {}

window.roomInfo = {}

// window.launcher = "scene1_launcher"
window.login = "scene1_login"
window.hall = "scene2_hall"
window.room = "scene3_room"

window.setUserInfo = function (info, obj) {
    info.accountID = obj.AccountID
    info.nickname = obj.Nickname
    info.headimgurl = obj.Headimgurl
    info.sex = obj.Sex
    info.ip = obj.Ip
}

window.ruijinRule = {
    rounds: 4,
    number: 4,
    mustselfdraw: false,
    basescore: 1,
    distinguishdealer: false,
}
