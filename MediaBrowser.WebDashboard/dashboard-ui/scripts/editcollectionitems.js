﻿(function ($, document, window, FileReader, escape) {

    var currentItem;

    function reload(page) {

        Dashboard.showLoadingMsg();

        $('#btnRemoveItems', page).buttonEnabled(false);

        MetadataEditor.getItemPromise().done(function (item) {

            currentItem = item;

            LibraryBrowser.renderName(item, $('.itemName', page), true);

            reloadTitles(page, item);
        });
    }

    function getTitleHtml(item) {

        var html = '<div style="display:inline-block;margin:5px;vertical-align:top;">';

        html += '<div style="width:120px;height:180px;">';
        if (item.ImageTags.Primary) {

            var imgUrl = ApiClient.getScaledImageUrl(item.Id, {
                type: "Primary",
                maxWidth: 120,
                maxHeight: 180,
                tag: item.ImageTags.Primary
            });

            html += '<img src="' + imgUrl + '" style="max-width:120px;max-height:180px;" />';

        }
        html += '</div>';

        html += '<div style="text-align:center;margin-top:4px;max-width:100px;overflow:hidden;height: 32px;">' + item.Name + '</div>';

        if (item.ParentId != currentItem.Id) {
            html += '<label for="chkRemove' + item.Id + '">' + Globalize.translate("ButtonRemove") + '</label><input id="chkRemove' + item.Id + '" class="chkRemoveItem" type="checkbox" data-itemid="' + item.Id + '" data-mini="true" />';
        }

        html += '</div>';

        return html;
    }

    function getSearchResultHtml(item) {

        var html = '<div style="display:inline-block;margin:3px;vertical-align:top;">';

        html += '<div style="width:100px;height:150px;">';

        if (item.PrimaryImageTag) {

            var imgUrl = ApiClient.getScaledImageUrl(item.ItemId, {
                type: "Primary",
                maxWidth: 100,
                maxHeight: 150,
                tag: item.PrimaryImageTag
            });

            html += '<img src="' + imgUrl + '" style="max-width:100px;max-height:150px;" />';

        }
        html += '</div>';

        html += '<div style="text-align:center;margin-top:4px;max-width:100px;overflow:hidden;height: 32px;">' + item.Name + '</div>';

        html += '<label for="chkAdd' + item.ItemId + '">' + Globalize.translate("ButtonAdd") + '</label><input id="chkAdd' + item.ItemId + '" class="chkAddItem" type="checkbox" data-itemid="' + item.ItemId + '" data-mini="true" />';

        html += '</div>';

        return html;
    }

    function reloadTitles(page, item) {

        ApiClient.getItems(Dashboard.getCurrentUserId(), {

            ParentId: item.Id

        }).done(function (result) {

            // Scroll back up so they can see the results from the beginning
            window.scrollTo(0, 0);

            var html = result.Items.map(getTitleHtml).join('');

            var elem = $('.collectionItems', page).html(html).trigger('create');

            $('.chkRemoveItem', elem).on('change', function () {

                if ($('.chkRemoveItem:checked', elem).length) {
                    $('#btnRemoveItems', page).buttonEnabled(true);
                } else {
                    $('#btnRemoveItems', page).buttonEnabled(false);
                }

            });

            Dashboard.hideLoadingMsg();
        });

    }

    function showSearchResults(page, searchTerm) {

        ApiClient.getSearchHints({

            userId: Dashboard.getCurrentUserId(),
            searchTerm: searchTerm,
            limit: 30,

            includePeople: false,
            includeGenres: false,
            includeStudios: false,
            includeArtists: false,

            IncludeItemTypes: "Movie,Series,Game,MusicAlbum,Book"

        }).done(function (result) {

            renderSearchResults(page, result.SearchHints);

        });

    }

    function renderSearchResults(page, items) {

        var existingIds = $('.chkRemoveItem', page).get().map(function (c) {
            return c.getAttribute('data-itemid');
        });

        var html = items.filter(function (i) {

            return existingIds.indexOf(i.ItemId) == -1;

        }).map(getSearchResultHtml).join('');

        var elem = $('.collectionItemSearchResults', page).html(html).trigger('create');

        $('.chkAddItem', elem).on('change', function () {

            if ($('.chkAddItem:checked', elem).length) {
                $('#btnAddItems', page).buttonEnabled(true);
            } else {
                $('#btnAddItems', page).buttonEnabled(false);
            }

        });
    }

    function addItemsToCollection(page) {

        var items = $('.chkAddItem:checked', page).get().map(function (c) {

            return c.getAttribute('data-itemid');

        });

        if (!items.length) {
            Dashboard.alert(Globalize.translate("MessagePleaseSelectOneItem"));
            return;
        }

        var url = ApiClient.getUrl("Collections/" + currentItem.Id + "/Items", {

            Ids: items.join(',')

        });

        ApiClient.ajax({
            type: "POST",
            url: url

        }).done(function () {

            Dashboard.hideLoadingMsg();

            $('.popupIdentifyCollection', page).popup('close');

            reload(page);

        });
    }

    function removeItemsFromCollection(page) {
        var items = $('.chkRemoveItem:checked', page).get().map(function (c) {

            return c.getAttribute('data-itemid');

        });

        if (!items.length) {
            Dashboard.alert(Globalize.translate("MessagePleaseSelectOneItem"));
            return;
        }

        var url = ApiClient.getUrl("Collections/" + currentItem.Id + "/Items", {

            Ids: items.join(',')

        });

        ApiClient.ajax({
            type: "DELETE",
            url: url

        }).done(function () {

            Dashboard.hideLoadingMsg();

            reload(page);

        });
    }

    function onSearchFormSubmit() {
        var page = $(this).parents('.page');

        showSearchResults(page, $('#txtLookupName', this).val());
        return false;
    }

    $(document).on('pageinit', "#editItemMetadataPage", function () {

        var page = this;

        $('#btnAddItem', page).on('click', function () {


            var popup = $('.popupIdentifyCollection', page).popup('open');

            $('#txtLookupName', popup).val('');
            $('.collectionItemSearchResults', popup).empty();
            $('#btnAddItems', popup).buttonEnabled(false);
        });

        $('#btnAddItems', page).on('click', function () {

            addItemsToCollection(page);
        });

        $('#btnRemoveItems', page).on('click', function () {


            removeItemsFromCollection(page);
        });

        $('.collectionItemSearchForm').off('submit', onSearchFormSubmit).on('submit', onSearchFormSubmit);

        $(page.querySelector('paper-tabs')).on('tabchange', function () {

            if (parseInt(this.selected) == 2) {
                var tabContent = page.querySelector('.collectionItemsTabContent');

                reload(tabContent);
            }
        });
    });

})(jQuery, document, window, window.FileReader, escape);