var tabid=0;

String.prototype.qreplace=function(qsearch,qreplace){
	return this.split(qsearch).join(qreplace);
};
String.prototype.qslice=function(before,after){
	var s=this.indexOf(before)
	//if(s<0)return this;
	s+=before.length;
	var n=this.indexOf(after,s);
	if(n<0)return this.substr(s);
	return this.substr(s,n-s);
}

function _ge(g){
	return document.getElementById(g);
}
function preventEventDefault(ev){
	ev = ev || event;
	if(ev.preventDefault)ev.preventDefault();
	ev.returnValue=false;
	return false;
}
//appnedTo should ONLY be specified on the last element that needs to be created
//				which means the TOP level element (or the final parameter on the first one)
function cel(typ,attributes,addchilds,appnedTo){
	var ne;
	if( typ.indexOf(' ') > -1 ){
		ne=document.createTextNode(typ);
		return ne;//does anyone set attributs on a text node?
	}else
		ne=document.createElement(typ);
	for( i in attributes ){
		if( i == 'events' ){
			if(typeof(attributes[i][0])=='string')
				pendingListenrs.push([ne,attributes[i]]);
			else{
				for( q in attributes[i] ){
					pendingListenrs.push([ne,attributes[i][q]]);
				}
			}
		}else if( i == 'checked'){
			if(attributes[i])ne.setAttribute(i,'checked');
		}else ne.setAttribute(i,attributes[i]);
	}
	if(addchilds){
		for( i in addchilds ){
			ne.appendChild(addchilds[i]);
		}
	}
	if(appnedTo){
		appnedTo.appendChild(ne);
		for( i in pendingListenrs ){
			pendingListenrs[i][0].addEventListener(pendingListenrs[i][1][0],pendingListenrs[i][1][1],pendingListenrs[i][1][2]?pendingListenrs[i][1][2]:false)
		}
		pendingListenrs=[]
	}
	return ne;
	//identifier unexpected means your missing a comma on the row before
}
var pendingListenrs=[];

var share_enabled = false;
var crypt_enabled = false;
var login_enabled = false;
var color_toggled = false;

var murl='http://www.vidzbigger.com/videoSimpleList.php?skip_pages=1&nonav='+(color_toggled?2:1)+'&page='
var page=1;

function ifEnterGo(ev){
	if(ev.keyCode == 13)go2page();
}
function go2page(){
	advanceto(_ge('go_page_cur').value-0)
}
function advanceto(p){
	page=p;
	if(page<1)page=1;
	_ge('go_page_cur').value=page;
	loadTopVidzURL();
}
function advance(){
	advanceto(++page);
	loadTopVidzURL();
}
function devance(){
	advanceto(--page);
	loadTopVidzURL();
}
function clickedfbrowser(ev){
	t=ev.target;
	if(t.tagName!='A')t=t.parentNode
	if(t.tagName=='A'){
		loadFloatingUrl(t.href);
	}
}
function clickedbrowser(ev){
	hideFloatingUrl();
	t=ev.target;
	if(t.tagName!='A')t=t.parentNode
	if(t.tagName=='A'){
		
		if(ev.which==2 || t.target=='_top'){
			  	chrome.tabs.create({url:t.href}, function(t){});
		}else{
			chrome.tabs.getSelected(null, function(tab) {
			  	chrome.tabs.update(tab.id, {url:t.href,selected:false}, function(t){});
			});
		}
	}
}
function toggleMyHistory(){
	if( !login_enabled ){
		login_enabled=true;
		loadFloatingUrl('http://vidzbigger.com/blog/wp-login.php');
	}else{
		login_enabled=false;
		loadFloatingUrl('http://vidzbigger.com/blog/wp-login.php?loggedout=true');
	}
	localStorage['login_enabled']=login_enabled;
}
function toggleSecure(){
	if( !crypt_enabled ){
		crypt_enabled=true;
	}else{
		crypt_enabled=false;
	}
	localStorage['crypt_enabled']=crypt_enabled;
}
function toggleSharing(){
	if( !share_enabled ){
		_ge('enc_check').style.display='';
		share_enabled=true;
	}else{
		_ge('enc_check').style.display='none';
		share_enabled=false;
	}
	localStorage['share_enabled']=share_enabled;
}

