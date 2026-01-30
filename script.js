let searchBox = document.getElementById("srch");
let searchBtn = document.getElementById("btn");
let cardContainer = document.querySelector(".emptyCard");

searchBtn.addEventListener("click", async function () {
    let username = searchBox.value;
    
    searchBtn.innerText = "Searching...";
    searchBtn.disabled = true; 
    cardContainer.style.opacity = "0.5";

    try {

        let response = await fetch(`https://api.github.com/users/${username}`);
        let data = await response.json();

        let repoResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=created&per_page=5`);
        let repos = await repoResponse.json();

        let langCounts = {};
        repos.forEach(repo => {
            let lang = repo.language;
            if (lang) {
                if (langCounts[lang]) {
                    langCounts[lang]++;
                } else {
                    langCounts[lang] = 1;
                }
            }
        });

        let topLanguage = "Generalist";
        let maxCount = 0;
        for (let lang in langCounts) {
            if (langCounts[lang] > maxCount) {
                maxCount = langCounts[lang];
                topLanguage = lang;
            }
        }

        let repoLinks = repos.map(repo => {
            return `<a href="${repo.html_url}" target="_blank" style="margin: 5px; display: inline-block; padding: 5px 10px; background-color: #0079ff; color: white; text-decoration: none; border-radius: 5px; font-size: 0.8rem;">${repo.name}</a>`;
        }).join('');

        if (data.message == "Not Found") {
            cardContainer.innerHTML = "<h3>User Not Found</h3>";
            return; 
        }
        cardContainer.innerHTML = `
            <div class="profile-card">
                
                <div class="card-left">
                    <div class="avatar-box">
                        <img src="${data.avatar_url}" alt="Profile Picture">
                    </div>
                    <h2>${data.name || username}</h2>
                    <p style="color: #ccc; font-size: 0.9rem;">
                        📍 ${data.location || "Earth"} &nbsp;&nbsp; 📅 Joined ${new Date(data.created_at).toLocaleDateString()}
                    </p>
                    <p class="bio"><em>${data.bio || "No bio available"}</em></p>

                    <div class="skill-badge">
                        <span>Top Skill: <strong>${topLanguage}</strong></span>
                    </div>

                    <div class="stats">
                        <span><strong>${data.followers}</strong><br>Followers</span>
                        <span><strong>${data.following}</strong><br>Following</span>
                        <span><strong>${data.public_repos}</strong><br>Repos</span>
                    </div>

                    <a href="${data.html_url}" target="_blank" class="view-btn">View Profile on GitHub</a>
                </div>

                <div class="card-right">
                    <div class="repos-section">
                        <h4>Latest Projects</h4>
                        <div class="repo-grid">${repoLinks}</div>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="langChart"></canvas>
                    </div>
                </div>

            </div>
        `;

        let labels = Object.keys(langCounts);
        let dataValues = Object.values(langCounts);
        
        const canvasElement = document.getElementById('langChart');
        if (canvasElement) {
            let ctx = canvasElement.getContext('2d');

            if (window.myChart) window.myChart.destroy();

            window.myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Repos containing',
                        data: dataValues,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: 'white' } }
                    }
                }
            });
        }
    } catch (error) {
        console.error(error);
        cardContainer.innerHTML = "<h3>Error fetching data</h3>";

    } finally {
        searchBtn.innerText = "Search";
        searchBtn.disabled = false;
        cardContainer.style.opacity = "1";
    }
});
searchBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});