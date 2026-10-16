import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Heart,
  HeartHandshake,
  MessageCircle,
  PlusCircle,
  Send,
  Share2,
  Sparkles,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Stories — FoodLoop" },
      { name: "description", content: "Inspiring surplus food rescue stories, grassroots moments, and donor spotlights on FoodLoop." },
      { property: "og:title", content: "Community Stories — FoodLoop" },
      { property: "og:description", content: "Inspiring surplus food rescue stories, grassroots moments, and donor spotlights on FoodLoop." },
    ],
  }),
  component: CommunityPage,
});

interface Story {
  id: string;
  author: string;
  role: string;
  badge: string;
  avatar: string;
  image: string;
  time: string;
  title: string;
  content: string;
  mealsServed: number;
  likes: number;
  location: string;
  comments?: { id: string; author: string; text: string; time: string }[];
}

const INITIAL_STORIES: Story[] = [
  {
    id: "story-1",
    author: "Prerna Slum Welfare Center",
    role: "Child Welfare NGO",
    badge: "Verified Shelter",
    avatar: "/images/hunger/ground3.jpg",
    image: "/images/hunger/hunger3.png",
    time: "2 hours ago",
    title: "180 underprivileged children nourished with warm midday meal",
    content: "Instead of facing hungry mornings, children at our railway slum learning center received fresh, nutritious khichdi and fruits rescued from an evening banquet in Mathura. Dignified, clean, and heartfelt!",
    mealsServed: 180,
    likes: 64,
    location: "Railway Slum Colony, Mathura",
    comments: [
      { id: "c1", author: "Sister Grace", text: "The children were so joyful. Every meal makes a lifelong difference!", time: "1h ago" },
    ],
  },
  {
    id: "story-2",
    author: "Govind Seva Ashram & Rain Basera",
    role: "Shelter Partner",
    badge: "Verified Shelter",
    avatar: "/images/hunger/ground4.jpg",
    image: "/images/hunger/ground2.png",
    time: "Yesterday",
    title: "Night shelter feeding for 140 daily-wage workers and street kids",
    content: "Steaming hot khichdi, whole-wheat rotis, and fresh milk distributed to unhoused families near Mathura Junction. Warm food in winter provides dignity and strength to those who need it most.",
    mealsServed: 140,
    likes: 89,
    location: "Station Road Rain Basera, Mathura",
    comments: [
      { id: "c2", author: "Aman Verma", text: "Always happy to do the night run! The warmth on cold nights means everything.", time: "Yesterday" },
    ],
  },
  {
    id: "story-3",
    author: "Aman Verma",
    role: "Volunteer Courier Hero",
    badge: "50+ Deliveries",
    avatar: "/images/hunger/card2.png",
    image: "/images/hunger/card2.png",
    time: "2 days ago",
    title: "Night food rescue run from community langar to shelter",
    content: "Picked up 4 warm insulated dispensers from Gurdwara Sahib at 9:30 PM and reached the shelter before 10 PM. Seeing the kids and elders eat with dignity is the greatest reward.",
    mealsServed: 120,
    likes: 114,
    location: "Station Road to Vrindavan Shelter",
    comments: [],
  },
];

