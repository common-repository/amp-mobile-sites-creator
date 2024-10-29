var $ = jQuery;
var typeForm;
var baseUrl = 'https://www.fastampsites.com/';
var $progressBar = null;
var xhrArr = [];
siteData['data'] = JSON.parse(siteData['data']);

$(function () {
    // check auth
    checkAuth();
    // load all pages
    loadAllPages();

    // action select all pages
    $('.select-all-pages').click(function() {
        $(this).parents('.pages-list').find('input').each(function(key, item) {
            $(item).prop('checked', true);
        });
    });

    // action deselect select all pages
    $('.deselect-all-pages').click(function() {
        $(this).parents('.pages-list').find('input').each(function(key, item) {
            $(item).prop('checked', false);
        });
    });

    // action export pages
    $('#action-export, #action-update, #action-merge').click(function() {
        var actionType = $(this).attr('data-type');
        var isMergePages = actionType == 'merge' ? true : false;
        var $checkbox = actionType == 'export' ? $('.pages-list-left input:checked') : $('.pages-list-right input:checked');
        var amountRequest = 0;
        var stepPercent = 100 / $checkbox.length;
        var $percent = $('.progress-bar span').text('0%');
        $progressBar = $('.progress-bar div').css('width', '0%');

        if($checkbox.length == 0)
            return;

        $('#modal-export').fadeIn();
        //$("body").css("overflow", "hidden");

        progressAnimate(30000, stepPercent / 300);
        recursiveRequest($checkbox.length - 1, amountRequest);

        function progressAnimate(duration, amountRequest, complete) {
            $progressBar.stop(false, false).animate({
                width: (stepPercent * amountRequest) + '%',
            }, {
                duration: duration,
                step: function (now, fx) {
                    now = Math.round(now);
                    if (parseInt($percent.text()) < now)
                        $percent.text(now + '%');
                },
                complete: complete
            });
        }

        function recursiveRequest(index, amountRequest) {
            var pageId = parseInt($checkbox.eq(index).attr('data-id'));
            amountRequest++;
            var payload = {
                projet_name: siteData['data']['projectName'],
                page_name: decodeURI(siteData['data']['pages'][pageId].name),
                page_url: decodeURI(siteData['data']['pages'][pageId].url)
            };
            if(!isMergePages)
                payload.is_save_project = true;

            xhrArr.push($.ajax({
                url: baseUrl + 'api/templates/export',
                type: 'POST',
                crossDomain: true,
                data: payload,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data) {
                    if (!stringIsJson(data)) {
                        showFormInfo('Failed to send data to the server', 0, '#modal-export');
                        closeModalExport(2000);
                        return;
                    }

                    data = JSON.parse(data);
                    if (data.error != undefined) {
                        showFormInfo(data.error, 0, '#modal-export');
                        closeModalExport(2000);
                        return;
                    }

                    if(isMergePages)
                        addContentToVersionBlock(data, payload.page_name);

                    progressAnimate(3000, amountRequest, function() {
                        if (amountRequest == $checkbox.length) {
                            if(isMergePages) {
                                showFormInfo('Page(s) export successfully completed', 1, '#modal-export');
                                $('#modal-export').delay(2000).fadeOut(1000);
                                $('#modal-update').delay(2000).fadeIn(1000);
                            } else {
                                showFormInfo('Page(s) export successfully completed', 1, '#modal-export');
                                loadAllPages();
                                sortedPagesByLists();
                                $('#modal-export').delay(2000).fadeOut(1000);
                            }
                        }
                    });
                }
            }));

            if(index > 0)
                recursiveRequest(index - 1, amountRequest);
        }
    });

    // open modal login to account
    $('#action-enter-account').click(function () {
        $('#modal-account h3').text('Login to FastAMPsites');
        $('#modal-account-enter').text('Login');
        $("body").css("overflow", "hidden");
        $('#modal-account').fadeIn();
        typeForm = 1;
    });

    // open modal create new account
    $('#action-create-account').click(function () {
        $('#modal-account h3').text('Create New Account');
        $('#modal-account-enter').text('Create');
        $("body").css("overflow", "hidden");
        $('#modal-account').fadeIn();
        typeForm = 2;
    });

    // action enter to account
    $('#modal-account-enter').click(function() {
        $('#modal-account button:first').prop('disabled', true);

        var email = $('#modal-account input[name=email]').val();
        var password = $('#modal-account input[name=password]').val();

        if(checkAccountForm(email, password)) {
            var action = (typeForm == 1) ? 'users/login' : 'api/users/create';
            $.ajax({
                url: baseUrl + action,
                type: 'POST',
                crossDomain: true,
                data: {
                    email: email,
                    password: password
                },
                xhrFields: {
                    withCredentials: true
                },
                success: function(data) {
                    data = JSON.parse(data);
                    if(data.error != undefined) {
                        showAccountFormInfo(data.error, 0);
                        return;
                    }

                    $('#action-enter-account, #action-create-account').fadeOut();
                    $('#action-export, #action-logout, #action-open-project, #action-credentials, #action-merge, #action-update').delay(1000).fadeIn();

                    showAccountFormInfo('Now you can continue exporting pages', 1);
                    setTimeout(function() {
                        $('#modal-account').fadeOut();
                    }, 2000);
                },
                error: function(data) {
                    showAccountFormInfo('An error occurred while sending data', 0);
                }
            });
        } else {
            showAccountFormInfo('Not a valid email or password', 0);
        }
    });

    // close modal-account
    $('#modal-account-close').click(function() {
        $('#modal-account').fadeOut();
        $('#modal-account button:first').prop('disabled', false);
        setTimeout(function () {
            $("body").css("overflow", "auto");
        }, 500);
    });

    // close model-export
    $('#progress-stop').click(function() {
        if(xhrArr.length > 0)
            for(var index in xhrArr)
                xhrArr[index].abort();

        closeModalExport(2000);
        $progressBar = null;
    });

    // logout
    $('#action-logout').click(function() {
        $.ajax({
            url: baseUrl + 'users/logout',
            type: 'POST',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            }
        });

        $('#action-export, #action-logout, #action-open-project, #action-credentials, #action-merge, #action-update').fadeOut();
        $('#action-enter-account, #action-create-account').delay(1000).fadeIn();
    });

    // open modal credentials
    $('#action-credentials').click(function () {
        $("body").css("overflow", "hidden");
        $('#modal-credentials').fadeIn();

        // load credentials data
        $.ajax({
            url: baseUrl+'api/users/credentials',
            type: 'GET',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                data = JSON.parse(data);

                $.each(data, function(key, value) {
                    var $input = $('#modal-credentials input[name=' + key + ']');
                    if($input.length)
                        $input.val(value);
                });

                $('#modal-credentials input, #modal-credentials button:first').prop('disabled', false);
            }
        });

    });

    // close model credentials
    $('#action-close-credentials').click(function() {
        $('#modal-credentials').fadeOut();
        $('#modal-credentials input, #modal-credentials button:first').prop('disabled', true);
        setTimeout(function () {
            $("body").css("overflow", "auto");
        }, 500);
    });

    // save credentials
    $('#action-save-credentials').click(function() {
        var dataSend = {};

        // get all field
        $('#modal-credentials input').each(function(index, item) {
            dataSend[$(item).attr('name')] = $(item).val();
        });

        $.ajax({
            url: baseUrl+'api/users/credentials',
            type: 'POST',
            crossDomain: true,
            data: dataSend,
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                data = JSON.parse(data);
                if(data.error != undefined) {
                    showFormInfo(data.error, 0, '#modal-credentials');
                    return;
                }

                showFormInfo('Сredentials data saved successfully', 1, '#modal-credentials');
                setTimeout(function() {
                    $('#modal-credentials').fadeOut();
                }, 2000);
            },
            error: function(data) {
                showAccountFormInfo('An error occurred while sending data', 0, '#modal-credentials');
            }
        });

    });

    // on/off AMP link
    $('#used_amp').change(function () {
        var isUsedAMP = $(this).is(':checked');
        $(this).prop('disabled', true);

        saveSattings('false', '');

        if(isUsedAMP)
            $.ajax({
                url: baseUrl+'api/project/domain',
                type: 'POST',
                crossDomain: true,
                data: {
                    projet_name: siteData['data']['projectName'],
                },
                xhrFields: {
                    withCredentials: true
                }
            }).done(function (data) {
                if(data.length > 0) {
                    data = JSON.parse(data);
                    saveSattings(isUsedAMP.toString(), data.domain_name);
                } else {
                    $('#used_amp').prop('checked', false)
                        .prop('disabled', false);
                }
            }).fail(function () {
                $('#used_amp').prop('checked', false)
                    .prop('disabled', false);
            });
    });

    // close modal update
    $('#btn-close-model-update').click(function () {
        $('#modal-update').hide();
        // remove old file content
        $('#modal-update .modal-content-wrap .page').remove();
    });

    // open file content
    $('#modal-update .modal-content-wrap').on('click', '.page h4', function() {
        var type = $(this).attr('data-type');
        var $parent = $(this).parent();

        var $twoElement = $parent.find('.' + (type == 'html' ? 'css' : 'html') + '-content');
        if($twoElement.css('display') == 'block')
            $twoElement.css('display', 'none');

        var $content = $parent.find('.' + type + '-content');
        var isHide = $content.css('display') == 'none';
        $content.css('display', isHide ? 'block' : 'none');

        if($content.is(':empty'))
            $content.append('<div class="no-differences">In the old and new versions of the files there are no differences found</div>');

        if(isHide) {
            $parent.find('.ChangeReplace .Right, .ChangeInsert .Right, .ChangeDelete .Right').addClass('dontUse');
            $parent.find('.ChangeReplace .Left, .ChangeInsert .Left, .ChangeDelete .Left').addClass('use');
            $content.find('button').prop('disabled', 'false').removeAttr('disabled');
        }
    });

});

