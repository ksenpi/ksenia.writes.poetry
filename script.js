// List of poem files to load
const poemFiles = [
    'In His Hands.txt',
    'Sooner or Later.txt',
    'The Week I Fell In Love.txt',
    'First Day of Spring.txt',
    'Beatty Line Haibun.txt',
    'Summertime in the Temperate Rainforest.txt',
    'Oncoming Lights.txt',
    'Baby.txt',
    'Sanctuary.txt',
    // 'Passing.txt',
    //'True Love.txt',
];

// Function to convert filename to title
function filenameToTitle(filename) {
    // Remove .txt extension - filename already has proper title format
    return filename.replace(/\.txt$/, '');
}

// Function to load poems from files
async function loadPoems() {
    const poems = [];
    
    console.log('Loading poems...');
    
    for (const filename of poemFiles) {
        try {
            console.log(`Attempting to load: poems/${filename}`);
            // URL encode the filename to handle spaces and special characters
            const encodedFilename = encodeURIComponent(filename);
            const response = await fetch(`poems/${encodedFilename}`);
            
            if (!response.ok) {
                console.warn(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
                console.warn(`URL attempted: ${response.url}`);
                continue;
            }
            
            const text = await response.text();
            console.log(`Loaded ${filename}, length: ${text.length} characters`);
            
            const lines = text.trim().split('\n');
            console.log(`File has ${lines.length} lines`);
            
            // Use filename as title (convert to proper case)
            const title = filenameToTitle(filename);
            
            // Skip first line (title in file) and blank line if present
            let contentStart = 0;
            
            // Get content, or use empty string if no content
            const content = contentStart < lines.length 
                ? lines.slice(contentStart).join('\n').trim()
                : '';
            
            console.log(`Content length: ${content.length} characters`);
            
            if (content && content.length > 0) {
                poems.push({
                    title: title,
                    content: content
                });
                console.log(`Successfully loaded poem: ${title}`);
            } else {
                console.warn(`Poem ${filename} has no content after parsing`);
                console.warn(`Lines: ${lines.length}, contentStart: ${contentStart}`);
            }
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            console.error(`Error type: ${error.constructor.name}`);
            console.error(`Error message: ${error.message}`);
            
            // Check for CORS or network errors
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('⚠️ CORS/Network Error: You must serve this page through a web server!');
                console.error('Run: python3 -m http.server 8000');
                console.error('Then open: http://localhost:8000');
            }
        }
    }
    
    console.log(`Total poems loaded: ${poems.length}`);
    
    if (poems.length === 0) {
        console.error('❌ No poems were loaded. Make sure:');
        console.error('1. You are serving the page through a web server (not opening file:// directly)');
        console.error('2. The poems/ directory exists and contains the poem files');
        console.error('3. The filenames match those in the poemFiles array');
        console.error('4. Check the browser console for specific error messages above');
    }
    
    return poems;
}

class Book {
    constructor() {
        this.currentSpread = 0; // Track spreads, not individual pages
        this.totalSpreads = 0;
        this.book = document.getElementById('book');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageIndicator = document.getElementById('pageIndicator');
        this.isFlipping = false;
        this.spreads = []; // Array to track page pairs
        this.poems = []; // Store loaded poems
        
        this.init();
    }

    async init() {
        try {
            // Load poems from files first
            this.poems = await loadPoems();
            
            // Check if we loaded any poems
            if (this.poems.length === 0) {
                console.error('No poems loaded. Check that poem files exist in the poems/ directory.');
                // Show error message to user
                this.book.innerHTML = '<div class="page cover-page"><div class="page-content"><h1 class="book-title">Error</h1><p>No poems found. Please check the poems directory.</p></div></div>';
                return;
            }
            
            // Create pages from poems
            this.createPages();
            this.setupEventListeners();
            // Initialize all pages as unflipped except cover starts visible
            this.initializePages();
            this.updateUI();
        } catch (error) {
            console.error('Error initializing book:', error);
            this.book.innerHTML = '<div class="page cover-page"><div class="page-content"><h1 class="book-title">Error</h1><p>Failed to load poems. Please check the console for details.</p></div></div>';
        }
    }

