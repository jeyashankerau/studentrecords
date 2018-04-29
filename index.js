var sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const sqliteJson = require('sqlite-json');
var db = new sqlite3.Database('data/StudentRecords.db');

var express = require('express');
var rapi = express();
rapi.use(bodyParser.json());
rapi.set("json spaces", 4);
db.serialize(function() {

});

rapi.get('/api/commonstudent', function(req, res){
    var teachers = req.query.teacher;
    //console.log(teachers);
    //res.send(teachers);
    let qry = "";
    for (let i=0;i< teachers.length;i++) {
        if(i<teachers.length - 1){
            qry = qry + 'select distinct student from TeachingAssociation where teacher = "' + teachers[i] + '" intersect ';
        }
        else{
            qry = qry + 'select distinct student from TeachingAssociation where teacher = "' + teachers[i] + '"';
        }       
    }

    var rowz = [];
    db.each(qry, function(err, row){
        rowz.push(row.Student);
    },function(){ 
        let resObj = {};
        resObj.students = rowz;
        res.status(200).send(resObj);
    });
});

rapi.post('/api/suspend',function(req, res){
    let student = req.body.student;
    let updStmt = 'update Students set suspended = 1 where email = "' + student + '"';
    db.run(updStmt,function(err, row){},function(){ 
        res.status(204).send();
    });
});

rapi.post('/api/register',function(req, res){
    let teacher = req.body.teacher;
    let students = req.body.students;
    console.log(teacher);
    console.log(students);
    //Update Teachers Table
    let tSlctStmt = 'select email from Teachers';
    let tRows = [];
    db.each(tSlctStmt,function(err, row){
        tRows.push(row.email);
    });
    if(!tRows.includes(teacher)){        
        let tInstStmt = 'Insert into Teachers (email) values("' + teacher + '")';
        db.run(tInstStmt,function(err, row){});        
    }
    //Update Students table
    let sSlctStmt = 'select email from Students';
    let sRows = [];
    db.each(sSlctStmt,function(err, row){
        sRows.push(row.email);
    });
    for(let student of students){
        if(!sRows.includes(student)){
            let sInstStmt = 'Insert into Students (email) values("' + student + '")';
            db.run(sInstStmt,function(err, row){});
        }
    }
    //update Association table
    for(let student of students){
        let cnt = 0;
        let aSlctStmt = 'select count (*) as Rowz from TeachingAssociation where student = "' + student + '" and teacher = "' + teacher +'"';    
        db.all(aSlctStmt,function(err, rows){
            //console.log("hi : " + rows[0].Rowz);
            cnt = rows[0].Rowz;            
        });
        console.log(cnt);
        if(cnt===0){
           let aInstStmt = 'Insert into TeachingAssociation  values("'+ teacher + '" , "' + student + '")';//(Teacher,Student)
           db.run(aInstStmt,function(err, row){});
        }
    }
    res.status(204).send();
});

rapi.post('/api/retrievefornotifications',function(req, res){
    
});

rapi.listen(3000);

console.log("Submit GET or POST to http://localhost:3000/data");