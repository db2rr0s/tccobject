define(['knockout'], function (ko) {
    return {
        algoritmo: ko.observable(['']),
        politicaBusca: ko.observable(['']),
        politicaBuscaFramesPA: ko.observable(2),
        politicaBuscaFramesPB: ko.observable(2),
        politicaBuscaFramesPC: ko.observable(2),
        politicaAlocacao: ko.observable(['']),
        politicaAlocacaoFramesPA: ko.observable(3),
        politicaAlocacaoFramesPB: ko.observable(3),
        politicaAlocacaoFramesPC: ko.observable(3),
        escopoSubstituicao: ko.observable(['']),
        speed: ko.observable(['5']),

        stringReferencia: ko.observable([]),

        getConfig: function () {

            if (!this.validateConfig())
                return undefined;

            return {
                'algoritmo': this.algoritmo()[0],
                'alocacao': this.politicaAlocacao()[0],
                'alocacaoFrameA': this.politicaAlocacaoFramesPA(),
                'alocacaoFrameB': this.politicaAlocacaoFramesPB(),
                'alocacaoFrameC': this.politicaAlocacaoFramesPC(),
                'busca': this.politicaBusca()[0],
                'buscaPageA': this.politicaBuscaFramesPA(),
                'buscaPageB': this.politicaBuscaFramesPB(),
                'buscaPageC': this.politicaBuscaFramesPC(),
                'escopo': this.escopoSubstituicao()[0],
                'stringRef': this.stringReferencia(),
                'speed': parseInt(this.speed()[0])
            }
        },
        validateConfig: function () {
            var algoritmo = this.algoritmo()[0],
                politicaBusca = this.politicaBusca()[0],
                politicaBuscaFramesPA = this.politicaBuscaFramesPA(),
                politicaBuscaFramesPB = this.politicaBuscaFramesPB(),
                politicaBuscaFramesPC = this.politicaBuscaFramesPC(),
                politicaAlocacao = this.politicaAlocacao()[0],
                politicaAlocacaoFramesPA = this.politicaAlocacaoFramesPA(),
                politicaAlocacaoFramesPB = this.politicaAlocacaoFramesPB(),
                politicaAlocacaoFramesPC = this.politicaAlocacaoFramesPC(),
                escopoSubstituicao = this.escopoSubstituicao()[0],
                stringReferencia = this.stringReferencia()


            if (algoritmo === '' || politicaBusca === '' || politicaAlocacao === '' || escopoSubstituicao === '' || stringReferencia.length < 1)
                return false;
            return true;
        },
        addPage: function (self, event) {
          var stref = this.stringReferencia()
          var page = event.target.value
          var rw = $('#rw' + page)
          if(rw.is(':checked'))
            stref.push(page + 'w')
          else
            stref.push(page + 'r')
          this.stringReferencia(stref)
          rw.attr('disabled', true)
        },
        removePage: function(){
          var stref = this.stringReferencia()
          stref.pop()
          this.stringReferencia(stref)
        },
        attached: function(){
          var stref = this.stringReferencia()

          for(var i = 0; i < stref.length; i++){
            var rw = $('#rw' + stref[i][0] + stref[i][1])
            if(stref[i][2] == 'w')
              rw.attr('checked', true)

            rw.attr('disabled', true)
          }

          $('#politicaAlocacaoFrames').css('display', this.politicaAlocacao() == 1 ? 'block' : 'none')
          $('#politicaBuscaFrames').css('display', this.politicaBusca() == 1 ? 'block' : 'none')
        }
      }
})
