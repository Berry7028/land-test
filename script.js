const revealLayer = document.getElementById('reveal-layer');

// Configuration
const BLOB_SIZE_MAIN = 600; // px
const BLOB_SIZE_TAIL = 360; // px
const TAIL_COUNT = 4;
const DELAY_FACTOR = 0.15; // Lower is faster response, Higher is more "drag"

// State
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Blobs array: Index 0 is the main cursor, 1..N are tails
const blobs = [];
const TOTAL_BLOBS = 1 + TAIL_COUNT;

// Initialize blob states
for (let i = 0; i < TOTAL_BLOBS; i++) {
    blobs.push({
        x: mouseX,
        y: mouseY,
        size: i === 0 ? BLOB_SIZE_MAIN : BLOB_SIZE_TAIL * (1 - (i * 0.1)) // Tails get slightly smaller
    });
}

// Event Listeners
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

window.addEventListener('touchmove', (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
}, { passive: false });


// Animation Loop
function animate() {
    // 1. Update positions
    // Main blob follows mouse with slight delay (per requirement "200ms delay" - implemented via LERP)
    // LERP usually: current = current + (target - current) * speed
    // 200ms delay roughly means it takes a bit of time to catch up.
    
    // Smooth factor for main blob
    const smoothMain = 0.15; // Tuned for organic feel

    blobs[0].x += (mouseX - blobs[0].x) * smoothMain;
    blobs[0].y += (mouseY - blobs[0].y) * smoothMain;

    // Tails follow the one before them
    for (let i = 1; i < TOTAL_BLOBS; i++) {
        const leader = blobs[i - 1];
        const follower = blobs[i];
        
        // Tails have a slightly looser follow
        follower.x += (leader.x - follower.x) * DELAY_FACTOR;
        follower.y += (leader.y - follower.y) * DELAY_FACTOR;
    }

    // 2. Build mask string
    // radial-gradient(circle at Xpx Ypx, black size px, transparent size+fade px)
    // We combine them with comma.
    // NOTE: In mask-image, the visible part is "black" (or alpha 1), hidden is "transparent".
    
    let maskString = '';
    
    // We iterate backwards so the smaller tails overlay/blend nicely if order matters (in CSS masks it merges)
    for (let i = 0; i < TOTAL_BLOBS; i++) {
        const b = blobs[i];
        // Organic feel: slight wobble could be added here with Math.sin(Date.now())
        
        // Edge fuzziness for "smooth" feel
        const radius = b.size / 2;
        const fade = 40; // gradient edge transition
        
        maskString += `radial-gradient(circle ${radius}px at ${b.x}px ${b.y}px, black 0%, transparent 100%)`;
        
        if (i < TOTAL_BLOBS - 1) {
            maskString += ', ';
        }
    }

    // Apply to layer
    revealLayer.style.maskImage = maskString;
    revealLayer.style.webkitMaskImage = maskString;

    requestAnimationFrame(animate);
}

// Start
animate();

// Handle Resize
window.addEventListener('resize', () => {
    // Optional: center blobs if out of bounds? No need.
});
