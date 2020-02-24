///////////////////////////requirements////////////////////////////
const express = require("express");
const app = express();
const db = require("./utils/db");
const hb = require("express-handlebars");
var cookieSession = require("cookie-session");
const { hash, compare } = require("./utils/bs");
const csurf = require("csurf");
/////////////////////////handlebars-middlewares////////////////////
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("public"));
app.use(
    express.urlencoded({
        extended: false
    })
);
//////////////////////////cookies////////////////////////////////
app.use(
    cookieSession({
        secret: `no sure what is that`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 41
    })
);

////////////////////////////csurf/////////////////////////////////////////
app.use(csurf());

app.use(function(req, res, next) {
    res.setHeader("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();

    next();
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////routes - req-res///////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

app.get("/petition", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/login");
    } else if (req.session.signId) {
        res.redirect("/thnxPage");
    } else {
        res.render("petition", {
            layout: "main",
            csrfToken: req.csrfToken()
        });
    }
});

app.post("/petition", (req, res) => {
    if (req.body.signature != "") {
        db.addSigners(req.body.signature, req.session.userId)
            .then(results => {
                req.session.signId = results.rows[0].id;

                res.redirect("/thnxPage");
            })
            .catch(e => {
                console.log("err in addSigners", e);
                res.render("petition", {
                    layout: "main",
                    csrfToken: req.csrfToken(),
                    error:
                        "Please check if you added all the required informations."
                });
            });
    } else {
        res.render("petition", {
            layout: "main",
            csrfToken: req.csrfToken(),
            error: "YOU MUST SIGN!"
        });
    }
});

app.get("/thnxPage", (req, res) => {
    db.getCountSign()
        .then(({ rows }) => {
            // req.session.signId = rows[0].id;

            let counted = rows[0].count;
            db.getSignature(req.session.userId)
                .then(({ rows }) => {
                    res.render("thnxPage", {
                        layout: "main",
                        count: counted,
                        csrfToken: req.csrfToken(),
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
    db.getSigners()
        .then(({ rows }) => {
            res.render("signers", {
                layout: "main",
                csrfToken: req.csrfToken(),
                users: rows
            });
        })
        .catch(err => console.log(err));
});

app.get("/signers/:city", (req, res) => {
    const { city } = req.params;
    db.getCity(city)
        .then(({ rows }) => {
            res.render("signers", {
                layout: "main",
                usersCity: rows,
                csrfToken: req.csrfToken(),
                on: true
            });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/profile", (req, res) => {
    if (req.session.userId) {
        res.render("profile", {
            layout: "main",
            csrfToken: req.csrfToken()
        });
    } else {
        res.redirect("/register");
    }
});

app.post("/profile", (req, res) => {
    if (
        !req.body.urlField.startsWith("http://") &&
        !req.body.urlField.startsWith("https://") &&
        req.body.urlField != ""
    ) {
        req.body.urlField = "https://" + req.body.urlField;
    }
    if (req.body.age || req.body.city || req.body.urlField) {
        db.addProfile(
            req.body.age,
            req.body.city,
            req.body.urlField,
            req.session.userId
        ).catch(err => {
            console.log(err);
        });
    }

    res.redirect("/petition");
});

app.get("/editProfile", (req, res) => {
    db.getAllInfo(req.session.userId)
        .then(({ rows }) => {
            res.render("editProfile", {
                layout: "main",
                csrfToken: req.csrfToken(),
                infos: rows
            });
        })
        .catch();
    // res.render("editProfile", {
    //     layout: "main"
    // });
});

app.post("/editProfile", (req, res) => {
    db.updateUserProfile(
        req.session.userId,
        req.body.age,
        req.body.city,
        req.body.urlField
    ).then(() => {
        console.log("updated profile");
    });
    if (req.body.password != "") {
        hash(req.body.password)
            .then(hashedPassword => {
                db.updateInfoWithPass(
                    req.body.first,
                    req.body.last,
                    hashedPassword,
                    req.body.email,
                    req.session.userId
                )
                    .then(() => {
                        console.log("update profile works");
                        res.redirect("/editProfile");
                    })
                    .catch(err => {
                        console.log(err);
                        res.render("editProfile", {
                            layout: "main",
                            message:
                                "Please enter all the required informations",
                            csrfToken: req.csrfToken()
                        });
                    });
            })
            .catch(err => {
                console.log(err);
                res.render("editProfile", {
                    layout: "main",
                    message: "Please enter all the required informations",
                    csrfToken: req.csrfToken()
                });
            });
    } else {
        console.log("post edit without password");
        db.updateInfoNoPass(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.userId
        )
            .then(() => {
                console.log("update profile works");
                res.redirect("/editProfile");
            })
            .catch(err => {
                console.log(err);
            });
    }
});
////////////////////////////////////////////////////////////////////////////
//////////////////////////login - register ////////////////////////////////
////////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
        csrfToken: req.csrfToken()
    });
});

app.post("/register", (req, res) => {
    console.log("register post here");
    let firstName = req.body.first;
    let lastname = req.body.last;
    let email = req.body.email;
    let pass = req.body.password;

    hash(pass)
        .then(hashedPass => {
            db.addUser(firstName, lastname, email, hashedPass)
                .then(({ rows }) => {
                    if (req.session.signId) {
                        req.session.signId = null;
                    }
                    req.session.userId = rows[0].id;
                    res.redirect("/profile");
                })
                .catch(() => {
                    res.render("register", {
                        layout: "main",
                        csrfToken: req.csrfToken(),
                        message:
                            "Please check if you added all the required informations."
                    });
                });
        })
        .catch(err => {
            res.render("register", {
                layout: "main",
                csrfToken: req.csrfToken(),
                message:
                    "Please check if you added all the required informations."
            });
            console.log(err);
        });
});

app.get("/login", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main",
            csrfToken: req.csrfToken()
        });
    }
});

app.post("/login", (req, res) => {
    let pass = req.body.password;

    db.getUser(req.body.email)
        .then(({ rows }) => {
            compare(pass, rows[0].password)
                .then(val => {
                    if (val) {
                        req.session.userId = rows[0].id;
                        db.getSignature(req.session.userId).then(({ rows }) => {
                            if (rows.length > 0) {
                                req.session.signId = rows[0].id;
                                res.redirect("/thnxPage");
                            } else {
                                res.redirect("/petition");
                            }
                        });
                    } else {
                        res.render("login", {
                            layout: "main",
                            csrfToken: req.csrfToken(),
                            message:
                                "Please check if your Email or Password is correct."
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log("email or password is wrong", err);
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

app.post("/delete", (req, res) => {
    db.deleteSign(req.session.userId)
        .then(() => {
            req.session.signId = null;
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("err in delete");
            console.log(err);
        });
});
app.listen(process.env.PORT || 8080, () => console.log("whyyy"));
