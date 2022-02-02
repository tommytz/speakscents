const form = document.getElementById('quiz');

form.addEventListener("submit", handleFormSubmit);

function handleFormSubmit(event) {
  // For this example, don't actually submit the form
  event.preventDefault();
  console.log("onsubmit success");
}


