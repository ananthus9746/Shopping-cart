var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { resolve, reject } = require('promise')
const { ObjectID, ObjectId } = require('bson')
const { response } = require('express')
const { use } = require('../routes/users')
var objectId = require('mongodb').ObjectId


//=====account creating=====//
module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData)//user data name,email,password//
            console.log(userData.Password)//before decrepting user  password
            userData.Password = await bcrypt.hash(userData.Password, 10)
            console.log(userData.Password)//after decreapting or hashing and salting our password look//
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response) => {
                resolve(response)
            })

        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })//this means 1st Email:check/equal to database/ it match with(userData.Email) user entered email
            if (user) {//checking user entered password matching with database password in bcrypt liabry
                bcrypt.compare(userData.Password, user.Password).then((status) => {//1st userData.password from user entered password in login form 2nd user.Password from database password
                    if (status) {//if status true
                        console.log('login success')
                        console.log(status)
                        response.user = user
                        console.log(response.user)
                        response.status = true//this are for redirecting page if user sucess fully logi//
                        resolve(response)
                    }
                    else {
                        console.log('failed')
                        resolve({ status: false })//this will give ueser failed page
                    }
                })
            }
            else {
                console.log('login failed from main if')
                resolve({ status: false }) //this will give ueser failed page
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),//this proObj are for product similar item count
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })//checking user already have cart or not
            if (userCart) {//if user have car already then update the cart/// and if and one product to cart then iif condition works the it push products to user cart//
                let proExit = userCart.products.findIndex(product => product.item == proId)//if it match it wil give the index value //the product is the index number come to product then it check with proid the index item match with proid value
                console.log(proExit)//findindex give the products array index //
                if (proExit != -1) {//if product is there or precent in the products array then (increamnet the product quantity) -1 means product not in the products array items 0(index position 0,1,2,3 etc) means yes..(in this condition 0 thats means not equalto -1)
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) ,'products.item': objectId(proId) },
                            {//matching//which product(in next line what i need to $inc: increamnet ) need to update
                                $inc: { 'products.$.quantity': 1 }//increamnet quantity buy 1 (1 vechu increment cheyuka)
                            }).then(() => {
                                resolve()//update cheythu kazhinjal ..alanghil else create new object and push thats means vera product add cheyumbol push cheythu new product int object create cheythu push cheythu vekkum
                            })

                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: (proObj) }//puthiya product add cheyunnenghil athinta object create cheyuthu athilotte(products array) push cheyuthu vekkum 
                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            } else {//else create a new cart
                //in cart has user id and product id
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([//this method for in cart first find that user_id document (in cart) in that find  user_id after find get that user added product id then get the product id details from product collection//this why we use aggricate method for done this all process in one line of code
                {
                    $match: ({ user: objectId(userId) })//now this step we get the cart of the user//Next step in (cart) get the product details//get the product details from the cart
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    //coverting to object from array//
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
                // {
                //     $lookup: {
                //         from: collection.PRODUCT_COLLECTION,
                //         let: { prodList: '$products' },//this is the cart=>products
                //         pipeline: [
                //             {
                //                 $match: {//the prodList is an array of product now we need match the all product id to the collection=>products
                //                     $expr: {
                //                         $in: ['$_id', "$$prodList"]//the $_id(id) the id from product collection and matching with proLiist
                //                     }
                //                 }
                //             }
                //         ],
                //         as: 'cartItems'//after that all lookup process we get that product details attached to cart then we store that details into new name  (as:'cartItems') cartItems
                //     }
                // }
            ]).toArray()
            console.log(cartItems)
            console.log(cartItems[0].product)//in cart items user arrays the 0th position this array cartitems there is details of product quantity and product id(and show product all details price name dscription)
            resolve(cartItems)

        })

    },
    getCartCount: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            // let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })//this will get back the user-id the particular user cart
            if (cart) {

                count = cart.products.length
                console.log(cart)
            }
            resolve(count)
            // console.log(cart)
            // console.log('user id from getcarcount '+userId)

        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        console.log(details.product)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:ObjectId(details.product)}}//product means product id proId
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }
             else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).then((response) => {

                            resolve(true)
                        })
                    }
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([//this method for in cart first find that user_id document (in cart) in that find  user_id after find get that user added product id then get the product id details from product collection//this why we use aggricate method for done this all process in one line of code
                {
                    $match: ({ user: objectId(userId) })//now this step we get the cart of the user//Next step in (cart) get the product details//get the product details from the cart
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    //coverting to object from array//
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group:{
                        _id:null,

                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                        // total:{$sum:{$multiply:['$quantity','$product.Price']}}
                    }
                }
            
            ]).toArray()
            console.log(total[0].total)     //out put[ { _id: null, total: 48000 } ]
            resolve(total[0].total)

        })
    }
    
} 