// add content to version block
function addContentToVersionBlock(data, pageName) {
    // add file content
    var $pageBlock = $('<div class="page" data-name="' + pageName + '">' +
        '<h3>' + pageName + '</h3>' +
        '<div class="file-block">' +
        '<h4 data-type="html">Open HTML Code</h4>' +
        '<h4 data-type="css">Open CSS Code</h4>' +
        '<div class="html-content">' + rhtmlspecialchars(data.html) + '</div>' +
        '<div class="css-content">' + rhtmlspecialchars(data.css) + '</div>' +
        '</div>' +
    '</div>');

    $pageBlock.appendTo('#modal-update .modal-content-wrap');

    $pageBlock.find('.html-content .Differences').phpdiffmerge({
        left: data.html_old,
        right: data.html_new,
        merged: function(merge, left, right) {
            mergeFile(siteData['data']['projectName'], pageName, merge, 'html', $pageBlock);
        }
    });

    // init lib diff for css
    $pageBlock.find('.css-content .Differences').phpdiffmerge({
        left: data.css_old,
        right: data.css_new,
        merged: function(merge, left, right) {
            mergeFile(siteData['data']['projectName'], pageName, merge, 'css', $pageBlock);
        }
    });
}

// merge file
function mergeFile(projectName, pageName, content, type, $pageBlock) {
    $.ajax({
        url: baseUrl+'api/project/update-file',
        type: 'POST',
        crossDomain: true,
        data: {
            project_name: projectName,
            page_name: pageName,
            content: content.join("\n"),
            type: type
        },
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {

        }
    });

    $pageBlock.find('.' + type + '-content').slideToggle(1000);
    $('html, body').animate({scrollTop: '0px'}, 1000);
}

