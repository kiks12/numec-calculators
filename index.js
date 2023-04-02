

const express = require("express");
const path = require("path");
const math = require("mathjs");
const fs = require("fs/promises");
const { spawnSync } = require("child_process");

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const clearFiles = async () => {
  await fs.writeFile('./left.csv', '');
  await fs.writeFile('./right.csv', '');
  await fs.writeFile('./xm.csv', '');
}

app.get("/bisection", async (req, res) => {
  const { f, unknown, xl, xr, iteration } = req.query;
  if (!(f && unknown && xl && xr && iteration)) return res.render("bisection", 
  { 
    table: undefined,
    active: "BISECTION"
  });

  clearFiles();

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
      fxl,
      fxr,
      fxla,
      fxra,
      xm,
      fxm,
      fxma,
    });

    if (i === 0) {
      await fs.appendFile('./left.csv', 'x,fx\n');
      await fs.appendFile('./right.csv', 'x,fx\n');
      await fs.appendFile('./xm.csv', 'x,fx\n');
    }

    await fs.appendFile("./left.csv", `${xlvar},${fxla}\n`);
    await fs.appendFile("./right.csv", `${xrvar},${fxra}\n`);
    await fs.appendFile("./xm.csv", `${xm},${fxma}\n`);

    if (fxma < 0) xrvar = xm;
    if (fxma > 0) xlvar = xm;
  }

  await spawnSync("./venv/bin/python3", ["index.py"]);
  res.render("bisection", { table, active: "BISECTION" });
})



// FALSE POSITION METHOD
app.get("/false-position", async (req, res) => {
  let XM_FORMULA = "((-(fxl)*(xl-xr))/(fxl-fxr)) + xl";
  const { f, unknown, xl, xr, iteration } = req.query;
  if (!(f && unknown && xl && xr && iteration)) return res.render("falsePosition",
    { 
      table: undefined,
      active: "FALSE_POSITION",
    });

  clearFiles();

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
      fxl,
      fxla,
      fxr,
      fxra,
      xm,
      fxm,
      fxma,
    });

    if (i === 0) {
      await fs.appendFile('./left.csv', 'x,fx\n');
      await fs.appendFile('./right.csv', 'x,fx\n');
      await fs.appendFile('./xm.csv', 'x,fx\n');
    }

    await fs.appendFile("./left.csv", `${xlvar},${fxla}\n`);
    await fs.appendFile("./right.csv", `${xrvar},${fxra}\n`);
    await fs.appendFile("./xm.csv", `${xm},${fxma}\n`);

    if (fxma < 0) xrvar = xm;
    if (fxma > 0) xlvar = xm;
    XM_FORMULA = copy;
  }

  await spawnSync("./venv/bin/python3", ["index.py"]);

  res.render("falsePosition", { table, active: "FALSE_POSITION" });
})



// SINGLE POINT METHOD
app.get("/single-point/", async (req, res) => {
  const { f, unknown, xo, iteration } = req.query;
  if (!(f && unknown && xo && iteration)) return res.render("singlePoint", 
    { 
      table: undefined,
      active: "SINGLE_POINT",
    });

  clearFiles();

  const table = [];
  let xovar = parseInt(xo);

  for (let i=0; i<iteration; i++) {
    const fx = f.replaceAll(unknown, xovar < 0 ? '(' + xovar + ')' : xovar);
    const fxa = math.evaluate(fx);

    table.push({
      xovar,
      fx,
      fxa,
    })

    if (i === 0) {
      await fs.appendFile('./left.csv', 'x,fx\n');
      await fs.appendFile('./right.csv', 'x,fx\n');
      await fs.appendFile('./xm.csv', 'x,fx\n');
    }

    await fs.appendFile("./left.csv", `${xovar},${fxa}\n`);
    // await fs.appendFile("./right.csv", `${xrvar},${fxra}\n`);

    xovar = fxa;
  }

  await spawnSync("./venv/bin/python3", ["index.py"]);
  res.render("singlePoint", { table, active: "SINGLE_POINT" });
})



// FIXED PPINT METHOD
app.get("/fixed-point/", (req, res) => {
  res.render("fixedPoint", { table: undefined, active: "FIXED_POINT" });
})



// SECANT METHOD
app.get("/secant/", async (req, res) => {
  let XPLUSONE_FORMULA = "xb-(fxb*(xa-xb)/(fxa-fxb))";
  const { f, unknown, xa, xb, iteration } = req.query;
  if (!(f && unknown && xa && xb && iteration)) return res.render("secant", 
    { 
      table: undefined,
      active: "SECANT",
    });

  clearFiles();

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

    table.push({
      xavar,
      xbvar,
      fxa,
      fxaa,
      fxb,
      fxba,
      XPLUSONE_FORMULA,
      xPlusOne,
      fxPlusOne,
      fxPlusOneA,
    });

    if (i === 0) {
      await fs.appendFile('./left.csv', 'x,fx\n');
      await fs.appendFile('./right.csv', 'x,fx\n');
      await fs.appendFile('./xm.csv', 'x,fx\n');
    }

    await fs.appendFile("./left.csv", `${xavar},${fxaa}\n`);
    await fs.appendFile("./right.csv", `${xbvar},${fxba}\n`);
    await fs.appendFile("./xm.csv", `${xPlusOne},${fxPlusOneA}\n`);

    XPLUSONE_FORMULA = copy;

    xavar = xbvar;
    xbvar = xPlusOne;
  }

  await spawnSync("./venv/bin/python3", ["index.py"]);
  res.render("secant", { table, active: "SECANT" });
})



// NEWTON-RAPHSON METHOD
app.get("/newton-raphson/", async (req, res) => {
  const { f, unknown, xo, iteration } = req.query;
  if (!(f && unknown && xo && iteration)) return res.render("newtonRaphson", 
  { 
    table: undefined,
    active: "NEWTON_RAPHSON",
  });

  clearFiles();

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
      fxo,
      fxoa,
      dfx, 
      dfxo,
      dfxoa, 
      xn,
      fxn,
      fxna
    });

    if (i === 0) {
      await fs.appendFile('./left.csv', 'x,fx\n');
      await fs.appendFile('./right.csv', 'x,fx\n');
      await fs.appendFile('./xm.csv', 'x,fx\n');
    }

    await fs.appendFile("./left.csv", `${xovar},${fxoa}\n`);
    await fs.appendFile("./xm.csv", `${xn},${fxna}\n`);

    xovar = xn;
  }

  await spawnSync("./venv/bin/python3", ["index.py"]);
  res.render("newtonRaphson", { table, active: "NEWTON_RAPHSON" });
})

app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, "index.html"));
  res.redirect("/bisection");
})

app.get("/about", (req, res) => {
  res.render("about");
})



app.listen(PORT, () => console.log(`NUMERICAL METHOD CALCULATOR: Running at port ${PORT}`));

