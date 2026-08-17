// ============================================================
//  leaderboard.js  —  Click Rush
//  Only loaded in:  leaderboard.html
//  Depends on:         utils.js  (must be loaded first)
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

  // ─── GET DOM ELEMENTS ───────────
  const leaderboardTbody = document.getElementById("leaderboard_tbody");

  const btnGlobal  = document.getElementById("global");
  const btnWeekly  = document.getElementById("week");
  const btnDaily   = document.getElementById("today");


  // ─── FETCH LEADERBOARD ─────────────────────────────────────

 async function fetchLeaderboard(type) {

    if (leaderboardTbody) {
      leaderboardTbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; color:#888;">
            Loading...
          </td>
        </tr>`;
    }

    try {
      const response = await fetch(`/api/leaderboard/${type}`, {
        credentials: "include"
      });

      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const data = await response.json();
      displayLeaderboard(data);

    } catch (error) {
      console.error("Leaderboard error:", error);
      if (leaderboardTbody) {
        leaderboardTbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center; color:#888;">
              Unable to load leaderboard. Try again.
            </td>
          </tr>`;
      }
    }

  }


  // ─── DISPLAY LEADERBOARD ───────────────────────────────────
  //  builds <tr>/<td> rows into leaderboard_tbody
  function displayLeaderboard(data) {
    if (!leaderboardTbody) return;

    leaderboardTbody.innerHTML = "";

    if (!data || data.length === 0) {
      leaderboardTbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; color:#888;">
            No scores yet. Be the first to play!
          </td>
        </tr>`;
      return;
    }

    data.forEach(function (user) {
      const medal = user.rank === 1 ? "🥇"
                  : user.rank === 2 ? "🥈"
                  : user.rank === 3 ? "🥉"
                  : `#${user.rank}`;

      const dateStr = user.date
        ? new Date(user.date).toLocaleDateString()
        : "-";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${medal}</td>
        <td>${escapeHtml(user.username)}</td>
        <td>${user.score}</td>
        <td>${dateStr}</td>
      `;
      leaderboardTbody.appendChild(row);
    });
  }


  // ─── HELPER: escape user-controlled text before inserting ──
  // Prevents a malicious username from injecting HTML/script
  // into the page.

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }


  // ─── TAB BUTTON EVENTS ────────────────────────
 function setActiveTab(activeBtn) {
    [btnGlobal, btnWeekly, btnDaily].forEach(btn => {
      if (btn) btn.classList.remove("active");
    });
    if (activeBtn) activeBtn.classList.add("active");
  }

  if (btnGlobal) {
    btnGlobal.addEventListener("click", function () {
      setActiveTab(btnGlobal);
      fetchLeaderboard("global");
    });
  }

  if (btnWeekly) {
    btnWeekly.addEventListener("click", function () {
      setActiveTab(btnWeekly);
      fetchLeaderboard("weekly");
    });
  }

  if (btnDaily) {
    btnDaily.addEventListener("click", function () {
      setActiveTab(btnDaily);
      fetchLeaderboard("daily");
    });
  }


  // ─── DEFAULT: load global on page open ─────────────────────
  setActiveTab(btnGlobal);
  fetchLeaderboard("global");

}); // end DOMContentLoaded
