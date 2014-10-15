define(function(require){
  var fifo = require('./fifo')
  var Algoritmo = function(state){
    this.state = state
  }

  Algoritmo.prototype.runFIFO = function(){
    var f = new fifo(this.state.busyFrames.slice(0))
    var i = f.run()
    return i
  }

  return Algoritmo
})
