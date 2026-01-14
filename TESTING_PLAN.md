# Research Hub - Comprehensive Testing & Debugging Plan

## Overview
This document outlines all test cases, edge cases, and debugging strategies for the Research Hub application.

---

## 1. Core Paper Management

### 1.1 Add Paper via Upload
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Upload PDF | Click "Add Paper" → Select PDF file | Paper added with extracted filename, preview shows | High |
| Upload DOC | Click "Add Paper" → Select .docx file | Paper added, file placeholder shown | High |
| Upload large file (>50MB) | Upload very large PDF | Handle gracefully, show progress or error | Medium |
| Upload invalid file | Upload .exe or unsupported file | Show error toast, reject file | High |
| Cancel upload | Start upload → Cancel before complete | No paper created | Low |

### 1.2 Edit Paper Details
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Edit title | Select paper → Change title → Click outside | Title persists after page reload | High |
| Edit authors | Add/remove authors | Authors update correctly | High |
| Change status | Toggle To Read → Reading → Read | Status badge updates, counters update | High |
| Add tags | Type tags separated by comma | Tags display on card | Medium |
| Set submission deadline | Select date in deadline picker | Deadline badge appears on card | High |
| Assign to project | Select project from dropdown | Project badge appears on card | High |

### 1.3 Delete Paper
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Delete single paper | Open paper → Click trash icon | Paper removed, toast shown | High |
| Confirm before delete | Click delete | Should have confirmation or undo | Medium |
| Delete with project association | Delete paper assigned to project | Project paper count decreases | Medium |

---

## 2. Project Management

### 2.1 Create Project
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Create with name only | Enter name → Save | Project appears in list | High |
| Create with all fields | Name + Description + Color + Status | All details saved | High |
| Create with empty name | Try to save without name | Show validation error | High |
| Color picker | Select different colors | Color persists on card | Medium |

### 2.2 Edit Project
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Change status | Edit → Change status | Status badge updates | High |
| Update color | Change color | Card border updates | Medium |
| Progress tracking | Assign papers to project | Progress bar updates based on paper statuses | High |

### 2.3 Delete Project
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Delete empty project | Delete project with no papers | Project removed cleanly | High |
| Delete project with papers | Delete project that has assigned papers | Papers remain, projectId cleared | High |

---

## 3. Deadline Tracker

### 3.1 Create Deadline
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Basic deadline | Title + Due date | Appears in list with urgency badge | High |
| Past date deadline | Set date in the past | Shows as "Overdue" with red styling | High |
| Today's deadline | Set today's date | Shows as "Today" with critical styling | High |
| Far future deadline | Set date 30+ days out | Shows as "low" urgency | Medium |

### 3.2 Urgency Indicators
| Test Case | Days Until | Expected Indicator |
|-----------|------------|-------------------|
| Overdue | < 0 | Red "Overdue" badge |
| Critical | 0-1 | Red pulsing badge |
| High | 2-3 | Orange badge |
| Medium | 4-7 | Yellow badge |
| Low | 8+ | Green badge |

### 3.3 Complete/Delete
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Mark complete | Click checkbox | Strikethrough, faded styling | High |
| Uncomplete | Click completed checkbox | Returns to normal | Medium |
| Delete deadline | Click delete button | Removed from list | High |

---

## 4. Collaborator Management

### 4.1 Add Collaborator
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Add with all fields | Name + Email + Role + Affiliation | Avatar with initials appears | High |
| Add minimal | Name only | Collaborator appears | Medium |
| Invalid email | Enter invalid email format | Show validation error | Medium |

### 4.2 Edit/Delete
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Edit role | Change role | Updated immediately | Medium |
| Delete collaborator | Click delete | Removed from list | High |

---

## 5. PDF Viewer (New Feature)

### 5.1 Basic Functionality
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Open PDF | Upload PDF → Click "Full View" | Full-screen viewer opens | High |
| Zoom in/out | Click +/- buttons | PDF scales correctly | High |
| Reset zoom | Click "Reset" | Returns to 100% | Medium |
| Dark mode toggle | Click sun/moon icon | PDF colors invert | High |
| Close viewer | Press Escape or click Close | Returns to main view | High |

### 5.2 Keyboard Shortcuts
| Key Combo | Expected Action |
|-----------|-----------------|
| Escape | Close viewer |
| Ctrl++ | Zoom in |
| Ctrl+- | Zoom out |
| Ctrl+F | Open search bar |

### 5.3 Edge Cases
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Corrupted PDF | Upload corrupted file | Show error or placeholder | Medium |
| Very large PDF (100+ pages) | Open large document | Should load without crashing | High |
| Password-protected PDF | Upload protected PDF | Show appropriate error | Low |

---

## 6. AI Research Assistant (New Feature)

### 6.1 Chat Functionality
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Open assistant | Click ✨ button | Panel slides in | High |
| Send message | Type → Press Enter | Message appears, loading indicator, then response | High |
| Quick actions | Click "Summarize" button | Pre-fills input | Medium |
| Close assistant | Click outside or X | Panel closes | High |

