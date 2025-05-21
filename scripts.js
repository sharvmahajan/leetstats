async function fetchDetails(username) {
    const url = `https://alfa-leetcode-api.onrender.com/userProfile/${username}`;
    const res = await fetch(url);
    if (!res.ok) {
        alert("Error!");
        return;
    }
    const data = await res.json();

    // Check if user exists (API returns ranking for valid users)
    if (!data) {
        alert("User not found!");
        return;
    }

    // Profile and stats
    const ranking = data.ranking;
    const stats = data.matchedUserStats && data.matchedUserStats.acSubmissionNum ? data.matchedUserStats.acSubmissionNum : [];

    const total = stats.find(s => s.difficulty === 'All') || { count: 0, submissions: 0 };
    const easy = stats.find(s => s.difficulty === 'Easy') || { count: 0, submissions: 0 };
    const medium = stats.find(s => s.difficulty === 'Medium') || { count: 0, submissions: 0 };
    const hard = stats.find(s => s.difficulty === 'Hard') || { count: 0, submissions: 0 };

    document.getElementById('user-rank').textContent = ranking ? `#${ranking}` : '--';
    document.getElementById('total-solved').textContent = `${total.count}`;
    document.getElementById('easy-stats').textContent = `${easy.count} / ${data.totalEasy}`;
    document.getElementById('medium-stats').textContent = `${medium.count} / ${data.totalMedium}`;
    document.getElementById('hard-stats').textContent = `${hard.count} / ${data.totalHard}`;

    // Update circle progress bar
    const percent = total.submissions > 0 ? Math.round((total.count / data.totalQuestions) * 100) : 0;
    document.querySelector('.circle-progress').style.background = `
        conic-gradient(
            #ffb800 0% ${percent}%,
            #333 0% 100%
        )
    `;
}

document.getElementById('search-btn').addEventListener('click', function () {
    const username = document.getElementById('username').value.trim();
    if (username) {
        fetchDetails(username);
    }
});