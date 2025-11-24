// Keys for localStorage
const FIX_KEYS = ['fix-1','fix-2','fix-3','fix-4','fix-5','fix-6'];

/* Load all fix statuses */
const loadFixStatuses = () => {
    const statuses = {};
    FIX_KEYS.forEach(key => {
        statuses[key] = localStorage.getItem(key) === 'true';
    });
    return statuses;
};

/* Toggle fix state */
window.toggleFixStatus = (fixId) => {
    const currentStatus = localStorage.getItem(fixId) === 'true';
    const newStatus = !currentStatus;

    localStorage.setItem(fixId, newStatus);
    updateUI(fixId, newStatus);
};

/* Update UI on card + button */
const updateUI = (fixId, isCompleted) => {
    const card = document.getElementById(fixId);
    const tracker = document.getElementById(`tracker-${fixId}`);

    if (!card || !tracker) return;

    const button = tracker.querySelector('.mark-button');

    if (isCompleted) {
        card.classList.add('completed');
        button.textContent = 'Status: FIXED! (Click to Reset)';
        button.classList.remove('bg-blue-600','hover:bg-blue-700');
        button.classList.add('bg-green-600','hover:bg-green-700','text-white');
    } else {
        card.classList.remove('completed');
        button.textContent = 'Mark as Fixed';
        button.classList.remove('bg-green-600','hover:bg-green-700');
        button.classList.add('bg-blue-600','hover:bg-blue-700','text-white');
    }
};

/* Initialize guide on page load */
const initializeGuide = () => {
    const statuses = loadFixStatuses();

    FIX_KEYS.forEach(key => {
        updateUI(key, statuses[key]);
    });

    // Apply base button style
    FIX_KEYS.forEach(key => {
        const card = document.getElementById(key);
        const button = document.querySelector(`#tracker-${key} .mark-button`);
        const completed = card.classList.contains('completed');

        if (completed) {
            button.classList.add('bg-green-600','hover:bg-green-700','text-white');
        } else {
            button.classList.add('bg-blue-600','hover:bg-blue-700','text-white');
        }
    });
};

document.addEventListener('DOMContentLoaded', initializeGuide);
