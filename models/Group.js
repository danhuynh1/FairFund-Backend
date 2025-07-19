const mongoose = require('mongoose');

const budgetPlanSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true
    },
    limit: {
        type: Number,
        required: true,
        min: 0
    }
});

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    budget: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    budgetPlans: [budgetPlanSchema]
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
