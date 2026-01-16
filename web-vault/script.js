const URL = "YOUR_WEB_APP_URL";
let dailyLimit = 100; // Adjust as needed

// Tab Switching Logic
document.getElementById('tab-spent').addEventListener('click', () => {
    switchTab('spent');
});

document.getElementById('tab-savings').addEventListener('click', () => {
    const hours = new Date().getHours();
    // Logic: Only show at the end of the day (e.g., after 8 PM / 20:00)
    if (hours < 20) {
        showPopup("The Savings Tab only reveals itself at dusk (after 8 PM)!");
    } else {
        switchTab('savings');
    }
});

function switchTab(view) {
    if(view === 'spent') {
        document.getElementById('view-spent').classList.remove('hidden');
        document.getElementById('view-savings').classList.add('hidden');
        document.getElementById('tab-spent').classList.add('tab-active');
        document.getElementById('tab-savings').classList.remove('tab-active');
    } else {
        document.getElementById('view-spent').classList.add('hidden');
        document.getElementById('view-savings').classList.remove('hidden');
        document.getElementById('tab-savings').classList.add('tab-active');
        document.getElementById('tab-spent').classList.remove('tab-active');
    }
}

// Popup Controls
function showPopup(msg) {
    document.getElementById('popup-message').innerText = msg;
    document.getElementById('popup-overlay').classList.remove('hidden');
}

function closePopup() {
    document.getElementById('popup-overlay').classList.add('hidden');
}

// Data Fetching
async function updateUI() {
    const res = await fetch(URL);
    const data = await res.json();
    const rows = data.slice(1); // Skip headers

    let totalSpent = 0;
    const tableBody = document.getElementById('statement-body');
    tableBody.innerHTML = "";

    rows.forEach(row => {
        totalSpent += parseFloat(row[2]); // Amount column
        
        // Injected Table Row
        tableBody.innerHTML += `
            <tr class="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td class="p-4 text-slate-500 text-[11px]">${row[0]}</td>
                <td class="p-4 font-bold text-slate-200">${row[1]}</td>
                <td class="p-4 text-yellow-500 font-bold">$${row[2]}</td>
                <td class="p-4"><span class="px-2 py-1 rounded bg-slate-700 text-[10px] uppercase font-bold text-slate-300">${row[3]}</span></td>
                <td class="p-4 text-slate-600 text-[10px] italic">${row[4]}</td>
            </tr>
        `;
    });

    // Update Progress Bar
    const progress = Math.min((totalSpent / dailyLimit) * 100, 100);
    document.getElementById('limit-bar').style.width = progress + "%";
    document.getElementById('limit-text').innerText = `$${totalSpent.toFixed(2)} / $${dailyLimit}`;
    
    // Calculate Daily Savings (Remaining limit)
    const savings = Math.max(dailyLimit - totalSpent, 0);
    document.getElementById('savings-amount').innerText = `$${savings.toFixed(2)}`;

    // Trigger Popup on new high-value spend
    const latest = rows[rows.length - 1];
    if (parseFloat(latest[2]) > 50) {
        showPopup(latest[5] || "Large expense detected! Watch the gold, ya scallywag!");
    }
}

setInterval(updateUI, 10000);
updateUI();