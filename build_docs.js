const fs = require('fs');
const path = require('path');

const methodsData = JSON.parse(fs.readFileSync('./docs/balex_methods_data.json', 'utf8'));

// Group methods by domain
const domains = {};
methodsData.forEach(m => {
  if (!domains[m.d]) domains[m.d] = [];
  domains[m.d].push(m);
});

console.log('Total methods:', methodsData.length);
console.log('Domains count:', Object.keys(domains).length);

// Let's create the HTML file generator
const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مستندات جامع کتابخانه BaleX | کلاینت رسمی و یوزربات پیشرفته بله</title>
  
  <!-- فونت وزیرمتن (Vazirmatn) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  
  <!-- Prism.js برای هایلایت کدها -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />

  <style>
    :root {
      --font-main: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-code: 'JetBrains Mono', monospace;
      
      /* پالت رنگی تیره */
      --bg-body: #0e1015;
      --bg-sidebar: #16181f;
      --bg-card: #1c1f28;
      --bg-card-hover: #222632;
      --bg-code: #12141a;
      --border-color: #2b303e;
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --text-muted: #6b7280;
      
      --accent-bale: #10b981;
      --accent-bale-glow: rgba(16, 185, 129, 0.25);
      --accent-discord: #5865f2;
      --accent-gold: #f59e0b;
      --accent-danger: #ef4444;
      --accent-info: #3b82f6;
      
      --sidebar-width: 290px;
      --toc-width: 230px;
      --header-height: 64px;
    }

    [data-theme="light"] {
      --bg-body: #f8fafc;
      --bg-sidebar: #ffffff;
      --bg-card: #ffffff;
      --bg-card-hover: #f1f5f9;
      --bg-code: #1e293b;
      --border-color: #e2e8f0;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-main);
      background-color: var(--bg-body);
      color: var(--text-primary);
      line-height: 1.7;
      direction: rtl;
      text-align: right;
      overflow-x: hidden;
      scroll-behavior: smooth;
    }

    /* هدر سایت */
    .site-header {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      height: var(--header-height);
      background-color: rgba(22, 24, 31, 0.88);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
    }

    [data-theme="light"] .site-header {
      background-color: rgba(255, 255, 255, 0.9);
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 800;
      font-size: 1.25rem;
    }

    .logo-badge {
      background: linear-gradient(135deg, var(--accent-bale), var(--accent-discord));
      color: #fff;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      box-shadow: 0 0 16px var(--accent-bale-glow);
    }

    .version-tag {
      font-size: 0.75rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--accent-bale);
      padding: 2px 8px;
      border-radius: 20px;
      margin-right: 8px;
    }

    .header-tools {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .search-box {
      position: relative;
    }

    .search-input {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-family: var(--font-main);
      padding: 7px 36px 7px 14px;
      border-radius: 8px;
      font-size: 0.88rem;
      width: 240px;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent-bale);
      box-shadow: 0 0 0 3px var(--accent-bale-glow);
    }

    .search-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }

    .btn-icon {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-family: var(--font-main);
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-icon:hover {
      background: var(--bg-card-hover);
      color: var(--text-primary);
      border-color: var(--accent-bale);
    }

    /* چارچوب کلی مستندات */
    .docs-container {
      display: flex;
      margin-top: var(--header-height);
      min-height: calc(100vh - var(--header-height));
    }

    /* سایدبار راست (منوی اصلی) */
    .sidebar {
      width: var(--sidebar-width);
      position: fixed;
      top: var(--header-height);
      right: 0;
      bottom: 0;
      background-color: var(--bg-sidebar);
      border-left: 1px solid var(--border-color);
      overflow-y: auto;
      padding: 24px 16px;
      z-index: 90;
    }

    .sidebar-group {
      margin-bottom: 24px;
    }

    .sidebar-title {
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      padding-right: 10px;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      margin-bottom: 3px;
      transition: all 0.15s ease;
    }

    .sidebar-link:hover {
      background-color: var(--bg-card);
      color: var(--text-primary);
      transform: translateX(-3px);
    }

    .sidebar-link.active {
      background-color: var(--accent-bale-glow);
      color: var(--accent-bale);
      font-weight: 700;
      border-right: 3px solid var(--accent-bale);
    }

    /* بخش اصلی محتوا */
    .main-content {
      flex: 1;
      margin-right: var(--sidebar-width);
      margin-left: var(--toc-width);
      padding: 40px 48px 100px;
      max-width: 980px;
    }

    /* جدول محتوای شناور چپ (TOC) */
    .toc-container {
      width: var(--toc-width);
      position: fixed;
      top: var(--header-height);
      left: 0;
      bottom: 0;
      padding: 32px 18px;
      overflow-y: auto;
      border-right: 1px solid var(--border-color);
    }

    .toc-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .toc-list {
      list-style: none;
    }

    .toc-item a {
      display: block;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.82rem;
      padding: 4px 0;
      transition: color 0.15s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toc-item a:hover {
      color: var(--accent-bale);
    }

    /* تایپوگرافی محتوا */
    h1 {
      font-size: 2.2rem;
      font-weight: 900;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #fff, #9ca3af);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    [data-theme="light"] h1 {
      background: linear-gradient(135deg, #0f172a, #475569);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    h2 {
      font-size: 1.55rem;
      font-weight: 800;
      margin: 48px 0 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    h3 {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 32px 0 14px;
      color: var(--text-primary);
    }

    h4 {
      font-size: 1.02rem;
      font-weight: 700;
      margin: 20px 0 10px;
    }

    p {
      margin-bottom: 16px;
      color: var(--text-secondary);
      font-size: 0.98rem;
    }

    ul, ol {
      margin-bottom: 18px;
      padding-right: 24px;
      color: var(--text-secondary);
    }

    li {
      margin-bottom: 8px;
    }

    /* کادرهای پیام (Callouts) */
    .callout {
      border-radius: 10px;
      padding: 16px 20px;
      margin: 20px 0;
      border-right: 4px solid;
      background-color: var(--bg-card);
    }

    .callout-tip {
      border-color: var(--accent-bale);
      background-color: rgba(16, 185, 129, 0.06);
    }

    .callout-warning {
      border-color: var(--accent-gold);
      background-color: rgba(245, 158, 11, 0.06);
    }

    .callout-info {
      border-color: var(--accent-info);
      background-color: rgba(59, 130, 246, 0.06);
    }

    .callout-title {
      font-weight: 700;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .callout-tip .callout-title { color: var(--accent-bale); }
    .callout-warning .callout-title { color: var(--accent-gold); }
    .callout-info .callout-title { color: var(--accent-info); }

    /* کارت‌های ویژگی‌ها */
    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin: 24px 0 36px;
    }

    .feature-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.25s ease;
    }

    .feature-card:hover {
      border-color: var(--accent-bale);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px var(--accent-bale-glow);
    }

    .feature-icon {
      font-size: 1.8rem;
      margin-bottom: 12px;
      display: inline-block;
    }

    .feature-card h4 {
      font-weight: 700;
      font-size: 1.05rem;
      margin-bottom: 8px;
      color: var(--text-primary);
    }

    .feature-card p {
      font-size: 0.88rem;
      color: var(--text-secondary);
      margin: 0;
    }

    /* بلوک‌های کد */
    .code-wrapper {
      position: relative;
      margin: 20px 0 28px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      background: var(--bg-code);
      direction: ltr;
      text-align: left;
    }

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      padding: 8px 16px;
      font-family: var(--font-code);
      font-size: 0.78rem;
      color: var(--text-muted);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .btn-copy {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: var(--text-secondary);
      padding: 4px 10px;
      border-radius: 5px;
      font-family: var(--font-main);
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-copy:hover {
      background: var(--accent-bale);
      color: #fff;
    }

    pre[class*="language-"] {
      margin: 0 !important;
      padding: 16px !important;
      background: transparent !important;
      font-family: var(--font-code) !important;
      font-size: 0.88rem !important;
      line-height: 1.6 !important;
      overflow-x: auto;
    }

    code {
      font-family: var(--font-code);
    }

    p code, li code {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--accent-bale);
      padding: 2px 6px;
      border-radius: 5px;
      font-size: 0.85em;
    }

    /* جدول‌ها */
    .table-container {
      overflow-x: auto;
      margin: 24px 0 32px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      text-align: right;
    }

    th {
      background: var(--bg-card);
      padding: 12px 16px;
      color: var(--text-primary);
      font-weight: 700;
      border-bottom: 1px solid var(--border-color);
    }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-secondary);
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background-color: var(--bg-card-hover);
    }

    /* متد اکسپلورر تعاملی ۶۳۶ متد */
    .explorer-box {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 24px;
      margin: 28px 0 40px;
    }

    .explorer-header {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .explorer-search-row {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .explorer-input {
      flex: 1;
      min-width: 250px;
      background: var(--bg-body);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-family: var(--font-main);
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.95rem;
    }

    .explorer-input:focus {
      outline: none;
      border-color: var(--accent-bale);
      box-shadow: 0 0 0 3px var(--accent-bale-glow);
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      background: var(--bg-body);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }

    .chip:hover, .chip.active {
      background: var(--accent-bale);
      color: #fff;
      border-color: var(--accent-bale);
    }

    .explorer-count {
      font-size: 0.88rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .methods-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      max-height: 650px;
      overflow-y: auto;
      padding-left: 4px;
    }

    .method-card {
      background: var(--bg-body);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 14px 18px;
      transition: all 0.2s ease;
    }

    .method-card:hover {
      border-color: var(--accent-bale);
      background: var(--bg-card-hover);
    }

    .method-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }

    .method-name-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .method-name {
      font-family: var(--font-code);
      font-weight: 700;
      font-size: 1.02rem;
      color: var(--accent-bale);
      direction: ltr;
      display: inline-block;
    }

    .badge-ns {
      background: rgba(88, 101, 242, 0.15);
      color: #8591f7;
      border: 1px solid rgba(88, 101, 242, 0.3);
      font-family: var(--font-code);
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .badge-domain {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .badge-service {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      font-family: var(--font-code);
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: 4px;
      direction: ltr;
    }

    .method-desc {
      font-size: 0.86rem;
      color: var(--text-secondary);
      margin-bottom: 10px;
    }

    .method-params-container {
      margin: 12px 0 14px;
      padding: 10px 14px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .params-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
    }

    .params-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-primary);
      min-width: 145px;
      padding-top: 3px;
    }

    .params-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      flex: 1;
    }

    .param-badge {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 3px 8px;
      font-family: var(--font-code);
      font-size: 0.78rem;
      direction: ltr;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .param-badge.output {
      border-color: rgba(16, 185, 129, 0.35);
      background: rgba(16, 185, 129, 0.08);
    }

    .param-badge .p-name {
      color: #38bdf8;
      font-weight: 600;
    }

    .param-badge.output .p-name {
      color: #34d399;
    }

    .param-badge .p-type {
      color: #f59e0b;
      font-size: 0.74rem;
    }

    .param-badge .p-tag {
      color: var(--text-muted);
      font-size: 0.68rem;
      background: rgba(255, 255, 255, 0.06);
      padding: 1px 5px;
      border-radius: 3px;
    }

    .param-none {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-style: italic;
    }

    .method-call-box {
      background: var(--bg-code);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 6px;
      padding: 8px 12px;
      font-family: var(--font-code);
      font-size: 0.82rem;
      color: #e2e8f0;
      direction: ltr;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .method-code-text {
      overflow-x: auto;
      white-space: nowrap;
    }

    .load-more-btn {
      width: 100%;
      background: var(--bg-body);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 12px;
      border-radius: 8px;
      margin-top: 16px;
      font-family: var(--font-main);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .load-more-btn:hover {
      background: var(--accent-bale-glow);
      border-color: var(--accent-bale);
      color: var(--accent-bale);
    }

    /* دکمه بازگشت به بالا */
    .back-to-top {
      position: fixed;
      bottom: 24px;
      left: 24px;
      background: var(--accent-bale);
      color: #fff;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px var(--accent-bale-glow);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
      z-index: 80;
    }

    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
    }

    /* ریسپانسیو موبایل */
    @media (max-width: 1120px) {
      .toc-container {
        display: none;
      }
      .main-content {
        margin-left: 0;
      }
    }

    @media (max-width: 840px) {
      .sidebar {
        transform: translateX(100%);
        transition: transform 0.3s ease;
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .main-content {
        margin-right: 0;
        padding: 24px 18px;
      }
      .search-box {
        display: none;
      }
      .menu-toggle {
        display: flex !important;
      }
    }

    .menu-toggle {
      display: none;
    }
  </style>
</head>
<body>

  <!-- هدر سایت -->
  <header class="site-header">
    <div style="display: flex; align-items: center; gap: 12px;">
      <button class="btn-icon menu-toggle" id="menuToggle" title="منو">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>
      <a href="#" class="header-logo">
        <span>BaleX</span>
        <span class="logo-badge">کتابخانه پروتکل بله</span>
        <span class="version-tag">v1.2.0</span>
      </a>
    </div>

    <div class="header-tools">
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" class="search-input" id="searchInput" placeholder="جستجو در متدها و مستندات...">
      </div>

      <button class="btn-icon" id="themeToggle" title="تغییر تم (تاریک/روشن)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </button>

      <a href="https://github.com/exactslash/balex" target="_blank" class="btn-icon btn-github">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        <span>گیت‌هاب</span>
      </a>
    </div>
  </header>

  <div class="docs-container">
    
    <!-- سایدبار راست (فهرست ناوبری) -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-group">
        <div class="sidebar-title">شروع به کار</div>
        <a href="#intro" class="sidebar-link active">معرفی کتابخانه BaleX</a>
        <a href="#features" class="sidebar-link">ویژگی‌های برجسته</a>
        <a href="#installation" class="sidebar-link">نصب و راه‌اندازی</a>
        <a href="#quickstart" class="sidebar-link">شروع سریع (Quickstart)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">مدیریت اتصال و نشست</div>
        <a href="#connection-manage" class="sidebar-link">اتصال و قطع سوکت (connect / disconnect)</a>
        <a href="#auth-start" class="sidebar-link">درخواست کد (sendCode)</a>
        <a href="#auth-validate" class="sidebar-link">تایید پیامک (signIn)</a>
        <a href="#auth-2fa" class="sidebar-link">تایید دو مرحله‌ای (signInWithPassword)</a>
        <a href="#session-restore" class="sidebar-link">بازیابی و ذخیره نشست (Session)</a>
        <a href="#auth-logout" class="sidebar-link">خروج از حساب (logout)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">پیام‌رسانی و رویدادها</div>
        <a href="#send-message" class="sidebar-link">ارسال پیام و نقل‌قول (sendMessage)</a>
        <a href="#messaging-read-receipts" class="sidebar-link">تایید تحویل و سین (markAsRead)</a>
        <a href="#live-updates" class="sidebar-link">کاتالوگ جامع رویدادها (۶۰+ ایونت زنده)</a>
        <a href="#load-dialogs" class="sidebar-link">لیست گفتگوها (loadDialogs)</a>
        <a href="#load-history" class="sidebar-link">تاریخچه چت (loadHistory)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">ارسال چندرسانه‌ای (Media)</div>
        <a href="#send-photo" class="sidebar-link">ارسال عکس (sendPhoto)</a>
        <a href="#send-voice" class="sidebar-link">ارسال ویس و صدا (sendVoice)</a>
        <a href="#send-audio" class="sidebar-link">ارسال موزیک و آهنگ (sendAudio)</a>
        <a href="#send-video" class="sidebar-link">ارسال ویدیو (sendVideo)</a>
        <a href="#send-document" class="sidebar-link">ارسال فایل و اسناد (sendDocument)</a>
        <a href="#send-sticker" class="sidebar-link">ارسال استیکر (sendSticker)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">مدیریت پیام‌ها و گفتگوها</div>
        <a href="#edit-message" class="sidebar-link">ویرایش پیام (editMessage)</a>
        <a href="#forward-messages" class="sidebar-link">فوروارد پیام‌ها (forwardMessages)</a>
        <a href="#pin-message" class="sidebar-link">پین کردن پیام (pinMessage)</a>
        <a href="#delete-messages" class="sidebar-link">حذف پیام‌ها (deleteMessages)</a>
        <a href="#clear-chat" class="sidebar-link">پاکسازی گفتگو (clearChat)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">مدیریت گروه‌ها و کانال‌ها</div>
        <a href="#group-create" class="sidebar-link">ساخت گروه جدید (createGroup)</a>
        <a href="#group-invite" class="sidebar-link">افزودن عضو (inviteMembers)</a>
        <a href="#group-kick" class="sidebar-link">اخراج عضو (kickMember)</a>
        <a href="#group-title" class="sidebar-link">تغییر عنوان گروه (setGroupTitle)</a>
        <a href="#group-leave" class="sidebar-link">ترک گروه (leaveGroup)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">کاربران، مخاطبین و پروفایل</div>
        <a href="#user-profile" class="sidebar-link">پروفایل کاربر (getUser)</a>
        <a href="#group-profile" class="sidebar-link">اطلاعات گروه (getGroup)</a>
        <a href="#contacts-list" class="sidebar-link">مخاطبین بله (getContacts)</a>
        <a href="#contacts-add" class="sidebar-link">افزودن مخاطب (addContact)</a>
        <a href="#contacts-import" class="sidebar-link">همگام‌سازی گروهی (importContacts)</a>
        <a href="#contacts-remove" class="sidebar-link">حذف مخاطب (removeContact)</a>
        <a href="#contacts-search" class="sidebar-link">جستجوی مخاطبین (searchContacts)</a>
        <a href="#profile-edit" class="sidebar-link">ویرایش نام و بیو (editName / editAbout)</a>
        <a href="#username-edit" class="sidebar-link">نام‌کاربری (editUsername / check)</a>
        <a href="#users-block" class="sidebar-link">مسدودسازی (blockUser / unblock)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">واکنش‌ها و پوشه‌ها</div>
        <a href="#reactions-set" class="sidebar-link">ثبت واکنش ایموجی (setReaction)</a>
        <a href="#reactions-remove" class="sidebar-link">حذف واکنش (removeReaction)</a>
        <a href="#reactions-get" class="sidebar-link">لیست واکنش‌ها (getReactions)</a>
        <a href="#folders-manage" class="sidebar-link">پوشه‌های گفتگو (Folders)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">پاکت‌های هدیه (Gift Packets)</div>
        <a href="#gift-packet-cash" class="sidebar-link">ارسال پاکت هدیه نقدی (sendGiftPacket)</a>
        <a href="#gift-packet-open" class="sidebar-link">باز کردن پاکت نقدی (openGiftPacket)</a>
        <a href="#gift-packet-gold" class="sidebar-link">ارسال پاکت هدیه طلا (sendGoldGiftPacket)</a>
        <a href="#gift-packet-gold-open" class="sidebar-link">باز کردن پاکت طلا (openGoldGiftPacket)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">مینی‌اپ‌ها و وب‌اپ‌ها (Mini Apps)</div>
        <a href="#miniapp-params" class="sidebar-link">ساخت پارامترهای مینی‌اپ (createMiniAppParams)</a>
        <a href="#miniapp-url" class="sidebar-link">دریافت آدرس مینی‌اپ (getMiniAppUrl)</a>
        <a href="#miniapp-hash" class="sidebar-link">هش امنیتی وب‌اپ (getWebappHash)</a>
        <a href="#miniapp-send-data" class="sidebar-link">ارسال داده به ربات (sendMiniAppData)</a>
        <a href="#miniapp-menu" class="sidebar-link">دکمه منو و متد سفارشی (Menu & Custom)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">بازوهای رسمی بله (Bale Bot API - docs.bale.ai)</div>
        <a href="#bale-bot-overview" class="sidebar-link">معرفی و ساخت کلاینت (BaleBot)</a>
        <a href="#bale-bot-polling" class="sidebar-link">دریافت آپدیت‌ها (Polling & Webhook)</a>
        <a href="#bale-bot-keyboards" class="sidebar-link">کیبوردهای شیشه‌ای و معمولی (Keyboards)</a>
        <a href="#bale-bot-payments" class="sidebar-link">کیف‌پول الکترونیکی و پرداخت (Invoices)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">نظرسنجی، استوری و زمان‌بندی</div>
        <a href="#polls-send" class="sidebar-link">ارسال نظرسنجی و کوییز (sendPoll)</a>
        <a href="#polls-manage" class="sidebar-link">مدیریت نظرسنجی (createPoll / close)</a>
        <a href="#story-manage" class="sidebar-link">استوری بله (sendStory / getStories)</a>
        <a href="#scheduler-manage" class="sidebar-link">پیام زمان‌بندی شده (scheduleMessage)</a>
        <a href="#ai-tldr" class="sidebar-link">هوش مصنوعی و خلاصه‌ساز (AI & TLDR)</a>
        <a href="#wallet-credit" class="sidebar-link">کیف پول و امتیازات (Wallet)</a>
        <a href="#bot-callback" class="sidebar-link">دکمه شیشه‌ای ربات (sendInlineCallback)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">بانکداری و خدمات مالی شتابی</div>
        <a href="#card-inquiry" class="sidebar-link">استعلام کارت مقصد (inquireDestinationPan)</a>
        <a href="#card-transfer" class="sidebar-link">انتقال وجه کارت به کارت (transferMoney)</a>
        <a href="#card-balance" class="sidebar-link">موجودی کارت (getCardBalance)</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">موتور حضور و ضد مسدودی</div>
        <a href="#presence-controls" class="sidebar-link">وضعیت آنلاین و تایپینگ (Presence)</a>
        <a href="#stealth-controls" class="sidebar-link">کنترل رفتار انسانی (Humanize)</a>
        <a href="#stealth-engine" class="sidebar-link">معماری ضد مسدودی</a>
        <a href="#anti-ban-tips" class="sidebar-link">نکات طلایی ضد بن</a>
      </div>

      <div class="sidebar-group">
        <div class="sidebar-title">پروتکل و کاتالوگ خدمات</div>
        <a href="#wire-protocol" class="sidebar-link">معماری باینری Protobuf و gRPC</a>
        <a href="#generic-rpc" class="sidebar-link">فراخوانی عمومی RPC (invoke)</a>
        <a href="#services-catalog" class="sidebar-link">کاتالوگ ۵۳ سرویس در ۱۰ حوزه</a>
        <a href="#services-explorer" class="sidebar-link">جستجوگر تعاملی ۶۳۶ متد</a>
        <a href="#errors-table" class="sidebar-link">جدول خطاهای سرور بله</a>
        <a href="#faq" class="sidebar-link">سوالات متداول (FAQ)</a>
      </div>
    </aside>

    <!-- محتوای اصلی داکیومنت -->
    <main class="main-content">
      
      <!-- بخش ۱: معرفی -->
      <section id="intro">
        <h1>کتابخانه پروتکل رسمی BaleX</h1>
        <p class="lead-text">
          کتابخانه <strong>BaleX</strong> یک پیاده‌سازی مستقل، سبک، مدرن و فوق‌العاده سریع از پروتکل ارتباطی پیام‌رسان بله (Bale Messenger) به صورت باینری (Protobuf / gRPC-Web / WebSocket) است که هم در محیط <strong>Node.js</strong> و هم در <strong>Flutter / Dart</strong> قابل استفاده می‌باشد.
        </p>

        <div class="callout callout-tip">
          <div class="callout-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            ارتباط مستقیم باینری و بدون واسطه
          </div>
          این کتابخانه برخلاف ابزارهایی چون Puppeteer یا سلنیوم، بدون باز کردن مرورگر و با ارسال مستقیم بسته‌های رمزنگاری‌شده باینری پروتکل بله با سرورهای <code>maviz-ws.bale.ai</code> تبادل داده می‌کند که موجب مصرف ناچیز رم (کمتر از ۲۰ مگابایت)، سرعت میلی‌ثانیه‌ای و امنیت بالا می‌شود.
        </div>
      </section>

      <!-- بخش ۲: ویژگی‌ها -->
      <section id="features">
        <h2>ویژگی‌های برجسته BaleX</h2>
        <div class="grid-cards">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h4>ارتباط باینری Protobuf خالص</h4>
            <p>انکود و دیکود کاملاً بومی و خالص پکت‌های پروتکل بله بدون هیچ وابستگی سنگین خارجی.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💳</div>
            <h4>عملیات بانکی شتابی</h4>
            <p>پشتیبانی کامل از کارت‌به‌کارت، استعلام شتابی نام دارنده کارت و پاکت هدیه طلای بله.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🕵️‍♂️</div>
            <h4>موتور هوشمند ضد مسدودی</h4>
            <p>شبیه‌سازی تاخیر طبیعی تایپ، تاخیر متغیر خواندن پیام‌ها، کنترل سین زدن و رفتار انسانی کامل.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🌐</div>
            <h4>۵۳ سرویس و ۶۳۶ متد</h4>
            <p>پوشش صد درصدی تمام قابلیت‌های استخراج‌شده از پروتکل رسمی بله همراه با پراکسی‌های خودکار.</p>
          </div>
        </div>
      </section>

      <!-- بخش ۳: نصب و راه‌اندازی -->
      <section id="installation">
        <h2>نصب و راه‌اندازی</h2>
        <p>شما می‌توانید بسته BaleX را بر روی پروژه‌های نودجی‌اس یا فلاتر به سادگی نصب نمایید:</p>

        <h3>نصب در Node.js / TypeScript</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>Terminal</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-bash"># نصب با npm
npm install balex

# یا نصب با yarn
yarn add balex

# یا نصب با pnpm
pnpm add balex</code></pre>
        </div>

        <h3>نصب در Flutter / Dart</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>pubspec.yaml</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-yaml">dependencies:
  flutter:
    sdk: flutter
  balex: ^1.2.0
  web_socket_channel: ^3.0.1
  http: ^1.2.2</code></pre>
        </div>
      </section>

      <!-- بخش ۴: شروع سریع -->
      <section id="quickstart">
        <h2>شروع سریع (Quickstart)</h2>
        <p>نمونه کد کامل برای اتصال، گوش دادن به پیام‌ها و پاسخ‌گویی خودکار:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Node.js)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const { BaleClient, StringSession } = require('balex');

async function main() {
  // ۱. ایجاد نمونه کلاینت با سشن ذخیره شده و رفتار انسانی
  const client = new BaleClient({
    session: new StringSession('سشن_ذخیره_شده_از_قبل'),
    humanize: true, // فعال‌سازی تاخیر و تایپ طبیعی
    logLevel: 'info'
  });

  // ۲. گوش دادن به پیام‌های ورودی
  client.on('message', async (msg) => {
    console.log(\`پیام جدید از \${msg.senderId}: \${msg.text}\`);
    if (msg.text === 'سلام') {
      // پاسخ هوشمند با شبیه‌سازی خواندن، تاخیر تایپ و ارسال
      await msg.reply('سلام و درود! پیام شما با موفقیت از طریق یوزربات BaleX دریافت شد 🌟');
    }
  });

  // ۳. اتصال به شبکه وب‌سوکت بله
  await client.connect();
  console.log('یوزربات با موفقیت آنلاین شد!');
}

main().catch(console.error);</code></pre>
        </div>
      </section>

      <!-- بخش مدیریت اتصال و نشست -->
      <section id="connection-manage">
        <h2>مدیریت اتصال و نشست (Connection & Session Lifecycle)</h2>
        <p>متدهای مدیریت چرخه حیات کلاینت و وضعیت اتصال به سرورهای بله:</p>

        <h3>اتصال به سرور وب‌سوکت (connect)</h3>
        <p>متد <code>client.connect()</code> اتصال بلادرنگ به سرور وب‌سوکت ماویز (<code>wss://maviz-ws.bale.ai/ws/</code>) را با استفاده از شناسه کاربر و JWT برقرار می‌کند و دریافت زنده رویدادها را آغاز می‌نماید:</p>
        
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// اتصال و ثبت هارت‌بیت حضور آنلاین
await client.connect();
console.log('وضعیت اتصال:', client.isConnected); // true</code></pre>
        </div>

        <h3>قطع اتصال سوکت (disconnect)</h3>
        <p>متد <code>client.disconnect()</code> ارتباط زنده را به شکل استاندارد خاتمه داده، تایمرهای هارت‌بیت را متوقف و منابع حافظه را آزاد می‌کند:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">client.disconnect();
console.log('اتصال قطع شد. وضعیت:', client.isConnected); // false</code></pre>
        </div>
      </section>

      <!-- بخش احراز هویت -->
      <section id="auth-start">
        <h2>احراز هویت و ورود به حساب (Authentication)</h2>
        <p>
          فرآیند لاگین در پیام‌رسان بله در دو الی سه مرحله به صورت درخواست‌های <code>gRPC-Web Unary</code> روی سرور رسمی <code>https://maviz-ws.bale.ai</code> انجام می‌شود.
        </p>

        <h3>مرحله ۱: درخواست ارسال پیامک (sendCode)</h3>
        <p>متد <code>client.sendCode(phoneNumber)</code> کد تایید ورود را به شماره همراه کاربر ارسال می‌کند و شناسه تراکنش امنیتی <code>transactionHash</code> را بازمی‌گرداند:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// شماره همراه با صفر، بدون صفر یا پیشوند بین‌المللی پذیرفته می‌شود
const res = await client.sendCode('09372570490');
console.log('کد پیامک شد. شناسه تراکنش:', res.transactionHash);</code></pre>
        </div>

        <div class="code-wrapper">
          <div class="code-header">
            <span>Dart / Flutter</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-dart">final client = BaleSocketClient();
final txHash = await client.startPhoneAuth('09372570490');
print('شناسه تراکنش: $txHash');</code></pre>
        </div>
      </section>

      <section id="auth-validate">
        <h3>مرحله ۲: اعتبارسنجی کد ۵ رقمی (signIn)</h3>
        <p>
          متد <code>client.signIn(code, transactionHash)</code> کد ۵ رقمی دریافتی از پیامک را ارسال نموده و در صورت صحت، سشن را ایجاد و کلاینت را متصل می‌کند. ارقام فارسی (مانند <code>۱۵۰۱۱</code>) به طور خودکار به ارقام انگلیسی تبدیل می‌گردند:
        </p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">try {
  const result = await client.signIn('15011');
  console.log('ورود موفقیت‌آمیز بود!');
  console.log('نام حساب:', result.user.name);
  console.log('توکن JWT:', result.jwt);
} catch (error) {
  if (error.message.includes('PHONE_PASSWORD_INVALID')) {
    console.log('حساب دارای تایید دومرحله‌ای است؛ مرحله بعد را اجرا کنید.');
  } else {
    console.error('خطای ورود:', error.message);
  }
}</code></pre>
        </div>

        <div class="code-wrapper">
          <div class="code-header">
            <span>Dart / Flutter</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-dart">final res = await client.validateCode(
  code: '15011',
  transactionHash: txHash,
);
print('خوش آمدید: \${res.name} (شناسه: \${res.id})');
print('توکن احراز هویت: \${res.jwt}');</code></pre>
        </div>
      </section>

      <section id="auth-2fa">
        <h3>مرحله ۳: تایید رمز دومرحله‌ای (signInWithPassword)</h3>
        <p>در صورتی که حساب کاربر دارای گذرواژه ابری دومرحله‌ای (۲FA) باشد، با متد <code>client.signInWithPassword(password, transactionHash)</code> احراز هویت را کامل کنید:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const session = await client.signInWithPassword('رمز_دومرحله‌ای_حساب');
console.log('لاگین دو مرحله‌ای تکمیل شد. خوش آمدید:', session.user.name);</code></pre>
        </div>
      </section>

      <section id="session-restore">
        <h3>ذخیره و بازیابی نشست (Session Persistence)</h3>
        <p>نیازی به ورود مجدد و دریافت پیامک در هر بار اجرای برنامه نیست؛ BaleX از دو کلاس <code>StringSession</code> و <code>FileSession</code> پشتیبانی می‌کند:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const { BaleClient, StringSession, FileSession } = require('balex');

// ذخیره سشن به صورت یک رشته متنی فشرده
const sessionString = client.session.save();
console.log('سشن شما:', sessionString);

// استفاده مجدد در اجراهای بعدی بدون نیاز به کد پیامکی:
const bot = new BaleClient({
  session: new StringSession(sessionString)
});

await bot.connect();
console.log('ورود خودکار با موفقیت انجام شد!');</code></pre>
        </div>
      </section>

      <section id="auth-logout">
        <h3>خروج از حساب کاربری (logout)</h3>
        <p>متد <code>client.logout()</code> درخواست لغو سشن رسمی (<code>SignOut</code>) را به سرورهای بله ارسال نموده، توکن محلی را پاکسازی و سوکت را می‌بندد:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.logout();
console.log('با موفقیت از حساب کاربری خارج شدید.');</code></pre>
        </div>
      </section>

      <!-- بخش پیام‌رسانی -->
      <section id="send-message">
        <h2>پیام‌رسانی و گفتگوها (Messaging)</h2>
        <p>ارسال پیام متنی با پشتیبانی کامل از ریپلای، کوت (نقل‌قول) و شبیه‌سازی هوشمند تاخیر انسانی:</p>

        <h3>ارسال پیام پیشرفته (sendMessage)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. ارسال پیام ساده به کاربر یا گروه
await client.sendMessage(123456789, 'سلام! پیام ارسال‌شده از طریق BaleX 🚀');

// ۲. ارسال با ریپلای به پیام دیگر و تعیین مدت شبیه‌سازی تایپ
await client.sendMessage(123456789, 'پاسخ به سوال شما...', {
  replyToMessageId: 987654321012n,
  simulateTyping: true,
  typingDuration: 2500 // ۲.۵ ثانیه نمایش در حال تایپ
});</code></pre>
        </div>

        <h3>ارسال پیام متنی سریع (sendTextMessage)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ارسال پیام به چت خصوصی (کاربر)
await client.sendTextMessage(123456789, 'سلام کاربر گرامی');

// ارسال پیام به گروه با مشخص کردن آرگومان isGroup = true
await client.sendTextMessage(987654321, 'اطلاعیه جدید گروه', true);</code></pre>
        </div>
      </section>

      <section id="messaging-read-receipts">
        <h3>تایید تحویل و خوانده‌شدن پیام‌ها (Read Receipts)</h3>
        <p>ارسال سیگنال دریافت (یک تیک خاکستری) و خوانده شدن (دو تیک آبی):</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const peer = { type: 1, id: 123456789 }; // کاربر مقصد
const messageDate = Date.now();

// ثبت وضعیت دریافت توسط کلاینت (Delivered)
await client.markAsReceived(peer, messageDate);

// ثبت وضعیت خوانده‌شدن (Seen / دو تیک آبی)
await client.markAsRead(peer, messageDate);</code></pre>
        </div>
      </section>

      <section id="live-updates">
        <h2>سامانه جامع رویدادها و کاتالوگ ۶۰+ رویداد زنده سوکت</h2>
        <p>
          کتابخانه BaleX از طریق استریم اختصاصی WebSocket (بر بستر <code>bale.messaging.v2.Messaging</code>) از تمامی بیش از ۶۰ رویداد رسمی پروتکل بله پشتیبانی می‌کند. در ادامه جدول دسته‌بندی شده کامل رویدادها، تگ‌های وایر، و کدهای نمونه هر بخش آورده شده است.
        </p>

        <h3>کاتالوگ جامع و دسته‌بندی شده بیش از ۶۰ رویداد رسمی بله</h3>
        <div class="table-container" style="overflow-x: auto; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: right;">
            <thead>
              <tr style="background: var(--bg-card); border-bottom: 2px solid var(--border-color);">
                <th style="padding: 12px; font-weight: 700;">نام رویداد (Event)</th>
                <th style="padding: 12px; font-weight: 700;">تگ وایر (Tag)</th>
                <th style="padding: 12px; font-weight: 700;">دسته‌بندی</th>
                <th style="padding: 12px; font-weight: 700;">شرح و کاربرد در بله</th>
              </tr>
            </thead>
            <tbody>
              <!-- پیام‌ها و گفتگوها -->
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>message</code></td><td>55</td><td>پیام‌رسانی</td><td>دریافت پیام جدید (متنی، چندرسانه‌ای، پاکت هدیه، سرویس) با متدهای هوشمند</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageEdit</code></td><td>162</td><td>پیام‌رسانی</td><td>ویرایش متن، کپشن یا محتوای پیام ارسال‌شده</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageDelete</code></td><td>46</td><td>پیام‌رسانی</td><td>حذف یک یا چند پیام در گفتگو توسط کاربر یا مدیر</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>chatClear</code></td><td>47</td><td>پیام‌رسانی</td><td>پاکسازی کامل تاریخچه گفتگو برای دو طرف</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>chatDelete</code></td><td>48</td><td>پیام‌رسانی</td><td>حذف کل گفتگو از لیست چت‌ها</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageReceived</code></td><td>54</td><td>پیام‌رسانی</td><td>تایید رسیدن پیام به دستگاه مقصد (تک‌تیک خاکستری)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageRead</code></td><td>19</td><td>پیام‌رسانی</td><td>تایید خوانده شدن پیام توسط مخاطب (دو تیک آبی)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageReadByMe</code></td><td>50</td><td>پیام‌رسانی</td><td>علامت‌گذاری پیام به عنوان خوانده‌شده توسط اکانت خودمان</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>chatShow</code></td><td>93</td><td>پیام‌رسانی</td><td>خروج گفتگو از حالت مخفی و نمایش مجدد در لیست چت‌ها</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>chatArchive</code></td><td>94</td><td>پیام‌رسانی</td><td>آرشیو شدن گفتگو یا پوشه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>chatFavourite</code></td><td>95</td><td>پیام‌رسانی</td><td>افزودن گفتگو به برگزیده‌ها (Favorite)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageDateChanged</code></td><td>163</td><td>پیام‌رسانی</td><td>تغییر برچسب زمانی پیام</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>stickerCollectionsChanged</code></td><td>164</td><td>پیام‌رسانی</td><td>به‌روزرسانی کالکشن‌ها و پکیج‌های استیکر کاربر</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageQuotedChanged</code></td><td>169</td><td>پیام‌رسانی</td><td>تغییر یا حذف پیام مرجع ریپلای شده</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>mentionReadByMe</code></td><td>52829</td><td>پیام‌رسانی</td><td>سین شدن پیام‌های حاوی منشن کاربر</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>pinnedDialogsChanged</code></td><td>52830</td><td>پیام‌رسانی</td><td>تغییر در لیست یا ترتیب گفتگوهای پین‌شده</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>dialogsMarkedAsRead</code></td><td>54335</td><td>پیام‌رسانی</td><td>علامت‌گذاری گروهی گفتگوها به عنوان خوانده‌شده</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>dialogsMarkedAsUnread</code></td><td>54336</td><td>پیام‌رسانی</td><td>علامت‌گذاری گروهی چت‌ها به عنوان خوانده‌نشده</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>dialogsUnpinned</code></td><td>54339</td><td>پیام‌رسانی</td><td>برداشته شدن سنجاق و پین گفتگو</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messagePinned</code></td><td>54340</td><td>پیام‌رسانی</td><td>پین و سنجاق شدن پیام جدید در گروه یا کانال</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messagesUnPinned</code></td><td>54341</td><td>پیام‌رسانی</td><td>برداشته شدن سنجاق یک یا چند پیام</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>dialogArchiveStatus</code></td><td>54345</td><td>پیام‌رسانی</td><td>تغییر وضعیت فعال/غیرفعال آرشیو گفتگو</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageStreamChunks</code></td><td>54351</td><td>پیام‌رسانی</td><td>دریافت بسته‌های زنده متن تولیدی هوش مصنوعی یا استریم (Streaming)</td></tr>

              <!-- واکنش‌ها -->
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>reaction</code></td><td>222 / 52825</td><td>واکنش‌ها</td><td>ثبت، تغییر یا حذف واکنش ایموجی روی پیام توسط کاربران</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageNewReaction</code></td><td>54323</td><td>واکنش‌ها</td><td>ثبت واکنش جدید با جزئیات کامل کاربر و ایموجی</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>messageReactionsReadByMe</code></td><td>52832</td><td>واکنش‌ها</td><td>سین شدن واکنش‌های ثبت‌شده توسط کاربر</td></tr>

              <!-- تایپینگ و حضور -->
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>typing</code></td><td>6</td><td>حضور و وضعیت</td><td>شروع تایپ، ضبط صدا، ارسال ویدیو یا آپلود فایل توسط مخاطب</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>typingStop</code></td><td>81</td><td>حضور و وضعیت</td><td>توقف وضعیت در حال نوشتن مخاطب</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userOnline</code></td><td>7</td><td>حضور و وضعیت</td><td>آنلاین شدن کاربر در پلتفرم بله</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userOffline</code></td><td>8</td><td>حضور و وضعیت</td><td>آفلاین شدن کاربر همراه با برچسب زمانی آخرین بازدید</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userLastSeen</code></td><td>9</td><td>حضور و وضعیت</td><td>تغییر در تنظیمات حریم خصوصی یا وضعیت آخرین بازدید کاربر</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>presence</code></td><td>Alias</td><td>حضور و وضعیت</td><td>شنونده سراسری هرگونه تغییر وضعیت آنلاین/آفلاین/بازدید</td></tr>

              <!-- کاربران و مخاطبین -->
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userAvatarChanged</code></td><td>16</td><td>کاربر و نمایه</td><td>تغییر یا حذف عکس پروفایل کاربر</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userNameChanged</code></td><td>32</td><td>کاربر و نمایه</td><td>تغییر نام و نام‌خانوادگی نمایشی کاربر</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userLocalNameChanged</code></td><td>51</td><td>کاربر و نمایه</td><td>تغییر نام ذخیره شده مخاطب در دفترچه تلفن</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userContactsChanged</code></td><td>134</td><td>کاربر و نمایه</td><td>به‌روزرسانی لیست مخاطبین همگام‌شده</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userNickChanged</code></td><td>209</td><td>کاربر و نمایه</td><td>تغییر یا ثبت نام‌کاربری عمومی (Username)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userAboutChanged</code></td><td>210</td><td>کاربر و نمایه</td><td>تغییر بیوگرافی (About / Bio) نمایه کاربر</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userPreferredLanguagesChanged</code></td><td>212</td><td>کاربر و نمایه</td><td>تغییر زبان مورد نظر کاربر در تنظیمات بله</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userTimeZoneChanged</code></td><td>216</td><td>کاربر و نمایه</td><td>تغییر منطقه زمانی حساب کاربری</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userBotCommandsChanged</code></td><td>217</td><td>کاربر و نمایه</td><td>تغییر در لیست دستورات ثبت‌شده برای ربات</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userBlocked</code></td><td>2629</td><td>کاربر و نمایه</td><td>مسدودسازی یک کاربر (بلاک)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userUnblocked</code></td><td>2630</td><td>کاربر و نمایه</td><td>رفع مسدودیت کاربر (آنبلاک)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>phoneNumberChanged</code></td><td>52803</td><td>کاربر و نمایه</td><td>تغییر شماره تلفن همراه متصل به حساب کاربری</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>contactsAdded</code></td><td>40</td><td>کاربر و نمایه</td><td>افزوده شدن مخاطب جدید به دفترچه تلفن</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>contactsRemoved</code></td><td>41</td><td>کاربر و نمایه</td><td>حذف مخاطب از دفترچه تلفن بله</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>allContactsRemoved</code></td><td>54353</td><td>کاربر و نمایه</td><td>پاکسازی کامل تمام مخاطبین حساب</td></tr>

              <!-- گروه‌ها و کانال‌ها -->
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupOnline</code></td><td>33</td><td>گروه و کانال</td><td>تغییر تعداد اعضای آنلاین گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupNicknameChanged</code></td><td>57</td><td>گروه و کانال</td><td>تغییر آیدی یا لینک عمومی گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupMessagePinned</code></td><td>721</td><td>گروه و کانال</td><td>پین شدن پیام جدید در گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupPinRemoved</code></td><td>722</td><td>گروه و کانال</td><td>برداشته شدن سنجاق پیام گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupRestrictionChanged</code></td><td>723</td><td>گروه و کانال</td><td>تغییر در محدودیت‌های اعمال‌شده روی گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupTitleChanged</code></td><td>2609</td><td>گروه و کانال</td><td>تغییر عنوان و نام گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupAvatarChanged</code></td><td>2610</td><td>گروه و کانال</td><td>تغییر عکس نمایه و آواتار گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupMemberChanged</code></td><td>2612</td><td>گروه و کانال</td><td>تغییر وضعیت یا نقش عضو در گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupExtChanged</code></td><td>2613</td><td>گروه و کانال</td><td>تغییر اکستنشن‌ها و ویژگی‌های تکمیلی گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupMembersUpdated</code></td><td>2614</td><td>گروه و کانال</td><td>به‌روزرسانی جامع لیست اعضای گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupTopicChanged</code></td><td>2616</td><td>گروه و کانال</td><td>تغییر موضوع یا دسته‌بندی موضوعی گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupAboutChanged</code></td><td>2617</td><td>گروه و کانال</td><td>تغییر توضیحات و بیوگرافی گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupOwnerChanged</code></td><td>2619</td><td>گروه و کانال</td><td>انتقال مالکیت اصلی گروه به کاربر دیگر</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupHistoryShared</code></td><td>2620</td><td>گروه و کانال</td><td>تغییر وضعیت دسترسی اعضای جدید به تاریخچه چت</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupMembersCountChanged</code></td><td>2622</td><td>گروه و کانال</td><td>تغییر تعداد کل اعضای گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupMemberDiff</code></td><td>2623</td><td>گروه و کانال</td><td>رویداد پیوستن یا خروج عضو به گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupCanSendMessagesChanged</code></td><td>2624</td><td>گروه و کانال</td><td>تغییر مجوز ارسال پیام اعضا (بستن یا باز کردن چت)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupCanViewMembersChanged</code></td><td>2625</td><td>گروه و کانال</td><td>تغییر مجوز دیدن لیست اعضا توسط کاربران عادی</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupCanInviteMembersChanged</code></td><td>2626</td><td>گروه و کانال</td><td>تغییر دسترسی اعضا جهت دعوت دیگران</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupMemberAdminChanged</code></td><td>2627</td><td>گروه و کانال</td><td>ارتقا به مدیر یا تنزل مقام در گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupBecameOrphaned</code></td><td>2628</td><td>گروه و کانال</td><td>بدون مالک و مدیر شدن گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupMemberPermissionsChanged</code></td><td>52804</td><td>گروه و کانال</td><td>تغییر ریزمجوزهای یک عضو خاص در گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupDefaultPermissionsChanged</code></td><td>52805</td><td>گروه و کانال</td><td>تغییر مجوزهای پیش‌فرض عمومی گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>channelNickChanged</code></td><td>2880</td><td>گروه و کانال</td><td>تغییر نام‌کاربری یا شناسه عمومی کانال</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>channelAdvertisementTypeChanged</code></td><td>52801</td><td>گروه و کانال</td><td>تغییر نوع تبلیغات فعال درون کانال</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>channelAdTagIdChanged</code></td><td>52802</td><td>گروه و کانال</td><td>تغییر شناسه تگ‌های تبلیغاتی کانال</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>channelSignMessagesChanged</code></td><td>54354</td><td>گروه و کانال</td><td>فعال یا غیرفعال شدن امضای نام نویسنده در کانال</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>slowModeChanged</code></td><td>54355</td><td>گروه و کانال</td><td>تنظیم حالت آرام (Slow Mode) و تاخیر ارسال پیام اعضا</td></tr>

              <!-- تماس‌ها -->
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>callStarted</code></td><td>52807</td><td>تماس‌ها</td><td>شروع تماس صوتی یا تصویری</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>callAccepted</code></td><td>52808</td><td>تماس‌ها</td><td>پذیرش و برقراری تماس توسط مخاطب</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>callDiscarded</code></td><td>52809</td><td>تماس‌ها</td><td>قطع شدن، رد یا پایان یافتن تماس</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>callReceived</code></td><td>52810</td><td>تماس‌ها</td><td>دریافت زنگ تماس ورودی</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupCallStarted</code></td><td>52811</td><td>تماس‌ها</td><td>شروع تماس گروهی درون گروه یا کانال</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupCallEnded</code></td><td>52812</td><td>تماس‌ها</td><td>پایان تماس صوتی یا تصویری گروهی</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>callReactionSent</code></td><td>52813</td><td>تماس‌ها</td><td>ارسال واکنش ایموجی حین مکالمه زنده</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>callUpgraded</code></td><td>52816</td><td>تماس‌ها</td><td>ارتقای تماس دو نفره به تماس گروهی</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>peersInvited</code></td><td>52817</td><td>تماس‌ها</td><td>دعوت کاربران جدید به تماس در حال اجرا</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>multiPeerCallStarted</code></td><td>52818</td><td>تماس‌ها</td><td>آغاز کنفرانس و تماس چندطرفه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>peersStateChanged</code></td><td>52819</td><td>تماس‌ها</td><td>تغییر وضعیت اعضا در تماس (میکروفون، دوربین، ...)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>call</code></td><td>Alias</td><td>تماس‌ها</td><td>شنونده جامع و یکپارچه تمامی رویدادهای تماس</td></tr>

              <!-- پاکت‌های هدیه و پیام‌های سرویس -->
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>giftPacket</code></td><td>Custom</td><td>پاکت هدیه</td><td>دریافت پیام پاکت هدیه نقدی ریالی در گفتگو</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>goldGiftPacket</code></td><td>Custom</td><td>پاکت هدیه</td><td>دریافت پیام پاکت هدیه طلای بله در گفتگو</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>giftPacketOpened</code></td><td>Service 17/18</td><td>پاکت هدیه</td><td>رویداد باز شدن پاکت هدیه توسط یکی از کاربران و دریافت مبلغ</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>miniAppData</code></td><td>Service 21</td><td>مینی‌اپ</td><td>دریافت داده‌های ارسال‌شده از مینی‌اپ/وب‌اپ به ربات</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>serviceMessage</code></td><td>Tag 11</td><td>پیام سرویس</td><td>پیام‌های سیستمی بله (عضویت، اخراج، تغییر عنوان، ...)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>groupCreated</code></td><td>Service 1</td><td>پیام سرویس</td><td>رویداد ساخته شدن گروه جدید</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userInvited</code></td><td>Service 2</td><td>پیام سرویس</td><td>رویداد افزوده شدن کاربر جدید به گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userKicked</code></td><td>Service 3</td><td>پیام سرویس</td><td>رویداد اخراج کاربر از گروه</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>userLeft</code></td><td>Service 4</td><td>پیام سرویس</td><td>رویداد ترک گروه توسط عضو</td></tr>

              <!-- چرخه حیات اتصال -->
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>connected</code></td><td>Lifecycle</td><td>سوکت</td><td>اتصال موفق به سرور WebSocket و شروع نشست کاربری</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>disconnected</code></td><td>Lifecycle</td><td>سوکت</td><td>قطع ارتباط سوکت همراه با کد و دلیل قطع</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>status</code></td><td>Lifecycle</td><td>سوکت</td><td>تغییر وضعیت کانکشن (CONNECTING, CONNECTED, ...)</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>error</code></td><td>Error</td><td>خطاها</td><td>بروز هرگونه خطای شبکه، اعتبارسنجی یا سرور</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 10px;"><code>update</code></td><td>Universal</td><td>سوکت</td><td>دریافت فریم خام تمام به‌روزرسانی‌های ورودی سوکت</td></tr>
            </tbody>
          </table>
        </div>

        <h3>ویژگی‌ها و هلپرهای عملیاتی پیشرفته رویداد <code>message</code></h3>
        <p>
          شیء دریافتی در رویداد <code>message</code> مجهز به ده‌ها پرچم نوع محتوا و توابع عملیاتی جهت پاسخگویی سریع، واکنش، باز کردن پاکت هدیه و مدیریت پیام است:
        </p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">client.on('message', async (msg) => {
  console.log('فرستنده:', msg.senderId);
  console.log('مخاطب/گفتگو:', msg.peer);
  console.log('متن پیام یا کپشن:', msg.text);
  console.log('شناسه تصادفی (Random ID):', msg.randomId);
  console.log('زمان ارسال:', msg.date);

  // پرچم‌های محتوا
  if (msg.isPhoto) console.log('پیام حاوی تصویر است 📸');
  if (msg.isVoice) console.log('پیام حاوی ویس است 🎙️');
  if (msg.isAudio) console.log('پیام حاوی موزیک است 🎵');
  if (msg.isVideo) console.log('پیام حاوی ویدیو است 🎥');
  if (msg.isDocument) console.log('پیام حاوی سند یا فایل است 📄');
  if (msg.isSticker) console.log('پیام حاوی استیکر است ✨');

  // ۱. بررسی و باز کردن خودکار پاکت هدیه نقدی ریالی
  if (msg.isGiftPacket) {
    console.log('پاکت هدیه نقدی رسید! مبلغ کل:', msg.giftPacket.totalAmount, 'ریال');
    const claimRes = await msg.claimGiftPacket(); // یا msg.openGiftPacket()
    console.log('مبلغ برنده شده شما:', claimRes.amount, 'ریال');
    console.log('لیست برندگان:', await msg.getGiftPacketReceivers());
  }

  // ۲. بررسی و باز کردن خودکار پاکت هدیه طلا
  if (msg.isGoldGiftPacket) {
    console.log('پاکت طلای بله رسید! شناسه:', msg.goldGiftPacket.packetId);
    const goldWin = await msg.claimGoldGiftPacket(); // یا msg.openGoldGiftPacket()
    console.log('میلی‌گرم طلای برنده شده:', goldWin.amount);
    console.log('شناسه‌های برندگان طلا:', await msg.getGoldWinners());
  }

  // ۳. پاسخ هوشمند با شبیه‌سازی رفتار انسانی (Seen -> Thinking -> Typing -> Send)
  if (msg.text === 'سلام') {
    await msg.reply('درود! چطور می‌تونم کمکتون کنم؟ 👋');
  }

  // ۴. ارسال تایید تحویل و خوانده‌شدن
  await msg.markAsReceived(); // تیک خاکستری
  await msg.markAsRead();     // دو تیک آبی

  // ۵. ثبت واکنش ایموجی
  await msg.react('❤️');

  // ۶. پین، فوروارد و حذف پیام
  // await msg.forwardTo(targetPeer);
  // await msg.pin();
  // await msg.delete();
});</code></pre>
        </div>

        <h3>کد نمونه شنونده‌های دسته‌های مختلف رویدادهای زنده سوکت</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. رویدادهای ویرایش، حذف و پیام پین‌شده
client.on('messageEdit', (edit) => console.log(\`پیام \${edit.rid} ویرایش شد:\`, edit.message));
client.on('messageDelete', (del) => console.log(\`پیام‌های \${del.rids} حذف شدند.\`));
client.on('messagePinned', (pin) => console.log(\`پیام جدید در چت پین شد:\`, pin));

// ۲. تیک دریافت و خوانده شدن
client.on('messageReceived', (recv) => console.log(\`تحویل تا \${recv.startDate} (تک‌تیک)\`));
client.on('messageRead', (read) => console.log(\`خوانده شدن تا \${read.startDate} (دو تیک آبی)\`));

// ۳. واکنش‌ها (Reactions)
client.on('reaction', (react) => console.log(\`تغییر واکنش پیام \${react.rid}:\`, react.reactions));
client.on('messageNewReaction', (r) => console.log(\`ری‌اکشن جدید از کاربر \${r.userId}: \${r.code}\`));

// ۴. تایپینگ و حضور کاربر
client.on('typing', (t) => console.log(\`کاربر \${t.userId} در حال نوشتن...\`));
client.on('typingStop', (t) => console.log(\`کاربر \${t.userId} از تایپ دست کشید.\`));
client.on('userOnline', (u) => console.log(\`🟢 کاربر \${u.userId} آنلاین شد.\`));
client.on('userOffline', (u) => console.log(\`🔴 کاربر \${u.userId} آفلاین شد. آخرین بازدید: \${new Date(Number(u.lastSeen))}\`));

// ۵. گروه‌ها و کانال‌ها
client.on('groupTitleChanged', (g) => console.log(\`عنوان گروه به \${g.title} تغییر کرد.\`));
client.on('groupMemberDiff', (m) => console.log(\`تغییرات اعضای گروه:\`, m));
client.on('groupMemberAdminChanged', (a) => console.log(\`تغییر مقام ادمین:\`, a));
client.on('slowModeChanged', (s) => console.log(\`تنظیم تاخیر ارسال گروه (SlowMode): \${s.seconds} ثانیه\`));

// ۶. تماس‌های صوتی و تصویری
client.on('callStarted', (c) => console.log(\`تماس جدید آغاز شد:\`, c));
client.on('callAccepted', (c) => console.log(\`تماس برقرار شد:\`, c));
client.on('callDiscarded', (c) => console.log(\`تماس پایان یافت:\`, c));

// ۷. پاکت‌های هدیه و مینی‌اپ‌ها
client.on('giftPacketOpened', (open) => console.log(\`پاکت هدیه توسط کاربر \${open.receiverUserId} باز شد. مبلغ: \${open.amount} ریال\`));
client.on('miniAppData', (app) => console.log(\`داده دریافتی از مینی‌اپ:\`, app.data));

// ۸. چرخه حیات اتصال سوکت
client.on('connected', (info) => console.log(\`✅ اتصال زنده برقرار شد (UID: \${info.uid})\`));
client.on('disconnected', (evt) => console.warn(\`⚠️ اتصال قطع شد (کد \${evt.code}): \${evt.reason}\`));
client.on('error', (err) => console.error('خطای سوکت:', err));

await client.connect();</code></pre>
        </div>
      </section>

      <section id="load-dialogs">

      <section id="load-dialogs">
        <h3>دریافت لیست گفتگوها (loadDialogs)</h3>
        <p>متد <code>client.loadDialogs(limit, endDate)</code> آخرین گفتگوها، گروه‌ها و کانال‌های کاربر را همراه با آخرین پیام بارگذاری می‌نماید:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const result = await client.loadDialogs(20);

result.dialogs?.forEach(d => {
  console.log(\`چت: \${d.title || d.peer?.id} | آخرین پیام: \${d.lastMessage?.textMessage?.text}\`);
});</code></pre>
        </div>
      </section>

      <section id="load-history">
        <h3>تاریخچه پیام‌های چت (loadHistory)</h3>
        <p>متد <code>client.loadHistory(peer, limit, date)</code> برای دریافت پیام‌های قبلی چت خصوصی یا گروه به همراه پیمایش تاریخچه (Pagination):</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// دریافت ۵۰ پیام آخر
const history = await client.loadHistory(123456789, 50);

history.messages?.forEach(m => {
  console.log(\`[\${m.date}] \${m.senderId}: \${m.message?.textMessage?.text}\`);
});</code></pre>
        </div>
      </section>

      <!-- بخش رسانه‌ها -->
      <section id="send-photo">
        <h2>ارسال چندرسانه‌ای (Media Messaging)</h2>
        <p>پشتیبانی کامل از ساختار پروتوباف بله (Document تگ ۴ با فرمت‌های DocumentEx):</p>

        <h3>ارسال عکس با پیش‌نمایش و کپشن (sendPhoto)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.sendPhoto(peerId, {
  fileId: 1048576,
  accessHash: 9876543210123456n,
  fileSize: 245000,
  name: 'image.jpg',
  width: 1280,
  height: 720,
  caption: 'تصویر ارسالی از BaleX 📸'
});</code></pre>
        </div>
      </section>

      <section id="send-voice">
        <h3>ارسال پیام صوتی و ویس (sendVoice)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.sendVoice(peerId, {
  fileId: 2097152,
  accessHash: 8765432109876543n,
  fileSize: 64000,
  duration: 12, // ۱۲ ثانیه
  waveForm: Buffer.from([0x01, 0x05, 0x1a, 0x22, 0x08]),
  caption: 'پیام صوتی راهنما 🎙️'
});</code></pre>
        </div>
      </section>

      <section id="send-audio">
        <h3>ارسال موزیک و آهنگ (sendAudio)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.sendAudio(peerId, {
  fileId: 3145728,
  accessHash: 7654321098765432n,
  fileSize: 5240000,
  duration: 215, // ثانیه
  name: 'track.mp3',
  title: 'قطعه موسیقی زیبا',
  performer: 'نام هنرمند',
  caption: 'موزیک ارسالی 🎵'
});</code></pre>
        </div>
      </section>

      <section id="send-video">
        <h3>ارسال ویدیو (sendVideo)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.sendVideo(peerId, {
  fileId: 4194304,
  accessHash: 6543210987654321n,
  fileSize: 15400000,
  width: 1920,
  height: 1080,
  duration: 45,
  name: 'video.mp4',
  caption: 'ویدیوی معرفی محصول 🎬'
});</code></pre>
        </div>
      </section>

      <section id="send-document">
        <h3>ارسال فایل و اسناد (sendDocument)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.sendDocument(peerId, {
  fileId: 5242880,
  accessHash: 5432109876543210n,
  fileSize: 1200000,
  name: 'report.pdf',
  mimeType: 'application/pdf',
  caption: 'گزارش نهایی پروژه 📄'
});</code></pre>
        </div>
      </section>

      <section id="send-sticker">
        <h3>ارسال استیکر بله (sendSticker)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.sendSticker(peerId, 102456, 1234567890n, 100);
console.log('استیکر ارسال شد!');</code></pre>
        </div>
      </section>

      <!-- بخش مدیریت پیام‌ها -->
      <section id="edit-message">
        <h2>مدیریت پیام‌ها و گفتگوها</h2>

        <h3>ویرایش پیام (editMessage)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.editMessage(peerId, 104523n, 'متن اصلاح‌شده جدید ✏️');
console.log('پیام ویرایش شد.');</code></pre>
        </div>
      </section>

      <section id="forward-messages">
        <h3>فوروارد پیام‌ها (forwardMessages)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const toPeer = 123456789;
const fromPeer = 987654321;
const messageIds = [1001n, 1002n];

await client.forwardMessages(toPeer, fromPeer, messageIds);
console.log('پیام‌ها فوروارد شدند.');</code></pre>
        </div>
      </section>

      <section id="pin-message">
        <h3>پین کردن پیام (pinMessage)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.pinMessage(peerId, 104523n);
console.log('پیام در بالای چت سنجاق شد 📌');</code></pre>
        </div>
      </section>

      <section id="delete-messages">
        <h3>حذف پیام‌ها (deleteMessages)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.deleteMessages(peerId, [1001n, 1002n]);
console.log('پیام‌های مشخص‌شده حذف شدند 🗑️');</code></pre>
        </div>
      </section>

      <section id="clear-chat">
        <h3>پاکسازی کل تاریخچه چت (clearChat)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.clearChat(peerId);
console.log('کل تاریخچه مکالمه پاکسازی گردید.');</code></pre>
        </div>
      </section>

      <!-- بخش مدیریت گروه‌ها -->
      <section id="group-create">
        <h2>مدیریت گروه‌ها و کانال‌ها</h2>

        <h3>ساخت گروه جدید (createGroup)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const newGroup = await client.createGroup('تیم برنامه‌نویسی BaleX', [
  123456789,
  987654321
]);
console.log('گروه ساخته شد با شناسه:', newGroup.group?.id);</code></pre>
        </div>
      </section>

      <section id="group-invite">
        <h3>افزودن عضو به گروه (inviteMembers)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.inviteMembers(groupId, [1122334455]);
console.log('عضو جدید به گروه افزوده شد.');</code></pre>
        </div>
      </section>

      <section id="group-kick">
        <h3>اخراج عضو از گروه (kickMember)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.kickMember(groupId, 1122334455);
console.log('کاربر از گروه اخراج شد.');</code></pre>
        </div>
      </section>

      <section id="group-title">
        <h3>تغییر نام گروه (setGroupTitle)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.setGroupTitle(groupId, 'نام جدید و رسمی گروه');
console.log('عنوان گروه به‌روز شد.');</code></pre>
        </div>
      </section>

      <section id="group-leave">
        <h3>ترک گروه (leaveGroup)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.leaveGroup(groupId);
console.log('با موفقیت از گروه خارج شدید.');</code></pre>
        </div>
      </section>

      <!-- بخش کاربران و مخاطبین -->
      <section id="user-profile">
        <h2>کاربران، مخاطبین و پروفایل</h2>

        <h3>مشخصات پروفایل کاربر (getUser)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const user = await client.getUser(123456789);
console.log('نام:', user.name);
console.log('نام کاربری:', user.username);
console.log('درباره من:', user.about);</code></pre>
        </div>
      </section>

      <section id="group-profile">
        <h3>اطلاعات گروه (getGroup)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const group = await client.getGroup(groupId);
console.log('عنوان گروه:', group.title);
console.log('تعداد اعضا:', group.membersCount);</code></pre>
        </div>
      </section>

      <section id="contacts-list">
        <h3>لیست مخاطبین بله (getContacts)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const contacts = await client.getContacts();
contacts.users?.forEach(c => {
  console.log(\`مخاطب: \${c.name} | شماره: \${c.phone} | شناسه: \${c.id}\`);
});</code></pre>
        </div>
      </section>

      <section id="contacts-add">
        <h3>افزودن مخاطب به حساب (addContact / addContactByUid)</h3>
        <p>افزودن از طریق شماره تلفن یا شناسه مستقیم کاربری (UID):</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// روش ۱: افزودن با شماره موبایل و نام دلخواه
await client.addContact('09120000000', 'علی محمدی');

// روش ۲: افزودن مستقیم با شناسه کاربری (UID)
await client.addContactByUid(123456789);
console.log('مخاطب با موفقیت به حساب کاربری اضافه شد.');</code></pre>
        </div>
      </section>

      <section id="contacts-import">
        <h3>همگام‌سازی و واردسازی گروهی (importContacts)</h3>
        <p>وارد کردن لیست کامل مخاطبین به طور یکجا (Bulk Sync):</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const res = await client.importContacts([
  { phone: '09121111111', name: 'مهندس رضایی' },
  { phone: '09122222222', name: 'خانم عباسی' },
  { phone: '09123333333', name: 'پشتیبانی فنی' }
]);
console.log('مخاطبین بله‌ای همگام‌شده:', res.users?.length);</code></pre>
        </div>
      </section>

      <section id="contacts-remove">
        <h3>حذف مخاطب (removeContact)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.removeContact(123456789);
console.log('مخاطب از لیست دفترچه تلفن حذف شد.');</code></pre>
        </div>
      </section>

      <section id="contacts-search">
        <h3>جستجوی مخاطبین (searchContacts)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const results = await client.searchContacts('رضا');
results.users?.forEach(u => console.log(\`یافت شد: \${u.name} (\${u.id})\`));</code></pre>
        </div>
      </section>

      <section id="profile-edit">
        <h3>ویرایش مشخصات حساب (editName / editAbout)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ویرایش نام نمایشی
await client.editName('توسعه‌دهنده BaleX');

// ویرایش متن درباره من (بیوگرافی)
await client.editAbout('یوزربات هوشمند و اتوماسیون پیشرفته بر بستر بله');
console.log('اطلاعات پروفایل به‌روزرسانی شد.');</code></pre>
        </div>
      </section>

      <section id="username-edit">
        <h3>مدیریت نام‌کاربری (editUsername / checkUsername)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// بررسی در دسترس بودن آیدی
const check = await client.checkUsername('my_bot_channel');
console.log('آیا آیدی آزاد است؟', check.isAvailable);

// تنظیم یا تغییر آیدی حساب
if (check.isAvailable) {
  await client.editUsername('my_bot_channel');
  console.log('نام کاربری با موفقیت ثبت شد!');
}</code></pre>
        </div>
      </section>

      <section id="users-block">
        <h3>مدیریت کاربران مسدود (blockUser / unblockUser / loadBlockedUsers)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// مسدود کردن کاربر اسپمر
await client.blockUser(123456789);

// رفع مسدودی کاربر
await client.unblockUser(123456789);

// دریافت لیست کامل افراد بلاک‌شده
const blocked = await client.loadBlockedUsers();
console.log('لیست سیاه:', blocked.users);</code></pre>
        </div>
      </section>

      <!-- بخش واکنش‌ها و پوشه‌ها -->
      <section id="reactions-set">
        <h2>واکنش‌ها و پوشه‌ها</h2>

        <h3>ثبت واکنش ایموجی (setReaction)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ثبت ایموجی لایک، قلب، آتش و... روی پیام
await client.setReaction(peerId, 104523n, '❤️');
console.log('ری‌اکشن ثبت شد!');</code></pre>
        </div>
      </section>

      <section id="reactions-remove">
        <h3>حذف واکنش از پیام (removeReaction)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.removeReaction(peerId, 104523n, '❤️');
console.log('ری‌اکشن حذف گردید.');</code></pre>
        </div>
      </section>

      <section id="reactions-get">
        <h3>مشاهده آمار واکنش‌های پیام (getReactions)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const data = await client.getReactions(peerId, [104523n]);
console.log('آمار واکنش‌ها:', data.results);</code></pre>
        </div>
      </section>

      <section id="folders-manage">
        <h3>مدیریت پوشه‌های چت (createFolder / loadFolders / deleteFolder)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. دریافت لیست پوشه‌ها
const folders = await client.loadFolders();
console.log('پوشه‌های من:', folders);

// ۲. ساخت پوشه جدید با دسته‌بندی چت‌ها
const newFolder = await client.createFolder('کانال‌های خبری', [
  123456,
  789101
]);

// ۳. حذف یک پوشه
await client.deleteFolder(newFolder.folderId);</code></pre>
        </div>
      </section>

      <!-- بخش نظرسنجی و کیف‌پول -->
      <section id="polls-send">
        <h2>نظرسنجی، کیف‌پول و ربات‌ها</h2>

        <h3>ارسال نظرسنجی و کوییز (sendPoll)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.sendPoll(peerId, 'بهترین زبان برنامه‌نویسی برای بک‌اند چیست؟', [
  'JavaScript / Node.js',
  'Go (Golang)',
  'Python',
  'Rust'
], {
  isAnonymous: true,        // نظرسنجی ناشناس
  isMultipleChoice: false,  // چند گزینه‌ای
  isQuiz: false             // حالت کوییز و مسابقه
});</code></pre>
        </div>
      </section>

      <section id="polls-manage">
        <h3>مدیریت نظرسنجی (createPoll / getPollResults / closePoll)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// دریافت نتایج آرای نظرسنجی
const results = await client.getPollResults(pollId);
console.log('نتایج آرا:', results);

// بستن و پایان پذیرش آرا در نظرسنجی
await client.closePoll(pollId);
console.log('نظرسنجی با موفقیت بسته شد.');</code></pre>
        </div>
      </section>

      <section id="wallet-credit">
        <h3>استعلام کیف پول و امتیازات بله (getWalletCredit / getWalletPoints)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// موجودی کیف‌پول ریالی
const credit = await client.getWalletCredit();
console.log('موجودی کیف‌پول:', credit);

// موجودی امتیازات بله
const points = await client.getWalletPoints();
console.log('امتیازات کسب‌شده:', points.balance);</code></pre>
        </div>
      </section>

      <section id="bot-callback">
        <h3>کلیک روی دکمه شیشه‌ای ربات (sendInlineCallback)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// شبیه‌سازی کلیک کاربر روی اینلاین کیبورد ربات
await client.sendInlineCallback(botPeerId, messageId, 'action_confirm_pay');
console.log('کلیک دکمه اینلاین شبیه‌سازی شد.');</code></pre>
        </div>
      </section>

      <!-- بخش پاکت‌های هدیه -->
      <section id="gift-packet-cash">
        <h2>پاکت هدیه معمولی نقدی (Cash Gift Packet)</h2>
        <p>
          قابلیت ارسال پاکت هدیه ریالی با کسر از موجودی کیف‌پول (بر بستر <code>bale.giftpacket.v1.GiftPacket</code>):
        </p>

        <h3>ارسال پاکت هدیه نقدی (sendGiftPacket)</h3>
        <p>ارسال پاکت هدیه به چت یا گروه با امکان تقسیم مساوی یا شانسی میان افراد:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ارسال پاکت هدیه ۵۰۰ هزار ریالی بین ۵ نفر به صورت شانسی
const res = await client.sendGiftPacket({
  peer: 123456789,            // کاربر، گروه یا کانال مقصد
  amount: 500000,             // مبلغ کل پاکت (ریال)
  count: 5,                   // تعداد افراد دریافت‌کننده
  message: 'عیدی نوروز مبارک! 🌸', // متن روی پاکت
  givingType: 0,              // ۰: شانسی (Random)، ۱: مساوی (Equal)
  coverId: 1,                 // طرح جلد پاکت
  showTotalAmount: true       // نمایش مبلغ کل برای همه
});

console.log('پاکت هدیه معمولی با موفقیت ارسال شد.');</code></pre>
        </div>
      </section>

      <section id="gift-packet-open">
        <h3>باز کردن، دریافت و استعلام پاکت هدیه نقدی (openGiftPacket / claimGiftPacket / getGiftPacket)</h3>
        <p>متدهای کامل جهت باز کردن، دریافت وجه و دریافت لیست کامل برندگان و جزئیات پاکت هدیه:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. باز کردن و دریافت سهم نقدی (Claim)
const result = await client.claimGiftPacket({
  peer: 123456789,
  randomId: 9876543210123n, // شناسه تصادفی پیام پاکت
  date: Date.now(),
  walletId: 'WAL-12345'     // شناسه کیف‌پول مقصد جهت واریز
});

console.log('وضعیت پاکت:', result.status); // 1: ACTIVE, 2: EXPIRED, 3: FINISHED
console.log('مبلغ برنده شده شما:', result.amount, 'ریال');
console.log('آیا برنده شدید؟', result.isCurrentWinner);
console.log('رتبه در باز کردن:', result.rank);
console.log('تعداد بازکنندگان:', result.openedCount);

// ۲. استعلام مشخصات کامل پاکت هدیه (getGiftPacket)
const details = await client.getGiftPacket({
  peer: 123456789,
  randomId: 9876543210123n
});
console.log('متن پاکت:', details.description);
console.log('تعداد کل جوایز:', details.winnerCount);

// ۳. استعلام لیست کامل دریافت‌کنندگان پاکت (getGiftPacketReceivers)
const receivers = await client.getGiftPacketReceivers({
  peer: 123456789,
  randomId: 9876543210123n
});
console.log('لیست برندگان:', receivers);

// ۴. دریافت توکن درگاه پرداخت پاکت هدیه
const payToken = await client.getGiftPacketPaymentToken({ token: 'tok_123', amount: 500000 });

// ۵. شنود رویداد باز شدن پاکت هدیه توسط کاربران چت
client.on('giftPacketOpened', (evt) => {
  console.log(\`کاربر \${evt.receiverUserId} پاکت هدیه را باز کرد و \${evt.amount} ریال برنده شد!\`);
});</code></pre>
        </div>
      </section>

      <section id="gift-packet-gold">
        <h2>پاکت هدیه طلا (Gold Gift Packet)</h2>
        <p>
          ارسال شمش طلا بر حسب میلی‌گرم در قالب پاکت هدیه بله‌بانک (بر بستر <code>bale.balebank.v1.GoldGiftPacket</code>):
        </p>

        <h3>ارسال پاکت هدیه طلا (sendGoldGiftPacket)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const goldPacket = await client.sendGoldGiftPacket({
  peer: 123456789,
  amountMilligrams: 100,      // ۱۰۰ میلی‌گرم طلا
  count: 3,                   // ۳ برنده
  message: 'هدیه طلای بله تقدیم به شما! 🪙',
  givingType: 0               // ۰: شانسی، ۱: مساوی
});

console.log('شناسه پاکت طلای ارسالی:', goldPacket.giftPacketId);</code></pre>
        </div>
      </section>

      <section id="gift-packet-gold-open">
        <h3>باز کردن پاکت طلا و دریافت لیست برندگان (openGoldGiftPacket / claimGoldGiftPacket / getGoldWinners)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const packetId = 987654321n;

// ۱. باز کردن و دریافت سهم شمش طلا (Claim)
const claimResult = await client.claimGoldGiftPacket(packetId);
console.log('میلی‌گرم طلای برنده شده:', claimResult.amount);
console.log('تعداد افراد بازکننده:', claimResult.openedCount);
console.log('رتبه شما:', claimResult.rank);

// ۲. مشاهده شناسه‌های کاربری برندگان پاکت طلا
const winners = await client.getGoldWinners(packetId);
console.log('شناسه‌های برندگان طلا:', winners.winnerIds);

// ۳. باز کردن مستقیم از طریق رویداد پیام (MessageEvent Helper)
client.on('goldGiftPacket', async (msg) => {
  console.log('پیام پاکت طلا رسید! شناسه:', msg.goldGiftPacket.packetId);
  const win = await msg.claimGoldGiftPacket();
  console.log('طلای برنده شده:', win.amount, 'میلی‌گرم');
});</code></pre>
        </div>
      </section>

      <!-- بخش مینی‌اپ‌ها و وب‌اپ‌ها -->
      <section id="miniapp-params">
        <h2>مینی‌اپ‌ها و وب‌اپ‌های بله (Mini Apps & Parameter Engine)</h2>
        <p>
          کتابخانه BaleX مجهز به موتور اختصاصی <code>MiniAppUtils</code> کاملاً سازگار با استاندارد تلگرام و بله برای تولید و اعتبارسنجی پارامترهای مینی‌اپ‌ها است. با این ماژول می‌توانید رشته <code>initData</code> بسازید، آن را با توکن ربات امضا و اعتبارسنجی رمزی کنید، و آدرس نهایی لانچ وب‌اپ را همراه با پارامترهای تم تولید نمایید.
        </p>

        <h3>ساخت پارامترهای مینی‌اپ به صورت آفلاین یا با توکن ربات (MiniAppUtils)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const { MiniAppUtils, ScreenMode, MiniAppEvent } = require('bale-userbot');

const botToken = '123456789:ABCdefGhIJKlmNoPQRstuVWXyz';

// ۱. تولید رشته استاندارد initData با امضای معتبر HMAC-SHA256
const initData = MiniAppUtils.createInitData({
  user: {
    id: 987654321,
    first_name: 'رضا',
    username: 'rezabalex',
    language_code: 'fa'
  },
  queryId: 'AAH_test123',
  authDate: Math.floor(Date.now() / 1000),
  startParam: 'ref_bonus_100',
  botToken // اختیاری جهت ایجاد هش امضای معتبر
});

console.log('رشته اعتبارسنجی مینی‌اپ:', initData);

// ۲. اعتبارسنجی امضای امنیتی در سمت بک‌اند ربات (Validation)
const validation = MiniAppUtils.validateInitData(initData, botToken);
if (validation.valid) {
  console.log('امضای مینی‌اپ کاملاً معتبر است! کاربر تایید شد:', validation.data.user);
} else {
  console.error('داده‌های مینی‌اپ نامعتبر یا دستکاری شده است:', validation.error);
}

// ۳. پارس کردن رشته initData به آبجکت تایپ‌شده
const parsed = MiniAppUtils.parseInitData(initData);
console.log('شناسه کوئری:', parsed.query_id);
console.log('پارامتر استارت دیپ‌لینک:', parsed.start_param);

// ۴. ساخت آدرس کامل باز کردن مینی‌اپ درون وب‌ویو (Launch URL)
const launchUrl = MiniAppUtils.buildMiniAppUrl({
  webAppUrl: 'https://my-app.bale.ai',
  initData,
  themeParams: {
    bg_color: '#0e1015',
    text_color: '#f3f4f6',
    button_color: '#10b981'
  }
});
console.log('آدرس نهایی جهت بارگذاری در WebView:', launchUrl);</code></pre>
        </div>

        <h3>دریافت پارامترهای راه‌اندازی از سرور بله (createMiniAppParams)</h3>
        <p>این متد هش رسمی سرور بله را دریافت کرده و تمام پارامترهای احراز هویت وب‌اپ را آماده می‌سازد:</p>
        <p>
          پشتیبانی کامل از استاندارد تلگرام و بله برای مینی‌اپلیکیشن‌ها (Appzar / Ketf) شامل تولید <code>initData</code>، هش امنیتی و پارامترهای تم.
        </p>

        <h3>ساخت کامل پارامترهای راه‌اندازی مینی‌اپ (createMiniAppParams)</h3>
        <p>این متد هش امنیتی رسمی سرور بله را دریافت کرده و تمام پارامترهای احراز هویت وب‌اپ را برای باز کردن درون WebView آماده می‌سازد:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const botId = 123456; // شناسه ربات دارنده مینی‌اپ

// ساخت پارامترهای کامل launch params و initData
const appParams = await client.createMiniAppParams(botId, {
  appUrl: 'https://my-mini-app.example.com',
  startParam: 'ref_user_789',
  platform: 'weba'
});

console.log('رشته اعتبارسنجی (initData):', appParams.initData);
console.log('امضای امنیتی سرور (hash):', appParams.hash);
console.log('آدرس کامل جهت بارگذاری در وب‌ویو:', appParams.launchUrl);
// https://my-mini-app.example.com/#tgWebAppData=query_id%3D...%26user%3D...%26hash%3D...</code></pre>
        </div>
      </section>

      <section id="miniapp-url">
        <h3>دریافت آدرس مینی‌اپ از سرور (getMiniAppUrl)</h3>
        <p>متد رسمی <code>bale.appzar.v1.Appzar.GetMiniAppUrl</code> برای دریافت آدرس وب‌اپ با امضای سرور:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const { url, queryId } = await client.getMiniAppUrl({
  botUserId: botId,
  screenMode: 1, // ۱: تمام‌صفحه (Fullscreen)، ۰: پیش‌فرض
  directLink: 'start_param_value'
});

console.log('لینک اجرای وب‌اپ:', url);</code></pre>
        </div>
      </section>

      <section id="miniapp-hash">
        <h3>دریافت هش امنیتی وب‌اپ (getWebappHash)</h3>
        <p>متد <code>bale.ketf.v1.Ketf.GetWebappHash</code> جهت دریافت هش رمزی اختصاصی ربات برای تایید کاربر:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const hashInfo = await client.getWebappHash(botId, 'custom_payload');
console.log('هش امنیتی:', hashInfo.hash);
console.log('شناسه کوئری:', hashInfo.queryId);
console.log('تاریخ احراز هویت:', hashInfo.authDate);</code></pre>
        </div>
      </section>

      <section id="miniapp-send-data">
        <h3>ارسال داده از مینی‌اپ به ربات (sendMiniAppData)</h3>
        <p>رویداد <code>sendData</code> برای ارسال نتیجه تراکنش یا امتیاز از مینی‌اپ به ربات:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.sendMiniAppData({
  botUserId: botId,
  queryId: hashInfo.queryId,
  data: { score: 150, action: 'game_finished' },
  buttonText: 'تایید و ادامه'
});

console.log('داده‌های وب‌اپ با موفقیت به ربات ارسال شد.');</code></pre>
        </div>
      </section>

      <section id="miniapp-menu">
        <h3>تنظیمات دکمه منو و متدهای سفارشی مینی‌اپ</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. دریافت تنظیمات دکمه منوی ربات (Menu Button)
const menuBtn = await client.getBotMenuButton(botId);
console.log('نوع دکمه منو:', menuBtn);

// ۲. اجرای متد سفارشی مینی‌اپ
const customRes = await client.invokeMiniAppCustomMethod({
  botUserId: botId,
  method: 'getUserTier',
  params: { userId: 123456 }
});
console.log('پاسخ متد سفارشی:', customRes);</code></pre>
        </div>
      </section>

      <!-- بخش اختصاصی بازوهای رسمی بله (Bale HTTP Bot API) -->
      <section id="bale-bot-overview">
        <h2>بازوهای رسمی بله (Bale HTTP Bot API - docs.bale.ai)</h2>
        <p>پشتیبانی کامل و استاندارد بدون نیاز به پیش‌نیازهای سنگین از <strong>API رسمی بازوهای بله (<a href="https://docs.bale.ai" target="_blank">docs.bale.ai</a>)</strong>. این کلاس به شما امکان می‌دهد ربات‌های رسمی با توکن دریافتی از <code>@botfather</code> بسازید، رویدادها را دریافت کرده و انواع پیام‌ها، کیبوردها و فاکتورهای پرداخت الکترونیکی را مدیریت کنید.</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (BaleBot Quickstart)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const { BaleBot, InlineKeyboard, ReplyKeyboard } = require('bale-userbot');

// ۱. مقداردهی کلاینت با توکن بات‌فادر
const bot = new BaleBot('123456789:abcdIuZmK5qNEm2A1BhUaAg7MPJv1O9KCcBQB2ro');

// ۲. لیسنر دریافت پیام‌ها
bot.on('message', async (msg) => {
  if (msg.text === '/start') {
    const kb = new InlineKeyboard()
      .button('ثبت‌نام', 'btn_register')
      .url('وب‌سایت بله', 'https://ble.ir')
      .row()
      .webApp('اجرای مینی‌اپ', 'https://miniapp.example.com')
      .copyText('کپی کد تخفیف', 'DISCOUNT2026');

    await bot.sendMessage(msg.chat.id, 'سلام! به بازوی رسمی بله خوش آمدید.', {
      reply_markup: kb
    });
  }
});

// ۳. شروع دریافت آپدیت‌ها با Long Polling
bot.startPolling({ interval: 300, timeout: 20 });</code></pre>
        </div>
      </section>

      <section id="bale-bot-polling">
        <h3>دریافت آپدیت‌ها (Long Polling & Webhook)</h3>
        <p>بازوی بله از دو روش استاندارد برای دریافت آپدیت‌ها پشتیبانی می‌کند:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Polling & Webhook Middleware)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// روش اول: لانگ پولینگ (Long Polling) - مناسب سرورهای محلی و توسعه
bot.startPolling({ interval: 300, timeout: 20 });

// روش دوم: وبهوک (Webhook) - مناسب سرورهای پروداکشن
await bot.setWebhook('https://mybot.example.com/bale-webhook');

// میدلور وب‌هوک سازگار با Express / Node http
const http = require('http');
const webhookMiddleware = bot.createWebhookMiddleware({ secretToken: 'MY_SECRET' });

http.createServer((req, res) => {
  if (req.url === '/bale-webhook') return webhookMiddleware(req, res);
  res.writeHead(404).end();
}).listen(443);</code></pre>
        </div>
      </section>

      <section id="bale-bot-keyboards">
        <h3>کیبوردهای شیشه‌ای و معمولی (Keyboards)</h3>
        <p>کلاس‌های هلپر <code>InlineKeyboard</code> و <code>ReplyKeyboard</code> ساخت دکمه‌ها را بسیار ساده می‌کنند:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. کیبورد شیشه‌ای (اینلاین) با پشتیبانی از وب‌اپ و کپی متن
const inlineKb = new InlineKeyboard()
  .button('تایید', 'confirm_action')
  .url('کانال رسمی', 'https://ble.ir/bale')
  .row()
  .webApp('باز کردن مینی‌اپ', 'https://app.example.com')
  .copyText('کپی کد', 'INVITE_CODE');

// ۲. کیبورد معمولی (Reply Keyboard)
const replyKb = new ReplyKeyboard({ resize: true })
  .button('منوی خدمات')
  .button('پشتیبانی')
  .row()
  .requestContact('ارسال شماره تماس')
  .requestLocation('ارسال موقعیت مکانی');

await bot.sendMessage(chatId, 'انتخاب کنید:', { reply_markup: inlineKb });</code></pre>
        </div>
      </section>

      <section id="bale-bot-payments">
        <h3>پرداخت و کیف‌پول الکترونیکی بله (Electronic Wallet & Invoices)</h3>
        <p>ارسال فاکتور ریالی، تایید خرید، و استعلام مستقیم وضعیت تراکنش با متدهای اختصاصی بله:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript (Invoices & Payments)</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. ارسال فاکتور پرداخت
await bot.sendInvoice(
  chatId,
  'اشتراک طلایی ۱ ماهه',
  'دسترسی نامحدود به تمامی امکانات بازو',
  'order_gold_9988',
  'PROVIDER_TOKEN_HERE',
  'IRR',
  [
    { label: 'قیمت اصلی', amount: 200000 },
    { label: 'تخفیف بهاره', amount: -20000 }
  ],
  { photo_url: 'https://example.com/gold.jpg' }
);

// ۲. تایید پیش از نهایی شدن پرداخت (PreCheckoutQuery)
bot.on('pre_checkout_query', async (pcq) => {
  console.log('درخواست پرداخت:', pcq.id, pcq.total_amount);
  await bot.answerPreCheckoutQuery(pcq.id, true);
});

// ۳. دریافت رویداد پرداخت موفق
bot.on('successful_payment', async (payment, msg) => {
  console.log('پرداخت موفق:', payment.total_amount, payment.invoice_payload);
  await bot.sendMessage(msg.chat.id, 'پرداخت شما تایید شد! سپاسگزاریم.');
});

// ۴. استعلام وضعیت تراکنش با شناسه اختصاصی
const tx = await bot.inquireTransaction('transaction_id_here');
console.log('وضعیت تراکنش:', tx.status, tx.amount);</code></pre>
        </div>
      </section>

      <!-- بخش استوری، زمان‌بندی و هوش مصنوعی -->
      <section id="story-manage">
        <h2>استوری‌های بله (Stories API)</h2>
        <p>سرویس <code>bale.story.v1.Story</code> برای ارسال، مشاهده و تعامل با استوری‌ها:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. انتشار استوری جدید
await client.sendStory({
  caption: 'روز زیبای بهاری 🌿'
});

// ۲. مشاهده استوری‌های فعال کاربر یا چت
const stories = await client.getUserStories(123456789);
console.log('استوری‌ها:', stories);

// ۳. مشاهده بینندگان استوری
const viewers = await client.getStoryViewers(stories[0]?.storyId);
console.log('بینندگان استوری:', viewers);

// ۴. لایک کردن استوری
await client.likeStory(stories[0]?.storyId, '🔥');

// ۵. حذف استوری
await client.deleteStory(stories[0]?.storyId);</code></pre>
        </div>
      </section>

      <section id="scheduler-manage">
        <h2>پیام‌های زمان‌بندی شده (Scheduled Messages)</h2>
        <p>ارسال پیام در تاریخ و زمان مشخص در آینده (سرویس <code>bale.schedule.v1.Scheduler</code>):</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// تنظیم ارسال پیام برای ۲ ساعت بعد
const sendTime = Date.now() + (2 * 60 * 60 * 1000);

await client.scheduleMessage({
  peer: 123456789,
  text: 'یادآوری: جلسه هفتگی آغاز شد!',
  sendAtDate: sendTime
});

// دریافت لیست پیام‌های زمان‌بندی‌شده
const tasks = await client.loadScheduledMessages(123456789);
console.log('پیام‌های زمان‌بندی‌شده:', tasks);

// لغو یک پیام زمان‌بندی شده
await client.deleteScheduledMessage(123456789, tasks[0]?.taskId);</code></pre>
        </div>
      </section>

      <section id="ai-tldr">
        <h2>هوش مصنوعی و خلاصه‌ساز بله (AI & TLDR)</h2>
        <p>استفاده از هوش مصنوعی تورینگ و موتور خلاصه‌ساز بله:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. خلاصه‌سازی یک لینک یا صفحه با Bale TLDR
const summary = await client.summarizeLink('https://bale.ai');
console.log('خلاصه محتوا:', summary);

// ۲. پرسش از هوش مصنوعی تورینگ بله
const aiAnswer = await client.askAI('ساعت کاری شعب بانک در تعطیلات چگونه است؟');
console.log('پاسخ هوش مصنوعی:', aiAnswer);</code></pre>
        </div>
      </section>

      <!-- بخش بانکداری -->
      <section id="card-inquiry">
        <h2>بانکداری و خدمات مالی شتابی</h2>

        <h3>استعلام نام صاحب کارت شتابی (inquireDestinationPan)</h3>
        <p>استعلام نام و نام خانوادگی دارنده حساب کارت مقصد قبل از واریز وجه:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const inquiry = await client.inquireDestinationPan({
  sourceCardNumber: '6037991812345678',      // ۱۶ رقم کارت مبدا
  destinationCardNumber: '5022291087654321', // ۱۶ رقم کارت مقصد
  amountRials: '10000000'                    // مبلغ (ریال)
});

console.log('صاحب کارت مقصد:', inquiry.fullName);
console.log('نام بانک مقصد:', inquiry.bankName);
console.log('توکن تایید انتقال:', inquiry.inquiryToken);</code></pre>
        </div>
      </section>

      <section id="card-transfer">
        <h3>انتقال وجه کارت به کارت شتابی (transferMoneyByCard)</h3>
        <p>انجام تراکنش مستقیم کارت به کارت با رمز دوم پویا (OTP):</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const receipt = await client.transferMoneyByCard({
  sourcePan: '6037991812345678',
  destinationPan: '5022291087654321',
  amountRials: '10000000',
  cvv2: '345',
  expireDate: '0628', // ماه و سال (۲ رقم ماه + ۲ رقم سال)
  pin2: '984512',     // رمز دوم یکبار مصرف پیامک‌شده
  inquiryToken: inquiry.inquiryToken,
  description: 'پرداخت فاکتور خرید'
});

console.log('کد پیگیری شتاب:', receipt.trackingCode);
console.log('شماره ارجاع شاپرک (RRN):', receipt.rrn);</code></pre>
        </div>
      </section>

      <section id="card-balance">
        <h3>استعلام موجودی کارت شتابی (getCardBalance)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">const balance = await client.getCardBalance({
  sourcePan: '6037991812345678',
  pin2: '984512',
  cvv2: '345',
  expireDate: '0628'
});

console.log('موجودی کارت:', balance.balanceRials, 'ریال');
console.log('موجودی قابل برداشت:', balance.availableBalanceRials, 'ریال');</code></pre>
        </div>
      </section>

      <section id="gold-packet">
        <h3>ارسال پاکت هدیه طلای بله (sendGoldPacket)</h3>
        <p>ارسال هدیه شمش طلا بر حسب میلی‌گرم در چت:</p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">await client.sendGoldPacket({
  peerId: 123456789,
  goldMilligrams: 100, // ۱۰۰ میلی‌گرم طلا
  message: 'تبریک روز مهندس از طرف BaleX! 🎁',
  packetType: 0
});
console.log('پاکت طلایی با موفقیت ارسال شد.');</code></pre>
        </div>
      </section>

      <!-- بخش موتور حضور و ضد مسدودی -->
      <section id="presence-controls">
        <h2>موتور حضور و ضد مسدودی (Presence & Stealth)</h2>

        <h3>کنترل وضعیت آنلاین و تایپینگ (setOnline / sendTyping / stopTyping)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// ۱. ارسال وضعیت آنلاین (سبز شدن چراغ آنلاین در بله)
await client.setOnline(true);

// ۲. ارسال وضعیت "در حال نوشتن..." با توقف خودکار بعد از ۳ ثانیه
await client.sendTyping(peerId, 3000);

// ۳. توقف دستی تایپ
await client.stopTyping(peerId);</code></pre>
        </div>
      </section>

      <section id="stealth-controls">
        <h3>تنظیمات موتور ضد مسدودی در حین اجرا (Humanize Controls)</h3>
        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// فعال‌سازی حالت انسانی با تنظیمات اختصاصی
client.enableHumanize({
  readDelay: [800, 2000],       // تاخیر خواندن پیام بین ۸۰۰ تا ۲۰۰۰ میلی‌ثانیه
  typingDurationPerChar: 40,   // ۴۰ میلی‌ثانیه تایپ به ازای هر حرف
  minTypingDelay: 1000,
  maxTypingDelay: 7000,
  autoMarkAsRead: true,        // سین خودکار پیام قبل از پاسخ
  keepOnline: true             // ارسال هارت‌بیت آنلاین ماندن
});

// تغییر داینامیک و پویا در حین اجرای برنامه با متد setHumanize:
client.setHumanize({
  readDelay: [1000, 2500],
  typingDurationPerChar: 50
});

// غیرفعال کردن حالت انسانی (حالت ربات فوق سریع و پاسخ لحظه‌ای)
client.disableHumanize();

// تاخیر دلخواه با تابع کمکی sleep
await client.sleep(1500);</code></pre>
        </div>
      </section>

      <section id="stealth-engine">
        <h3>مکانیزم شبیه‌سازی هوشمند و ضد مسدودی</h3>
        <p>
          سیستم آنتی‌اسپم بله اکانت‌هایی که بدون تاخیر طبیعی پیام ارسال می‌کنند را شناسایی می‌کند. BaleX تمام رفتارهای کاربر فیزیکی را بازتولید می‌کند:
        </p>

        <div class="grid-cards">
          <div class="feature-card">
            <h4>۱. تاخیر دیدن پیام (Seen Delay)</h4>
            <p>پس از دریافت پیام، کلاینت بلافاصله تیک دوم را نمی‌زند، بلکه بعد از یک تاخیر تصادفی انسانی پیام را خوانده شده علامت‌گذاری می‌کند.</p>
          </div>
          <div class="feature-card">
            <h4>۲. شبیه‌سازی فکر کردن و تایپ</h4>
            <p>طول پیام با ضریب میلی‌ثانیه بر کاراکتر سنجیده شده و سیگنال تایپینگ به مدت متناسب ارسال می‌شود.</p>
          </div>
          <div class="feature-card">
            <h4>۳. هارت‌بیت پس‌زمینه</h4>
            <p>کلاینت به صورت خودکار هر ۶۰ ثانیه وضعیت آنلاین بودن را تمدید می‌کند تا ارتباط طبیعی به نظر برسد.</p>
          </div>
        </div>
      </section>

      <section id="anti-ban-tips">
        <h3>نکات طلایی جلوگیری از مسدودی و بن شدن</h3>
        <ul>
          <li><strong>همواره humanize را فعال بگذارید:</strong> در اکانت‌های شخصی و یوزربات‌ها، تاخیرهای طبیعی ضامن بقای اکانت هستند.</li>
          <li><strong>از ارسال پیام انبوه به ناشناس‌ها پرهیز کنید:</strong> ارسال بیش از ۲۰ پیام در دقیقه به افرادی که شماره شما را ندارند می‌تواند اکانت را ریپورت کند.</li>
          <li><strong>از سشن پایدار استفاده کنید:</strong> لاگین‌های مکرر و دریافت پشت سر هم پیامک باعث ایجاد خطای <code>FLOOD_WAIT</code> در سرور بله می‌شود.</li>
        </ul>
      </section>

      <!-- بخش پروتکل و کاتالوگ ۵۳ سرویس -->
      <section id="wire-protocol">
        <h2>معماری پروتکل باینری Protobuf و gRPC-Web</h2>
        <p>
          بله از فریم‌های استاندارد gRPC-Web با پیشوند ۵ بایتی استفاده می‌کند:
        </p>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>بایت‌ها</th>
                <th>فیلد</th>
                <th>توضیحات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>0</code> (1 بایت)</td>
                <td>Flag فریم</td>
                <td>مقدار <code>0x00</code> برای داده (Data) و <code>0x80</code> برای تریلر وضعیت (Trailers)</td>
              </tr>
              <tr>
                <td><code>1..4</code> (4 بایت)</td>
                <td>Length طول بسته</td>
                <td>طول باینری بسته پروتوباف به صورت Big-Endian 32-bit</td>
              </tr>
              <tr>
                <td><code>5..end</code></td>
                <td>Protobuf Payload</td>
                <td>بدنه باینری کدگذاری شده مطابق اسکیماهای Protobuf Wire</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="generic-rpc">
        <h2>فراخوانی عمومی از طریق متد invoke و پراکسی‌های داینامیک</h2>
        <p>
          تمامی ۵۳ سرویس و ۶۳۶ متد بله به صورت شیءهای داینامیک در کلاینت در دسترس هستند: <code>client.&lt;namespace&gt;.&lt;methodName&gt;(payload)</code>. همچنین می‌توانید مستقیماً از متد <code>client.invoke()</code> برای ارسال هر RPC دلخواه استفاده نمایید:
        </p>

        <div class="code-wrapper">
          <div class="code-header">
            <span>JavaScript</span>
            <button class="btn-copy" onclick="copyCode(this)">کپی</button>
          </div>
          <pre><code class="language-javascript">// روش ۱: فراخوانی از طریق پراکسی خودکار سرویس
const res1 = await client.users.loadFullUsers({ userIds: [123456789] });

// روش ۲: فراخوانی مستقیم و عمومی با متد invoke
const res2 = await client.invoke('bale.users.v1.Users', 'LoadFullUsers', {
  userIds: [123456789]
});</code></pre>
        </div>
      </section>

      <section id="services-catalog">
        <h2>کاتالوگ کامل ۵۳ سرویس بله در ۱۰ حوزه کاربردی</h2>
        <p>
          تفکیک جامع تمامی ۵۳ سرویس رسمی استخراج شده از پروتکل کلاینت وب بله همراه با تعداد متدها و شرح کاربرد:
        </p>

        <h3>۱. احراز هویت، امنیت و تنظیمات (۴ سرویس، ۳۸ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.auth.v1.Auth</code></td><td><code>client.auth</code></td><td>27</td><td>ورود، تایید کد، رمز دومرحله‌ای، خروج، مدیریت نشست‌ها و لغو نشست‌های موازی</td></tr>
              <tr><td><code>bale.ramz.v1.Ramz</code></td><td><code>client.ramz</code></td><td>7</td><td>سیستم تولید، دریافت و اعتبارسنجی رمز دوم یکبار مصرف و پویا (OTP) شتاب</td></tr>
              <tr><td><code>bale.v1.Configs</code></td><td><code>client.configs</code></td><td>3</td><td>دریافت پیکربندی عمومی سرورها، نسخه‌های فعال و پارامترهای پروتکل</td></tr>
              <tr><td><code>bale.llm_auth.v1.LLMAuthService</code></td><td><code>client.lLMAuth</code></td><td>1</td><td>احراز هویت و دریافت کلید دسترسی به مدل‌های زبانی هوش مصنوعی بله</td></tr>
            </tbody>
          </table>
        </div>

        <h3>۲. پیام‌رسانی، استریم و محتوا (۶ سرویس، ۵۶ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.messaging.v2.Messaging</code></td><td><code>client.messaging</code></td><td>43</td><td>ارسال، ویرایش، حذف، فوروارد، پین، پوشه‌ها و بارگذاری تاریخچه چت‌ها</td></tr>
              <tr><td><code>bale.schedule.v1.Scheduler</code></td><td><code>client.scheduler</code></td><td>6</td><td>زمان‌بندی ارسال پیام در آینده، لغو یا ویرایش زمان ارسال خودکار</td></tr>
              <tr><td><code>bale.tldr.v1.TLDR</code></td><td><code>client.tLDR</code></td><td>2</td><td>خلاصه‌سازی خودکار گفتگوها و پیام‌های طولانی کانال‌ها با هوش مصنوعی</td></tr>
              <tr><td><code>bale.turing.v1.AI</code></td><td><code>client.aI</code></td><td>2</td><td>ارسال پرامپت و دریافت پاسخ بلادرنگ از موتورهای زبانی هوش مصنوعی تورینگ</td></tr>
              <tr><td><code>bale.message_stream.v1.MessageStream</code></td><td><code>client.messageStream</code></td><td>2</td><td>استریم بلادرنگ پیام‌ها و فیدهای خبری</td></tr>
              <tr><td><code>bale.maviz.v1.MavizStream</code></td><td><code>client.mavizStream</code></td><td>4</td><td>استریم بسته‌های باینری سوکت ماویز و هماهنگ‌سازی داده‌ها</td></tr>
            </tbody>
          </table>
        </div>

        <h3>۳. کاربران، مخاطبین و حضور آنلاین (۵ سرویس، ۵۲ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.users.v1.Users</code></td><td><code>client.users</code></td><td>36</td><td>پروفایل کامل، نام، بیو، نام کاربری، دفترچه مخاطبین و مدیریت لیست سیاه</td></tr>
              <tr><td><code>bale.presence.v1.Presence</code></td><td><code>client.presence</code></td><td>11</td><td>وضعیت آنلاین بودن، زمان آخرین بازدید، ارسال وضعیت تایپینگ و اشتراک وضعیت</td></tr>
              <tr><td><code>bale.anonymous_contact.v1.AnonymousContact</code></td><td><code>client.anonymousContact</code></td><td>1</td><td>برقراری تماس امن صوتی بدون آشکارسازی شماره تلفن همراه</td></tr>
              <tr><td><code>bale.organizations.v1.Organizations</code></td><td><code>client.organizations</code></td><td>2</td><td>پروفایل شرکتی، تایید هویت سازمانی و نشان‌های تایید</td></tr>
              <tr><td><code>bale.top_peer.v1.TopPeer</code></td><td><code>client.topPeer</code></td><td>2</td><td>محاسبه و دریافت لیست مخاطبین و چت‌های پرتکرار کاربر</td></tr>
            </tbody>
          </table>
        </div>

        <h3>۴. گروه‌ها، کانال‌ها و کاوش (۵ سرویس، ۶۸ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.groups.v1.Groups</code></td><td><code>client.groups</code></td><td>50</td><td>ایجاد گروه، لینک دعوت، تغییر ادمین، اخراج و تنظیم دسترسی‌های اعضا</td></tr>
              <tr><td><code>bale.charnet.v1.CharnetService</code></td><td><code>client.charnet</code></td><td>11</td><td>جستجو، معرفی کانال‌ها، لیست چهارسو و دسته‌بندی موضوعی</td></tr>
              <tr><td><code>bale.recommender.v1.Recommender</code></td><td><code>client.recommender</code></td><td>4</td><td>موتور پیشنهاد هوشمند کانال‌ها، چت‌ها و محتوای مرتبط</td></tr>
              <tr><td><code>bale.falake.v1.Falake</code></td><td><code>client.falake</code></td><td>1</td><td>بخش کاوش و فید محتواهای پرطرفدار و ترند فلکه</td></tr>
              <tr><td><code>bale.fanoos.v1.fanoos</code></td><td><code>client.fanoos</code></td><td>2</td><td>سیستم کاوش و پیشنهاد هوشمند فانوس</td></tr>
            </tbody>
          </table>
        </div>

        <h3>۵. خدمات بانکی شتابی و ساب (۴ سرویس، ۳۷ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.bank.v1.Bank</code></td><td><code>client.bank</code></td><td>17</td><td>استعلام کارت مقصد، انتقال کارت به کارت، موجودی و گردش حساب شتاب</td></tr>
              <tr><td><code>bale.sap.v1.Sap</code></td><td><code>client.sap</code></td><td>16</td><td>سامانه پرداخت، قبض، استعلام تراکنش‌های شاپرک و خدمات ساب</td></tr>
              <tr><td><code>bale.microbanki.v1.MicroBanki</code></td><td><code>client.microBanki</code></td><td>3</td><td>تسهیلات و خدمات خرد بانکی و استعلام تسهیلات</td></tr>
              <tr><td><code>bale.my_bank.v1.MyBank</code></td><td><code>client.myBank</code></td><td>1</td><td>شعب، اطلاعات و حساب‌های متمرکز بانک ملی</td></tr>
            </tbody>
          </table>
        </div>

        <h3>۶. کیف‌پول، طلا و امور مالی (۷ سرویس، ۶۵ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.kifpool.v1.Kifpool</code></td><td><code>client.kifpool</code></td><td>30</td><td>کیف پول‌های ریالی، گردش موجودی، امتیازات بله و باشگاه مشتریان</td></tr>
              <tr><td><code>bale.wallet.v1.Wallet</code></td><td><code>client.wallet</code></td><td>13</td><td>شارژ کیف پول، تسویه و برداشت وجه به حساب بانکی</td></tr>
              <tr><td><code>bale.pfm.v1.Pfm</code></td><td><code>client.pfm</code></td><td>15</td><td>مدیریت مالی شخصی، دسته‌بندی هزینه‌ها و نمودار دخل و خرج</td></tr>
              <tr><td><code>bale.giftpacket.v1.GiftPacket</code></td><td><code>client.giftPacket</code></td><td>3</td><td>ارسال پاکت هدیه ریالی به شکل مساوی یا شانسی در گروه‌ها</td></tr>
              <tr><td><code>bale.balebank.v1.GoldGiftPacket</code></td><td><code>client.goldGiftPacket</code></td><td>3</td><td>ارسال، دریافت و بازگشایی پاکت هدیه شمش طلا</td></tr>
              <tr><td><code>bale.balebank.v1.GoldWallet</code></td><td><code>client.goldWallet</code></td><td>1</td><td>موجودی و گردش حساب طلایی بله‌بانک</td></tr>
              <tr><td><code>bale.crowdfunding.v1.CrowdFunding</code></td><td><code>client.crowdFunding</code></td><td>2</td><td>پویش‌های جمع‌سپاری مالی، نیکوکاری و خیریه</td></tr>
            </tbody>
          </table>
        </div>

        <h3>۷. ربات‌ها، خدمات و ابزارک‌ها (۵ سرویس، ۳۱ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.ketf.v1.Ketf</code></td><td><code>client.ketf</code></td><td>14</td><td>پلتفرم ربات‌ها، کلیک دکمه‌های اینلاین، دستورات و هوک‌ها</td></tr>
              <tr><td><code>bale.garson.v1.Garson</code></td><td><code>client.garson</code></td><td>11</td><td>سامانه سفارش خدمات و غذا، مدیریت میز و پرداخت گارسون</td></tr>
              <tr><td><code>bale.appzar.v1.Appzar</code></td><td><code>client.appzar</code></td><td>3</td><td>ابزارک‌ها و مینی‌اپلیکیشن‌های درون‌برنامه‌ای</td></tr>
              <tr><td><code>bale.timche.v1.Timche</code></td><td><code>client.timche</code></td><td>5</td><td>سامانه فروشگاهی تیمچه و خدمات تجاری</td></tr>
              <tr><td><code>bale.ghasedak.v1.GhasedakService</code></td><td><code>client.ghasedak</code></td><td>2</td><td>ارسال نوتیفیکیشن و پیامک‌های سامانه قاصدک</td></tr>
            </tbody>
          </table>
        </div>

        <h3>۸. رسانه، استوری، جلسات و صوت (۶ سرویس، ۷۹ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.story.v1.Story</code></td><td><code>client.story</code></td><td>24</td><td>ارسال، مشاهده، استوری ۲۴ ساعته و آمار بازدیدکنندگان</td></tr>
              <tr><td><code>bale.meet.v1.Meet</code></td><td><code>client.meet</code></td><td>30</td><td>جلسات صوتی و تصویری آنلاین، اشتراک تصویر و کنترل میکروفن</td></tr>
              <tr><td><code>bale.v1.Images</code></td><td><code>client.images</code></td><td>10</td><td>مدیریت تصاویر، برش عکس و سایزهای آواتار پروفایل</td></tr>
              <tr><td><code>ai.bale.server.Files</code></td><td><code>client.files</code></td><td>7</td><td>دریافت لینک مستقیم آپلود و دانلود فایل‌ها از سرور نسیم</td></tr>
              <tr><td><code>bale.shared_media.v1.SharedMediaService</code></td><td><code>client.sharedMedia</code></td><td>2</td><td>دریافت تاریخچه تمام عکس‌ها، فایل‌ها و لینک‌های ردوبدل شده</td></tr>
              <tr><td><code>bale.pishvaz.v1.Pishvaz</code></td><td><code>client.pishvaz</code></td><td>3</td><td>آوای پیشواز تماس و پخش نمونه‌های صوتی</td></tr>
            </tbody>
          </table>
        </div>

        <h3>۹. واکنش‌ها، نظرسنجی و پشتیبانی (۵ سرویس، ۱۹ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.abacus.v1.Abacus</code></td><td><code>client.abacus</code></td><td>9</td><td>ثبت، دریافت و مدیریت ری‌اکشن‌های ایموجی روی پیام‌ها</td></tr>
              <tr><td><code>bale.poll.v1.Poll</code></td><td><code>client.poll</code></td><td>5</td><td>ساخت نظرسنجی، کوییزهای چندگزینه‌ای و بستن نظرسنجی</td></tr>
              <tr><td><code>bale.feedback.v1.FeedBack</code></td><td><code>client.feedBack</code></td><td>1</td><td>ارسال فیدبک، نظرات و پیشنهادها به تیم توسعه بله</td></tr>
              <tr><td><code>bale.report.v1.Report</code></td><td><code>client.report</code></td><td>2</td><td>گزارش اسپم، کلاهبرداری یا تخلف محتوا</td></tr>
              <tr><td><code>bale.negah.v1.Negah</code></td><td><code>client.negah</code></td><td>1</td><td>سرویس نظارت و ثبت رویدادهای نگاه</td></tr>
            </tbody>
          </table>
        </div>

        <h3>۱۰. تبلیغات، فروشگاه و خدمات ویژه (۵ سرویس، ۱۷۴ متد)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>نام کامل سرویس</th><th>پراکسی (Namespace)</th><th>متدها</th><th>توضیحات</th></tr>
            </thead>
            <tbody>
              <tr><td><code>bale.advertisement.v1.Advertisement</code></td><td><code>client.advertisement</code></td><td>126</td><td>سیستم تبلیغات بله، رزرو جایگاه، بودجه و کمپین‌ها</td></tr>
              <tr><td><code>bale.market.v1.Market</code></td><td><code>client.market</code></td><td>26</td><td>فروشگاه کالا، ثبت سفارش و رهگیری سبد خرید</td></tr>
              <tr><td><code>bale.search.v1.Search</code></td><td><code>client.search</code></td><td>12</td><td>موتور جستجوی سراسری پیام‌ها، کاربران، کانال‌ها و فایل‌ها</td></tr>
              <tr><td><code>bale.premium.v1.Premium</code></td><td><code>client.premium</code></td><td>7</td><td>اشتراک پریمیوم، استیکرهای انحصاری و افزایش محدودیت‌ها</td></tr>
              <tr><td><code>bale.magazine.v1.Magazine</code></td><td><code>client.magazine</code></td><td>9</td><td>پایگاه اخبار و مقالات مجله بله</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- بخش جستجوگر تعاملی ۶۳۶ متد -->
      <section id="services-explorer">
        <h2>جستجوگر تعاملی تمامی ۶۳۶ متد رسمی بله (Live Method Explorer)</h2>
        <p>
          می‌توانید در کادر زیر هر یک از ۶۳۶ متد رسمی بله را جستجو کرده یا بر اساس دسته‌بندی فیلتر نمایید تا کد فراخوانی آن آماده کپی شود:
        </p>

        <div class="explorer-box">
          <div class="explorer-header">
            <div class="explorer-search-row">
              <input type="text" id="methodSearchInput" class="explorer-input" placeholder="جستجو بر اساس نام متد (مثال: SendMessage, Inquire, Poll)...">
              <div class="explorer-count" id="methodCountDisplay">در حال آماده‌سازی...</div>
            </div>

            <div class="filter-chips" id="filterChips">
              <span class="chip active" data-domain="all">همه متدها (۶۳۶)</span>
              <span class="chip" data-domain="پیام‌رسانی">پیام‌رسانی</span>
              <span class="chip" data-domain="احراز هویت">احراز هویت</span>
              <span class="chip" data-domain="خدمات بانکی">بانکی و شتاب</span>
              <span class="chip" data-domain="کیف پول">کیف پول و طلا</span>
              <span class="chip" data-domain="کاربران و مخاطبین">کاربران و مخاطبین</span>
              <span class="chip" data-domain="گروه‌ها">گروه‌ها و کانال‌ها</span>
              <span class="chip" data-domain="حضور و آنلاین">حضور و Presence</span>
              <span class="chip" data-domain="واکنش‌ها">واکنش‌ها (Abacus)</span>
              <span class="chip" data-domain="نظرسنجی">نظرسنجی (Poll)</span>
              <span class="chip" data-domain="بات و مینی‌اپ">ربات‌ها (Ketf)</span>
              <span class="chip" data-domain="استوری">استوری و رسانه</span>
              <span class="chip" data-domain="تبلیغات و ادز">تبلیغات (Ads)</span>
              <span class="chip" data-domain="هوش مصنوعی">هوش مصنوعی (AI)</span>
            </div>
          </div>

          <div class="methods-grid" id="methodsGrid">
            <!-- متدها به صورت پویا با جاوااسکریپت در اینجا رندر می‌شوند -->
          </div>

          <button class="load-more-btn" id="loadMoreBtn" style="display: none;">بارگذاری متدهای بیشتر</button>
        </div>
      </section>

      <!-- بخش جدول خطاها -->
      <section id="errors-table">
        <h2>جدول کدهای خطای سرور بله و راهکارها</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>کد خطای gRPC / متنی</th>
                <th>علت بروز</th>
                <th>اقدام و راهکار در BaleX</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>PHONE_CODE_INVALID</code></td>
                <td>کد پیامک اشتباه یا نامعتبر وارد شده است.</td>
                <td>تابع <code>signIn</code> ارقام فارسی را قبل از ارسال تصحیح می‌کند؛ کد ۵ رقمی را مجدد بررسی کنید.</td>
              </tr>
              <tr>
                <td><code>PHONE_CODE_EXPIRED</code></td>
                <td>کد پیامک به دلیل گذشت زمان منقضی شده است.</td>
                <td>دوباره متد <code>sendCode</code> را فراخوانی کنید.</td>
              </tr>
              <tr>
                <td><code>PHONE_PASSWORD_INVALID</code></td>
                <td>رمز عبور دومرحله‌ای (۲FA) صحیح نیست.</td>
                <td>رمز عبور صحیح حساب را در <code>signInWithPassword</code> وارد کنید.</td>
              </tr>
              <tr>
                <td><code>FLOOD_WAIT</code></td>
                <td>تعداد درخواست‌های مکرر فراتر از حد مجاز بوده است.</td>
                <td>موتور humanize به طور خودکار تا پایان زمان اعلام‌شده مکث می‌کند.</td>
              </tr>
              <tr>
                <td><code>INVALID_PAN</code></td>
                <td>شماره کارت شتابی وارد شده معتبر نیست.</td>
                <td>شماره کارت ۱۶ رقمی را با الگوریتم Luhn بررسی کنید.</td>
              </tr>
              <tr>
                <td><code>4401 onUnauthenticated</code></td>
                <td>اتصال وب‌سوکت بدون توکن معتبر سشن انجام شده است.</td>
                <td>ابتدا لاگین را کامل کنید و سپس با توکن معتبر متصل شوید.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- بخش سوالات متداول -->
      <section id="faq">
        <h2>سوالات متداول (FAQ)</h2>
        
        <h3>آیا استفاده از این کتابخانه نیاز به دسترسی روت یا گوشی روشن دارد؟</h3>
        <p>خیر، کتابخانه BaleX کامپوننتی مستقل است و بر روی هر سیستم‌عامل (ویندوز، لینوکس، مک، سرور ابری، اندروید و iOS) بدون نیاز به نصب اپ رسمی بله کار می‌کند.</p>

        <h3>چگونه می‌توان روی سرور ایران هاست کرد؟</h3>
        <p>کافیست یک پروژه نودجی‌اس با دستور <code>npm install balex</code> روی سرور ایجاد نموده و فایل اسکریپت خود را با <code>pm2</code> اجرا نگه دارید.</p>

        <h3>آیا با تغییر آی‌پی سشن باطل می‌شود؟</h3>
        <p>خیر، سشن بله متصل به توکن JWT است و تا زمانی که خروج از حساب نزده باشید یا از طریق اپلیکیشن سشن را لغو نکرده باشید، برای ماه‌ها پایدار می‌ماند.</p>
      </section>

    </main>

    <!-- فهرست در این صفحه (TOC شناور سمت چپ) -->
    <aside class="toc-container">
      <div class="toc-title">در این صفحه</div>
      <ul class="toc-list" id="tocList">
        <li class="toc-item"><a href="#intro">معرفی کتابخانه</a></li>
        <li class="toc-item"><a href="#features">ویژگی‌ها</a></li>
        <li class="toc-item"><a href="#installation">نصب و راه‌اندازی</a></li>
        <li class="toc-item"><a href="#quickstart">شروع سریع</a></li>
        <li class="toc-item"><a href="#connection-manage">مدیریت اتصال سوکت</a></li>
        <li class="toc-item"><a href="#auth-start">درخواست پیامک</a></li>
        <li class="toc-item"><a href="#auth-validate">تایید کد ۵ رقمی</a></li>
        <li class="toc-item"><a href="#auth-2fa">تایید دو مرحله‌ای</a></li>
        <li class="toc-item"><a href="#session-restore">بازیابی نشست</a></li>
        <li class="toc-item"><a href="#auth-logout">خروج از حساب</a></li>
        <li class="toc-item"><a href="#send-message">ارسال پیام متنی</a></li>
        <li class="toc-item"><a href="#messaging-read-receipts">تایید تحویل و سین</a></li>
        <li class="toc-item"><a href="#live-updates">سامانه جامع رویدادها (۱۶ ایونت)</a></li>
        <li class="toc-item"><a href="#load-dialogs">لیست گفتگوها</a></li>
        <li class="toc-item"><a href="#load-history">تاریخچه چت</a></li>
        <li class="toc-item"><a href="#send-photo">ارسال عکس</a></li>
        <li class="toc-item"><a href="#send-voice">ارسال ویس</a></li>
        <li class="toc-item"><a href="#send-audio">ارسال موزیک</a></li>
        <li class="toc-item"><a href="#send-video">ارسال ویدیو</a></li>
        <li class="toc-item"><a href="#send-document">ارسال اسناد و فایل</a></li>
        <li class="toc-item"><a href="#send-sticker">ارسال استیکر</a></li>
        <li class="toc-item"><a href="#edit-message">ویرایش پیام</a></li>
        <li class="toc-item"><a href="#forward-messages">فوروارد پیام</a></li>
        <li class="toc-item"><a href="#pin-message">پین کردن پیام</a></li>
        <li class="toc-item"><a href="#delete-messages">حذف پیام</a></li>
        <li class="toc-item"><a href="#clear-chat">پاکسازی چت</a></li>
        <li class="toc-item"><a href="#group-create">ساخت گروه</a></li>
        <li class="toc-item"><a href="#user-profile">پروفایل و مخاطبین</a></li>
        <li class="toc-item"><a href="#contacts-add">افزودن مخاطب</a></li>
        <li class="toc-item"><a href="#profile-edit">ویرایش پروفایل</a></li>
        <li class="toc-item"><a href="#reactions-set">واکنش و ری‌اکشن</a></li>
        <li class="toc-item"><a href="#folders-manage">پوشه‌های گفتگو</a></li>
        <li class="toc-item"><a href="#polls-send">نظرسنجی و کوییز</a></li>
        <li class="toc-item"><a href="#wallet-credit">کیف پول و امتیازات</a></li>
        <li class="toc-item"><a href="#bot-callback">دکمه شیشه‌ای ربات</a></li>
        <li class="toc-item"><a href="#gift-packet-cash">پاکت هدیه نقدی</a></li>
        <li class="toc-item"><a href="#gift-packet-open">باز کردن پاکت نقدی</a></li>
        <li class="toc-item"><a href="#gift-packet-gold">پاکت هدیه طلا</a></li>
        <li class="toc-item"><a href="#gift-packet-gold-open">باز کردن پاکت طلا</a></li>
        <li class="toc-item"><a href="#miniapp-params">ساخت پارامتر مینی‌اپ</a></li>
        <li class="toc-item"><a href="#miniapp-url">آدرس مینی‌اپ</a></li>
        <li class="toc-item"><a href="#miniapp-hash">هش امنیتی وب‌اپ</a></li>
        <li class="toc-item"><a href="#miniapp-send-data">ارسال داده به ربات</a></li>
        <li class="toc-item"><a href="#bale-bot-overview">بازوهای رسمی بله (BaleBot)</a></li>
        <li class="toc-item"><a href="#bale-bot-polling">دریافت آپدیت بات (Polling & Webhook)</a></li>
        <li class="toc-item"><a href="#bale-bot-keyboards">کیبوردهای بازو</a></li>
        <li class="toc-item"><a href="#bale-bot-payments">پرداخت الکترونیکی بله</a></li>
        <li class="toc-item"><a href="#story-manage">استوری‌های بله</a></li>
        <li class="toc-item"><a href="#scheduler-manage">پیام زمان‌بندی شده</a></li>
        <li class="toc-item"><a href="#ai-tldr">هوش مصنوعی و خلاصه‌ساز</a></li>
        <li class="toc-item"><a href="#card-inquiry">استعلام کارت شتابی</a></li>
        <li class="toc-item"><a href="#card-transfer">انتقال کارت به کارت</a></li>
        <li class="toc-item"><a href="#card-balance">موجودی کارت</a></li>
        <li class="toc-item"><a href="#presence-controls">وضعیت آنلاین و تایپ</a></li>
        <li class="toc-item"><a href="#stealth-controls">کنترل رفتار انسانی</a></li>
        <li class="toc-item"><a href="#services-catalog">کاتالوگ ۵۳ سرویس</a></li>
        <li class="toc-item"><a href="#services-explorer">جستجوگر ۶۳۶ متد</a></li>
        <li class="toc-item"><a href="#errors-table">جدول خطاهای سرور</a></li>
        <li class="toc-item"><a href="#faq">سوالات متداول</a></li>
      </ul>
    </aside>

  </div>

  <!-- دکمه بازگشت به بالا -->
  <button class="back-to-top" id="backToTop" title="بازگشت به بالا">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m18 15-6-6-6 6"/></svg>
  </button>

  <!-- اسکریپت‌های تعاملی و دیتا -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-dart.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js"></script>

  <script>
    // دیتای ۶۳۶ متد
    const ALL_METHODS = ${JSON.stringify(methodsData)};

    // تابع کپی کد
    function copyCode(btn) {
      const codeBlock = btn.closest('.code-wrapper')?.querySelector('code') || btn.closest('.method-card')?.querySelector('.method-code-text');
      if (!codeBlock) return;
      const text = codeBlock.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = 'کپی شد! ✓';
        btn.style.background = 'var(--accent-bale)';
        btn.style.color = '#fff';
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      });
    }

    // سوییچ تم تاریک و روشن
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('balex_docs_theme', newTheme);
    });

    const savedTheme = localStorage.getItem('balex_docs_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // منوی موبایل
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // دکمه بازگشت به بالا
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // فیلتر جستجوی سراسری هدر
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const sections = document.querySelectorAll('main section');
      sections.forEach(sec => {
        const text = sec.innerText.toLowerCase();
        if (text.includes(q)) {
          sec.style.display = 'block';
        } else {
          sec.style.display = 'none';
        }
      });
    });

    // اسکرول‌اسپای (Scrollspy)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('main section').forEach(sec => observer.observe(sec));

    // ==========================================
    // لاجیک جستجوگر تعاملی ۶۳۶ متد
    // ==========================================
    let currentDomainFilter = 'all';
    let currentSearchQuery = '';
    let displayedCount = 30;

    const methodSearchInput = document.getElementById('methodSearchInput');
    const methodCountDisplay = document.getElementById('methodCountDisplay');
    const methodsGrid = document.getElementById('methodsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const filterChips = document.getElementById('filterChips');

    function filterMethods() {
      return ALL_METHODS.filter(item => {
        // فیلتر بر اساس دسته
        if (currentDomainFilter !== 'all') {
          if (!item.d.includes(currentDomainFilter)) return false;
        }

        // فیلتر بر اساس متن
        if (currentSearchQuery) {
          const q = currentSearchQuery.toLowerCase();
          const matchMethod = item.m.toLowerCase().includes(q);
          const matchService = item.s.toLowerCase().includes(q);
          const matchNs = item.ns.toLowerCase().includes(q);
          const matchDesc = item.desc && item.desc.toLowerCase().includes(q);
          if (!matchMethod && !matchService && !matchNs && !matchDesc) return false;
        }

        return true;
      });
    }

    function renderMethods() {
      const filtered = filterMethods();
      methodCountDisplay.innerText = 'نمایش ' + Math.min(displayedCount, filtered.length) + ' از ' + filtered.length + ' متد';

      const itemsToShow = filtered.slice(0, displayedCount);
      let html = '';

      itemsToShow.forEach(item => {
        let paramsCode = '';
        if (item.inputs && item.inputs.length > 0) {
          const sampleArgs = item.inputs.map(p => {
            let val = '...';
            if (p.t.startsWith('int') || p.t.startsWith('uint')) val = '0';
            else if (p.t === 'string') val = '""';
            else if (p.t === 'bool') val = 'true';
            else if (p.t.endsWith('[]')) val = '[]';
            else if (p.t === 'bytes') val = 'Buffer.alloc(0)';
            return p.n + ': ' + val;
          }).join(', ');
          paramsCode = '{ ' + sampleArgs + ' }';
        } else {
          paramsCode = '{}';
        }

        const methodCamel = item.m.charAt(0).toLowerCase() + item.m.slice(1);
        const callCode = 'await client.' + item.ns + '.' + methodCamel + '(' + paramsCode + ');';

        let inputsHtml = '';
        if (item.inputs && item.inputs.length > 0) {
          inputsHtml = item.inputs.map(p => 
            '<span class="param-badge"><span class="p-name">' + p.n + '</span>: <span class="p-type">' + p.t + '</span><span class="p-tag">تگ ' + p.tag + '</span></span>'
          ).join('');
        } else {
          inputsHtml = '<span class="param-none">بدون پارامتر ورودی</span>';
        }

        let outputsHtml = '';
        if (item.outputs && item.outputs.length > 0) {
          outputsHtml = item.outputs.map(p => 
            '<span class="param-badge output"><span class="p-name">' + p.n + '</span>: <span class="p-type">' + p.t + '</span>' + (p.tag ? '<span class="p-tag">تگ ' + p.tag + '</span>' : '') + '</span>'
          ).join('');
        } else {
          outputsHtml = '<span class="param-none">void / بدون مقدار بازگشتی</span>';
        }

        html += '<div class="method-card">' +
          '<div class="method-top">' +
            '<div class="method-name-wrap">' +
              '<span class="method-name">' + item.m + '</span>' +
              '<span class="badge-ns">client.' + item.ns + '</span>' +
              '<span class="badge-domain">' + item.d + '</span>' +
            '</div>' +
            '<span class="badge-service">' + item.s + '</span>' +
          '</div>' +
          '<div class="method-desc">' + (item.desc || item.s) + '</div>' +
          '<div class="method-params-container">' +
            '<div class="params-row">' +
              '<div class="params-label">📥 پارامترهای ورودی (' + (item.inputs ? item.inputs.length : 0) + '):</div>' +
              '<div class="params-badges">' + inputsHtml + '</div>' +
            '</div>' +
            '<div class="params-row">' +
              '<div class="params-label">📤 مقادیر خروجی (' + (item.outputs ? item.outputs.length : 0) + '):</div>' +
              '<div class="params-badges">' + outputsHtml + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="method-call-box">' +
            '<span class="method-code-text">' + callCode + '</span>' +
            '<button class="btn-copy" onclick="copyCode(this)">کپی متد</button>' +
          '</div>' +
        '</div>';
      });

      methodsGrid.innerHTML = html || '<div style="padding: 24px; text-align: center; color: var(--text-muted);">متدی با این مشخصات یافت نشد.</div>';

      if (filtered.length > displayedCount) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    methodSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      displayedCount = 30;
      renderMethods();
    });

    filterChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      currentDomainFilter = chip.getAttribute('data-domain');
      displayedCount = 30;
      renderMethods();
    });

    loadMoreBtn.addEventListener('click', () => {
      displayedCount += 30;
      renderMethods();
    });

    // رندر اولیه
    renderMethods();
  </script>
</body>
</html>
`;

fs.writeFileSync('./docs/index.html', html, 'utf8');
fs.writeFileSync('./bale-userbot/docs/index.html', html, 'utf8');
console.log('Successfully generated docs/index.html and synced to bale-userbot/docs/index.html');
