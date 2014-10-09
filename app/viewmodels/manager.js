define(function(require){
  var Fifo = require('viewmodels/algoritmos/Fifo')
  var Manager = function(context, totalFrames, algoritmo, movePageToFrameHandler, movePageBackHandler){
    this.algoritmo = algoritmo
    this.movePageToFrame = movePageToFrameHandler
    this.movePageBack = movePageBackHandler
    this.context = context
    this.runningValue = undefined
    this.freeFrames = []
    this.busyFrames = []
    this.movedPages = []
    this.pfmap = {}
    for(var i = totalFrames; i > 0; i--){
      this.freeFrames.push(i)
    }
    this.state = 0
    this.pendingPage = undefined
  }

  var continueClosure = function(self){
    var self = self
    return function(){
      self.continue(self)
    }
  }

  Manager.prototype.getFreeFrame = function(){
    if(this.freeFrames.length > 0){
      var frame = this.freeFrames.pop()
      this.busyFrames.push(frame)
      return frame
    } else {
      switch(this.algoritmo){
        case '1':
          var fifo = new Fifo()
          fifo.run()
        break;
      }
      this.state = 2
      var aux = this.busyFrames.slice(0)
      aux.reverse()
      var frame = aux.pop()
      this.freeFrames.push(frame)
      return frame
    }
  }

  Manager.prototype.nextPage = function(){
    var page = this.context.nextPage()
    while(this.movedPages.indexOf(page) >= 0)
      page = this.context.nextPage()
    if(page === undefined){
      console.log('End of life')
      return
    }
    this.movedPages.push(page)
    return page
  }

  Manager.prototype.start = function(){
    if(this.freeFrames.length < 1){
      console.log('Não há frames livres para iniciar a simulação')
      return
    }

    var page = this.nextPage()
    if(page === undefined) {
      console.log('Não há páginas')
      return
    }

    var frame = this.getFreeFrame()
    this.state = 1
    this.pfmap[frame] = page
    this.movePageToFrame(this.context, page, frame, continueClosure(this))
  }

  Manager.prototype.continue = function(self){
    var frame = self.getFreeFrame()
    if(self.pendingPage != undefined){
      self.pfmap[frame] = self.pendingPage
      self.pendingPage = undefined
      self.movePageToFrame(self.context, self.pendingPage, frame, continueClosure(self))
      return
    }

    var page = self.nextPage()
    if(page === undefined) return

    switch(self.state){
      case 1:
        self.pfmap[frame] = page
        self.movePageToFrame(self.context, page, frame, continueClosure(self))
        return
      break
      case 2:
        self.state = 1
        self.pendingPage = page
        self.movePageBack(self.pfmap[frame], continueClosure(self))
        return
      break
    }
  }

  return Manager
})
