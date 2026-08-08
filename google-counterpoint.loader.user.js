// ==UserScript==
// @name         Google Counterpoint
// @namespace    http://tampermonkey.net/
// @version      0.5.9
// @description  Dev loader — runs the script from disk via @require (edit the .user.js file, reload the page)
// @author       Jesse O'Chapo
// @match        https://claude.ai/*
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @connect      generativelanguage.googleapis.com
// @connect      fonts.googleapis.com
// @connect      fonts.gstatic.com
// @require      file:///ABSOLUTE/PATH/TO/google-counterpoint.user.js
// ==/UserScript==

(function () {
  'use strict';
  console.info('[Google Counterpoint] loader stub running — waiting for @require…');
  setTimeout(function () {
    if (window.__GOOGLE_COUNTERPOINT__) {
      console.info('[Google Counterpoint] disk script loaded', window.__GOOGLE_COUNTERPOINT__);
      return;
    }
    console.error(
      '[Google Counterpoint] @require FAILED — the disk file never ran.\n' +
        'Fix: chrome://extensions → Tampermonkey → Details → enable “Allow access to file URLs”, then reload this page.\n' +
        'Also confirm only this loader is enabled (disable any old pasted Gemini Counterpoint script).'
    );
  }, 800);
})();
