define(function () {
    var Lru = function(pageInFrames, callHistory){
      this.pageInFrames = pageInFrames
      this.callHistory = callHistory
    }

    Lru.prototype.run = function(){
      var history = []
      while(this.callHistory.length > 0){
        var page = this.callHistory.pop()
        if(this.pageInFrames.indexOf(page) >= 0){
          if(history.indexOf(page) < 0)
            history.push(page)
        }
      }

      while(this.pageInFrames.length > 0){
        var candidate = this.pageInFrames.pop()
        if(history.indexOf(candidate) < 0)
          return candidate
      }
      return history.pop()
    }

    return Lru
})
