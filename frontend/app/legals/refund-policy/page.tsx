"use client";

import React from "react";
import {
    ShieldCheck,
    Info,
    CreditCard,
    Bike,
    CheckCircle2,
    Mail,
    Phone,
    MapPin,
    Building2,
    Clock,
    XCircle,
    AlertTriangle,
    Clock3,
    FileText,
    Send,
    Calendar,
    DollarSign,
    UserCheck,
    AlertCircle,
} from "lucide-react";
import LegalsHeader from "@/components/common/LegalsHeader";
import Image from "next/image";

/**
 * Refund Policy page for bike rental services
 * Tailwind CSS is assumed to be configured. No extra UI libs required.
 */

const SectionCard = ({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-50" style={{ color: '#2BB048' }}>
                <Icon className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="text-slate-700">{children}</div>
    </section>
);

const Badge = ({ label }: { label: string }) => (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
        {label}
    </span>
);

function Bullet({
    children,
    icon: Icon,
}: {
    children: React.ReactNode;
    icon: React.ElementType;
}) {
    return (
        <li className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
                <Icon className="h-5 w-5" style={{ color: '#2BB048' }} />
            </span>
            <span className="leading-relaxed text-slate-700">{children}</span>
        </li>
    );
}

export default function RefundPolicyPage() {
    return (
        <>
            <div className="w-full bg-slate-50 p-4">
                <LegalsHeader
                    title="Refund Policy"
                    description="Fair and transparent refund terms for our bike rental services."
                    color="bg-[#2BB048]"
                />
            </div>

            <main className="min-h-screen bg-slate-50 py-10">
                <div className="mx-auto max-w-5xl px-4">
                    {/* Title */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Refund Policy
                        </h1>
                        <Badge label="Last updated: 7/22/2025" />
                    </div>

                    {/* Our Commitment */}
                    <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: '#2BB048' }}>
                                <ShieldCheck className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="mb-1 text-base font-semibold text-slate-900">
                                    Our Commitment
                                </h2>
                                <p className="text-sm text-slate-700">
                                    Eligible refunds processed within 3-5 business days to your original payment method.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Refund Eligibility */}
                        <SectionCard title="Refund Eligibility" icon={DollarSign}>
                            <div className="space-y-4">
                                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" /> Full Refund Eligible
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Cancellation within 24 hours of setup</li>
                                        <li>• Bike unavailable due to maintenance</li>
                                        <li>• Service disruption due to company fault</li>
                                        <li>• Duplicate or erroneous charges</li>
                                    </ul>
                                </div>

                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" /> Partial Refund
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Cancellation after 24 hours but within 7 days (pro-rated)</li>
                                        <li>• Early termination by customer (unused period)</li>
                                    </ul>
                                </div>

                                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <XCircle className="h-4 w-4 text-red-600" /> No Refund
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Change of mind after using service</li>
                                        <li>• Damage due to user negligence</li>
                                        <li>• Violation of terms</li>
                                        <li>• Service used for more than 7 days</li>
                                    </ul>
                                </div>
                            </div>
                        </SectionCard>
                        {/* Payment Policy */}
                        <SectionCard title="Payment Policy" icon={CreditCard}>
                            <div className="space-y-4">
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <DollarSign className="h-4 w-4" style={{ color: '#2BB048' }} /> 1. Mandate Range
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                        The payment mandate shall be set between ₹100 to ₹500, depending on the agreed terms.
                                    </p>
                                </div>
                                
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Calendar className="h-4 w-4" style={{ color: '#2BB048' }} /> 2. Collection Frequency
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                        The frequency of collection shall be flexible and determined as per the rider's feasibility (e.g., daily, weekly, or monthly).
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <CreditCard className="h-4 w-4" style={{ color: '#2BB048' }} /> 3. Payment Mode
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                        Collections shall be made through the approved digital or offline channels as mutually agreed.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <AlertTriangle className="h-4 w-4" style={{ color: '#2BB048' }} /> 4. Default & Recovery
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                        In case of delayed or missed payments, applicable measures will be initiated as per the standard recovery policy.
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Refund Process */}
                        <SectionCard title="Refund Process" icon={FileText}>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Send className="h-4 w-4" style={{ color: '#2BB048' }} /> How to Request
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Contact support with transaction details</li>
                                        <li>• Provide reason for refund request</li>
                                        <li>• Submit supporting documents if needed</li>
                                        <li>• Wait for review and processing</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Clock3 className="h-4 w-4" style={{ color: '#2BB048' }} /> Processing Time
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                                            <span className="text-sm font-medium text-slate-700">Review</span>
                                            <span className="text-sm text-slate-600">1-2 days</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                                            <span className="text-sm font-medium text-slate-700">Processing</span>
                                            <span className="text-sm text-slate-600">3-5 days</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                                            <span className="text-sm font-medium text-slate-700">Bank Credit</span>
                                            <span className="text-sm text-slate-600">5-7 days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        

                        {/* Contact Information */}
                        <SectionCard title="Contact Information" icon={Building2}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {/* Branding + Company details */}
                                <div className="md:col-span-2">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="bg-black rounded-xl p-2">
                                            <Image src="/corrit_electric_logo_white.svg" alt="corrit-electric" width={80} height={48} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                CORRIT ELECTRIC PRIVATE LIMITED
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                GST NO: 09AAICC6192J1Z6
                                            </p>
                                        </div>
                                    </div>
                                    <dl className="flex flex-row gap-3">                                    
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-slate-500">
                                                Address
                                            </dt>
                                            <dd className="flex items-start gap-2 text-sm text-slate-800">
                                                <MapPin className="mt-0.5 h-4 w-4" style={{ color: '#2BB048' }} />
                                                Plot no 117 , block B Udyog Kendra 2 , Ecotech 3, Greater noida, Uttar Pradesh 201306
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Hours */}
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4" style={{ color: '#2BB048' }} />
                                        <p className="text-sm font-semibold text-slate-900">
                                            Working Hours
                                        </p>
                                    </div>
                                    <p className="text-sm text-slate-700">
                                        Mon–Fri: <span className="font-medium">9:00 AM – 6:00 PM</span>
                                    </p>
                                </div>

                                <div className="flex flex-row gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Email
                                        </p>
                                        <p className="flex items-start gap-2 text-sm text-slate-800">
                                            <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#2BB048' }} />
                                            <span>Rishabh.sharma@corrirelectric.com</span>
                                        </p>
                                    </div>
                                    {/* <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Phone
                                        </p>
                                        <p className="flex items-start gap-2 text-sm text-slate-800">
                                            <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
                                            <span>+919211739780</span>
                                        </p>
                                    </div> */}
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Footer note */}
                    <p className="mt-8 text-center text-xs text-slate-500">
                        For refund requests, contact our support team with your transaction details.
                    </p>
                </div>
            </main>
        </>
    );
}
