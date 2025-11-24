// --- LOCAL STORAGE DATA HANDLING ---
const FIX_KEYS = ['fix-1', 'fix-2', 'fix-3', 'fix-4', 'fix-5', 'fix-6'];

/**
 * Loads the completion status of all fixes from localStorage.
 * @returns {Object} An object mapping fixId to boolean status.
 */
const loadFixStatuses = () => {
    const statuses = {};
    FIX_KEYS.forEach(key => {
        // localStorage returns "true" or null (falsy)
        statuses[key] = localStorage.getItem(key) === 'true';
    });
    return statuses;
};

/**
 * Toggles the completion status of a fix and saves it to localStorage.
 * @param {string} fixId - The ID of the fix (e.g., 'fix-1').
 */
window.toggleFixStatus = (fixId) => {
    const currentStatus = localStorage.getItem(fixId) === 'true';
    const newStatus = !currentStatus;

    // Save new status to localStorage
    localStorage.setItem(fixId, newStatus);
    
    // Update the UI immediately
    updateUI(fixId, newStatus);
};

/**
 * Updates the visual appearance of a fix card based on its status.
 * This function also handles applying/removing the Tailwind background classes.
 * @param {string} fixId - The ID of the fix.
 * @param {boolean} isCompleted - The new completion status.
 */
const updateUI = (fixId, isCompleted) => {
    const card = document.getElementById(fixId);
    const trackerContainer = document.getElementById(`tracker-${fixId}`);
    
    if (!card || !trackerContainer) return;

    const markButton = trackerContainer.querySelector('.mark-button');

    // Utility classes used for state management
    const blueClasses = ['bg-blue-600', 'hover:bg-blue-700'];
    const greenClasses = ['bg-green-600', 'hover:bg-green-700'];
    const sharedClasses = ['text-white']; // text-white is constant

    if (isCompleted) {
        card.classList.add('completed');
        markButton.textContent = 'Status: FIXED! (Click to Reset)';
        
        // Remove blue classes and add green classes
        markButton.classList.remove(...blueClasses);
        markButton.classList.add(...greenClasses, ...sharedClasses);
    } else {
        card.classList.remove('completed');
        markButton.textContent = 'Mark as Fixed';
        
        // Remove green classes and add blue classes
        markButton.classList.remove(...greenClasses);
        markButton.classList.add(...blueClasses, ...sharedClasses);
    }
};

/**
 * Initial load function to apply statuses saved in localStorage AND set the initial button colors.
 */
const initializeGuide = () => {
    const initialStatuses = loadFixStatuses();
    FIX_KEYS.forEach(key => {
        // Update the UI based on saved status (applies 'completed' class and button color/text)
        updateUI(key, initialStatuses[key]);
    });
};

// Run initialization when the page is loaded
document.addEventListener('DOMContentLoaded', initializeGuide);
