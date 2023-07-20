
function toggleInputComponent(IsChecked, toggledCheckbox, creatorFunc) {
    /* This function is used to create, hide and show dynamically created HTML elements that are inserted into 
    the document tree. The function is passed an argument to creatorFunc, which is a callback function that 
    creates the required components for the given user input
    */
    
    if (IsChecked) { //If the target checkbox is checked, run the code contained in this if block.
            if (toggledCheckbox.nextElementSibling) { //if the dynamic input to be created already exists, set it to visible and return from function call.
                toggledCheckbox.nextElementSibling.classList.remove('invisible');
                return;
            }
            // If the required dynamic input does not exist, create it using the callback function.
            creatorFunc(toggledCheckbox);
        }
    else { //Hide rather than delete the DOM element to prevent it having to be recreated.
        toggledCheckbox.nextElementSibling.classList.add('invisible');
    }
    return
}

function updateFoodSelectedInput() {
    /* This function checks that the user has selected at least one menu item to order by using a hidden input with id 'food-selections-input'.
    If at least one food checkbox is checked, the input receives a value of 'true'. If no food input checkboxes are checked, the value remains empty.
    */
    const foodSelectionsInput = document.getElementById('food-selections-input');
    const foodCheckboxes = document.querySelectorAll('.menu-item input[type=checkbox]');

    for (let i = 0; i < foodCheckboxes.length; i++) {
        if (foodCheckboxes[i].checked) {
            foodSelectionsInput.value = 'true';
            return;
        }
    }
    foodSelectionsInput.value = '';
    return;
}

const nextButtonEventHandler = (e) => {
    /*The below conditional prevents the below code from being executed when click events occur on non-button elements. 
    This is needed because the parent form section is handling click events for its child buttons (event delegation). */
    if (!(e.target.nodeName === "BUTTON" && e.target.className.includes('next'))) { 
        return;
    }

    const targetContainer = e.target.closest('.form-section');
    const requiredInputs = targetContainer.querySelectorAll('input[required], textarea[required], input.required');

    // Call the below function to check that at least one food item has been selected.
    updateFoodSelectedInput();

    if (requiredInputs.length > 0) {
        // Call the below function to report any errors in required inputs
        manageInvalidInputErrorDisplays(requiredInputs);
    }
    
    //Check if any required visible inputs have errors and prevent the next section of the form being revealed if errors exist    
    const inputsWithErrors = targetContainer.querySelectorAll('.invalid:not(.invisible *)');
    if (inputsWithErrors.length > 0) {
        return;
    }

    let currentFormSectionIndex;
    //Find the next section of the form and display it
    const allFormSections = document.querySelectorAll('.form-section');
    let seenCurrentSection = false;

    for (let i = 0; i < allFormSections.length; i++) {
        if (allFormSections[i] === targetContainer) { //Current form section found
            allFormSections[i].classList.add('invisible');
            seenCurrentSection = true;
            continue;
        }
        if (seenCurrentSection && 
            allFormSections[i].querySelector('progress'))
         {  
            allFormSections[i].classList.remove('invisible');
            currentFormSectionIndex = i;
            break;
        } 
    }

    //Update progress bar element in all form sections
    const formProgressAsDecimal = (currentFormSectionIndex + 1) / allFormSections.length  // +1 due to 0-indexing
    setFormProgressValues(formProgressAsDecimal);
    setFormSectionNumbers();

    e.target.className.includes('takeaway-select') ? createOrderSummary() : null;
};

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
    const formSectionElement = requiredInputs[0].closest('.form-section');
    errorPresent? manageGlobalErrorMessage(formSectionElement, true) : manageGlobalErrorMessage(formSectionElement, false);
}

function manageGlobalErrorMessage(formSectionElement, isError) {
    /* This function manages the creation and display of a global error message, to indicate to the user that there is an error in one
    or more required form fields. */
    const sectionGlobalErrorElement = formSectionElement.querySelector('.section-global-error');

    if (isError) {
        if (sectionGlobalErrorElement) {
            sectionGlobalErrorElement.classList.remove('invisible');
        }
        else {
            const errorPara = createErrorPara();
            const insertLocation = formSectionElement.querySelector('.button-container');
            insertLocation.before(errorPara);
        }   
    } else {
        sectionGlobalErrorElement ? sectionGlobalErrorElement.classList.add('invisible') : null;
    }
}