// check auth
function checkAuth() {
    $.ajax({
        url: baseUrl + 'users/getCurrent',
        type: 'GET',
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            $('#action-export, #action-open-project, #action-logout, #action-credentials, #action-merge, #action-update')
                .delay(1000).fadeIn().css('display','inline-block');
            // sorted pages by lists
            sortedPagesByLists();
        },
        error: function (data) {
            $('#action-enter-account, #action-create-account').delay(1000).fadeIn();
        }
    });
}

// save option
function saveSattings(isUsedAMP, url) {
    $.ajax({
        url: document.URL + '&' + siteData['wpnonce'].substring(1),
        type: 'POST',
        data: {
            'fas-used-amp': isUsedAMP,
            'fas-amp-url': url
        }
    }).fail(function () {
        $('#used_amp').prop('checked', false);
    }).always(function () {
        $('#used_amp').prop('disabled', false);
    });
}

// load all pages
function loadAllPages() {
    $('.pages-list-left').find('.pages-list-item').remove();
    for(var i = 0; i < siteData['data']['pages'].length; i++) {
        $('.pages-list-left').append(
            String.format('<div class="pages-list-item">' +
                '<input type="checkbox" id="page-{0}" data-id="{0}"/>' +
                '<label for="page-{0}">{1}</label>' +
                '</div>', i, decodeURI(siteData['data']['pages'][i]['name']) )
        );
    }
}

