const { response } = require('express');
var express = require('express');
const session = require('express-session');
const { Db } = require('mongodb');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
//midle wear to check uer loged in or not//
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user//this means if user login the user data name will pass to homepage for user name (accout change to user name "ananthu")the session req.session accessable every where in server
  // console.log("%%%%%%%%%%%%%%"+user)
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    // console.log('user id are' + req.session.user._id)
    // console.log(cartCount)
  }

  productHelpers.getAllProducts().then((products) => {

    res.render('user/view-products', { products, user, cartCount });//user detail pass to home  page /partials  can  user-header
  })

});
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {//if customer already logged in 
    res.redirect('/')
  }
  else {

    res.render('user/login', { "loginErr": req.session.loginErr })//if login failed or email or password incorrect we pass this to user/login  page to display an addditional message invlid username and password
    res.session.loginErr = false
  }

})
router.get('/signup', function (req, res) {
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  //writed signp functions in helpers folder there we will send our data to database//
  // console.log(req.body)//now we get user name password and emial subimited signup form
  userHelpers.doSignup(req.body).then((response) => {
    req.session.loggedIn = true
    req.session.user = response
    console.log(response)
    res.redirect('/')
  })
  //res.redirect('/')
})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {//if user login is correct (user name and password are correct the goto home page)
      req.session.loggedIn = true//if i looged in early befeore thession expired now this case 600000 it will take me to the home page
      req.session.user = response.user//user data(pass.and email) now assigned to session it store the value in server
      res.redirect('/')
    }
    else {
      req.session.loginErr = "Invalid user name and password"
      res.redirect('/login')//this wiil if the login fail redirect to login page
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.destroy()//now the session end or cleared
  res.redirect('/')//then we redrecct to home page
})

router.get('/cart', verifyLogin, async (req, res) => {//where i need to check user is loggin or not just i need to call verifyLogin midlever
  let products = await userHelpers.getCartProducts(req.session.user._id)//user id fromn add to (cart) collection
  let totalValue=0;
 if(products.length>0){//not understand and cleared
 totalValue = await userHelpers.getTotalAmount(req.session.user._id)
 }
  // console.log(products)
    //let user=req.session.user if i pass user i'm not able to increase or decrease quantity
  res.render('user/cart', { products, user: req.session.user._id, totalValue})//this user wll go to partials useriheader
  // console.log('*****'+req.session.user._id)
  //console.log("###############"+user)
})

router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  console.log('api call')
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
    // res.redirect('/')
  })
})

router.post('/change-product-quantity', (req, res, next) => {
  console.log(req.body)
  console.log(req.body.user)
  userHelpers.changeProductQuantity(req.body).then(async(response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    console.log('totalll'+response.total)
      res.json(response)
      console.log(response)//this data include values from changeProductQuantity then it send to '/change-product-quantity' ajax sucess
  })
})


router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { total,user:req.session.user})
})

router.post('/place-order',verifyLogin,async(req,res)=>{//checkout button
  let products=await userHelpers.getCartProductList(req.body.userId)//userId from input type hidden inputype in place-order.hbs
  totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId=>{//creating order
    //payment integeration 1st//
    if(req.body['payment-method']==='COD'){
    res.json({codSucess:true})
    }
    else{
      userHelpers.generateRazorpay(orderId.toString(),totalPrice).then((response)=>{
        res.json(response)
      })
    }
  console.log('********************order id '+orderId)//
   })) 
  console.log(req.body);
})

router.get('/order-sucess',(req,res)=>{//sucess page
  console.log('uuuuuuuuuuuuf' + req.session.user[0])
  console.log('uuus' + req.session.user._id)
  res.render('user/order-sucess', { user: req.session.user })
 
})
router.get('/orders',async(req,res)=>{//order history
 let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{use:req.session.user,orders})
  console.log('sssssssss'+req.session.user._id)
  console.log('ussssssf' + req.session.user[0])
})

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProduct(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})
//razorupay 3rd step
router.post('/verify-paymnent',(req,res)=>{
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{//for order status changeing
      console.log('payment sucess')
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false,errMessage:''})//errrMeesage for if there if any eeror //
  })
  console.log(req.body)
})



module.exports = router;
