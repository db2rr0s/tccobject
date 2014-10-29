define(function () {
    var Lru = function(callQueue, refString){
      this.callQueue = callQueue
      this.refString = refString
    }

    Lru.prototype.run = function(){
      var head = this.callQueue.shift()
      return head
    }

    return Lru
})
