const { response } = require('express');
var express = require('express');
const session = require('express-session');
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
  console.log(user)
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
    // console.log(response)
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
  // console.log(products)
  let totalValue =await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/cart', { products, user: req.session.user,totalValue })//this user wll go to partials useriheader
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
  userHelpers.changeProductQuantity(req.body).then((response) => {
    res.json(response)//this data include values from changeProductQuantity then it send to '/change-product-quantity' ajax sucess
    console.log(response)
  })
})


router.get('/place-order', verifyLogin, async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total})
})





module.exports = router;
