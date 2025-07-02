//for user login and auth details , table nme is "usertable"
//for entire data , table name is "entiredetails"
//for another table is "slotid"

import express from 'express'
import path from 'path'
import {fileURLToPath} from 'url'
import bcrypt from 'bcryptjs'
import pkg  from 'pg'
import nodemailer from 'nodemailer'

const web=express();
const PORT=3000;
const {Pool}= pkg;

const IT=['24243034@nec.edu.in','24205037@nec.edu.in'];
const CSE=[];
const AIDS=[];
const Civil=[];
const Mech=[];
const EEE=[];

const pool=new Pool({
    user: "postgres",        
    host: "localhost",      
    database: "VenueBookingSystem",        
    password: "Bala@2007", 
    port: 5432,
})

web.use(express.static("public"));
web.use(express.urlencoded({extended:true}));

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

web.set('views',path.join(__dirname))
web.set('view engine','ejs');


web.get("/", (req, res) => {
  res.render("start"); // assumes there's a login.ejs file
});

web.get("/sign-up", (req, res) => {
  res.render("sign-up"); // assuming you have views/sign-up.ejs
});

web.get("/home",(req,res)=>{
    res.render("home");
})

web.post("/login", async (req, res) => {
    const { userid, userPassword } = req.body;
    try {
        const result = await pool.query(`SELECT hashed FROM usertable WHERE userid=$1`, [userid]);
        if (result.rows.length === 0) {
            return res.send("Invalid user ID or Password !");
        }
        const hashedPasswordFromDB = result.rows[0].hashed;
        const isMatch = await bcrypt.compare(userPassword, hashedPasswordFromDB);

        if (isMatch) {
            res.redirect("/home");
        } else {
            res.send("Invalid user ID or Password !");
        }
    } catch (err) {
        console.error(err);
        res.send("Something went wrong!");
    }
});


web.post("/register",async(req,res)=>{
    const {username,userId,emailaddress,setpassword}=req.body;
    const saltRounds = 10;
    const hashed = await bcrypt.hash(setpassword,saltRounds);
    try{
        await pool.query(`INSERT INTO usertable(username,userid,hashed,emailaddress) VALUES($1,$2,$3,$4)`,[username,userId,hashed,emailaddress]);
        res.render("home");
    }
    catch(err){
        res.send("Some fields may be filled inappropriatly , fill them properly");
    }
})

web.post("/department",(req,res)=>{
    const deptChoice=req.body.deptChoice;
    if(deptChoice=="SH"){
        res.render("SHSlots");
    }
    else if(deptChoice=="IT"){
        res.render("InformationTechnology");
    }
    else if(deptChoice=="CSE"){
        res.render("ComputerScience");
    }
    else if(deptChoice=="ECE"){
        res.render("ElectronicsAndCommunication");
    }
    else if(deptChoice=="AIDS"){
        res.render("AIDS");
    }
    else if(deptChoice=="Civil"){
        res.render("Civil");
    }
    else if(deptChoice=="Mech"){
        res.render("Mech");
    }
    else if(deptChoice=="EEE"){
        res.render("ElectricalAndElectronics");
    }
    else if(deptChoice=="PlacementCell"){
        res.render("PlacementCell");
    }
})


