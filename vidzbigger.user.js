// ==UserScript==
// @name           VidzBigger
// @namespace      http://vidzbigger.com
// @description   Automatically Scale YouTube Video to Largest Possible Size Scroll down to read comments without missing video 
// @include       http://www.youtube.com/*
// @include       http://youtube.com/*
// @include       http://*.youtube.tld/*
// @include       http://youtube.tld/*
// @include       https://youtube.com/*
// @include       https://*.youtube.tld/*
// @include       https://youtube.tld/*
// @include       http://video.google.tld/*
// @include       http://www.dailymotion.com/*
// @include       http://www.metacafe.com/*
// @include       http://www.hulu.com/*
// @include       http://vimeo.com/*
// @include       http://www.escapistmagazine.com/*
// @include       http://*vidzbigger.tld/*
// @match         http://www.youtube.com/watch*
// @exclude       http://www.vidzbigger.com/demo*
// @exclude       http://www.vidzbigger.com/videoSimple*
// @exclude       http://www.vidzbigger.com/blog*
// @exclude       http://vidzbigger.com/demo*
// @exclude       http://vidzbigger.com/videoSimple*
// @exclude       http://vidzbigger.com/blog*
// @exclude       http://video.google.tld/videosearch*
// @exclude       http://*youtube.tld/copyright*
// @exclude       http://*youtube.tld/my*
// @exclude       http://*youtube.tld/watch_popup*
// @exclude       http://*digg.com/tools*
// ==/UserScript==  
	
////*****************************************************************************///
///                                                                               //
//        LOOKS LIKE YOU FORGOT TO ENABLE GreaseMonkey!  Click the monkey!        //
//                                                                                //
//   (the monkey is located in the bottom right corner of your firefox window)    //
//   (in the status bar,which you can show using view status bar if you need)     //
//                                                                                //
//    Once the monkey is Lit Up (not grey) click your back button and try again!  //
//                                                                                //
//               SORRY IE USERS-NO SUPPORT for GreaseMonkey Yet.                  //
//                 Download Firefox and/or visit VidzBigger.com                   //
//                                                                                //
//********************************************************************************//
//********************************************************************************//
//*******************************************************************************//
//******************************************************************************//

var vidz_Version=0.073;
var startTime=new Date().getTime();
var detectn=false;
var isInWatchMode=false;
var BG_Values={};
var shareVideoViewStatistics=false;

if( typeof(GM_xmlhttpRequest)=='undefined' ){
	function GM_xmlhttpRequest(obj){}
}
if (typeof(GM_setValue)=='undefined'){
  localStorage[name]=value;
}
if(typeof(GM_getValue)=='undefined'){
  if(typeof(localStorage[name])!='undefined')return localStorage[name];
  return defaultValue;
}
var styleelem;
if( typeof(GM_addStyle)=='undefined' ){
function GM_addStyle(styles){
	styleelem=document.createElement('style');
	styleelem.type='text/css';
	styleelem.appendChild(document.createTextNode(''+styles+''));
	GM_addStyle=function(styles){
		styleelem.appendChild(document.createTextNode(''+styles+''));
	}
	VM_AppendStyles=function(){if(styleelem){
		var e=(document.getElementsByTagName('head')[0]||document.body);
		if(e){e.appendChild(styleelem);GM_setValue('cdelay',-1);
			//e.removeChild(styleelem);
		}else{
			console.log('No document header or document body detected.... please reload the page... or enable auto reload on blank page in preferences... deleting most cookie prefrences you might have... you may want to clear cookies manually');
		}
	}}
}}
function GM_addScript(styles){window.location='javascript:'+styles;}

if(typeof(chrome)!='undefined'){
	detectn=true;
	chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.goBig)
	  	goBig();
	  else if (request.goHome)
	  	goHome();
	  sendResponse({});
	});

	if(detectn)function GM_xmlhttpRequest(robj){
		robj.G_xmlhttpRequest=true;var obj=robj;
		chrome.runtime.sendMessage(robj, function(response){obj.onload(response)});
	}
	function GM_setValue(name, value){
		localStorage[name]=value;
		chrome.runtime.sendMessage({setValue:true,n:name,v:value}, function(r){});
	}
	function GM_getValue(name, defaultVal){
		if(typeof(localStorage[name])!='undefined')return localStorage[name];
    return defaultValue;
	}
	function loadGloballySaved(){
		chrome.runtime.sendMessage({initializeContentScript:true}, function(response){
			for(i in response){
				localStorage[i]=response[i];
			}
			shareVideoViewStatistics=localStorage['share_enabled']=='true'?true:false;
		});
	}

	loadGloballySaved();
}

function vidzbiggerCheckVersion(){
	if(!shareVideoViewStatistics) return;
	var versioncheckurl='http://www.vidzbigger.com/version.php?version='+vidz_Version+'&watch='+isInWatchMode;
	var nowViewing='&url='+escape(window.location)+'&title='+escape(document.title);
	var loadur=versioncheckurl
	if(shareVideoViewStatistics){
		loadur+=nowViewing
	}else return;
	//console.log(loadur);
	GM_xmlhttpRequest({
	  method: 'GET',
	  url: loadur,
	  onload: function(responseDetails){
	  	//console.log(responseDetails);
	  }
	});
}

function _gel(n){
	return document.getElementById(n);
}
function getElementYpos(el){
		var _y=0;
		while( el && !isNaN( el.offsetTop ) ) {
				_y +=el.offsetTop;// - el.scrollTop;(thanks ie?)  
				el=el.offsetParent;
		}return _y;
}
function getOffset( el ){
	var _x=0,_y=0;
	while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
			_x+=el.offsetLeft;// - el.scrollLeft;
			_y+=el.offsetTop;// - el.scrollTop;  
			el=el.offsetParent;
	}return { y: _y, x: _x };
}

var vidIsBig=false;
var tollerance=10;
var videoYpos=50,vidYmin=50,vidYmax=50;
var vidBigTimeout=0;

function setVideoYPosition(vyp){
	videoYpos=vyp;
	vidYmin=videoYpos-tollerance;
	vidYmax=videoYpos+tollerance;
}

function goHome(){
	window.scrollTo(window.pageXOffset,0);
}

function goBig(){
	window.scrollTo(window.pageXOffset,videoYpos);
}

function tryVidzbigger(){
	if(_gel('player-api') && _gel('watch7-sidebar') && _gel('player')){
		isInWatchMode=true;
		
		GM_addStyle(
	".vidzbigger #watch7-sidebar{margin-top:auto!important;}"+
	".vidzbigger #player{padding-left:0px!important;}"+
	".vidzbigger #player-api{width:100%!important;height:100%!important;}");
		VM_AppendStyles();
		
		setVideoYPosition(getElementYpos(_gel('player-api')));
	
		function viewScrolled(ev){
			clearTimeout(vidBigTimeout);
			var scp=window.pageYOffset;
			if(scp > vidYmin && scp < vidYmax){
				if(!vidIsBig){
					vidIsBig=true;
					document.body.className=document.body.className+' vidzbigger';
				}
				vidBigTimeout=setTimeout(goBig,1000);//to get position exact
			}else if(vidIsBig){
				document.body.className=document.body.className.replace(' vidzbigger','');
				vidIsBig=false;
			}
		}
	
		window.addEventListener('scroll',viewScrolled);
		
		goBig();
		
		window.setTimeout(vidzbiggerCheckVersion,10000);
	}
}

document.addEventListener('DOMContentLoaded',tryVidzbigger);
