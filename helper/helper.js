// ==UserScript==
// @name         Acfun文章区助手
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Acfun文章区助手 抽奖 AGN评分
// @author       styang
// @require      https://cdn.bootcss.com/clipboard.js/1.5.16/clipboard.min.js
// @require      https://cdn.bootcss.com/axios/0.18.0/axios.min.js
// @match        http://www.acfun.cn/a/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var $ = window.$;
    var AID = location.href.replace('http://www.acfun.cn/a/ac','').split('#')[0]
    var baseUrl = 'http://www.acfun.cn/rest/pc-direct/comment/listByFloor?sourceId=AID&sourceType=1&page=PAGE&pivotCommentId=0'.replace('AID',AID)
    var getComments = function(page){
       return axios.get(baseUrl.replace('PAGE',page))
    }
    var total = 0
    var totalPage = 0
    var comments = []
    var results = []
    var uids = new Set()
    var users = new Set()
    var ram = function(){
        var val = Math.ceil(Math.random()*total);
        if(results.indexOf(val)<0){
            results.push(val);
            return val
        }else{
            ram();
        }
    };
    var luckcount = 1
    window.lottery = function(){
        let floornumber = ram()
        console.log(`抽取第${luckcount}位天选之子${floornumber}`)
        let user = comments.find(e=>e.floor === floornumber)
        if(user&&!uids.has(user.userId)&&!user.isUp){
            console.log(`第${luckcount}位天选之子【${ user.userName}】`)
            if($('.edui-body-container').text().indexOf('评论5字起') === 0){
                  $('.edui-body-container').empty()
            }
            $('.edui-body-container').append(`<p>第${luckcount}位天选之子${floornumber}楼的 @${user.userName}</p>`)
            luckcount++
            uids.add(user.userId)
        }else{
         window.lottery()
        }
    }
$(function(){
	getComments(1).then(res =>{
          const data = res.data
          if(data.isUp){
              console.log('确认为up主，载入抽奖助手...')
              total = data.totalCount
              totalPage = data.totalPage
              for(var key in data.commentsMap){
                 var comment = data.commentsMap[key]
                 if(!users.has(comment.userId)){
                     comments.push(comment)
                 }
              }
              for(var page=2;page<totalPage+1;page++){
                 getComments(page).then(pageres => {
                    for(var key in pageres.data.commentsMap){
                        var comment = pageres.data.commentsMap[key]
                        if(!users.has(comment.userId)){
                             comments.push(comment)
                         }
                    }
                 })
              }
              var button = document.createElement('div');
              var jqButton = $(button);
              var buttonCss = {
                  'border-radius':'15px',
                  'padding':'5px 10px',
                  'background':'#fd4c5b',
                  'display':'inline-block',
                  'cursor':'pointer',
                  'margin-left':'5px',
                  'color':'#fff'
              };
              jqButton.css(buttonCss);
              jqButton.attr('onclick',"lottery()");
              jqButton.text('开始抽奖');
              $('#art-operate').append(button.outerHTML);
          }
    })
})
})();