import { useState } from "react";

function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function toISODate(date) {
    if (!(date instanceof Date)) date = new Date(date);
    return date.toISOString();
}

export default function CreateMemberForm() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        email: "",
        phone: "",
        role: ""
    });
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    function getDefaultPassword(username, phone) {
        const last4 = phone.replace(/\D/g, "").slice(-4);
        if (!username || last4.length < 4) return "";
        const namePart = username.charAt(0).toUpperCase() + username.slice(1);
        return `${namePart}@${last4}`;
    }

    function handleChange(field, value) {
        setForm(prev => {
            let newForm = { ...prev, [field]: value };
            if (field === "username" || field === "phone") {
                newForm.password = getDefaultPassword(
                    field === "username" ? value : prev.username,
                    field === "phone" ? value : prev.phone
                );
            }
            return newForm;
        });
        setTouched(prev => ({ ...prev, [field]: true }));
        setApiError("");
    }

    function isValid(field) {
        if (field === "username") return form.username.length >= 3;
        if (field === "password") return form.password.length >= 6;
        if (field === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        if (field === "phone") return /^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ""));
        if (field === "role") return !!form.role;
        return true;
    }

    function isFormValid() {
        return (
            isValid("username") &&
            isValid("password") &&
            isValid("email") &&
            isValid("phone") &&
            isValid("role")
        );
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setApiError("");
        if (!isFormValid()) {
            setTouched({
                username: true,
                password: true,
                email: true,
                phone: true,
                role: true
            });
            return;
        }
        setLoading(true);

        try {
            const signupRes = await fetch(
                `${import.meta.env.VITE_BACKEND_SERVER}/auth/signup`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: form.email,
                        password: form.password,
                        username: form.username,
                        phone_number: "+91" + form.phone.replace(/\D/g, ""),
                        status: true
                    })
                }
            );
            const signupJson = await signupRes.json();

            if (!signupRes.ok || !signupJson.uid) {
                throw new Error(signupJson.message || signupJson.error || "Registration failed");
            }

            const now = new Date();
            const renewal = addMonths(now, 6);

            const membershipRes = await fetch(
                `${import.meta.env.VITE_BACKEND_SERVER}/chapter/membership/createmembership`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        password: form.password,
                        username: form.username,
                        role: form.role,
                        membership_status: true,
                        join_date: toISODate(now),
                        renewal_date: toISODate(renewal)
                    })
                }
            );
            const membershipJson = await membershipRes.json();

            const payload = {
                receiver: form.username,
                header: "👋 Welcome to SIB Platform",
                content: `Hello and welcome to the Sengunthar In Business family! Your account has been created successfully. You can now log in to access all features and participate in chapter activities. If you have any questions or need assistance, feel free to reach out to support.`
            };

            await fetch(
                `${import.meta.env.VITE_BACKEND_SERVER}/notification/createnotificationwithoutsender`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            if (!membershipRes.ok) {
                throw new Error(membershipJson.message || membershipJson.error || "Membership creation failed");
            }
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);
            setForm({
                username: "",
                password: "",
                email: "",
                phone: "",
                role: ""
            });
            setTouched({});
        } catch (err) {
            setApiError(err.message || "Unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-full mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-1 text-gray-900 dark:text-gray-50">
                    Create New Member
                </h1>
                <div className="text-center text-gray-600 dark:text-gray-300 text-sm mb-6">
                    Fill in the details to register a new member
                </div>

                <div className="mb-3">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        Username <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full rounded-lg border p-2.5 text-gray-800 dark:text-white dark:bg-gray-800 focus:outline-none transition-all duration-200
                        ${touched.username ? (isValid("username") ? "border-green-400" : "border-red-400") : "border-gray-300 dark:border-gray-700"}
                        `}
                        type="text"
                        autoFocus
                        autoComplete="off"
                        value={form.username}
                        onChange={e => handleChange("username", e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="mb-3">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full rounded-lg border p-2.5 text-gray-800 dark:text-white dark:bg-gray-800 focus:outline-none transition-all duration-200
                        ${touched.email ? (isValid("email") ? "border-green-400" : "border-red-400") : "border-gray-300 dark:border-gray-700"}
                    `}
                        type="email"
                        value={form.email}
                        onChange={e => handleChange("email", e.target.value)}
                        placeholder="example@email.com"
                        disabled={loading}
                    />
                </div>

                <div className="mb-3">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full rounded-lg border p-2.5 text-gray-800 dark:text-white dark:bg-gray-800 focus:outline-none transition-all duration-200
                        ${touched.phone ? (isValid("phone") ? "border-green-400" : "border-red-400") : "border-gray-300 dark:border-gray-700"}
                    `}
                        type="text"
                        maxLength={14}
                        placeholder="9234567890"
                        value={form.phone}
                        onChange={e => handleChange("phone", e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="mb-6">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        className={`w-full rounded-lg border p-2.5 text-gray-800 dark:text-white dark:bg-gray-800 focus:outline-none transition-all duration-200 cursor-pointer
                        ${touched.role ? (isValid("role") ? "border-green-400" : "border-red-400") : "border-gray-300 dark:border-gray-700"}
                    `}
                        value={form.role}
                        onChange={e => handleChange("role", e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Select a role</option>
                        <option value="member">Member</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="president">President</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full rounded-lg border p-2.5 text-gray-800 dark:text-white dark:bg-gray-800 focus:outline-none transition-all duration-200
                        ${touched.password ? (isValid("password") ? "border-green-400" : "border-red-400") : "border-gray-300 dark:border-gray-700"}
                    `}
                        type="text"
                        value={form.password}
                        onChange={e => handleChange("password", e.target.value)}
                        placeholder="Password"
                        readOnly
                        disabled
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-1">
                        Auto-generated: Name@[last4digits of phone]
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-lg transition-colors border border-amber-300 dark:bg-amber-300 dark:hover:bg-amber-400 dark:text-gray-900 dark:border-amber-500 shadow-sm disabled:bg-gray-200 disabled:text-gray-400"
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Member"}
                </button>
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    All fields are required
                </div>
                <div className="text-md text-center text-gray-200 dark:text-gray-400 mt-4">
                    Note*: User credentials will be sent to the user by the system.
                </div>
                {apiError && (
                    <div className="mt-4 text-center text-red-600 dark:text-red-400 font-semibold whitespace-pre-wrap">
                        {apiError}
                    </div>
                )}
                {showSuccess && (
                    <div className="mt-4 text-green-600 dark:text-green-400 text-center font-semibold">
                        Member created successfully!
                    </div>
                )}
            </form>
        </div>
    );
}