function createErrorPara() {
    let errorPara = document.createElement('p');
    errorPara.textContent = 'There is an error in the input for one or more fields. Please check your entries.';
    errorPara.classList.add('dynamic', 'error-message', 'section-global-error');
    return errorPara;
}

function createErrorMessageStr(inputElement) {
    /* This function creates a specific error message for specific input elements that have failed
    input validation. */
    const type = inputElement.type;
    const name = inputElement.name;

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
    } else if (name === 'food-selections') {
        return 'Please select at least one menu item.'
    }
}

function isValidField(inputElement) {
    /*This function determines whether or not a given input element has a valid value, using callback function
    selected based on the particular type of input. */
    if (!inputElement.validity.valid) {
        return false;
    }

    if (inputElement.type === 'radio') {
        return isRadioInputSelected(inputElement);
    }

    if (inputElement.type === 'email') {
        return isValidEmail(inputElement.value);
    } else if (inputElement.type === 'text' && 
    (inputElement.name.includes('first-name') || 
    inputElement.name.includes('last-name'  ))) { 
        return isValidName(inputElement.value);
    } else if (inputElement.type === 'tel') {
        return isValidTel(inputElement.value);
    } //Check if the date is after the current date, which should be the case for event dates other than the user's birthday
    else if (inputElement.type === 'date' && !inputElement.name.includes('birth-date')) { 
        return inputElement.validity.valid && isValidDate(inputElement.value)
    } // The element.validity.valid property is true if the date is valid and false if it is not valid 
    else if (inputElement.type === 'date') { 
        return inputElement.validity.valid;
    } else if (inputElement.type === 'textarea') {
        return isValidTextArea(inputElement.value);
    }

    //Check that at least one food item has been selected in the menu
    if (inputElement.name === "food-selections") {
        return isFoodSelected(inputElement);
    }
}

function isRadioInputSelected(radioElement) {
    //This function checks if, for a collection of radio inputs with a given name, one radio input is selected
    const inputName = radioElement.name;
    const sameRadioList = radioElement.closest('.radio-container').querySelectorAll(`input[type=radio][name=${inputName}]`);
    for (let i = 0; i < sameRadioList.length; i++) {
        if (sameRadioList[i].checked) {
            return true;
        }
    }
    return false;
}

/* The below functions validate various types of input elements using JavaScript regular expressions. The validation is not overly strict, 
to prevent validation from failing unnecessarily. */
function isValidEmail(emailStr) {
    // The below regex expression was adapted from https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript.
    const regex = /^[^@\s]+@[^@\s]+.[^@\s]+$/;
    return regex.test(emailStr);
}

