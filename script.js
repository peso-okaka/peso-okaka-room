
document.addEventListener('DOMContentLoaded', () => {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: Make everything visible immediately
        document.querySelectorAll('.scroll-animate').forEach(el => {
            el.classList.add('is-visible');
            el.style.opacity = 1;
        });
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });

    initSubscriberCounter();
});

/**
 * Subscriber Counter Logic
 * Note: To use real YouTube API data, you need an API Key.
 * Currently using simulated data for demonstration.
 */
function initSubscriberCounter() {
    const GOAL = 500;

    // --- Configuration ---
    // ▼ YouTube Data API Keyを入力してください
    const API_KEY = 'AIzaSyA_6LwYfRAEZhFMwtz4_6VTIPl2NdFbD4s';
    // 自動取得したチャンネルID
    const CHANNEL_ID = 'UCNr9Js-Bx5wn1YLESjAVZeg';

    const countEl = document.getElementById('subscriber-count');
    const percentEl = document.getElementById('goal-percentage');
    const barEl = document.getElementById('progress-fill');

    if (!countEl || !percentEl || !barEl) return;

    // APIキーがない場合はデモモード（シミュレーション）
    if (!API_KEY) {
        console.warn('API Key is missing. Using simulated data. Please add your key in script.js.');
        const simulatedCount = Math.floor(Math.random() * (395 - 380 + 1)) + 380;
        updateDisplay(simulatedCount, GOAL, countEl, percentEl, barEl);
        return;
    }

    // Real API Fetch
    console.log(`Fetching subscriber count for channel: ${CHANNEL_ID}`);
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(`API Error: ${response.status} ${err.error?.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);
            if (data.items && data.items.length > 0) {
                // 登録者数非公開の場合は hiddenSubscriberCount が true になる
                if (data.items[0].statistics.hiddenSubscriberCount) {
                    console.warn('Subscriber count is hidden by the channel owner.');
                    // 非公開の場合の処理（必要に応じて変更）
                    countEl.textContent = '非公開';
                    return;
                }
                const subscriberCount = parseInt(data.items[0].statistics.subscriberCount);
                updateDisplay(subscriberCount, GOAL, countEl, percentEl, barEl);
            } else {
                console.error('Channel data not found. Check CHANNEL_ID.');
            }
        })
        .catch(error => {
            console.error('Error fetching subscriber count:', error);
            alert(`エラーが発生しました:\n${error.message}\n\nAPIキーの制限設定（リファラー）や有効化状態を確認してください。`);

            // Fallback to simulation on error so UI doesn't look broken
            const simulatedCount = 385;
            updateDisplay(simulatedCount, GOAL, countEl, percentEl, barEl);
        });
}

function updateDisplay(current, goal, countEl, percentEl, barEl) {
    const percentage = Math.min((current / goal) * 100, 100);

    // Animate Number
    animateValue(countEl, 0, current, 2000);

    // Update Progress Bar
    setTimeout(() => {
        barEl.style.width = `${percentage}%`;
    }, 500);

    // Update Percentage Text
    percentEl.textContent = `${percentage.toFixed(1)}%`;
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
