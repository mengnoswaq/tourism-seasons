import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUsers, updateUserRole, toggleUserActiveStatus } from "@/actions/users";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, ShieldAlert, Users, CheckCircle2, XCircle } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/users");
  }

  const users = await getUsers();

  const currentUserId = (session.user as any)?.id;
  const currentUserRole = (session.user as any)?.role || "USER";

  const counts = {
    SUPERADMIN: users.filter((u) => u.role === "SUPERADMIN").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    EDITOR: users.filter((u) => u.role === "EDITOR").length,
    AUTHOR: users.filter((u) => u.role === "AUTHOR").length,
    USER: users.filter((u) => (u.role as string) === "USER" || (u.role as string) === "SUBSCRIBER").length,
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="p-2 border-slate-200 text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-[#2791F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
                Super Admin Role Delegation
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">User Roles & Active Status Management</h1>
            <p className="text-xs text-slate-500">
              Assign roles and toggle Active / Inactive status for registered accounts
            </p>
          </div>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Super Admin</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{counts.SUPERADMIN}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Admin</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{counts.ADMIN}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Editor</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{counts.EDITOR}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Author</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{counts.AUTHOR}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">User</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{counts.USER}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2791F5]" /> Registered User Directory ({users.length})
          </h2>
          <span className="text-xs text-slate-500">Your Role: <span className="font-bold text-[#2791F5]">{currentUserRole}</span></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Active Status</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                const isTargetAdminOrSuperAdmin = user.role === "SUPERADMIN" || user.role === "ADMIN";
                // SuperAdmins can edit ALL user accounts (isProtected is false for SUPERADMIN)
                const isProtected = currentUserRole === "SUPERADMIN" ? false : (isSelf || isTargetAdminOrSuperAdmin);
                const isActive = user.status !== "INACTIVE";

                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.image} fallback={user.name || "U"} size="sm" />
                        <div>
                          <span className="block font-bold text-slate-900">{user.name || "Anonymous"}</span>
                          {isSelf && <span className="text-[10px] text-emerald-600 font-semibold">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{user.email}</td>
                    
                    {/* Active / Inactive Status Toggle */}
                    <td className="p-4 text-center">
                      <form action={async () => {
                        "use server";
                        await toggleUserActiveStatus(user.id);
                      }}>
                        <button type="submit" disabled={isProtected} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
                          {isActive ? (
                            <Badge variant="success" className="gap-1 cursor-pointer">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="danger" className="gap-1 cursor-pointer bg-red-50 text-red-600 border-red-200">
                              <XCircle className="w-3 h-3 text-red-500" /> Inactive
                            </Badge>
                          )}
                        </button>
                      </form>
                    </td>

                    <td className="p-4">
                      {user.role === "SUPERADMIN" && <Badge variant="danger" className="bg-red-50 text-red-600 border-red-200">Super Admin</Badge>}
                      {user.role === "ADMIN" && <Badge variant="brand" className="bg-purple-50 text-purple-600 border-purple-200">Admin</Badge>}
                      {user.role === "EDITOR" && <Badge variant="brand" className="bg-blue-50 text-blue-600 border-blue-200">Editor</Badge>}
                      {user.role === "AUTHOR" && <Badge variant="success">Author</Badge>}
                      {((user.role as string) === "USER" || (user.role as string) === "SUBSCRIBER") && <Badge variant="default">User</Badge>}
                    </td>

                    <td className="p-4 text-right">
                      <form action={async (formData) => {
                        "use server";
                        const newRole = formData.get("role") as string;
                        if (newRole) {
                          await updateUserRole(user.id, newRole);
                        }
                      }} className="inline-flex items-center gap-2">
                        <select
                          key={`${user.id}-${user.role}`}
                          name="role"
                          defaultValue={user.role}
                          disabled={isProtected}
                          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2791F5] disabled:opacity-50 disabled:bg-slate-100"
                        >
                          {currentUserRole === "SUPERADMIN" && <option value="SUPERADMIN">SUPERADMIN</option>}
                          <option value="ADMIN">ADMIN</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="AUTHOR">AUTHOR</option>
                          <option value="USER">USER</option>
                        </select>
                        <Button
                          variant="primary"
                          size="sm"
                          type="submit"
                          disabled={isProtected}
                          className="py-1 text-[11px] font-semibold disabled:opacity-50"
                        >
                          Save Role
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