function isValidName(nameStr) {
    /*Below regex expression adapted from https://stackoverflow.com/questions/2385701/regular-expression-for-first-and-last-name
    The name must be at least two characters in length and allows for the "-',." characters
    */
    const regex = /^[-',\. a-z]{2,}$/i;
    return regex.test(nameStr);
}

function isValidTel(telStr) {
    const regex = /^((04\d{8})|(9\d{7}))$/; 
    return regex.test(telStr);
}

function isValidTextArea(textAreaStr) {
    /*The below regex expression will match two or more alphanumeric characters. This flexible matching is appropriate
    for an input of type text area because these fields can contain varying types of text that may include letters or numbers 
    with varying character length.
    */
    const regex = /[\w]{2,}/;
    return regex.test(textAreaStr);
}

function isValidDate(dateStr) {
    // This function checks that the argument passed to the function is a date that is after the present date.
    const eventDate = new Date(dateStr);
    const currentDate = new Date();
    return eventDate > currentDate;
}

function isFoodSelected(inputElement) {
    // Checks that at least one food item has been selected.
    return inputElement.value === 'true';
}

function prevButtonClickHandler(e) {
    /* This event handler ensures that when a previous button is clicked, the current section is hidden and the previous
    one is displayed */
    const formSection = e.target.closest('.form-section');
    formSection.classList.add('invisible');

    const allFormSections = document.querySelectorAll('.form-section');

    let i = allFormSections.length;
    let seenCurrentSection = false;
    while (i >= 0) {
        if (allFormSections[i] === formSection) {
            seenCurrentSection = true;
            i--;
            continue;
        } 
        
        if (seenCurrentSection) {
            if (allFormSections[i].id === 'inserted-partner-child-friends') {
                if (!allFormSections[i].querySelector('section')) { //checking if no partner, child or friend sections have been dynamically added.
                    i--;
                    continue;
                }
            }
            allFormSections[i].classList.remove('invisible');
            break;
        }
        i--;
    }

}

function setFormProgressValues(formProgressAsDecimal) {
    // Dynamically update the form progress bar based on the user's progress through the form.

    const allProgressElements = document.querySelectorAll('.form-section progress');
    const MAX_PROGRESS = allProgressElements[0].max;
    const CURRENT_PROGRESS = allProgressElements[0].value;
    
    const currentSectionProgress = formProgressAsDecimal * MAX_PROGRESS;

    const newCurrentProgress = Math.max(CURRENT_PROGRESS, currentSectionProgress);
    
    for (let i = 0; i < allProgressElements.length; i++) {
        allProgressElements[i].value =  newCurrentProgress;
    }
}


function setFormSectionNumbers() {
    // Dynamically number the sections of the form.
    const allFormSections = document.querySelectorAll('.form-section');
    let sectionCount = allFormSections.length;

    let index = 0;
    while (index < sectionCount) {
        const targetedElement = allFormSections[index].querySelector('.section-number > span');
        targetedElement.textContent =  `${index+1}/${sectionCount}`;
        index += 1;   
    }
}

function createFoodSelectionCheckboxes() {
    // Dynamically create and insert into the document tree an input with type 'checkbox' for each food item.
    const allFoodItems = document.querySelectorAll('.menu-item');

    for (let i = 0; i < allFoodItems.length; i++) {
        inputContainer = document.createElement('div');
        let foodName = allFoodItems[i].querySelector('div').textContent;
        //Format the string appropriately so that there are no whitespace characters
        foodName = foodName.toLowerCase().replace(/\s/g, '-'); 

        inputContainer.innerHTML += `<label for="order-${foodName}"></label>`;
        inputContainer.innerHTML += `<input type="checkbox" id="order-${foodName}" name="order-${foodName}">`; 
    
        allFoodItems[i].querySelector('div:nth-child(2)').after(inputContainer);
    }
}

function toggleQuantityInput(e) {
    // Toggle the creation or deletion of an input with type 'number' for a given food item when it is selected.
    if (!(e.target.type === 'checkbox')) {
        return;
    }
    const menuContainer = e.target.closest('.menu-item');
    const quantityContainer = menuContainer.querySelector('.quantity-container');

    if (quantityContainer) {
        quantityContainer.remove();
    } else {
        /* Call the createQuantityInput function and dynamically insert the returned node
        into the document tree */
        menuContainer.appendChild(createQuantityInput(menuContainer));
    }
    // Call the below function to update the total cost of the order
    updateTotal();
}

const createQuantityInput = (targetContainer) => {
    // This function creates an input with type 'number' for a given food item
    let quantityContainer = document.createElement('div');
    quantityContainer.classList.add('dynamic', 'quantity-container', 'std-label-input');
    
    const containedInputId = targetContainer.querySelector('input[type=checkbox]').id;

    quantityContainer.innerHTML = `<label for="quantity-${containedInputId}">Quantity</label>`
    quantityContainer.innerHTML += `<input type="number" id="quantity-${containedInputId}" 
    class="dynamic quantity" name="quantity-${containedInputId}" min="1" max="10" step="1" value="1" >`;

    // Return the created node
    return quantityContainer;
}

function updateTotal() {
    // This function determines the total cost of the order
    let currentTotal = 0;

    const quantityInputs = [...document.querySelectorAll('.quantity')];
    quantityInputs.forEach((numInput) => {
        itemTotal = 0

        itemTotal = getItemTotal(numInput.closest('.menu-item'));

        currentTotal += itemTotal;
    })
    currentTotal = currentTotal.toFixed(2);

    insertTotal(currentTotal);
    return currentTotal;
}

function insertTotal(stringTotal) {
    // This function dynamically inserts the total order cost into the document tree
    const priceContainer = document.querySelector('.price');
    priceContainer.textContent = `$${stringTotal}`;
}

function getItemTotal(menuItem) {
    // This function determines, for a given quantity of a menu item, the item's total cost
    unitPriceContainer = menuItem.querySelector('div:nth-child(2)')
    stringUnitPrice = unitPriceContainer.textContent;
    intUnitPrice = stringPriceToNumber(stringUnitPrice);

    quantity = menuItem.querySelector('.quantity').value;

    itemTotal = intUnitPrice * quantity;
    return itemTotal;
}

function stringPriceToNumber(stringPrice) {
    // Remove any character that is not a digit or a period.
    return stringPrice.replace(/[^\d\.]/g, '');
}

function quantityChange(e) {
    /*This function is an event handler for whenever there is a change to an input with type 'number'
    that represents the quantity of a food item to be ordered. The function calls the updateTotal function
    to dynamically update the order total after the quantity change. */
    if (!(e.target.className.includes('quantity'))) {
        return;
    }
    updateTotal();
}

function createOrderSummary() {
    /* This function creates the order summary, which enables the user to check
    that their order is correct. */
    deletePriorSummary();

    /* Call getOrderSummaries to create an order summary object and then insert it into the document
    tree with the insertOrderSummaries function. */
    const orderSummaries = getOrderSummaries();
    insertOrderSummaries(orderSummaries);

    updateSummaryTotal();
}

function deletePriorSummary() {
    /* This function deletes any prior summary item nodes, which is necessary if the user began an order and did
    not submit it */
    const priorSummaryItems = document.querySelectorAll('.order-summary-item');
    for (let i = 0; i < priorSummaryItems.length; i++) {
        priorSummaryItems[i].remove();
    }

    const summaryTotal = document.querySelector('.summary-total')
    // If a summary total exists from a prior order, remove it from the document tree
    summaryTotal ? summaryTotal.remove() : null;
}

function updateSummaryTotal() {
    const totalContainer = document.querySelector('.summary-total-container');

    const existingSummaryTotal = document.querySelector('.summary-total');
    //If a summary total already exists, remove it from the DOM to avoid multiple summary totals
    if (existingSummaryTotal) {
        existingSummaryTotal.remove();
    }
    
    currentTotal = updateTotal();
    const summaryTotalComponent = createSummaryTotalComponent(currentTotal);
    totalContainer.appendChild(summaryTotalComponent);
}

function getOrderSummaries() {
    // This function creates and returns an array that contains objects, each of which represents an item summary
    orders = [];
    const allFoodInputs = document.querySelectorAll('.menu-item input[type=checkbox]');

    for (let i = 0; i < allFoodInputs.length; i++) {
        if (allFoodInputs[i].checked) {
            //Call getItemSummary to create an object that summaries an item in the order
            itemSummary = getItemSummary(allFoodInputs[i].closest('.menu-item'), i);
            orders.push(itemSummary);
        }
    }
    return orders;
}

function insertOrderSummaries(orderSummaries) {
    // This function inserts order summary components into the document tree
    orderSummaries.forEach((orderObj) => {
        const itemComponent = createItemComponent(orderObj);
        insertItemComponent(itemComponent);
    });
}

function getItemSummary(menuItemContainer, index) {
    /* This function creates and returns an object that represents an item order summary.
    Information such as the item's index, name, quantity and total price given the quantity
    is included in the object. */
    let name = menuItemContainer.querySelector('div:first-child').textContent;

    const quantity = menuItemContainer.querySelector('input[type=number]').value;

    let itemTotal = getItemTotal(menuItemContainer);
    itemTotal = "$" + itemTotal.toFixed(2);

    itemSummary = {
        index: index,
        name: name,
        quantity: quantity,
        totalPrice: itemTotal,
    }
    // Return the created object
    return itemSummary;
}

function createItemComponent(orderObj) {
    // Create and return a UI component that can be inserted into the document tree that summarises an item in the order
    let itemContainer = document.createElement('div');
    itemContainer.classList.add('order-summary-item');
    itemContainer.innerHTML =
        `<div>${orderObj.name}</div>
        <div>${orderObj.quantity}</div>
        <div>${orderObj.totalPrice}</div>
        `;
    
    return itemContainer;
}

function insertItemComponent(itemComponent) {
    // This function inserts an element representing an item in the order into the document tree
    const insertContainer = document.querySelector('.order-summary-container');
    insertContainer.appendChild(itemComponent);
    return;
}

function createSummaryTotalComponent(totalString) {
    // This function creates a node representing the total cost of an order
    let itemContainer = document.createElement('div');
    itemContainer.className = 'summary-total';

    itemContainer.innerHTML = `
    <div>Total: </div>
    <div>$${totalString}</div>`
    return itemContainer;
}

function manageLocalStorage() {
    /* This function checks if the localStorage object of the Web Storage API
    is available. If the object is not available or a prior order does not exist, the node that contains a radio option
    enabling the user to restore from a prior order using the localStorage object is hidden.
    */
    if (!isLocalStorageAvailable || !localStorage.getItem('lastOrder')) {
       document.querySelector('.load-prev-container').classList.add('hidden');    
    } 
    return;
}

function isLocalStorageAvailable() {
    /* This function returns a boolean value corresponding to whether or not the localStorage object
    of the Web Storage API is available. 
    */
    try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        console.log("localStorage available");
    } catch (e) {
        // The object is not available
        return false;
    }
    // The object is available
    return true;
}

