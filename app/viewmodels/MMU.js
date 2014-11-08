define(function(require){
  var Page = require('./Page')
  var fifo = require('./algoritmos/Fifo')
  var otimo = require('./algoritmos/Otimo')
  var lru = require('./algoritmos/Lru')
  var relofifocirc = require('./algoritmos/ReloFifoCirc')

  var MMU = function(algoritmo, alocacao, alocacaoFrameA, alocacaoFrameB, alocacaoFrameC,
                     busca, buscaPageA, buscaPageB, buscaPageC, escopo,
                     pagesA, pagesB, pagesC, callStack){
    this.maxFrame = 8
    this.algoritmo = algoritmo
    this.alocacao = alocacao
    this.busca = busca
    if(busca == 1){
      this.ready = false
      this.buscaPageA = parseInt(buscaPageA)
      this.buscaPageB = parseInt(buscaPageB)
      this.buscaPageC = parseInt(buscaPageC)
      if((this.buscaPageA + this.buscaPageB + this.buscaPageC) > this.maxFrame + 1)
        throw "Busca antecipada soma mais que total de frames"
        
      this.startPages = []
      for(var i = 1; i <= this.buscaPageA; i++)
        this.startPages.push(pagesA[i-1].toString())
      for(var i = 1; i <= this.buscaPageB; i++)
        this.startPages.push(pagesB[i-1].toString())
      for(var i = 1; i <= this.buscaPageC; i++)
        this.startPages.push(pagesC[i-1].toString())
      this.startPages.reverse()
    } else {
      this.ready = true
    }

    if(this.alocacao == 1){
      var afA = parseInt(alocacaoFrameA)
      var afB = parseInt(alocacaoFrameB)
      var afC = parseInt(alocacaoFrameC)
      if((afA + afB + afC) != this.maxFrame + 1)
        throw "Total do número de frames de alocacao fixa diferente do total de frames"
      this.maxFrameA = afA - 1
      this.maxFrameB = this.maxFrameA + afB
      this.maxFrameC = this.maxFrameB + afC
    } else if(this.busca == 1) {
      this.maxFrameA = this.buscaPageA - 1
      this.maxFrameB = this.maxFrameA + this.buscaPageB
      this.maxFrameC = this.maxFrameB + this.buscaPageC
      this.totalFrames = {}
      this.totalFrames['A'] = this.buscaPageA
      this.totalFrames['B'] = this.buscaPageB
      this.totalFrames['C'] = this.buscaPageC
    } else {
      this.maxFrameA = 1
      this.maxFrameB = 3
      this.maxFrameC = 5
      this.totalFrames = {}
      this.totalFrames['A'] = 2
      this.totalFrames['B'] = 2
      this.totalFrames['C'] = 2
    }

    if(this.alocacao == 1){
      if(this.buscaPageA > this.maxFrameA + 1){
        throw "Busca antecipada de A maior que alocação fixa"
      }
      if(this.buscaPageB > this.maxFrameB - this.maxFrameA){
        throw "Busca antecipada de B maior que alocação fixa"
      }
      if(this.buscaPageC > this.maxFrameC - this.maxFrameB){
        throw "Busca antecipada de C maior que alocação fixa"
      }
    }

    this.pages = {}
    this.pages['A'] = pagesA
    this.pages['B'] = pagesB
    this.pages['C'] = pagesC

    this.escopo = escopo
    if(this.escopo == 1 && this.alocacao == 1){
      throw "Escopo local não pode ser usado com alocação fixa"
    }
    this.callStack = callStack
    this.freeFrames = {}
    this.freeFrames['A'] = []
    this.freeFrames['B'] = []
    this.freeFrames['C'] = []
    this.allFreeFrames = []
    this.busyFrames = {}
    this.busyFrames['A'] = []
    this.busyFrames['B'] = []
    this.busyFrames['C'] = []
    this.allBusyFrames = []

    for(var i = this.maxFrameA; i >= 0; i--){
      this.freeFrames['A'].push(i)
    }
    for(var i = this.maxFrameB; i > this.maxFrameA; i--){
      this.freeFrames['B'].push(i)
    }
    for(var i = this.maxFrameC; i > this.maxFrameB; i--){
      this.freeFrames['C'].push(i)
    }
    for(var i = this.maxFrame; i > this.maxFrameC; i--){
      this.allFreeFrames.push(i)
    }

    this.callHistory = []
    this.workset = 0
  }

  MMU.prototype.findPageByFrame = function(frame){
    for(var i = 0; i < this.pages['A'].length; i++){
      var aux = this.pages['A'][i]
      if(aux.pf.content == frame.toString())
        return aux
    }

    for(var i = 0; i < this.pages['B'].length; i++){
      var aux = this.pages['B'][i]
      if(aux.pf.content == frame.toString())
        return aux
    }

    for(var i = 0; i < this.pages['C'].length; i++){
      var aux = this.pages['C'][i]
      if(aux.pf.content == frame.toString())
        return aux
    }
  }

  MMU.prototype.findPage = function(page){
    var pages = this.pages[page.proc]
    for(var i = 0; i < pages.length; i++){
      var aux = pages[i]
      if(page.equals(aux))
        return aux
    }
  }

  MMU.prototype.getFreeFrame = function(page){
    var frames = this.freeFrames[page.proc]
    if(frames.length > 0){
      var frame = frames.pop()
      return frame
    } else if(this.alocacao == 2){
      if(this.totalFrames[page.proc] > this.busyFrames[page.proc].length){
        return this.allFreeFrames.pop()
      }
    }
  }

  MMU.prototype.configurePageIn = function(page, frame){
    page.pf.content = frame
    page.bv.content = 1
    if(page.rw == 'W')
      page.bs.content = 1
    else
      page.bs.content = 0
    this.busyFrames[page.proc].push(frame)
    this.allBusyFrames.push(frame)
  }

  MMU.prototype.configurePageOut = function(page, nextPage){
    page.bv.content = 0
    if(page.useBRFlag)
      page.br.content = 0
    page.bs.content = 0
    var frame = parseInt(page.pf.content)
    var index = this.busyFrames[page.proc].indexOf(frame)
    this.busyFrames[page.proc].splice(index, 1)
    index = this.allBusyFrames.indexOf(frame)
    this.allBusyFrames.splice(index, 1)
    page.pf.content = ''
    this.configurePageIn(nextPage, frame)
    page.nextPage = nextPage
  }

  MMU.prototype.startPage = function(){
    var next = this.startPages.pop()
    if(next == undefined){
      this.ready = true
      return
    }
    var page = this.findPage(new Page().parse(next))
    if(page.useBRFlag)
      page.br.content = 1
    var frame = this.getFreeFrame(page)
    this.configurePageIn(page, frame)
    return page
  }

  MMU.prototype.nextCall = function(call){
    this.callHistory.push(call)
    var page = this.findPage(new Page().parse(call))

    if(page.useBRFlag)
      page.br.content = 1

    if(page.pf.content){
      this.updateWorkset()
      return {'state': 'recall', 'page': page}
    }

    var frame = this.getFreeFrame(page)
    if(frame != undefined){
      this.configurePageIn(page, frame)
      this.updateWorkset()
      return {'state': 'pageIn', 'page': page}
    }

    var frame = this.executeAlgoritmo(page)
    var backPage = this.findPageByFrame(frame)

    this.configurePageOut(backPage, page)
    this.updateWorkset()
    return {'state': 'pageOut', 'page': backPage}
  }

  MMU.prototype.executeAlgoritmo = function(page){
    if(this.algoritmo == 1){
      return this.runOtimo(page)
    } else if(this.algoritmo == 2){
      return this.runFIFO(page)
    } else if(this.algoritmo == 3){
      return this.runLRU(page)
    } else if(this.algoritmo == 4){
      return this.runReloFifoCirc(page)
    }
  }

  MMU.prototype.updateWorkset = function(){
    this.workset = this.workset + 1
    if(this.alocacao != 2 || this.workset != 3){
      return
    }

    this.workset = 0
    var a = 0, b = 0, c = 0
    var aux = this.callHistory.slice(-3)
    for(var i = 0; i < aux.length; i++){
      var page = new Page()
      page.parse(aux[i])
      if(page.proc == 'A'){
        a = a + 1;
      }else if(page.proc == 'B'){
        b = b + 1;
      }else if(page.proc == 'C'){
        c = c + 1;
      }
    }


    if(a >= b && a >= c){
      this.totalFrames['A'] = a
    }else if(b >= a && b >= c){
      this.totalFrames['B'] = b
    }else if(c >= a && c >= b){
      this.totalFrames['C'] = c
    }
  }

  MMU.prototype.runFIFO = function(page){
    if(this.escopo == 1){
      var f = new fifo(this.allBusyFrames.slice(0))
      return f.run()
    } else {
      var f = new fifo(this.busyFrames[page.proc].slice(0))
      return f.run()
    }
  }

  MMU.prototype.runOtimo = function(page){
    var aux = []
    if(this.escopo == 1){
      for(var i = 0; i < this.allBusyFrames.length; i++){
        var p = this.findPageByFrame(this.allBusyFrames[i])
        aux.push(p.toString())
      }
    } else {
      for(var i = 0; i < this.busyFrames[page.proc].length; i++){
        var p = this.findPageByFrame(this.busyFrames[page.proc][i])
        aux.push(p.toString())
      }
    }

    var aux2 = this.callStack().slice(0)
    var f = new otimo(aux, aux2)
    var p = f.run()

    var page = new Page()
    page.parse(p)

    return this.findPage(page).pf.content
  }

  MMU.prototype.runLRU = function(page){
    var aux = []
    if(this.escopo == 1){
      for(var i = 0; i < this.allBusyFrames.length; i++){
        var p = this.findPageByFrame(this.allBusyFrames[i])
        aux.push(p.toString())
      }
    } else {
      for(var i = 0; i < this.busyFrames[page.proc].length; i++){
        var p = this.findPageByFrame(this.busyFrames[page.proc][i])
        aux.push(p.toString())
      }
    }

    var aux2 = this.callHistory.slice(0)
    var f = new lru(aux, aux2)
    var p = f.run()

    var page = new Page()
    page.parse(p)

    return this.findPage(page).pf.content
  }

  MMU.prototype.runReloFifoCirc = function(page){
    var aux = []
    if(this.escopo == 1){
      for(var i = 0; i < this.allBusyFrames.length; i++){
        var p = this.findPageByFrame(this.allBusyFrames[i])
        aux.push(p)
      }
    } else {
      for(var i = 0; i < this.busyFrames[page.proc].length; i++){
        var p = this.findPageByFrame(this.busyFrames[page.proc][i])
        aux.push(p)
      }
    }

    if(!this.pont){
      this.pont = 0
    }

    while(true){
      var p = aux[this.pont]
      if(p.br.content == 1){
        p.br.content = 0
        this.pont = this.pont + 1
        if(this.pont >= aux.length){
          this.pont = 0
        }
      } else {
        return p.pf.content
      }
    }
  }

  return MMU
})
