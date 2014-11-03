define(function(require){
  var Page = require('./Page')
  var fifo = require('./algoritmos/Fifo')

  var MMU = function(algoritmo, alocacao, alocacaoFrameA, alocacaoFrameB, alocacaoFrameC,
                     busca, buscaPageA, buscaPageB, buscaPageC, escopo,
                     pagesA, pagesB, pagesC, callStack){
    this.framesTotal = 8
    this.pagesTotal = 5
    this.algoritmo = algoritmo
    this.alocacao = alocacao
    if(alocacao == 1){
      this.alocacaoFrameA = parseInt(alocacaoFrameA)
      this.alocacaoFrameB = parseInt(alocacaoFrameB)
      this.alocacaoFrameC = parseInt(alocacaoFrameC)
      if((this.alocacaoFrameA + this.alocacaoFrameB + this.alocacaoFrameC) != this.framesTotal)
        throw "Total do número de frames de alocacao fixa diferente do total de frames"
    }

    this.busca = busca
    if(busca == 1){
      this.buscaPageA = parseInt(buscaPageA)
      this.buscaPageB = parseInt(buscaPageB)
      this.buscaPageC = parseInt(buscaPageC)
      if((this.buscaPageA + this.buscaPageB + this.buscaPageC) > this.framesTotal)
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
    this.callStack = callStack
    this.freeFrames = []
    this.busyFrames = []

    for(var i = this.framesTotal; i >= 0; i--){
      this.freeFrames.push(i)
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
    for(var i = 0; i < this.pagesA.length; i++){
      var aux = this.pagesA[i]
      if(page.equals(aux))
        return aux
    }

    for(var i = 0; i < this.pagesB.length; i++){
      var aux = this.pagesB[i]
      if(page.equals(aux))
        return aux
    }

    for(var i = 0; i < this.pagesC.length; i++){
      var aux = this.pagesC[i]
      if(page.equals(aux))
        return aux
    }
  }

  MMU.prototype.getFreeFrame = function(){
    if(this.freeFrames.length > 0){
      var frame = this.freeFrames.pop()
      return frame
    }
  }

  MMU.prototype.nextCall = function(call){
    this.callHistory.push(call)

    var page = this.findPage(new Page().parse(call))

    if(page.useBRFlag)
      page.br.content = 1

    if(page.pf.content)
      return {'state': 'recall', 'page': page}

    var frame = this.getFreeFrame()
    if(frame != undefined){
      page.pf.content = frame
      page.bv.content = 1
      if(page.rw == 'W')
        page.bs.content = 1
      else
        page.bs.content = 0
      this.busyFrames.push(frame)
      return {'state': 'pageIn', 'page': page}
    }

    var f = new fifo(this.busyFrames.slice(0))
    var backPage = this.findPageByFrame(f.run())

    backPage.bv.content = 0
    if(backPage.useBRFlag)
      backPage.br.content = 0
    backPage.bs.content = 0
    var ff = parseInt(backPage.pf.content)
    var index = this.busyFrames.indexOf(ff)
    this.busyFrames.splice(index, 1)
    backPage.pf.content = ''

    backPage.nextPage = page
    page.pf.content = ff
    page.bv.content = 1
    if(page.rw == 'W')
      page.bs.content = 1
    else
      page.bs.content = 0
    this.busyFrames.push(ff)
    return {'state': 'pageOut', 'page': backPage}
  }

  return MMU
})