function storeOrder() {

    if (!isLocalStorageAvailable) {
        // If the localStorage object is not available, do not attempt to store the order
        return;
    }
    // Clear the last order
    localStorage.clear();

    /*Call the getOrderSummaries function to create an array of item summary objects, which can then be
    converted into a string using the JSON.stringify() method that is stored in the localStorage object with
    the key of 'lastOrder'.*/
    const orderSummaries = getOrderSummaries();
    lastOrder = JSON.stringify(orderSummaries);
    localStorage.setItem('lastOrder', lastOrder);
}

function getLastOrder() {
    /* Get the user's previous order. By the time that this function is called. it has already been
        established that the localStorage object is available and that a previous order has been stored in it.
        
        There is therefore no need to check once again that the localStorage object is available.
        
        This function returns an object representing the user's previous order.*/
    let lastOrder = localStorage.getItem('lastOrder');
    let obj = JSON.parse(lastOrder);
    return obj;
}

function restoreLastOrder() {
    /*This function updates UI elements in the takeaway form based on the user's last order, which includes
    checking inputs of type checkbox if a user selected a paticular item in their previous order and updating
    the corresponding quantity input. */
    const lastOrder = getLastOrder();
    const allFoodInputs = document.querySelectorAll('.menu-item input[type=checkbox]');

    for (let i = 0; i < lastOrder.length; i++) {
        index = lastOrder[i].index;

        const correspondingInput = allFoodInputs[index];

        correspondingInput.checked = true;
        /* Fire the checked event to create the required quantity box. Need to do this because
        a change event is not fired if JavaScript is used to change the checkbox's checked property.

        The following MDN doc was used as a guide for dispatching the event:
        https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
        */
        const event = new Event("change");
        correspondingInput.dispatchEvent(event);
        // Update the quantity input's value based on the user's previous order
        correspondingInput.closest('.menu-item').querySelector('.quantity').value = lastOrder[i].quantity;
    }
    // Dynamically update the total cost of the order after the previous order's selections have been restored
    updateTotal();
}

