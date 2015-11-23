(function($) {
  'use strict';

  var buildNewClass = function buildNewClass(current_grid_cell) {
    var newClass = 'pt2-section pt2-expandable-by-col-'+current_grid_cell.expandable_by_column+
      ' pt2-expandable-by-ctrl-'+current_grid_cell.expandable_by_ctrl;
    for(var i = 0; i < current_grid_cell.collapsible_by_columns.length; i++) {
      newClass += ' pt2-collapsible-by-col-'+current_grid_cell.collapsible_by_columns[i];
    }
    for(var i = 0; i < current_grid_cell.collapsible_by_ctrls.length; i++) {
      newClass += ' pt2-collapsible-by-ctrl-'+current_grid_cell.collapsible_by_ctrls[i];
    }

    return newClass;
  };

  function polytables2(obj) {
    this.target = obj.target;
    this.config = {};
    if (obj.collapsible) {
      this.config.collapsible = {
        columns: obj.collapsible.columns.sort(function(a, b){return a-b})
      };
      this.cols = this.config.collapsible.columns;
      this.final_col = this.cols[this.cols.length-1]+1;
    }
  }

  polytables2.prototype = {
    initTable: function() {
      var thisClass = this;
      // set up collapsible
      if(thisClass.config.collapsible) {
        var grid = [];
        var col_count = 0;
        var ctrl_count = 0;
        var rows = thisClass.target.find('tbody tr');
        // for all columns we care about
        for(var i = thisClass.cols[0]; i <= thisClass.final_col; i++) {
          // caching grid for updates
          if(!grid[col_count]) {
            grid[col_count] = [];
          }
          // create this for caching purposes
          grid[col_count+1] = [];
          var row_count = 0;
          rows.each(function() {
            var row = $(this);
            row.find('td:eq('+col_count+')').each(function() {
              var cell = $(this);
              var current_grid_cell = grid[col_count][row_count];
              // caching grid for updates
              if(!grid[col_count+1][row_count]) {
                grid[col_count+1][row_count] = null;
              }

              // this happens if the current cell is not a section
              if(!current_grid_cell) {
                grid[col_count][row_count] = current_grid_cell = {
                  expandable_by_column: null,
                  expandable_by_ctrl: null,
                  collapsible_by_columns: [],
                  collapsible_by_ctrls: []
                };
              }
              // here it is a section - or a continuation
              else {
                if (cell.html()) {
                  row.addClass(buildNewClass(current_grid_cell))
                }
                // we just need to continue so the right row gets the classes
                if(row_count < rows.length-1 && !grid[col_count-1][row_count+1].is_controller) {
                  var new_grid_cell = {
                    expandable_by_column: current_grid_cell.expandable_by_column,
                    expandable_by_ctrl: current_grid_cell.expandable_by_ctrl,
                    collapsible_by_columns: current_grid_cell.collapsible_by_columns,
                    collapsible_by_ctrls: current_grid_cell.collapsible_by_ctrls
                  };
                  grid[col_count][row_count+1] = new_grid_cell;
                }
              }
              // if cell is not empty
              if (cell.html()) {
                // if cell is in an expandable column
                if (thisClass.cols.indexOf(col_count) >= 0) {
                  grid[col_count][row_count].is_controller = true;
                  // add the section ctrl with col class
                  cell.addClass('pt2-clickable pt2-section-ctrl-'+ctrl_count);
                  var cloned_collapsible_by_columns = current_grid_cell.collapsible_by_columns.slice(0);
                  cloned_collapsible_by_columns.push(col_count);
                  var cloned_collapsible_by_ctrls = current_grid_cell.collapsible_by_ctrls.slice(0);
                  cloned_collapsible_by_ctrls.push(ctrl_count);

                  grid[col_count+1][row_count+1] = {
                    expandable_by_column: col_count,
                    expandable_by_ctrl: ctrl_count,
                    collapsible_by_columns: cloned_collapsible_by_columns,
                    collapsible_by_ctrls: cloned_collapsible_by_ctrls
                  };
                  ctrl_count++;
                }
              }
            });
            row_count++;
            // if we're at the last cell - add listeners
            if((row_count == rows.length) && (col_count == thisClass.final_col)) {
              for(var k = 0; k < ctrl_count; k++) {
                $('.pt2-section-ctrl-'+k).click(thisClass.expandSection(k));
              }
              for(var k = 0; k < thisClass.cols.length; k++) {
                var col = thisClass.cols[k];
                thisClass.target.find('th:eq('+col+')').each(function() {
                  var el = $(this);
                  el.prepend('<span class="pt2-th-'+col+'">+&nbsp;</span>').addClass('pt2-clickable').click(thisClass.expandColumn(col));
                });
              }
            }
          });
          col_count++;
        }
      }
    },

    expandColumn: function(col) {
      var thisClass = this;
      return function() {
        var expandable = $('.pt2-expandable-by-col-'+col);
        if(expandable.first().is(":visible")) {
          var index = thisClass.cols.indexOf(col);
          for(var i = index; i < thisClass.cols.length; i++) {
            $('.pt2-th-'+thisClass.cols[i]).html('+&nbsp;');
          }
          $('.pt2-collapsible-by-col-'+col).hide();
        }
        else {
          $('.pt2-th-'+col).html('-&nbsp;');
          expandable.show();
        }
      }
    },

    expandSection: function(ctrl) {
      return function() {
        var expandable = $('.pt2-expandable-by-ctrl-'+ctrl);
        if(expandable.first().is(":visible")) {
          $('.pt2-collapsible-by-ctrl-'+ctrl).hide();
        }
        else {
          expandable.show();
        }
      }
    }
  };

  // jquery bind method
  $.fn.polytables2 = function(config) {
    var self = this;
    var settings = $.extend(true, {
      target: self,
      collapsible: {
        columns: [0]
      }
    }, config);

    // instantiate
    var pt = new polytables2(settings);
    pt.initTable();
    return this;
  };

})(jQuery);
