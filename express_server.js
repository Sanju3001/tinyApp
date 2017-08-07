
// Install packages
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bcrypt = require('bcrypt');

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");

// Users Object with test users
var users = {
  "randomID1": {
    id: "randomID1",
    email: "saj@example.com",
    password: "saj"
  },
 "randomID2": {
    id: "randomID2",
    email: "penny@example.com",
    password: "penny"
  }
};

// URL Database Object with test links
var urlDatabase = {
  "b2xVn2": {
  longURL: "http://www.lighthouselabs.ca",
  userID: "randomID1"
},
  "9sm5xK": {
  longURL: "http://www.google.com",
  userID: "randomID2"
  }
};

// Generate ShortURL function
function generateRandomString() {

  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  //console.log(text);
  return text;

}

// Filter URLs for a given user function
function urlsForUser(id) {

  let userLinks = {};

  for (var links in urlDatabase) {

    if (urlDatabase[links].userID === id) {

      userLinks[links] = urlDatabase[links];

    }

  }

  return userLinks;

}


// GET METHODS

// Root welcome message
app.get("/", (req, res) => {

  res.end("Hello, welcome to the tinyApp!");

});

/* this was a test
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
*/

// Get login page
app.get("/login", (req, res) => {

  let templateVars = {
    username: req.session.user_id,
    urls: urlDatabase,
  };

  res.render("login", templateVars);

});

// Get register page
app.get("/register", (req, res) => {

  let templateVars = {
    username: req.session.user_id
  };

  res.render("register", templateVars);

});

// Get the URLs in current user's database
app.get("/urls", (req, res) => {

  if(req.session.user_id) {

    let myLinks = urlsForUser(req.session.user_id);

    let templateVars = {
      username: req.session.user_id,
      urls: myLinks
    };

    res.render("urls_index", templateVars);

  }

  else {

    res.redirect("/register");

    }

});

// Get the add new URLs page
app.get("/urls/new", (req, res) => {

  if (!(req.session.user_id)) {
    res.redirect("/login");
    return;
  }

  else {

    let myLinks = urlsForUser(req.session.user_id);

    let templateVars = {
      username: req.session.user_id,
      urls: myLinks
    };

    res.render("urls_new", templateVars);

  }

});

// Get the URL for a given short URL (will display all URLs in user's database)
app.get("/urls/:id", (req, res) => {

  if (!(req.session.user_id)) {
    res.redirect("/login");
    return;
  }

  // check to see if link is valid
  if (!urlDatabase[req.params.id]) {

    res.redirect('/urls');
    return;

  }

  else {

    let myLinks = urlsForUser(req.session.user_id);
    let shortURL = req.params.id;

    let templateVars = {
      username: req.session.user_id,
      shortURL: shortURL,
      urls: myLinks
    };

    res.render("urls_show", templateVars);

  }

});

// Get JSON data
app.get("/urls.json", (req, res) => {

  res.json(urlDatabase);

});

// Get shortURL and redirect to longURL (actual web page in "http://www.somesite.com" format required)
app.get("/u/:shortURL", (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {

    res.status(400).send('Not a valid URL!');
    return;

  }

  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);

});

// Get Update URLs page
app.get("/urls/:id/update", (req, res) => {

  if (!(req.session.user_id)) {

    res.redirect("/login");
    return;

  }

  else {

    let myLinks = urlsForUser(req.session.user_id);

    let templateVars = {
      username: req.session.user_id,
      urls: myLinks
    };

    res.render("urls_show", templateVars);

  }

});


//POST METHODS

// Post to URLs page
app.post("/urls", (req, res) => {

  let shortURL = generateRandomString();
  let longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.user_id
  };

  res.redirect("/urls");

  });

// Post to new URLs page
app.post("/urls/new", (req, res) => {

  if (!(req.session.user_id)) {

    res.redirect("/login");
    return;

  }

  else {

    let myLinks = urlsForUser(req.session.user_id);
    let newLink = req.body.longURL;

    let templateVars = {
      username: req.session.user_id,
      urls: myLinks
    };

    res.redirect("/urls");

  }

});

// Post to a given short URL
app.post("/urls/:id/", (req, res) => {

  if (!(req.session.user_id)) {

    res.redirect("/login");
    return;

  }

  else {

    delete urlDatabase[req.params.id];

    res.redirect("/urls");

  }

});

// Post to update URLs page
app.post("/urls/:id/update", (req, res) => {

  if (!(req.session.user_id)) {

    res.redirect("/login");
    return;

  }

  else {

    urlDatabase[req.params.id].longURL = req.body.updatedURL;

    res.redirect("/urls");

  }

});

// Post to login page
app.post("/login", (req, res) => {

  //let randomUser = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  //let hashed_password = bcrypt.hashSync(password, 10);

  for (var key in users) {

    if (users[key].email == email)  {

      if (bcrypt.compareSync(req.body.password, users[key].password)) {

      req.session.user_id = users[key].email;
      //res.cookie('user_id', key);
      res.redirect("/urls");
      return;

      }

    }

  }

  res.status(403).send('Status 403: The emails and passwords do not match!');

});

// Post to logout page and clear cookies
app.post("/logout", (req, res) => {

  req.session = null;

  res.redirect("/login");

});

// Post to register page
app.post("/register", (req, res) => {

  let randomUser = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;

  if ((!email) || (!password)) {

    res.status(400).send('Status 400: Please enter a valid username and password!');
    return;

  } else {

    for (var key in users) {

      if (users[key]["email"] === email) {

        res.status(400).send('Status 400: That email already exists!');
        return;

      }

    }

  }

    let hashed_password = bcrypt.hashSync(password, 10);

    users[randomUser] = {
      id: randomUser,
      email: email,
      password: hashed_password
    };

    res.redirect("/login");

});


// Listen on Port when application launched
app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});


