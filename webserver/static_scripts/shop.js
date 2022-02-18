const shop_buttons = document.querySelectorAll("img[alt]");
console.log(shop_buttons);

shop_buttons.forEach(sb => {
  sb.addEventListener("click", event => {
    let targetElement = event.target;
    console.log("Clicked on: " + targetElement.alt);

    fetch("click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Find some way to put an actual useful value in here...
      body: JSON.stringify({ click: targetElement.alt }),
    });
  });
});