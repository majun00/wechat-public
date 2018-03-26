var Koa=require('koa')
var path=require('path')
var wechat=require('./wechat/g')
var =require('./libs/util')

var wechat_file=path.join(__dirname,'./config/wechat.txt')

var config={
	wechat:{
		appID:'wx90f516ca6172a46b',
		appSecret:'f72b8a25e1c0ebfe441a6b2e5833b0ad',
		token:'testtokenmajun',
		getAccessToken:function(){
			return util.readFileAsync(wechat_file)
		},
		saveAccessToken:function(data){
			data=JSON.stringify(data)
			return util.writeFileAsync(wechat_file)
		},
	}
}

var app=new Koa()

app.use(wechat(config.wechat))

app.listen(1234)
console.log('listen: 1234')

