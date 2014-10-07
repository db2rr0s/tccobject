define(['viewmodels/algoritmos/fifo', 'viewmodels/algoritmos/lru'], function (fifo, lru) {
    return {
        runFIFO: function (args) { fifo.run(args) },
        runLRU: function (args) { lru.run() }
    }
})