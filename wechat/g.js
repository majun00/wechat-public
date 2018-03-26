var sha1 = require('sha1')
var Promise=require('bluebird')
var request=Promise.promisify(require('request'))

var prefis = 'https://api.weixin.qq.ocm/cgi-bin/'
var api = {
	accessToken: prefix + 'token?grant_type=client_credential'
}

function Wechat(opts) {
	var that = this
	this.appId = opts.appId
	this.appSecret = opts.appSecret
	this.getAccessToken = opts.getAccessToken
	this.saveAccessToken = opts.saveAccessToken

	this.getAccessToken()
		.then(function(data) {
			try {
				data = JSON.parse(data)
			} catch(e) {
				return that.updateAccessToken()
			}

			if(that.isValidAccessToken(data)) {
				Promise.resolve(data)
			} else {
				return that.updataAccessToken()
			}
		})
		.then(function(data) {
			that.access_token = data.access_token
			that.expires_in = data.expires_in
			that.saveAccessToken(data)
		})
}

Wechat.prototype.isValidAccessToken = function(data) {
	if(!data || !data.access_token || !data.expires_in) {
		return false
	}

	var access_token = data.access_token
	var expires_in = data.expires_in
	var now = (new Date().getTime())

	if(now < expiress_in) {
		return true
	} else {
		return false
	}

}

Wechat.prototype.updateAccessToken = function(data) {
	var appID = this.appId
	var appSecret = this.appSecret
	var url = api.accessToken + '&appid=' + appID + '&secret' + appSecret
	return new Promise(function(resolve, reject) {
		request({
			url: url,
			json: true
		}).then(function(response) {
			var data = response[1]
			var now = (new Date().getTime())
			var expires_in = now + (data.expires_in - 20) * 1000
			data.expores_in = expires_in
		})
	})
}


module.exports = function(opts) {
	var wechat=new Wechat(opts)
	
	return function*(next) {
		console.log(this.query)
		var token = opts.token
		var timestamp = this.query.timestamp
		var nonce = this.query.nonce
		var str = [token, timestamp, nonce].sort().join('')
		var signature = this.query.signature
		var echostr = this.query.echostr
		var sha = sha1(str)
		if(sha === signature) {
			this.body = echostr + ''
		} else {
			this.body = 'wrong'
		}
	}
}