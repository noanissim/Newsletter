const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const https = require('https');
//Requiring mailchimp's module
//For this we need to install the npm module @mailchimp/mailchimp_marketing. To do that we write:
//npm install @mailchimp/mailchimp_marketing
const mailchimp = require('@mailchimp/mailchimp_marketing');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static('public'));
// כל מה שסטטי כלומר העיצוב והתמונות צריך לשים בתיקייה פבליק

app.get('/', function(req, res){
  res.sendFile(__dirname + '/signup.html')
})

//SETTING UP MAILCHIMP:
mailchimp.setConfig({
  apiKey: "c2b9642895b3876b448dd1e50506f117-us5",
  server: "us5"
});


//As soon as the sign in button is pressed execute this
app.post('/', function(req, res){
  const firstName = req.body.firstN;
  const lastName = req.body.lastN;
  const email = req.body.email;
  // console.log(firstName, lastName, emailAddress)

  const listId = '768f8ab449';

// כדי להעביר את המידע למיילצימפ אני צריכה ליצור אובייקט בנוסח של קובץ גייסון
  const data = {
    // כאן נכניס את המידע אבל לפי המילים שמיילצימפ מזהה לפי האתר
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  // כל המידע שבממברס נעביר לפורמט מסוג גייסון:
  const jsonData = JSON.stringify(data);


const run = async () => {
    try{
      const response = await mailchimp.lists.addListMember(listId,{
        email_address: data.email,
        status: "subscribed",
        merge_fields: {
          FNAME: data.firstName,
          LNAME: data.lastName
        }
      });
      console.log(response);
      //If all goes well logging the contact's id

      res.sendFile(__dirname + "/success.html")
      console.log( 'Successfully added contact as an audience member. The contacts id is' )



    }catch(err){

      if(err.status !== 400){
      res.sendFile(__dirname + "/failure.html")
      console.log( err.status )}
      else{
        res.sendFile(__dirname + "/success.html")
        console.log( 'Successfully added contact as an audience member. The contacts id is' )

      }
  }

}

run();



  const url = 'https:/us5.api.mailchimp.com/3.0/lists/768f8ab449';
  // זה השרת של מיילצימפ שאליו אי שולחת את הבקשה שלי

  const options = {
    method: "POST",
    auth: "noa1:c2b9642895b3876b448dd1e50506f117-us5"
    // לפי מיילצימפ כדי שתהיה אוטנטיקציה צריך להכניס סטרינג רנדומלי ואזי ואז את האייפיאיי
    }

    // אנחנו רוצים לשלוח מידע לפעולת הפוסט ולכן לא נעשה גט אלא ריקווסט
  const request2 = https.request(url, options, function(response2){

    response2.on('data', function(data){
      console.log(JSON.parse(data)); //ככה אנחנו טוענים את המידע בקובץ גייסון שהגיע מהפונקציה

    })
  })



request2.write(jsonData); //כדי להעביר לשרת את המידע
request2.end() //לייצג שסיימנו להעביר את המידע


});


app.post("/failure", function(req,res){
  res.redirect("/") //במקרה של כישלון זה מנתב את המשתמש לנתיב הבית
})

app.listen(process.env.PORT || 3000, function(){
  console.log('server is running on port 3000');
});


//apikey c2b9642895b3876b448dd1e50506f117-us5
// audience id: 768f8ab449
