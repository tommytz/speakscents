
document.getElementById("deny_cookie_btn").addEventListener("click", denyCookie);

function denyCookie() {
    console.log("denied");
    document.getElementById("cookie_popup").style.display="none";
}
