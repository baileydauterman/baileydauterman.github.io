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

  let saveTimer;
  const save = () => localStorage.setItem(RESUME_KEY, resume.innerHTML);
  const saveSoon = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 300);
  };
  resume.addEventListener("input", saveSoon);

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
