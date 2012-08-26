(function($) {

    $.fn.tablefilter = function(options) {
        var opts = $.extend({}, $.fn.tablefilter.defaults, options);

        return this.each(function(index, Element) {
            $this = $(this);
            if (!$this.is("table"))
                return true;

            if (opts['static']) {
                $this.find('th').each(function() {
                    $(this).css('width', $(this).css('width'));
                });
            }

            var columns = $.fn.tablefilter.getColumns.call($this, 
                opts['columns']);
            var form = $.fn.tablefilter.makeForm(columns, opts['placeholder']);
            form = insertForm.call($this, form, opts['target'], 
                opts['placement']);
            addListener(form, $this, opts);
        });
    }

    $.fn.tablefilter.defaults = {
        'columns':      '*',                // '*', an integer, a column name (by th text), or an array of ints/column names
        'hide':         'fadeOut',          // callback to execute when something should be hidden
        'hideArgs':     400,                // arguments to send to the hide callback. Can be an array or a scalar value
        'placement':    'before',           // before, after
        'postRegex':    '',                 // any regex string to append to the input text
        'placeholder':  'Type a filter',    // text to show as a placeholder in the input box
        'preRegex':     '',                 // any regex string to prepend to the input text
        'regexFlags':   'i',                // any flags to apply to row matching
        'show':         'fadeIn',           // callback to execute when something should be shown
        'showArgs':     400,                // arguments to sned to the show callback. Can be an array or a scalar value
        'static':       true,               // whether or not columns should be kept at a static width when removing items
        'target':       null                // null for before or after this table, or some jQuery object to be inserted into
    };

    $.fn.tablefilter.getColumns = function(selector) {
        var allColumns = {};
        this.find('th').each(function(index, Element) {
            allColumns[index] = $(Element).text();
        });

        switch (typeof selector) {
            case "string":
                if (selector === "*")
                    return allColumns;
                for (key in allColumns) {
                    if (selector === allColumns[key]) {
                        var ret = {};
                        ret[key] = allColumns[key];
                        return ret;
                    }
                }
                return;
            case "number":
                var retObj = {};
                retObj[selector] = allColumns[selector];
                return retObj;
            case "object":
                var retColumns = {};
                for (selectorKey in selector) {
                    if (typeof selectorKey === "number") {
                        retColumns[selectorKey] = allColumns[selectorKey];
                        continue;
                    }
                    for (columnKey in allColumns) {
                        if (allColumns[columnKey] == selector[selectorKey]) {
                            retColumns[columnKey] = allColumns[columnKey];
                            break;
                        }
                    }
                }
                return retColumns;
        }
    }

    $.fn.tablefilter.makeForm = function(columns, placeholder) {
        var numColumns = Object.keys(columns).length;
        var output = '<form class="tablefilter">';
        if (numColumns > 1) {
            output += '<select class="tablefilter-column">';
            for (colNo in columns) {
                output += '<option value="' + colNo + '">' + columns[colNo] + 
                    '</option>';
            }
            output += '</select>';
        } else {
            output += '<label>' + columns[0] + ': </label>';
            output += '<input class="tablefilter-column" type="hidden" value="' + 
                Object.keys(columns)[0] + '" />';
        }
        output += '<input class="tablefilter-input" type="text" placeholder="' + 
            placeholder + '" />';
        output += '</form>';
        return output;
    }

    function insertForm(form, target, placement) {
        if (target === null) {
            if (placement === "before") {
                this.before(form);
                return this.prev();
            } else {
                this.after(form);
                return this.next();
            }
        } else {
            if (placement === "before") {
                target.prepend(form);
                return target.children().first();
            } else {
                target.append(form);
                return target.children().last();
            }
        }
    }

    function addListener(form, table, options) {
        form.find('.tablefilter-input').bind("keyup", function() {
            formUpdateHandler.call(this, form, table, options);
        });
        form.find('.tablefilter-column').bind("change", function() {
            formUpdateHandler.call(this, form, table, options);
        })
    }

    function formUpdateHandler(form, table, options) {
        var inputVal = $(form).find('.tablefilter-input').val();
        var formSelect = $(form).find('.tablefilter-column');
        var selectVal = formSelect.val();
        table.find('tbody > tr').each(function(index, Element) {
            var cell = $(this).find('td').get(selectVal);
            var regex = regexEscape(inputVal);
            regex = new RegExp(options['preRegex'] + regex + 
                options['postRegex'], options['regexFlags']);
            doRowMatch($(this), regex, $(cell).text(), options);
        });
    }

    function doRowMatch(row, regex, value, options) {
        if (value.match(regex) && row.is(':hidden')) {
            var args = (typeof options['showArgs'] === "object") ? 
                options['showArgs'] : [options['showArgs']];
            $.fn[options['show']].apply(row, args);
        } else if (!value.match(regex) && row.is(':visible')) {
            var args = (typeof options['hideArgs'] === "object") ? 
                options['hideArgs'] : [options['hideArgs']];
            $.fn[options['hide']].apply(row, args);
        }
    }

    function regexEscape(text) {
        return text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

})(jQuery);