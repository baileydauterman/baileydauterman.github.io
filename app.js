(() => {
  const RESUME_KEY = "resume-builder:content";
  const THEME_KEY = "resume-builder:theme";

  const resume = document.getElementById("resume");
  const themeSelect = document.getElementById("theme-select");

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
