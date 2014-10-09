define(['durandal/app', 'knockout', 'paper', 'viewmodels/config', 'viewmodels/Manager', 'viewmodels/Page'], function (app, ko, paper, config, Manager, Page) {
    return function () {
        this.title = "TCCObject"
        this.frames = []
        this.pages = []
        this.initialized = false
        this.marker_left = undefined
        this.marker_right = undefined
        this.callStack = ko.observable([])
        this.READ = 'R'
        this.WRITE = 'W'
        this.configuration = undefined

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
          var frameStartY = 40
          var frameTextX = 60
          var frameStartX = 75

          this.setMarkerSource('stop')

          this.addText(75, 30, 'Frames')
          this.addText(300,25, 'Processos')
          this.addText(425, 25, 'Tabela de Páginas')

          this.addText(435, 37, 'NP', 11)
          this.addText(460, 37, 'NF', 11)
          this.addText(485, 37, 'BV', 11)
          this.addText(510, 37, 'BS', 11)
          this.addText(535, 37, 'BR', 11)

          for(var i = 1, j = frameStartY; i < 10; i++, j = j + 25){
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
          if(this.configuration.algoritmo == 1){
            useBRFlag = true
          }
          for(var i = 1, j = pageAStartY; i <= pageCount; i++, j = j + 25){
            var rw = this.READ
            if(rw_p1_map.indexOf(i) >= 0)
              rw = this.WRITE

            var page = new Page('A', i, rw, useBRFlag)
            this.drawPage(page, pageStartX, j, '#99FF99')
          }

          for(var i = 1, j = pageBStartY; i <= pageCount; i++, j = j + 25){
            var rw = this.READ
            if(rw_p2_map.indexOf(i) >= 0)
              rw = this.WRITE

            var page = new Page('B', i, rw, useBRFlag)
            this.drawPage(page, pageStartX, j, '#85D6FF')
          }

          for(var i = 1, j = pageCStartY; i <= pageCount; i++, j = j + 25){
            var rw = this.READ
            if(rw_p3_map.indexOf(i) >= 0)
              rw = this.WRITE

            var page = new Page('C', i, rw, useBRFlag)
            this.drawPage(page, pageStartX, j, '#FFFFCC')
          }

          paper.view.draw()
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
          var fn = this.addText(x + 160, y + 20, '')

          this.addRect(x + 180, y, 25, 25)
          var bv = this.addText(x + 185, y + 20, '')

          this.addRect(x + 205, y, 25, 25)
          var bs = this.addText(x + 210, y + 20, '')

          if(page.useBRFlag)
            this.addRect(x + 230, y, 25, 25)
          else
            this.addRect(x + 230, y, 25, 25, undefined, 0.3)
          var br = this.addText(x + 240, y + 20, '')

          var group = new paper.Group([pageRect,label,label2])
          group.fn = fn
          group.bv = bv
          group.bs = bs
          group.br = br
          page.setObject(group)
          this.pages.push(page)
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

        this.movePageBack = function(page, callback){
          if(page.object.childInFrame){
            var item = page.object.childInFrame
            item.bringToFront()
            var dest = page.object.position
            page.object.bv.content = ''
            if(page.useBRFlag)
              page.object.br.content = ''
            page.object.fn.content = ''
            item.onFrame = function(event){
              var orig = item.position
              var vector = new paper.Point(dest.x - orig.x, dest.y - orig.y)
              item.position = new paper.Point(orig.x + vector.x/(vector.length/2), orig.y + vector.y/(vector.length/2))
              if(vector.length <= 2){
                item.onFrame = undefined
                page.object.opacity = 1
                page.object.childInFrame = undefined
                item.opacity = 0
                if(callback)
                  callback()
              }
            }
          } else if(callback)
            callback()
        }

        this.movePageToFrame = function(context, page, frameNumber, callback){
          if(!page.object.childInFrame){
            var frame = context.frames[frameNumber - 1]
            var dest = frame.position
            var item = page.object.clone()
            item.bringToFront()
            page.object.opacity = 0.3
            page.object.childInFrame = item
            page.object.bv.content = 'X'
            if(page.useBRFlag)
              page.object.br.content = 'X'
            page.object.fn.content = frame.number
            if(page.rw == context.WRITE)
              page.object.bs.content = 'X'
            else
              page.object.bs.content = ''
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
          } else if(callback)
            callback()
        }

        this.discardPage = function(page){
          if(page.childInFrame){
            var item = page.childInFrame
            item.bringToFront()
            page.bv.content = ''
            page.br.content = ''
            page.fn.content = ''
            page.opacity = 1
            page.childInFrame = undefined
            item.onFrame = undefined
            item.opacity = 0
          }
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

        this.attached = function(){
          if (!config.validateConfig()) {
                this.initialize()
                this.setMarkerSource('end')

                var raster = new paper.Raster('noconf')
                raster.position = paper.view.center

                raster.onFrame = function (event) {
                    raster.rotate(1)
                }

                new paper.PointText({
                  point: new paper.Point(paper.view.center.x, paper.view.center.y + 100),
                  justification: 'center',
                  fontSize: 20,
                  fillColor: 'red',
                  content: 'CONFIGURAÇÕES INCOMPLETAS'
                })

                return
            }

            this.configuration = config.getConfig()
            var stref = this.configuration.stringReferencia.slice(0)

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
        }

        this.start = function () {
          if(!config.validateConfig()){
            app.showMessage("As configurações estão erradas ou incompletas!")
            return
          }

          this.setMarkerSource('start')
          var manager = new Manager(this, this.frames.length, this.movePageToFrame, this.movePageBack)
          manager.start()
        }

        this.findPage = function(page){
          for(var i = 0; i < this.pages.length; i++){
            var aux = this.pages[i]
            if(page.equals(aux))
              return aux
          }
        }

        this.nextPage = function(self){

          var _callStack = this.callStack()
          var call = _callStack.pop()
          this.callStack(_callStack)

          if(call === undefined){
            this.setMarkerSource('end')
            return
          }

          var page = new Page()
          page.parse(call)

          return this.findPage(page)
        }

        this.stepByStep = function(){
          this.discardPage(this.pagesA[0])
        }
      }
    }
)
