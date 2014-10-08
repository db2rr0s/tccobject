define(function(require){
  var pp = require('viewmodels/Page')
  var Manager = function(movePageToFrameHandler, movePageBackHandler){
    this.movePageToFrame = movePageToFrameHandler
    this.movePageBack = movePageBackHandler
  }

  Manager.prototype.start = function(page, callback){
    console.log('Starting pp')
    console.log(page)
    this.movePageToFrame()
  }

  return Manager
})
