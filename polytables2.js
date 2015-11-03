// polytables2 definition
"use strict";
var polyTable = class polyTable {
  constructor(obj) {
    this.target = obj.target;
  	this.config = {
  		collapsable: {
        columns: obj.config.collapsable.columns.sort(function(a, b){return a-b})
      }
  	}
    // private
    this.cols = this.config.collapsable.columns;
    this.final_col = this.cols[this.cols.length-1]+1;

    var thisClass = this;

    // set up collapsable
    if(thisClass.config.collapsable) {
      var grid = []
      var col_count = 0
      var ctrl_count = 0
      var rows = thisClass.target.find('tbody tr');
      // for all columns we care about
      for(var i = thisClass.cols[0]; i <= thisClass.final_col; i++) {
        // caching grid for updates
        if(!grid[col_count]) {
          grid[col_count] = [];
        }
        // create this for caching purposes
        grid[col_count+1] = []
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
                collapsable_by_columns: [],
                collapsable_by_ctrls: [],
              };
            }
            // here it is a section - or a continuation
            else {
              if (cell.html()) {
                var newClass = 'pt2-section pt2-expandable-by-col-'+current_grid_cell.expandable_by_column+
                  ' pt2-expandable-by-ctrl-'+current_grid_cell.expandable_by_ctrl;
                for(var i = 0; i < current_grid_cell.collapsable_by_columns.length; i++) {
                  newClass += ' pt2-collapsable-by-col-'+current_grid_cell.collapsable_by_columns[i]
                }
                for(var i = 0; i < current_grid_cell.collapsable_by_ctrls.length; i++) {
                  newClass += ' pt2-collapsable-by-ctrl-'+current_grid_cell.collapsable_by_ctrls[i]
                }
                row.addClass(newClass)
              }
              // we just need to continue so the right row gets the classes
              if(row_count < rows.length-1 && !grid[col_count-1][row_count+1].is_controller) {
                var new_grid_cell = {
                  expandable_by_column: current_grid_cell.expandable_by_column,
                  expandable_by_ctrl: current_grid_cell.expandable_by_ctrl,
                  collapsable_by_columns: current_grid_cell.collapsable_by_columns,
                  collapsable_by_ctrls: current_grid_cell.collapsable_by_ctrls,
                }
                grid[col_count][row_count+1] = new_grid_cell;
              }
            }
            // if cell is not empty
            if (cell.html()) {
              // if cell is in an expandable column
              if (thisClass.cols.indexOf(col_count) >= 0) {
                grid[col_count][row_count].is_controller = true
                // add the section ctrl with col class
                cell.addClass('pt2-clickable pt2-section-ctrl-'+ctrl_count);
                var cloned_collapsable_by_columns = current_grid_cell.collapsable_by_columns.slice(0);
                cloned_collapsable_by_columns.push(col_count);
                var cloned_collapsable_by_ctrls = current_grid_cell.collapsable_by_ctrls.slice(0);
                cloned_collapsable_by_ctrls.push(ctrl_count)

                grid[col_count+1][row_count+1] = {
                  expandable_by_column: col_count,
                  expandable_by_ctrl: ctrl_count,
                  collapsable_by_columns: cloned_collapsable_by_columns,
                  collapsable_by_ctrls: cloned_collapsable_by_ctrls
                }
                ctrl_count++;
              }
            }
          });
          row_count++;
          // here all data is initialized - so adding listeners
          if((row_count == rows.length) && col_count == thisClass.final_col) {
            // add a click listener for each section controller
            for(var k = 0; k < ctrl_count; k++) {
              $('.pt2-section-ctrl-'+k).click(thisClass.expandSection(k));
            }

            // add a click listener for each column controller
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
  }
	
  // expand column
  expandColumn(col) {
    var thisClass = this;
    return function() {
      var expandable = $('.pt2-expandable-by-col-'+col);
      // collapsing
      if(expandable.first().is(":visible")) {
        var index = thisClass.cols.indexOf(col);
        for(var i = index; i < thisClass.cols.length; i++) {
          $('.pt2-th-'+thisClass.cols[i]).html('+&nbsp;');
        }
        $('.pt2-collapsable-by-col-'+col).hide();
      }
      // expanding
      else {
        $('.pt2-th-'+col).html('-&nbsp;');
        expandable.show();
      }
    }
  }

  // expand section
  expandSection(ctrl) {
    return function() {
      var expandable = $('.pt2-expandable-by-ctrl-'+ctrl);
      // collapsing
      if(expandable.first().is(":visible")) {
        $('.pt2-collapsable-by-ctrl-'+ctrl).hide();
      }
      // expanding
      else {
        expandable.show();
      }
    }
  };
}