const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const out = $("#output");
const preview = $("#preview");
const STORAGE_KEY = "code-web";


const escapeHtml = s => 
   String(s).replace(/[&<>"]/g, c => ({

       '&': "&amp;",
       '<': "&lt;",
       '>': "&gt;",
       '"': "&quot;"

   }[c]));


// Storage service

const StorageService = {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  load(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },

  remove(key) {
    localStorage.removeItem(key);
  }
};

// File Service
const FileService = {
  download(filename, data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  },

  async readFile(file) {
    const text = await file.text();
    return JSON.parse(text);
  }
}

class Logger {
  constructor(out, appConsole) {
    this.out = out;
  }

  log(msg, type = 'info', ...args) {
    const color = 
        type === 'error' ? 'var(--err)' :
        type === 'warn' ? 'var(--warn)' :
        'var(--brand)';
    
    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.innerHTML =`<span style ="color:${color}">[${time}]</span> ${escapeHtml(msg)}`;

    this.out.appendChild(line);
    this.out.scrollTop = this.out.scrollHeight;
  }
  
  clear() {
    this.out.innerHTML = "";
  }
  
}

const logger = new Logger(out); 

$("#clearOut")?.addEventListener("click", () => logger.clear());




function makeEditor(id, mode) {
  const ed = ace.edit(id, {
    theme: "ace/theme/dracula",
    mode, 
    tabSize: 2, 
    useSoftTabs: true, 
    showPrintMargin: false,
    wrap: true
  });

  ed.session.setUseWrapMode(true);

  ed.commands.addCommand({
    name: "run",
    bindKey: {
      win: 'ctrl-Enter',
      mac: 'command-Enter',
    },
    exec() { runWeb(); }
  });

  ed.commands.addCommand({
    name:"save",
    bindKey: {
      win: 'ctrl-S',
      mac: 'command-S',
    },
    exec() { saveProject(); }
  });

  return ed;
}


const ed_html = makeEditor("ed_html", "ace/mode/html");
const ed_css = makeEditor("ed_css", "ace/mode/css");
const ed_js = makeEditor("ed_js", "ace/mode/javascript");

const TAB_ORDER = ["html", "css", "js"];
const wraps = Object.fromEntries($$('#webEditors .editor-wrap').map(w => [w.dataset.pane, w]));
const editors = {
  html: ed_html,
  css: ed_css,
  js: ed_js,
};

function activePane() {
  const t = $('.webTabs .tab.active')
  return t ? t.dataset.pane : 'html';
}


function showPane(name) {
  TAB_ORDER.forEach(k => {
    if (wraps[k]) wraps[k].hidden = (k !== name); 
  });

  $$('#webTabs .tab').forEach(t => {
    const on = t.dataset.pane === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
  });
   
   requestAnimationFrame(() => {
    const ed = editors[name];
    if (ed && ed.resize) {
      ed.resize(true);
      ed.focus();
    }
   });
}


$("#webTabs")?.addEventListener("click", (e) => {
  const btn = e.target.closest('.tab'); 
  if (!btn) return;
  showPane(btn.dataset.pane);
})

$("#webTabs")?.addEventListener("keydown", (e) => {
  const idx = TAB_ORDER.indexOf(activePane());

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    const delta = e.key === "ArrowLeft" ? -1 : 1;
    showPane(TAB_ORDER[(idx + delta + TAB_ORDER.length) % TAB_ORDER.length]);
    e.preventDefault();
  }
});

showPane("html");

function buildWebSrcdoc() {
  const html = ed_html.getValue();
  const css = ed_css.getValue();
  const js = ed_js.getValue();
  const tests = ($("#testArea")?.value || "").trim();

  return `<!DOCTYPE html>
  <html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${css}\n</style>
  </head>
  <body>
    ${html}
    <script>
     try {
        ${js}
        ${tests ? `\n/* tests*/\n${tests}` : ''} 
     } catch (e) {
        console.error(e);
     }
    <\/script>
  </body>
  </html>`;
}

