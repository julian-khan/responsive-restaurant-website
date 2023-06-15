
function toggleMenus(e) {
    /*This function serves as an event handler for when one of the three menu buttons are clicked. The menu corresponding
    to the clicked button is shown and the other two are hidden to enhance user experience. */
    const buttonClassName = this.className;

    let sectionToShow = null;
    if (buttonClassName.includes('lunch-menu')) {
        sectionToShow = document.querySelector('.lunch-menu');
    } else if (buttonClassName.includes('dinner-menu')) {
        sectionToShow = document.querySelector('.dinner-menu');
    } else if (buttonClassName.includes('takeaway-menu')) {
        sectionToShow = document.querySelector('.takeaway-menu');
    }
    // Style the selected button to show that it has been clicked
    manageActiveButtonStyling(this);

    // Display the menu corresponding to the clicked button and hide the other two menus
    const menuSections = [...document.querySelectorAll('.menu-container')];
    menuSections.forEach((menuSect) => {
        if (menuSect === sectionToShow) {
            menuSect.classList.remove('hidden');

        } else {
            menuSect.classList.add('hidden');
        }
    })
}

/* Add styling the clicked button to show that it has been clicked and remove the active styling 
from the button that was formerly styled in this manner. */
function manageActiveButtonStyling(activeButtonElement) {
    activeButtonElement.classList.add('active-button');

    [...document.querySelectorAll('.menu-buttons button')].forEach((button) => {
        if (button != activeButtonElement) {
            button.classList.remove('active-button');
        }
    })
            
}

function main() {
    // Add an event listener to the three menu buttons
    const menuButtons = [...document.querySelectorAll('.menu-buttons button')];
    menuButtons.forEach((button) => {
        button.addEventListener('click', toggleMenus);
    })

    //Hide all menus except the lunch menu on page load
    const menuSections = [...document.querySelectorAll('.menu-container')];
    menuSections.forEach((menuSect) => {
        if (!menuSect.className.includes('lunch-menu')) {
            menuSect.classList.add('hidden');
        } 
    });

    // Set the lunch menu button as the default active button
    const defaultActiveButton = document.querySelector('button[class*=lunch-menu]');
    defaultActiveButton.classList.add('active-button');



}
