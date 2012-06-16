//     (c) 2012 Victor Saiz, Michael Aufreiter
//     Proper is freely distributable under the MIT license.
//     For all details and documentation:
//     http://github.com/substance/proper

// Goals:
//
// * Annotations (strong, em, code, link) are exclusive. No text can be both
//   emphasized and strong.
// * The output is plain.
// * Cross-browser compatibility: Support the most recent versions of Chrome,
//   Safari, Firefox and Internet Explorer. Proper should behave the same on
//   all these platforms (if possible).

(function(){

  // Proper
  // ------

  this.Proper = function(options){

    var range
      , annotationList = []
      , events = _.extend({}, _.Events),
      tools = 
      '<div id="tooltip" class="proper-commands"> \
        <a href="#em" title="Emphasis (CTRL+SHIFT+E)" class="command em" command="em"><div>Emphasis</div></a> \
        <a href="#strong" title="Strong (CTRL+SHIFT+S)" class="command strong" command="strong"><div>Strong</div></a>\
      </div>';

    // Init codeMirror
    var cm = CodeMirror.fromTextArea($(options.el)[0], options);

    // Override options
    cm.setOption('lineWrapping', true);
    
    // CodeMirror events
    cm.setOption('onCursorActivity', function(cm){
      // Make sure we at least have 1 character selected
      if(cm.getSelection().length !== 0){
        // Set the selection range
        var from = cm.getCursor(true)
        ,   to = cm.getCursor(false)
        , str = cm.getSelection();

        range = {'from':from, 'to':to, 'str': str};

        // When we have at least one character we show the tools
        if(cm.getSelection().length < 2){
          var node = $(tools)[0];
          cm.addWidget(cm.getCursor(false), node, true);
        }

        findMatching();
      }else{
        // no chars selected we remove the tools
        removeTools();
      }
    });

    cm.setOption('onFocus', function(e){
      $(cm.getWrapperElement()).addClass('active');
    });
    
    cm.setOption('onBlur', function(e){
      $(cm.getWrapperElement()).removeClass('active');
      // removeTools();
    });

    function removeTools(){
      // There's a strange bug where it won't be removed
      // when no characters are selected
      $('#tooltip').remove();
      $('#tooltip').remove();
    }

    // Resets the cursor selection to the actual range
    function restetCursor(range){
      // Reselect trimmed range and string value
      cm.setSelection(range.from, range.to);
    }

    // Unselects left or right blank characters
    function trim(sel){
      var first = sel.str.charCodeAt(0);
      var last = sel.str.charCodeAt(sel.str.length-1);
      // Check if first character is blank and adjusts the annotation range if it is
      if(first === 32){
        sel.from.ch = sel.from.ch + 1;
      }

      // Check if last character is blank and adjusts the annotation range if it is
      if(last === 32){
        sel.to.ch = sel.to.ch - 1;
      }

      // Get selection string
      sel.str = cm.getRange(sel.from, sel.to);
      return sel;
    }

    // Turns position line objects into a single value representing the offset from character 0
    function toOffset(pos){
      var offset = 0;
      if(pos.line > 0){
        var i = 0;
        for(; i < pos.line; i++ ){
          offset += cm.lineInfo(i).text.length + 1;//count the newline character as 1?
        }
      }
      return pos.ch + offset;
    }
    
    // Returns the current selection
    function selection(){
      range = trim(range);
      var start = toOffset(range.from);
      var end = toOffset(range.to);
      return {'start': start, 'end': end};
    }

    // Adds annotation (uses the current selection)
    function annotate(note){

      if(cm.getSelection().length > 0){
        note.pos = selection();
        //autogenerated id based on the type and the ofsset position string
        note.id = note.type + '/' + note.pos.start + '' + note.pos.end;
        restetCursor(range);

        // Fast marking techinque
        $('#' + note.type).addClass('selected');
        annotationList.push(note);
      }
    }

    // Finds matching annotations for the selected range
    function findMatching(){
      var start = toOffset(range.from);
      var end = toOffset(range.to);
      var id = 'comment/' + start + '' + end;
      var found = _.find(annotationList, function(ann){ return ann.id == id; });

      if(typeof found !== 'undefined'){
        // Fast marking techinque
        $('#' + found.type).addClass('selected');
      }else{
        $('.command').removeClass('selected');
      }
    }

    // Expose public API
    // -----------------
    
    return {
      annotations: function(){ return annotationList;},

      selection: selection,
      annotate: annotate,
    };
  };
})();