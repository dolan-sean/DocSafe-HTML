//index.js
//Author @ Sean Dolan - x17467042

//In this JavaScript file I make changes to the UI and dashboard. This file will talk with the auth.js file to determine what user is signed in and what changes will be made to the UI depending on the current user signed in.

//Below I am just calling all my IDs and queries needed to maniuplate the UI.
const setUpDash = document.querySelector('.dashboard');
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');

//So this function is the brains behind the website. This will run when a user is signed in and help display their data related to them back. I pass the user through the setupUI function in order to display certain data owned by that particular user.
const setupUI = (user) => {
  if(user){
    //First I start off by getting the current user and displaying the email within the account details modal. I get the email of the current user who is logged in by calling the user then their unique ID and getting the user.email. 
    db.collection('users').doc(user.uid).get().then(doc => {
      //innherHTML will be displayed for when a user is signed in.
      const html = `
        <div>Logged in as ${user.email}</div>
        <p>If you would like to make changes to your account then please contact us!</p>
        <p> Contact: admin@docsafe.ie </p>
      `;
      accountDetails.innerHTML = html;
    });
    //clear account details
    accountDetails.innerHTML = '';
    //Here is how I hide and show the links for a user determined by their login status returned by auth().
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');
    //This is just a header for the dashboard and will display when the user is signed in
    const Head = `
        <h3><u>Your Uploads.</u></h3>
        <br />
        `;
    setUpDash.innerHTML += Head;

    //Now we are moving onto the complicated/fun part of the setupUI(). This is how I am going to display the user files back to the current user who is logged in.

    //I start off by making a storage ref and in this ref I get the current user and their UID
    var storageRef = firebase.storage().ref(user.uid);
    
    //I gather the references of the files for display using my storageRef created above and I list all the files within that storage ref.
    storageRef.listAll().then(function(result) {
      result.items.forEach(function(fileRef) {
        //After getting the results from the sotrageRef we display the files using a function I created called displayFile().
        displayFile(fileRef);
      });
    }).catch(function(error) {
      // Handle any errors
      console.log("error found");
    });

    //Now in order to actually display the file I have created this function that will run when a user is seen as signed in by firebase using the auth().currentUser function/ref.  
    function displayFile(fileRef) {
      //I get the fileRef from firebase and also the download url set by firebase.
      fileRef.getDownloadURL().then(function(url) {
        var name = fileRef.name;
        //Here again I am using innerHTML to display the files uploaded by users, I get the file name and display it back to the user and then I add in two buttons one for deletion and one for downlaoding.
        //Firebase generates URLs for files and these URLs are completely unique and almost unrecognisable.
        const html = `
          <h5 class="center"><b>${name}</b></h5>
          <button class="btn yellow darken-2 z-depth-0" onclick="deleteFile()">Delete</button>
          <a class="btn yellow darken-2 z-depth-0" href="${url}">Download</a>
          <br />
          <br />
          <br />
        `;
        setUpDash.innerHTML += html;
        //Here is how users will delete files. I created a function called deleteFile() and it is executed with an onclick from the buttin above in the innherHTML.
        window.deleteFile = () =>{
           // Delete the file
          fileRef.delete().then(() => {
            alert("Delete success");
            //Relaod page.
            location.reload();
            // File deleted successfully
          }).catch((error) => {
            // Uh-oh, an error occurred!
            alert("Delete failed");
          });
      }
      }).catch(function(error) {
        // Handle any errors
      });
    } 
  }//end setupUI()
  else{
    //hide account info
    setUpDash.innerHTML = `
    <h1 class="center-align"> Welcome to DocSafe </h1>
    </br>
    <h4 class="center-align" style="text-align:left">DocSafe is a storage website that you can trust. We use google firebase SDKs in order to authenticate our users and ensure the safe storage of your data. DocSafe is end-to-end encrypted using HTTPS so we can ensure the safety of your data over any network you may be using. Sign up to DocSafe today!</h4>
    </br>
    <h5 class="center-align">If you have an account then please sign in to view your dashboard.</h5>
    `;
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
};

//This below code will control the upload button within the dashboard of the project. A user that has not verified their email will not be able to upload to the firebase storage. They must verify their email in order to upload documents to their designated folder location.
var uploadBtn = document.getElementById('upload-button');
uploadBtn.addEventListener('click', function(){
  //if statement to check.
  if(!firebase.auth().currentUser.emailVerified){
    alert("Please verify your email");
  }else{
    el = document.getElementById("modal-create");
    el.style.visibility = "visible";
    document.getElementById("modal-create").style.height = "30%";
  }
});

// setup materialize components
document.addEventListener('DOMContentLoaded', function() {
  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);
  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);
});