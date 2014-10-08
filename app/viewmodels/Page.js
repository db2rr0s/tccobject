define(function(require){
  var Page = function(proc, number, rw){
    this.proc = proc
    this.number = number
    this.rw = rw
    this.object = undefined
  }

  Page.prototype.parse = function(str){
    this.proc = str[0]
    this.number = parseInt(str[1])
    this.rw = str[2].toUpperCase()
    return this
  }

  Page.prototype.setObject = function(obj){
    this.object = obj
  }

  Page.prototype.equals = function(page){
    return this.proc == page.proc &&
           this.number == page.number &&
           this.rw.toLowerCase() == page.rw.toLowerCase()
  }

  return Page
})
