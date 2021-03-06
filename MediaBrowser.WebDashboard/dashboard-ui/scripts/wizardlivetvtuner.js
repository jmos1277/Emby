﻿(function ($, document) {

    function save(page) {

        Dashboard.showLoadingMsg();

        var apiClient = ApiClient;

        // After saving chapter task, now save server config
        apiClient.getJSON(apiClient.getUrl('Startup/Configuration')).done(function (config) {

            config.LiveTvTunerType = $('#selectTunerType', page).val();
            config.LiveTvTunerPath = $('.txtDevicePath', page).val();

            apiClient.ajax({

                type: 'POST',
                data: config,
                url: apiClient.getUrl('Startup/Configuration')

            }).done(function () {

                Dashboard.hideLoadingMsg();
                navigateToNextPage(config);

            }).fail(function () {

                Dashboard.hideLoadingMsg();
                Dashboard.alert({
                    message: Globalize.translate('ErrorSavingTvProvider')
                });

            });
        });

    }

    function reload(page) {

        Dashboard.showLoadingMsg();

        var apiClient = ApiClient;

        apiClient.getJSON(apiClient.getUrl('Startup/Configuration')).done(function (config) {

            $('#selectTunerType', page).val(config.LiveTvTunerType || 'hdhomerun').selectmenu("refresh");
            page.querySelector('.txtDevicePath').value = config.LiveTvTunerPath || '';

            Dashboard.hideLoadingMsg();
        });
    }

    function navigateToNextPage(config) {

        if (config.LiveTvTunerPath && config.LiveTvTunerType) {
            Dashboard.navigate('wizardlivetvguide.html');
        } else {
            skip();
        }
    }

    function skip() {
        var apiClient = ApiClient;

        apiClient.getJSON(apiClient.getUrl('Startup/Info')).done(function (info) {

            if (info.SupportsRunningAsService) {
                Dashboard.navigate('wizardservice.html');

            } else {
                Dashboard.navigate('wizardagreement.html');
            }
        });
    }

    function onSubmit() {
        var form = this;

        save(form);

        return false;
    }

    $(document).on('pageinit', "#wizardTunerPage", function () {

        var page = this;

        $('form', page).off('submit', onSubmit).on('submit', onSubmit);

        $('.btnSkip', page).on('click', skip);

    }).on('pageshowready', "#wizardTunerPage", function () {

        var page = this;

        reload(page);
    });

})(jQuery, document, window);
