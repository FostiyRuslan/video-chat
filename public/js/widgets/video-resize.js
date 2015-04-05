var ResizeVideoWidget = function (selectors) {
    var video = document.getElementById(selectors.selector);

    /* Resize to big size */
    document.getElementById(selectors.big).addEventListener("click", function()
    {
        video.width = 640;
        video.height = 480;
    }, false);

    /* Resize to middle size */
    document.getElementById(selectors.middle).addEventListener("click", function()
    {
        video.width = 320;
        video.height = 240;
    }, false);

    /* Resize to small size */
    document.getElementById(selectors.small).addEventListener("click", function()
    {
        video.width = 150;
        video.height = 150;
    }, false);

};
