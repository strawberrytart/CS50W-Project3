document.addEventListener('DOMContentLoaded', function() {

  //Hide the alert divs
  document.querySelector('#error-alert').style.display = 'none';
  document.querySelector('#archive-alert').style.display = 'none';
  document.querySelector('#unarchive-alert').style.display = 'none';
  document.querySelector('#success-alert').style.display='none';

  // Use buttons to toggle between views
  //Get the element based on the id and pay attention for 'click' and run function load_mailbox
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

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

    //Show detail view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#detail-view').style.display = 'block';

    //Create a container for the email. add necessary classes and id, and append it to the #detail-view div
    const email_div = document.createElement('div');
    email_div.classList.add("container");
    email_div.setAttribute('id','email_div'); 
    document.querySelector('#detail-view').append(email_div)

    //Create a div for the email subject, add classes, set the inner HTML and append it to the email container
    const row_subject = document.createElement('div')
    row_subject.classList.add("row");
    row_subject.innerHTML = `<h2>${email['subject']}</h2>`
    document.querySelector('#email_div').append(row_subject)

    //Create a div for the sender, add classes, set inner HTML and append it to the email container
    const row_sender = document.createElement('div')
    row_sender.classList.add("row");
    row_sender.innerHTML = `From: ${email['sender']}`
    document.querySelector('#email_div').append(row_sender)

    //Create a row for the recipient and time stamp
    const row_container = document.createElement('div')
    row_container.classList.add("row")
    row_container.setAttribute('id', 'row_container')
    document.querySelector('#email_div').append(row_container)

    //Create div for recipient
    const row_recipients = document.createElement('div')
    row_recipients.classList.add("col-6", "pl-0")
    let recipient_string = ""; 
    for (i = 0; i < email['recipients'].length; i++){
        recipient_string = recipient_string + email['recipients'][i] + ", "
    }
    row_recipients.innerHTML = `To: ${recipient_string}`
    document.querySelector('#row_container').append(row_recipients)

    //Create div for timestamp
    const row_timestamp = document.createElement('div');
    row_timestamp.classList.add("col-6", "text-right");
    row_timestamp.innerHTML = email['timestamp'];
    document.querySelector('#row_container').append(row_timestamp)

    //Create a div for the email body and append it to the email container
    const row_body = document.createElement('div');
    row_body.setAttribute("id","email-body");
    row_body.classList.add("row", "py-5")
    row_body.innerHTML = `<p> ${email["body"]} </p>`  
    document.querySelector('#email_div').append(row_body)

    //Create a container for the buttons
    const row_button = document.createElement('div');
    row_button.classList.add("row")
    document.querySelector('#email_div').append(row_button)

    //If the mailbox is not sent, which will be archive or inbox
    if (!(mailbox == "sent")){
      //If email is archived, show unarchive button
      if (email["archived"]){
        console.log(email["archived"])
        const unarchive_button = document.createElement('button');
        unarchive_button.classList.add("btn", "btn-danger","mr-3")
        unarchive_button.innerHTML = "Unarchive"
        row_button.append(unarchive_button)
        unarchive_button.addEventListener('click', function(){
          const email_id = email['id']
          unarchiveEmail(email_id)
          setTimeout(function(){
            load_mailbox('inbox');
          }, 50);
          unarchiveAlert();
        })
  
      }
      //If email is unarchived, show archive button
      else{
        console.log(email["archived"])
        const archive_button = document.createElement('button');
        archive_button.classList.add("btn", "btn-danger", "mr-3")
        archive_button.innerHTML = "Archive"
        row_button.append(archive_button)
        archive_button.addEventListener('click', function(){
          const email_id = email['id']
          archiveEmail(email_id)
          setTimeout(function(){
            load_mailbox('inbox');
          }, 50);
          archiveAlert();
        })
      }
    }

    //Create a reply button
    const reply_button = document.createElement('button');
    reply_button.classList.add("btn", "btn-primary")
    reply_button.innerHTML = "Reply"
    row_button.append(reply_button);
    reply_button.addEventListener('click', function(){
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

//
function clearDetailEmailView(){
  document.querySelector('#detail-view').innerHTML = "";
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
      child_element_sender.classList.add("col-3");

      //Create a div for subject, set class="col", set inner HTML
      child_element_subject = document.createElement('div');
      child_element_subject.innerHTML = email['subject'];
      child_element_subject.classList.add("col-6");

      //Create a div for title, set class="col", set inner HTML
      child_element_timestamp = document.createElement('div');
      child_element_timestamp.innerHTML = email['timestamp'];
      child_element_timestamp.classList.add("col-3");

      document.querySelector('#emails-view').append(parent_element);
      document.querySelector(`#div-${email['id']}`).append(child_element_sender);
      document.querySelector(`#div-${email['id']}`).append(child_element_subject);
      document.querySelector(`#div-${email['id']}`).append(child_element_timestamp);

      parent_element.addEventListener('click', function(){
        const email_id = email['id']
        view_email(email_id, mailbox)
      });

    }
  })
}