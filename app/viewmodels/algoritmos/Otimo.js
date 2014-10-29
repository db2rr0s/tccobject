define(function () {
    var Otimo = function(pageInFrames, refString){
      this.pageInFrames = pageInFrames
      this.refString = refString
    }

    Otimo.prototype.run = function(){
      var history = []
      while(this.refString.length > 0){
        var page = this.refString.pop()
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

    return Otimo
})
