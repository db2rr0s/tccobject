define(['knockout'], function (ko) {
    return {
        algoritmo: ko.observable(['1']),
        politicaBusca: ko.observable(['2']),
        politicaAlocacao: ko.observable(['2']),
        politicaAlocacaoFrames: ko.observable(),
        escopoSubstituicao: ko.observable(['1']),

        stringReferencia: ko.observable('A1r'),

        getConfig: function () {

            if (!this.validateConfig())
                return undefined;

            return {
                'algoritmo': this.algoritmo()[0],
                'politicaBusca': this.politicaBusca()[0],
                'politicaAlocacao': this.politicaAlocacao()[0],
                'politicaAlocacaoFrames': this.politicaAlocacaoFrames(),
                'escopoSubstituicao': this.escopoSubstituicao()[0],
                'stringReferencia': this.stringReferencia(),
            }
        },
        validateConfig: function () {
            var algoritmo = this.algoritmo()[0],
                politicaBusca = this.politicaBusca()[0],
                politicaAlocacao = this.politicaAlocacao()[0],
                escopoSubstituicao = this.escopoSubstituicao()[0],
                stringReferencia = this.stringReferencia()

            if (algoritmo === '' || politicaBusca === '' || politicaAlocacao === '' || escopoSubstituicao === '' || stringReferencia === '')
                return false;
            return true;
        },
        addPage: function (self, event) {
          var stref = this.stringReferencia()
          var page = event.target.value
          var rw = $('#rw' + page)
          if(rw.is(':checked')){
            this.stringReferencia(stref + page + 'w' + ' ')
          } else {
            this.stringReferencia(stref + page + 'r' + ' ')
          }
          rw.attr('disabled', true)
        },
        removePage: function(){
          var stref = this.stringReferencia()
          this.stringReferencia(stref.slice(0,-4))
        },
        attached: function(){
          var stref = this.stringReferencia()

          if(stref != ''){
            stref = stref.split(' ')
            for(var i = 0; i < stref.length; i++){
              if(stref[i] == '') continue

              var rw = $('#rw' + stref[i][0] + stref[i][1])
              if(stref[i][2] == 'w')
                rw.attr('checked', true)

              rw.attr('disabled', true)
            }
          }
        }
    }
})
