const DOCS_STORAGE_KEY = 'miniDocuments';
let docsData = [];

// Initialize docs on load
document.addEventListener('DOMContentLoaded', () => {
  loadDocs();
  setupDocsEventListeners();
});

// Load docs from storage
function loadDocs() {
  chrome.storage.local.get([DOCS_STORAGE_KEY], (result) => {
    if (result[DOCS_STORAGE_KEY]) {
      docsData = result[DOCS_STORAGE_KEY];
    } else {
      docsData = [
        { id: 1, name: 'Untitled Section', content: '', collapsed: false }
      ];
    }
    renderDocSections();
  });
}

// Render all doc sections
function renderDocSections() {
  const docSectionsContainer = document.getElementById('docSections');
  docSectionsContainer.innerHTML = '';

  docsData.forEach((section, index) => {
    const sectionEl = document.createElement('div');
    sectionEl.className = `doc-section ${section.collapsed ? 'collapsed' : ''}`;
    sectionEl.dataset.id = section.id;

    const headerEl = document.createElement('div');
    headerEl.className = 'doc-section-header';

    const collapseIcon = document.createElement('span');
    collapseIcon.className = 'collapse-icon';
    collapseIcon.textContent = '▶';
    headerEl.appendChild(collapseIcon);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = section.name;
    nameInput.placeholder = 'Section name...';
    nameInput.addEventListener('change', () => updateSectionName(section.id, nameInput.value));
    headerEl.appendChild(nameInput);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSection(section.id);
    });
    headerEl.appendChild(deleteBtn);

    headerEl.addEventListener('click', () => toggleSection(section.id));
    sectionEl.appendChild(headerEl);

    const contentEl = document.createElement('div');
    contentEl.className = 'doc-section-content';

    const textarea = document.createElement('textarea');
    textarea.value = section.content;
    textarea.placeholder = 'Start typing...';
    textarea.addEventListener('input', () => updateSectionContent(section.id, textarea.value));
    contentEl.appendChild(textarea);

    sectionEl.appendChild(contentEl);
    docSectionsContainer.appendChild(sectionEl);
  });
}

// Toggle section collapse
function toggleSection(id) {
  const section = docsData.find(s => s.id === id);
  if (section) {
    section.collapsed = !section.collapsed;
    saveDocs();
    renderDocSections();
  }
}

// Update section name
function updateSectionName(id, newName) {
  const section = docsData.find(s => s.id === id);
  if (section) {
    section.name = newName || 'Untitled Section';
    saveDocs();
  }
}

// Update section content
function updateSectionContent(id, newContent) {
  const section = docsData.find(s => s.id === id);
  if (section) {
    section.content = newContent;
    saveDocs();
  }
}

// Delete section
function deleteSection(id) {
  if (confirm('Delete this section?')) {
    docsData = docsData.filter(s => s.id !== id);
    saveDocs();
    renderDocSections();
  }
}

// Setup button event listeners
function setupDocsEventListeners() {
  document.getElementById('addDocSectionBtn').addEventListener('click', addDocSection);
}

// Add new doc section
function addDocSection() {
  const newId = Math.max(...docsData.map(d => d.id), 0) + 1;
  docsData.push({
    id: newId,
    name: `Section ${newId}`,
    content: '',
    collapsed: false
  });
  saveDocs();
  renderDocSections();
}

// Save docs to storage
function saveDocs() {
  chrome.storage.local.set({ [DOCS_STORAGE_KEY]: docsData });
}
