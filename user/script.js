// UTILS
const showToast = (msg) => {
    const x = document.getElementById("toast");
    if(x) {
        x.innerText = msg; x.className = "show";
        setTimeout(() => { x.className = x.className.replace("show", ""); }, 3000);
    } else {
        alert(msg);
    }
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => showToast("Copied — কপি করা হয়েছে"));
};

// AUTH STATE & SHARED LOGIC
auth.onAuthStateChanged(user => {
    const path = window.location.pathname;
    
    if (user) {
        if (path.includes('login.html') || path.endsWith('/') || path.endsWith('index.html')) {
            window.location.href = 'dashboard.html';
        }
        
        // Run Global Sync (Only if not on public pages)
        if (!path.includes('login.html') && !path.includes('register.html') && !path.includes('index.html')) {
            syncUserData(user.uid);
        }

    } else {
        if (!path.includes('login.html') && !path.includes('register.html') && !path.includes('index.html')) {
            window.location.href = 'login.html';
        }
    }
});

// ============================================================
// CORE LOGIC: AUTO REWARD (1 PM) & VALIDITY CHECK
// ============================================================
function syncUserData(uid) {
    const userRef = db.ref('users/' + uid);
    
    db.ref('settings').once('value').then(snap => {
        const settings = snap.val() || {};
        if (settings.maintenance && !window.location.pathname.includes('profile')) {
            document.body.innerHTML = `<div style="color:white;text-align:center;padding:50px;"><h1>Maintenance Mode</h1></div>`;
            return;
        }
        
        userRef.once('value').then(userSnap => {
            const userData = userSnap.val();
            if (!userData) return; 
            
            if (userData.banned) {
                auth.signOut();
                alert("Account Banned");
                return;
            }

            const plans = userData.plans || {};
            const now = new Date();
            const currentTs = now.getTime();
            const currentHour = now.getHours(); // 0 - 23
            
            // Format Today's Date (e.g., "11/21/2025")
            const todayStr = now.toLocaleDateString();

            let totalRewardToAdd = 0;
            let updates = {};
            let hasUpdates = false;

            Object.keys(plans).forEach(key => {
                const plan = plans[key];
                
                // 1. CHECK VALIDITY
                if (currentTs > plan.activeUntil) return; // Expired

                // 2. CHECK 1 PM REWARD LOGIC
                // Convert lastRewardDate to Date String
                const lastRewardDate = new Date(plan.lastRewardDate || 0);
                const lastRewardStr = lastRewardDate.toLocaleDateString();

                // CONDITION: 
                // If (Today != LastRewardDay) AND (CurrentHour >= 13 / 1 PM)
                if (todayStr !== lastRewardStr && currentHour >= 13) {
                    
                    const dailyAmount = parseFloat(plan.dailyReward);
                    totalRewardToAdd += dailyAmount;
                    
                    // Update last reward date to NOW
                    updates[`plans/${key}/lastRewardDate`] = currentTs;
                    hasUpdates = true;
                }
            });

            if (hasUpdates && totalRewardToAdd > 0) {
                // Transaction to add balance safely
                userRef.child('balance').transaction((current) => {
                    return (current || 0) + totalRewardToAdd;
                }, (error, committed, snapshot) => {
                    if (committed) {
                        // Log reward
                        const rewardId = Date.now();
                        updates[`rewards/${rewardId}`] = {
                            amount: totalRewardToAdd,
                            type: "Daily Income (1 PM)",
                            date: new Date().toISOString()
                        };
                        // Save updates
                        userRef.update(updates);
                        showToast(`Daily Reward Added: +${totalRewardToAdd} BDT`);
                    }
                });
            }
        });
    });
}

function logout() {
    auth.signOut().then(() => window.location.href = 'login.html');
}