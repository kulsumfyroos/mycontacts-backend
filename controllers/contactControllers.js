const asyncHandler = require("express-async-handler")
const Contact = require("../models/contactModel");
const express = require("express");
const app = express();
app.use(express.json());

const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({userid: req.user.id});
        res.send(contacts);
    })

    
    const createContact = asyncHandler(async (req, res) => {        
        console.log("contactsrouteinnnn");
        console.log("The request body is : ", req.body);
        const id = req.user._id;
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) {
            res.status(400).json({ error: "All fields are mandatory" }); // Send a JSON response with the error message
        } else {
            console.log("creating try");
            console.log(req.user._id);
            try {
                const contact = await Contact.create({
                    name,
                    email,
                    phone,
                    userid: req.user._id
                });
                res.redirect('/view-contact');
                //res.status(201).json({ success: true, data: contact }); // Send a JSON response indicating success and the created contact
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Server error" }); // Handle any server error that occurs during contact creation
            }
        }
    });

const getContact = asyncHandler(async (req, res) => {

    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
    }
    
    res.status(200).json(contact);
})

const editContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404).send('Contact not found');
        return;
    }

    res.render('editContacts.ejs', { contact });
})

const updateContact = asyncHandler(async (req, res) => {
    console.log(req.body);
    const contact = await Contact.findById(req.params.id);
    if(!contact){
        res.status(404);
        throw new Error("Contact not found");
    }

    console.log(contact.userid.toString());
    console.log(req.user._id);

    if(contact.userid.toString()!== req.user._id){
        res.status(403);
        throw new Error("User do not have the permission to update other user contacts");
    }

    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new : true}
    );
    // res.status(200).json(updatedContact);
    res.redirect('/view-contact');
})

const deleteContact = asyncHandler(async (req, res) => {
    console.log(req.body.contactId);

    // Find the contact by its ID
    const contact = await Contact.findById(req.body.contactId);

    if (!contact) {
        res.status(404);
        throw new Error("Contact not found");
    }

    if (contact.userid.toString() !== req.user._id) {
        res.status(403);
        throw new Error("User does not have the permission to delete other user contacts");
    }

    // Use the contact ID for deletion
    await Contact.findByIdAndDelete(req.body.contactId);

    //res.status(200).json(contact);
    res.redirect('/view-contact');
});


module.exports = {
    getContacts,
    updateContact,
    getContact,
    createContact,
    deleteContact,
    editContact
};