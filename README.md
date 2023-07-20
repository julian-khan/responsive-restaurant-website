# Responsive Restaurant Website


Live website:
https://julian-khan.github.io/responsive-restaurant-website/

In this project, I designed and created the front end of a restaurant website. Before creating the website, I analysed the requirements of the restaurant and users' needs by constructing user stories. I then used this information to inform the structuring of the website and its features.

HTML5 was used for the semantic markup of each webpage, which is its intended purpose per the HTML Living Standard. CSS3 rules were used in separate CSS files to style each page. Global selectors that apply styling to all pages are contained in the styles.css file. Selectors for specific webpages are contained in separate .css files in the style folder of this project. The separation of the website's structuring through HTML and styling via CSS provides a separation of concerns, which makes debugging and maintaining the website, as well as adding new features, an easier process.

JavaScript was used to add interactivity to the website when needed to implement features. Each .js script file is contained within the scripts folder of this project. For instance, the menu-page.js script provides interactivity to the food menu on the website's menu page. This enables the user to hide and display menu components with a simple click or tap. The table-booking.js script enables users to request bookings. 

The takeaway-order.js script makes it possible for users to make an order and validates that at least one item has been ordered. This script also checks if the Web Storage API's storage object is available and saves the most recent order if the object is available. The user is provided with an option to auto-fill their most recent order if one exists.

Note that this was only a front-end project so the data to be submitted by the booking and order forms are not sent to a server. The booking request and takeaway order forms contain client-side input validation, which was achieved through JavaScript regular expressions.

This website conforms to accessibility guidelines and is highly responsive on all viewport sizes including mobile devices, tablets and desktop monitors.

If I were to repeat this project or modify its design, I would encapsulate the data used in the .js script files into classes. This would provide the benefits of object-oriented design and object-oriented programming such as encapsulation, inheritance and polymorphism. I would also add a back end using a technology such as Firebase to receive and process booking requests and online orders.

Although this project can be improved, it demonstrates the application of what I have learned in my Master of Information Technology degree to date and the independent learning that I have undertaken by completing The Odin Project and reading the Mozilla MDN documentation.

Please let me know if you have any feedback - I would appreciate input on how I can improve my software engineering skills.

Yours faithfully

Julian