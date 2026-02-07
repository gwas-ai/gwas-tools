// Data storage
let spreadsheetData = {};
const STORAGE_KEY = 'miniSpreadsheet';
const STORAGE_SCREENSHOTS_KEY = 'miniSpreadsheetScreenshots';
const COLUMNS = ['A', 'B', 'C', 'D'];
const INITIAL_ROWS = 10;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  setupTabNavigation();
  loadData();
  initializeTable();
  setupEventListeners();
  setupScreenshotButton();
});

// Tab navigation
function setupTabNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked tab
      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
}

// Screenshot functionality
function setupScreenshotButton() {
  const screenshotBtn = document.getElementById('screenshotBtn');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', captureScreenshot);
  }
}

async function captureScreenshot() {
  try {
    // Get the app container
    const appContainer = document.getElementById('app-container');
    
    // Use html2canvas library (you'll need to add this to manifest and HTML)
    // For now, we'll create a simple data URL version
    const canvas = await html2canvas(appContainer, {
      backgroundColor: '#fff',
      scale: 2,
      logging: false
    });

    const imageData = canvas.toDataURL('image/png');
    
    // Save to Chrome storage
    chrome.storage.local.get([STORAGE_SCREENSHOTS_KEY], (result) => {
      const screenshots = result[STORAGE_SCREENSHOTS_KEY] || [];
      
      const newScreenshot = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        data: imageData,
        tabActive: document.querySelector('.tab-btn.active').dataset.tab
      };
      
      screenshots.push(newScreenshot);
      
      // Keep only last 20 screenshots to avoid storage limits
      if (screenshots.length > 20) {
        screenshots.shift();
      }
      
      chrome.storage.local.set({ [STORAGE_SCREENSHOTS_KEY]: screenshots }, () => {
        showNotification('Screenshot saved!');
      });
    });
  } catch (error) {
    console.error('Screenshot failed:', error);
    showNotification('Screenshot failed: ' + error.message, 'error');
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Load data from Chrome storage
function loadData() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    if (result[STORAGE_KEY]) {
      spreadsheetData = result[STORAGE_KEY];
    } else {
      initializeData();
    }
  });
}

// Initialize spreadsheet data structure
function initializeData() {
  spreadsheetData = {};
  for (let row = 1; row <= INITIAL_ROWS; row++) {
    spreadsheetData[row] = {};
    COLUMNS.forEach(col => {
      spreadsheetData[row][col] = '';
    });
  }
  saveData();
}

// Create and populate table
function initializeTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  
  const rowCount = Object.keys(spreadsheetData).length || INITIAL_ROWS;
  
  for (let row = 1; row <= rowCount; row++) {
    const tr = document.createElement('tr');
    
    // Row header
    const rowHeader = document.createElement('td');
    rowHeader.className = 'row-header';
    rowHeader.textContent = row;
    tr.appendChild(rowHeader);
    
    // Cells
    COLUMNS.forEach(col => {
      const td = document.createElement('td');
      td.id = `cell-${col}${row}`;
      td.className = 'data-cell';
      td.contentEditable = true;
      td.textContent = spreadsheetData[row]?.[col] || '';
      
      td.addEventListener('input', (e) => handleCellInput(col, row, e));
      td.addEventListener('blur', (e) => handleCellBlur(col, row, e));
      td.addEventListener('keydown', (e) => handleKeydown(e, col, row));
      
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  }
}

// Handle cell input
function handleCellInput(col, row, event) {
  const value = event.target.textContent;
  spreadsheetData[row][col] = value;
}

// Handle cell blur (when user leaves cell)
function handleCellBlur(col, row, event) {
  const cellId = `cell-${col}${row}`;
  const cell = document.getElementById(cellId);
  const value = cell.textContent;
  
  // Evaluate formulas
  if (value.startsWith('=')) {
    try {
      const result = evaluateFormula(value, row);
      cell.textContent = result;
      cell.classList.add('formula-cell');
      spreadsheetData[row][col] = value;
    } catch (error) {
      cell.textContent = '#ERROR';
      cell.classList.add('formula-cell');
    }
  } else {
    cell.classList.remove('formula-cell');
    spreadsheetData[row][col] = value;
  }
  
  saveData();
}

// Keyboard navigation
function handleKeydown(event, col, row) {
  const colIndex = COLUMNS.indexOf(col);
  
  if (event.key === 'Tab') {
    event.preventDefault();
    const nextColIndex = event.shiftKey ? colIndex - 1 : colIndex + 1;
    
    if (nextColIndex >= 0 && nextColIndex < COLUMNS.length) {
      const nextCell = document.getElementById(`cell-${COLUMNS[nextColIndex]}${row}`);
      nextCell.focus();
    }
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const nextCell = document.getElementById(`cell-${col}${row + 1}`);
    if (nextCell) nextCell.focus();
  } else if (event.key === 'ArrowUp' && row > 1) {
    event.preventDefault();
    document.getElementById(`cell-${col}${row - 1}`).focus();
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    const nextCell = document.getElementById(`cell-${col}${row + 1}`);
    if (nextCell) nextCell.focus();
  } else if (event.key === 'ArrowLeft' && colIndex > 0) {
    event.preventDefault();
    document.getElementById(`cell-${COLUMNS[colIndex - 1]}${row}`).focus();
  } else if (event.key === 'ArrowRight' && colIndex < COLUMNS.length - 1) {
    event.preventDefault();
    document.getElementById(`cell-${COLUMNS[colIndex + 1]}${row}`).focus();
  }
}

// Formula evaluation
function evaluateFormula(formula, currentRow) {
  let expression = formula.substring(1);
  
  expression = expression.replace(/([A-D])(\\d+)/g, (match, col, row) => {
    const cellValue = spreadsheetData[row]?.[col];
    const numValue = parseFloat(cellValue);
    return isNaN(numValue) ? 0 : numValue;
  });
  
  try {
    return eval(expression);
  } catch (error) {
    return '#ERROR';
  }
}

// Save data to Chrome storage
function saveData() {
  chrome.storage.local.set({ [STORAGE_KEY]: spreadsheetData });
}

// Setup event listeners for buttons
function setupEventListeners() {
  document.getElementById('addRowBtn').addEventListener('click', addRow);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
}

// Add a new row
function addRow() {
  const newRowNum = Math.max(...Object.keys(spreadsheetData).map(Number)) + 1;
  spreadsheetData[newRowNum] = {};
  COLUMNS.forEach(col => {
    spreadsheetData[newRowNum][col] = '';
  });
  saveData();
  initializeTable();
}

// Clear all data
function clearAll() {
  if (confirm('Clear all data? This cannot be undone.')) {
    initializeData();
    initializeTable();
  }
}
