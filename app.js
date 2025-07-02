const express = require("express");
const app = express();
const port = 3000;

// Set up EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

// ---------- Home Page ----------
app.get("/", (req, res) => {
  res.render("home", { title: "Venue Booking System" });
});

// ---------- Department Page --------
app.get("/department/:code", (req, res) => {
  const deptMap = {
    sh: "Science & Humanities",
    it: "Information Technology",
    cse: "Computer Science",
    ece: "Electronics & Communication",
    eee: "Electrical & Electronics",
    aids: "AI & Data Science",
    civil: "Civil Engineering",
    auditorium: "Auditorium",
    placement: "Placement Block",
  };

  const venueMap = {
    sh: [
      "Seminar Hall",
      "Smart Class",
      "Sensus Hall",
      "Hall No-3",
      "English Lab",
      "ABL Hall",
      "ECE S-7",
    ],
    cse: ["CS Lab 1", "CS Lab 2", " Seminar Hall-1", "Seminar Hall-2"],
    it: ["UG-Lab-1", " UG-Lab-2", "UG-Lab-3", "Mini Seminar Hall"],
    ece: ["VLSI Lab", "Embedded Lab", "Seminar Hall"],
    eee: ["Electromics Lab", "Electrical Machines Lab", "Project Demo Hall"],
    civil: ["Materials Lab", "Seminar Hall"],
    aids: ["AI Lab", "Seminar Hall"],
    auditorium: ["Main Auditorium"],
    placement: ["Interview Room 1", "Interview Room 2", "Training Hall"],
  };

  const code = req.params.code;
  const deptName = deptMap[code];
  const venues = venueMap[code];

  res.render("department", {
    title: `${deptName} - Venue Selection`,
    deptCode: code,
    deptName,
    venues,
  });
});

// ---------- Booking Page ----------
app.get("/department/:code/book/:venue", (req, res) => {
  const { code, venue } = req.params;

  const deptMap = {
    sh: "Science & Humanities",
    it: "Information Technology",
    cse: "Computer Science",
    ece: "Electronics & Communication",
    eee: "Electrical & Electronics",
    aids: "AI & Data Science",
    civil: "Civil Engineering",
    auditorium: "Auditorium",
    placement: "Placement Block",
  };

  const deptName = deptMap[code];
  if (!deptName) return res.status(404).send("Department not found");

  const slots = [
    "9:15 AM - 10:05 AM",
    "10:05 AM - 10:50 AM",
    "11:05 AM - 11:55 AM",
    "11:55 AM - 12:50 PM",
    "2:00 PM - 2:50 PM",
    "2:50 PM - 3:30 PM",
    "3:45 PM - 4:35 PM",
    "4:35 PM - 5:15 PM",
  ];

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  res.render("book", {
    title: `Booking - ${venue} (${deptName})`,
    deptCode: code,
    deptName,
    venue,
    slots,
    today,
    tomorrow,
  });
});

//Confirmation 

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/confirm-booking", (req, res) => {
  const { department, venue, date, slots } = req.body; 

  const deptMap = {
    sh: "Science & Humanities",
    it: "Information Technology",
    cse: "Computer Science",
    ece: "Electronics & Communication",
    eee: "Electrical & Electronics",
    aids: "AI & Data Science",
    civil: "Civil Engineering",
    auditorium: "Auditorium",
    placement: "Placement Block",
  };

  const deptName = deptMap[department];

  res.render("confirm", {
    title: "Booking Confirmation",
    deptCode: department,
    deptName,
    venue,
    date,
    slots: Array.isArray(slots) ? slots : [slots], //always in arrey
  });
});

//ABOUT , CONTACT , SERVICE

app.get("/", (req, res) => {
  res.render("home", {
    title: "Venue Booking System",
    activePage: "home",
  });
});

app.get("/services", (req, res) => {
  res.render("services", {
    title: "Our Services",
    activePage: "services",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us",
    activePage: "about",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Us",
    activePage: "contact",
  });
});


// ---------- FAQ Page ----------
app.get("/faq", (req, res) => {
  res.render("faq", { title: "FAQ" });
});

// ---------- Support Page ----------
app.get("/support", (req, res) => {
  res.render("support", { title: "Support" });
});

// ---------- Account Page ----------
app.get("/account", (req, res) => {
  res.render("account", { title: "Account" });
});




// ---------- Start Server ----------
app.listen(port, () => {
  console.log(` Server running at: http://localhost:${port}`);
});
