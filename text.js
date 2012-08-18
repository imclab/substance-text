(function (w) {

  // Substance
  // =========

  if (!w.Substance || !Substance) { w.Substance = Substance = {}; }


  // Suggested interactions with surface
  // ====================================

  // Update the UI
  // -------------
  //   $('a.toggle-annotation').removeClass('active')
  //   annotations.each(function(annotation) {
  //     $('a.toggle-annotation.'+annotation.type).addClass('active');
  //   });
  // });

  // Hooking into selection events is easy too.
  // el is a container html element sitting below the selection.
  // You can populate it with some contextual UI stuff.
  // 
  // surface.on('selection', function(selection, el) {
  //   $(el).html('<a href="#" class="em">Emphasize</a>');
  // });


  // Text
  // =====

  Substance.Text = function(options) {

    // Helpers
    // -------------

    _.tpl = function(tpl, ctx) {
      source = $("script[name="+tpl+"]").html();
      return _.template(source, ctx);
    };
  
    // small function to poppulate tool links
    function addTools(_type, callback){

      var text
      ,   type;

      if(typeof _type === 'object'){
        text = _type.text || _type.type
        type = _type.type;
      }else{
        text = type = _type;
      }

      $tool = $(_.tpl('tool', {'type':type, 'text':text}));
      $tool.click(callback);
      $toolbar.append($tool);
    }
    
    var $el = $(options.el)
    ,   styles = ['em', 'str']
    ,   $toolbar = $($('script[name=toolbar]').html())
    ,   surface = new Substance.Surface({
                        el: options.el, 
                        content: options.content, 
                        annotations: []
                      });

    $el.wrap('<div class="text" />');
    $text = $('.text');
    $toolbar.insertBefore($el);

    // Regular text attributes
    $.each(styles, function(k, type){
      addTools(type, function(){
        surface.apply(["insert", {"type": type}]);
      });
    });

    // Adding links
    addTools({type:'link', text:'Link'}, function(){
      // optional link attributes
      var attr = {
            "href" : "#",
            "prompt" : "Add a valid URL",
            "placeholer" : "http://google.com"
          };

      surface.apply(["insert", {"type": "link", "attributes": attr}]);
    });

    // Adding comments
    addTools({type:'comment', text:'Add comment'}, function(){
      surface.apply(["insert", {"type": "comment"}]);
    });


    // Events
    // ------
    
    surface.on('surface:active', function(){
      $text.addClass('active');
    });

    surface.on('surface:inactive', function(){
      $text.removeClass('active');
    });

    // Returns all annotations matching that selection
    surface.on('selection:change', function(sel) {
      // var annotation = surface.annotations(sel);
      console.log('selection:change', sel);
    });

    // Listen for changes regarding the annotations
    // --------------------------------------------
    surface.on('annotation:change', function(operation) {
      console.log('annotation:change', operation);
    });

    // Listen for text changes
    // -----------------------
    surface.on('text:change', function(delta, content) {
      console.log(delta);
      console.log('new text =>"' + content+ '"');
    });

  }
})(window);