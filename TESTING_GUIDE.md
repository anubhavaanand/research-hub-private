# 🎮 Research Hub - Quick Testing Guide

**Your app is running at:** http://localhost:3000/

---

## ✅ What to Test Right Now

### **1. Browse Mock Papers (No Setup Required)**
- Open http://localhost:3000/
- You'll see several sample research papers
- Click on any paper card to view details
- Right panel opens with full paper information

### **2. Test Search & Filter**
- Use the search box at top to search papers
- Click filter buttons: All, Journal, Conference, etc.
- Click status filters: To Read, Reading, Read, Favorites
- Try sorting: Date, Year, Citations

### **3. Test UI Features**
- Watch the animated dotted background
- Check the glass morphism effects
- Try selecting different papers
- Close/open the right detail panel

### **4. Test Responsive Design**
- Resize your browser window
- Check mobile layout (< 768px)
- Verify tablet layout (768px - 1024px)
- Test desktop layout (> 1024px)

---

## 🤖 Test AI Citation (Optional - Requires API Key)

### **Quick Setup (2 minutes)**

1. **Get Free API Key**
   - Visit: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

2. **Create .env File**
   ```bash
   # In project root, create .env file
   echo "API_KEY=your_api_key_here" > .env
   ```

3. **Restart Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Test Citation Generation**
   - Select any paper
   - Click "Generate Citation" button
   - Choose citation style (APA7, IEEE, Harvard, MLA)
   - Click "Generate with AI"
   - Watch AI create perfect citation!
   - Click "Copy" to copy to clipboard

---

## 📊 Expected Results

### **Without API Key**
✅ App loads and displays papers  
✅ All UI features work  
✅ Search/filter/sort functional  
⚠️ Citation shows helpful setup message  

### **With API Key**
✅ Everything above PLUS  
✅ AI generates citations in seconds  
✅ Multiple citation formats available  
✅ One-click copy to clipboard  

---

## 🐛 Known Issues (All Minor)

### **Not Actual Bugs - Expected Behavior**

1. **"API Key not configured" message**
   - This is normal without .env file
   - Follow setup above to enable AI citations
   - All other features work fine

2. **Sample papers only**
   - App includes mock papers for demo
   - Upload feature creates new entries
   - Real PDF parsing is a future enhancement

3. **Browser storage only**
   - Papers stored in localStorage
   - No cloud sync (privacy feature!)
   - Export/import available for backup

---

## 🎯 Quick Test Scenarios

### **Scenario 1: Quick Browse (30 seconds)**
```
1. Open http://localhost:3000/
2. See sample papers ✓
3. Click on a paper ✓
4. View details in right panel ✓
5. Close panel ✓
```

### **Scenario 2: Search & Filter (1 minute)**
```
1. Type "machine learning" in search ✓
2. Click "Journal" filter ✓
3. Click "Favorites" filter ✓
4. Change sort to "Year" ✓
5. Results update instantly ✓
```

### **Scenario 3: AI Citation (2 minutes + setup)**
```
1. Setup API key (if not done) ✓
2. Select a paper ✓
3. Click "Generate Citation" ✓
4. Choose "APA7" format ✓
5. Click generate button ✓
6. See AI-generated citation ✓
7. Copy to clipboard ✓
```

---

## 🚀 Performance Check

### **What Should Be Fast**
- ✅ App loads in < 1 second
- ✅ Search updates instantly
- ✅ Filters apply immediately  
- ✅ Smooth animations (60fps)
- ✅ No lag when clicking

### **What Takes Time**
- ⏱️ AI citation: 2-5 seconds (API call)
- ⏱️ First build: ~2 seconds
- ⏱️ Hot reload: < 200ms

---

## 📱 Mobile Testing

### **On Mobile/Small Screen**
1. Open on phone or resize browser
2. Hamburger menu appears
3. Sidebar becomes drawer
4. Cards stack vertically
5. All features still accessible

---

## ✅ Everything Working?

### **If Yes:**
🎉 **Congratulations!** Your app is ready!
- Deploy with: `npm run build`
- Share the demo at http://localhost:3000/

### **If No:**
Check `DEBUG_REPORT.md` for troubleshooting

---

## 🎓 Pro Tips

1. **Keyboard Shortcuts**
   - `Ctrl+K` or `/` to focus search
   - `Esc` to close panels
   - Arrow keys to navigate

2. **Developer Mode**
   - Open browser DevTools (F12)
   - Check Console for any errors
   - Use React DevTools extension

3. **Testing Citation AI**
   - Start with APA7 (most common)
   - Try different paper types
   - Compare formats side-by-side

---

**Happy Testing! 🧪**

Need help? Check:
- `README.md` - Full documentation
- `SETUP.md` - Setup instructions  
- `DEBUG_REPORT.md` - Debugging guide
