window.main = {
    taskHandler: null
}

$(function() {
    var taskHandler = new main.taskHandler();

    taskHandler.init();
});