    initializePages() {
        // Cover (spread 0) is visible, all others are hidden
        this.spreads.forEach((spread, spreadIndex) => {
            if (spreadIndex < this.currentSpread) {
                // Spreads before current - all pages should be flipped
                spread.forEach(page => page.classList.add('flipped'));
            } else if (spreadIndex === this.currentSpread) {
                // Current spread - all pages should be visible (not flipped)
                spread.forEach(page => page.classList.remove('flipped'));
            } else {
                // Future spreads - pages should be visible but behind current
                spread.forEach(page => page.classList.remove('flipped'));
            }
        });
    }

    createPages() {
        // Remove all pages except cover
        const coverPage = this.book.querySelector('.cover-page');
        this.book.innerHTML = '';
        this.book.appendChild(coverPage);

        // Cover is spread 0 (single page)
        this.spreads.push([coverPage]);

        // Create spreads for each poem, splitting long poems across multiple spreads
        let currentSpreadIndex = 1;
        this.poems.forEach((poem, poemIndex) => {
            const poemPages = this.splitPoemIntoPages(poem, currentSpreadIndex);
            
            // Add each spread for this poem
            poemPages.forEach((spread) => {
                this.spreads.push(spread);
                spread.forEach(page => this.book.appendChild(page));
                currentSpreadIndex++;
            });
        });

        this.totalSpreads = this.spreads.length;
    }

    // Estimate lines per page (considering padding, title space, etc.)
    // Page height: 600px, padding: 60px top/bottom = 480px available
    // Title takes ~80px, so ~400px for content
    // Line height: 1.8em * 1.1em ≈ 2em ≈ 32px
    // So roughly 12-15 lines per page, we'll use 12 to be safe
    getLinesPerPage(hasTitle) {
        return hasTitle ? 10 : 12; // Fewer lines if title is present
    }

    splitPoemIntoPages(poem, startSpreadIndex) {
        // Check if poem has custom page breaks (marked with ---)
        const pageBreakMarker = '---';
        const hasCustomBreaks = poem.content.includes(pageBreakMarker);
        
        if (hasCustomBreaks) {
            // Split by custom page breaks
            const sections = poem.content.split(pageBreakMarker).map(s => s.trim()).filter(s => s.length > 0);
            const spreads = [];
            let spreadNum = 0;
            
            // Distribute sections across spreads (left and right pages)
            for (let i = 0; i < sections.length; i += 2) {
                const leftContent = sections[i] || '';
                const rightContent = sections[i + 1] || '';
                
                const isFirstSpread = spreadNum === 0;
                const leftPage = this.createPoemPage(poem, 'left', startSpreadIndex + spreadNum, leftContent.split('\n'), isFirstSpread);
                const rightPage = this.createPoemPage(poem, 'right', startSpreadIndex + spreadNum, rightContent.split('\n'), false);
                
                spreads.push([leftPage, rightPage]);
                spreadNum++;
            }
            
            return spreads;
        } else {
            // Use automatic splitting based on line count
            const lines = poem.content.split('\n');
            const spreads = [];
            let lineIndex = 0;
            let spreadNum = 0;
            
            while (lineIndex < lines.length) {
                const isFirstSpread = spreadNum === 0;
                const linesPerLeftPage = this.getLinesPerPage(isFirstSpread);
                const linesPerRightPage = this.getLinesPerPage(false);
                
                // Get lines for left page
                const leftLines = lines.slice(lineIndex, lineIndex + linesPerLeftPage);
                lineIndex += linesPerLeftPage;
                
                // Get lines for right page
                const rightLines = lines.slice(lineIndex, lineIndex + linesPerRightPage);
                lineIndex += linesPerRightPage;
                
                const leftPage = this.createPoemPage(poem, 'left', startSpreadIndex + spreadNum, leftLines, isFirstSpread);
                const rightPage = this.createPoemPage(poem, 'right', startSpreadIndex + spreadNum, rightLines, false);
                
                spreads.push([leftPage, rightPage]);
                spreadNum++;
            }
            
            return spreads;
        }
    }

