import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  Pencil,
  Trash2,
  UserRound,
  ArrowLeft,
  Plus,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  showConfirm,
  showError,
  showSuccess,
} from "@/lib/sweetAlert";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      {
        title: "Manage Users — MindBloom Admin",
      },
      {
        name: "description",
        content:
          "View and manage registered MindBloom users.",
      },
    ],
  }),
  component: AdminUsersPage,
});

type MindBloomUser = {
  id: number;
  fullname: string;
  email: string;
  role: "user" | "admin";
  profile_image: string;
  created_at: string;
};

function AdminUsersPage() {
  const [users, setUsers] = useState<MindBloomUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Edit User States
  const [editingUser, setEditingUser] =
    useState<MindBloomUser | null>(null);

  const [editFullname, setEditFullname] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [updatingUser, setUpdatingUser] = useState(false);

  // Add User States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFullname, setAddFullname] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addProfileImage, setAddProfileImage] =
    useState<File | null>(null);

  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        await showError(
          "Login Required",
          "Please log in with your administrator account."
        );

        window.location.href = "/login";
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser.role !== "admin") {
          await showError(
            "Access Denied",
            "Only MindBloom administrators can manage users."
          );

          window.location.href = "/dashboard";
          return;
        }

        setCheckingAccess(false);
      } catch (error) {
        console.error(error);

        localStorage.removeItem("user");

        await showError(
          "Session Error",
          "Your session is invalid. Please log in again."
        );

        window.location.href = "/login";
      }
    };

    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (checkingAccess) {
      return;
    }

    const loadUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost/api/admin/get_users.php"
        );

        const data = await response.json();

        if (data.success) {
          setUsers(data.users || []);
        } else {
          await showError(
            "Unable to Load Users",
            data.message || "Users could not be fetched."
          );
        }
      } catch (error) {
        console.error("Users fetch error:", error);

        await showError(
          "Connection Error",
          "MindBloom could not load users. Please check Apache and MySQL."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [checkingAccess]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.fullname.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.role.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const openEditModal = (user: MindBloomUser) => {
    if (user.email === "admin@mindbloom.com") {
      showError(
        "Protected Account",
        "The primary MindBloom administrator cannot be modified."
      );
      return;
    }

    setEditingUser(user);
    setEditFullname(user.fullname);
    setEditEmail(user.email);
  };

  const closeEditModal = () => {
    if (updatingUser) {
      return;
    }

    setEditingUser(null);
    setEditFullname("");
    setEditEmail("");
  };

  const handleUpdateUser = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    if (
      editFullname.trim() === "" ||
      editEmail.trim() === ""
    ) {
      await showError(
        "Missing Information",
        "Please enter the user's full name and email address."
      );
      return;
    }

    if (editFullname.trim().length < 3) {
      await showError(
        "Invalid Name",
        "The full name must contain at least 3 characters."
      );
      return;
    }

    const savedAdmin = localStorage.getItem("user");

    if (!savedAdmin) {
      await showError(
        "Session Error",
        "Administrator session was not found. Please log in again."
      );
      return;
    }

    try {
      setUpdatingUser(true);

      const adminData = JSON.parse(savedAdmin);

      const response = await fetch(
        "http://localhost/api/admin/update_user.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: editingUser.id,
            fullname: editFullname.trim(),
            email: editEmail.trim(),
            admin_email: adminData.email,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === editingUser.id
              ? {
                  ...user,
                  fullname: data.user.fullname,
                  email: data.user.email,
                }
              : user
          )
        );

        closeEditModal();

        await showSuccess(
          "User Updated 🌸",
          data.message ||
            "User information was updated successfully."
        );
      } else {
        await showError(
          "Update Failed",
          data.message ||
            "User information could not be updated."
        );
      }
    } catch (error) {
      console.error("Update user error:", error);

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server."
      );
    } finally {
      setUpdatingUser(false);
    }
  };

  const closeAddModal = () => {
    if (creatingUser) {
      return;
    }

    setShowAddModal(false);
    setAddFullname("");
    setAddEmail("");
    setAddPassword("");
    setAddProfileImage(null);
  };

  const handleAddUser = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      addFullname.trim() === "" ||
      addEmail.trim() === "" ||
      addPassword === ""
    ) {
      await showError(
        "Missing Information",
        "Please enter the user's name, email address and password."
      );
      return;
    }

    if (addFullname.trim().length < 3) {
      await showError(
        "Invalid Name",
        "The full name must contain at least 3 characters."
      );
      return;
    }

    if (addPassword.length < 6) {
      await showError(
        "Weak Password",
        "The password must contain at least 6 characters."
      );
      return;
    }

    const savedAdmin = localStorage.getItem("user");

    if (!savedAdmin) {
      await showError(
        "Session Error",
        "Administrator session was not found. Please log in again."
      );
      return;
    }

    try {
      setCreatingUser(true);

      const adminData = JSON.parse(savedAdmin);

      const formData = new FormData();

      formData.append("fullname", addFullname.trim());
      formData.append("email", addEmail.trim());
      formData.append("password", addPassword);
      formData.append("admin_email", adminData.email);

      if (addProfileImage) {
        formData.append("profile_image", addProfileImage);
      }

      const response = await fetch(
        "http://localhost/api/admin/add_user.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers((currentUsers) => [
          data.user,
          ...currentUsers,
        ]);

        setShowAddModal(false);
        setAddFullname("");
        setAddEmail("");
        setAddPassword("");
        setAddProfileImage(null);

        await showSuccess(
          "User Created 🌸",
          data.message ||
            "The new MindBloom user was created successfully."
        );
      } else {
        await showError(
          "Creation Failed",
          data.message || "The user could not be created."
        );
      }
    } catch (error) {
      console.error("Add user error:", error);

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server."
      );
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (
    user: MindBloomUser
  ) => {
    if (user.email === "admin@mindbloom.com") {
      await showError(
        "Protected Account",
        "The primary MindBloom administrator cannot be deleted."
      );
      return;
    }

    const confirmed = await showConfirm(
      "Delete this user?",
      `${user.fullname} and their account will be permanently removed.`,
      "Yes, Delete",
      "Cancel"
    );

    if (!confirmed) {
      return;
    }

    const savedAdmin = localStorage.getItem("user");

    if (!savedAdmin) {
      await showError(
        "Session Error",
        "Administrator session was not found. Please log in again."
      );
      return;
    }

    try {
      const adminData = JSON.parse(savedAdmin);

      const response = await fetch(
        "http://localhost/api/admin/delete_user.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            admin_email: adminData.email,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers((currentUsers) =>
          currentUsers.filter(
            (currentUser) =>
              currentUser.id !== user.id
          )
        );

        await showSuccess(
          "User Deleted",
          data.message ||
            "The selected user was deleted successfully."
        );
      } else {
        await showError(
          "Delete Failed",
          data.message ||
            "The selected user could not be deleted."
        );
      }
    } catch (error) {
      console.error("Delete user error:", error);

      await showError(
        "Connection Error",
        "MindBloom could not connect to the server."
      );
    }
  };

  if (checkingAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div
          className="
            rounded-[30px]
            border border-[#dfe2ef]
            bg-white/92
            px-10 py-12
            text-center
            shadow-[0_22px_60px_rgba(120,126,190,0.13)]
            backdrop-blur-xl

            dark:border-white/8
            dark:bg-[#20283d]/94
            dark:shadow-[0_22px_60px_rgba(0,0,0,0.30)]
          "
        >
          <div
            className="
              mx-auto h-14 w-14 animate-spin rounded-full
              border-4 border-[#ddd8f7]
              border-t-[#9589df]

              dark:border-white/10
              dark:border-t-[#a99df0]
            "
          />

          <p className="mt-4 text-sm text-[#6f7a90] dark:text-[#939db3]">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div
        className="
          pointer-events-none absolute
          -left-32 top-20
          h-80 w-80 rounded-full
          bg-[#ddd7fa]/30 blur-3xl
          animate-pulse

          dark:bg-[#7f73dd]/9
        "
      />

      <div
        className="
          pointer-events-none absolute
          -right-32 top-80
          h-96 w-96 rounded-full
          bg-[#caedf5]/35 blur-3xl

          dark:bg-[#5b95ba]/8
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Hero */}
        <Card
          className="
            group relative overflow-hidden
            rounded-[34px]
            border border-[#dce0ed]
            bg-white/90
            shadow-[0_26px_75px_rgba(120,126,190,0.14)]
            backdrop-blur-2xl

            dark:border-white/8
            dark:bg-[#20283d]/94
            dark:shadow-[0_26px_75px_rgba(0,0,0,0.28)]
          "
        >
          <div
            className="
              absolute inset-0
              bg-gradient-to-br
              from-[#efedff]/95
              via-[#ebf5ff]/90
              to-[#eaf9f4]/90

              dark:from-[#272f45]
              dark:via-[#242c42]
              dark:to-[#212c42]
            "
          />

          <div
            className="
              absolute -right-20 -top-24
              h-72 w-72 rounded-full
              bg-white/40 blur-3xl
              transition-transform duration-700
              group-hover:scale-125

              dark:bg-[#8790b0]/7
            "
          />

          <div className="relative p-7 sm:p-9">
            <div className="mb-7">
              <Link to="/admin">
                <Button
                  type="button"
                  variant="outline"
                  className="
                    rounded-2xl
                    border-[#d9dcea]
                    bg-white/90
                    px-5
                    text-[#59657b]
                    shadow-soft
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-x-1
                    hover:bg-white
                    hover:text-[#776bc8]

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#b0b8c9]
                    dark:hover:bg-white/10
                    dark:hover:text-[#b7acf5]
                  "
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span
                  className="
                    inline-flex items-center gap-2
                    rounded-full
                    border border-[#dcddea]
                    bg-white/80
                    px-4 py-2
                    text-sm font-semibold
                    text-[#8174d2]
                    shadow-sm

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#b1a7f1]
                  "
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin User Management
                </span>

                <h1
                  className="
                    mt-5 font-display
                    text-4xl font-extrabold
                    text-[#25304a]
                    sm:text-5xl

                    dark:text-[#edf0fa]
                  "
                >
                  MindBloom{" "}
                  <span className="bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] bg-clip-text text-transparent">
                    Users
                  </span>
                </h1>

                <p
                  className="
                    mt-3 max-w-2xl
                    text-[#5f6c83]

                    dark:text-[#939db3]
                  "
                >
                  Search, create, update and securely manage registered
                  MindBloom members.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="h-auto min-h-14 rounded-2xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-6 text-white shadow-[0_13px_28px_rgba(132,145,205,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(132,145,205,0.26)]"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add New User
                </Button>

                <div
                  className="
                    rounded-2xl
                    border border-[#dce0eb]
                    bg-white/82
                    px-6 py-4
                    shadow-soft
                    backdrop-blur-xl

                    dark:border-white/8
                    dark:bg-[#2b344b]/88
                  "
                >
                  <p
                    className="
                      text-xs font-medium uppercase
                      tracking-wider
                      text-[#6f7a90]

                      dark:text-[#939db3]
                    "
                  >
                    Total Accounts
                  </p>

                  <p className="mt-1 bg-gradient-to-r from-[#9b8fea] to-[#82a7eb] bg-clip-text font-display text-3xl font-extrabold text-transparent">
                    {loading ? "..." : users.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Search */}
        <Card
          className="
            mt-8 rounded-[28px]
            border border-[#dce0eb]
            bg-white/88
            p-5
            shadow-[0_18px_48px_rgba(120,126,190,0.10)]
            backdrop-blur-xl

            dark:border-white/8
            dark:bg-[#20283d]/92
            dark:shadow-[0_18px_48px_rgba(0,0,0,0.22)]
          "
        >
          <div className="relative">
            <Search
              className="
                absolute left-4 top-1/2
                h-5 w-5
                -translate-y-1/2
                text-[#8174d2]

                dark:text-[#a99df0]
              "
            />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email or role..."
              className="
                h-12 rounded-2xl
                border-[#d9ddeb]
                bg-white
                pl-12
                text-[#273149]
                shadow-sm
                placeholder:text-[#9aa2b3]
                focus-visible:border-[#aaa0ea]
                focus-visible:ring-[#ddd8f7]

                dark:border-white/10
                dark:bg-white/6
                dark:text-[#edf0fa]
                dark:placeholder:text-[#737e96]
                dark:focus-visible:border-[#8f84da]
                dark:focus-visible:ring-[#8f84da]/20
              "
            />
          </div>
        </Card>

        {/* Users container */}
        <Card
          className="
            mt-8 overflow-hidden
            rounded-[34px]
            border border-[#dce0eb]
            bg-white/88
            p-4
            shadow-[0_22px_65px_rgba(120,126,190,0.11)]
            backdrop-blur-2xl
            sm:p-6

            dark:border-white/8
            dark:bg-[#1d253a]/94
            dark:shadow-[0_22px_65px_rgba(0,0,0,0.26)]
          "
        >
          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <div
                className="
                  rounded-[30px]
                  border border-[#dce0eb]
                  bg-white/90
                  px-10 py-12
                  text-center
                  shadow-[0_22px_60px_rgba(120,126,190,0.12)]
                  backdrop-blur-xl

                  dark:border-white/8
                  dark:bg-[#252d43]/94
                  dark:shadow-[0_22px_60px_rgba(0,0,0,0.25)]
                "
              >
                <div
                  className="
                    mx-auto h-12 w-12 animate-spin rounded-full
                    border-4 border-[#ddd8f7]
                    border-t-[#9589df]

                    dark:border-white/10
                    dark:border-t-[#a99df0]
                  "
                />

                <p className="mt-4 font-medium text-[#6f7a90] dark:text-[#939db3]">
                  Loading users...
                </p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div
              className="
                flex min-h-72 flex-col
                items-center justify-center
                rounded-[28px]
                border border-[#dde0eb]
                bg-gradient-to-br
                from-[#f3f1ff]
                via-[#edf7ff]
                to-[#eaf9f4]
                px-6 text-center

                dark:border-white/8
                dark:from-[#272f45]
                dark:via-[#242c42]
                dark:to-[#212c42]
              "
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a397ed] via-[#84aaeb] to-[#62bbe0] shadow-[0_16px_38px_rgba(99,102,241,0.3)]">
                <Users className="h-8 w-8 text-white" />
              </div>

              <h2 className="mt-5 font-display text-2xl font-bold text-[#25304a] dark:text-[#edf0fa]">
                No Users Found
              </h2>

              <p className="mt-2 text-[#6f7a90] dark:text-[#939db3]">
                No registered user matches your search.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop heading */}
              <div
                className="
                  hidden
                  grid-cols-[1.5fr_1.3fr_0.7fr_0.8fr_1fr]
                  gap-5
                  rounded-[22px]
                  border border-[#dcdfea]
                  bg-gradient-to-r
                  from-[#f0edff]/95
                  via-[#edf7ff]/90
                  to-[#eaf9f4]/90
                  px-6 py-4
                  text-xs font-bold uppercase
                  tracking-[0.14em]
                  text-[#677389]
                  lg:grid

                  dark:border-white/8
                  dark:from-white/7
                  dark:via-white/5
                  dark:to-white/7
                  dark:text-[#939db3]
                "
              >
                <span>User</span>
                <span>Email</span>
                <span>Role</span>
                <span>Registered</span>
                <span className="text-right">Actions</span>
              </div>

              {filteredUsers.map((user, index) => {
                const profileImageUrl =
                  user.profile_image
                    ? `http://localhost/api/${user.profile_image}`
                    : "";

                const isPrimaryAdmin =
                  user.email === "admin@mindbloom.com";

                return (
                  <div
                    key={user.id}
                    className="
                      group relative overflow-hidden
                      rounded-[26px]
                      border border-[#dfe2ec]
                      bg-white/92
                      px-5 py-5
                      shadow-[0_14px_38px_rgba(120,126,190,0.09)]
                      backdrop-blur-xl
                      transition-all duration-500
                      hover:-translate-y-1
                      hover:border-[#cbc7e7]
                      hover:shadow-[0_22px_55px_rgba(120,126,190,0.14)]
                      sm:px-6

                      dark:border-white/8
                      dark:bg-[#252d43]/94
                      dark:shadow-[0_14px_38px_rgba(0,0,0,0.20)]
                      dark:hover:border-white/12
                      dark:hover:bg-[#293249]
                      dark:hover:shadow-[0_22px_55px_rgba(0,0,0,0.28)]
                    "
                    style={{
                      animation: `adminUserRowReveal 0.55s ease-out ${
                        index * 0.08
                      }s both`,
                    }}
                  >
                    <div
                      className="
                        absolute -right-10 -top-12
                        h-32 w-32 rounded-full
                        bg-gradient-to-br
                        from-[#ddd7fa]/30
                        via-[#cfe6f8]/25
                        to-[#caedf5]/30
                        blur-2xl
                        transition-transform duration-700
                        group-hover:scale-150

                        dark:from-[#8f83e7]/7
                        dark:via-[#6d9ac0]/6
                        dark:to-[#5a9fba]/6
                      "
                    />

                    <div className="relative grid gap-5 lg:grid-cols-[1.5fr_1.3fr_0.7fr_0.8fr_1fr] lg:items-center">
                      {/* User */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {profileImageUrl ? (
                            <img
                              src={profileImageUrl}
                              alt={user.fullname}
                              className="
                                h-14 w-14
                                rounded-[18px]
                                border-2 border-white
                                object-cover
                                shadow-[0_10px_28px_rgba(120,126,190,0.18)]
                                transition-transform duration-300
                                group-hover:scale-105

                                dark:border-white/15
                                dark:shadow-[0_10px_28px_rgba(0,0,0,0.26)]
                              "
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#a79cef] via-[#87adeb] to-[#66c1df] text-white shadow-[0_10px_28px_rgba(120,126,190,0.18)] transition-transform duration-300 group-hover:scale-105">
                              <UserRound className="h-7 w-7" />
                            </div>
                          )}

                          <span
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#252d43] ${
                              user.role === "admin"
                                ? "bg-[#9b8fea]"
                                : "bg-[#7fc8b6]"
                            }`}
                          />
                        </div>

                        <div className="min-w-0">
                          <p
                            className="
                              truncate
                              font-display text-lg font-bold
                              text-[#25304a]

                              dark:text-[#edf0fa]
                            "
                          >
                            {user.fullname}
                          </p>

                          <p
                            className="
                              mt-1 text-xs font-medium
                              text-[#748096]

                              dark:text-[#939db3]
                            "
                          >
                            Member ID #{user.id}
                          </p>
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#919aab] lg:hidden dark:text-[#6f7990]">
                          Email
                        </p>

                        <p className="break-all text-sm font-medium text-[#5f6c83] dark:text-[#a2abc0]">
                          {user.email}
                        </p>
                      </div>

                      {/* Role */}
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#919aab] lg:hidden dark:text-[#6f7990]">
                          Role
                        </p>

                        <span
                          className={
                            user.role === "admin"
                              ? "inline-flex items-center rounded-full border border-violet-200 bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-1.5 text-xs font-bold text-[#8174d2] shadow-sm dark:border-[#a99df0]/20 dark:bg-none dark:bg-[#a99df0]/12 dark:text-[#b9b0f5]"
                              : "inline-flex items-center rounded-full border border-[#d7eee6] bg-[#eaf9f5] px-3 py-1.5 text-xs font-bold text-[#4c9d8a] shadow-sm dark:border-[#79c7b5]/20 dark:bg-[#79c7b5]/10 dark:text-[#8ed7c7]"
                          }
                        >
                          {user.role === "admin"
                            ? "Administrator"
                            : "User"}
                        </span>
                      </div>

                      {/* Registered */}
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#919aab] lg:hidden dark:text-[#6f7990]">
                          Registered
                        </p>

                        <p className="text-sm font-medium text-[#5f6c83] dark:text-[#a2abc0]">
                          {user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleDateString()
                            : "Not available"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div>
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openEditModal(user)
                            }
                            disabled={isPrimaryAdmin}
                            className="
                              rounded-xl
                              border-[#d8dbea]
                              bg-white
                              px-4
                              text-[#65718a]
                              shadow-sm
                              transition-all duration-300
                              hover:-translate-y-0.5
                              hover:border-violet-400
                              hover:bg-violet-50
                              hover:text-[#8174d2]
                              hover:shadow-md

                              dark:border-white/10
                              dark:bg-white/6
                              dark:text-[#b0b8c9]
                              dark:hover:border-[#a99df0]/30
                              dark:hover:bg-[#a99df0]/10
                              dark:hover:text-[#b9b0f5]
                            "
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              handleDeleteUser(user)
                            }
                            disabled={isPrimaryAdmin}
                            className="rounded-xl border-0 bg-gradient-to-r from-[#c989a1] to-[#b97891] px-4 text-white shadow-[0_8px_20px_rgba(185,120,145,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#bd7e97] hover:to-[#aa6d85] hover:shadow-[0_12px_28px_rgba(185,120,145,0.24)]"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>

                        {isPrimaryAdmin && (
                          <p className="mt-2 text-xs font-semibold text-[#8174d2] lg:text-right dark:text-[#a99df0]">
                            Protected primary account
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div
          className="
            fixed inset-0 z-[250]
            flex items-start justify-center
            overflow-y-auto
            bg-[#273149]/35
            px-4 py-6
            backdrop-blur-sm
            sm:py-10

            dark:bg-black/60
          "
        >
          <Card
            className="
              relative my-auto
              w-full max-w-lg
              rounded-[30px]
              border border-[#dfe1eb]
              bg-gradient-to-br
              from-[#f0edff]
              via-[#edf7ff]
              to-[#eaf9f4]
              p-7
              shadow-[0_28px_80px_rgba(120,126,190,0.20)]

              dark:border-white/10
              dark:from-[#252d43]
              dark:via-[#20283d]
              dark:to-[#1c263a]
              dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)]
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold text-[#25304a] dark:text-[#edf0fa]">
                  Edit User
                </h2>

                <p className="mt-2 text-sm text-[#6f7a90] dark:text-[#939db3]">
                  Update the selected MindBloom member's details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={updatingUser}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-full
                  border border-[#dde0ec]
                  bg-white/85
                  text-xl
                  text-[#8174d2]
                  shadow-soft
                  transition
                  hover:bg-white

                  dark:border-white/10
                  dark:bg-white/6
                  dark:text-[#b1a7f1]
                  dark:hover:bg-white/10
                "
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateUser}
              className="mt-7 space-y-5"
            >
              <div>
                <Label
                  htmlFor="edit-fullname"
                  className="text-[#4f5b73] dark:text-[#c9cfdd]"
                >
                  Full Name
                </Label>

                <Input
                  id="edit-fullname"
                  value={editFullname}
                  onChange={(event) =>
                    setEditFullname(
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  className="
                    mt-2 h-12 rounded-xl
                    border-[#d9ddeb]
                    bg-white
                    text-[#273149]

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#edf0fa]
                    dark:placeholder:text-[#737e96]
                  "
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-email"
                  className="text-[#4f5b73] dark:text-[#c9cfdd]"
                >
                  Email Address
                </Label>

                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(event) =>
                    setEditEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter email address"
                  className="
                    mt-2 h-12 rounded-xl
                    border-[#d9ddeb]
                    bg-white
                    text-[#273149]

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#edf0fa]
                    dark:placeholder:text-[#737e96]
                  "
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  disabled={updatingUser}
                  className="
                    rounded-xl
                    border-[#d9ddeb]
                    bg-white/85
                    text-[#65718a]

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#b0b8c9]
                    dark:hover:bg-white/10
                  "
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={updatingUser}
                  className="rounded-xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] text-white"
                >
                  {updatingUser
                    ? "Updating..."
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="
            fixed inset-0 z-[250]
            flex items-start justify-center
            overflow-y-auto
            bg-[#273149]/35
            px-4 py-6
            backdrop-blur-sm
            sm:py-10

            dark:bg-black/60
          "
        >
          <Card
            className="
              relative my-auto
              w-full max-w-lg
              rounded-[30px]
              border border-[#dfe1eb]
              bg-gradient-to-br
              from-[#f0edff]
              via-[#edf7ff]
              to-[#eaf9f4]
              p-7
              shadow-[0_28px_80px_rgba(120,126,190,0.20)]

              dark:border-white/10
              dark:from-[#252d43]
              dark:via-[#20283d]
              dark:to-[#1c263a]
              dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)]
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold text-[#25304a] dark:text-[#edf0fa]">
                  Add New User
                </h2>

                <p className="mt-2 text-sm text-[#6f7a90] dark:text-[#939db3]">
                  Create a new MindBloom member account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={creatingUser}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-full
                  border border-[#dde0ec]
                  bg-white/85
                  text-xl
                  text-[#8174d2]
                  shadow-soft
                  transition
                  hover:bg-white

                  dark:border-white/10
                  dark:bg-white/6
                  dark:text-[#b1a7f1]
                  dark:hover:bg-white/10
                "
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddUser}
              className="mt-7 space-y-5"
            >
              <div>
                <Label
                  htmlFor="add-fullname"
                  className="text-[#4f5b73] dark:text-[#c9cfdd]"
                >
                  Full Name
                </Label>

                <Input
                  id="add-fullname"
                  value={addFullname}
                  onChange={(event) =>
                    setAddFullname(
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  className="
                    mt-2 h-12 rounded-xl
                    border-[#d9ddeb]
                    bg-white
                    text-[#273149]

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#edf0fa]
                    dark:placeholder:text-[#737e96]
                  "
                />
              </div>

              <div>
                <Label
                  htmlFor="add-email"
                  className="text-[#4f5b73] dark:text-[#c9cfdd]"
                >
                  Email Address
                </Label>

                <Input
                  id="add-email"
                  type="email"
                  value={addEmail}
                  onChange={(event) =>
                    setAddEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter email address"
                  className="
                    mt-2 h-12 rounded-xl
                    border-[#d9ddeb]
                    bg-white
                    text-[#273149]

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#edf0fa]
                    dark:placeholder:text-[#737e96]
                  "
                />
              </div>

              <div>
                <Label
                  htmlFor="add-password"
                  className="text-[#4f5b73] dark:text-[#c9cfdd]"
                >
                  Temporary Password
                </Label>

                <Input
                  id="add-password"
                  type="password"
                  value={addPassword}
                  onChange={(event) =>
                    setAddPassword(
                      event.target.value
                    )
                  }
                  placeholder="Minimum 6 characters"
                  className="
                    mt-2 h-12 rounded-xl
                    border-[#d9ddeb]
                    bg-white
                    text-[#273149]

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#edf0fa]
                    dark:placeholder:text-[#737e96]
                  "
                />
              </div>

              <div>
                <Label
                  htmlFor="add-profile-image"
                  className="text-[#4f5b73] dark:text-[#c9cfdd]"
                >
                  Profile Picture
                </Label>

                <Input
                  id="add-profile-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file =
                      event.target.files?.[0] ||
                      null;

                    setAddProfileImage(file);
                  }}
                  className="
                    mt-2 h-12 rounded-xl
                    border-[#d9ddeb]
                    bg-white
                    text-[#5f6c83]

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#b0b8c9]
                    file:text-[#8174d2]
                    dark:file:text-[#b1a7f1]
                  "
                />

                <p className="mt-2 text-xs text-[#6f7a90] dark:text-[#939db3]">
                  Optional. JPG, PNG or WEBP, maximum 5 MB.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAddModal}
                  disabled={creatingUser}
                  className="
                    rounded-xl
                    border-[#d9ddeb]
                    bg-white/85
                    text-[#65718a]

                    dark:border-white/10
                    dark:bg-white/6
                    dark:text-[#b0b8c9]
                    dark:hover:bg-white/10
                  "
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={creatingUser}
                  className="rounded-xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] text-white"
                >
                  {creatingUser
                    ? "Creating..."
                    : "Create User"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </main>
  );
}