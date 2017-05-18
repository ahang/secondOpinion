//Dependencies
var express = require("express");
var router = express.Router();
var Client = require("node-rest-client").Client;
// var algorithm = require("../lib/algorithmOnly.js");
var path = require("path");

var db = require("../models");

var client = new Client();

//Router to render the index page
router.get("/", function(req, res) {
    res.render("index");
});

//Router to update the current doctor and diagnosis for the logged in patient
router.put("/dashboard/update-patient/:id", function(req, res) {
    // console.log(req.body);
    console.log(`Activating dashboard update patient
        Doctor: ${req.body.current_doctor}
        Dianogsis: ${req.body.diagnosis}`);
    db.Patients.update({
        current_doctor: req.body.current_doctor,
        diagnosis: req.body.diagnosis
    }, {
        where: {
            patient_id: req.params.id
        }
    }).then(function(dbPatients) {
        //send the results of the doctor match as a response object

        res.json(dbPatients);

    });
});

//Router to get the admin page. Checks if you are an admin before rendering. If you aren't render the 404 page.
//If admin, have sequelize grabs all the doctor and patient data and renders the admin page with the following datasets
router.get("/admin", isLoggedIn, function(req, res) {
    //Updated Admin block, you can only use one res.render per block
    //Have to do the second query in a callback from the initial callback
    if (req.user.isAdmin) {
        db.Doctors.findAll({}).then(function(doctorData) {
            db.Patients.findAll({}).then(function(patientsData) {
                // console.log(patientsData);
                res.render("admin", {
                    isAdmin: patientsData,
                    doctors: doctorData,
                    patients: patientsData
                });
            });
        });
    } else {
        res.render("404");
    }
});

//Router to update to add an admin based on the current Patients table
router.put("/admin/add-admin/:id", function(req, res) {
    // console.log(req.body);
    // console.log(req.body.id);
    db.Patients.update({
        isAdmin: req.body.isAdmin
        }, {
        where: {
            patient_id: req.params.id
        }
    }).then(function() {
        res.redirect("/admin");
    });
});

//Router to unremove a doctor
router.put("/admin/unremove-doc/:id", function(req, res) {
    // console.log(req.body);
    // console.log(req.body.id);
    db.Doctors.update({
        removed: req.body.removed
        }, {
        where: {
            doc_id: req.params.id
        }
    }).then(function() {
        res.redirect("/admin");
    });
});
//Router to unremove a patient
router.put("/admin/unremove-patient/:id", function(req, res) {
    // console.log(req.body);
    // console.log(req.body.id);
    db.Patients.update({
        removed: req.body.removed
        }, {
        where: {
            patient_id: req.params.id
        }
    }).then(function() {
        res.redirect("/admin");
    });
});

//Router to "delete" a patient from the current Patient table
router.put("/admin/remove-patient/:id", function(req, res) {
    // console.log(req.body);
    // console.log(req.body.id);
    db.Patients.update({
        removed: req.body.removed
        }, {
        where: {
            patient_id: req.params.id
        }
    }).then(function() {
        res.redirect("/admin");
    });
});

//Router to "delete" a doctor from the current Doctors table
router.put("/admin/remove-doc/:id", function(req, res) {
    // console.log(req.body);
    // console.log(req.body.id);
    db.Doctors.update({
        removed: req.body.removed
        }, {
        where: {
            doc_id: req.params.id
        }
    }).then(function() {
        res.redirect("/admin");
    });
});

//Router to remove an admin based on the current Patients table
router.put("/admin/remove-admin/:id", function(req,res) {
    db.Patients.update({
        isAdmin: req.body.isAdmin
    }, {
        where:{
            patient_id: req.params.id
        }
    }).then(function() {
        res.redirect("/admin");
    })
})

//Router to render all of the available doctors on the docs page
router.get("/docs", function(req, res) {
    db.Doctors.findAll({}).then(function(results) {
        res.render("docs", { doctors: results });
    });
});

router.get("/about", function(req, res) {
    res.render("about");
});

