"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function CustomerProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    client_card: "",
    email: "",
    phone: "",
    password: "",
  });

  const fetchCustomerData = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();

      if (res.ok) {
        setCustomer(data.customer);
        setAccounts(data.accounts);

        setFormData({
          name: data.customer?.name || "",
          client_card: data.customer?.client_card || "",
          email: data.customer?.email || "",
          phone: data.customer?.phone || "",
          password: "", // always reset
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load customer");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!confirm("⚠️ You are editing sensitive customer data. Continue?"))
      return;

    try {
      const payload = {
        id,
        name: formData.name,
        client_card: formData.client_card,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch("/api/admin/customers/update", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Customer updated successfully");

        setIsEditing(false);

        // ✅ Clear password state AFTER save
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));

        setShowPassword(false);

        fetchCustomerData();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleDeleteAccount = async (accountId) => {
    const confirmed = confirm(
      "⚠️ Delete this account?\n\nThis will permanently remove the account and all its transactions.",
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/accounts/${accountId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Account deleted successfully");

        // refresh accounts list
        fetchCustomerData();
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return <div className="p-10 text-gray-600">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* CUSTOMER CARD */}
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Customer Profile
            </h1>
            <p className="text-sm text-gray-500">
              Manage customer details and credentials
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => {
                setIsEditing(true);

                // ✅ Reset password when entering edit
                setFormData((prev) => ({
                  ...prev,
                  password: "",
                }));

                setShowPassword(false);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 transition text-black px-5 py-2 rounded-lg font-medium"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium"
              >
                Save Changes
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchCustomerData();

                  // ✅ Reset password on cancel
                  setFormData((prev) => ({
                    ...prev,
                    password: "",
                  }));

                  setShowPassword(false);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-black px-5 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* EDIT MODE BANNER */}
        {isEditing && (
          <div className="mb-6 p-3 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300 text-sm">
            Admin Edit Mode Enabled — Changes affect live customer data
          </div>
        )}

        {/* FORM GRID */}
        <div className="grid grid-cols-2 gap-6">
          <Field
            label="Full Name"
            value={customer?.name}
            isEditing={isEditing}
            name="name"
            formData={formData}
            handleChange={handleChange}
          />
          <Field
            label="Client Card"
            value={customer?.client_card}
            isEditing={isEditing}
            name="client_card"
            formData={formData}
            handleChange={handleChange}
          />
          <Field
            label="Email Address"
            value={customer?.email}
            isEditing={isEditing}
            name="email"
            formData={formData}
            handleChange={handleChange}
          />
          <Field
            label="Phone Number"
            value={customer?.phone}
            isEditing={isEditing}
            name="phone"
            formData={formData}
            handleChange={handleChange}
          />

          {/* PASSWORD */}
          <div className="col-span-2">
            <p className="text-sm text-gray-500 mb-1">New Password</p>

            {isEditing ? (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 pr-12 rounded-lg outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            ) : (
              <p className="text-gray-400 italic">••••••••</p>
            )}
          </div>
        </div>
      </div>

      {/* ACCOUNTS */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Accounts</h2>

          <button
            onClick={() => router.push(`/admin/create-account?user_id=${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Create Account
          </button>
        </div>

        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Account Number</th>
              <th className="p-3 text-left">Account Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Balance</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-600">
            {accounts.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4">
                  No accounts created yet
                </td>
              </tr>
            )}

            {accounts.map((account) => (
              <tr
                key={account.id}
                onClick={() => router.push(`/admin/accounts/${account.id}`)}
                className="border-t hover:bg-blue-50 cursor-pointer transition"
              >
                <td className="p-3 text-gray-800 hover:text-blue-600 transition">
                  {account.account_number}
                </td>

                <td className="p-3">{account.account_name}</td>
                <td className="p-3">{account.account_type}</td>
                <td className="p-3 font-medium">${account.balance}</td>

                {/* ACTION COLUMN */}
                <td className="p-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent row click navigation
                      handleDeleteAccount(account.id);
                    }}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* FIELD COMPONENT */
function Field({ label, value, isEditing, name, formData, handleChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>

      {isEditing ? (
        <input
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg outline-none"
        />
      ) : (
        <p className="text-lg text-gray-800">{value}</p>
      )}
    </div>
  );
}
