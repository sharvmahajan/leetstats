async function fetchDetails(username) {
    const url = `https://leetcode-stats-api.herokuapp.com/${username}`;
    try {
        const res = await fetch(url);

        if (!res.ok) {
            alert("Error fetching data!");
            return;
        }

        const data = await res.json();

        // Check if user exists (API returns status: success)
        if (!data || data.status !== "success") {
            alert("User not found!");
            return;
        }

        // Extract stats from API response
        const ranking = data.ranking || "--";
        const totalSolved = data.totalSolved || 0;
        const totalQuestions = data.totalQuestions || 1; // avoid division by zero
        const easySolved = data.easySolved || 0;
        const totalEasy = data.totalEasy || 0;
        const mediumSolved = data.mediumSolved || 0;
        const totalMedium = data.totalMedium || 0;
        const hardSolved = data.hardSolved || 0;
        const totalHard = data.totalHard || 0;

        // Update UI elements
        document.getElementById("user-rank").textContent = `#${ranking}`;
        document.getElementById("total-solved").textContent = `${totalSolved}`;
        document.getElementById("easy-stats").textContent = `${easySolved} / ${totalEasy}`;
        document.getElementById("medium-stats").textContent = `${mediumSolved} / ${totalMedium}`;
        document.getElementById("hard-stats").textContent = `${hardSolved} / ${totalHard}`;

        // Update circular progress bar
        const percent = Math.round((totalSolved / totalQuestions) * 100);
        document.querySelector(".circle-progress").style.background = `
            conic-gradient(
                #ffb800 0% ${percent}%,
                #333 0% 100%
            )
        `;
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
    }
}

// Search button click event
document.getElementById("search-btn").addEventListener("click", function () {
    const username = document.getElementById("username").value.trim();
    if (username) {
        fetchDetails(username);
    }
});
