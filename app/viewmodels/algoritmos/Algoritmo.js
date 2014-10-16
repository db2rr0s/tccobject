define(function(require){
  var fifo = require('./Fifo')
  var Algoritmo = function(state){
    this.state = state
  }

  Algoritmo.prototype.runFIFO = function(){
    var aux = this.state.busyFrames.slice(0)
    var f = new fifo(aux)
    var i = f.run()    
    return i
  }

  return Algoritmo
})
