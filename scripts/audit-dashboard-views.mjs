import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

var BASE_URL = "http://localhost:21300";
var SD = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/docs/qa/screenshots";
var RP = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/docs/qa/audit-report.json";
var VIEWS = ["Kanban","Agents","Workers","Terminals","Monitor","Insights","Context","Roadmap","GitHub","Settings"];

mkdirSync(SD, { recursive: true });

async function auditView(page, viewName, report) {
  var viewKey = viewName.toLowerCase();
  var entry = { rendered: false, consoleErrors: [], consoleWarnings: [], networkFailures: [], hasHorizontalScroll320: false, visibleErrorText: null, screenshotDesktop: null, screenshotMobile: null };
  var errors = [], warnings = [], networkFails = [];

  var consoleHandler = function(msg) { if (msg.type() === "error") errors.push(msg.text()); else if (msg.type() === "warning") warnings.push(msg.text()); };
  page.on("console", consoleHandler);

  var responseHandler = function(resp) { if (resp.status() >= 400) networkFails.push({ url: resp.url(), status: resp.status(), statusText: resp.statusText() }); };
  page.on("response", responseHandler);

  var reqFailHandler = function(req) { var et = req.failure() ? req.failure().errorText : "unknown"; networkFails.push({ url: req.url(), status: 0, statusText: "Failed: " + et }); };
  page.on("requestfailed", reqFailHandler);

  try {
    console.log("\n--- Auditing: " + viewName + " ---");
    var clicked = false;

    if (!clicked) { try { var btn = page.getByRole("button", { name: viewName }); await btn.waitFor({ timeout: 3000 }); await btn.click(); clicked = true; console.log("  Clicked via getByRole button"); } catch(e) { console.log("  getByRole button failed..."); } }
    if (!clicked) { try { var el = page.locator("button:has-text(\"" + viewName + "\")").first(); await el.waitFor({ timeout: 3000 }); await el.click(); clicked = true; console.log("  Clicked via button text"); } catch(e) { console.log("  Button text failed..."); } }
    if (!clicked) { try { var el = page.locator("aside >> text=\"" + viewName + "\"").first(); await el.waitFor({ timeout: 3000 }); await el.click(); clicked = true; console.log("  Clicked via aside"); } catch(e) { console.log("  Aside failed..."); } }
    if (!clicked) { try { var el = page.locator("nav >> text=\"" + viewName + "\"").first(); await el.waitFor({ timeout: 2000 }); await el.click(); clicked = true; console.log("  Clicked via nav"); } catch(e) { console.log("  Nav failed..."); } }
    if (!clicked) { try { var el = page.getByText(viewName, { exact: true }).first(); await el.waitFor({ timeout: 2000 }); await el.click(); clicked = true; console.log("  Clicked via getByText"); } catch(e) { console.log("  WARN: Could not click " + viewName); } }

    try { await page.waitForLoadState("networkidle", { timeout: 3000 }); } catch(ignored) {}
    await page.waitForTimeout(2000);

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    var dp = resolve(SD, viewKey + "-1920.png");
    await page.screenshot({ path: dp, fullPage: true });
    entry.screenshotDesktop = dp;
    console.log("  Desktop screenshot saved");

    var bc = await page.evaluate(function() { var m = document.querySelector("main") || document.querySelector("[class*=content]") || document.body; return { tl: (m.innerText || "").trim().length, cc: m.children.length }; });
    entry.rendered = bc.tl > 10 || bc.cc > 2;
    console.log("  Rendered: " + entry.rendered + " (text:" + bc.tl + " children:" + bc.cc + ")");

    var et = await page.evaluate(function() {
      var r = []; var els = document.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6, li, td");
      for (var i = 0; i < els.length; i++) {
        var el = els[i]; var s = window.getComputedStyle(el);
        if (s.display === "none" || s.visibility === "hidden") continue;
        if (el.children.length > 3) continue;
        var t = (el.innerText || "").trim();
        if (t.length > 3 && t.length < 300) {
          var l = t.toLowerCase();
          if (l.indexOf("error") >= 0 || l.indexOf("failed to") >= 0 || l.indexOf("something went wrong") >= 0 || l.indexOf("unhandled") >= 0 || l.indexOf("exception") >= 0) {
            if (l.indexOf("console.error") < 0 && l.indexOf("errors: 0") < 0 && l.indexOf("error boundary") < 0) {
              r.push(t.substring(0, 150));
            }
          }
        }
      }
      var unique = r.filter(function(v,idx,a) { return a.indexOf(v)===idx; });
      return unique.slice(0, 10);
    });
    entry.visibleErrorText = et.length > 0 ? et : null;
    if (et.length > 0) console.log("  Visible errors: " + JSON.stringify(et));

    await page.setViewportSize({ width: 320, height: 900 });
    await page.waitForTimeout(1000);
    var mp = resolve(SD, viewKey + "-320.png");
    await page.screenshot({ path: mp, fullPage: true });
    entry.screenshotMobile = mp;
    console.log("  Mobile screenshot saved");

    var hs = await page.evaluate(function() { return document.documentElement.scrollWidth > document.documentElement.clientWidth; });
    entry.hasHorizontalScroll320 = hs;
    if (hs) { var si = await page.evaluate(function() { return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }; }); console.log("  H-SCROLL at 320px! overflow: " + (si.sw - si.cw) + "px"); }

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);

  } catch (err) {
    console.error("  ERROR: " + err.message);
    errors.push("AUDIT_ERROR: " + err.message);
  }

  entry.consoleErrors = errors.slice();
  entry.consoleWarnings = warnings.slice();
  entry.networkFailures = networkFails.slice();
  page.removeListener("console", consoleHandler);
  page.removeListener("response", responseHandler);
  page.removeListener("requestfailed", reqFailHandler);
  console.log("  => Err:" + errors.length + " Warn:" + warnings.length + " Net:" + networkFails.length);
  report[viewName] = entry;
}

