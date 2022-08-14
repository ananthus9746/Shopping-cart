function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {//if response status true then change the count or increament the count
                let count=$('#cart-count').html()//this cart count id from partials user header hbs/html page
                //cart count is located in partials -user header
                count=parseInt(count)+1//converting count to integer value(because it first stored as a string) and increamenting the count
                $('#cart-count').html(count)//then change the orginal count to converted int count and inserting to that html user-headerpage
            }   
            // alert(response)
        }
    })
}