function notLoadPrevOrder() {
    /*This function is called if the user selects the radio input that enables them not to load their
    previous order. This function essentially reverses the actions of the the radio input that restores
    a previous order, in case the user changes their mind.*/
    const allFoodCheckboxes = [...document.querySelectorAll('.menu-item input[type=checkbox]')];

    allFoodCheckboxes.forEach((foodCheckbox) => {
        if (foodCheckbox.checked) {
            foodCheckbox.checked = false;
            const event = new Event("change");
            foodCheckbox.dispatchEvent(event);
        }
        });
}

function triggerCheckEvent(e) {
    /* This function toggles an input of type checkbox's checked attribute and dispatches a change event to enable 
    a corresponding quantity input to be shown if the checkbox is checked by the function or removed from the document tree 
    if the checkbox is unchecked. */
    if (e.target.nodeName === 'INPUT') {
        return;
    }
    const targetCheckbox = this.querySelector('input[type=checkbox]');

    targetCheckbox.checked = !targetCheckbox.checked;
    const changeEvent = new Event('change');
    targetCheckbox.dispatchEvent(changeEvent);
}

/* The main() function commences the execution of all code contained within this .js file. Per best
practice, the use of global variables has been minimised. */
function main() {

    // Add next button event listeners that validate input and only allow user to proceed if all tests passed
    const nextButtonContainers = document.querySelectorAll('.form-section');
    for (let i = 0; i < nextButtonContainers.length; i++) {
        nextButtonContainers[i].addEventListener('click', nextButtonEventHandler);
    }

    //Hide all form sections by default except the first
    const sectionsToHide = document.querySelectorAll('.form-section:not(.section-1)');
    for (let i = 0; i < sectionsToHide.length; i++) {
        sectionsToHide[i].classList.add('invisible');
    }

    //Add an event listener to all back buttons that hides the current section and dislays the previous one.
    const prevButtons = document.querySelectorAll('button.prev');
    for (let i=0; i < prevButtons.length; i++) {
        prevButtons[i].addEventListener('click', prevButtonClickHandler)
    }

    // Dynamically number each section of the form.
    setFormSectionNumbers();

    // Interactivity required for the takeaway menu
    const ulsToHide = [...document.querySelectorAll('.takeaway-section > h3 + ul')];
    ulsToHide.forEach((ulNode) => {
        ulNode.classList.add('hidden');
    })

    const dishTypeHeadings = [...document.querySelectorAll('.takeaway-section > h3 ')];
    dishTypeHeadings.forEach((heading) => {
        heading.addEventListener('click', (e) => {
            const adjacentUl = e.target.nextElementSibling;
            adjacentUl.classList.toggle('hidden');
        });
    });

    createFoodSelectionCheckboxes();

    //Add event listener to takeaway form to dynamically create inputs for quantities (event delegation)
    const takeawayForm = document.querySelector('.takeaway-section');
    takeawayForm.addEventListener('change', toggleQuantityInput, true);
    takeawayForm.addEventListener('change', quantityChange, true);
    
    /*Make entire li elements clickable to improve accessibility. This will enable users to toggle
    checkbox inputs without needing to click specifically on the checkbox. */
    [...document.querySelectorAll('.menu-item')].forEach((menuItem) => {
        menuItem.addEventListener('click', triggerCheckEvent);
    })

    //Use the Storage API to store and retrieve the most recent previous order if it is available
    manageLocalStorage();
    document.getElementById('load-prev-order-yes').addEventListener('change', (e) => {
        if (isLocalStorageAvailable && e.target.checked) {
            restoreLastOrder();
        }
    });

    document.getElementById('load-prev-order-no').addEventListener('change', notLoadPrevOrder);

    /*When a submit event is fired, add an anonymous event listener that calls storeOrder() to store
    the user's order if the localStorage object is available. */
    document.querySelector('.takeaway-form').addEventListener('submit', () => {
        if (isLocalStorageAvailable) {
            storeOrder();
        }
    });


}