async function main() {
  console.log("=== AIOS Dashboard Comprehensive Audit ===");
  console.log("Target: " + BASE_URL);
  console.log("Views: " + VIEWS.join(", "));

  var browser = await chromium.launch({ headless: true });
  var context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true });
  var page = await context.newPage();

  console.log("Navigating to dashboard...");
  try { await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 15000 }); console.log("Dashboard loaded."); }
  catch (e) { console.log("Load warning: " + e.message); await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 10000 }); }
  await page.waitForTimeout(2000);

  var homePath = resolve(SD, "home-1920.png");
  await page.screenshot({ path: homePath, fullPage: true });
  console.log("Home screenshot saved");

  var report = {};
  for (var i = 0; i < VIEWS.length; i++) { await auditView(page, VIEWS[i], report); }

  console.log("\n\n========== AUDIT SUMMARY ==========\n");
  var tE=0, tW=0, tN=0, vH=0, vN=0, vV=0;
  var names = Object.keys(report);
  for (var j = 0; j < names.length; j++) {
    var nn = names[j], d = report[nn];
    tE += d.consoleErrors.length; tW += d.consoleWarnings.length; tN += d.networkFailures.length;
    if (d.hasHorizontalScroll320) vH++; if (!d.rendered) vN++; if (d.visibleErrorText) vV++;
    var st = d.rendered ? "OK" : "BLANK";
    var hs2 = d.hasHorizontalScroll320 ? "H-SCROLL" : "ok";
    console.log("  " + nn.padEnd(12) + " | " + st.padEnd(6) + " | Err:" + String(d.consoleErrors.length).padStart(3) + " | Warn:" + String(d.consoleWarnings.length).padStart(3) + " | Net:" + String(d.networkFailures.length).padStart(3) + " | " + hs2.padEnd(9) + " | VisErr:" + (d.visibleErrorText ? "YES" : "no"));
  }
  console.log("\n--- Totals ---");
  console.log("  Views:        " + VIEWS.length);
  console.log("  Not rendered: " + vN);
  console.log("  Errors:       " + tE);
  console.log("  Warnings:     " + tW);
  console.log("  Net failures: " + tN);
  console.log("  H-scroll:     " + vH);
  console.log("  Visible err:  " + vV);

  var reportData = { auditTimestamp: new Date().toISOString(), dashboardUrl: BASE_URL, viewsAudited: VIEWS.length, summary: { viewsNotRendered: vN, totalConsoleErrors: tE, totalConsoleWarnings: tW, totalNetworkFailures: tN, viewsWithHorizontalScroll: vH, viewsWithVisibleErrors: vV }, views: report };
  writeFileSync(RP, JSON.stringify(reportData, null, 2), "utf-8");
  console.log("\nReport written to: " + RP);

  await browser.close();
  console.log("\n=== Audit Complete ===");
}

main().catch(function(e) { console.error("Fatal:", e); process.exit(1); });
