"use client";
import React, { useState, useEffect } from "react";
import { Loader2, MapPin } from "lucide-react";
import { INDIAN_STATES } from "@/lib/indian-states";

interface SmartAddressFormProps {
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    disabled?: boolean;
}

import { SearchableSelect } from "@/components/SearchableSelect";

interface SmartAddressFormProps {
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    disabled?: boolean;
    phoneSuffix?: React.ReactNode;
    showGst?: boolean;
}

export default function SmartAddressForm({ formData, onChange, disabled = false, phoneSuffix, showGst = true }: SmartAddressFormProps) {
    const [loadingPincode, setLoadingPincode] = useState(false);
    const [pincodeError, setPincodeError] = useState("");

    // Derive available districts directly from state
    const availableDistricts = formData.state && INDIAN_STATES[formData.state as keyof typeof INDIAN_STATES]
        ? INDIAN_STATES[formData.state as keyof typeof INDIAN_STATES]
        : [];

    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Only numbers, max 6

        // Call parent onChange to update state with raw value first
        const syntheticEvent = {
            ...e,
            target: { ...e.target, name: 'pincode', value }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);

        if (value.length === 6) {
            setLoadingPincode(true);
            setPincodeError("");
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
                const data = await res.json();

                if (data && data[0] && data[0].Status === "Success") {
                    const postOffice = data[0].PostOffice[0];
                    const state = postOffice.State; // "Andhra Pradesh"
                    const district = postOffice.District; // "Srikakulam"

                    // Auto-fill State
                    // Check if state matches our list (API sometimes capitalizes differently)
                    const matchedState = Object.keys(INDIAN_STATES).find(s => s.toLowerCase() === state.toLowerCase());

                    if (matchedState) {
                        // Update State
                        // We need to trigger this change. Since we fixed the parent handleInputChange to be functional,
                        // calling these sequentially should work fine now.
                        onChange({
                            target: { name: 'state', value: matchedState }
                        } as any);

                        // Update District (mapped to city)
                        // Verify if district exists in our list for safety, but trust the API mostly.
                        // Ideally we should use the district from the list that matches casing.
                        const stateDistricts = INDIAN_STATES[matchedState];
                        const matchedDistrict = stateDistricts.find(d => d.toLowerCase() === district.toLowerCase()) || district;

                        onChange({
                            target: { name: 'city', value: matchedDistrict }
                        } as any);
                    }
                } else {
                    setPincodeError("Invalid Pincode");
                }
            } catch (err) {
                setPincodeError("Failed to lookup pincode");
            } finally {
                setLoadingPincode(false);
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-soil/60 uppercase mb-1">Full Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        disabled={disabled}
                        className="w-full px-4 py-2 border rounded-xl border-soil/20 focus:outline-none focus:border-clay bg-white/80 backdrop-blur-sm shadow-sm transition-all"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-soil/60 uppercase mb-1">Phone Number</label>
                    <div className="flex gap-2">
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={onChange}
                            disabled={disabled}
                            maxLength={10}
                            className="w-full px-4 py-2 border rounded-xl border-soil/20 focus:outline-none focus:border-clay bg-white/80 backdrop-blur-sm shadow-sm transition-all"
                            placeholder="9876543210"
                        />
                        {phoneSuffix}
                    </div>
                </div>
            </div>

            {/* Pincode & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-xs font-bold text-soil/60 uppercase mb-1">Pincode</label>
                    <div className="relative">
                        <input
                            name="pincode"
                            value={formData.pincode}
                            onChange={handlePincodeChange}
                            disabled={disabled}
                            className={`w-full px-4 py-2 border rounded-xl focus:outline-none bg-white/80 backdrop-blur-sm shadow-sm transition-all ${pincodeError ? 'border-red-400' : 'border-soil/20 focus:border-clay'}`}
                            placeholder="560001"
                        />
                        {loadingPincode && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 size={16} className="animate-spin text-clay" />
                            </div>
                        )}
                    </div>
                    {pincodeError && <p className="text-[10px] text-red-500 mt-1">{pincodeError}</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-soil/60 uppercase mb-1">State</label>
                    <SearchableSelect
                        options={Object.keys(INDIAN_STATES)}
                        value={formData.state}
                        onChange={(val) => onChange({ target: { name: 'state', value: val } } as any)}
                        disabled={disabled}
                        placeholder="Select State"
                    />
                </div>
            </div>

            {/* District (City) & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-soil/60 uppercase mb-1">District / City</label>
                    {availableDistricts.length > 0 ? (
                        <SearchableSelect
                            options={availableDistricts}
                            value={formData.city}
                            onChange={(val) => onChange({ target: { name: 'city', value: val } } as any)}
                            disabled={disabled}
                            placeholder="Select District"
                        />
                    ) : (
                        <input
                            name="city"
                            value={formData.city}
                            onChange={onChange}
                            disabled={disabled}
                            className="w-full px-4 py-2 border rounded-xl border-soil/20 focus:outline-none focus:border-clay bg-white/80 backdrop-blur-sm shadow-sm transition-all"
                            placeholder="City/District"
                        />
                    )}
                </div>
                <div>
                    <label className="block text-xs font-bold text-soil/60 uppercase mb-1">Country</label>
                    <input
                        name="country"
                        value={formData.country}
                        disabled
                        className="w-full px-4 py-2 border rounded-xl border-soil/10 bg-black/5 text-soil/50 cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Street Address */}
            <div>
                <label className="block text-xs font-bold text-soil/60 uppercase mb-1">Street Address</label>
                <input
                    name="street"
                    value={formData.street}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full px-4 py-2 border rounded-xl border-soil/20 focus:outline-none focus:border-clay bg-white/80 backdrop-blur-sm shadow-sm transition-all"
                    placeholder="House No, Building, Street Area"
                />
            </div>

            {/* GST Number */}
            {showGst && (
                <div>
                    <label className="block text-xs font-bold text-soil/60 uppercase mb-1">GST Number (Optional)</label>
                    <input
                        name="gstNumber"
                        value={formData.gstNumber || ""}
                        onChange={onChange}
                        disabled={disabled}
                        className="w-full px-4 py-2 border rounded-xl border-soil/20 focus:outline-none focus:border-clay bg-white/80 backdrop-blur-sm shadow-sm transition-all"
                        placeholder="GSTIN"
                    />
                </div>
            )}

        </div>
    );
}