### 6.2 Context Awareness
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| With paper selected | Select paper → Open AI → Ask question | Response considers paper abstract | High |
| Without paper | Open AI without selection | Generic response | Medium |

### 6.3 Error Handling
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| No API key | Send message without API_KEY env | Shows error message | High |
| Network error | Send message with network off | Shows error message | High |
| Rate limited | Send many requests quickly | Handles gracefully | Medium |

---

## 7. BibTeX Importer (New Feature)

### 7.1 Paste Mode
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Valid single entry | Paste valid BibTeX | Entry appears in preview | High |
| Valid multiple entries | Paste 5+ entries | All entries parsed | High |
| Invalid BibTeX | Paste malformed content | Show error message | High |
| Empty paste | Click Parse with empty textarea | Show validation message | Medium |

### 7.2 File Upload
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Upload .bib file | Drop or select .bib file | File parsed, entries shown | High |
| Upload .txt file | Select .txt with BibTeX content | Should parse correctly | Medium |
| Upload non-BibTeX file | Select random .txt file | Show parse error | Medium |

### 7.3 Selection & Import
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Select all | Click "Select All" | All entries checked | Medium |
| Select none | Click "Select None" | All entries unchecked | Medium |
| Partial import | Uncheck some → Import | Only selected imported | High |
| Duplicate handling | Import same entry twice | Handle duplicates gracefully | Medium |

---

## 8. Notification Center (New Feature)

### 8.1 Basic Functionality
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Open dropdown | Click bell icon | Dropdown appears | High |
| Empty state | No notifications | Shows "No notifications" | Medium |
| Unread badge | Have unread notifications | Badge shows count | High |
| Mark as read | Click notification | Removes unread styling | High |
| Mark all read | Click "Mark all read" | All notifications marked | Medium |

### 8.2 Quiet Mode
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Enable quiet mode | Click quiet toggle | Only critical notifications shown | High |
| Disable quiet mode | Click toggle again | All notifications shown | High |
| Badge in quiet mode | Have non-critical unread | Badge should reflect filtered count | Medium |

### 8.3 Notification Types
| Type | Icon | Styling |
|------|------|---------|
| info | Clock | Blue background |
| deadline | Calendar | Red background |
| warning | Alert | Orange background |
| success | Check | Green background |

---

## 9. View Toggle (Grid/List)

### 9.1 Toggle Functionality
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Switch to list | Click ☰ | Papers display as list items | High |
| Switch to grid | Click ⊞ | Papers display as cards | High |
| Persist preference | Toggle → Refresh page | Should remember choice | Medium |

### 9.2 List View Features
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| All info visible | View list | Title, authors, year, status visible | High |
| Click to select | Click list item | Right panel opens | High |
| Hover popup | Hover over list item | Smart popup appears | Medium |

---

## 10. Smart Popups (Hover)

### 10.1 Popup Behavior
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Hover delay | Hover over paper card | Popup appears after 500ms | Medium |
| Mouse leave | Move mouse away | Popup disappears | High |
| Quick actions | Click "View Details" in popup | Right panel opens | High |
| DOI link | Click DOI in popup | Opens in new tab | Medium |

### 10.2 Edge Cases
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Near edge of screen | Hover paper near bottom-right | Popup adjusts position to stay visible | Medium |
| Rapid hover | Quickly hover multiple papers | No overlapping popups | Medium |

---

## 11. Markdown Notes

### 11.1 Editor Functionality
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Toggle edit mode | Click "Edit" | Textarea appears with toolbar | High |
| Toolbar insert | Click "B" button | **bold** inserted | Medium |
| Preview mode | Click "Preview" | Formatted content shown | High |

### 11.2 Formatting Support
| Syntax | Expected Result |
|--------|-----------------|
| `# Heading` | H1 styled heading |
| `**bold**` | Bold text |
| `*italic*` | Italic text |
| `` `code` `` | Inline code |
| `- item` | Bullet list |
| `> quote` | Blockquote |
| `$formula$` | Math formula styling |

---

## 12. Workflow Tracker

### 12.1 Journey Creation
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Create journey | Enter name → Click Start | Journey appears with stages | High |
| Empty name | Try to start without name | Use default name or validate | Medium |

### 12.2 Stage Progress
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Complete stage | Click stage indicator | Stage marked complete | High |
| Skip ahead | Complete stage 5 directly | Stages 1-4 also complete | Medium |
| Progress bar | Complete stages | Bar fills proportionally | High |

---

## 13. Export Functionality

### 13.1 CSV Export
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Export all papers | Click CSV export | Downloads file with all papers | High |
| Empty library | Export with no papers | Handle gracefully (empty file or warning) | Medium |
| Special characters | Export paper with special chars in title | CSV properly escaped | Medium |