web.post("/bookslotsInSH",async(req,res)=>{
    const {Datex,Description,Period,UserIDforBooking,Dep}=req.body;
    const idAvailablityChecking=await pool.query(`SELECT * FROM usertable WHERE userid=$1`,[UserIDforBooking]);
    const staffMail=idAvailablityChecking.rows[0].emailaddress;
    if(idAvailablityChecking.rows.length===0){
        res.redirect("sign-up");
    }
    const SelectedSlotID=req.body.SlotID;
    const date = new Date();
    var currentmonth=date.getMonth()+1;
    const currentyear=date.getFullYear();
    var currentdate=date.getDate();
    var currentDateForDB=`${currentyear}-${currentmonth}-${currentdate}`;
    if(Datex=="today"){
        const toCheckAvailablity=await pool.query(`SELECT * FROM entiredetails WHERE booking_date=$1 AND venueid=$2 AND periods=$3`,[currentDateForDB,SelectedSlotID,Period]);
        if(toCheckAvailablity.rows.length===0){
            pool.query(`INSERT INTO entiredetails(booking_date,venueID,userid,periods,description) VALUES($1,$2,$3,$4,$5)`,[currentDateForDB,SelectedSlotID,UserIDforBooking,Period,Description]);
            const slotName=await pool.query(`SELECT venuename FROM slotid WHERE venueid=$1`,[SelectedSlotID]);
            //email sending logic
            //mail logic start
            const transporter=nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:'24205037@nec.edu.in',
                    pass:"bbya ucgz aiev ukyc"
                }
            });
            let departmentChoice;
            switch(Dep){
                case "IT":departmentChoice="IT";break;
                case "S&H":departmentChoice="S&H";break;
                case "CSE":departmentChoice="CSE";break;
                case "AIDS":departmentChoice="AIDS";break;
                case "Civil":departmentChoice="Civil";break;
                case "Mech":departmentChoice="Mech";break;
                case "EEE":departmentChoice="EEE";break;
            }
            const mailOptions={
                from:'24205037@nec.edu.in',
                to:IT,
                subject:"Class Alert",
                text:Description
            };
            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.error(error);
                }
                else{
                    console.log("mail sent");
                }
            })
            //end
            res.render("confirm",{cdate:currentDateForDB,cslotid:SelectedSlotID,cslotname:slotName.rows[0].venuename,cperiod:Period,cuserid:UserIDforBooking});
        }
        else{
        res.render("SHSlots");
        }
    }
    else if(Datex=="tomorrow"){
        if(currentmonth==2){
            if(currentdate==28){
                currentdate="01";
                currentmonth="03";
            }
        }
        else if(currentmonth%2!=0){
            if(currentdate==31){
                currentdate="01";
                currentmonth++;
            }
        }
        else if(currentmonth%2==0){
            if(currentdate==30){
                currentdate="01";
                currentmonth++;
            }
        }
        const toCheckAvailablity=await pool.query(`SELECT * FROM entiredetails WHERE booking_date=$1 AND venueid=$2 AND periods=$3`,[currentDateForDB,SelectedSlotID,Period]);
        if(toCheckAvailablity.rows.length===0){
            await pool.query(`INSERT INTO entiredetails(booking_date,venueID,userid,periods,description) VALUES($1,$2,$3,$4,$5)`,[currentDateForDB,SelectedSlotID,UserIDforBooking,Period,Description]);
            const slotName=await pool.query(`SELECT venuename FROM slotid WHERE venueid=$1`,[SelectedSlotID]);
            //email sending logic
            //mail logic start
            const transporter=nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:'24205037@nec.edu.in',
                    pass:"bbya ucgz aiev ukyc"
                }
            });
            let departmentChoice;
            switch(Dep){
                case "IT":departmentChoice="IT";break;
                case "S&H":departmentChoice="S&H";break;
                case "CSE":departmentChoice="CSE";break;
                case "AIDS":departmentChoice="AIDS";break;
                case "Civil":departmentChoice="Civil";break;
                case "Mech":departmentChoice="Mech";break;
                case "EEE":departmentChoice="EEE";break;
            }
            const mailOptions={
                from:'24205037@nec.edu.in', //it is like admin mail 
                to:IT,
                subject:"Class Alert",
                text:Description
            };
            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.log(error);//for testing
                    console.error(error);
                }
                else{
                    console.log("mail sent");
                }
            })
            res.render("confirm",{cdate:currentDateForDB,cslotid:SelectedSlotID,cslotname:slotName.rows[0].venuename,cperiod:Period,cuserid:UserIDforBooking});
        }
        else{
            res.render("SHSlots");
        }
    }
    else{
        res.send("You entered some wrong information , Fetch proper information !");
    }
})

web.listen(PORT,()=>{
    console.log(`server running on PORT ${PORT}`)
})
