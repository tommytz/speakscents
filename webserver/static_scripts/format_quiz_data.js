const form = document.getElementById('quiz');
form.addEventListener("submit", handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault();
  const data = new FormData(event.target);
  const values = Object.fromEntries(data.entries());

  // Add values for multi-part form data
  values.day_or_night = data.getAll("day_or_night");
  if (values.day_or_night.length > 1) {
    values.day_or_night.pop();
  }
  values.season = data.getAll("season");
  if (values.season.length > 1) {
    values.season.pop();
  }
  values.gender = data.getAll("gender");
  if (values.gender.length > 1) {
    values.gender.pop();
  }
  values.moods = data.getAll("moods");
  if (values.moods.length > 1) {
    values.moods.pop();
  }
  values.scent_styles = data.getAll("scent_styles");
  if (values.scent_styles.length > 1) {
    values.scent_styles.pop();
  }

  // Post to server
  fetch("quiz-submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values)
  });
}


