/*
 * This script contains the selectors and functions to control the popup box.
 * It does not load images or content. Simply controls the display and events on the popup
 * */

const openPopupBtn = document.querySelectorAll("[data-modal-target]");
const closePopupBtn = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

console.log("hello world!")

openPopupBtn.forEach(button => {
    button.addEventListener("click", () => {
        const popup = document.querySelector(button.dataset.modalTarget);
        openPopup(popup);
    });
});

closePopupBtn.forEach(button => {
    button.addEventListener("click", () => {
        const close = button.closest(".popup");
        closePopup(close);
    });
});

function openPopup(modal){
    if(modal == null){
        return;
    }
    modal.classList.add("active");
    overlay.classList.add("active");
}

function closePopup(modal){
    if(modal == null){
        return;
    }
    modal.classList.remove("active");
    overlay.classList.remove("active");
}

overlay.addEventListener("click", () => {
    const popups = document.querySelectorAll(".popup.active");
    popups.forEach(popups => {
        closePopup(popups);
    });
});