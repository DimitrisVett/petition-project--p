var canvas = $("#canvas");
var hiddenInput = $("#hidden");
(function() {
    canvas.on("mousedown", function(e) {
        var c = canvas[0].getContext("2d");
        var left = e.pageX - canvas.offset().left;
        var top = e.pageY - canvas.offset().top;
        c.strokeStyle = "black";
        c.lineWidth = 3;
        c.moveTo(left, top);
        canvas.on("mousemove", function(e) {
            var left = e.pageX - canvas.offset().left;
            var top = e.pageY - canvas.offset().top;
            c.lineTo(left, top);
            c.stroke();
        });
        canvas.on("mouseup", function() {
            canvas.off("mousemove");
            let url = canvas[0].toDataURL();
            // console.log(url);
            // console.log(hiddenInput);
            hiddenInput.val(url);
            // console.log("inside hiddenInput", hiddenInput.val());
        });
    });
})();
