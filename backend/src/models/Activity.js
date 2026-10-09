import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // Ví dụ: 'CREATED_DOCUMENT', 'JOINED_WORKSPACE', 'SENT_MESSAGE'
  targetId: { type: mongoose.Schema.Types.ObjectId }, // ID của tài liệu hoặc tin nhắn (nếu có)
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
