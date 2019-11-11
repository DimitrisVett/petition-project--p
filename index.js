///////////////////////////requirements////////////////////////////
const express = require("express");
const app = express();
const db = require("./utils/db");
const hb = require("express-handlebars");
var cookieSession = require("cookie-session");
// const { hash, compare } = require("./utils/db");
// const csurf = require("csurf");
/////////////////////////handlebars-middlewares////////////////////
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(
    express.urlencoded({
        extended: false
    })
);
//////////////////////////cookies?////////////////////////////////
app.use(
    cookieSession({
        secret: `no sure what is that`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 41
    })
);

////////////////////////////csurf/////////////////////////////////////////
// app.use(csurf());
//
// app.use(function(req, res, next) {
//     res.setHeader("x-frame-options", "DENY");
//     res.locals.csrfToken = req.csrfToken();
//     // it will add it to every single route with a form
//     // res.locals.firstName = req.session.firstName;
//     next();
// });
/////////////////////////////routes - req-res///////////////////////////////////
app.get("/petition", (req, res) => {
    if (req.session.signID) {
        res.redirect("/thnxPage");
    } else {
        res.render("petition", {
            layout: "main"
        });
    }
});

app.post("/petition", (req, res) => {
    // console.log("post came?");

    if (req.body.first && req.body.last && req.body.hiddenInput) {
        let firstName = req.body.first;
        let lastname = req.body.last;
        let signature = req.body.hiddenInput;

        db.addSignature(firstName, lastname, signature)
            .then(({ rows }) => {
                req.session.signID = rows[0].id;
                res.redirect("/thnxPage");
            })
            .catch(err => {
                console.log("error in post req", err);
            });
    } else {
        res.render("petition", {
            layout: "main",
            error: "WRITE SOMTHNG GALL"
        });
    }
});

app.get("/thnxPage", (req, res) => {
    db.getCountSign()
        .then(({ rows }) => {
            let counted = rows[0].count;
            db.getSignature(req.session.signID)
                .then(({ rows }) => {
                    res.render("thnxPage", {
                        layout: "main",
                        count: counted,
                        imgUrl: rows[0].signature
                    });
                })
                .catch();
        })
        .catch(err => {
            console.log("error in thnxPage", err);
        });
});
app.get("/signers", (req, res) => {
    db.getNames()
        .then(({ rows }) => {
            res.render("signers", {
                layout: "main",
                names: rows
            });
        })
        .catch(err => console.log(err));
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});
// app.post("/register", (req, res) => {});

//hash(psw).then.catch
app.listen(8080, () => console.log("despair"));
