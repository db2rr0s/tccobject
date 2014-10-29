define(function(require){
  var fifo = require('./Fifo')
  var otimo = require('./Otimo')
  var lru = require('./Lru')
  var reloFifoCirc = require('./ReloFifoCirc')
  var Page = require('../Page')

  var Algoritmo = function(state){
    this.state = state
  }

  Algoritmo.prototype.runOtimo = function(){
    var aux = []
    for(var i = 0; i <= 8; i++){
      aux.push(this.state.pfmap[i].toString())
    }

    var aux2 = this.state.callStack().slice(0)
    var f = new otimo(aux, aux2)
    var p = f.run()

    var page = new Page()
    page.parse(p)

    for(var i = 0; i <= 8; i++){
      if(this.state.pfmap[i].equals(page))
        return i;
    }
  }

  Algoritmo.prototype.runFIFO = function(){
    var aux = this.state.busyFrames.slice(0)
    var f = new fifo(aux)
    var i = f.run()
    return i
  }

  Algoritmo.prototype.runLRU = function(){
    var aux = this.state.busyFrames.slice(0)
    var f = new fifo(aux)
    var i = f.run()
    return i
  }

  Algoritmo.prototype.runReloFIFOCirc = function(){
    var aux = this.state.busyFrames.slice(0)
    var f = new fifo(aux)
    var i = f.run()
    return i
  }

  return Algoritmo
})