function CommunityPage() {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("foodloop_community_stories");
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return INITIAL_STORIES;
  });

  const [likesState, setLikesState] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  // Create Story Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMeals, setNewMeals] = useState<number>(50);
  const [newLocation, setNewLocation] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  function toggleLike(id: string, initialLikes: number) {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
    setLikesState((prev) => {
      const current = prev[id] !== undefined ? prev[id] : initialLikes;
      return { ...prev, [id]: liked[id] ? current - 1 : current + 1 };
    });
  }

  function handleAddComment(storyId: string) {
    if (!commentInput.trim()) return;
    const authorName = profile?.name || user?.displayName || user?.email?.split("@")[0] || "Community Member";
    const newComment = {
      id: "c_" + Date.now(),
      author: authorName,
      text: commentInput.trim(),
      time: "Just now",
    };

    setStories((prev) => {
      const updated = prev.map((s) => {
        if (s.id === storyId) {
          return { ...s, comments: [...(s.comments || []), newComment] };
        }
        return s;
      });
      try {
        localStorage.setItem("foodloop_community_stories", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setCommentInput("");
    toast.success("Comment added!");
  }

  function handleCreateStory(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please enter a title and story content.");
      return;
    }

    const authorName = profile?.orgName || profile?.name || user?.displayName || "Community Member";
    const authorRole = profile?.role === "donor" ? "Food Donor" : profile?.role === "volunteer" ? "Delivery Volunteer" : "Recipient Shelter";

    const newStory: Story = {
      id: "story_" + Date.now(),
      author: authorName,
      role: authorRole,
      badge: "Verified Member",
      avatar: profile?.photoURL || "/images/hunger/ground4.jpg",
      image: newImageUrl.trim() || "/images/hunger/hunger3.png",
      time: "Just now",
      title: newTitle.trim(),
      content: newContent.trim(),
      mealsServed: newMeals || 25,
      likes: 1,
      location: newLocation.trim() || profile?.area || "Community Center",
      comments: [],
    };

    const updated = [newStory, ...stories];
    setStories(updated);
    try {
      localStorage.setItem("foodloop_community_stories", JSON.stringify(updated));
    } catch {}

    toast.success("Your food rescue story has been published!");
    setShowCreateModal(false);
    setNewTitle("");
    setNewContent("");
    setNewImageUrl("");
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] text-[#242923]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E2DBD0] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Logo size="sm" />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#242923]/80 md:flex">
            <Link to="/explore" className="hover:text-[#205C43] transition-colors">
              Explore Food
            </Link>
            <Link to="/how-it-works" className="hover:text-[#205C43] transition-colors">
              How It Works
            </Link>
            <Link to="/community" className="text-[#205C43] font-bold">
              Community
            </Link>
            <Link to="/impact" className="hover:text-[#205C43] transition-colors">
              Impact
            </Link>
          </nav>
          <div className="flex items-center gap-2.5">
            {user ? (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#205C43] px-4 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105"
              >
                <PlusCircle className="size-3.5" /> Share a Story
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-4 py-1.5 text-xs font-semibold text-[#242923] hover:bg-[#E9EFEA]"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#205C43] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:brightness-105"
                >
                  Join FoodLoop
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#205C43]/10 px-3 py-1 text-xs font-bold text-[#205C43]">
            <Sparkles className="size-3.5 text-[#ED7545]" /> Community Voices & Impact
          </span>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl text-[#242923]">
            FoodLoop Community Feed
          </h1>
          <p className="mt-1 text-sm text-[#656C62]">
            Celebrating the everyday donors, shelters, and volunteers who make zero-waste hunger relief possible.
          </p>
        </div>

        {/* Stories List */}
        <div className="mt-8 space-y-6">
          {stories.map((story) => {
            const isLiked = liked[story.id];
            const currentLikes = likesState[story.id] !== undefined ? likesState[story.id] : story.likes;
            const isCommenting = activeCommentPost === story.id;

            return (
              <article
                key={story.id}
                className="overflow-hidden rounded-3xl border border-[#DDD5C8] bg-white shadow-sm"
              >
                {/* Author Bar */}
                <div className="flex items-center justify-between p-5 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={story.avatar}
                      alt={story.author}
                      className="size-11 rounded-2xl object-cover ring-2 ring-[#205C43]/20 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#242923]">{story.author}</h3>
                        <span className="rounded-full bg-[#205C43]/10 px-2 py-0.5 text-[10px] font-bold text-[#205C43]">
                          {story.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#656C62]">
                        {story.role} • {story.location} • <span className="text-[11px]">{story.time}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Photo */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="size-full object-cover transition-transform hover:scale-[1.02] duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    🍲 {story.mealsServed} meals shared
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h4 className="font-display font-bold text-lg text-[#242923]">{story.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#656C62]">{story.content}</p>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-between border-t border-[#DDD5C8] pt-4 text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleLike(story.id, story.likes)}
                        className={`inline-flex items-center gap-1.5 font-bold transition-colors ${
                          isLiked ? "text-destructive" : "text-[#656C62] hover:text-[#242923]"
                        }`}
                      >
                        <Heart className={`size-4 ${isLiked ? "fill-current text-destructive" : ""}`} />
                        <span>{currentLikes} cheers</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            toast.info("Please sign in to comment on stories.");
                            return;
                          }
                          setActiveCommentPost(isCommenting ? null : story.id);
                        }}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#656C62] hover:text-[#242923]"
                      >
                        <MessageCircle className="size-4" />
                        <span>Comment ({story.comments?.length || 0})</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Story link copied to clipboard!");
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[#656C62] hover:text-[#205C43] transition-colors"
                    >
                      <Share2 className="size-3.5" /> Share
                    </button>
                  </div>

                  {/* Comment Section Drawer */}
                  {isCommenting && (
                    <div className="mt-4 border-t border-[#DDD5C8] pt-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a supportive comment…"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddComment(story.id)}
                          className="w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-1.5 text-xs text-[#242923] focus:border-[#205C43] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(story.id)}
                          className="rounded-xl bg-[#205C43] px-3.5 py-1.5 text-xs font-bold text-white hover:brightness-105"
                        >
                          <Send className="size-3" />
                        </button>
                      </div>

                      {story.comments && story.comments.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          {story.comments.map((c) => (
                            <div key={c.id} className="rounded-xl bg-[#F8F5ED] p-2 text-xs">
                              <p className="font-bold text-[#205C43]">{c.author}</p>
                              <p className="text-[#242923]">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Share a Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStory}
            className="w-full max-w-md rounded-3xl border border-[#DDD5C8] bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-[#242923]">Share Your Food Rescue Story</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#656C62] hover:text-[#242923]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-[#242923]">Story Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Rescued 80 hot meals from evening celebration"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2 text-xs font-bold text-[#242923]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#242923]">Meals Served</label>
                <input
                  type="number"
                  min={1}
                  value={newMeals}
                  onChange={(e) => setNewMeals(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2 text-xs font-bold text-[#242923]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#242923]">Neighborhood / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Civil Lines"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2 text-xs text-[#242923]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#242923]">Photo URL (Optional)</label>
              <input
                type="url"
                placeholder="Paste photo link or /images/hunger/hunger3.png"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] px-3.5 py-2 text-xs text-[#242923]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#242923]">Your Story</label>
              <textarea
                rows={4}
                required
                placeholder="Describe how the surplus was rescued, who received it, and the impact…"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD5C8] bg-[#F8F5ED] p-3 text-xs leading-relaxed text-[#242923]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full px-4 py-2 text-xs font-bold text-[#656C62]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#205C43] px-6 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105"
              >
                Post Story
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
