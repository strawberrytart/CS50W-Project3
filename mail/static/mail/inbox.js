document.addEventListener('DOMContentLoaded', function() {

  //Hide the alert divs
  document.querySelector('#error-alert').style.display = 'none';
  document.querySelector('#archive-alert').style.display = 'none';
  document.querySelector('#unarchive-alert').style.display = 'none';
  document.querySelector('#success-alert').style.display='none';

  //Use buttons to toggle between views
  //Get the element based on the id and pay attention for 'click' and run function load_mailbox
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //Attach event handler to #unarchive-button to pay attention to click and run function
  document.querySelector('#unarchive-button').addEventListener('click', function(){
    unarchiveEmail(this.dataset.id)
    setTimeout(function(){
      load_mailbox('inbox');
    }, 50);
    unarchiveAlert();
  })

  //Attach event handler to #archive-button to pay attention to click and run function
  document.querySelector('#archive-button').addEventListener('click', function(){
    archiveEmail(this.dataset.id)
    setTimeout(function(){
      load_mailbox('inbox');
    }, 50);
    archiveAlert();
  })

  //When the form is submitted, send a POST request to /emails route
  document.querySelector('form').onsubmit = function(){
    fetch('/emails',{
      method: 'POST',
      //Convert Javascript object into a JSON string and sent as the request body
      body: JSON.stringify({
        recipients : document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
      }),
    })
    //Reads the response body and parses it as JSON
    .then(response => response.json())
    //receives parsed JSON and process the data
    .then(result => {
      //Print result
      if (result['error']){
        showAlert(result['error'])
      }
      else{
        document.querySelector('#compose-recipients').value = '';
        document.querySelector('#compose-subject').value = '';
        document.querySelector('#compose-body').value = '';
        successAlert(result['message']);
        load_mailbox('sent');
      }
    });
    //Prevent the form from submitting, preventing page refresh
    return false;
  }
  // By default, load the inbox
  load_mailbox('inbox');
});

//Alert for errors when composing email
function showAlert(message){
  document.querySelector('#error-alert').innerHTML = message;
  document.querySelector('#error-alert').style.display = 'block'
  document.querySelector('#error-alert').style.animationPlayState = 'running';
  document.querySelector('#error-alert').addEventListener('animationend', () => {
  document.querySelector('#error-alert').style.display='none';
  });
}

//Alert for when archiving is successful
function archiveAlert(){
  console.log("Archive email")
  document.querySelector('#archive-alert').style.display = 'none'
  document.querySelector('#archive-alert').innerHTML = "Successfully archive email";
  document.querySelector('#archive-alert').style.display = 'block'
  document.querySelector('#archive-alert').style.animationPlayState = 'running';
  document.querySelector('#archive-alert').addEventListener('animationend', () => {
  document.querySelector('#archive-alert').style.display='none';
  });
}


//Alert for when unarchiving is successful
function unarchiveAlert(){
  console.log("Unarchive email")
  document.querySelector('#unarchive-alert').style.display = 'none'
  document.querySelector('#unarchive-alert').innerHTML = "Successfully unarchive email";
  document.querySelector('#unarchive-alert').style.display = 'block'
  document.querySelector('#unarchive-alert').style.animationPlayState = 'running';
  document.querySelector('#unarchive-alert').addEventListener('animationend', () => {
  document.querySelector('#unarchive-alert').style.display='none';
  });
}


//Alert for when sending email is successful
function successAlert(message){
  console.log("Email successfully sent")
  document.querySelector('#success-alert').innerHTML = message
  document.querySelector('#success-alert').style.display = 'block'
  document.querySelector('#success-alert').style.animationPlayState = 'running';
  document.querySelector('#success-alert').addEventListener('animationend', () => {
  document.querySelector('#success-alert').style.display='none';
  });
}


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  //Clear the detail-view div
  clearDetailEmailView()

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply_email(email){

  //Show form and hide detail email view
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  //Reply to email in Sent
  if (email["sender"] == email["user"]){
    document.querySelector('#compose-recipients').value = email["recipients"];
  }
  // Reply to email in Inbox
  else{
    document.querySelector('#compose-recipients').value = email["sender"];
  }

  const prefix = "Re: "
  //If email already has prefix, don't add
  if (email["subject"].includes(prefix)){
    document.querySelector('#compose-subject').value = email["subject"]
  }
  else{
    document.querySelector('#compose-subject').value = `${prefix}${email["subject"]}`
  }  

  //Create a horizontal line of 50 "-" and a line break
  const horizontal_line = Array(50).join("-") + "\n";

  //Add a prefix to the body
  const prefix_body = `\nOn ${email["timestamp"]} ${email["sender"]} wrote:\n`

  //Focus the cursor to the text area
  document.querySelector('#compose-body').focus()
  document.querySelector('#compose-body').value = "\n\n\n\n"+ horizontal_line+ prefix_body + email["body"]
  //Put the cursor at the start of the text area, or else it will be after the prefilled text
  document.querySelector('#compose-body').setSelectionRange(0,0);
}