function toggleBrowser(){
	if( !share_enabled ){
		_ge('enc_check').style.display='';
		_ge('extraline').style.display='';
		cel('div',{},[
			cel('input',{'type':'button','value':'Previous Page','events':['click',devance]}),
			cel('input',{'type':'button','value':'Next Page','events':['click',advance]}),
			cel('input',{'type':'text','id':'go_page_cur','style':'width:60px;','value':page,'events':['keyup',ifEnterGo]}),
			cel('input',{'type':'button','value':'Go','events':['click',go2page]}),
			cel('div',{'id':'fbrowser','style':'position:absolute;background-color:white;color:black;z-index:9999;margin:auto;','events':['click',clickedfbrowser]}),
  		cel('div',{'style':'width:600px;','id':'browser','events':['click',clickedbrowser]},[
//	  			cel("img",{'src':'loading.gif'}),
//		  		cel(" L o a d i n g  T o p  V i d e o s"),
	  	])//,

				//cel('input',{'type':'button','value':'Previous Page','events':['click',devance]}),
				//cel('input',{'type':'button','value':'Next Page','events':['click',advance]})		  	
  	],_ge('viewr'));
  	
  	share_enabled=true;
  	
  }else{
  	_ge('enc_check').style.display='none';
  	_ge('extraline').style.display='none';
  	_ge('viewr').removeChild(_ge('viewr').firstChild);
  	share_enabled=false;
  }
  if(share_enabled) loadTopVidzURL();
	//window.setTimeout(loadpage,250);
}

function loadTopVidzURL(){
	retryloadBrowserURL=loadTopVidzURL;
	_ge('browser').innerHTML='<a href="javascript:retryloadBrowserURL();">Retry</a> <img align="middle" src="loading.gif" /> L O A D I N G';
	chrome.runtime.sendMessage({'url':murl+(color_toggled?2:1)+(page?('&page='+page):''),'method':'GET',G_xmlhttpRequest:true}, function(response){
		if(response.responseText && response.responseText.length > 0 ){
			var html=response.responseText;

			_ge('browser').innerHTML=html.qslice('<!--VZB_B-->','<!--VZB_E-->').qreplace('"img/','"http://www.vidzbigger.com/img/');
			page=(_ge('cur_page').innerHTML)-0;
			
		}else
			_ge('browser').innerHTML='Error - Check internet connection <a href="javascript:retryloadBrowserURL();">Retry</a>';
	});
	localStorage['page']=page;
}

var retryloadBrowserURL=loadTopVidzURL;

function hideFloatingUrl(){
	_ge('fbrowser').innerHTML='';
	_ge('fbrowser').style.display='none';
}
function loadFloatingUrl(ur){
	var ul=ur;
	retryloadBrowserURL=function(){
		loadFloatingUrl(ul);
	}
	_ge('fbrowser').innerHTML='<a href="javascript:retryloadBrowserURL();">Retry</a> <img align="middle" src="loading.gif" /> L O A D I N G';
	_ge('fbrowser').style.display='block';
	chrome.runtime.sendMessage({'url':ur,'method':'GET',G_xmlhttpRequest:true}, function(response){
		if(response.responseText && response.responseText.length > 0 ){
			rtxt=response.responseText;
			if(rtxt.indexOf('<!--VZB_B-->')>-1){
				rtxt=rtxt.qslice('<!--VZB_B-->','<!--VZB_E-->');
			}
			rtxt='<a href="javascript:hideFloatingUrl();" style="float:right;padding:10px;font-size:20px;font-weight:bold;">X</a><div style="padding:20px;">'+rtxt+'</div>';
			_ge('fbrowser').innerHTML=rtxt.qreplace('"img/','"http://www.vidzbigger.com/img/');
		}else
			_ge('fbrowser').innerHTML='Error2 - Check internet connection <a href="javascript:retryloadBrowserURL();">Retry</a>';
	
		if( _ge('rememberme') ){
			_ge('rememberme').addEventListener('click',function(){
				if(_ge('rememberme').checked){
					localStorage['stored_name']=_ge('user_login').value
					localStorage['stored_pass']=_ge('user_pass').value
				}else{
					delete(localStorage['stored_name'])
					delete(localStorage['stored_pass'])
				}
			},false);
			if(typeof(localStorage['stored_name'])!='undefined')_ge('user_login').value=localStorage['stored_name'];
			if(typeof(localStorage['stored_pass'])!='undefined')_ge('user_pass').value=localStorage['stored_pass'];
			//if(typeof(localStorage['stored_name'])!='undefined')_ge('rememberme').checked=true;
		}
	});
}

