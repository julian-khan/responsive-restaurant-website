

function insertDateInputs(numExtrDates = 2) {
    /* If the #booking-large-group checkbox is checked, the user must supply two extra preferred dates in case
    the restaurant cannot accommodate their initial request. This function creates one date input and label. */

    for (let i = 0; i < numExtrDates; i++) {
        const dateNodeClone = createDateInput();
        /* Create a Javascript array from a node list using the spread operator and return the last node in the array
        using the .pop() method*/
        finalDateContainer = [...document.querySelectorAll('.date-container')].pop();
        // Insert the cloned date node after the finalDateContainer node
        finalDateContainer.after(dateNodeClone);
    }
}

function createDateInput() {
    // This function creates a date node from an HTML template with the required markup
    const dateTemplate = document.querySelector('.date-template');
    let clone = dateTemplate.content.firstElementChild.cloneNode(true);

    const numExistingDates = document.querySelectorAll('.dynamic.date-container').length;

    let clonedLabel = clone.querySelector('label');
    /*Uniquely number the for attribute, +2 due to 0-indexing and the fact that at least one 
    date container already exists */
    clonedLabel.htmlFor += numExistingDates + 2;  
    clonedLabel.innerHTML += `${numExistingDates + 2} <span>*</span>`;

    let clonedInput = clone.querySelector('input');
    //ensure a unique id and name for the cloned node
    clonedInput.id += numExistingDates + 2;
    clonedInput.name += numExistingDates + 2;
    return clone;
}

/* The below functions validate various types of input elements using JavaScript regular expressions. The validation is not overly strict, 
to prevent validation from failing unnecessarily. */
function isValidEmail(emailStr) {
    // The below regex expression was adapted from https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript.
    const regex = /^[^@\s]+@[^@\s]+.[^@\s]+$/;
    return regex.test(emailStr);
}

//The below function checks if, for a collection of radio inputs with a given name, one radio input is selected.
function isRadioInputSelected(radioElement) {
    const inputName = radioElement.name;
    const sameRadioList = radioElement.closest('.radio-list').querySelectorAll(`input[type=radio][name=${inputName}]`);
    for (let i = 0; i < sameRadioList.length; i++) {
        if (sameRadioList[i].checked) {
            return true;
        }
    }
    return false;
}