function runWeb() {

  const html = ed_html.getValue();
  const css = ed_css.getValue();
  const js = ed_js.getValue();

  const selfClosing = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
  const openTags = [...html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*>/gi)]
    .map(m => m[1])
    .filter(t => !selfClosing.includes(t));

  const closeTags = [...html.matchAll(/<\/([a-z][a-z0-9]*)>/gi)].map(m => m[1]);

    if (openTags.length !== closeTags.length) {
      logger.log('HTML Warning: Possible mismatched tags', 'warn');
    }


  
  if (css.trim()) {
   const openBraces = (css.match(/{/g) || []).length;
   const closeBraces = (css.match(/}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    logger.log('CSS Warning: Mismatched braces { }', 'warn');
  }

  }

  
  if (js.trim()) {
    try {
      new Function(js);
    } catch (e) {
      logger.log('JavaScript Syntax Error:' + e.message, 'error');
      return;
    }
  }
    
  preview.srcdoc = buildWebSrcdoc();
  logger.log('Web preview updated');
}

  $("#runWeb")?.addEventListener("click", () => runWeb());
  $("#openPreview")?.addEventListener("click", () => {
    const src = buildWebSrcdoc(false);
    const w = window.open('about:blank');
    w.document.open();
    w.document.write(src);
    w.document.close();
  });

function projectJSON() {
  return {
    version: 1,
    kind: 'web-only',
    html: ed_html.getValue(),
    css: ed_css.getValue(),
    js: ed_js.getValue()
  };
}


function setDefaultContent() {
  ed_html.setValue(`<!-- Welcome card -->
<section class="card" style="max-width:520px;margin:24px auto;padding:18px;text-align:center">
  <h1>Welcome to the code editor</h1>
  <p>This example runs locally in the browser.</p>
  <button id="btn">Try me</button>
</section>`, -1);

  ed_css.setValue(`body{font-family:system-ui;background:lightgreen;margin:0}
h1{color:#0f172a}
#btn{padding:.75rem 1rem;border:0;border-radius:10px;background:#60a5fa;color:#08111f;font-weight:700}`, -1);

  ed_js.setValue(`document.getElementById('btn').addEventListener('click',()=>alert('Well done!'));
console.log('Hello from JavaScript!');`, -1);
}

function saveProject() {
  try {
    const project = projectJSON();
    StorageService.save(STORAGE_KEY, project);
    FileService.download("project.json", project);
    logger.log("Project saved locally and downloaded as JSON file.")
  } catch (e) {
    logger.log("Error saving project: " + e, "error");
  }
}

function normalizeProject(raw){
  if (!raw || typeof raw !== 'object') throw new Error('Not an object');
 
  const html = typeof raw.html === 'string' ? raw.html : (raw.web && raw.web.html) || '';
  const css = typeof raw.css === 'string' ? raw.css : (raw.web && raw.web.css ) || '';
  const js = typeof raw.js === 'string' ? raw.js : (raw.web && raw.web.js  ) || '';

  return {
    version: 1,
    kind: 'web-only',
    assignment: typeof raw.assignment === 'string' ? raw.assignment : (raw.task || ''),
    test: typeof raw.test === 'string' ? raw.test : (raw.tests || ''),
    html, css, js
  };
}

function loadProject(raw) {
  const proj = normalizeProject(raw);
 
  if (typeof ed_html?.setValue === 'function') ed_html.setValue(proj.html, -1);
  if (typeof ed_css?.setValue  === 'function') ed_css.setValue(proj.css, -1);
  if (typeof ed_js?.setValue   === 'function') ed_js.setValue(proj.js, -1);
  logger.log('Project loaded.');
}


// Buttons
const saveBtn = $("#saveBtn");
const loadBtn = $("#loadBtn");
const openFile = $("#openFile");

saveBtn?.addEventListener("click", saveProject);

loadBtn?.addEventListener("click", () => openFile?.click());

openFile?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const project = await FileService.readFile(file);
    loadProject(project);
    logger.log("Project loaded from file");
  } catch (err) {
    logger.log("Invalid project file: " + err, "error");
  }
});

$(".remove")?.addEventListener("click", () => {
  document.querySelector('.outt')?.classList.remove('open');
})


document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && (event.key === 'j' || event.key === 'J')) {
    event.preventDefault(); 
    const outt = document.querySelector('.outt');
    if (outt) {
      outt.classList.toggle('open');
    } 
  }
});

const consoleBtn = document.querySelector('.console-btn')

consoleBtn.addEventListener('click', function() {
  const outt = document.querySelector('.outt');
  if (outt) {
    outt.classList.toggle('open');
  }
});

const initializeEditor = () => {
  try {
    const cached = StorageService.load(STORAGE_KEY);
    if(cached) {
      loadProject(cached);
      logger.log("Project restored from local storage");
    } else {
      setDefaultContent();
    }
    logger.log("Code editor ready. Press Ctrl+S to save, Ctrl+Enter to run.");
  } catch (e) {
    setDefaultContent();
    logger.log("Failed to restore project, loading defaults", "warn");
  }
}


if (typeof ace !== 'undefined') {
  initializeEditor();
} else {
  window.addEventListener('load', initializeEditor);
};


