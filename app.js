(() => {
  const RESUME_KEY = "resume-builder:content";
  const THEME_KEY = "resume-builder:theme";

  const resume = document.getElementById("resume");
  const themeSelect = document.getElementById("theme-select");

  const SECTION_TYPES = {
    education: { heading: "Education", template: "tpl-education", addLabel: "+ Add education" },
    skills: { heading: "Skills", template: "tpl-skill", addLabel: "+ Add skill line" },
    experience: { heading: "Experience", template: "tpl-experience", addLabel: "+ Add experience" },
    projects: { heading: "Projects", template: "tpl-project", addLabel: "+ Add project" },
  };

  // plain <br> line breaks instead of nested <div>s when typing multi-line text
  document.execCommand("defaultParagraphSeparator", false, "br");

  // belt-and-suspenders for the print reset: some "export/save as PDF" tools
  // render the page without switching to @media print, but they still fire
  // these events when print() runs, so the html.printing CSS reset applies either way
  window.addEventListener("beforeprint", () => document.documentElement.classList.add("printing"));
  window.addEventListener("afterprint", () => document.documentElement.classList.remove("printing"));

  // ---------- persistence ----------
  const saved = localStorage.getItem(RESUME_KEY);
  if (saved) resume.innerHTML = saved;

  // ---------- undo / redo ----------
  // a snapshot-per-pause history: each debounced typing pause or discrete button
  // click (add/remove entry, move/duplicate/delete section, ...) is one undo step
  const MAX_HISTORY = 100;
  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  let history = [resume.innerHTML];
  let historyIndex = 0;

  const updateUndoRedoButtons = () => {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
  };

  const pushHistory = () => {
    const html = resume.innerHTML;
    if (html === history[historyIndex]) return;
    history = history.slice(0, historyIndex + 1);
    history.push(html);
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    updateUndoRedoButtons();
  };

  const restoreHistory = (index) => {
    historyIndex = index;
    resume.innerHTML = history[historyIndex];
    localStorage.setItem(RESUME_KEY, resume.innerHTML);
    updateUndoRedoButtons();
  };

  updateUndoRedoButtons();

  document.addEventListener("keydown", (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
    e.preventDefault();
    if (e.shiftKey) {
      if (historyIndex < history.length - 1) restoreHistory(historyIndex + 1);
    } else {
      if (historyIndex > 0) restoreHistory(historyIndex - 1);
    }
  });

  let saveTimer;
  const save = () => {
    localStorage.setItem(RESUME_KEY, resume.innerHTML);
    pushHistory();
  };
  const saveSoon = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 300);
  };
  resume.addEventListener("input", saveSoon);

  // ---------- checkpoints: named, persistent save points (separate from the in-memory undo stack) ----------
  const CHECKPOINTS_KEY = "resume-builder:checkpoints";
  const MAX_CHECKPOINTS = 200;

  const historyBtn = document.getElementById("history-btn");
  const historyPanel = document.getElementById("history-panel");
  const historyBackdrop = document.getElementById("history-backdrop");
  const checkpointList = document.getElementById("checkpoint-list");

  const loadCheckpoints = () => {
    try {
      return JSON.parse(localStorage.getItem(CHECKPOINTS_KEY)) || [];
    } catch {
      return [];
    }
  };
  const saveCheckpoints = (list) => localStorage.setItem(CHECKPOINTS_KEY, JSON.stringify(list));

  const formatTimestamp = (ts) =>
    new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  const addCheckpoint = () => {
    const list = loadCheckpoints();
    list.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      label: formatTimestamp(Date.now()),
      html: resume.innerHTML,
    });
    if (list.length > MAX_CHECKPOINTS) list.shift();
    saveCheckpoints(list);
    if (!historyPanel.hidden) renderCheckpoints();
  };

  // auto-checkpoint: fires whenever focus leaves a text box, but skipped if
  // nothing actually changed since the last checkpoint (e.g. just tabbing through fields)
  const addCheckpointIfChanged = () => {
    const list = loadCheckpoints();
    const last = list[list.length - 1];
    if (last && last.html === resume.innerHTML) return;
    addCheckpoint();
  };

  resume.addEventListener("focusout", (e) => {
    if (!e.target.matches("[contenteditable='true']")) return;
    clearTimeout(saveTimer);
    save();
    addCheckpointIfChanged();
  });

  // ---------- word-level diff: what actually changed between two checkpoints ----------
  // compares only the real field text (skips button labels/controls that ride along in the stored HTML)
  const extractCheckpointText = (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return Array.from(temp.querySelectorAll('[contenteditable="true"]'))
      .map((el) => el.textContent.trim())
      .filter(Boolean)
      .join("\n");
  };

  const diffWords = (oldText, newText) => {
    const oldTokens = oldText.split(/(\s+)/);
    const newTokens = newText.split(/(\s+)/);
    const n = oldTokens.length;
    const m = newTokens.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = oldTokens[i] === newTokens[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const ops = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (oldTokens[i] === newTokens[j]) {
        ops.push({ type: "equal", text: oldTokens[i] });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        ops.push({ type: "removed", text: oldTokens[i] });
        i++;
      } else {
        ops.push({ type: "added", text: newTokens[j] });
        j++;
      }
    }
    while (i < n) ops.push({ type: "removed", text: oldTokens[i++] });
    while (j < m) ops.push({ type: "added", text: newTokens[j++] });
    return ops;
  };

  const renderDiff = (oldHtml, newHtml) => {
    const ops = diffWords(extractCheckpointText(oldHtml), extractCheckpointText(newHtml));
    const frag = document.createDocumentFragment();
    if (!ops.some((op) => op.type !== "equal")) {
      const none = document.createElement("span");
      none.className = "checkpoint-diff-empty";
      none.textContent = "No changes.";
      frag.appendChild(none);
      return frag;
    }
    ops.forEach((op) => {
      if (op.type === "equal") {
        frag.appendChild(document.createTextNode(op.text));
      } else {
        const el = document.createElement(op.type === "added" ? "ins" : "del");
        el.textContent = op.text;
        frag.appendChild(el);
      }
    });
    return frag;
  };

  // ---------- checkpoint list rendering ----------
  // per-item UI state: which item (if any) is showing a restore confirmation or an expanded diff
  let confirmingId = null;
  let comparingId = null;

  const renderCheckpoints = () => {
    const list = loadCheckpoints();
    checkpointList.innerHTML = "";
    if (list.length === 0) {
      const empty = document.createElement("li");
      empty.className = "checkpoint-empty";
      empty.textContent = "No checkpoints yet.";
      checkpointList.appendChild(empty);
      return;
    }

    const items = list.map((cp, idx) => {
      const li = document.createElement("li");
      li.className = "checkpoint-item";
      li.dataset.id = cp.id;

      const row = document.createElement("div");
      row.className = "checkpoint-row";

      const label = document.createElement("span");
      label.className = "checkpoint-label";
      label.textContent = cp.label;

      const compareBtn = document.createElement("button");
      compareBtn.type = "button";
      compareBtn.className = "checkpoint-compare-btn";
      compareBtn.textContent = comparingId === cp.id ? "Hide changes" : "Compare";

      const restoreBtn = document.createElement("button");
      restoreBtn.type = "button";
      restoreBtn.className = "checkpoint-restore-btn";
      restoreBtn.textContent = "Restore";

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "checkpoint-delete-btn";
      deleteBtn.title = "Delete checkpoint";
      deleteBtn.textContent = "×";

      row.append(label, compareBtn, restoreBtn, deleteBtn);
      li.appendChild(row);

      if (confirmingId === cp.id) {
        const confirmRow = document.createElement("div");
        confirmRow.className = "checkpoint-confirm";

        const msg = document.createElement("span");
        msg.textContent = "Replace the current resume with this checkpoint?";

        const yesBtn = document.createElement("button");
        yesBtn.type = "button";
        yesBtn.className = "checkpoint-confirm-yes";
        yesBtn.textContent = "Restore";

        const noBtn = document.createElement("button");
        noBtn.type = "button";
        noBtn.className = "checkpoint-confirm-no";
        noBtn.textContent = "Cancel";

        confirmRow.append(msg, yesBtn, noBtn);
        li.appendChild(confirmRow);
      }

      if (comparingId === cp.id) {
        const prevHtml = idx > 0 ? list[idx - 1].html : "";
        const diffBox = document.createElement("div");
        diffBox.className = "checkpoint-diff";
        diffBox.appendChild(renderDiff(prevHtml, cp.html));
        li.appendChild(diffBox);
      }

      return li;
    });

    items.reverse().forEach((li) => checkpointList.appendChild(li));
  };

  const openHistoryPanel = () => {
    confirmingId = null;
    comparingId = null;
    renderCheckpoints();
    historyPanel.hidden = false;
    historyBackdrop.hidden = false;
  };
  const closeHistoryPanel = () => {
    historyPanel.hidden = true;
    historyBackdrop.hidden = true;
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !historyPanel.hidden) closeHistoryPanel();
  });

  // ---------- theme ----------
  const applyTheme = (name) => {
    document.documentElement.setAttribute("data-theme", name);
    themeSelect.value = name;
  };
  applyTheme(localStorage.getItem(THEME_KEY) || "classic");
  themeSelect.addEventListener("change", () => {
    localStorage.setItem(THEME_KEY, themeSelect.value);
    applyTheme(themeSelect.value);
  });

  // ---------- single-line fields: Enter shouldn't insert a line break ----------
  resume.addEventListener("keydown", (e) => {
    if (e.target.matches("[data-single-line]") && e.key === "Enter") {
      e.preventDefault();
    }
  });

  // ---------- paste as plain text: incoming content should pick up the theme's styling, not its source's ----------
  resume.addEventListener("paste", (e) => {
    const target = e.target.closest("[contenteditable='true']");
    if (!target) return;
    e.preventDefault();

    let text = (e.clipboardData || window.clipboardData).getData("text/plain");
    if (target.matches("[data-single-line]")) text = text.replace(/\r?\n/g, " ");

    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const frag = document.createDocumentFragment();
    text.split(/\r?\n/).forEach((line, i) => {
      if (i > 0) frag.appendChild(document.createElement("br"));
      frag.appendChild(document.createTextNode(line));
    });
    const lastNode = frag.lastChild;
    range.insertNode(frag);

    if (lastNode) {
      const after = document.createRange();
      after.setStartAfter(lastNode);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    }
    saveSoon();
  });

  // ---------- add / remove entries (event delegation, works for cloned nodes too) ----------
  document.body.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".add-btn");
    if (addBtn) {
      const tpl = document.getElementById(addBtn.dataset.template);
      const node = tpl.content.firstElementChild.cloneNode(true);
      addBtn.parentElement.querySelector(".entries").appendChild(node);
      node.querySelector("[contenteditable]").focus();
      save();
      return;
    }

    const removeBtn = e.target.closest(".remove-btn");
    if (removeBtn) {
      removeBtn.closest(".entry").remove();
      save();
      return;
    }

    const moveBtn = e.target.closest(".move-up-btn, .move-down-btn");
    if (moveBtn) {
      const section = moveBtn.closest(".section");
      const sibling = moveBtn.matches(".move-up-btn") ? section.previousElementSibling : section.nextElementSibling;
      if (sibling && sibling.classList.contains("section")) {
        section.parentNode.insertBefore(
          moveBtn.matches(".move-up-btn") ? section : sibling,
          moveBtn.matches(".move-up-btn") ? sibling : section
        );
        save();
      }
      return;
    }

    const duplicateBtn = e.target.closest(".duplicate-section-btn");
    if (duplicateBtn) {
      const section = duplicateBtn.closest(".section");
      const clone = section.cloneNode(true);
      section.after(clone);
      const heading = clone.querySelector(".section-head h2");
      heading.focus();
      document.execCommand("selectAll", false, null);
      save();
      return;
    }

    const removeSectionBtn = e.target.closest(".remove-section-btn");
    if (removeSectionBtn) {
      removeSectionBtn.closest(".section").remove();
      save();
      return;
    }

    if (e.target.id === "add-section-btn") {
      const type = document.getElementById("section-type-select").value;
      const info = SECTION_TYPES[type];
      const shell = document.getElementById("tpl-section-shell").content.firstElementChild.cloneNode(true);

      shell.querySelector(".section-head h2").textContent = info.heading;
      const addBtn = shell.querySelector(".add-btn");
      addBtn.dataset.template = info.template;
      addBtn.dataset.section = type;
      addBtn.textContent = info.addLabel;

      const entryTpl = document.getElementById(info.template);
      shell.querySelector(".entries").appendChild(entryTpl.content.firstElementChild.cloneNode(true));

      document.querySelector(".add-section").before(shell);

      const heading = shell.querySelector(".section-head h2");
      heading.focus();
      document.execCommand("selectAll", false, null);
      save();
      return;
    }

    if (e.target.id === "undo-btn") {
      if (historyIndex > 0) restoreHistory(historyIndex - 1);
      return;
    }

    if (e.target.id === "redo-btn") {
      if (historyIndex < history.length - 1) restoreHistory(historyIndex + 1);
      return;
    }

    if (e.target.id === "history-btn") {
      openHistoryPanel();
      return;
    }

    if (e.target.id === "history-close-btn" || e.target.id === "history-backdrop") {
      closeHistoryPanel();
      return;
    }

    if (e.target.id === "save-checkpoint-btn") {
      addCheckpoint();
      return;
    }

    const compareCpBtn = e.target.closest(".checkpoint-compare-btn");
    if (compareCpBtn) {
      const id = compareCpBtn.closest(".checkpoint-item").dataset.id;
      comparingId = comparingId === id ? null : id;
      confirmingId = null;
      renderCheckpoints();
      return;
    }

    // Restore is two-step (in-panel confirm, not window.confirm) — a native confirm()
    // dialog can get silently auto-suppressed by the browser after repeated use on a
    // page, which would make this "confirmation" silently do nothing.
    const restoreCpBtn = e.target.closest(".checkpoint-restore-btn");
    if (restoreCpBtn) {
      confirmingId = restoreCpBtn.closest(".checkpoint-item").dataset.id;
      comparingId = null;
      renderCheckpoints();
      return;
    }

    const confirmYesBtn = e.target.closest(".checkpoint-confirm-yes");
    if (confirmYesBtn) {
      const id = confirmYesBtn.closest(".checkpoint-item").dataset.id;
      const cp = loadCheckpoints().find((c) => c.id === id);
      if (cp) {
        resume.innerHTML = cp.html;
        save();
        closeHistoryPanel();
      }
      confirmingId = null;
      return;
    }

    const confirmNoBtn = e.target.closest(".checkpoint-confirm-no");
    if (confirmNoBtn) {
      confirmingId = null;
      renderCheckpoints();
      return;
    }

    const deleteCpBtn = e.target.closest(".checkpoint-delete-btn");
    if (deleteCpBtn) {
      const id = deleteCpBtn.closest(".checkpoint-item").dataset.id;
      saveCheckpoints(loadCheckpoints().filter((c) => c.id !== id));
      if (confirmingId === id) confirmingId = null;
      if (comparingId === id) comparingId = null;
      renderCheckpoints();
      return;
    }

    if (e.target.id === "print-btn") {
      window.print();
      return;
    }

    if (e.target.id === "reset-btn") {
      if (confirm("Clear all resume content and start over?")) {
        localStorage.removeItem(RESUME_KEY);
        location.reload();
      }
    }
  });

  // ---------- bullet list: Enter adds a bullet, Backspace on an empty one removes it ----------
  const placeCaretAtEnd = (el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  resume.addEventListener("keydown", (e) => {
    const li = e.target.closest(".bullets li");
    if (!li) return;

    if (e.key === "Enter") {
      e.preventDefault();
      const next = document.createElement("li");
      next.contentEditable = "true";
      next.dataset.placeholder = li.dataset.placeholder || "Describe an accomplishment...";
      li.after(next);
      next.focus();
      saveSoon();
      return;
    }

    if (e.key === "Backspace" && li.textContent === "") {
      const list = li.parentElement;
      if (list.children.length > 1) {
        e.preventDefault();
        const prev = li.previousElementSibling || li.nextElementSibling;
        li.remove();
        if (prev) {
          prev.focus();
          placeCaretAtEnd(prev);
        }
        saveSoon();
      }
    }
  });
})();
