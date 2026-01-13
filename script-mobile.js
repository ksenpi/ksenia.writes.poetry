// List of poem files to load (same as desktop)
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
];

// Function to convert filename to title
function filenameToTitle(filename) {
    return filename.replace(/\.txt$/, '');
}

// Function to load poems from files
async function loadPoems() {
    const poems = [];
    
    for (const filename of poemFiles) {
        try {
            const encodedFilename = encodeURIComponent(filename);
            const response = await fetch(`poems/${encodedFilename}`);
            
            if (!response.ok) {
                console.warn(`Failed to load ${filename}`);
                continue;
            }
            
            const text = await response.text();
            const lines = text.trim().split('\n');
            const title = filenameToTitle(filename);
            let contentStart = 0;
            const content = contentStart < lines.length 
                ? lines.slice(contentStart).join('\n').trim()
                : '';
            
            if (content && content.length > 0) {
                poems.push({
                    title: title,
                    content: content
                });
            }
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
        }
    }
    
    return poems;
}

class MobileBook {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 0;
        this.book = document.getElementById('book');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.pageIndicator = document.getElementById('pageIndicator');
        this.pages = [];
        
        this.init();
    }

    async init() {
        try {
            const poems = await loadPoems();
            
            if (poems.length === 0) {
                console.error('No poems loaded');
                this.book.innerHTML = '<div class="page active"><div class="page-content"><h1>Error</h1><p>No poems found.</p></div></div>';
                return;
            }
            
            this.createPages(poems);
            this.setupEventListeners();
            this.updateUI();
        } catch (error) {
            console.error('Error initializing book:', error);
        }
    }

    createPages(poems) {
        // Create cover page
        const coverPage = this.createCoverPage();
        this.pages.push(coverPage);
        this.book.appendChild(coverPage);
        
        // Create pages for each poem
        poems.forEach((poem) => {
            const poemPages = this.splitPoemIntoPages(poem);
            poemPages.forEach(page => {
                this.pages.push(page);
                this.book.appendChild(page);
            });
        });
        
        this.totalPages = this.pages.length;
        
        // Set first page as active
        if (this.pages.length > 0) {
            this.pages[0].classList.add('active');
        }
    }

    createCoverPage() {
        const page = document.createElement('div');
        page.className = 'page cover-page';
        
        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        
        const title = document.createElement('h1');
        title.className = 'book-title';
        title.textContent = 'Ksenia Writes Poetry';
        pageContent.appendChild(title);
        
        const trees = document.createElement('div');
        trees.className = 'cover-trees';
        
        // Create 4 trees
        const treeSizes = ['small', 'medium', 'large', 'small'];
        treeSizes.forEach(size => {
            const tree = document.createElement('div');
            tree.className = `cover-decoration cover-tree-${size}`;
            
            for (let i = 1; i <= 3; i++) {
                const layer = document.createElement('div');
                layer.className = `cover-tree-layer cover-tree-layer-${i}`;
                tree.appendChild(layer);
            }
            
            trees.appendChild(tree);
        });
        
        pageContent.appendChild(trees);
        page.appendChild(pageContent);
        return page;
    }

    splitPoemIntoPages(poem) {
        const pages = [];
        const pageBreakMarker = '---';
        const hasCustomBreaks = poem.content.includes(pageBreakMarker);
        
        if (hasCustomBreaks) {
            // Split by custom page breaks
            const sections = poem.content.split(pageBreakMarker).map(s => s.trim()).filter(s => s.length > 0);
            sections.forEach((section, index) => {
                const isFirst = index === 0;
                const page = this.createPoemPage(poem, section.split('\n'), isFirst);
                pages.push(page);
            });
        } else {
            // Automatic splitting - estimate lines per page
            const linesPerPage = 20; // More lines per page on mobile since it's full width
            const lines = poem.content.split('\n');
            
            for (let i = 0; i < lines.length; i += linesPerPage) {
                const pageLines = lines.slice(i, i + linesPerPage);
                const isFirst = i === 0;
                const page = this.createPoemPage(poem, pageLines, isFirst);
                pages.push(page);
            }
        }
        
        return pages;
    }

    createPoemPage(poem, lines, showTitle) {
        const page = document.createElement('div');
        page.className = 'page';
        
        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        
        if (showTitle) {
            const title = document.createElement('h2');
            title.className = 'poem-title';
            title.textContent = poem.title;
            pageContent.appendChild(title);
        }
        
        const content = document.createElement('div');
        content.className = 'poem-content';
        content.textContent = lines.join('\n');
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

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        this.book.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.book.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

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
        const newPage = this.currentPage + direction;
        
        if (newPage < 0 || newPage >= this.totalPages) {
            return;
        }

        // Update page classes
        const currentPageEl = this.pages[this.currentPage];
        const newPageEl = this.pages[newPage];
        
        // Remove active class from current page
        currentPageEl.classList.remove('active');
        
        // Add appropriate transition class
        if (direction > 0) {
            currentPageEl.classList.add('prev');
            newPageEl.classList.remove('next', 'prev');
        } else {
            currentPageEl.classList.add('next');
            newPageEl.classList.remove('next', 'prev');
        }
        
        // Add active class to new page
        newPageEl.classList.add('active');
        
        this.currentPage = newPage;
        this.updateUI();
    }

    updateUI() {
        // Update button states
        this.prevBtn.disabled = this.currentPage === 0;
        this.nextBtn.disabled = this.currentPage === this.totalPages - 1;
        
        // Update page indicator
        this.pageIndicator.textContent = `${this.currentPage + 1} / ${this.totalPages}`;
    }
}

// Initialize the book when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileBook();
});