function isValidName(nameStr) {
    //Below regex expression adapted from https://stackoverflow.com/questions/2385701/regular-expression-for-first-and-last-name
    //The name must be at least two characters in length and allows for the "-',." characters
    const regex = /^[-',\. a-z]{2,}$/i;
    return regex.test(nameStr);
}

function isValidTel(telStr) {
    const regex = /^((04\d{8})|(9\d{7}))$/; 
    return regex.test(telStr);
}

function isValidDate(dateStr) {
    // The below function checks that the argument passed to the function is a date string that is after the present date.
    const eventDate = new Date(dateStr);
    const currentDate = new Date();
    return eventDate > currentDate;
}

const attemptedSubmitHandler = (e) => {
    // This function is called if the user attempts to submit the form. The function checks that none of the required inputs are invalid.
    const requiredInputs = document.querySelectorAll('input[required]:not(.hidden input), input.required:not(.hidden input), select[required]');

    if (requiredInputs.length > 0) {
        manageInvalidInputErrorDisplays(requiredInputs);
    }
    
    //Check if any required visible inputs have errors and preventS the form being submitted if errors exist    
    const inputsWithErrors = document.querySelectorAll('form .invalid:not(.hidden input)');
    if (inputsWithErrors.length > 0) {
        e.preventDefault();
        return;
    }
}

function manageInvalidInputErrorDisplays(requiredInputs) {
    //This function manages the reporting of invalid inputs for required form fields to the user.
    
    let errorPresent = false;

    for (let i = 0; i < requiredInputs.length; i++) {
        const errorMessage = requiredInputs[i].parentNode.querySelector('.error-message'); //containing div  

        if (!(isValidField(requiredInputs[i]))) {
            errorPresent = true;
            requiredInputs[i].classList.add('invalid');

            //Check if an error message has already been created
            if (errorMessage) { 
                errorMessage.classList.remove('invisible')
                
            // If the error message does not exist, create it
            } else {
                let errorPara = document.createElement('p');
                errorPara.textContent = createErrorMessageStr(requiredInputs[i]);
                errorPara.classList.add('dynamic', 'error-message');
                requiredInputs[i].parentNode.appendChild(errorPara);
            }
        }
        else {
            requiredInputs[i].classList.remove('invalid');
            errorMessage ? errorMessage.classList.add('invisible') : null;
        }
    }
    
    // Display a global error message on the form if there are errors present.
    const form = requiredInputs[0].closest('form');
    errorPresent? manageGlobalErrorMessage(form, true) : manageGlobalErrorMessage(form, false);
}

function isValidField(inputElement) {
    /*This function determines whether or not a given input element has a valid value, using a callback function
    chosen based on the particular type of input. */
    if (!inputElement.validity.valid) {
        return false;
    }

    if (inputElement.type === 'radio') {
        return isRadioInputSelected(inputElement);
    }

    if (inputElement.type === 'email') {
        return isValidEmail(inputElement.value);
    } else if (inputElement.type === 'text' && 
    inputElement.name.includes('name')) { 
            return isValidName(inputElement.value);
    } else if (inputElement.type === 'tel') {
        return isValidTel(inputElement.value);
    } //Check if the date is after the current date
    else if (inputElement.type === 'date') { 
        return inputElement.validity.valid && isValidDate(inputElement.value)
    } else if (inputElement.type === 'select-one') {
        return !(inputElement.validity.valueMissing);
    }
}

function manageGlobalErrorMessage(formNode, isError) {
    /* This function manages the creation and display of a global error message, to indicate to the user that there is an error in one
    or more required form fields. */
    const sectionGlobalErrorElement = formNode.querySelector('.section-global-error');

    if (isError) {
        if (sectionGlobalErrorElement) {
            sectionGlobalErrorElement.classList.remove('invisible');
        }
        else {
            let errorPara = document.createElement('p');
            errorPara.textContent = 'There is an error in the input for one or more fields. Please check your entries.';
            errorPara.classList.add('dynamic', 'error-message', 'section-global-error');

            const insertLocation = formNode.querySelector('.submit-container');
            insertLocation.before(errorPara);
        }   
    } else {
        sectionGlobalErrorElement ? sectionGlobalErrorElement.classList.add('invisible') : null;
    }
}

function createErrorMessageStr(inputElement) {
    /* This function creates a specific error message for specific input elements that have failed
    input validation. */
    const type = inputElement.type;
    const name = inputElement.name;

    if (type === 'select-one') {
        return 'Please select one option.';
    }

    if(name.includes('name')) {
        return 'A name field must be at least two characters in length and only consist of alphabetical characters.'
    } else if (name.includes('date') && !name.includes('birth')) {
        return 'A date must be selected that is after the current date.'
    } else if (name.includes('date')) {
        return 'A valid date must be selected.'
    } else if (name.includes('email')) {
        return 'An invalid email address was entered. Please enter a valid email address.'
    } else if (name.includes('contact-number')) {
        return 'Please enter a valid Australian mobile or landline number.'
    } else if (type === 'radio') {
        return 'Please select one option.'
    } else if (type === 'textarea') {
        return 'A message of at least two characters in length is required for this section.'
    } 
}

function main() {
    // The main() function executes the script and calls the required functions

    const eventBookingCheckbox = document.getElementById('booking-large-group');

    // Add an event listener to the eventBookingCheckbox node
    eventBookingCheckbox.addEventListener('change', (e) => {
        const extraDateFields = document.querySelectorAll('.dynamic.date-container');
        
        if (e.target.checked && extraDateFields.length == 2) { //If two extra date fields have already been created
            [...extraDateFields].forEach((dateContainer) => {
                dateContainer.classList.remove('hidden');
                //Make the now visible date nodes required inputs
                dateContainer.querySelector('input').required = true;
            });
        } else if (e.target.checked) { //The checkbox is checked but two extra date fields have not been created
            insertDateInputs()
        } else { //e.target is unchecked
            [...extraDateFields].forEach((dateContainer) => {
                // Hide date nodes that are not needed (ie not a large group or event booking)
                dateContainer.classList.add('hidden');
                //Need to set required to false if the extra date component is hidden so that the form can submit
                dateContainer.querySelector('input').required = false;
            });
        }
    });

    // Add an event handler for when the user attempts to submit the form
    document.querySelector('input[type=submit]').addEventListener('click', attemptedSubmitHandler);
    }