function shoPrefs(){
	chrome.tabs.getSelected(null, function(tab) {
		if(tab.url.indexOf('youtube.com/watch') > 0 ){
			chrome.tabs.sendMessage(tab.id, {getPrefs: true}, function(response) {window.close();});
		}else{
			if(alert('You must be on a video page to see video settings\n\nTry clicking Video Preferences while watching a video.')){
				
			}
		}
	});
}

var cli=0;
function logoclick(ev){
	if(ev && ev.which!==1) return;
	toggleBrowser();
	return preventEventDefault(ev);
}

function closeWindow(){
	window.close();
}
function goBig(){
	chrome.tabs.sendMessage(tabid,{goBig:true},function(r){});
}
function goHome(){
	chrome.tabs.sendMessage(tabid,{goHome:true},function(r){});
}

function doit(){
	//document.body.removeChild(document.body.firstChild);
	
	chrome.windows.getCurrent(function(window){
		winid=window.id;
		chrome.tabs.getSelected(winid, function(tab){
			tabid=tab.id;
		})
	})	
	
	//check setting ?value:default
	share_enabled = ((localStorage['share_enabled']=='true')?true:false);
	crypt_enabled = ((localStorage['crypt_enabled']=='true')?true:false);
	login_enabled = ((localStorage['login_enabled']=='true')?true:false);
	color_toggled = ((localStorage['color_toggled']=='true')?true:false);

	murl='http://www.vidzbigger.com/videoSimpleList.php?skip_pages=1&nonav='
	page=((localStorage['page']-0>1)?localStorage['page']-0:1);
	
	//above need nto be in function?
	
		cel('div',{'style':'min-width:620px;'},[
			
			cel('div',{'class':'prow'},[
				cel('div',{'style':'margin:25px;margin-top:10px;right:-15px;position:absolute;'},[
					cel('input',{'type':'button',id:'gobig','value':'GoBig','title':'Scroll page to video position, enlarging video','events':['click',goBig]}),
  				cel('input',{'type':'button',id:'gohme','value':'GoHome','title':'Scroll page to top, restoring video','events':['click',goHome]}),
					cel('a',{'href':'javascript:0;','events':['click',closeWindow],'style':'text-decoration:none;font-size:18px;font-weight:bold;padding:5px;'},[cel(' X ')])
				]),
				cel('a',{'href':'http://www.vidzbigger.com','target':'_blank','events':['click',logoclick]},[
					cel('img',{src:'img/icon64.png',width:64,height:64,'align':'middle','style':'margin:5px;','border':'0'}),
				]),
  			cel('label',{'title':'When a video gets extremely popular in the VidzBigger community (10+ views worldwide), it will make the list of top videos for the everyone to enjoy.'},[
  				cel('input',{'type':'checkbox','events':['click',toggleSharing],'checked':share_enabled}),
  				cel("Participate in Video View Sharing ")
  			]),
  			cel('label',{'id':'enc_check','title':'256 Bit RSA Encryption of all data transmitted to vidzbigger.com, including the URL and title of each video you share.'},[
  				cel('input',{'type':'checkbox','events':['click',toggleSecure],'checked':crypt_enabled}),
  				cel("Encrypt Requests ")
  			])//,
//		  			cel('label',{'id':'login_check','title':'Remember the videos you watch: by logging in to vidzbigger.com you can see your video history.  History only works while logged in.'},[
//		  				cel('input',{'type':'checkbox','events':['click',toggleMyHistory],'checked':login_enabled}),
//		  				cel("Login ")
//		  			])
  		]),
  		cel('hr',{'id':'extraline'}),
  		cel('div',{'id':'viewr'},[]),
			
//		  		cel('div',{'class':'prow'},[
//		  			cel('label',{},[
//		  				cel('input',{'type':'checkbox','events':['click',toggleSecure],'checked':crypt_enabled}),
//		  				cel("Use Encrypted Transmission")
//		  			])
//		  		]),
//		  		cel('div',{'class':'prow'},[
//		  			cel('label',{},[
//		  				cel(" "),
//		  				cel('input',{'type':'button','value':'Video Preferences','events':['click',shoPrefs]})
//		  			])
//		  		])
		],document.body);

	if( share_enabled ){
		share_enabled = false;
		toggleSharing();
	}else{
		_ge('extraline').style.display='none';
		_ge('enc_check').style.display='none';
	}
}

document.addEventListener('DOMContentLoaded', doit);
