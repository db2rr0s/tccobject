define(function () {
    var ReloFifoCirc = function(callQueue, refString){
      this.callQueue = callQueue
      this.refString = refString
    }

    ReloFifoCirc.prototype.run = function(){
      var head = this.callQueue.shift()
      return head
    }

    return ReloFifoCirc
})