    createPoemPage(poem, side, spreadNumber, lines, showTitle) {
        const page = document.createElement('div');
        page.className = `page ${side}-page`;
        page.setAttribute('data-spread', spreadNumber);
        
        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        
        if (side === 'left' && showTitle) {
            // Left page shows title on first spread only
            const title = document.createElement('h2');
            title.className = 'poem-title';
            title.textContent = poem.title;
            pageContent.appendChild(title);
        } else if (side === 'left' && !showTitle) {
            // Empty space on left page if no title
            const spacer = document.createElement('div');
            spacer.style.height = '60px';
            pageContent.appendChild(spacer);
        }
        
        const content = document.createElement('div');
        content.className = 'poem-content';
        content.textContent = lines.join('\n');
        
        if (side === 'right' && !showTitle) {
            // Add some top margin for visual balance on right page when continuing
            content.style.marginTop = '60px';
        } else if (side === 'right' && showTitle) {
            // First right page also needs margin
            content.style.marginTop = '60px';
        }
        
        pageContent.appendChild(content);
        page.appendChild(pageContent);
        return page;
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.turnPage(-1));
        this.nextBtn.addEventListener('click', () => this.turnPage(1));
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.turnPage(-1);
            } else if (e.key === 'ArrowRight') {
                this.turnPage(1);
            }
        });

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        this.book.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.book.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        // Store touch handler reference
        this.handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next page
                    this.turnPage(1);
                } else {
                    // Swipe right - previous page
                    this.turnPage(-1);
                }
            }
        };
    }

    turnPage(direction) {
        if (this.isFlipping) return;
        
        const newSpread = this.currentSpread + direction;
        
        if (newSpread < 0 || newSpread >= this.totalSpreads) {
            return;
        }

        this.isFlipping = true;

        // Flip pages to reveal next/previous spread
        if (direction > 0) {
            // Going forward - flip the rightmost page of current spread
            const currentSpread = this.spreads[this.currentSpread];
            if (currentSpread.length === 1) {
                // Cover page - flip it
                currentSpread[0].classList.add('flipped');
            } else {
                // Regular spread - flip the right page
                const rightPage = currentSpread.find(page => page.classList.contains('right-page'));
                if (rightPage) {
                    rightPage.classList.add('flipped');
                } else {
                    // Fallback: flip the last page
                    currentSpread[currentSpread.length - 1].classList.add('flipped');
                }
            }
        } else {
            // Going backward - unflip the rightmost flipped page of previous spread
            const prevSpread = this.spreads[newSpread];
            // Find the rightmost flipped page and unflip it
            for (let i = prevSpread.length - 1; i >= 0; i--) {
                const page = prevSpread[i];
                if (page.classList.contains('flipped')) {
                    page.classList.remove('flipped');
                    break;
                }
            }
        }

        this.currentSpread = newSpread;
        this.isFlipping = false;
        this.updateUI();
    }

    updateUI() {
        // Update button states
        this.prevBtn.disabled = this.currentSpread === 0;
        this.nextBtn.disabled = this.currentSpread === this.totalSpreads - 1;
        
        // Update page indicator (show spread number)
        this.pageIndicator.textContent = `${this.currentSpread + 1} / ${this.totalSpreads}`;
        
        // Update z-index for proper stacking based on spreads
        this.spreads.forEach((spread, spreadIndex) => {
            spread.forEach((page, pageIndex) => {
                // Pages in spreads before current are behind
                // Pages in current spread and after are in front
                if (spreadIndex < this.currentSpread) {
                    page.style.zIndex = this.totalSpreads - spreadIndex;
                } else if (spreadIndex === this.currentSpread) {
                    page.style.zIndex = this.totalSpreads + 10 - pageIndex;
                } else {
                    page.style.zIndex = this.totalSpreads - spreadIndex;
                }
            });
        });
    }
}

// Initialize the book when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    new Book();
});

