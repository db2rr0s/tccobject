﻿define(['durandal/app', 'viewmodels/config', 'viewmodels/algoritmos/algoritmo', 'paper', 'knockout'], function (app, config, algoritmo, paper, ko) {
    return function () {
        this.title = "TCCObject"
        this.frames = []
        this.pagesA = []
        this.pagesB = []
        this.pagesC = []
        this.initialized = false
        this.startstop = undefined
        this.callStack = []
        this.actual = undefined

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
          var frameStartY = 10
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

          this.actual = new paper.PointText({
            point: [1000, 40],
            fontSize: 30,
            fillColor: 'red',
            content: ''
          })

          for(var i = 1, j = frameStartY; i < 10; i++, j = j + 25){
            new paper.PointText({
              point: new paper.Point(frameTextX, j + 20),
              fontSize: 20,
              fillColor: 'black',
              content: i
            })
            var rec = new paper.Path.Rectangle({
              point: new paper.Point(frameStartX, j),
              size: [100, 25],
              strokeColor: "black"
            })

            rec.number = i

            this.frames.push(rec)
          }

          var pageStartX = 300
          var pageCount = 6
//          var pageAStartY = 10
//          var pageBStartY = 150
//          var pageCStartY = 290

          var pageAStartY = 10
          var pageBStartY = 180
          var pageCStartY = 350

          new paper.PointText({
            //point: new paper.Point(280, 80),
            point: new paper.Point(280, 90),
            fontSize: 20,
            fillColor: 'black',
            content: 'A'
          })

          new paper.PointText({
            //point: new paper.Point(280, 220),
            point: new paper.Point(280, 260),
            fontSize: 20,
            fillColor: 'black',
            content: 'B'
          })

          new paper.PointText({
            //point: new paper.Point(280, 360),
            point: new paper.Point(280, 430),
            fontSize: 20,
            fillColor: 'black',
            content: 'C'
          })

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
          var page = new paper.Path.Rectangle({
            point: new paper.Point(pageStartX, j),
            size: [100, 25],
            strokeColor: 'black',
            fillColor: color
          })

          var label = new paper.PointText({
            point: new paper.Point(pageStartX + 40, j + 20),
            fontSize: 20,
            fillColor: 'black',
            content: i
          })

          var label2 = new paper.PointText({
            point: new paper.Point(pageStartX + 80, j + 20),
            fontSize: 8,
            fillColor: 'red',
            content: rw
          })

          new paper.Path.Rectangle({
            point: new paper.Point(pageStartX + 130, j),
            size: [25, 25],
            strokeColor: 'black'
          })

          new paper.PointText({
            point: new paper.Point(pageStartX + 135, j + 20),
            fontSize: 20,
            fillColor: 'black',
            content: i
          })

          new paper.Path.Rectangle({
            point: new paper.Point(pageStartX + 155, j),
            size: [25, 25],
            strokeColor: 'black'
          })

          var fn = new paper.PointText({
            point: new paper.Point(pageStartX + 160, j + 20),
            fontSize: 20,
            fillColor: 'black',
            content: ''
          })

          new paper.Path.Rectangle({
            point: new paper.Point(pageStartX + 180, j),
            size: [25, 25],
            strokeColor: 'black'
          })

          var bv = new paper.PointText({
            point: new paper.Point(pageStartX + 185, j + 20),
            fontSize: 20,
            fillColor: 'black',
            content: ''
          })

          new paper.Path.Rectangle({
            point: new paper.Point(pageStartX + 205, j),
            size: [25, 25],
            strokeColor: 'black'
          })

          var br = new paper.PointText({
            point: new paper.Point(pageStartX + 210, j + 20),
            fontSize: 20,
            fillColor: 'black',
            content: ''
          })

          var group = new paper.Group([page,label,label2])
          group.fn = fn
          group.bv = bv
          group.br = br
          bucket.push(group)
        }

        this.movePageBack = function(page){
          if(page.childInFrame){
            var item = page.childInFrame
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

                var text = new paper.PointText({
                    point: new paper.Point(paper.view.center.x, paper.view.center.y + 100),
                    justification: 'center',
                    fontSize: 20,
                    fillColor: 'red',
                    content: 'CONFIGURAÇÕES INCOMPLETAS'
                })

                return
            }

            var conf = config.getConfig()

            var stref = conf.stringReferencia.split(' ')
            var stref_html = ''
            var rw_p1_map = []
            var rw_p2_map = []
            var rw_p3_map = []

            for(var i = 0; i < stref.length; i++){
              if(stref[i] == '')continue
              var proc = stref[i][0]
              var page = stref[i][1]
              var rw = stref[i][2]
              stref_html += proc + page + ' '
              if(rw == 'w') {
                  if(proc = 'A')
                    rw_p1_map.push(parseInt(page))
                  else if(proc = 'B')
                    rw_p2_map.push(parseInt(page))
                  else if(proc = 'C')
                    rw_p3_map.push(parseInt(page))
              }

              this.callStack.push(proc + page)
            }

            this.callStack.reverse()

            $('#refstring').html(stref_html)

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
          var call = self.callStack.pop()
          if(call === undefined){
            self.startstop.source = 'stop'
            return
          }
          self.actual.content = call
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
          this.movePageBack(this.pagesA[5])
        }
      }
    }
)