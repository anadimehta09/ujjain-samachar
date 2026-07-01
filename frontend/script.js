async function loadNews() {

  const response = await fetch(
    "https://ujjain-samachar.onrender.com/news"
  );

  const newsData = await response.json();

  const container = document.getElementById(
    "newsContainer"
  );

  container.innerHTML = "";

  newsData.forEach(news => {

    const card = document.createElement("div");

    card.classList.add("news-card");

    card.innerHTML = `

      ${
        news.type === "video"

        ?

        `
          <video controls width="100%">
            <source src="${news.media}">
          </video>
        `

        :

        `
          <img src="${news.media}" alt="news">
        `
      }

      <div class="news-content">

        <h3>${news.title}</h3>

        <p>${news.description}</p>

        <small style="
          color:gray;
          display:block;
          margin-top:10px;
        ">
          ${news.time || "Just Now"}
        </small>

        <div style="margin-top:15px;">

          ${
            news.comments
            ?

            news.comments.map(comment => `

              <p style="
                background:#f1f1f1;
                padding:8px;
                border-radius:8px;
                margin-top:5px;
              ">
                💬 ${comment}
              </p>

            `).join("")

            :

            ""
          }

        </div>

        <div style="margin-top:15px;">

          <input
            type="text"
            id="comment-${news.id}"
            placeholder="Write comment..."
            onkeypress="
  if(event.key === 'Enter'){
    addComment(${news.id})
  }
"
            style="
              width:100%;
              padding:10px;
              border-radius:8px;
              border:1px solid #ccc;
              margin-bottom:10px;
            "
          >

          <button
            onclick="addComment(${news.id})"
            class="news-btn"
          >
            Comment
          </button>

        </div>

        <button
          onclick="likeNews(${news.id})"
          class="news-btn"
        >
          ❤️ ${news.likes || 0}
        </button>

        <button
    onclick="shareNews(${news.id}, '${news.title}')"
    class="news-btn"
>
    📤 Share
</button>
        <a href="news.html?id=${news.id}">

          <button class="news-btn">
            Read More
          </button>

        </a>

      </div>

    `;

    container.appendChild(card);

  });

}

loadNews();

document
  .getElementById("searchInput")
  .addEventListener("input", searchNews);

async function searchNews(){

  const searchValue =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();

  const response = await fetch(
    "https://ujjain-samachar.onrender.com/news"
  );

  const newsData = await response.json();

  const filteredNews =
    newsData.filter(news =>

      news.title
        .toLowerCase()
        .includes(searchValue)

    );

  const container =
    document.getElementById("newsContainer");

  container.innerHTML = "";

  filteredNews.forEach(news => {

    const card = document.createElement("div");

    card.classList.add("news-card");

    card.innerHTML = `

      ${
        news.type === "video"

        ?

        `
          <video controls width="100%">
            <source src="${news.media}">
          </video>
        `

        :

        `
          <img src="${news.media}" alt="news">
        `
      }

      <div class="news-content">

        <h3>${news.title}</h3>

        <p>${news.description}</p>

        <small style="
          color:gray;
          display:block;
          margin-top:10px;
        ">
          ${news.time || "Just Now"}
        </small>

        <div style="margin-top:15px;">

          ${
            news.comments
            ?

            news.comments.map(comment => `

              <p style="
                background:#f1f1f1;
                padding:8px;
                border-radius:8px;
                margin-top:5px;
              ">
                💬 ${comment}
              </p>

            `).join("")

            :

            ""
          }

        </div>

        <div style="margin-top:15px;">

          <input
            type="text"
            id="comment-${news.id}"
            placeholder="Write comment..."
            onkeypress="
  if(event.key === 'Enter'){
    addComment(${news.id})
  }
"
            style="
              width:100%;
              padding:10px;
              border-radius:8px;
              border:1px solid #ccc;
              margin-bottom:10px;
            "
          >

          <button
            onclick="addComment(${news.id})"
            class="news-btn"
          >
            Comment
          </button>

        </div>

        <button
          onclick="likeNews(${news.id})"
          class="news-btn"
        >
          ❤️ ${news.likes || 0}
        </button>

        <button
    onclick="shareNews(${news.id}, '${news.title}')"
    class="news-btn"
>
    📤 Share
</button>
        <a href="news.html?id=${news.id}">

          <button class="news-btn">
            Read More
          </button>

        </a>

      </div>

    `;

    container.appendChild(card);

  });

}

