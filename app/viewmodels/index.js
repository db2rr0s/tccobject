define(['durandal/app', 'knockout', 'paper', 'viewmodels/config', 'viewmodels/MMU', 'viewmodels/Page'], function (app, ko, paper, config, MMU, Page) {
    return function () {
        this.title = "TCCObject"
        this.callStack = ko.observable([])
        this.READ = 'R'
        this.WRITE = 'W'
        this.initialized = false
        this.marker_left = undefined
        this.marker_right = undefined
        this.speed = undefined
        this.waitTime = 1
        this.waitCallback = undefined

        this.frames = []
        this.mmu = undefined
        this.configuration = undefined
        this.stateCallback = undefined

        this.initialize = function(){
          if(!this.initialized){
            var canvas = document.getElementById('simulador')
            paper.setup(canvas)
            this.initialized = true
          }

          paper.project.clear()
        }

        this.load = function(rw_p1_map, rw_p2_map, rw_p3_map){
          this.initialize()

          this.stateCallback = { 'recall': this.recallStateCallback,
                                 'pageIn': this.pageInStateCallback,
                                 'pageOut': this.pageOutStateCallback }
          var frameStartY = 40
          var frameTextX = 60
          var frameStartX = 75

          this.setMarkerSource('stop')

          this.addText(75, 30, 'Frames')
          this.addText(300,25, 'Processos')
          this.addText(425, 25, 'Tabela de Páginas')

          this.addText(435, 37, 'PL', 11)
          this.addText(460, 37, 'PF', 11)
          this.addText(485, 37, 'BV', 11)
          this.addText(510, 37, 'BS', 11)
          this.addText(535, 37, 'BR', 11)

          for(var i = 0, j = frameStartY; i < 9; i++, j = j + 25){
            this.addText(frameTextX, j + 20, i)
            var rec = this.addRect(frameStartX, j, 100, 25)
            rec.number = i
            this.frames.push(rec)
          }

          var pageStartX = 300
          var pageCount = 5

          var pageAStartY = 40
          var pageBStartY = 180
          var pageCStartY = 320

          this.addText(280, 100, 'A')
          this.addText(280, 240, 'B')
          this.addText(280, 380, 'C')

          var useBRFlag = false
          if(this.configuration.algoritmo == 4){
            useBRFlag = true
          }

          var pagesA = [],
              pagesB = [],
              pagesC = []
          for(var i = 0, j = pageAStartY; i < pageCount; i++, j = j + 25){
            var rw = this.READ
            if(rw_p1_map.indexOf(i) >= 0)
              rw = this.WRITE

            var page = new Page('A', i, rw, useBRFlag)
            this.drawPage(page, pageStartX, j, '#99FF99')
            pagesA.push(page)
          }

          for(var i = 0, j = pageBStartY; i < pageCount; i++, j = j + 25){
            var rw = this.READ
            if(rw_p2_map.indexOf(i) >= 0)
              rw = this.WRITE

            var page = new Page('B', i, rw, useBRFlag)
            this.drawPage(page, pageStartX, j, '#85D6FF')
            pagesB.push(page)
          }

          for(var i = 0, j = pageCStartY; i < pageCount; i++, j = j + 25){
            var rw = this.READ
            if(rw_p3_map.indexOf(i) >= 0)
              rw = this.WRITE

            var page = new Page('C', i, rw, useBRFlag)
            this.drawPage(page, pageStartX, j, '#FFFFCC')
            pagesC.push(page)
          }

          try{
            this.mmu = new MMU(this.configuration.algoritmo, this.configuration.alocacao,
                               this.configuration.alocacaoFrameA, this.configuration.alocacaoFrameB, this.configuration.alocacaoFrameC,
                               this.configuration.busca,
                               this.configuration.buscaPageA, this.configuration.buscaPageB, this.configuration.buscaPageC, this.configuration.escopo,
                               pagesA, pagesB, pagesC, this.callStack)
          } catch(err){
            this.error()
            app.showMessage(err)
            return false
          }

          paper.view.draw()
          return true
        }

        this.drawPage = function(page, x, y, color){
          var pageRect = this.addRect(x, y, 100, 25, color)

          var label = this.addText(x + 40, y + 20, page.number)
          var label2 = new paper.PointText({
            point: [x + 80, y + 20],
            fontSize: 8,
            fillColor: 'red',
            content: page.rw
          })

          this.addRect(x + 130, y, 25, 25)
          this.addText(x + 135, y + 20, page.number)

          this.addRect(x + 155, y, 25, 25)
          var pf = this.addText(x + 160, y + 20, '')

          this.addRect(x + 180, y, 25, 25)
          var bv = this.addText(x + 185, y + 20, '0')

          this.addRect(x + 205, y, 25, 25)
          var bs = this.addText(x + 210, y + 20, '0')

          if(page.useBRFlag){
            this.addRect(x + 230, y, 25, 25)
            var br = this.addText(x + 240, y + 20, '0')
          } else {
            this.addRect(x + 230, y, 25, 25, undefined, 0.3)
            var br = new paper.PointText({
              point: [x + 240, y + 20],
              fontSize: 18,
              fillColor: 'black',
              content: '0',
              opacity:  0.3
            })
          }

          var group = new paper.Group([pageRect,label,label2])
          page.pf = pf
          page.bv = bv
          page.bs = bs
          page.br = br
          page.object = group
        }

        this.addText = function(x, y, content, fontSize){
            var text = new paper.PointText({
              point: [x, y],
              fontSize: fontSize || 18,
              fillColor: 'black',
              content: content
            })

            return text
        }

        this.addRect = function(x, y, w, h, c, o){
          var rect = new paper.Path.Rectangle({
            point: new paper.Point(x, y),
            size: [w, h],
            strokeColor: 'black',
            fillColor: c,
            opacity: o || 1
          })

          return rect
        }

        this.setMarkerSource = function(source){
          var ml = source + '_left'
          var mr = source + '_right'

          if(this.marker_left === undefined)
            this.marker_left = new paper.Raster(ml, [15,25])
          else if(this.marker_left.source != ml)
            this.marker_left.source = ml

          if(this.marker_right === undefined)
            this.marker_right = new paper.Raster(mr, [1125,25])
          else if(this.marker_right.source != mr)
            this.marker_right.source = mr
        }

        this.error = function(){
          this.initialize()
          this.setMarkerSource('end')

          var raster = new paper.Raster('noconf')
          raster.position = paper.view.center

          raster.onFrame = function(event){
            raster.rotate(0.4)
          }

          new paper.PointText({
            point: new paper.Point(paper.view.center.x, paper.view.center.y + 100),
            justification: 'center',
            fontSize: 20,
            fillColor: 'red',
            content: 'CONFIGURAÇÕES INCOMPLETAS'
          })
        }

        this.attached = function(){
          if (!config.validateConfig()) {
            this.error()
            return
          }

          this.configuration = config.getConfig()
          this.speed = this.configuration.speed
          var stref = this.configuration.stringRef.slice(0)

          var rw_p1_map = []
          var rw_p2_map = []
          var rw_p3_map = []

          for(var i = 0; i < stref.length; i++){
            var proc = stref[i][0]
            var page = stref[i][1]
            var rw = stref[i][2]

            if(rw == 'w') {
                if(proc == 'A')
                  rw_p1_map.push(parseInt(page))
                else if(proc == 'B')
                  rw_p2_map.push(parseInt(page))
                else if(proc == 'C')
                  rw_p3_map.push(parseInt(page))
            }
          }

          stref.reverse()
          this.callStack(stref)
          this.load(rw_p1_map, rw_p2_map, rw_p3_map)

          paper.view.onFrame = this.onFrame
        }

        this.start = function () {
          if(!config.validateConfig()){
            app.showMessage("As configurações estão erradas ou incompletas!")
            return
          }

          if(this.waitCallback){
            clearTimeout(this.waitCallback)
            this.waitCallback = undefined
          }

          this.setMarkerSource('start')
          this.pause = false
          this.active = true
        }

        this.stepByStep = function(){
          if(!config.validateConfig()){
            app.showMessage("As configurações estão erradas ou incompletas!")
            return
          }

          if(this.waitCallback){
            clearTimeout(this.waitCallback)
            this.waitCallback = undefined
          }

          this.setMarkerSource('start')
          this.pause = true
          this.active = true
        }

        this.active = false
        this.running = false
        this.item = undefined
        this.dest = undefined
        this.hasFreeFrames = true
        this.moveOn = false
        this.moveBack = false
        this.pause = false
        var self = this

        this.onFrame = function(event){
          if(self.active){
            if(self.running){
              if(self.moveOn){
                var orig = self.item.position
                var vector = new paper.Point(self.dest.x - orig.x, self.dest.y - orig.y)
                self.item.position = new paper.Point(orig.x + vector.x/(vector.length/self.speed), orig.y + vector.y/(vector.length/self.speed))
                if(vector.length <= self.speed){
                  self.item.position = self.dest
                  self.dest = undefined
                  self.item = undefined
                  self.running = false
                  self.moveOn = false
                  if(self.pause){
                    self.setMarkerSource('begin')
                    self.active = false
                  }
                }
              } else if(self.moveBack) {
                var orig = self.item.position
                var vector = new paper.Point(self.dest.x - orig.x, self.dest.y - orig.y)
                self.item.position = new paper.Point(orig.x + vector.x/(vector.length/self.speed), orig.y + vector.y/(vector.length/self.speed))
                if(vector.length <= self.speed || self.item.page.rw == self.READ){
                  self.item.page.object.opacity = 1
                  self.item.page.object.childInFrame = undefined
                  self.item.opacity = 0
                  self.dest = undefined
                  self.running = false
                  self.moveBack = false
                  self.pageInStateCallback(self.item.page.nextPage)
                }
              }
            } else {
              if(!self.mmu.ready) {
                var page = self.mmu.startPage()
                if(page != undefined)
                  self.pageInStateCallback(page)
                return
              }

              var _callStack = self.callStack()
              var call = _callStack.pop()
              self.callStack(_callStack)

              if(call === undefined){
                self.setMarkerSource('end')
                self.active = false
                return
              }

              var state = self.mmu.nextCall(call)
              self.stateCallback[state['state']](state['page'])
            }
          }
        }

        this.recallStateCallback = function(page){
          if(self.pause){
            self.setMarkerSource('begin')
            self.active = false
          }
          self.active = false
          self.waitCallback = setTimeout(function(){
            self.waitCallback = undefined
            if(self.pause){
              self.setMarkerSource('begin')
              self.active = false
            } else {
              self.active = true
            }
          }, self.waitTime * 1000)
          return
        }

        this.pageOutStateCallback = function(page){
          var item = page.object.childInFrame
          item.bringToFront()
          var dest = page.object.position
          item.page = page
          self.item = item
          self.dest = dest
          self.running = true
          self.moveBack = true
        }

        this.pageInStateCallback = function(page){
          var frame = self.frames[page.pf.content]
          var dest = frame.position
          var item = page.object.clone()
          item.bringToFront()
          page.object.opacity = 0.3
          page.object.childInFrame = item
          self.item = item
          self.dest = dest
          self.running = true
          self.moveOn = true
        }
      }
    }
)
