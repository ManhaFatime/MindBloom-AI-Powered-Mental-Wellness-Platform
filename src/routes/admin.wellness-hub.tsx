import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  FileEdit,
  ImagePlus,
  LoaderCircle,
  Newspaper,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  showConfirm,
  showError,
  showSuccess,
} from "@/lib/sweetAlert";

export const Route = createFileRoute("/admin/wellness-hub")({
  head: () => ({
    meta: [
      { title: "Manage Wellness Hub — MindBloom Admin" },
      {
        name: "description",
        content:
          "Create, edit, publish and delete MindBloom Wellness Hub posts.",
      },
    ],
  }),
  component: AdminWellnessHubPage,
});

type AdminUser = {
  id: number;
  fullname: string;
  email: string;
  role: "admin";
};

type WellnessPost = {
  id: number;
  slug: string;
  admin_id: number | null;
  admin_name: string;
  title: string;
  category: string;
  short_description: string;
  content: string;
  image: string;
  author: string;
  reading_time: string;
  status: "published" | "draft";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type PostForm = {
  title: string;
  category: string;
  short_description: string;
  content: string;
  author: string;
  reading_time: string;
  status: "published" | "draft";
};

const emptyForm: PostForm = {
  title: "",
  category: "",
  short_description: "",
  content: "",
  author: "MindBloom Wellness Team",
  reading_time: "5 min",
  status: "published",
};

function AdminWellnessHubPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [posts, setPosts] = useState<WellnessPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<WellnessPost | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser: AdminUser = JSON.parse(savedUser);

      if (parsedUser.role !== "admin") {
        window.location.href = "/dashboard";
        return;
      }

      setAdmin(parsedUser);
    } catch {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost/api/get_wellness_posts.php?admin=1",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          "Unable to Load Posts",
          data.message || "Wellness Hub posts could not be loaded."
        );
        return;
      }

      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (error) {
      console.error("Wellness Hub loading error:", error);
      await showError(
        "Connection Error",
        "Could not connect to the Wellness Hub service."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) loadPosts();
  }, [admin]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return posts;

    return posts.filter((post) =>
      [
        post.title,
        post.category,
        post.short_description,
        post.author,
        post.reading_time,
        post.status,
        post.admin_name,
      ].some((value) =>
        (value || "").toLowerCase().includes(keyword)
      )
    );
  }, [posts, search]);

  const publishedCount = posts.filter(
    (post) => post.status === "published"
  ).length;

  const draftCount = posts.filter(
    (post) => post.status === "draft"
  ).length;

  const resetForm = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setImagePreview("");
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const openAddForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (post: WellnessPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      category: post.category,
      short_description: post.short_description,
      content: post.content,
      author: post.author || "MindBloom Wellness Team",
      reading_time: post.reading_time || "5 min",
      status: post.status,
    });

    setSelectedImage(null);

    setImagePreview(
      post.image
        ? `http://localhost/api/${post.image}`
        : ""
    );

    setFormOpen(true);
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showError(
        "Invalid Image",
        "Please select a JPG, PNG or WEBP image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError(
        "Image Too Large",
        "Image size must be less than 5 MB."
      );
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!admin) return;

    if (
      form.title.trim() === "" ||
      form.category.trim() === "" ||
      form.short_description.trim() === "" ||
      form.content.trim() === "" ||
      form.author.trim() === "" ||
      form.reading_time.trim() === ""
    ) {
      await showError(
        "Missing Information",
        "Please complete all required fields."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("admin_id", String(admin.id));
      formData.append("title", form.title.trim());
      formData.append("category", form.category.trim());

      formData.append(
        "short_description",
        form.short_description.trim()
      );

      formData.append("content", form.content.trim());
      formData.append("author", form.author.trim());
      formData.append(
        "reading_time",
        form.reading_time.trim()
      );
      formData.append("status", form.status);

      if (editingPost) {
        formData.append(
          "post_id",
          String(editingPost.id)
        );
      }

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const endpoint = editingPost
        ? "http://localhost/api/admin/update_wellness_post.php"
        : "http://localhost/api/admin/add_wellness_post.php";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        await showError(
          editingPost
            ? "Unable to Update Post"
            : "Unable to Create Post",
          data.message ||
            "The Wellness Hub post could not be saved."
        );
        return;
      }

      await showSuccess(
        editingPost
          ? "Post Updated Successfully"
          : "Post Created Successfully",
        data.message
      );

      closeForm();
      await loadPosts();
    } catch (error) {
      console.error("Wellness Hub save error:", error);

      await showError(
        "Connection Error",
        "Could not save the Wellness Hub post."
      );
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (post: WellnessPost) => {
    if (!admin) return;

    const confirmed = await showConfirm(
      "Delete Wellness Post?",
      `"${post.title}" will be permanently removed.`,
      "Yes, Delete",
      "Cancel"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "http://localhost/api/admin/delete_wellness_post.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: post.id,
            admin_id: admin.id,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        await showError(
          "Unable to Delete Post",
          data.message ||
            "The post could not be deleted."
        );
        return;
      }

      setPosts((current) =>
        current.filter(
          (item) => item.id !== post.id
        )
      );

      await showSuccess(
        "Post Deleted",
        data.message
      );
    } catch (error) {
      console.error(
        "Wellness Hub delete error:",
        error
      );

      await showError(
        "Connection Error",
        "Could not delete this Wellness Hub post."
      );
    }
  };

  const formatDate = (
    value: string | null
  ) => {
    if (!value) return "Not published";

    const date = new Date(
      value.replace(" ", "T")
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-28 top-16 h-80 w-80 rounded-full bg-[#ddd7fa]/30 blur-3xl dark:bg-[#7669d5]/8" />

      <div className="pointer-events-none absolute -right-32 top-80 h-96 w-96 rounded-full bg-[#caedf5]/35 blur-3xl dark:bg-[#568fb3]/7" />

      <div className="relative mx-auto max-w-7xl">
        <Card className="overflow-hidden rounded-[34px] border border-[#dce0ed] bg-gradient-to-br from-[#f0edff] via-[#edf7ff] to-[#eaf9f4] p-7 shadow-[0_26px_75px_rgba(120,126,190,0.13)] sm:p-9 dark:border-white/8 dark:from-[#272f45] dark:via-[#242c42] dark:to-[#212c42] dark:shadow-[0_26px_75px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dddfea] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#776bc8] shadow-soft dark:border-white/10 dark:bg-white/6 dark:text-[#b7acf5]">
                <Newspaper className="h-4 w-4" />
                Content Management
              </span>

              <h1 className="mt-5 font-display text-4xl font-extrabold text-[#273149] sm:text-5xl dark:text-[#edf0fa]">
                Wellness Hub{" "}
                <span className="bg-gradient-to-r from-[#9b8fea] via-[#82a7eb] to-[#59b9df] bg-clip-text text-transparent">
                  Posts
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-[#65718a] dark:text-[#939db3]">
                Create, edit, publish or remove news and wellness
                articles shown on the MindBloom website.
              </p>
            </div>

            <Button
              type="button"
              onClick={openAddForm}
              className="min-h-12 rounded-full bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-6 text-white shadow-glow"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Post
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[22px] border border-[#dce0eb] bg-white/82 p-5 shadow-soft dark:border-white/8 dark:bg-[#2b344b]/88">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b869a] dark:text-[#939db3]">
                Total Posts
              </p>

              <p className="mt-2 font-display text-3xl font-extrabold text-[#8174d2] dark:text-[#b1a7f1]">
                {posts.length}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#d7eee6] bg-[#eaf9f4]/86 p-5 shadow-soft dark:border-[#79c7b5]/20 dark:bg-[#79c7b5]/9">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4c9d8a] dark:text-[#8ed7c7]">
                Published
              </p>

              <p className="mt-2 font-display text-3xl font-extrabold text-[#4c9d8a] dark:text-[#8ed7c7]">
                {publishedCount}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#e3def5] bg-[#f3f0fb]/90 p-5 shadow-soft dark:border-[#a99df0]/20 dark:bg-[#a99df0]/9">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8174d2] dark:text-[#b7acf5]">
                Drafts
              </p>

              <p className="mt-2 font-display text-3xl font-extrabold text-[#8174d2] dark:text-[#b7acf5]">
                {draftCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="mt-8 rounded-[28px] border border-[#dce0eb] bg-white/88 p-5 shadow-soft backdrop-blur-xl dark:border-white/8 dark:bg-[#20283d]/92 dark:shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9184dc] dark:text-[#a99df0]" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by title, category, status or administrator..."
              className="h-14 rounded-2xl border-[#ddd8f7] bg-white pl-14 text-[#273149] placeholder:text-[#9aa2b3] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
            />
          </div>
        </Card>

        {loading ? (
          <Card className="mt-8 flex min-h-72 items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 dark:border-white/8 dark:bg-[#20283d]/92">
            <div className="text-center">
              <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-[#8174d2] dark:text-[#a99df0]" />

              <p className="mt-4 text-[#7b869a] dark:text-[#939db3]">
                Loading Wellness Hub posts...
              </p>
            </div>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-[32px] border border-[#dce0eb] bg-white/88 px-6 text-center dark:border-white/8 dark:bg-[#20283d]/92">
            <Newspaper className="h-12 w-12 text-[#8174d2] dark:text-[#a99df0]" />

            <h2 className="mt-4 font-display text-2xl font-bold text-[#273149] dark:text-[#edf0fa]">
              No Wellness Posts Found
            </h2>

            <p className="mt-2 text-[#7b869a] dark:text-[#939db3]">
              Create the first Wellness Hub news post.
            </p>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group flex h-full min-h-[560px] flex-col overflow-hidden rounded-[28px] border border-[#dfe2ec] bg-white/92 shadow-[0_18px_48px_rgba(120,126,190,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_62px_rgba(120,126,190,0.15)] dark:border-white/8 dark:bg-[#252d43]/94 dark:shadow-[0_18px_48px_rgba(0,0,0,0.23)] dark:hover:bg-[#293249] dark:hover:shadow-[0_26px_62px_rgba(0,0,0,0.30)]"
              >
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#e9e5ff] via-[#e7f4ff] to-[#e4f8ef] dark:from-[#2b344b] dark:via-[#26364b] dark:to-[#223b3d]">
                  {post.image ? (
                    <img
                      src={`http://localhost/api/${post.image}`}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Newspaper className="h-14 w-14 text-[#8174d2] dark:text-[#a99df0]" />
                    </div>
                  )}

                  <span
                    className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] shadow-soft ${
                      post.status === "published"
                        ? "border-[#d7eee6] bg-[#eaf9f4] text-[#4c9d8a] dark:border-[#79c7b5]/20 dark:bg-[#1f403c]/90 dark:text-[#8ed7c7]"
                        : "border-[#e3def5] bg-[#f3f0fb] text-[#8174d2] dark:border-[#a99df0]/20 dark:bg-[#35315b]/90 dark:text-[#b7acf5]"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8174d2] dark:text-[#a99df0]">
                    {post.category}
                  </p>

                  <h2 className="mt-3 line-clamp-2 font-display text-2xl font-bold text-[#273149] dark:text-[#edf0fa]">
                    {post.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#758096] dark:text-[#a7b0c2]">
                    {post.short_description}
                  </p>

                  <div className="mt-auto border-t border-[#ece9f7] pt-4 text-xs text-[#8a94a8] dark:border-white/8 dark:text-[#939db3]">
                    <p>
                      By {post.admin_name}
                    </p>

                    <p className="mt-1">
                      {post.status === "published"
                        ? `Published ${formatDate(post.published_at)}`
                        : `Created ${formatDate(post.created_at)}`}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        window.open(
                          `/hub/${post.slug}`,
                          "_blank"
                        );
                      }}
                      className="rounded-xl border-[#d8e7f5] bg-[#eef7ff] text-[#5f8fc7] hover:bg-[#e3f2ff] dark:border-[#79b6dc]/20 dark:bg-[#79b6dc]/8 dark:text-[#83bde2] dark:hover:bg-[#79b6dc]/12"
                    >
                      View
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        openEditForm(post)
                      }
                      className="rounded-xl border-[#ddd8f7] bg-[#f5f3ff] text-[#776bc8] hover:bg-[#eeeaff] dark:border-white/10 dark:bg-white/6 dark:text-[#b7acf5] dark:hover:bg-white/10"
                    >
                      <FileEdit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        deletePost(post)
                      }
                      className="rounded-xl border-[#efdce5] bg-[#fbf3f7] text-[#ad6983] hover:bg-[#f8eaf1] dark:border-[#d48aa5]/20 dark:bg-[#d48aa5]/8 dark:text-[#e2a0b8] dark:hover:bg-[#d48aa5]/12"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[260] overflow-y-auto bg-[#273149]/35 px-4 py-6 backdrop-blur-sm sm:py-10 dark:bg-black/60">
          <Card className="relative mx-auto w-full max-w-4xl rounded-[32px] border border-[#dfe2ed] bg-gradient-to-br from-[#f0edff] via-[#edf7ff] to-[#eaf9f4] p-6 shadow-[0_30px_90px_rgba(120,126,190,0.22)] sm:p-8 dark:border-white/10 dark:from-[#252d43] dark:via-[#20283d] dark:to-[#1c263a] dark:shadow-[0_30px_90px_rgba(0,0,0,0.48)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8174d2] dark:text-[#a99df0]">
                  Wellness Hub Editor
                </p>

                <h2 className="mt-2 font-display text-3xl font-bold text-[#273149] dark:text-[#edf0fa]">
                  {editingPost
                    ? "Edit Wellness Post"
                    : "Create Wellness Post"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-[#8174d2] shadow-soft hover:bg-white dark:bg-white/6 dark:text-[#a99df0] dark:hover:bg-white/10"
                aria-label="Close editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="post-title"
                    className="text-[#465168] dark:text-[#c9cfdd]"
                  >
                    Title
                  </Label>

                  <Input
                    id="post-title"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    maxLength={200}
                    placeholder="Enter news title"
                    disabled={saving}
                    className="h-12 rounded-xl border-[#ddd8f7] bg-white/90 text-[#273149] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="post-category"
                    className="text-[#465168] dark:text-[#c9cfdd]"
                  >
                    Category
                  </Label>

                  <Input
                    id="post-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    maxLength={100}
                    placeholder="Mindfulness, Self-Care..."
                    disabled={saving}
                    className="h-12 rounded-xl border-[#ddd8f7] bg-white/90 text-[#273149] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="post-author"
                    className="text-[#465168] dark:text-[#c9cfdd]"
                  >
                    Author
                  </Label>

                  <Input
                    id="post-author"
                    value={form.author}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        author: event.target.value,
                      }))
                    }
                    maxLength={150}
                    placeholder="MindBloom Wellness Team"
                    disabled={saving}
                    className="h-12 rounded-xl border-[#ddd8f7] bg-white/90 text-[#273149] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="post-reading-time"
                    className="text-[#465168] dark:text-[#c9cfdd]"
                  >
                    Reading Time
                  </Label>

                  <Input
                    id="post-reading-time"
                    value={form.reading_time}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        reading_time:
                          event.target.value,
                      }))
                    }
                    maxLength={30}
                    placeholder="5 min"
                    disabled={saving}
                    className="h-12 rounded-xl border-[#ddd8f7] bg-white/90 text-[#273149] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="post-short"
                  className="text-[#465168] dark:text-[#c9cfdd]"
                >
                  Short Description
                </Label>

                <Textarea
                  id="post-short"
                  value={form.short_description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      short_description:
                        event.target.value,
                    }))
                  }
                  maxLength={350}
                  rows={3}
                  placeholder="Short summary shown on the news card"
                  disabled={saving}
                  className="resize-none rounded-xl border-[#ddd8f7] bg-white/90 text-[#273149] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
                />

                <p className="text-right text-xs text-[#8a94a8] dark:text-[#939db3]">
                  {form.short_description.length}/350
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="post-content"
                  className="text-[#465168] dark:text-[#c9cfdd]"
                >
                  Full Article Content
                </Label>

                <Textarea
                  id="post-content"
                  value={form.content}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  rows={10}
                  placeholder="Write the complete Wellness Hub article..."
                  disabled={saving}
                  className="resize-y rounded-xl border-[#ddd8f7] bg-white/90 text-[#273149] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:placeholder:text-[#737e96]"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="post-status"
                    className="text-[#465168] dark:text-[#c9cfdd]"
                  >
                    Status
                  </Label>

                  <select
                    id="post-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target
                          .value as
                          | "published"
                          | "draft",
                      }))
                    }
                    disabled={saving}
                    className="h-12 w-full rounded-xl border border-[#ddd8f7] bg-white/90 px-4 text-sm text-[#273149] outline-none focus:ring-2 focus:ring-[#b8b0ec] dark:border-white/10 dark:bg-white/6 dark:text-[#edf0fa] dark:focus:ring-[#a99df0]/25"
                  >
                    <option value="published">
                      Published
                    </option>
                    <option value="draft">
                      Draft
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="post-image"
                    className="text-[#465168] dark:text-[#c9cfdd]"
                  >
                    Cover Image
                  </Label>

                  <label
                    htmlFor="post-image"
                    className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#cfc8eb] bg-white/80 px-4 text-sm font-semibold text-[#776bc8] transition hover:bg-white dark:border-[#a99df0]/25 dark:bg-white/6 dark:text-[#b7acf5] dark:hover:bg-white/10"
                  >
                    <Upload className="mr-2 h-4 w-4" />

                    {selectedImage
                      ? selectedImage.name
                      : editingPost?.image
                        ? "Change Cover Image"
                        : "Choose Cover Image"}
                  </label>

                  <input
                    id="post-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={saving}
                    className="hidden"
                  />
                </div>
              </div>

              {imagePreview ? (
                <div className="overflow-hidden rounded-[24px] border border-[#dfe2eb] bg-white/80 p-3 shadow-soft dark:border-white/8 dark:bg-white/5">
                  <img
                    src={imagePreview}
                    alt="Wellness post preview"
                    className="h-64 w-full rounded-[18px] object-cover"
                  />
                </div>
              ) : (
                <div className="flex min-h-44 flex-col items-center justify-center rounded-[24px] border border-dashed border-[#d6d0ed] bg-white/65 px-5 text-center dark:border-[#a99df0]/18 dark:bg-white/4">
                  <ImagePlus className="h-9 w-9 text-[#9184dc] dark:text-[#a99df0]" />

                  <p className="mt-3 text-sm font-semibold text-[#65718a] dark:text-[#939db3]">
                    Cover image is optional
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border-[#ddd8f7] bg-white/80 dark:border-white/10 dark:bg-white/6 dark:text-[#c9cfdd] dark:hover:bg-white/10"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-[#a397ed] via-[#84aaeb] to-[#62bbe0] px-6 text-white"
                >
                  {saving ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : editingPost ? (
                    <FileEdit className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingPost
                      ? "Update Post"
                      : "Create Post"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </main>
  );
}