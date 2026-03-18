"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ReportSchema = new mongoose_1.Schema({
    reporterId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: { type: String, enum: ['listing', 'owner', 'user'], required: true },
    targetId: { type: String, required: true },
    description: { type: String, required: true, minlength: 10, maxlength: 500 },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Report', ReportSchema);
