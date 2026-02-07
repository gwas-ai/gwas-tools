# Mini Office Suite - Chrome Extension

## Architecture & Design Documentation

### Overview

Mini Office Suite is a lightweight Chrome side panel extension that provides mini versions of Google Sheets and Google Docs functionality, optimized for quick note-taking, calculations, and document drafting while browsing.

### Color Palette

#### Google Sheets (Green Theme)
- **Primary**: `#34A853` (Google Sheets Green)
- **Light Background**: `#F0FFF4` (Pale Green)
- **Focus State**: `#2D8659` (Dark Green)
- **Cell Highlight**: `#FEF3C7` (Light Yellow on focus)

#### Google Docs (Blue Theme)
- **Primary**: `#4285F4` (Google Docs Blue)
- **Light Background**: `#E8F0FE` (Pale Blue)
- **Focus State**: `#3367D6` (Dark Blue)
- **Dark Text**: `#1F2937` (Near Black)

### Project Structure
```
mini-office-suite/
├── manifest.json          # Extension configuration
├── sidepanel.html         # Main UI structure
├── styles.css             # Styling for both tabs
├── script.js              # Sheets & screenshot logic
├── docs-script.js         # Docs tab functionality
├── README.md              # Installation & usage
└── DESIGN.md              # This file
```

### Core Features

#### 1. Mini Spreadsheet (Sheets Tab)
- **Grid Layout**: 4 columns (A-D) with dynamic row addition
- **Editable Cells**: `contenteditable` divs for direct input
- **Formula Support**: Simple arithmetic expressions starting with `=`
  - Example: `=A1+B1*2`
- **Keyboard Navigation**: 
  - Tab: Move right
  - Shift+Tab: Move left
  - Enter: Move down
  - Arrow Keys: Navigate in all directions
- **Data Persistence**: Chrome Storage API saves all data
- **Storage Key**: `miniSpreadsheet`

#### 2. Mini Documents (Docs Tab)
- **Collapsible Sections**: Click header to expand/collapse
- **Editable Names**: Click section name to rename
- **Rich Text Areas**: Multi-line textarea for content
- **Delete Sections**: Remove unwanted sections with confirmation
- **Data Persistence**: All docs saved to Chrome Storage
- **Storage Key**: `miniDocuments`

#### 3. Screenshot Feature
- **Capture**: Takes PNG screenshot of current active panel
- **Storage**: Saves to `miniSpreadsheetScreenshots` in Chrome Storage
- **Metadata**: Stores timestamp and active tab info
- **Limit**: Keeps only last 20 screenshots to manage storage
- **Library**: Uses html2canvas for cross-browser compatibility

### UI Components

#### Tab Navigation
- Clean tab switcher at top of panel
- Active tab indicated by blue/green bottom border
- Smooth transitions between tabs

#### Buttons
- **Sheets**: Green buttons (`#34A853`)
  - "+ Row": Add new spreadsheet row
  - "Clear": Delete all spreadsheet data (with confirmation)
  - "📸 Screenshot": Capture current sheet
  
- **Docs**: Blue buttons (`#4285F4`)
  - "+ Section": Add new document section
  - "📸 Screenshot": Capture current doc

#### Table (Sheets)
- Light green header row (`#F0FFF4`)
- Row numbers in left column (non-editable)
- All data cells are contenteditable
- Formula cells show in green monospace
- Focus ring in green on input

#### Sections (Docs)
- Light blue header (`#E8F0FE`)
- Collapsible with smooth animation
- Editable section titles
- Red delete button (`#EA4335`)
- Light gray textarea background (`#FAFAFA`)

### Data Storage Architecture

#### Chrome Storage Format
```javascript
// Spreadsheet Data
{
  "miniSpreadsheet": {
    "1": { "A": "value", "B": "=A1*2", "C": "", "D": "" },
    "2": { "A": "10", "B": "20", "C": "", "D": "" },
    ...
  }
}

// Documents Data
{
  "miniDocuments": [
    {
      "id": 1,
      "name": "Project Notes",
      "content": "This is my project...",
      "collapsed": false
    },
    ...
  ]
}

// Screenshots
{
  "miniSpreadsheetScreenshots": [
    {
      "id": 1707234567890,
      "timestamp": "2/7/2025, 3:45:22 PM",
      "data": "data:image/png;base64,...",
      "tabActive": "sheets"
    },
    ...
  ]
}
```

### Future Enhancements

#### Phase 2: Advanced Features
- [ ] Export to CSV/JSON
- [ ] Import from Google Sheets via API
- [ ] Advanced formulas (SUM, AVERAGE, COUNT)
- [ ] Cell formatting (bold, italic, colors)
- [ ] Column width adjustment
- [ ] Search & replace functionality

#### Phase 3: Docs Enhancements
- [ ] Rich text formatting
- [ ] Markdown support
- [ ] Headings & styles
- [ ] Lists (ordered/unordered)
- [ ] Export to PDF

#### Phase 4: Integration
- [ ] Sync with Google Sheets
- [ ] Sync with Google Docs
- [ ] Cloud backup
- [ ] Multi-device sync

### Performance Considerations

1. **Storage Limits**: Chrome Storage API has ~10MB limit
   - Screenshot compression to keep under limit
   - Auto-delete old screenshots (max 20)

2. **Rendering**: 
   - Spreadsheet limited to manageable rows
   - Virtual scrolling for future large datasets
   - Lazy loading for screenshots

3. **Formula Evaluation**:
   - Simple eval() for now (safe because internal use)
   - Consider safer expression parser for future

### Browser Compatibility
- Chrome 88+
- Edge 88+
- Opera 74+
- Brave (full support)
- Note: html2canvas may have slight rendering differences between browsers

### Manifest Permissions
```json
{
  "permissions": ["sidePanel", "storage"],
  "side_panel": {
    "default_path": "sidepanel.html"
  }
}
```

### CSS Features Used
- CSS Grid & Flexbox layouts
- CSS Transitions for smooth interactions
- contenteditable HTML attribute
- CSS Variables (future enhancement candidate)

### Testing Checklist
- [ ] Add row creates new editable cells
- [ ] Formulas calculate correctly
- [ ] Clear data requires confirmation
- [ ] Tab switching preserves data
- [ ] Section collapse/expand works smoothly
- [ ] Section names are editable
- [ ] Screenshots save to storage
- [ ] Data persists after browser restart
- [ ] Keyboard navigation works in sheets
- [ ] No formula calculation errors on delete

### Known Limitations
1. No real-time collaboration
2. Formulas limited to basic arithmetic
3. No formatting options
4. Screenshots limited to visible panel size
5. No data backup beyond Chrome Storage

### Contributing
When adding features, maintain:
- Google Design Language principles
- Consistent color usage
- Keyboard navigation support
- Data persistence for all changes
- Chrome Storage API compatibility
