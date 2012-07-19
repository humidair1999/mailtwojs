/*

Mailtwo.js - A better way to handle 'mailto:' links across your site

J. Ky Marsh, jkymarsh@gmail.com
Copyright (c) 2012

*/

;(function($, window, document, undefined) {
    // create the defaults and set up the constructor for the plugin itself
    var pluginName = "mailtwo",
        defaults = {
            modalBgClass: "mailtwoBackground",
            modalClass: "mailtwoModal"
            // facebook/twitter/linkedin have no defaults; no point in initializing an empty option!
        },
        Plugin = function(element, options) {
            // "this.defaults" and "this.name" available to the object but not used within
            //  the context of this plugin
            this.element = element;
            this.defaults = defaults;
            this.name = pluginName;
            this.options = $.extend({}, defaults, options);

            // run init method immediately upon creation of the plugin
            this.init();
        };

    // METHOD: when selected, this method injects a table row of header cells into
    //  the table repeatedly using "period" value. alternatively, the table will be
    //  cloned and appended as necessary, trimming duplicate rows and resulting in
    //  multiple tables, all with the same repeated header cells
    Plugin.prototype.repeatHeader = function($element, options, thArray) {
        var constructedRow,
            openCellTag = "<td>",
            closeCellTag = openCellTag.replace("<","</"),
            cellData,
            rowNumbers = [];

        // if terminateTable = false, repeat the table header and inject it into the
        //  table, rather than cloning/appending table
        if (!(options.terminateTable)) {
            constructedRow = (options.headerClass) ? "<tr class=\"" + options.headerClass + "\">" : "<tr>";

            // for every header cell stored in thArray, construct a new cell with optional
            //  inlined styles
            for (var i=0; i < thArray.length; i++) {
                if (options.preserveStyle) {
                    cellData = "colspan=\"" + thArray[i].colSpan + "\" "
                                + "style=\""
                                + "font-size:" + thArray[i].fontSize + ";"
                                + "font-weight:" + thArray[i].fontWeight + ";"
                                + "font-style:" + thArray[i].fontStyle + ";"
                                + "color:" + thArray[i].fontColor + ";"
                                + "\"";

                    cellData = openCellTag.replace(">", " " + cellData + ">");
                }
                else {
                    cellData = openCellTag;
                }

                constructedRow += cellData;
                constructedRow += thArray[i].content;
                constructedRow += closeCellTag;
            }

            constructedRow += "</tr>";

            // as long as the current row is not already a header row and matches
            //  a row where the modulus of "period" and index is zero, inject a new
            //  header right after this match
            $element.find("tr").each(function(index) {
                if ((index % options.period) === 0 && index !== 0) {
                    $(this).after(constructedRow);
                }
            });
        }
        // if terminateTable = true, clone the entire table the appropriate number of
        //  times, append it after the end of the existing element, and then iterate
        //  through all these resultant tables, removing duplicate rows
        else {
            $element.find("tr").each(function(index) {
                rowNumbers.push(options.period * index);

                if ((index % options.period) === 0 && index !== 0) {
                    $element.after($element.clone());
                }
            });

            $element.parent().find("table").each(function() {
                // for each row iterated over in every cloned table, if the current row
                //  shown is less than or equal to "period" times current index, OR if the
                //  current row is greater than "period" times current index PLUS "period,"
                //  AND the current row isn't already a header, remove it. phew!
                $(this).find("tr").each(function(index) {
                    if ((index <= rowNumbers[0] || index > (rowNumbers[0] + options.period)) && (index !== 0)) {
                        $(this).remove();
                    }
                });

                rowNumbers.shift();

                // if a cloned table doesn't have any data rows other than the header cells,
                //  remove the cloned table entirely
                $(this).find("tr").each(function() {
                    if ($(this).siblings().length === 0) {
                        $(this)
                            .parents("table")
                            .remove();
                    }
                });
            });
        }
    };

    // METHOD: when selected, this option will duplicate the targeted element, remove all
    //  rows that aren't the header, store some CSS display properties of the original
    //  element, and then append a new element with fixed positioning to the page, which
    //  will fade in and out as the user scrolls onto/off of the table
    Plugin.prototype.fixHeader = function($element, options, thArray) {
        var $clonedElement = $element.clone(),
            elementOffset = $element.offset().left,
            elementWidth = $element.outerWidth(),
            cellWidthArray = [];

        $clonedElement.find("tr").each(function(index) {
            if (index !== 0) {
                $(this).remove();
            }
            else {
                $(this).find("th").each(function(index) {
                    $(this).css("width", thArray[index].width);
                });
            }
        });

        if (options.headerClass) {
            $clonedElement.addClass(options.headerClass);
        }

        $clonedElement
            .css("position", "fixed")
            .css("top", 0)
            .css("left", elementOffset)
            .css("width", elementWidth)
            .css("margin", 0)
            .hide();

        $element
            .parents("body")
            .append($clonedElement);

        // if the top offset of the clone is greater than or equal to the offset of the
        //  original, AND the offset of the clone is less than or equal to the offset of
        //  the original PLUS its height, the cloned header is shown
        $(window).scroll(function() {
            if (($clonedElement.offset().top >= $element.offset().top) && ($clonedElement.offset().top <= ($element.offset().top + $element.height()))) {
                $clonedElement.fadeIn();
            }
            else {
                $clonedElement.fadeOut();
            }
        });
    };

    Plugin.prototype.constructModal = function(options) {
        var modalBgElement = ("." + options.modalBgClass);

        console.log(options);
        console.log(modalBgElement);

        var constructModal = function() {
            var $modal = $("<div />"),
                modalInner = "",
                socialMediaSites = ["facebook", "twitter", "linkedin"],
                socialMediaAccounts = [options.facebook, options.twitter, options.linkedin];

            console.log(socialMediaSites);
            console.log(socialMediaAccounts);

            modalInner += "<a href=\"#\" id=\"closeMailtwoModal\">X</a>"
                        + "<ul>"
                        + "<li><span>Send me an email:</span>"
                        + "<a href=\"" + options.emailFull + "\" target=\"_blank\">lol</a>"
                        + "</li>";

            for (var i = 0; i < socialMediaSites.length; i++) {
                if (socialMediaAccounts[i]) {
                    modalInner += "<li>"
                            + "<a href=\"http://" + socialMediaSites[i] + ".com/"
                            + socialMediaAccounts[i] + "\" target=\"_blank\">" + socialMediaAccounts[i] + "</a>"
                            + "</li>";
                }
            }

            $modal
                .addClass(options.modalClass)
                .html(modalInner);

            return $modal;
        }

        if ($("body").children(modalBgElement).length === 0) {
            $("<div />")
                .addClass(options.modalBgClass)
                .html(constructModal())
                .appendTo("body");
        }
        else {
            $(modalBgElement)
                .html(constructModal());
        }
    }

    // METHOD: initialization method for the plugin fires after setup is complete,
    //  element and options are instantly available to the object. after setup,
    //  relevant method will be called based on user-defined "mode"
    Plugin.prototype.init = function() {
        var plugin = this,
            $element = $(this.element),
            options = this.options;

        options.emailFull = $element.attr("href");
        options.emailParsed = options.emailFull.split(":")[1];
        options.facebook = options.facebook || $element.attr("data-facebook");
        options.twitter = options.twitter || $element.attr("data-twitter");
        options.linkedin = options.linkedin || $element.attr("data-linkedin");

        console.log($element);

        $element.on("click", function(evt) {
            evt.preventDefault();

            plugin.constructModal(options);

            $("." + options.modalBgClass).show();

            // console.log($("." + options.modalBgClass).css("display"));
        });

        $("#closeMailtwoModal").live("click", function(evt) {
            evt.preventDefault();

            $("." + options.modalBgClass).hide();

            // console.log($("." + options.modalBgClass).css("display"));
        });
    };

    // a lightweight plugin wrapper around the constructor, preventing against
    //  multiple instantiations
    $.fn[pluginName] = function(options) {
        var attachPlugin = function() {
            // console.log($(this));

            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new Plugin(this, options));
            }
        }

        return this.each(function() {
            // if element isn't a link, find actual links within the element and
            //  attach the plugin instantiation to each of them

            // TODO: if "a" element doesn't start with "mailto:" then do nothing
            if (!$(this).attr("href")) {
                $(this).find("a").each(function() {
                    attachPlugin.call(this);
                });
            }
            // otherwise, just attach the plugin to the specified link element
            else {
                attachPlugin.call(this);
            }

        });
    };

})(jQuery, window, document);