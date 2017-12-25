/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

/**
 *  Links.js
 *
 *  Created by Julia Radzhabova on 22.12.2017
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    DE.Views.Links = Common.UI.BaseView.extend(_.extend((function(){
        function setEvents() {
            var me = this;
            this.btnsContents.forEach(function(button) {
                button.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('links:contents', [item.value]);
                });
                button.on('click', function (b, e) {
                    me.fireEvent('links:contents', [0]);
                });
            });

            this.btnContentsUpdate.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('links:update', [item.value]);
            });
            this.btnContentsUpdate.on('click', function (b, e) {
                me.fireEvent('links:update', ['all']);
            });

            this.btnsNotes.forEach(function(button) {
                button.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('links:notes', [item.value]);
                });
                button.on('click', function (b, e) {
                    me.fireEvent('links:notes', ['ins_footnote']);
                });
            });

            this.btnsPrevNote.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('links:notes', ['prev']);
                });
            });

            this.btnsNextNote.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('links:notes', ['next']);
                });
            });
        }

        return {

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this);
                this.toolbar = options.toolbar;

                this.btnsContents = [];
                this.btnsNotes = [];
                this.btnsPrevNote = [];
                this.btnsNextNote = [];

                var me = this,
                    $host = me.toolbar.$el;
                var _injectComponent = function (id, cmp) {
                    var $slot = $host.find(id);
                    if ($slot.length)
                        cmp.rendered ? $slot.append(cmp.$el) : cmp.render($slot);
                };

                var $slots = $host.find('.btn-slot.btn-contents');
                $slots.each(function(index, el) {
                    var _cls = 'btn-toolbar';
                    /x-huge/.test(el.className) && (_cls += ' x-huge icon-top');

                    var button = new Common.UI.Button({
                        cls: _cls,
                        iconCls: 'btn-contents',
                        caption: me.capBtnInsContents,
                        split: true,
                        menu: true,
                        disabled: true
                    }).render( $slots.eq(index) );

                    me.btnsContents.push(button);
                });

                this.btnContentsUpdate = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-contents-update',
                    caption: this.capBtnContentsUpdate,
                    split: true,
                    menu: true,
                    disabled: true
                });
                _injectComponent('#slot-btn-contents-update', this.btnContentsUpdate);

                $slots = $host.find('.btn-slot.slot-notes');
                $slots.each(function(index, el) {
                    var _cls = 'btn-toolbar';
                    /x-huge/.test(el.className) && (_cls += ' x-huge icon-top');

                    var button = new Common.UI.Button({
                        cls: _cls,
                        iconCls: 'btn-notes',
                        caption: me.capBtnInsFootnote,
                        split: true,
                        menu: true,
                        disabled: true
                    }).render( $slots.eq(index) );

                    me.btnsNotes.push(button);
                });

                this._state = {disabled: false};
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    var contentsTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem" class="item-contents"><div style="background-position: 0 -<%= options.offsety %>px;" ></div></a>');
                    me.btnsContents.forEach( function(btn) {
                        btn.updateHint( me.tipContents );

                        var _menu = new Common.UI.Menu({
                            items: [
                                {template: contentsTemplate, offsety: 0, value: 0},
                                {template: contentsTemplate, offsety: 72, value: 1},
                                {caption: me.textContentsSettings, value: 'settings'},
                                {caption: me.textContentsRemove, value: 'remove'}
                            ]
                        });

                        btn.setMenu(_menu);
                    });

                    me.btnContentsUpdate.updateHint(me.tipContentsUpdate);
                    var _menu = new Common.UI.Menu({
                        items: [
                            {caption: me.textUpdateAll, value: 'all'},
                            {caption: me.textUpdatePages, value: 'pages'}
                        ]
                    });
                    me.btnContentsUpdate.setMenu(_menu);

                    me.btnsNotes.forEach( function(btn, index) {
                        btn.updateHint( me.tipNotes );

                        var _menu = new Common.UI.Menu({
                            items: [
                                {caption: me.mniInsFootnote, value: 'ins_footnote'},
                                {caption: '--'},
                                new Common.UI.MenuItem({
                                    template: _.template([
                                        '<div class="menu-zoom" style="height: 25px;" ',
                                        '<% if(!_.isUndefined(options.stopPropagation)) { %>',
                                        'data-stopPropagation="true"',
                                        '<% } %>', '>',
                                        '<label class="title">' + me.textGotoFootnote + '</label>',
                                        '<button id="id-menu-goto-footnote-next-' + index + '" type="button" style="float:right; margin: 2px 5px 0 0;" class="btn small btn-toolbar"><i class="icon mmerge-next">&nbsp;</i></button>',
                                        '<button id="id-menu-goto-footnote-prev-' + index + '" type="button" style="float:right; margin-top: 2px;" class="btn small btn-toolbar"><i class="icon mmerge-prev">&nbsp;</i></button>',
                                        '</div>'
                                    ].join('')),
                                    stopPropagation: true
                                }),
                                {caption: '--'},
                                {caption: me.mniDelFootnote, value: 'delele'},
                                {caption: me.mniNoteSettings, value: 'settings'}
                            ]
                        });
                        btn.setMenu(_menu);

                        me.btnsPrevNote.push(new Common.UI.Button({
                            el: $('#id-menu-goto-footnote-prev-'+index),
                            cls: 'btn-toolbar'
                        }));
                        me.btnsNextNote.push(me.mnuGotoFootNext = new Common.UI.Button({
                            el: $('#id-menu-goto-footnote-next-'+index),
                            cls: 'btn-toolbar'
                        }));

                    });

                    setEvents.call(me);
                });
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function() {
                return this.btnsContents.concat(this.btnContentsUpdate).concat(this.btnsNotes);
            },

            SetDisabled: function (state) {
                this._state.disabled = state;
                this.btnsContents.concat(this.btnsNotes).forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
                this.btnContentsUpdate.setDisabled(state);
            },

            capBtnInsContents: 'Table of Contents',
            tipContents: 'Insert table of contents',
            textContentsSettings: 'Settings',
            textContentsRemove: 'Remove table of contents',
            capBtnContentsUpdate: 'Update',
            tipContentsUpdate: 'Update table of contents',
            textUpdateAll: 'Update entire table',
            textUpdatePages: 'Update page numbers only',
            tipNotes: 'Footnotes',
            mniInsFootnote: 'Insert Footnote',
            mniDelFootnote: 'Delete All Footnotes',
            mniNoteSettings: 'Notes Settings',
            textGotoFootnote: 'Go to Footnotes',
            capBtnInsFootnote: 'Footnotes',
            confirmDeleteFootnotes: 'Do you want to delete all footnotes?'
        }
    }()), DE.Views.Links || {}));
});