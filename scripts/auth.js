//auth.js
//Author @ Sean Dolan - x17467042


//In this JavaScript file I will demonstrate most of the authentication that is happening for a user when it comes to signing up and verifying their details. It is also where I will demonstrate some session management and how to properly deal with uploading data to firebase.  


//SESSION MANAGEMENT
//The below code is how I deal with session management. If a user closes a tab and forgets to log out then this will handle it for them. It is so common for users to close a tab and walk away from a device without actually forgetting to log out so this will help with session hijacking.
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .then(() => {
    // Existing and future Auth states are now persisted in the current
    // session only. Closing the window would clear any existing state even
    // if a user forgets to sign out.
    // New sign-in will be persisted with session persistence.
    return firebase.auth().signInWithEmailAndPassword(email, password);
  })
  .catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
  });

//AUTH STATE CHANGES
//This part is very important as it listens for authenication changes for any user. If a user is signed in then the if statement will return the collection of data stored for the current user that is signed in. I have a function created called setupUI() and what that basically is take the user to their dashboard full of files they have either uploaded or intend to upload. If there is no one signed in then the UI will go back to the home page where a user must sign in or sign up.
auth.onAuthStateChanged(user => {
  if (user) { 
    db.collection('guides').onSnapshot(snapshot => {
      setupUI(user);
    }, err => {
      console.log(err.message)
    });
  } else {
    setupUI();
  } 
});

//SIGN UP FORM
//This is the JavaScript code that will run in the background for when a user is trying to sign up
//The user credentials are sent through a serious of checks to validate their emails and passwords
//We start by getting the signup-form nested inside index.html and follow it with an event listener
//The event listener will run each time a user submits their details but every input is checked before the user is actually signed up, this would demonstrate proper authentication in action.
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  //Here I am just grabbing the values entered by the user in order to pass them through the checks to ensure they are eligiable for sign up.
  const email = signupForm['signup-email'].value;
  const email2 = signupForm['signup-email-retype'].value;
  const password = signupForm['signup-password'].value;
  const pass2 = signupForm['confirm-password'].value;

  //Check if the emails match
  if(email2 != email){
    alert('Emails do not match.')
    return false;
  }
  //Here is where I check the password lenght, it is important to have a very long password as it makes it harder for attackers to guess the password and makes it more difficult to de-crypt.
  else if(password.length<=5){
    alert('Password must be more than 6 characters.')
    return false;
  }
  //This is where the password is checked for a lower case character.
  else if(password.search(/[a-z]/) == -1){
    alert('Password must contain one lower character.')
    return false;
  }
  //This is where the password is checked for an upper case character.
  else if(password.search(/[A-Z]/) == -1){
    alert('Password must contain one uppercase character.')
    return false;
  }
  //This is where the password is checked for a number.
  else if(password.search(/[0-9]/) == -1){
    alert('Password must contain at least one number.')
    return false;
  }
  //This is put in to ensure the user has correctly re-typed their password. I done this as the password inputted will be a long one so I want to ensure the user knows the password.
  else if(password != pass2){
    alert('Passwords do not match.')
    return false;
  }
  //Once the user has passed all checks for the email and password we can now move onto actually signing the user up with firebase and verifying the email.
  else{
        //This is where I am going to sign the user up with firebase, I pass their email and password over to the firebase console with the use of firebase functions. With createUserWithEmailAndPassword() it will take the email and write it to the firebase console and then also grab the password and pass it through a hashing algorithm for storage.
        auth.createUserWithEmailAndPassword(email, password).then(() => {
          //So once the user is created we need to actually verify that the email is real. We do this by creating a refernce of the current user and ue the firebase function sendEmailVerification(). This function will send the email a verification link, the user by default is set to false for verification, once the link is clicked then the firebase will update the email to be true. We need to be able to incorportate this into our app to block unverified users from doing certain actions.
          var user = firebase.auth().currentUser;
          user.sendEmailVerification();
          // Email sent. The below alert is shown to let the user know they need to check their email.
          alert("A verification email has been sent to you. Please verify your email so you can use our services!");
    }).then(() => {
      // close the signup modal & reset form
      const modal = document.querySelector('#modal-signup');
      M.Modal.getInstance(modal).close();
      signupForm.reset();
    }).then(()=> {
      //This will reload the page after the above code is finished running.
      location.reload();
    }).catch(function(error) {
      // An error happened.
      alert(error+" Please try again!");
    });
  }
});

// UPLOAD DATA TO FIREBASE 
//This is where we upload data. I start by calling the create-form nested in index.html and then make a variable of the file button within the create form. 
const uploadForm = document.querySelector('#create-form');
var fileButton = document.getElementById('fileButton');

//Here is an event listener that is set for the choose file button 
//This event listening is very important as it takes in the file the user wants to upload
fileButton.addEventListener('change', function (e){
  var file = e.target.files[0];
  //Next I have created a storage reference for firebase. This is where the users files will be stored under their unique ID generated by firebase so that only they can view the files when they are logged in.
  var storageRef = firebase.storage().ref(auth.currentUser.uid+"/"+file.name);
    //So, now we have the event listener for the actual upload button of a file, so when a user submits a file they have chosen to upload this is what we want the file to do.
    uploadForm.addEventListener('submit', (ex) => {
      ex.preventDefault();
      //This variable is created as for 
      var uploadTask = storageRef.put(file);
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        function (snapshot) {
          //This is where we get the task progress of a file getting uploaded. I have it logging to the console where we would be able to see the number of bytes getting uploaded and also the total number of bytes that are to be uploaded.
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
          }
        }, function (error) {
          //This is where I will catch any errors to do with uploading the data to firebase
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
          case 'storage/unauthorized':
          // User doesn't have permission to access the data
          console.log("error found");
          break;
          case 'storage/canceled':
          // User canceled the upload
          console.log("error found");
          break;
          case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          console.log("error found");
          break;
          }
        },function () {
          // Upload completed successfully, now we can get the download URL
          //We use this download URL so that a user can retrieve their files from firebase.
          var downloadURL = uploadTask.snapshot.downloadURL;
          uploadForm.reset();
          location.reload();
        });
    });
});

//LOGOUT
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
  location.reload();
});

//LOGIN
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;
  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
    location.reload();
  }).catch(function(error) {
    // An error happened.
    alert(error+" Please sign up!");
  });
});