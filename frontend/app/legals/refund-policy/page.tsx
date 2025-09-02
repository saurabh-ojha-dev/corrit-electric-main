"use client";

import React from "react";
import {
    ShieldCheck,
    Info,
    User2,
    CreditCard,
    Bike,
    Cpu,
    ListChecks,
    Lock,
    BadgeCheck,
    CheckCircle2,
    Mail,
    Phone,
    MapPin,
    Building2,
    Clock,
    Database,
    ShieldAlert,
    Headphones,
} from "lucide-react";
import LegalsHeader from "@/components/common/LegalsHeader";
import Image from "next/image";

/**
 * Drop this file at: app/privacy/page.tsx (Next.js App Router)
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
                    description="We protect your privacy and ensure secure handling of your personal information for bike rental services."
                    color="bg-[#2BB048]"
                />
            </div>

            <main className="min-h-screen bg-slate-50 py-10">
                <div className="mx-auto max-w-5xl px-4">
                    {/* Quick Summary */}
                    <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: '#2BB048' }}>
                                <Info className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="mb-1 text-base font-semibold text-slate-900">
                                    Quick Summary
                                </h2>
                                <p className="text-sm text-slate-700">
                                    We collect minimal information for bike rentals, use secure
                                    PhonePe payments, and never sell your data.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Information We Collect */}
                        <SectionCard title="Information We Collect" icon={ListChecks}>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <User2 className="h-4 w-4" style={{ color: '#2BB048' }} /> Personal
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>Name</li>
                                        <li>Email</li>
                                        <li>Phone number</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <CreditCard className="h-4 w-4" style={{ color: '#2BB048' }} /> Payment
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>UPI ID for automated payments</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Bike className="h-4 w-4" style={{ color: '#2BB048' }} /> Rental
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>Bike preferences</li>
                                        <li>Rental history</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Cpu className="h-4 w-4" style={{ color: '#2BB048' }} /> Technical
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li>IP address</li>
                                        <li>Browser type</li>
                                        <li>Website usage data</li>
                                    </ul>
                                </div>
                            </div>
                        </SectionCard>

                        {/* How We Use Your Information */}
                        <SectionCard title="How We Use Your Information" icon={ShieldCheck}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <BadgeCheck className="h-4 w-4" style={{ color: '#2BB048' }} /> Service
                                        Delivery
                                    </h3>
                                    <ol className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 inline-block h-5 w-5">
                                                <CheckCircle2 className="h-5 w-5" style={{ color: '#2BB048' }} />
                                            </span>
                                            Process bike rentals
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 inline-block h-5 w-5">
                                                <CheckCircle2 className="h-5 w-5" style={{ color: '#2BB048' }} />
                                            </span>
                                            Manage weekly payments
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 inline-block h-5 w-5">
                                                <CheckCircle2 className="h-5 w-5" style={{ color: '#2BB048' }} />
                                            </span>
                                            Send service notifications
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 inline-block h-5 w-5">
                                                <CheckCircle2 className="h-5 w-5" style={{ color: '#2BB048' }} />
                                            </span>
                                            Provide customer support
                                        </li>
                                    </ol>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <BadgeCheck className="h-4 w-4" style={{ color: '#2BB048' }} /> Business
                                        Operations
                                    </h3>
                                    <ol className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 inline-block h-5 w-5">
                                                <CheckCircle2 className="h-5 w-5" style={{ color: '#2BB048' }} />
                                            </span>
                                            Improve our services
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 inline-block h-5 w-5">
                                                <CheckCircle2 className="h-5 w-5" style={{ color: '#2BB048' }} />
                                            </span>
                                            Analyze usage patterns
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 inline-block h-5 w-5">
                                                <CheckCircle2 className="h-5 w-5" style={{ color: '#2BB048' }} />
                                            </span>
                                            Legal compliance
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 inline-block h-5 w-5">
                                                <CheckCircle2 className="h-5 w-5" style={{ color: '#2BB048' }} />
                                            </span>
                                            Fraud prevention
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Data Security */}
                        <SectionCard title="Data Security" icon={Lock}>
                            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Bullet icon={ShieldCheck}>Encrypted data transmission (SSL/TLS)</Bullet>
                                <Bullet icon={Database}>Secure database storage</Bullet>
                                <Bullet icon={CreditCard}>PhonePe secure payment processing</Bullet>
                                <Bullet icon={BadgeCheck}>Access controls</Bullet>
                                <Bullet icon={ShieldAlert}>Regular security audits</Bullet>
                                <Bullet icon={Headphones}>Employee training</Bullet>
                            </ul>
                        </SectionCard>

                        {/* Contact Information */}
                        <SectionCard title="Contact Information" icon={Building2}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {/* Branding + Company details */}
                                <div className="md:col-span-2">
                                    <div className="mb-4 flex items-center gap-3">
                                    <div className="bg-black rounded-xl p-2">
                                            <Image src="/corrit_electric_logo_white.svg" alt="Corrit Electric" width={80} height={48} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                Corrit Electric. PVT LTD
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                GST: 09AAQFCL4737M1ZZ
                                            </p>
                                        </div>
                                    </div>
                                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-slate-500">
                                                Office
                                            </dt>
                                            <dd className="text-sm text-slate-800">
                                                WeWork Berger Delhi One, C-001/A2
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs uppercase tracking-wide text-slate-500">
                                                Address
                                            </dt>
                                            <dd className="flex items-start gap-2 text-sm text-slate-800">
                                                <MapPin className="mt-0.5 h-4 w-4" style={{ color: '#2BB048' }} />
                                                Sector 168, Noida, Uttar Pradesh 201301
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
                                            <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
                                            <span>Ankitcorritelectric@gmail.com</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Phone
                                        </p>
                                        <p className="flex items-start gap-2 text-sm text-slate-800">
                                            <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
                                            <span>+91921173970</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Footer note */}
                    <p className="mt-8 text-center text-xs text-slate-500">
                        We respect your privacy. We do not sell your personal data.
                    </p>
                </div>
            </main>
        </>
    );
}
