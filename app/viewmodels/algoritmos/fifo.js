define(function () {
    var Fifo = function(callQueue){
      this.callQueue = callQueue
    }

    Fifo.prototype.run = function(){
      var head = this.callQueue.shift()
      return head
    }

    return Fifo
})
