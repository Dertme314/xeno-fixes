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
 * @param {string} fixId - The ID of the fix.
 * @param {boolean} isCompleted - The new completion status.
 */
const updateUI = (fixId, isCompleted) => {
    const card = document.getElementById(fixId);
    const trackerContainer = document.getElementById(`tracker-${fixId}`);
    
    if (!card || !trackerContainer) return;

    const markButton = trackerContainer.querySelector('.mark-button');

    if (isCompleted) {
        card.classList.add('completed');
        markButton.textContent = 'Status: FIXED! (Click to Reset)';
        markButton.classList.remove('bg-blue-600', 'hover:bg-blue-700', 'text-white');
        markButton.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white');
    } else {
        card.classList.remove('completed');
        markButton.textContent = 'Mark as Fixed';
        markButton.classList.remove('bg-green-600', 'hover:bg-green-700', 'text-white');
        markButton.classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white');
    }
};

/**
 * Initial load function to apply statuses saved in localStorage.
 */
const initializeGuide = () => {
    const initialStatuses = loadFixStatuses();
    FIX_KEYS.forEach(key => {
        updateUI(key, initialStatuses[key]);
    });
    // Apply default button styling on load, regardless of status
    FIX_KEYS.forEach(key => {
        const card = document.getElementById(key);
        const isCompleted = card.classList.contains('completed');
        const button = document.querySelector(`#tracker-${key} .mark-button`);
        if (button) {
            if (isCompleted) {
                button.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white');
            } else {
                button.classList.add('bg-blue-600', 'hover:bg-blue-700', 'text-white');
            }
        }
    });
};

// Run initialization when the page is loaded
document.addEventListener('DOMContentLoaded', initializeGuide);
