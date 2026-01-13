# ksenia.writes.poetry
Ksenia's poetry website

A beautiful, book-like poetry website where visitors can flip through pages of poems with smooth, swift animations.

## Features

- 📖 Book-like interface with realistic page flipping
- ⚡ Swift, smooth page transitions
- 📱 Responsive design for mobile and desktop
- ⌨️ Keyboard navigation (arrow keys)
- 👆 Touch/swipe support for mobile devices
- 🎨 Beautiful, modern design with gradient backgrounds

## Getting Started

**Important**: This website needs to be served through a web server (not opened directly as a file) because it loads poems from files using the Fetch API.

### Running Locally

1. Open a terminal in this directory
2. Start a local web server:

   **Python 3:**
   ```bash
   python3 -m http.server 8000
   ```

   **Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Node.js (with http-server):**
   ```bash
   npx http-server -p 8000
   ```

3. Open your browser and navigate to `http://localhost:8000`

The poems will be automatically loaded from the `poems/` directory.

### Mobile Version

The website includes a separate mobile app optimized for mobile devices:
- **Desktop**: `index.html` - Shows two-page spreads (book-like view)
- **Mobile**: `index-mobile.html` - Shows one page at a time with slide transitions

Mobile devices are automatically redirected to the mobile version. You can also access it directly at `index-mobile.html`.

### Navigation

- **Next Page**: Click the "Next" button, press the right arrow key, or swipe left on mobile
- **Previous Page**: Click the "Previous" button, press the left arrow key, or swipe right on mobile

## Adding Your Own Poems

1. Create a new `.txt` file in the `poems/` directory (e.g., `my-new-poem.txt`)
2. Add your poem content (the first line with a title will be ignored - the title is generated from the filename)
3. Add the filename to the `poemFiles` array at the top of `script.js`

### Custom Page Breaks

You can control where your poem splits across pages by using `---` as a page break marker. The content before the first `---` goes on the left page, content after goes on the right page. Additional `---` markers create new spreads.

Example poem file with custom page breaks:
```
My Poem Title

First stanza of the poem,
More lines here...

---
Second stanza continues,
On the right page...

---
Third stanza starts,
On a new spread...
```

If you don't use `---` markers, the poem will automatically split based on line count.

The poem title will be automatically generated from the filename.

## File Structure

```
.
├── index.html          # Desktop HTML file (two-page spreads)
├── index-mobile.html   # Mobile HTML file (one page at a time)
├── styles.css          # Desktop styling for the book interface
├── styles-mobile.css   # Mobile styling
├── script.js           # Desktop JavaScript for page flipping
├── script-mobile.js    # Mobile JavaScript for page navigation
├── poems/              # Directory containing poem text files
│   ├── In His Hands.txt
│   ├── First Day of Spring.txt
│   └── ... (other poem files)
└── README.md          # This file
```

## Customization

- **Colors**: Edit the gradient colors in `styles.css` (look for `background: linear-gradient`)
- **Fonts**: Change the `font-family` in `styles.css`
- **Animation Speed**: Adjust the `transition` duration in `.page` class in `styles.css`
- **Page Size**: Modify the `height` property of `.book` in `styles.css`
