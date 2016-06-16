/*jshint multistr: true ,node: true*/
"use strict";

var
    /*
        Node Internal
    */
    FS                      = require('fs'),
    PATH                    = require('path'),

    /*
        GLOBAL
    */
    MARKDOWNS               = [//in the order of priority
        {
            name            : 'TITLE',
            html_start      : '<head><title>',
            html_end        : '</title></head>',
            regex           : /##.*/g,
            start_replacer  : '##'
        },
        {
            name            : 'HEADING',
            html_start      : '<h1>',
            html_end        : '</h1>',
            regex           : /#.*/g,
            start_replacer  : '#'
        },
        {
            name            : 'CODE_BEGINS',
            html_start      : '<div style="background-color:#f7f7f7;">',
            html_end        : '',
            regex           : /_code.*/g,
            start_replacer  : '_code'
        },
        {
            name            : 'CODE_ENDS',
            html_start      : '',
            html_end        : '</div>',
            regex           : /.*code_/g,
            end_replacer    : 'code_'
        },
        {
            name            : 'PARAGRAPH',
            html_start      : '<p>',
            html_end        : '</p>',
            regex           : /.*/g,
        }
    ],

    FORMATORS               = [
        {
            name            : 'BOLD',
            html_start      : '<b>',
            html_end        : '</b>',
            regex           : /\*\*.*\*\*/g,
            start_replacer  : '**',
            end_replacer    : '**',
        },
        {
            name            : 'UNDERLINE',
            html_start      : '<u>',
            html_end        : '</u>',
            regex           : /_u.*u_/g,
            start_replacer  : '_u',
            end_replacer    : 'u_',
        },
        {
            name            : 'ITALICS',
            html_start      : '<i>',
            html_end        : '</i>',
            regex           : /\/\/.*\/\//g,
            start_replacer  : '//',
            end_replacer    : '//',
        }
    ];


function me_special (source_file,destination_file) {
    var
        self = this,
        html = '',
        code = false,
        file_data,
        mark_down;

    file_data = FS.readFileSync(source_file).toString().split('\n');

    file_data.forEach(function (mark_down_line) {
        if( mark_down_line ) {
            mark_down = self.regex_check_conversion(mark_down_line);

            if ( mark_down.name === 'CODE_ENDS') {
                code = false;
            }

            if (!code) {

                /*
                    apply FORMATTORS
                */
                FORMATORS.forEach(function (formator) {
                    if ( mark_down_line.match(formator.regex)) {
                        mark_down_line = self.replace_formator(mark_down_line,formator);
                    }
                });

                html += self.replace_mark_down_with_html(mark_down_line,mark_down);
            } else {
                html += self.escapeHtml(mark_down_line) + "<p></p>";
            }

            if ( mark_down.name === 'CODE_BEGINS') {
                code = true;
            }
        }
    });

    FS.writeFileSync(destination_file,html);
}

me_special.prototype.regex_check_conversion = function (mark_down_line) {
    var mark_down;

    for ( var i = 0; i < MARKDOWNS.length; i++) {
        mark_down = MARKDOWNS[i];
        if (mark_down_line.match(mark_down.regex)) {
            break;
        }
    }

    return mark_down;
};

me_special.prototype.replace_mark_down_with_html = function (mark_down_line,mark_down) {
    var mark_down_line_array = [];

    if( mark_down.start_replacer ) {
        mark_down_line_array = mark_down_line.split(mark_down.start_replacer);
        mark_down_line_array[0] = mark_down.html_start;
        mark_down_line = mark_down_line_array.join('');
    } else {
        mark_down_line = mark_down.html_start + mark_down_line;
    }



    if( mark_down.end_replacer ) {
        mark_down_line_array = mark_down_line.split(mark_down.end_replacer);
        mark_down_line_array[mark_down_line_array.length -1] = mark_down.html_end;
        mark_down_line = mark_down_line_array.join('');
    } else {
        mark_down_line += mark_down.html_end;
    }

    return mark_down_line;
};

me_special.prototype.replace_formator = function (mark_down_line,formator) {
    var
        string_to_send  = '',
        i               = 0,
        index;

    index = mark_down_line.indexOf(formator.start_replacer);
    
    for( i = 0; i < index; i++) {
        string_to_send += mark_down_line[i];
    }

    string_to_send += formator.html_start;

    index += formator.start_replacer.length;

    for( i = index; i < mark_down_line.length; i++) {
        string_to_send += mark_down_line[i];
    }

    mark_down_line = string_to_send;
    string_to_send = '';

    index = mark_down_line.indexOf(formator.end_replacer);

    for( i = 0; i < index; i++) {
        string_to_send += mark_down_line[i];
    }

    string_to_send += formator.html_end;

    index += formator.end_replacer.length;

    for( i = index; i < mark_down_line.length; i++) {
        string_to_send += mark_down_line[i];
    }

    return string_to_send;
};

me_special.prototype.escapeHtml = function (unsafe) {
    return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
};

/*
    Boiler Plate for a markdown

    {
        name            : '',
        html_start      : '',
        html_end        : '',
        regex           : ''
    }

    optional - 
    start_replacer
*/
module.exports = me_special;