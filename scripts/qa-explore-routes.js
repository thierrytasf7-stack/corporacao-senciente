const { chromium } = require("playwright");
const path = require("path");
const BASE_URL = "http://localhost:21300";
const SCREENSHOT_DIR = path.resolve(__dirname, "..", "docs", "qa", "screenshots");

(async () => {
  const consoleErrors = [];
  const consoleWarnings = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  page.on("console", function(msg) { if (msg.type() === "error") consoleErrors.push(msg.text()); else if (msg.type() === "warning") consoleWarnings.push(msg.text()); });
  page.on("pageerror", function(err) { consoleErrors.push("[PageError] " + err.message); });
  console.log("\n=== Navigating to " + BASE_URL + " ===\n");
  try {
    var response = await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
    console.log("Status: " + response.status() + " " + response.statusText());
    console.log("Title: " + (await page.title()));
    console.log("URL: " + page.url());
    await page.waitForTimeout(2000);
    var screenshotPath = path.join(SCREENSHOT_DIR, "home-1920.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log("\nScreenshot saved: " + screenshotPath);

    console.log("\n=== ALL LINKS ===\n");
    var allLinks = await page.evaluate(function() {
      return Array.from(document.querySelectorAll("a")).map(function(a) {
        return { href: a.href, text: (a.textContent || "").trim().substring(0, 80), ariaLabel: a.getAttribute("aria-label") || "" };
      });
    });
    if (allLinks.length === 0) console.log("  (No links found)");
    else allLinks.forEach(function(l, i) { console.log("  [" + (i+1) + "] href=" + JSON.stringify(l.href)); if (l.text) console.log("       text=" + JSON.stringify(l.text)); });

    console.log("\n=== NAVIGATION ELEMENTS ===\n");
    var navInfo = await page.evaluate(function() {
      var results = [];
      document.querySelectorAll("nav").forEach(function(nav) {
        var links = Array.from(nav.querySelectorAll("a"));
        results.push({ type: "nav", id: nav.id || "", classes: (nav.className || "").substring(0, 100), linkCount: links.length, links: links.map(function(a) { return { href: a.href, text: (a.textContent || "").trim().substring(0, 60) }; }) });
      });
      ["aside", "[role=navigation]"].forEach(function(sel) {
        document.querySelectorAll(sel).forEach(function(el) {
          var links = Array.from(el.querySelectorAll("a"));
          if (links.length > 0) results.push({ type: "sidebar(" + sel + ")", tag: el.tagName, id: el.id || "", classes: (el.className || "").substring(0, 100), linkCount: links.length, links: links.map(function(a) { return { href: a.href, text: (a.textContent || "").trim().substring(0, 60) }; }) });
        });
      });
      return results;
    });
    if (navInfo.length === 0) console.log("  (No nav elements found)");
    else navInfo.forEach(function(nav) { console.log("  [" + nav.type + "] id=" + JSON.stringify(nav.id) + " classes=" + JSON.stringify(nav.classes)); nav.links.forEach(function(l) { console.log("    - " + JSON.stringify(l.text) + " -> " + l.href); }); });

    console.log("\n=== TAB-LIKE NAVIGATION ===\n");
    var tabInfo = await page.evaluate(function() {
      var results = [];
      ["[role=tab]","[role=tablist]","button[data-state]","[data-radix-collection-item]"].forEach(function(sel) {
        var els = document.querySelectorAll(sel);
        if (els.length > 0) results.push({ selector: sel, count: els.length, items: Array.from(els).slice(0, 20).map(function(el) { return { tag: el.tagName, text: (el.textContent || "").trim().substring(0, 60), role: el.getAttribute("role") || "", dataState: el.getAttribute("data-state") || "" }; }) });
      });
      return results;
    });
    if (tabInfo.length === 0) console.log("  (No tabs found)");
    else tabInfo.forEach(function(t) { console.log("  Selector: " + JSON.stringify(t.selector) + " (" + t.count + " elements)"); t.items.forEach(function(item) { console.log("    - <" + item.tag + "> " + JSON.stringify(item.text) + " role=" + JSON.stringify(item.role) + " state=" + JSON.stringify(item.dataState)); }); });

    console.log("\n=== BUTTONS ===\n");
    var btns = await page.evaluate(function() {
      return Array.from(document.querySelectorAll("button")).filter(function(b) { var t = (b.textContent || "").trim(); return t.length > 0 && t.length < 50; }).map(function(b) { return { text: (b.textContent || "").trim().substring(0, 60), ariaLabel: b.getAttribute("aria-label") || "", dataState: b.getAttribute("data-state") || "" }; });
    });
    if (btns.length === 0) console.log("  (No buttons found)");
    else btns.forEach(function(b, i) { console.log("  [" + (i+1) + "] " + JSON.stringify(b.text) + " aria=" + JSON.stringify(b.ariaLabel) + " state=" + JSON.stringify(b.dataState)); });

    console.log("\n=== NEXT.JS ROUTE HINTS ===\n");
    var nextHints = await page.evaluate(function() {
      var hints = [];
      document.querySelectorAll("link[rel=prefetch]").forEach(function(l) { hints.push({ prefetch: l.getAttribute("href") }); });
      return hints;
    });
    if (nextHints.length === 0) console.log("  (No hints found)");
    else nextHints.forEach(function(h) { console.log("  " + JSON.stringify(h)); });

    console.log("\n=== PAGE STRUCTURE ===\n");
    var struct = await page.evaluate(function() {
      return Array.from(document.body.children).map(function(el) { return { tag: el.tagName, id: el.id || "", classes: (el.className || "").substring(0, 120), childCount: el.children.length, textPreview: (el.textContent || "").trim().substring(0, 100) }; });
    });
    struct.forEach(function(el) { console.log("  <" + el.tag + "> id=" + JSON.stringify(el.id) + " class=" + JSON.stringify(el.classes) + " children=" + el.childCount); if (el.textPreview) console.log("    text: " + JSON.stringify(el.textPreview)); });

    console.log("\n=== UNIQUE INTERNAL ROUTES ===\n");
    var routes = new Set();
    var origin = new URL(BASE_URL).origin;
    allLinks.forEach(function(l) { try { var u = new URL(l.href); if (u.origin === origin) routes.add(u.pathname); } catch(e) { if (l.href.startsWith("/")) routes.add(l.href); } });
    if (routes.size === 0) console.log("  (No internal routes found)");
    else Array.from(routes).sort().forEach(function(r) { console.log("  " + r); });

    console.log("\n=== CONSOLE ERRORS ===\n");
    if (consoleErrors.length === 0) console.log("  (No console errors)");
    else consoleErrors.forEach(function(e, i) { console.log("  [" + (i+1) + "] " + e); });

    console.log("\n=== CONSOLE WARNINGS ===\n");
    if (consoleWarnings.length === 0) console.log("  (No console warnings)");
    else { consoleWarnings.slice(0, 20).forEach(function(w, i) { console.log("  [" + (i+1) + "] " + w); }); if (consoleWarnings.length > 20) console.log("  ... and " + (consoleWarnings.length - 20) + " more"); }

  } catch (err) {
    console.error("\nFailed to load page: " + err.message);
    console.error("Make sure the dashboard is running on port 21300.");
  } finally {
    await browser.close();
  }
  console.log("\n=== DONE ===\n");
})();