async function likeNews(id){

  await fetch(
    `https://ujjain-samachar.onrender.com/like-news/${id}`,
    {
      method:"PUT"
    }
  );

  loadNews();

}

async function addComment(id){

  const commentInput =
    document.getElementById(
      `comment-${id}`
    );

  const comment =
    commentInput.value;

  if(!comment) return;

  await fetch(

    `https://ujjain-samachar.onrender.com/comment-news/${id}`,

    {
      method:"PUT",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({
        comment
      })
    }

  );

  loadNews();

}
async function addComment(id){

  const commentInput =
    document.getElementById(
      `comment-${id}`
    );

  const comment =
    commentInput.value;

  if(!comment) return;

  await fetch(

    `https://ujjain-samachar.onrender.com/comment-news/${id}`,

    {
      method:"PUT",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({
        comment
      })
    }

  );

  loadNews();

}
async function loadBreakingNews(){

  const response = await fetch(
    "https://ujjain-samachar.onrender.com/breaking-news"
  );

  const data = await response.json();

  document.getElementById(
    "breakingText"
  ).innerText = data.text;

}

loadBreakingNews();
async function loadTeam(){

  const response = await fetch(
    "https://ujjain-samachar.onrender.com/team"
  );

  const teamData = await response.json();

  const container =
    document.getElementById(
      "teamContainer"
    );

  if(!container) return;

  container.innerHTML = "";

  teamData.forEach(member => {

    container.innerHTML += `

      <div class="team-card">

        <div class="team-image-box">

          <img
            src="${member.image}"
          >

        </div>

        <h3>${member.name}</h3>

        <span class="team-role">
          ${member.position}
        </span>

        <p class="team-description">
          ${member.description}
        </p>

        <div class="team-info">

          <p>
            📞 ${member.contact}
          </p>

          <p>
            🎂 ${member.dob}
          </p>

          <p>
            📍 ${member.address}
          </p>

        </div>

      </div>

    `;

  });

}

loadTeam();

/* ========= PREMIUM HOME REELS ========= */

async function loadHomeReels(){

  const response = await fetch(
    "https://ujjain-samachar.onrender.com/reels"
  );

  const reels = await response.json();

  const container =
    document.getElementById(
      "homeReels"
    );

  if(!container) return;

  container.innerHTML = "";

  reels.slice(0,4).forEach(reel => {

    const card =
      document.createElement("div");

    card.classList.add("reel-card");

    card.innerHTML = `

      <video muted>

        <source src="${reel.video}">

      </video>

      <div class="reel-overlay"></div>

      <div class="reel-play">

        ▶

      </div>

      <div class="reel-info">

        <span class="reel-tag">
          TRENDING
        </span>

        <h3>
          ${reel.caption || "Ujjain Update"}
        </h3>

        <p>
          Ujjain Samachar • Live Coverage
        </p>

      </div>

    `;

    card.onclick = () => {

      window.location.href =
        "reels.html";

    };

    container.appendChild(card);

  });

}

loadHomeReels();

function openReels(){

  window.location.href =
    "reels.html";

}
async function shareNews(id, title) {

    const shareUrl =
        `${window.location.origin}/news.html?id=${id}`;

    if (navigator.share) {

        try {

            await navigator.share({
                title: title,
                text: "Ujjain Samachar",
                url: shareUrl
            });

        } catch (err) {

            console.log(err);

        }

    } else {

        await navigator.clipboard.writeText(shareUrl);

        alert("Link copied successfully!");

    }

}