const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  //this where the demo data present like name,image,discriptioon in the form of object key value pair
  productHelpers.getAllProducts().then((products) => {
    // console.log(products)//geting data from data base and displaying to the admin
    res.render('admin/view-products', { admin: true, products });
  })

});
router.get('/add-product', function (req, res) {              //the green add product button
  res.render('admin/add-products', { admin: true, })
  
})        //the submit button add-product//
router.post('/add-product', function (req, res) {               //req.body pass throut next addproduct function

  console.log('add-product from admin.js' + req.body)             //req.body contain data from add product submited from
  // console.log(req.files.Image)


  productHelpers.addProduct(req.body, (id) => {                     //req.body was the daa from subnitted form addproduc tdetail name:"name",name:"category"
    // console.log(id)
    let image = req.files.Image//imgage getting from top /add-product route
    image.mv('./public/product-image/' + id + '.jpg', (err, done) => {//mv from fileupload//only jpg file possible// and moving file to a folder after getting data from submitted form thats means add product form
      if (!err) {//if not error
        res.render("admin/add-products", { admin: true, })
      }
      else {//if error
        console.log(err)
      }
    })

  })//passing data to data base via product-helpers module.require

})

router.get('/delete-product/:id', (req, res) => {//if  we passing value to the url weuse pramas to get the  the id is comming from view-product.hbs  
  let proId = req.params.id
  console.log(proId)
  productHelpers.deleteProduct(proId).then((response) => {
    console.log(response)
    res.redirect('/admin/')

  })
})

router.get('/edit-product/:id',async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{//no retun becuse it only updating data
    // console.log(response)
    res.redirect('/admin')
    let id = req.params.id
    if(req.files.Image){
      let image = req.files.Image
      image.mv('./public/product-image/' + id + '.jpg')
    }
  })
  
})


module.exports = router;
