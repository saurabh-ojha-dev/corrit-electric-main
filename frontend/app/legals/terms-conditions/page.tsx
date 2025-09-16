"use client";

import React from "react";
import {
    ShieldCheck,
    Bike,
    Receipt,
    Headphones,
    CheckCircle2,
    Mail,
    Phone,
    MapPin,
    Building2,
    Clock,
    AlertTriangle,
    Calendar,
    MapPin as LocationIcon,
    UserCheck,
    CreditCard,
    CreditCard as PaymentIcon,
    Settings,
    AlertCircle,
    XCircle,
    DollarSign,
} from "lucide-react";
import LegalsHeader from "@/components/common/LegalsHeader";
import Image from "next/image";

/**
 * Terms and Conditions page for bike rental services
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
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
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
                <Icon className="h-5 w-5 text-yellow-600" />
            </span>
            <span className="leading-relaxed text-slate-700">{children}</span>
        </li>
    );
}

export default function TermsConditionsPage() {
    return (
        <>
            <div className="w-full bg-slate-50 p-4">
                <LegalsHeader
                    title="Terms and Conditions"
                    description="Please read these terms carefully before using our bike rental services."
                    color="bg-[#F4CA0D]"
                />
            </div>
            <main className="min-h-screen bg-slate-50 py-10">
                <div className="mx-auto max-w-5xl px-4">
                    {/* Title */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Terms & Conditions
                        </h1>
                        <Badge label="Last updated: 7/22/2025" />
                    </div>

                    {/* Important Notice */}
                    <div className="mb-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-yellow-600 shadow-sm">
                                <AlertTriangle className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="mb-1 text-base font-semibold text-slate-900">
                                    Important
                                </h2>
                                <p className="text-sm text-slate-700">
                                    By using our services, you agree to these Terms and Conditions.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Service Description */}
                        <SectionCard title="Service Description" icon={Bike}>
                            <ul className="space-y-3">
                                <Bullet icon={Calendar}>Weekly bike rental with automated payment collection</Bullet>
                                <Bullet icon={PaymentIcon}>UPI-based payment processing through PhonePe AutoPay</Bullet>
                                <Bullet icon={Settings}>Online booking and management platform</Bullet>
                                <Bullet icon={Headphones}>Customer support and maintenance services</Bullet>
                                <Bullet icon={LocationIcon}>Currently serving customers in Noida, India and surrounding areas</Bullet>
                            </ul>
                        </SectionCard>

                        {/* Eligibility & Account Requirements */}
                        <SectionCard title="Eligibility & Account Requirements" icon={UserCheck}>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold text-slate-900">Requirements</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Must be 18+ years old</li>
                                        <li>• Valid government ID</li>
                                        <li>• Valid UPI ID</li>
                                        <li>• Accurate information</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold text-slate-900">Responsibilities</h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Keep account secure</li>
                                        <li>• Report unauthorized access</li>
                                        <li>• Update contact information</li>
                                        <li>• Use service lawfully</li>
                                    </ul>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Rental Terms */}
                        <SectionCard title="Rental Terms" icon={Receipt}>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Calendar className="h-4 w-4 text-yellow-600" /> Payment Schedule
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Weekly payments collected every Monday automatically</li>
                                        <li>• 24-hour notification before payment execution</li>
                                        <li>• Service suspension for non-payment after 7 days</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Allowed & Prohibited Uses */}
                            <div className="mb-4 flex items-center gap-2 mt-24">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </span>
                                <h2 className="text-lg font-semibold text-slate-900">Allowed & Prohibited Uses</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" /> Allowed Uses
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Personal transportation</li>
                                        <li>• Recreational riding</li>
                                        <li>• Commuting</li>
                                        <li>• Exercise</li>
                                    </ul>
                                </div>
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <XCircle className="h-4 w-4 text-red-600" /> Prohibited
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>• Commercial delivery</li>
                                        <li>• Racing or stunts</li>
                                        <li>• Subletting to others</li>
                                        <li>• Unauthorized modifications</li>
                                    </ul>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Payment Policy */}
                        <SectionCard title="Payment Policy" icon={PaymentIcon}>
                            <div className="space-y-4">
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <DollarSign className="h-4 w-4 text-yellow-600" /> 1. Mandate Range
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                        The payment mandate shall be set between ₹100 to ₹500, depending on the agreed terms.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Calendar className="h-4 w-4 text-yellow-600" /> 2. Collection Frequency
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                        The frequency of collection shall be flexible and determined as per the rider's feasibility (e.g., daily, weekly, or monthly).
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <CreditCard className="h-4 w-4 text-yellow-600" /> 3. Payment Mode
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                        Collections shall be made through the approved digital or offline channels as mutually agreed.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" /> 4. Default & Recovery
                                    </h3>
                                    <p className="text-sm text-slate-700">
                                        In case of delayed or missed payments, applicable measures will be initiated as per the standard recovery policy.
                                    </p>
                                </div>
                            </div>
                        </SectionCard>


                        {/* Liability */}
                        <SectionCard title="Liability" icon={AlertCircle}>
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <p className="text-sm font-semibold text-slate-900">
                                        Important: Renters are responsible for their safety and any damages during rental.
                                    </p>
                                </div>
                                <ul className="space-y-2 text-sm">
                                    <li>• We are not liable for personal injuries or accidents</li>
                                    <li>• Renters assume full responsibility for bike usage</li>
                                    <li>• Report theft or damage within 24 hours</li>
                                    <li>• Follow all traffic laws and safety regulations</li>
                                </ul>
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
                        By using our services, you agree to these Terms and Conditions.
                    </p>
                </div>
            </main>
        </>
    );
}
