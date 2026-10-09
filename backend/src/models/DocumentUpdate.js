import mongoose from 'mongoose';

const documentUpdateSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  updateData: { type: Buffer, required: true }, // Yjs updates are binary data
}, { timestamps: true });

export default mongoose.model('DocumentUpdate', documentUpdateSchema);
