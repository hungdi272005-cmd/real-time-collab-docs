import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  title: { type: String, required: true, default: 'Untitled Document' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

documentSchema.index({ workspaceId: 1, isDeleted: 1, updatedAt: -1 });

export default mongoose.model('Document', documentSchema);
