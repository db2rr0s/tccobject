define(function(require){
  var Page = function(proc, number, rw, br){
    this.proc = proc
    this.number = number
    this.rw = rw
    this.useBRFlag = (br || false)

    this.object = undefined
    this.pf = undefined
    this.bv = undefined
    this.bs = undefined
    this.br = undefined
  }

  Page.prototype.parse = function(str){
    this.proc = str[0]
    this.number = parseInt(str[1])
    this.rw = str[2].toUpperCase()
    return this
  }

  Page.prototype.toString = function(){
    return this.proc + this.number + this.rw.toLowerCase()
  }

  Page.prototype.equals = function(page){
    return this.proc == page.proc &&
           this.number == page.number &&
           this.rw.toLowerCase() == page.rw.toLowerCase()
  }

  return Page
})
