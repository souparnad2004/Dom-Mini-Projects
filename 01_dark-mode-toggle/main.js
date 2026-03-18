const btn = document.getElementById("toggle-btn");

btn.addEventListener('click', () => {
    document.body.classList.toggle("dark")
    btn.innerText = "Toggle to light mode" === btn.innerText ? "Toggle to dark mode" : "Toggle to light mode"; 
})