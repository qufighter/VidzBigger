String.prototype.qslice=function(before,after){
	var s=this.indexOf(before)+before.length; 
	var n=this.indexOf(after,s);
	if(n<0)return this.substr(s);
	return this.substr(s,n-s);
}
chrome.extension.onRequest.addListener(
		function(request, sender, sendResponse) {
			//console.log(request.msgType);//DONT forget about PERMISISONS or the SIZE LIMITE on the returned object, hence we are returnign only the text now
				if( request.msgType=="G_xmlhttpRequest" ){
					share_enabled = ((localStorage['share_enabled']=='true')?true:false);
					crypt_enabled = ((localStorage['crypt_enabled']=='true')?true:false);
					//crypt_enabled=true;
					if(!share_enabled && sender.tab && sender.tab.incognito){
						sendResponse({responseText:''})
						return;
					}
					if(!share_enabled){
						//&url='+escape(window.location)+'&title='+escape(document.title)
						var ourl = request.url;
						var s = ourl.indexOf('&url=');
						if( s > 0 ){
							ourl = ourl.substr(0,s)
							request.url=ourl 
						}
				}
				var sr = sendResponse;
				var xhr = new XMLHttpRequest();
				var params = null;
				if(crypt_enabled && request.url.indexOf('www.vidzbigger.com'>0)){
					var ursplit=request.url.indexOf('?');
					if(ursplit==-1)params = 'host='+request.url;
					else params = 'host='+request.url.substr(0,ursplit) + '&' + request.url.substr(ursplit+1);
					params=cmdEncryptClick(params);
					if( !params ){
						createKey();
						sendResponse({responseText:'<!--VZB_B-->Sorry, your key is not ready yet.  Try again in a moment. <a href="javascript:retryloadBrowserURL();">Retry</a><!--VZB_E-->'})
						return;
					}
					params = 'data='+encodeURIComponent(params);
					params = params.replace(/%20/g, "+");
					request.url='http://www.vidzbigger.com/crypt.php';//+'?'+params;
					request.method='POST';
				}
				//console.log(request.url +' '+ params);
				xhr.onreadystatechange=function(){if(xhr.readyState == 4){
					if(crypt_enabled){
						if(xhr.responseText.indexOf('<!--NUKE')>-1){
							setKey(xhr.responseText.qslice('<!--NUKE','NUKE-->'));
						}else if(xhr.responseText.indexOf('_B--><!--VZB_E') > 0){
							createKey();
							sendResponse({responseText:'<!--VZB_B-->Sorry, your key is expired.  Try again in a moment. <a href="javascript:retryloadBrowserURL();">Retry</a><!--VZB_E-->'})
							return;
						}
					}
					sr({responseText:xhr.responseText})
				}};
				xhr.open(request.method, request.url, true);
				if(request.method=='POST'){
					xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				}else{
					params=null;
				}
				xhr.send(params);
			}else if( request.msgType=="G_setValue" ){
				//console.log("saving "+request.n+" "+request.v);
				localStorage[request.n]=request.v;
				sendResponse({})
			}else if( request.msgType=="G_getValues" ){//returns all stored values in a single object, for usage once
				var response = new Object();
				for( i in localStorage ){
					response[i]=localStorage[i];
				}
				sendResponse(response)
			}else{
				sendResponse({})
			}
		//}else{
			//sendResponse({})
		//}
	});
	var key,keyready=false,busy=false;
	function createKey(){
		if(busy)return;
		if( typeof(setMaxDigits) != 'function' ){
			localStorage.crypt_enabled=false;
			return;
		}
		keyready=false;
		//here we request a key
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange=function(){if(xhr.readyState == 4){
			keyready = setKey(xhr.responseText);
		}};
		xhr.open('GET', 'http://www.vidzbigger.com/crypt.php', true);
		busy=true;
		xhr.send();
	}
	function setKey(tx){
		var parts=tx.split('::');
		var digi=parts[2]-0;
		busy=false;
		if( digi > 34 )setMaxDigits(digi);
		else return false;
		key = new RSAKeyPair(parts[0],"",parts[1]);
		return true;
	}
	function bodyLoad(){
		if(localStorage.crypt_enabled)
			createKey();
	}
	
	function cmdEncryptClick(txtPlaintext){
		if( keyready )
			return performencrypt(key, txtPlaintext);//encryptedString(key, txtPlaintext);
		else return false;
}

setTimeout(bodyLoad,15)