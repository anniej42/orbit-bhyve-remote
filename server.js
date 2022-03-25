const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");

const CONFIG_FILE = "/bhyve/config/config.json";

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

if (!fs.existsSync(CONFIG_FILE)) {
  app.use((req, res, next) => {
    console.error(
      "Can't complete request. Application config could not be loaded."
    );
    next();
  });
} else {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE));

  // Require the correct token for each request
  const { token } = config;
  if (token) {
    app.use((req, res, next) => {
      const auth = req.body.token;
      if (token === auth) {
        next();
      } else {
        res.status(403).send();
      }
    });
  }

  app.use("/api", require("./src/routers/apiRouter")(config));
}

// app.set("port", process.env.PORT || 5000);
app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
  console.log("Server is running.");
});
app
  .get("/", function (request, response) {
    var result = "App is running";
    response.send(result);
  })
  .listen(app.get("port"), function () {
    console.log(
      "App is running, server is listening on port ",
      app.get("port")
    );
  });
