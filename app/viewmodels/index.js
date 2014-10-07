define(['durandal/app', 'viewmodels/config', 'viewmodels/algoritmos/algoritmo', 'paper', 'knockout'], function (app, config, algoritmo, paper, ko) {
    return function () {
        this.title = "TCCObject"
        this.frames = []
        this.pagesA = []
        this.pagesB = []
        this.pagesC = []
        this.initialized = false
        this.startstop = undefined
        this.callStack = ko.observable(['P0'])

        this.initialize = function(){
          if(!this.initialized){
            var canvas = document.getElementById('simulador')
            paper.setup(canvas)
            this.initialized = true
          }

          paper.project.clear()
        }

        this.attached = function(){
          this.initialize()
        }

        this.load = function(rw_p1_map, rw_p2_map, rw_p3_map){
          this.initialize()
          var frameStartY = 30
          var frameTextX = 40
          var frameStartX = 55

          this.startstop = new paper.Raster('stop', [1100,40])

          var self = this
          var dateNow = new Date()
          this.startstop.onFrame = function(event){
            var dateNew = new Date()
            if((dateNew - dateNow) >= 1000){
              dateNow = dateNew
              self.startstop.visible = !self.startstop.visible
            }
          }

          this.addText(53, 25, 'Frames')
          this.addText(300, 25, 'Processos')
          this.addText(425, 25, 'Tabelas')

          for(var i = 1, j = frameStartY; i < 10; i++, j = j + 25){
            this.addText(frameTextX, j + 20, i)
            var rec = this.addRect(frameStartX, j, 100, 25)
            rec.number = i
            this.frames.push(rec)
          }

          var pageStartX = 300
          var pageCount = 5

          var pageAStartY = 30
          var pageBStartY = 170
          var pageCStartY = 310

          this.addText(280, 100, 'A')
          this.addText(280, 240, 'B')
          this.addText(280, 380, 'C')

          for(var i = 1, j = pageAStartY; i <= pageCount; i++, j = j + 25){
            var rw = 'R'
            if(rw_p1_map.indexOf(i) >= 0)
              rw = 'W'
            this.drawPage(pageStartX, j, i, '#99FF99', rw, this.pagesA)
          }

          for(var i = 1, j = pageBStartY; i <= pageCount; i++, j = j + 25){
            var rw = 'R'
            if(rw_p1_map.indexOf(i) >= 0)
              rw = 'W'
            this.drawPage(pageStartX, j, i, '#85D6FF', rw, this.pagesB)
          }

          for(var i = 1, j = pageCStartY; i <= pageCount; i++, j = j + 25){
            var rw = 'R'
            if(rw_p1_map.indexOf(i) >= 0)
              rw = 'W'
            this.drawPage(pageStartX, j, i, '#FFFFCC', rw, this.pagesC)
          }

          paper.view.draw()
        }

        this.drawPage = function(pageStartX, j, i, color, rw, bucket){
          var page = this.addRect(pageStartX, j, 100, 25, color)

          var label = this.addText(pageStartX + 40, j + 20, i)
          var label2 = new paper.PointText({
            point: [pageStartX + 80, j + 20],
            fontSize: 8,
            fillColor: 'red',
            content: rw
          })

          this.addRect(pageStartX + 130, j, 25, 25)
          this.addText(pageStartX + 135, j + 20, i)

          this.addRect(pageStartX + 155, j, 25, 25)

          var fn = this.addText(pageStartX + 160, j + 20, '')

          this.addRect(pageStartX + 180, j, 25, 25)

          var bv = this.addText(pageStartX + 185, j + 20, '')

          this.addRect(pageStartX + 205, j, 25, 25)

          var br = this.addText(pageStartX + 210, j + 20, '')

          var group = new paper.Group([page,label,label2])
          group.fn = fn
          group.bv = bv
          group.br = br
          bucket.push(group)
        }

        this.addText = function(x, y, content){
            var text = new paper.PointText({
              point: [x, y],
              fontSize: 18,
              fillColor: 'black',
              content: content
            })

            return text
        }

        this.addRect = function(x, y, w, h, c){
          var rect = new paper.Path.Rectangle({
            point: new paper.Point(x, y),
            size: [w, h],
            strokeColor: 'black',
            fillColor: c
          })

          return rect
        }

        this.movePageBack = function(page){
          if(page.childInFrame){
            var item = page.childInFrame
            item.bringToFront()
            var dest = page.position
            page.bv.content = ''
            page.br.content = ''
            page.fn.content = ''
            item.onFrame = function(event){
              var orig = item.position
              var vector = new paper.Point(dest.x - orig.x, dest.y - orig.y)
              item.position = new paper.Point(orig.x + vector.x/(vector.length/2), orig.y + vector.y/(vector.length/2))
              if(vector.length <= 2){
                item.onFrame = undefined
                page.opacity = 1
                page.childInFrame = undefined
                item.opacity = 0
              }
            }
          }
        }

        this.movePageToFrame = function(page, frame, callback){
          if(!page.childInFrame){
            var dest = frame.position
            var item = page.clone()
            item.bringToFront()
            page.opacity = 0.3
            page.childInFrame = item
            page.bv.content = 'X'
            page.br.content = 'X'
            page.fn.content = frame.number
            item.onFrame = function(event){
              var orig = item.position
              var vector = new paper.Point(dest.x - orig.x, dest.y - orig.y)
              item.position = new paper.Point(orig.x + vector.x/(vector.length/2), orig.y + vector.y/(vector.length/2))
              if(vector.length <= 3){
                item.onFrame = undefined
                item.position = dest
                if(callback)
                  callback()
              }
            }
          }
        }

        this.attached = function(){
          if (!config.validateConfig()) {
                this.initialize()
                var raster = new paper.Raster('noconf')
                raster.position = paper.view.center

                raster.onFrame = function (event) {
                    raster.rotate(1)
                }

                this.addText(paper.view.center.x, paper.view.center.y + 100, 'CONFIGURAÇÕES INCOMPLETAS')

                return
            }

            var conf = config.getConfig()

            var stref = conf.stringReferencia

            var rw_p1_map = []
            var rw_p2_map = []
            var rw_p3_map = []

            for(var i = 0; i < stref.length; i++){
              var proc = stref[i][0]
              var page = stref[i][1]
              var rw = stref[i][2]

              if(rw == 'w') {
                  if(proc = 'A')
                    rw_p1_map.push(parseInt(page))
                  else if(proc = 'B')
                    rw_p2_map.push(parseInt(page))
                  else if(proc = 'C')
                    rw_p3_map.push(parseInt(page))
              }
            }

            stref.reverse()
            this.callStack(stref)

            this.load(rw_p1_map, rw_p2_map, rw_p3_map)
        }

        this.start = function () {

          if(!config.validateConfig()){
            app.showMessage("As configurações estão erradas ou incompletas!")
            return
          }

          this.startstop.source = 'start'
          this.auto(this)
        }

        this.autoClosure = function(self){
          var self = self
          return function(){
            self.auto(self)
          }
        }

        this.auto = function(self){
          var _callStack = self.callStack()
          var call = _callStack.pop()
          self.callStack(_callStack)
          if(call === undefined){
            self.startstop.source = 'stop'
            return
          }

          var index = parseInt(call[1]) - 1
          switch(call[0]){
            case 'A':
              self.movePageToFrame(self.pagesA[index], self.frames[1], self.autoClosure(self))
            break
            case 'B':
              self.movePageToFrame(self.pagesB[index], self.frames[1], self.autoClosure(self))
            break
            case 'C':
              self.movePageToFrame(self.pagesC[index], self.frames[1], self.autoClosure(self))
          }
        }

        this.stepByStep = function(){
          this.movePageBack(this.pagesA[0])
        }
      }
    }
)
