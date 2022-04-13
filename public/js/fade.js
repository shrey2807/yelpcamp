const myAlert = document.querySelector("#myAlert");

if (myAlert) {
    window.setTimeout(function () {
        myAlert.style.display = "none";
    }, 3000);
}