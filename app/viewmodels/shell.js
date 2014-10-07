define(['plugins/router', 'durandal/app'], function(router, app){
    return {
        router: router,
        activate: function(){
            router.map([
                { route: '', title: 'Play', moduleId: 'viewmodels/index', nav: true },
                { route: 'config', title: 'Configurações', moduleId: 'viewmodels/config', nav: true},
                { route: 'sobre', title: 'Sobre', moduleId: 'viewmodels/sobre', nav: true}
            ]).buildNavigationModel();

            return router.activate();
        }
    }
})