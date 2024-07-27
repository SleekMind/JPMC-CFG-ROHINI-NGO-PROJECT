const express = require('express');
const Camp = require('../models/Camp');
const Admin = require('../models/Admin');
const User = require('../models/User');
const {authorizeRoles} = require('../middleware/authMiddleware');

exports.createCamp = async (req, res) => {
    try {
        const { camp_name, total_number_of_people, school_email, status } = req.body;

        // Create the camp
        const newCamp = new Camp({
            camp_name,
            total_number_of_people,
            school_email,
            status
        });

        // Save the camp
        await newCamp.save();

        // Find the school by email and add the camp ID to its list of camps
        const schoolUser = await User.findOne({ email: school_email });
        if (schoolUser && schoolUser.role === 'School') {
            await School.findByIdAndUpdate(schoolUser.school_data, {
                $push: { camp_ids: newCamp._id }
            });
        }

        // Update Admin model
        const admin = await Admin.findOne(); // You might need to refine this if you have multiple admins
        if (admin) {
            admin.camp_data_not_started.push(newCamp._id);
            await admin.save();
        }

        res.status(201).json({ message: 'Camp created successfully', camp: newCamp });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


exports.getCampById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the camp
        const camp = await Camp.findById(id)
            .populate('people_treated_info.beneficiary_id')
            .populate('people_treated_info.doctor_id');
        if (!camp) return res.status(404).json({ message: 'Camp not found' });

        res.status(200).json({ camp });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getAllCamps = async (req, res) => {
    try {
        const camps = await Camp.find()
            .populate('people_treated_info.beneficiary_id')
            .populate('people_treated_info.doctor_id');
        res.status(200).json({ camps });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}