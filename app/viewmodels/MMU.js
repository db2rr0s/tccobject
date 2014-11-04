define(function(require){
  var Page = require('./Page')
  var fifo = require('./algoritmos/Fifo')

  var MMU = function(algoritmo, alocacao, alocacaoFrameA, alocacaoFrameB, alocacaoFrameC,
                     busca, buscaPageA, buscaPageB, buscaPageC, escopo,
                     pagesA, pagesB, pagesC, callStack){
    this.maxFrame = 8
    this.pagesTotal = 5
    this.algoritmo = algoritmo
    this.alocacao = alocacao
    if(this.alocacao == 1){
      var afA = parseInt(alocacaoFrameA)
      var afB = parseInt(alocacaoFrameB)
      var afC = parseInt(alocacaoFrameC)
      if((afA + afB + afC) != this.maxFrame + 1)
        throw "Total do número de frames de alocacao fixa diferente do total de frames"
      this.maxFrameA = afA - 1
      this.maxFrameB = this.maxFrameA + afB
      this.maxFrameC = this.maxFrameB + afC
    }

    this.busca = busca
    if(busca == 1){
      this.buscaPageA = parseInt(buscaPageA)
      this.buscaPageB = parseInt(buscaPageB)
      this.buscaPageC = parseInt(buscaPageC)
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

      if((this.buscaPageA + this.buscaPageB + this.buscaPageC) > this.maxFrame + 1)
        throw "Total de páginas de busca antecipada maior que o total de frames"
    }

    this.pagesA = pagesA
    if(this.pagesA.length != this.pagesTotal){
      throw "Total de páginas do processo A diferente do total esperado"
    }

    this.pagesB = pagesB
    if(this.pagesB.length != this.pagesTotal){
      throw "Total de páginas do processo B diferente do total esperado"
    }

    this.pagesC = pagesC
    if(this.pagesC.length != this.pagesTotal){
      throw "Total de páginas do processo C diferente do total esperado"
    }

    this.escopo = escopo
    if(this.escopo == 1 && this.alocacao == 1){
      throw "Escopo local não pode ser usado com alocação fixa"
    }
    this.callStack = callStack
    this.freeFrames = []
    this.busyFrames = []
    this.freeFramesA = []
    this.freeFramesB = []
    this.freeFramesC = []
    this.busyFramesA = []
    this.busyFramesB = []
    this.busyFramesC = []

    if(this.alocacao == 1){
      for(var i = this.maxFrameA; i >= 0; i--){
        this.freeFramesA.push(i)
      }
      for(var i = this.maxFrameB; i > this.maxFrameA; i--){
        this.freeFramesB.push(i)
      }
      for(var i = this.maxFrameC; i > this.maxFrameB; i--){
        this.freeFramesC.push(i)
      }
    } else {
      for(var i = this.maxFrame; i >= 0; i--){
        this.freeFrames.push(i)
      }
    }

    this.callHistory = []
  }

  MMU.prototype.findPageByFrame = function(frame){
    for(var i = 0; i < this.pagesA.length; i++){
      var aux = this.pagesA[i]
      if(aux.pf.content == frame.toString())
        return aux
    }

    for(var i = 0; i < this.pagesB.length; i++){
      var aux = this.pagesB[i]
      if(aux.pf.content == frame.toString())
        return aux
    }

    for(var i = 0; i < this.pagesC.length; i++){
      var aux = this.pagesC[i]
      if(aux.pf.content == frame.toString())
        return aux
    }
  }

  MMU.prototype.findPage = function(page){
    var pages
    if(page.proc == 'A'){
      pages = this.pagesA
    } else if(page.proc == 'B'){
      pages = this.pagesB
    } else if(page.proc == 'C'){
      pages = this.pagesC
    }

    for(var i = 0; i < pages.length; i++){
      var aux = pages[i]
      if(page.equals(aux))
        return aux
    }
  }

  MMU.prototype.getFreeFrame = function(page){
    if(this.alocacao == 1){
      if(page.proc == 'A'){
        if(this.freeFramesA.length > 0){
          var frame = this.freeFramesA.pop()
          return frame
        }
      } else if(page.proc == 'B'){
        if(this.freeFramesB.length > 0){
          var frame = this.freeFramesB.pop()
          return frame
        }
      } else if(page.proc == 'C'){
        if(this.freeFramesC.length > 0){
          var frame = this.freeFramesC.pop()
          return frame
        }
      }
    } else {
      if(this.freeFrames.length > 0){
        var frame = this.freeFrames.pop()
        return frame
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
    if(this.escopo == 1){
      this.busyFrames.push(frame)
    } else {
      if(page.proc == 'A'){
        this.busyFramesA.push(frame)
      } else if(page.proc == 'B'){
        this.busyFramesB.push(frame)
      } else if(page.proc == 'C'){
        this.busyFramesC.push(frame)
      }
    }
  }

  MMU.prototype.configurePageOut = function(page, nextPage){
    page.bv.content = 0
    if(page.useBRFlag)
      page.br.content = 0
    page.bs.content = 0
    var frame = parseInt(page.pf.content)
    if(this.escopo == 1){
      var index = this.busyFrames.indexOf(frame)
      this.busyFrames.splice(index, 1)
    } else {
      if(page.proc == 'A'){
        var index = this.busyFramesA.indexOf(frame)
        this.busyFramesA.splice(index, 1)
      } else if(page.proc == 'B'){
        var index = this.busyFramesB.indexOf(frame)
        this.busyFramesB.splice(index, 1)
      } else if(page.proc == 'C'){
        var index = this.busyFramesC.indexOf(frame)
        this.busyFramesC.splice(index, 1)
      }
    }
    page.pf.content = ''

    this.configurePageIn(nextPage, frame)
    page.nextPage = nextPage
  }

  MMU.prototype.nextCall = function(call){
    this.callHistory.push(call)

    var page = this.findPage(new Page().parse(call))

    if(page.useBRFlag)
      page.br.content = 1

    if(page.pf.content)
      return {'state': 'recall', 'page': page}

    var frame = this.getFreeFrame(page)
    if(frame != undefined){
      this.configurePageIn(page, frame)
      return {'state': 'pageIn', 'page': page}
    }

    var frame = this.executeAlgoritmo(page)
    var backPage = this.findPageByFrame(frame)

    this.configurePageOut(backPage, page)

    return {'state': 'pageOut', 'page': backPage}
  }

  MMU.prototype.executeAlgoritmo = function(page){
    if(this.escopo == 1){
      var f = new fifo(this.busyFrames.slice(0))
      return f.run()
    } else {
      var f
      if(page.proc == 'A'){
        if(this.busyFramesA.length == 0){
          if(this.busyFramesB.length > this.busyFramesC){
            f = new fifo(this.busyFramesB.slice(0))
          } else {
            f = new fifo(this.busyFramesC.slice(0))
          }
        } else{
          f = new fifo(this.busyFramesA.slice(0))
        }
        return f.run()
      }
      if(page.proc == 'B'){
        if(this.busyFramesB.length == 0){
          if(this.busyFramesA.length > this.busyFramesC){
            f = new fifo(this.busyFramesA.slice(0))
          } else {
            f = new fifo(this.busyFramesC.slice(0))
          }
        } else{
          f = new fifo(this.busyFramesB.slice(0))
        }
        return f.run()
      }
      if(page.proc == 'C'){
        if(this.busyFramesC.length == 0){
          if(this.busyFramesA.length > this.busyFramesB){
            f = new fifo(this.busyFramesA.slice(0))
          } else {
            f = new fifo(this.busyFramesB.slice(0))
          }
        } else{
          f = new fifo(this.busyFramesC.slice(0))
        }      
        return f.run()
      }
    }
  }

  return MMU
})
