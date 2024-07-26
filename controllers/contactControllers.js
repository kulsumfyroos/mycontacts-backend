const asyncHandler = require("express-async-handler");

//@desc Get all contacts
//@route GET /api/contacts
//@access public

const getContacts = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "get all contacts" });
});

//@desc Create a new contact
//@route POST /api/contacts
//@access public

const createContact =asyncHandler(async (req, res) => {
    console.log("the request body is:",req.body);
    const { name,email,phone}=req.body;
    if(!name || !email ||!phone) {
        res.status(400);
        throw new Error("All fields are mandatory !");
    }
    res.status(201).json({ message: "create contact" });
});

//@desc Get a contact by ID
//@route GET /api/contacts/:id
//@access public

const getContact = asyncHandler(async (req, res) => {
    res.status(200).json({ message: `get contact for ${req.params.id}` });
});

//@desc Update a contact by ID
//@route PUT /api/contacts/:id
//@access public

const updateContact =asyncHandler(async (req, res) => {
    console.log("The request body is:", req.body);
    res.status(200).json({ message: `update contact for ${req.params.id}` });
});

//@desc Delete a contact by ID
//@route DELETE /api/contacts/:id
//@access public

const deleteContact =asyncHandler(async (req, res) => {
    res.status(200).json({ message: `delete contact for ${req.params.id}` });
});

module.exports = { getContacts, createContact, getContact, updateContact, deleteContact };
