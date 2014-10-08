define(function(require){
  var Page = function(){
    this.process = undefined
    this.page = undefined
    this.readOrWrite = undefined
  }

  Page.prototype.parse = function(str){
    this.process = str[0]
    this.page = parseInt(str[1])
    this.readOrWrite = str[2]
    return this
  }

  return Page
})
