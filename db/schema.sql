CREATE DATABASE second_opinion_db;  

USE second_opinion_db; 


CREATE TABLE doctors(
	doc_id int(11) NOT NULL AUTO_INCREMENT,
    bestdoc_id int(50) NOT NULL,
    name varchar(50) NOT NULL,
    primary_specialty varchar(150) NOT NULL,
    secondary_specialty varchar(150) DEFAULT NULL,
    current_role_rating int(11) DEFAULT 0,
    practice_rating int(11) DEFAULT 0,
    undergrad_rating int(11) DEFAULT 0,
    med_school_rating int(11) DEFAULT 0,
    residency_rating int(11) DEFAULT 0,
    fellowship_rating int(11) DEFAULT 0,
    publications_rating int(11) DEFAULT 0,
    years_exp_rating int(11) DEFAULT 0,
    clinical_trials_rating int(11) DEFAULT 0,
    patient_stars_rating int(11) DEFAULT 0,
    awards_rating int(11) DEFAULT 0, 
    medicine_phD BOOLEAN DEFAULT 0, 
    primary key(doc_api_id)
)

