//`use strict`;

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

function generateRandomString() {

  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  //console.log(text);
  return text;

}

function urlsForUser(id) {

  let userLinks = {};

  for (var links in urlDatabase) {

    if (urlDatabase[links].userID === id) {

      userLinks[links] = urlDatabase[links];

    }

  }

  return userLinks;

}

//console.log(urlsForUser("b2xVn2"));


app.get("/", (req, res) => {
  res.end("Hello!");
});

/*
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
*/


app.get("/login", (req, res) => {

  let templateVars = {
    username: req.session.user_id,
    urls: urlDatabase
  };
  res.render("login", templateVars);

});

app.get("/register", (req, res) => {

  let templateVars = {
    username: req.session.user_id
  };
  res.render("register", templateVars);

});

app.get("/urls", (req, res) => {

  if(req.session.user_id) {

  let myLinks = urlsForUser(req.session.user_id);

  let templateVars = {
    username: req.session.user_id,
    urls: myLinks
  };

    res.render("urls_new", templateVars);
  }

  else {

    let templateVars = {
      username: "",
      urls: urlDatabase
    };
    res.redirect("/register");
  }

});

app.get("/urls/new", (req, res) => {

  let myLinks = urlsForUser(req.session.user_id);

  if (!(req.session.user_id)) {
    res.redirect("/login");
    return;
  }

  else {

    let templateVars = {
      username: req.session.user_id,
      urls: myLinks
    };

    res.render("urls_new", templateVars);

  }

});

app.get("/urls/:id", (req, res) => {

  let myLinks = urlsForUser(req.session.user_id);
  let shortURL = req.params.id;


  if (!(req.session.user_id)) {
    res.redirect("/login");
    return;
  }

  else {

    let templateVars = {
      username: req.session.user_id,
      shortURL: shortURL,
      urls: myLinks
    };

    res.render("urls_show", templateVars);

  }

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id/update", (req, res) => {

  let myLinks = urlsForUser(req.session.user_id);

  if (!(req.session.user_id)) {
    res.redirect("/login");
    return;
  }

  else {

    let templateVars = {
      username: req.session.user_id,
      urls: myLinks
    };

    res.render("urls_index", templateVars);

  }

/*  let templateVars = {
  username: req.cookies[users["id"]],
  shortURL: req.params.id,
  longURL: urlDatabase[req.params.body]
   };
*/


});




app.post("/urls", (req, res) => {

  // debug statements to see POST parameters
  //sconsole.log(req.body);
  //console.log(shortURL);
  //console.log(longURL);
  //console.log(urlDatabase);

  let shortURL = generateRandomString();
  let longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.user_id
  };

  res.redirect("/urls");
  //res.redirect("/urls/" + shortURL); // Redirect

  });


app.post("/urls/new", (req, res) => {

  let myLinks = urlsForUser(req.session.user_id);

  let newLink = req.body.longURL;



  if (!(req.session.user_id)) {
    res.redirect("/login");
    return;
  }

  else {

    let templateVars = {
      username: req.session.user_id,
      urls: myLinks
    };

    //templateVars.urls[longURL] = req.body.longURL;

    res.redirect("/urls");

  }






});


app.post("/urls/:id/delete", (req, res) => {

  let templateVars = {
    username: req.cookies[users["id"]],
    urls: urlDatabase
  };

  if (!(templateVars.username)) {
    res.redirect("/login");
    return;
  }

  else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }

});

app.post("/urls/:id/update", (req, res) => {

  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");

});

/*
app.post("/urls/update", (req, res) => {

  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");

});
*/

app.post("/login", (req, res) => {

  //let randomUser = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  //let hashed_password = bcrypt.hashSync(password, 10);

  for (var key in users) {

    if (users[key].email == email)  {

      if (bcrypt.compareSync(req.body.password, users[key].password)) {

      req.session.user_id = key;
      //res.cookie('user_id', key);
      res.redirect("/urls");
      return;

      }

    }

  }

  res.status(403).send('Status 403: The emails and passwords do not match!');

});

app.post("/logout", (req, res) => {

  req.session = null;

  res.redirect("/login");

});

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

  //console.log(users);

  //req.session.user_id = randomUser;
  res.redirect("/login");

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


