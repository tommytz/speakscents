/*
 * This script contains the selectors and functions to control the popup box.
 * It does not load images or content. Simply controls the display and events on the popup
 * */

//Selection of html elements with querySelectorAll and overlay element.
const openPopupBtn = document.querySelectorAll("[data-modal-target]");
const closePopupBtn = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

//Adding event listener for each button that is set with [data-modal-button]
openPopupBtn.forEach(button => {
    button.addEventListener("click", () => {
        const popup = document.querySelector(button.dataset.modalTarget);
        openPopup(popup);
    });
});

//Adding event listener for each button that is set with [data-close-button]
closePopupBtn.forEach(button => {
    button.addEventListener("click", () => {
        const close = button.closest(".popup");
        closePopup(close);
    });
});

//Adds a class "active" that triggers CSS styling in popup.css
function openPopup(modal){
    if(modal == null){
        return;
    }
    modal.classList.add("active");
    overlay.classList.add("active");
}

//Removes the class "active" that triggers CSS styling in popup.css
function closePopup(modal){
    if(modal == null){
        return;
    }
    modal.classList.remove("active");
    overlay.classList.remove("active");
}


//Adding event listener for the overlay, if the user clicks outside while the popup is active, will exit popup.
overlay.addEventListener("click", () => {
    const popups = document.querySelectorAll(".popup.active");
    popups.forEach(popups => {
        closePopup(popups);
    });
});