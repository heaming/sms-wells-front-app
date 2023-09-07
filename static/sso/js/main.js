(function($) {
  var makeClearButton = function(element){
    var elClassName = element.context.className;
    if(!element || elClassName === 'no-clear' || element.next().is('.input_clear_button')){
      element.attr("autocomplete", "off");
      return;
    }
    if(!element.parent().hasClass("has-feedback")){
      element.parent().addClass("has-feedback");
      element.attr("autocomplete", "off");
    }
    element.after($('<span class="input_clear_button"></span>'));
  }

  var removeClearButton = function(element){
    if(!element){
      return;
    }
    element.parent().find(".input_clear_button").remove();
  }

  $(document).ready(function(){
    $.each($("input:text, input:password, " +
        "input[type='email'], input[type='url'], input[type='search'], input[type='tel'], input[type='number']"),
      function(index, element){
      var $element = $(element);
      $element.on('focus',function(){
        makeClearButton($element);
      });
    });

    $(document).on('click', function(event) {
      var $target = $(event.target);

      $("input:text, input:password, " +
        "input[type='email'], input[type='url'], input[type='search'], input[type='tel'], input[type='number']").each(function() {
        var $input = $(this);
        var $nextSpan = $input.next(".input_clear_button");
        if (!$input.is($target) && !$nextSpan.is($target) && !$target.hasClass("input_clear_button")) {
          removeClearButton($input);
          console.log('sdd')
        }
      });
    });

    $(document).on('click', ".input_clear_button", function () {
      var $input = $(this).parent().find("input");
      $input.val("").focus();
    });
  });
})($);