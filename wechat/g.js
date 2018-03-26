var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')

module.exports = function(opts) {
	//	var wechat = new Wechat(opts)

	return function*(next) {
		var that = this
		var token = opts.token
		var timestamp = this.query.timestamp
		var nonce = this.query.nonce
		var str = [token, timestamp, nonce].sort().join('')
		var signature = this.query.signature
		var echostr = this.query.echostr
		var sha = sha1(str)

		if(this.method == 'GET') {
			if(sha === signature) {
				this.body = echostr + ''
			} else {
				this.body = 'wrong'
			}
		} else if(this.method == 'POST') {
			if(sha !== signature) {
				this.body = 'wrong'
				return false
			}

			var data = yield getRawBody(this.req, {
				length: this.length,
				limit: '1mb',
				encoding: this.charset
			})

			var content = yield util.parseXMLAsync(data)
			console.log(content)
			var message = util.formatMessage(content.xml)
			console.log('---message:')
			console.log(message)

			if(message.MsgType === 'event') {
				if(message.Event === 'subscribe') {
					console.log('---subscribe:')
					var now = new Date().getTime()

					that.status = 200
					that.type = 'application/xml'
					that.body = '<xml>' +
						'<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
						'<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
						'<CreateTime>' + now + '</CreateTime>' +
						'<MsgType><![CDATA[text]]></MsgType>' +
						'<Content><![CDATA[Hi,小可爱]]></Content>' +
						'</xml>'
					//<xml> 
					//<ToUserName>< ![CDATA[toUser] ]></ToUserName> 
					//<FromUserName>< ![CDATA[fromUser] ]></FromUserName> 
					//<CreateTime>12345678</CreateTime> 
					//<MsgType>< ![CDATA[text] ]></MsgType> 
					//<Content>< ![CDATA[你好] ]></Content> 
					//</xml>
					//按照官方这样留空会报错 我他妈的意大利炮呢 浪费了四个小时
					//希望微信用json的那个开发团队干掉用xml的
					console.log('---body:')
					console.log(that.body)
					return

				}
			}

			if(message.MsgType === 'text') {
				var now = new Date().getTime()
				this.status = 200
				this.type = 'application/xml'
				this.body = '<xml>' +
					'<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
					'<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
					'<CreateTime>' + now + '</CreateTime>' +
					'<MsgType><![CDATA[text]]></MsgType>' +
					'<Content><![CDATA[Hi,大可爱]]></Content>' +
					'</xml>'

				console.log('---body:')
				console.log(that.body)
				return
			}

		}

	}
}