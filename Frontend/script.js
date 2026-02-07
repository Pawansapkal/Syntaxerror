// DROPDOWN OPEN / CLOSE
function toggleCityMenu() {
  const menu = document.getElementById("cityMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// SELECT CITY
function selectCity(city) {
  alert("City Selected: " + city);
  document.getElementById("cityMenu").style.display = "none";
}

// SEARCH FILTER
function filterCity() {
  const input = document.getElementById("citySearch").value.toLowerCase();
  const items = document.querySelectorAll("#cityMenu div");

  items.forEach(item => {
    if (item.innerText.toLowerCase().includes(input)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}