router.post("/dashboard/matches", function (req,res) {

    var currentDoctorId = req.body.id;
    var currentDoctorSpecialty = "";
    var currentDoctorTotal = "";
    var docMatch = "";
    var doctorsArray = [];
    var docObject = "";
    var totalsArray = [];
    var potentialsArray = [];
    var matchesArray = [];
    var bestMatch = "";
    var max = 0;

    db.Doctors.findAll({
        where: {
            bestdoc_id: currentDoctorId
        }
    }).then (function (data) {

        currentDoctorTotal = data[0].dataValues.total;
        currentDoctorSpecialty = data[0].dataValues.primary_specialty;
        createDocArray(currentDoctorSpecialty);
        console.log(currentDoctorTotal);
        console.log(currentDoctorSpecialty);
        console.log(data);
    });


    function createDocArray (currentDoctorSpecialty) {

            db.Doctors.findAll({
                where: {
                    primary_specialty: currentDoctorSpecialty
                }
            }).then (function (data) {

                    for (var i = 0; i < data.length; i++) {

                        docObject = new Object ();
                        docObject.id = data[i].doc_id;
                        docObject.bestdoc_id = data[i].bestdoc_id;
                        docObject.total = data[i].total;

                        doctorsArray.push(docObject);
                    }

                doctorsSort(doctorsArray);

            });

    }

    function doctorsSort (doctorsArray) {

        for (var i = 0; i < doctorsArray.length; i++) {
            if(currentDoctorTotal < doctorsArray[i].total) {
                totalsArray.push(doctorsArray[i].total);
            }
        }

        getMatches(totalsArray, doctorsArray);

    }

     function getMatches (totalsArray, doctorsArray) {

        for (var j = 0; j < totalsArray.length; i++) {

            max = Math.max(...totalsArray);

                for (var i = 0; i < doctorsArray.length; i++) {

                    if(doctorsArray[i].total === max) {
                        potentialsArray.push(doctorsArray[i]);

                    }
                }

            var index = totalsArray.indexOf(max);
            totalsArray.splice(index, 1);

        }
        getFinalists(potentialsArray, matchesArray);

    }

    function getFinalists(potentialsArray, matchesArray) {

        for (var i = 0; i < potentialsArray.length; i++) {
            if (i < 5) {
                matchesArray.push(potentialsArray[i])

            }
        }

        bestMatch = matchesArray[0];

        getBestDoc(bestMatch);

    }

    function getBestDoc(bestMatch) {

        var uid = bestMatch.bestdoc_id;

        client.get("https://api.betterdoctor.com/2016-03-01/doctors/"+uid+"?user_key=d8943b3e452eb1a5bbf27cdab4f4bd92", function (data, response) {

            docMatch = new Object ();
            docMatch.first_name = data.data.profile.first_name;
            docMatch.last_name = data.data.profile.last_name;
            docMatch.language = data.data.practices[0].languages[0].name;
            docMatch.school = data.data.educations[0].school;
            docMatch.degree = data.data.educations[0].degree;
            docMatch.title = data.data.profile.title;
            docMatch.specialty = data.data.specialties[0].actor;
            docMatch.gender = data.data.profile.gender;
            docMatch.image = data.data.profile.image_url;
            docMatch.bio = data.data.profile.bio;
            docMatch.practice_name = data.data.practices[0].name;
            docMatch.street = data.data.practices[0].visit_address.street;
            docMatch.street2 = data.data.practices[0].visit_address.street2;
            docMatch.city = data.data.practices[0].visit_address.city;
            docMatch.state = data.data.practices[0].visit_address.state;
            docMatch.zip = data.data.practices[0].visit_address.zip;
            docMatch.phone = data.data.practices[0].phones[0].number;

            console.log(docMatch);
            res.json(docMatch);

        });

    }

});





//pull all the doctor data from MySQL
    //Feed the relevant information into the doctor section of the  handlebars template
    //for now, displaying a dummy page.
    // res.render('admin', {doctors: results});
//Pull all the patient data from MySQL
    //Feed the relevant information into the patient section of the handlebars template
    // res.json(dbDoctors);
//keeping below for reference
// res.render("admin");

//Checks to see if a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect("/")
}

module.exports = router;