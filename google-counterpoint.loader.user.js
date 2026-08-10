// ==UserScript==
// @name         Google Counterpoint
// @namespace    http://tampermonkey.net/
// @version      0.6.2
// @description  Dev loader — runs the script from disk via @require (edit the .user.js file, reload the page)
// @author       Jesse O'Chapo
// @match        https://claude.ai/*
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://gemini.google.com/*
// @include      https://gemini.google.com/*
// @run-at       document-idle
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

  // Always log first — if you don't see this on gemini.google.com, Tampermonkey is not injecting.
  console.info('[Google Counterpoint] loader alive', {
    host: location.hostname,
    path: location.pathname,
    hasQ: new URLSearchParams(location.search).has('q'),
  });

  // ---------------------------------------------------------------------------
  // Gemini ?q= filler lives in the LOADER so it works even when @require is slow.
  // (Google does not natively read ?q= — a script on this page must inject it.)
  // ---------------------------------------------------------------------------
  function fillGeminiFromUrl() {
    if (!/(^|\.)gemini\.google\.com$/i.test(location.hostname)) return;

    var params = new URLSearchParams(location.search);
    var prompt = (params.get('q') || params.get('prompt') || '').trim();
    if (!prompt) {
      console.info('[Google Counterpoint] Gemini page — no ?q= in URL');
      return;
    }

    console.info('[Google Counterpoint] Gemini ?q= filler starting', { len: prompt.length });

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(prompt).catch(function () {});
      }
    } catch (e) { /* ignore */ }

    var SELECTOR =
      'rich-textarea .ql-editor[contenteditable="true"], ' +
      'div.ql-editor[contenteditable="true"], ' +
      'div[contenteditable="true"][role="textbox"]';
    var started = Date.now();
    var done = false;

    function visible(el) {
      if (!el) return false;
      var r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }

    function findInput() {
      var nodes = document.querySelectorAll(SELECTOR);
      for (var i = 0; i < nodes.length; i++) {
        if (visible(nodes[i])) return nodes[i];
      }
      return null;
    }

    function setText(el, text) {
      el.focus();
      el.innerHTML = '';
      var lines = String(text).split('\n');
      for (var i = 0; i < lines.length; i++) {
        var p = document.createElement('p');
        p.textContent = lines[i].length ? lines[i] : '\u00a0';
        el.appendChild(p);
      }
      el.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: text,
        })
      );
      el.dispatchEvent(new Event('change', { bubbles: true }));
      var got = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      return got.length >= 20;
    }

    function tick() {
      if (done) return;
      var el = findInput();
      if (!el) {
        if (Date.now() - started > 20000) {
          done = true;
          console.warn('[Google Counterpoint] Gemini input not found — paste with ⌘V');
        }
        return;
      }
      if (setText(el, prompt)) {
        done = true;
        console.info('[Google Counterpoint] Gemini composer filled from ?q=');
      } else if (Date.now() - started > 20000) {
        done = true;
        console.warn('[Google Counterpoint] Gemini fill failed — paste with ⌘V');
      }
    }

    var iv = setInterval(function () {
      tick();
      if (done) clearInterval(iv);
    }, 200);
    tick();
  }

  try {
    fillGeminiFromUrl();
  } catch (e) {
    console.warn('[Google Counterpoint] Gemini filler error', e);
  }

  setTimeout(function () {
    if (window.__GOOGLE_COUNTERPOINT__) {
      console.info('[Google Counterpoint] disk script loaded', window.__GOOGLE_COUNTERPOINT__);
      return;
    }
    console.error(
      '[Google Counterpoint] @require FAILED — the disk file never ran.\n' +
        'Fix: chrome://extensions → Tampermonkey → Details → enable “Allow access to file URLs”, then reload this page.\n' +
        'Also confirm only this loader is enabled (disable any old pasted Counterpoint script).'
    );
  }, 800);
})();
