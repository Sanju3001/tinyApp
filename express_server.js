//`use strict`;

var express = require("express");
const bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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



app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
  shortURL: req.params.id,
  longURL: urlDatabase[req.params.body]
   };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {

  // debug statements to see POST parameters
  //sconsole.log(req.body);
  //console.log(shortURL);
  //console.log(longURL);
  //console.log(urlDatabase);

  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect("/urls/" + shortURL); // Redirect

  });

app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];

  res.redirect("/urls");

});

app.post("/urls/:id/update", (req, res) => {

  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");

});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


