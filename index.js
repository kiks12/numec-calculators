

const express = require("express");
const path = require("path");
const math = require("mathjs");

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");


// BISECTION METHOD 
app.get("/bisection", (req, res) => {
  const { f, unknown, xl, xr, iteration } = req.query;
  if (!(f && unknown && xl && xr && iteration)) return res.render("bisection", { table: undefined });

  const table = [];
  let xlvar = parseInt(xl);
  let xrvar = parseInt(xr);

  for (let i=0; i < iteration; i++) {
    const fxl = f.replaceAll(unknown, xlvar < 0 ? '(' + xlvar + ')' : xlvar);
    const fxr = f.replaceAll(unknown, xrvar < 0 ? '(' + xrvar + ')' : xrvar);
    const fxla = math.evaluate(fxl);
    const fxra = math.evaluate(fxr);
    const xm = (xlvar + xrvar) / 2;
    const fxm = f.replaceAll(unknown, xm < 0 ? '(' + xm + ')' : xm);
    const fxma = math.evaluate(fxm);

    table.push({
      xlvar,
      xrvar,
      fxla,
      fxra,
      xm,
      fxma,
    });

    if (fxma < 0) xrvar = xm;
    if (fxma > 0) xlvar = xm;
  }

  res.render("bisection", { table });
})



// FALSE POSITION METHOD
app.get("/false-position", (req, res) => {
  let XM_FORMULA = "((-(fxl)*(xl-xr))/(fxl-fxr)) + xl";
  const { f, unknown, xl, xr, iteration } = req.query;
  if (!(f && unknown && xl && xr && iteration)) return res.render("falsePosition", { table: undefined });

  const table = [];
  let xlvar = parseInt(xl);
  let xrvar = parseInt(xr);

  for (let i=0; i < iteration; i++) {
    const fxl = f.replaceAll(unknown, xlvar < 0 ? '(' + xlvar + ')' : xlvar);
    const fxr = f.replaceAll(unknown, xrvar < 0 ? '(' + xrvar + ')' : xrvar);
    const fxla = math.evaluate(fxl);
    const fxra = math.evaluate(fxr);
    const copy = XM_FORMULA;
    XM_FORMULA = XM_FORMULA.replaceAll("fxl", fxla < 0 ? '(' + fxla + ')' : fxla);
    XM_FORMULA = XM_FORMULA.replaceAll("fxr", fxra < 0 ? '(' + fxra + ')' : fxra);
    XM_FORMULA = XM_FORMULA.replaceAll("xl", xlvar < 0 ? '(' + xlvar + ')' : xlvar);
    XM_FORMULA = XM_FORMULA.replaceAll("xr", xrvar < 0 ? '(' + xrvar + ')' : xrvar);
    const xm = math.evaluate(XM_FORMULA);
    const fxm = f.replaceAll(unknown, xm < 0 ? '(' + xm + ')' : xm);

    const fxma = math.evaluate(fxm);

    table.push({
      xlvar,
      xrvar,
      fxla,
      fxra,
      xm,
      fxma,
    });

    if (fxma < 0) xrvar = xm;
    if (fxma > 0) xlvar = xm;
    XM_FORMULA = copy;
  }

  res.render("falsePosition", { table });
})



// SINGLE POINT METHOD
app.get("/single-point/", (req, res) => {
  const { f, unknown, xo, iteration } = req.query;
  if (!(f && unknown && xo && iteration)) return res.render("singlePoint", { table: undefined });

  const table = [];
  let xovar = parseInt(xo);

  for (let i=0; i<iteration; i++) {
    const fx = f.replaceAll(unknown, xovar < 0 ? '(' + xovar + ')' : xovar);
    const fxa = math.evaluate(fx);

    table.push({
      xovar,
      fxa,
    })

    xovar = fxa;
  }

  res.render("singlePoint", { table });
})



// FIXED PPINT METHOD
app.get("/fixed-point/", (req, res) => {
  res.render("fixedPoint", { table: undefined });
})



// SECANT METHOD
app.get("/secant/", (req, res) => {
  let XPLUSONE_FORMULA = "xb-(fxb*(xa-xb)/(fxa-fxb))";
  const { f, unknown, xa, xb, iteration } = req.query;
  if (!(f && unknown && xa && xb && iteration)) return res.render("secant", { table: undefined });

  const table = [];
  let xavar = parseInt(xa);
  let xbvar = parseInt(xb);

  for (let i=0; i<iteration; i++) {
    const fxa = f.replaceAll(unknown, xavar < 0 ? '(' + xavar + ')' : xavar);
    const fxaa = math.evaluate(fxa);
    const fxb = f.replaceAll(unknown, xbvar < 0 ? '(' + xbvar + ')' : xbvar);
    const fxba = math.evaluate(fxb);
    const copy = XPLUSONE_FORMULA;
    XPLUSONE_FORMULA = XPLUSONE_FORMULA.replaceAll("fxa", fxaa < 0 ? '(' + fxaa + ')' : fxaa);
    XPLUSONE_FORMULA = XPLUSONE_FORMULA.replaceAll("fxb", fxba < 0 ? '(' + fxba + ')' : fxba);
    XPLUSONE_FORMULA = XPLUSONE_FORMULA.replaceAll("xa", xavar < 0 ? '(' + xavar + ')' : xavar);
    XPLUSONE_FORMULA = XPLUSONE_FORMULA.replaceAll("xb", xbvar < 0 ? '(' + xbvar + ')' : xbvar);
    const xPlusOne = math.evaluate(XPLUSONE_FORMULA);
    const fxPlusOne = f.replaceAll(unknown, xPlusOne);
    const fxPlusOneA = math.evaluate(fxPlusOne);

    XPLUSONE_FORMULA = copy;

    table.push({
      xavar,
      xbvar,
      fxaa,
      fxba,
      xPlusOne,
      fxPlusOneA,
    });

    xavar = xbvar;
    xbvar = xPlusOne;
  }

  res.render("secant", { table });
})



// NEWTON-RAPHSON METHOD
app.get("/newton-raphson/", (req, res) => {
  const { f, unknown, xo, iteration } = req.query;
  if (!(f && unknown && xo && iteration)) return res.render("newtonRaphson", { table: undefined });

  const table = [];
  let xovar = parseInt(xo);

  for (let i=0; i<iteration; i++) {
    const fxo = f.replaceAll(unknown, xovar < 0 ? '(' + xovar + ')' : xovar);
    const fxoa = math.evaluate(fxo);
    const dfx = math.derivative(f, unknown).toString();
    const dfxo = dfx.replaceAll(unknown, xovar < 0 ? '(' + xovar + ')' : xovar);
    const dfxoa = math.evaluate(dfxo);
    const xn = xovar - (fxoa / dfxoa);
    const fxn = f.replaceAll(unknown, xn);
    const fxna = math.evaluate(fxn);

    table.push({
      xovar,
      fxoa, 
      dfxoa, 
      xn,
      fxna
    });

    xovar = xn;
  }

  res.render("newtonRaphson", { table });
})

app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, "index.html"));
  res.redirect("/bisection");
})



app.listen(PORT, () => console.log(`NUMERICAL METHOD CALCULATOR: Running at port ${PORT}`));

