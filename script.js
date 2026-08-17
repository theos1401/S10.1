const API_KEY = "eee8d770c6d41e58030ac1d6ab9a798e";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const SEARCH_URL =
  BASE_URL + "/search/movie?api_key=" + API_KEY + "&language=fr-FR&query=";

const moviesGrid = document.getElementById("moviesGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const categorySelect = document.getElementById("categorySelect");
const favBtn = document.getElementById("favBtn");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

loadMovies();

function loadMovies() {
  getMovies(
    BASE_URL +
      "/movie/" +
      categorySelect.value +
      "?api_key=" +
      API_KEY +
      "&language=fr-FR&page=1",
  );
}

function getMovies(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => displayMovies(data.results));
}

function displayMovies(movies) {
  moviesGrid.innerHTML = "";
  movies.forEach((movie) => {
    const { title, poster_path, vote_average, id } = movie;
    const isFav = favorites.includes(id);
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie-card");
    movieEl.innerHTML = `
      <span class="fav-icon">${isFav ? "❤️" : "🤍"}</span>
      <img src="${poster_path ? IMG_URL + poster_path : "https://via.placeholder.com/500x750?text=No+Image"}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="rating ${getColor(vote_average)}">${vote_average > 0 ? vote_average.toFixed(1) + "/10" : "N/A"}</span>
      </div>
    `;
    movieEl.addEventListener("click", () => openMovieDetails(id, title));
    movieEl.querySelector(".fav-icon").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(id);
      loadMovies();
    });
    moviesGrid.appendChild(movieEl);
  });
}

function getColor(vote) {
  if (vote >= 7) return "green";
  else if (vote >= 5) return "orange";
  else return "red";
}

function toggleFavorite(id) {
  favorites.includes(id)
    ? (favorites = favorites.filter((favId) => favId !== id))
    : favorites.push(id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function openMovieDetails(id, title) {
  fetch(BASE_URL + "/movie/" + id + "?api_key=" + API_KEY + "&language=fr-FR")
    .then((res) => res.json())
    .then((movie) => {
      // 1. On vérifie si le synopsis existe
      let synopsis = movie.overview;
      if (!synopsis || synopsis.trim() === "") {
        synopsis = "Aucun résumé disponible pour ce film.";
      }

      // 2. Lien Google si pas de synopsis
      const googleLink = !movie.overview
        ? `<a href="https://www.google.com/search?q=${encodeURIComponent(title + " synopsis film")}" target="_blank" class="google-link">Rechercher sur Google</a>`
        : "";

      modalBody.innerHTML = `
      <div class="modal-body">
        <img src="${movie.poster_path ? IMG_URL + movie.poster_path : "https://via.placeholder.com/500x750?text=No+Image"}" alt="${movie.title}">
        <div class="modal-info">
          <h2>${movie.title}</h2>
          <p><b>Date:</b> ${movie.release_date || "N/A"}</p>
          <p><b>Note:</b> ${movie.vote_average ? movie.vote_average.toFixed(1) + "/10" : "N/A"}</p>
          <p><b>Genres:</b> ${movie.genres.length > 0 ? movie.genres.map((g) => g.name).join(", ") : "N/A"}</p>
          <p><b>Synopsis:</b> ${synopsis}</p>
          ${googleLink}
        </div>
      </div>
    `;
      modal.style.display = "block";
    });
}

closeModal.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target == modal) modal.style.display = "none";
};

searchBtn.addEventListener("click", () => {
  const searchTerm = searchInput.value;
  searchTerm ? getMovies(SEARCH_URL + searchTerm) : loadMovies();
});

categorySelect.addEventListener("change", loadMovies);

favBtn.addEventListener("click", () => {
  if (favorites.length === 0) {
    moviesGrid.innerHTML =
      '<h2 style="text-align:center; grid-column: 1/-1">Aucun favori ❤️</h2>';
    return;
  }
  Promise.all(
    favorites.map((id) =>
      fetch(
        BASE_URL + "/movie/" + id + "?api_key=" + API_KEY + "&language=fr-FR",
      ).then((res) => res.json()),
    ),
  ).then((movies) => displayMovies(movies));
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});