### 13.2 BibTeX Export
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Export all | Click BibTeX export | Downloads .bib file | High |
| Valid format | Open exported file | Valid BibTeX syntax | High |
| Re-import | Export → Import same file | Papers restored correctly | Medium |

---

## 14. Local Storage Persistence

### 14.1 Data Persistence
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Papers persist | Add paper → Refresh | Paper still exists | Critical |
| Projects persist | Create project → Refresh | Project still exists | Critical |
| Deadlines persist | Add deadline → Refresh | Deadline still exists | Critical |
| Collaborators persist | Add collaborator → Refresh | Collaborator still exists | High |
| Settings persist | Change view mode → Refresh | View mode remembered | Medium |

### 14.2 Edge Cases
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Clear localStorage | Clear storage → Refresh | App starts fresh | Medium |
| Corrupted data | Manually corrupt localStorage | App handles gracefully, resets | High |
| Storage limit | Add many papers until storage full | Show warning or handle cleanly | Low |

---

## 15. Search & Filter

### 15.1 Search
| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| Search by title | Type partial title | Matching papers shown | High |
| Search by author | Type author name | Matching papers shown | High |
| Search by tag | Type "#tag" | Papers with tag shown | High |
| No results | Search gibberish | Empty state shown | Medium |
| Clear search | Delete search text | All papers shown | High |

### 15.2 Filters
| Filter | Expected Behavior |
|--------|-------------------|
| All Papers | Shows all |
| Favorites | Only favorited papers |
| With Deadlines | Only papers with submission deadline |
| To Read | Only status=toread |
| Reading | Only status=reading |
| Read | Only status=read |
| Project filter | Click project → Only papers in that project |

### 15.3 Sort
| Sort Option | Expected Order |
|-------------|---------------|
| Date Added | Newest first |
| Year Published | Most recent year first |
| Citations | Highest citations first |
| Deadline | Soonest deadline first |

---

## 16. Responsive Design

### 16.1 Viewport Sizes
| Size | Breakpoint | Expected Layout |
|------|------------|-----------------|
| Desktop | 1280px+ | Sidebar + Main + Right panel |
| Tablet | 768-1279px | Collapsible sidebar |
| Mobile | <768px | Stack layout, bottom nav |

### 16.2 Component Responsiveness
| Component | Mobile Expectation |
|-----------|-------------------|
| Paper cards | Single column, larger touch targets |
| Right panel | Full screen overlay |
| PDF viewer | Full screen, touch-friendly zoom |
| AI assistant | Full screen slide-in |

---

## 17. Accessibility (a11y)

### 17.1 Keyboard Navigation
| Action | Key | Expected Result |
|--------|-----|-----------------|
| Navigate sidebar | Tab | Focus moves through items |
| Select paper | Enter | Opens right panel |
| Close modal | Escape | Closes without saving |
| Search | / | Focus search input |

### 17.2 Screen Reader
| Test Case | Expected Result |
|-----------|-----------------|
| Paper cards | Read title, status, authors |
| Buttons | Announce purpose |
| Forms | Labels associated with inputs |

---

## 18. Error Handling

### 18.1 Network Errors
| Scenario | Expected Behavior |
|----------|------------------|
| AI API fails | Show error toast, allow retry |
| File upload fails | Show error, don't create paper |

### 18.2 Validation Errors
| Scenario | Expected Behavior |
|----------|------------------|
| Empty required field | Show inline validation |
| Invalid date | Prevent form submission |
| Duplicate entries | Warn user or handle |

---

## 19. Performance

### 19.1 Load Testing
| Test Case | Metric | Threshold |
|-----------|--------|-----------|
| Initial load | Time to interactive | <3s |
| 100 papers | Render time | <1s |
| 1000 papers | Scroll performance | 60fps |

### 19.2 Memory
| Test Case | Expected Result |
|-----------|-----------------|
| Extended use | No memory leaks |
| Large PDFs | Memory released after close |
| Rapid view switching | Stable memory usage |

---

## Debugging Checklist

### Console Errors
- [ ] Check for React hydration errors
- [ ] Check for undefined property access
- [ ] Check for network request failures
- [ ] Check for localStorage errors

### Visual Issues
- [ ] Check button alignment in toolbar
- [ ] Check modal z-index stacking
- [ ] Check responsive breakpoints
- [ ] Check dark mode contrast

### State Issues
- [ ] Check localStorage sync on unmount
- [ ] Check state updates trigger re-renders
- [ ] Check cleanup on component unmount
- [ ] Check for stale closures in callbacks

---

## Test Execution Priority

### Phase 1: Critical (Must Pass)
- Paper CRUD operations
- Data persistence
- Search and filter
- View toggle

### Phase 2: High Priority
- Project management
- Deadline tracker
- PDF viewer
- Import/Export

### Phase 3: Medium Priority
- AI assistant
- Notifications
- Smart popups
- Markdown editor

### Phase 4: Polish
- Accessibility
- Performance
- Edge cases
- Mobile responsive

---

*Last Updated: 2026-01-15*
*Version: 1.0*
