// Theme colors mapping
const colorMap = {
    pink: {
        hex: '#FF1493',
        image: 'assets/umbrella-pink.png'
    },
    blue: {
        hex: '#0BA5D0',
        image: 'assets/umbrella-blue.png'
    },
    yellow: {
        hex: '#FFC107',
        image: 'assets/umbrella-yellow.png'
    }
};

// DOM 
const umbrellaImage = document.getElementById('umbrellaImage');
const logoInput = document.getElementById('logoInput');
const uploadButton = document.getElementById('uploadButton');
const removeButton = document.getElementById('removeButton');
const logoOverlay = document.getElementById('logoOverlay');
const loader = document.getElementById('loader');
const swatches = document.querySelectorAll('.swatch');

let currentColor = 'yellow';
let currentLogoDataUrl = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeColorSwatch();
    setupEventListeners();
});

/**
 * Initialize the active color swatch on page load
 */
function initializeColorSwatch() {
    const yellowSwatch = document.querySelector(`[data-color="yellow"]`);
    if (yellowSwatch) {
        yellowSwatch.classList.add('active');
    }
    
    // Initialize loader color to match default theme (yellow)
    const rgb = hexToRgb(colorMap.yellow.hex);
    if (rgb) {
        updateLoaderIconColor(rgb);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Color swatch 
    swatches.forEach(swatch => {
        swatch.addEventListener('click', handleColorChange);
    });

    // Upload 
    uploadButton.addEventListener('click', () => {
        logoInput.click();
    });

    // Remove
    removeButton.addEventListener('click', handleRemoveLogo);

    // File input change
    logoInput.addEventListener('change', handleLogoUpload);
}

/**
 * Handle color swatch click
 */
function handleColorChange(event) {
    const button = event.target.closest('.swatch');
    if (!button) return;

    const color = button.getAttribute('data-color');
    if (!color || !colorMap[color]) return;

    // Remove 
    swatches.forEach(swatch => swatch.classList.remove('active'));

    // Add active class to clicked swatch
    button.classList.add('active');

    // Update theme
    updateTheme(color);

    // Switch umbrella image 
    switchUmbrellaImage(color);
}

/**
 * Update theme colors
 */
function updateTheme(color) {
    const colorData = colorMap[color];
    const root = document.documentElement;
    
    root.style.setProperty('--theme-color', colorData.hex);
    
    // Extract RGB values from hex

    const rgb = hexToRgb(colorData.hex);
    if (rgb) {
        root.style.setProperty('--theme-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        
        // Update loader
        updateLoaderIconColor(rgb);
    }

    currentColor = color;
}

/**
 * Update loader icon color based on RGB theme color
 */
function updateLoaderIconColor(rgb) {
    const loader = document.querySelector('.loader-icon');
    if (!loader) return;

    // Calculate HSL from RGB 
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // CSS filters to recolor the SVG icon
    const filterValue = `brightness(0) saturate(100%) invert(${Math.min(hsl.l / 100, 1)}) sepia(100%) saturate(150%) hue-rotate(${hsl.h}deg)`;
    loader.style.filter = filterValue;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Switch umbrella image 
 */
function switchUmbrellaImage(color) {
    const colorData = colorMap[color];
    if (!colorData || !colorData.image) return;

    // Fade out current img
    umbrellaImage.classList.add('fade-out');

    // Switch img
    setTimeout(() => {
        umbrellaImage.src = colorData.image;
        umbrellaImage.classList.remove('fade-out');
        umbrellaImage.classList.add('fade-in');

        // remove fade-in animation class after it completes
        setTimeout(() => {
            umbrellaImage.classList.remove('fade-in');
        }, 600);
    }, 300);
}

/**
 * Handle logo file upload
 */
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!validateFile(file)) {
        alert('Invalid file. Please upload a PNG, JPG, AVIF, or WebP file with a maximum size of 5MB.');
        logoInput.value = '';
        return;
    }

    // Show loader
    loader.classList.remove('hidden');

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        currentLogoDataUrl = dataUrl;

        // Update logo 
        logoOverlay.style.backgroundImage = `url('${dataUrl}')`;

      
        removeButton.style.display = 'block';

        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
    };
    reader.readAsDataURL(file);
}

/**
 * Handle logo removal
 */
function handleRemoveLogo() {
   
    currentLogoDataUrl = null;
    
    logoOverlay.style.backgroundImage = '';
 
    removeButton.style.display = 'none';

    logoInput.value = '';
}

/**
 * Validate uploaded file
 */
function validateFile(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/avif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        return false;
    }

    if (file.size > maxSize) {
        return false;
    }

    return true;
}