// sorted pages by lists
function sortedPagesByLists() {
    $('.pages-list-right').find('.pages-list-item').remove();
    // get exported pages
    $.ajax({
        url: baseUrl + 'api/project/pages',
        type: 'POST',
        crossDomain: true,
        data: {
            projet_name: siteData['data']['projectName']
        },
        xhrFields: {
            withCredentials: true
        },
        success: function(pages) {
            pages = JSON.parse(pages);
            $('.pages-list-left .pages-list-item').each(function(key, item) {
                var pageName = $(item).find('label').text().toLowerCase();
                for(var index in pages)
                    if(pageName.indexOf(pages[index].name.toLowerCase()) !== -1
                        || pageName.indexOf('home') !== -1
                        && pages[index].name.toLowerCase().indexOf('index') != -1) {
                        $('.pages-list-right').append(item);
                        break;
                    }
            });
        }
    });
}

// check login and password
function checkAccountForm(email, password) {
    if(!isValidEmail(email) || !isValidatePassword(password))
        return false;

    return true;
}

// email validator
function isValidEmail(email) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(email);
};

// password validator
function isValidatePassword(password) {
    var pattern = /^[A-Za-z0-9]{5,}$/i;
    return pattern.test(password);
}

// show account form info
function showAccountFormInfo(msg, typeInfo) {
    var classInfo = typeInfo ? 'form-succses-msg' : 'form-error-msg';
    var text = msg;

    if(typeof(msg) == 'object') {
        text = '';
        for (var key in msg)
            text += capitalizeFirstLetter(key) + ': ' + msg[key] + '<br/>';
    }

    $('#modal-account .form-result')
        .removeClass('form-succses-msg').removeClass('form-error-msg')
        .addClass(classInfo).html(text)
        .fadeIn().delay(2000).fadeOut();

    setTimeout(function () {
        $('#modal-account button:first').prop('disabled', false);
    }, 2000);
}

// show export form info
function showFormInfo(text, typeInfo, strId) {
    var classInfo = typeInfo ? 'form-succses-msg' : 'form-error-msg';

    $(strId + ' .form-result')
        .removeClass('form-succses-msg').removeClass('form-error-msg')
        .addClass(classInfo).html(text)
        .fadeIn().delay(2000).fadeOut();
}

// first letter uppercase
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// string is json
function stringIsJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// close modal export
function closeModalExport(delay) {
    delay = delay != undefined ? delay : 0;
    if($progressBar)
        $progressBar.stop(false, false);

    $('#progress-stop').removeAttr('disabled');
    setTimeout(function () {
        $('#modal-export').hide();
    }, delay);
    setTimeout(function () {
        $("body").css("overflow", "auto");
    }, delay + 500);
}

// string formatter
String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}

// string to html
function rhtmlspecialchars(str) {
    if (typeof(str) == "string") {
        str = str.replace(/&gt;/ig, ">");
        str = str.replace(/&lt;/ig, "<");
        str = str.replace(/&#039;/g, "'");
        str = str.replace(/&quot;/ig, '"');
        str = str.replace(/&amp;/ig, '&'); /* must do &amp; last */
    }
    return str;
}