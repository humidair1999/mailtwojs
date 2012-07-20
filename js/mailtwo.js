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
            // facebook/twitter/linkedin have no defaults; no point in initializing empty options
        },
        Plugin = function(element, options) {
            this.element = element;
            this.defaults = defaults;
            this.name = pluginName;
            this.options = $.extend({}, defaults, options);

            // run init method immediately upon attachment of the plugin
            this.init();
        };

    // METHOD: when user clicks a relevant mailto: link, the actual modal is constructed
    //  and added to the DOM, rather than residing within the page on pageload
    Plugin.prototype.constructModal = function(options) {
        var modalBgElement = ("." + options.modalBgClass),
            modalElement = ("." + options.modalClass);

        var constructModal = function() {
            var $modal = $("<div />"),
                modalInner = "",
                socialMediaSites = ["facebook", "twitter", "linkedin"],
                socialMediaAccounts = [options.facebook, options.twitter, options.linkedin];

            // begin constructing the contents of the modal window
            modalInner += "<span>Contact Me</span>"
                        + "<a href=\"#\" id=\"closeMailtwoModal\"></a>"
                        + "<ul>"
                        + "<li><span>Send me an email:</span>"
                        + "<input type=\"text\" id=\"mailtwoInput\" placeholder=\"Subject\" />"
                        + "<textarea id=\"mailtwoTextarea\" placeholder=\"Message\"></textarea>"
                        + "<a href=\"" + options.emailFull + "&subject=&body=\" id=\"sendMailtwoEmail\" target=\"_blank\">Send</a>"
                        + "</li>";

            // for each of the 3 social media sites, determine if the user entered a
            //  username via plugin option or data- attr, and if so, add it to the modal
            for (var i = 0; i < socialMediaSites.length; i++) {
                if (socialMediaAccounts[i]) {
                    modalInner += "<li>"
                            + "<a href=\"http://" + socialMediaSites[i] + ".com/"
                            + socialMediaAccounts[i] + "\" target=\"_blank\" class=\"mailtwo"
                            + socialMediaSites[i] + "\"></a>"
                            + "</li>";
                }
            }

            modalInner += "</ul>";

            $modal
                .addClass(options.modalClass)
                .html(modalInner);

            return $modal;
        }

        // if the modal doesn't exist as a direct child of the body, add it to the DOM
        if ($("body").children(modalBgElement).length === 0) {
            $("<div />")
                .addClass(options.modalBgClass)
                .html(constructModal())
                .appendTo("body");
        }
        // if the modal DOES exist, merely reconstruct its inner contents
        else {
            $(modalBgElement)
                .html(constructModal());
        }

        // position the modal in the center of the browser viewport
        $(modalElement).css({
            top: "50%",
            left: "50%",
            "margin-left": (-($(modalElement).outerWidth() / 2)),
            "margin-top": (-($(modalElement).outerHeight() / 2))
        });

    }

    // METHOD: initialization method for the plugin fires after setup is complete,
    //  element and options are instantly available to the object.
    Plugin.prototype.init = function() {
        var plugin = this,
            $element = $(this.element),
            options = this.options;

        // augment options with contact information provided by user
        options.emailFull = $element.attr("href");
        options.facebook = options.facebook || $element.attr("data-facebook");
        options.twitter = options.twitter || $element.attr("data-twitter");
        options.linkedin = options.linkedin || $element.attr("data-linkedin");

        // if user has chosen to obscure their email address, convert it to a normal
        //  email address for our modal
        if (((options.emailFull.indexOf("[at]")) > -1) || ((options.emailFull.indexOf("[dot]")) > -1)) {
            options.emailFull = options.emailFull.replace("[at]", "@");
            options.emailFull = options.emailFull.replace("[dot]", ".");
        }

        $element.on("click", function(evt) {
            evt.preventDefault();

            // when relevant mailto: link is clicked, construct and show modal
            plugin.constructModal(options);

            $("." + options.modalBgClass).show();
        });

        $(document).on("click", "#closeMailtwoModal", function(evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();

            // TODO: WHY ARE MY FUCKING OPTIONS NOT BEING PRESERVED
            // console.log(options.modalBgClass);

            $(this)
                .parent()
                .parent()
                .hide();
        });

        // on every keystroke, the href url for the mailto: link is updated with the
        //  user's subject and message
        $(document).on("keyup", "#mailtwoTextarea, #mailtwoInput", function(evt) {
            var emailLink = $("#sendMailtwoEmail").attr("href"),
                emailLinkSubject = emailLink.match(/(&subject=)[^&]*/),
                emailLinkMessage = emailLink.match(/(&body=)[^&]*/);

            evt.stopImmediatePropagation();

            if (evt.currentTarget.id === "mailtwoInput") {
                emailLink = emailLink.replace(emailLinkSubject[0], ("&subject=" + $("#mailtwoInput").val()));
            }
            else {
                emailLink = emailLink.replace(emailLinkMessage[0], ("&body=" + $("#mailtwoTextarea").val()));
            }

            // properly url encode all spaces into %20s in mailto: url
            emailLink = emailLink.replace(/\s/g, "%20");

            // set href attribute of "send" link to the newly-constructed url
            $("#sendMailtwoEmail").attr("href", emailLink);
        });
    };

    // a lightweight plugin wrapper around the constructor, preventing against
    //  multiple instantiations
    $.fn[pluginName] = function(options) {
        var attachPlugin = function() {
            var linkText = ($(this).attr("href"));

            // plugin only gets attached to element if the href url begins with "mailto:"
            if (linkText.indexOf("mailto:") > -1) {
                if (!$.data(this, "plugin_" + pluginName)) {
                    $.data(this, "plugin_" + pluginName, new Plugin(this, options));
                }
            }
        }

        return this.each(function() {
            // if element isn't a link, find actual links within the element and
            //  attach the plugin instantiation to each of them
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