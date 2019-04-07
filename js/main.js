document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.jh-navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {

        // Add a click event on each of them
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {

                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);

                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');

            });
        });
    }
    const $navbarDropdowns = Array.prototype.slice.call(document.querySelectorAll('.has-dropdown'), 0);
    // Check if there are any navbar burgers
    if ($navbarDropdowns.length > 0) {

        // Add a click event on each of them
        $navbarDropdowns.forEach(el => {
            if (el.firstElementChild && el.firstElementChild.classList.contains('navbar-link')) {
                el.firstElementChild.addEventListener('click', () => {
                    el.childNodes.forEach(value => {
                        if (value.classList && value.classList.contains('navbar-dropdown')) {
                            el.classList.toggle('is-active');
                        }
                    })
                });
            }
        });
    }
    if (localStorage.getItem('dark')) {
        document.documentElement.classList.add('dark');
        document.querySelector("#darkMode").checked = document.documentElement.classList.contains('dark');
    }
});


function toggleDark(event) {
    document.documentElement.classList.toggle('dark');
    if (localStorage.getItem('dark')) {
        localStorage.removeItem('dark');
    } else {
        localStorage.setItem('dark', true);
    }
}