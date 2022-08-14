const mongoClient=require('mongodb').MongoClient;

const state={// db come from app.js db.connect for database conection "Database connected sucessfully",the data base already conected when the project is tarted time and it runing
    db:null
}

module.exports.connect=function(done){///exporting to app.js
    const url = 'mongodb://localhost:27017';
    const dbname='shopping';

    mongoClient.connect(url,(err,data)=>{
        if(err) 
        return done(err)
        
        state.db=data.db(dbname)
        done()
    })
   
}

module.exports.get=function(){//this is for acessing database for connect and insert our data to it 
    return state.db// when we cal get we can access db function reason in get function db is returnig that means when we return something it can access in that called name now here is get method or function
}