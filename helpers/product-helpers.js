//===inserting products to database and getting database datas=======//
var db = require('../config/connection')                                    //getting mongo db connection from config connection file//
var collection=require('../config/collections')                             //this because if i need change name it make easy and avoid spelling mistake
const { resolve, reject } = require('promise')
const { response } = require('express')
var objectId = require('mongodb').ObjectId


module.exports = {
                                                                            // getting to parameter from where the addProduct is called now this case admin.js in this case product contain deatains from submtted form
    addProduct: (product, callback) => {                                     //product req.body from admin add-product product details
        console.log(product)
        product.Price = parseInt(product.Price)
        db.get().collection('product').insertOne(product).then((data) => {          //db getting data (db) object from get function from connetion.js-in connecion.js the db come from app.js reson is there is where db is running or created or connected (config file)
            console.log(data)                                                      //in product contain data from.req.body from admin.js add product
            callback(data.insertedId)                                                   //this id from database id from mogodb collection-oroduct-document the document id to save the image to our file the reason for image uniqness to keep every image different id
                                                                                 //the callback contain id from db document after the insertion then the id pass in callback form for image saving with this id    //next the callback go to admin.js  where the callback function working and writted(id)then it add id with image 
        })

    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id:objectId(prodId)}).then((response)=>{
            //    console.log(response)
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    }
    
}













//====gettting all inserted datafrom database===//
    //before using promise (npm install promise)
    // gettingAllproducts:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()//collection.PRODUCT_COLLECTION it from config-collections //it only for make the name constant andavoid spelling mistake
    //                 //the wait for getting data from databse and wait to get data from database if i dont use await javascript will exictute code befor getting the data that make error in our code//  
    //                 resolve(products)                                                      // the find() data is in the form of array beacuse that we need change the dtata to array.toArray()
    //     })
    // }