//View each email in detail
function view_email(email_id,mailbox){
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email)
    //Show detail view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#detail-view').style.display = 'block';

    document.querySelector('#email-subject').innerHTML = `<h2>${email['subject']}</h2>`
    document.querySelector('#email-sender').innerHTML = `From: ${email['sender']}`
    let recipient_string = ""; 
    for (i = 0; i < email['recipients'].length; i++){
        recipient_string = recipient_string + email['recipients'][i] + ", "
    }
    document.querySelector('#email-recipients').innerHTML = `To: ${recipient_string}`
    document.querySelector('#email-timestamp').innerHTML = email['timestamp'];
    document.querySelector('#email-body').innerHTML = `<p> ${email["body"]} </p>`  

    //If the mailbox is not Sent, which will be Archive or Inbox
    if (!(mailbox == "sent")){
      //If email is archived, show unarchive button
      if (email["archived"]){
        console.log(email["archived"])
        document.querySelector('#archive-button').style.display = 'none';
        document.querySelector('#unarchive-button').style.display = 'block';
        document.querySelector('#unarchive-button').setAttribute("data-id",email['id']);
      }
      //If email is unarchived, show archive button
      else{
        console.log(email["archived"])
        document.querySelector('#unarchive-button').style.display = 'none';
        document.querySelector('#archive-button').style.display = 'block';
        document.querySelector('#archive-button').setAttribute("data-id",email['id']);
      }
    }
    //If mailbox is Sent, don't show archive buttons
    else{
      document.querySelector('#unarchive-button').style.display = 'none';
      document.querySelector('#archive-button').style.display = 'none';
    }

    //Attach event handler to #reply to pay attention to click and run function
    document.querySelector('#reply-button').addEventListener('click', function(){
      reply_email(email)
    });

  })

  //Mark an email as read/unread but sending a PUT request 
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

//Mark an email as archived, send a PUT request
function archiveEmail(email_id){
  fetch(`/emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({
      archived: true  
    })
  })
}

//Mark an email as unarchived, send a PUT request
function unarchiveEmail(email_id){
  fetch(`/emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
}

//Hide the detail-view
function clearDetailEmailView(){
  document.querySelector('#detail-view').style.display = 'none';
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //clear the email view
  clearDetailEmailView()

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  console.log(mailbox)

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    for (let i = 0; i < emails.length; i++){
      const email = emails[i];
      //Create a parent div, set class = "row", set id ="div-id"
      parent_element = document.createElement('div');
      const read_status = email["read"]
      parent_element.classList.add("row", `read-${read_status}`,"p-2", "mb-2");
      parent_element.setAttribute('id',`div-${email['id']}`); 
      
      //Create a div for sender, set class="col", set inner HTML
      child_element_sender = document.createElement('div');
      child_element_sender.innerHTML = email['sender'];
      child_element_sender.classList.add("col-lg-3", "col-12", "email-view-sender");

      //Create a div for subject, set class="col", set inner HTML
      child_element_subject = document.createElement('div');
      child_element_subject.innerHTML = email['subject'];
      child_element_subject.classList.add("col-md-6", "col-12","email-view-subject");

      //Create a div for title, set class="col", set inner HTML
      child_element_timestamp = document.createElement('div');
      child_element_timestamp.innerHTML = email['timestamp'];
      child_element_timestamp.classList.add("col-lg-3", "col-12","col-md-6", "email-view-timestamp");

      document.querySelector('#emails-view').append(parent_element);
      document.querySelector(`#div-${email['id']}`).append(child_element_sender);
      document.querySelector(`#div-${email['id']}`).append(child_element_subject);
      document.querySelector(`#div-${email['id']}`).append(child_element_timestamp);

      //Attach an event handler click to the parent element, load the email in detail when clicked.
      parent_element.addEventListener('click', function(){
        const email_id = email['id']
        view_email(email_id, mailbox)
      });

    }
  })
}