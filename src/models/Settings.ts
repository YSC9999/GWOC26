import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface ISettings extends Document {
    key: string;
    value: any;
    createdAt: Date;
    updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
    key: { type: String, required: true, unique: true }, // e.g., 'dailyRevenueTarget'
    value: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true });

const Settings = models.Settings || model<ISettings>('Settings', SettingsSchema);

export default Settings;
