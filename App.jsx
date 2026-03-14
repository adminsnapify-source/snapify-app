import { useState, useRef, useEffect } from "react";

const ADMIN_EMAIL = "admin@snapify.com";
const ADMIN_PASS = "admin123";

const BADGES = [
  { id: "first", icon: "🌟", label: "First Login", condition: (u) => true },
  { id: "bio", icon: "✍️", label: "Bio Added", condition: (u) => u.bio },
  { id: "photo", icon: "📸", label: "Photo Added", condition: (u) => u.photo },
  { id: "post1", icon: "📝", label: "First Post", condition: (u, posts) => posts.filter(p => p.userId === u.id).length >= 1 },
  { id: "post5", icon: "🏆", label: "5 Posts", condition: (u, posts) => posts.filter(p => p.userId === u.id).length >= 5 },
  { id: "popular", icon: "❤️", label: "Popular", condition: (u, posts) => posts.filter(p => p.userId === u.id).some(p => (Object.values(p.reactions || {}).reduce((a, b) => a + b, 0)) >= 3) },
];

const THEMES = [
  { id: "purple", gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#6366f1" },
  { id: "pink", gradient: "linear-gradient(135deg, #ec4899, #f43f5e)", color: "#ec4899" },
  { id: "blue", gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "#3b82f6" },
  { id: "green", gradient: "linear-gradient(135deg, #22c55e, #10b981)", color: "#22c55e" },
  { id: "orange", gradient: "linear-gradient(135deg, #f97316, #eab308)", color: "#f97316" },
  { id: "red", gradient: "linear-gradient(135deg, #ef4444, #f97316)", color: "#ef4444" },
];

const TICKS = {
  blue: { icon: "✅", label: "Verified", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  gold: { icon: "⭐", label: "VIP", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  green: { icon: "🟢", label: "Business", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
};

const POST_BG_COLORS = [
  { id: "none", label: "None", bg: null },
  { id: "sunset", label: "Sunset", bg: "linear-gradient(135deg, #f97316, #ec4899)" },
  { id: "ocean", label: "Ocean", bg: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
  { id: "forest", label: "Forest", bg: "linear-gradient(135deg, #22c55e, #10b981)" },
  { id: "night", label: "Night", bg: "linear-gradient(135deg, #1e1b4b, #312e81)" },
  { id: "gold", label: "Gold", bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  { id: "candy", label: "Candy", bg: "linear-gradient(135deg, #ec4899, #8b5cf6)" },
];

const PHOTO_FILTERS = [
  { id: "none", label: "Normal", filter: "none" },
  { id: "grayscale", label: "B&W", filter: "grayscale(100%)" },
  { id: "sepia", label: "Sepia", filter: "sepia(80%)" },
  { id: "warm", label: "Warm", filter: "saturate(150%) hue-rotate(-20deg)" },
  { id: "cool", label: "Cool", filter: "saturate(120%) hue-rotate(30deg)" },
  { id: "bright", label: "Bright", filter: "brightness(130%) contrast(110%)" },
  { id: "vintage", label: "Vintage", filter: "sepia(40%) contrast(120%) brightness(90%)" },
];

const MUSIC_LIST = [
  { id: "1", title: "Tere Bina", artist: "Arijit Singh", emoji: "🎵" },
  { id: "2", title: "Kesariya", artist: "Arijit Singh", emoji: "🎶" },
  { id: "3", title: "Raataan Lambiyan", artist: "Jubin Nautiyal", emoji: "🌙" },
  { id: "4", title: "Apna Bana Le", artist: "Arijit Singh", emoji: "🎸" },
  { id: "5", title: "Sajde Mein", artist: "Atif Aslam", emoji: "🎤" },
];

const REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍"];

const SNAPIFY_LOGO = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <defs>
      <linearGradient id="sg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f97316" />
        <stop offset="0.5" stopColor="#ec4899" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="36" height="36" rx="10" fill="url(#sg)" />
    <circle cx="18" cy="16" r="7" fill="none" stroke="white" strokeWidth="2.5" />
    <circle cx="18" cy="16" r="3" fill="white" />
    <circle cx="26" cy="10" r="2" fill="white" />
    <line x1="18" y1="23" x2="18" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="13" y1="28" x2="23" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export default function Snapify() {
  const [theme, setTheme] = useState("dark");
  const [screen, setScreen] = useState("welcome");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [notes, setNotes] = useState([]);
  const [messages, setMessages] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [search, setSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingGroup, setViewingGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [adminTab, setAdminTab] = useState("stats");
  const [viewingStory, setViewingStory] = useState(null);
  const [dmUser, setDmUser] = useState(null);
  const [dmText, setDmText] = useState("");
  const [newPost, setNewPost] = useState({ text: "", photos: [], video: null, isPrivate: false, bgColor: "none", location: "", music: null, filter: "none", poll: null });
  const [newStory, setNewStory] = useState({ text: "", photo: "", bgColor: "sunset" });
  const [newNote, setNewNote] = useState("");
  const [newComment, setNewComment] = useState({});
  const [showPostForm, setShowPostForm] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", photo: "", members: [] });
  const [newGroupMsg, setNewGroupMsg] = useState("");
  const [pollText, setPollText] = useState({ q: "", o1: "", o2: "", o3: "" });
  const [showPollForm, setShowPollForm] = useState(false);
  const [giveaway, setGiveaway] = useState(null);
  const [newGiveaway, setNewGiveaway] = useState({ title: "", prize: "", endDate: "" });
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", phone: "", address: "", dob: "", photo: "", bio: "", city: "", country: "", themeId: "purple", isPrivate: false, emergencyContact: "", emergencyPhone: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [birthdayAlert, setBirthdayAlert] = useState(null);
  const fileRef = useRef();
  const postFileRef = useRef();
  const postVideoRef = useRef();
  const storyFileRef = useRef();

  const dark = theme === "dark";
  const bg = dark ? "#0a0a0f" : "#f0f4ff";
  const card = dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.95)";
  const text = dark ? "#fff" : "#1a1a2e";
  const sub = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const inputBg = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)";
  const snapifyGradient = "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)";

  const getUserTheme = (u) => THEMES.find(t => t.id === (u?.themeId || "purple")) || THEMES[0];
  const currentTheme = getUserTheme(currentUser);
  const showMsg = (t, type = "success") => { setMsg({ text: t, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 2500); };
  const addNotif = (t) => setNotifications(n => [{ text: t, time: new Date().toLocaleTimeString(), id: Date.now() }, ...n].slice(0, 30));

  useEffect(() => {
    if (!currentUser || !users.length) return;
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const bdays = users.filter(u => u.dob && u.id !== currentUser.id && u.dob.slice(5) === todayStr);
    if (bdays.length > 0) setBirthdayAlert(bdays);
  }, [currentUser, users]);

  const activeStories = stories.filter(s => Date.now() - s.createdAt < 5 * 60 * 1000);
  const getUserPosts = (userId, isAdmin = false, viewerId = null) => posts.filter(p => { if (p.userId !== userId) return false; if (isAdmin) return true; if (viewerId === userId) return true; if (p.isPrivate) return false; return true; });
  const canViewProfile = (targetUser, isAdmin = false, viewerId = null) => { if (isAdmin) return true; if (viewerId === targetUser?.id) return true; if (!targetUser?.isPrivate) return true; return targetUser?.followers?.includes(viewerId); };
  const isBlocked = (targetId) => currentUser?.blocked?.includes(targetId) || false;
  const isPendingRequest = (targetId) => users.find(u => u.id === targetId)?.followRequests?.includes(currentUser?.id) || false;
  const isFollowing = (targetId) => currentUser?.following?.includes(targetId) || false;
  const isSaved = (postId) => savedPosts.includes(postId);

  const getLeaderboard = () => users.map(u => ({
    ...u,
    score: getUserPosts(u.id, true).length * 5 + (u.followers?.length || 0) * 3 + posts.filter(p => p.userId === u.id).reduce((a, p) => a + Object.values(p.reactions || {}).reduce((x, y) => x + y, 0), 0) * 2
  })).sort((a, b) => b.score - a.score).slice(0, 10);

  const handlePhoto = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result })); reader.readAsDataURL(file); };
  const handlePostPhotos = (e) => { const files = Array.from(e.target.files).slice(0, 10); files.forEach(file => { const reader = new FileReader(); reader.onload = (ev) => setNewPost(p => ({ ...p, photos: [...p.photos, ev.target.result].slice(0, 10) })); reader.readAsDataURL(file); }); };
  const handlePostVideo = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => setNewPost(p => ({ ...p, video: ev.target.result })); reader.readAsDataURL(file); };
  const handleStoryPhoto = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => setNewStory(s => ({ ...s, photo: ev.target.result })); reader.readAsDataURL(file); };

  const validateSignup = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Naam zaroori hai";
    if (!form.email.match(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/)) e.email = "Sahi email daalo";
    if (form.password.length < 6) e.password = "6+ characters chahiye";
    if (!form.age || form.age < 1 || form.age > 120) e.age = "Sahi age daalo";
    if (!form.phone.match(/^\\+?[\\d\\s\\-]{7,15}$/)) e.phone = "Sahi phone daalo";
    if (users.find(u => u.email === form.email)) e.email = "Email already registered!";
    return e;
  };

  const handleSignup = () => {
    const e = validateSignup();
    if (Object.keys(e).length) { setErrors(e); return; }
    const newUser = { ...form, id: Date.now(), following: [], followers: [], followRequests: [], blocked: [], tick: null, joinDate: new Date().toLocaleDateString() };
    setUsers(u => [...u, newUser]);
    setCurrentUser(newUser);
    setErrors({});
    setScreen("home");
    setActiveTab("feed");
    addNotif("🎉 Welcome to Snapify!");
    showMsg("Snapify mein welcome! 🎉");
  };

  const handleLogin = () => {
    if (loginForm.email === ADMIN_EMAIL && loginForm.password === ADMIN_PASS) { setScreen("admin"); setAdminTab("stats"); return; }
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (!user) { setErrors({ login: "Email ya password galat hai!" }); return; }
    setCurrentUser(user);
    setErrors({});
    setScreen("home");
    setActiveTab("feed");
    showMsg("Welcome back! 👋");
  };

  const handleFollowAction = (targetId) => {
    const target = users.find(u => u.id === targetId);
    if (!target || isBlocked(targetId)) return;
    if (isFollowing(targetId)) {
      const updC = { ...currentUser, following: currentUser.following.filter(id => id !== targetId) };
      const updT = { ...target, followers: (target.followers || []).filter(id => id !== currentUser.id) };
      setCurrentUser(updC); setUsers(us => us.map(u => u.id === updC.id ? updC : u.id === updT.id ? updT : u));
      showMsg("Unfollow ho gaya!");
    } else if (target.isPrivate) {
      if (isPendingRequest(targetId)) {
        setUsers(us => us.map(u => u.id === targetId ? { ...u, followRequests: (u.followRequests || []).filter(id => id !== currentUser.id) } : u));
        showMsg("Request cancel!");
      } else {
        setUsers(us => us.map(u => u.id === targetId ? { ...u, followRequests: [...(u.followRequests || []), currentUser.id] } : u));
        showMsg("Follow request bheji! ✅");
      }
    } else {
      const updC = { ...currentUser, following: [...(currentUser.following || []), targetId] };
      const updT = { ...target, followers: [...(target.followers || []), currentUser.id] };
      setCurrentUser(updC); setUsers(us => us.map(u => u.id === updC.id ? updC : u.id === updT.id ? updT : u));
      showMsg(`${target.name} ko follow kiya! ✅`);
    }
  };

  const handleBlock = (targetId) => {
    const target = users.find(u => u.id === targetId);
    if (!target) return;
    const isAlreadyBlocked = (currentUser.blocked || []).includes(targetId);
    const updC = { ...currentUser, blocked: isAlreadyBlocked ? (currentUser.blocked || []).filter(id => id !== targetId) : [...(currentUser.blocked || []), targetId] };
    setCurrentUser(updC); setUsers(us => us.map(u => u.id === updC.id ? updC : u));
    showMsg(isAlreadyBlocked ? `${target.name} unblock ho gaya!` : `${target.name} block ho gaya! 🚫`);
    if (!isAlreadyBlocked) setScreen("home");
  };

  const handleFollowRequest = (requesterId, accept) => {
    const requester = users.find(u => u.id === requesterId);
    if (!requester) return;
    const updC = { ...currentUser, followRequests: (currentUser.followRequests || []).filter(id => id !== requesterId), followers: accept ? [...(currentUser.followers || []), requesterId] : (currentUser.followers || []) };
    if (accept) { setUsers(us => us.map(u => u.id === updC.id ? updC : u.id === requesterId ? { ...u, following: [...(u.following || []), currentUser.id] } : u)); showMsg(`${requester.name} follow kar raha hai! ✅`); }
    else { setUsers(us => us.map(u => u.id === updC.id ? updC : u)); }
    setCurrentUser(updC);
  };

  const handleGiveTick = (userId, tickType) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const newTick = target.tick === tickType ? null : tickType;
    setUsers(us => us.map(u => u.id === userId ? { ...u, tick: newTick } : u));
    showMsg(newTick ? `${TICKS[newTick].icon} Tick diya!` : `Tick remove ho gaya!`);
  };

  const handlePost = () => {
    if (!newPost.text.trim() && newPost.photos.length === 0 && !newPost.video && !newPost.poll) return;
    const post = { id: Date.now(), userId: currentUser.id, text: newPost.text, photos: newPost.photos, video: newPost.video, isPrivate: newPost.isPrivate, bgColor: newPost.bgColor, location: newPost.location, music: newPost.music, filter: newPost.filter, poll: newPost.poll ? { ...newPost.poll, votes: {} } : null, isPinned: false, reactions: {}, userReactions: {}, comments: [], shares: 0, views: 0, time: new Date().toLocaleString() };
    setPosts(p => [post, ...p]);
    setNewPost({ text: "", photos: [], video: null, isPrivate: false, bgColor: "none", location: "", music: null, filter: "none", poll: null });
    setShowPostForm(false); setShowPollForm(false);
    showMsg("Snap post ho gaya! 📸");
  };

  const handleAddStory = () => {
    if (!newStory.text.trim() && !newStory.photo) return;
    setStories(s => [{ id: Date.now(), userId: currentUser.id, text: newStory.text, photo: newStory.photo, bgColor: newStory.bgColor, createdAt: Date.now() }, ...s]);
    setNewStory({ text: "", photo: "", bgColor: "sunset" });
    setShowStoryForm(false);
    showMsg("Story add ho gayi! 📸");
  };

  const handleReaction = (postId, emoji) => {
    setPosts(ps => ps.map(p => {
      if (p.id !== postId) return p;
      const reactions = { ...(p.reactions || {}) };
      const userReactions = { ...(p.userReactions || {}) };
      const prevEmoji = userReactions[currentUser.id];
      if (prevEmoji === emoji) { reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1); delete userReactions[currentUser.id]; }
      else { if (prevEmoji) reactions[prevEmoji] = Math.max(0, (reactions[prevEmoji] || 1) - 1); reactions[emoji] = (reactions[emoji] || 0) + 1; userReactions[currentUser.id] = emoji; }
      return { ...p, reactions, userReactions };
    }));
  };

  const handleVotePoll = (postId, optionIdx) => {
    setPosts(ps => ps.map(p => {
      if (p.id !== postId || !p.poll) return p;
      const votes = { ...(p.poll.votes || {}) };
      if (votes[currentUser.id] === optionIdx) delete votes[currentUser.id];
      else votes[currentUser.id] = optionIdx;
      return { ...p, poll: { ...p.poll, votes } };
    }));
  };

  const handleSharePost = (postId) => {
    const original = posts.find(p => p.id === postId);
    if (!original) return;
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p));
    const repost = { ...original, id: Date.now(), userId: currentUser.id, isRepost: true, originalUserId: original.userId, time: new Date().toLocaleString(), reactions: {}, userReactions: {}, comments: [], shares: 0 };
    setPosts(p => [repost, ...p]);
    showMsg("Snap share ho gaya! 🔄");
  };

  const handlePinPost = (postId) => {
    setPosts(ps => ps.map(p => p.userId === currentUser.id ? { ...p, isPinned: p.id === postId ? !p.isPinned : false } : p));
    showMsg("Post pin ho gaya! 📌");
  };

  const handleComment = (postId) => {
    if (!newComment[postId]?.trim()) return;
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, comments: [...p.comments, { id: Date.now(), userId: currentUser.id, text: newComment[postId], time: new Date().toLocaleTimeString() }] } : p));
    setNewComment(c => ({ ...c, [postId]: "" }));
  };

  const handleSavePost = (postId) => {
    setSavedPosts(s => s.includes(postId) ? s.filter(id => id !== postId) : [...s, postId]);
    showMsg(savedPosts.includes(postId) ? "Bookmark hata diya!" : "Snap bookmark ho gaya! 🔖");
  };

  const handleSendDM = () => {
    if (!dmText.trim() || !dmUser) return;
    const key = [currentUser.id, dmUser.id].sort().join("_");
    setMessages(m => ({ ...m, [key]: [...(m[key] || []), { id: Date.now(), from: currentUser.id, text: dmText, time: new Date().toLocaleTimeString() }] }));
    setDmText("");
  };

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) return;
    const group = { id: Date.now(), name: newGroup.name, description: newGroup.description, photo: newGroup.photo, adminId: currentUser.id, members: [currentUser.id, ...newGroup.members], messages: [], createdAt: new Date().toLocaleDateString() };
    setGroups(g => [group, ...g]);
    setNewGroup({ name: "", description: "", photo: "", members: [] });
    setShowGroupForm(false);
    showMsg("Group ban gaya! 👥");
  };

  const handleGroupMsg = (groupId) => {
    if (!newGroupMsg.trim()) return;
    setGroups(gs => gs.map(g => g.id === groupId ? { ...g, messages: [...g.messages, { id: Date.now(), userId: currentUser.id, text: newGroupMsg, time: new Date().toLocaleTimeString() }] } : g));
    setNewGroupMsg("");
  };

  const handleSaveEdit = () => {
    const updated = { ...currentUser, ...editForm };
    setCurrentUser(updated); setUsers(us => us.map(u => u.id === updated.id ? updated : u));
    setEditMode(false); showMsg("Profile update ho gaya! ✅");
  };

  const togglePrivacy = () => {
    const updated = { ...currentUser, isPrivate: !currentUser.isPrivate };
    setCurrentUser(updated); setUsers(us => us.map(u => u.id === updated.id ? updated : u));
    showMsg(updated.isPrivate ? "Account Private! 🔒" : "Account Public! 🌍");
  };

  const inputStyle = (err) => ({ width: "100%", padding: "12px 14px", borderRadius: 12, border: err ? "1.5px solid #f87171" : `1.5px solid ${border}`, background: inputBg, color: text, fontSize: 14, outline: "none", boxSizing: "border-box" });
  const Btn = ({ onClick, children, style = {} }) => <button onClick={onClick} style={{ padding: "12px 20px", borderRadius: 14, border: "none", background: currentTheme?.gradient || snapifyGradient, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", ...style }}>{children}</button>;

  const TickBadge = ({ tickType }) => {
    if (!tickType || !TICKS[tickType]) return null;
    const tick = TICKS[tickType];
    return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: tick.bg, fontSize: 11, border: `1px solid ${tick.color}` }}>{tick.icon}</span>;
  };

  const NameWithTick = ({ user, size = 14, weight = 700 }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ color: text, fontWeight: weight, fontSize: size }}>{user?.name}</span>
      {user?.tick && <TickBadge tickType={user.tick} />}
    </span>
  );

  const Avatar = ({ user, size = 44 }) => {
    const uTheme = getUserTheme(user);
    const hasStory = activeStories.some(s => s.userId === user?.id);
    return (
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: inputBg, display: "flex", alignItems: "center", justifyContent: "center", border: hasStory ? "2.5px solid #f97316" : `2px solid ${uTheme.color}` }}>
          {user?.photo ? <img src={user.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: size * 0.4 }}>👤</span>}
        </div>
        {user?.tick && <div style={{ position: "absolute", bottom: -2, right: -2, width: size * 0.35, height: size * 0.35, borderRadius: "50%", background: TICKS[user.tick].bg, border: `1px solid ${TICKS[user.tick].color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.2 }}>{TICKS[user.tick].icon}</div>}
      </div>
    );
  };

  const PostCard = ({ post, isAdmin = false }) => {
    const poster = users.find(u => u.id === post.userId);
    const originalPoster = post.isRepost ? users.find(u => u.id === post.originalUserId) : null;
    const saved = isSaved(post.id);
    const postBg = POST_BG_COLORS.find(b => b.id === post.bgColor);
    const imgFilter = PHOTO_FILTERS.find(f => f.id === post.filter)?.filter || "none";
    const [showComments, setShowComments] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const myReaction = post.userReactions?.[currentUser?.id || ""];
    const totalReactions = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);

    return (
      <div style={{ background: card, borderRadius: 20, overflow: "hidden", border: `1px solid ${post.isPinned ? "#f97316" : post.isPrivate ? "rgba(251,191,36,0.3)" : border}`, marginBottom: 12 }}>
        {post.isPinned && <div style={{ background: snapifyGradient, padding: "4px 12px", fontSize: 11, color: "#fff", fontWeight: 700 }}>📌 Pinned Snap</div>}
        {post.isRepost && <div style={{ padding: "8px 16px", background: inputBg, fontSize: 12, color: sub, display: "flex", alignItems: "center", gap: 6 }}>🔄 <span style={{ color: "#f97316", fontWeight: 700 }}>{poster?.name}</span> ne repost kiya</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px 8px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { if (!isAdmin) { setViewingUser(post.isRepost ? originalPoster : poster); setScreen("userProfile"); } }}>
            <Avatar user={post.isRepost ? originalPoster : poster} size={36} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <NameWithTick user={post.isRepost ? originalPoster : poster} size={13} />
                {post.isPrivate && <span style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontSize: 10, padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>🔒</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <p style={{ color: sub, fontSize: 10, margin: 0 }}>{post.time}</p>
                {post.location && <p style={{ color: sub, fontSize: 10, margin: 0 }}>📍 {post.location}</p>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {!isAdmin && post.userId === currentUser?.id && <button onClick={() => handlePinPost(post.id)} style={{ background: "none", border: "none", fontSize: 15, cursor: "pointer", opacity: post.isPinned ? 1 : 0.4 }}>📌</button>}
            {!isAdmin && <button onClick={() => handleSavePost(post.id)} style={{ background: "none", border: "none", fontSize: 15, cursor: "pointer" }}>{saved ? "🔖" : "🏷️"}</button>}
          </div>
        </div>

        {postBg?.bg ? (
          <div style={{ background: postBg.bg, padding: "32px 20px", textAlign: "center", minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>{post.text}</p>
          </div>
        ) : (
          <>
            {post.text && <p style={{ color: text, fontSize: 14, padding: "0 16px 10px", margin: 0 }}>{post.text}</p>}
            {post.photos.length > 0 && <div style={{ display: "grid", gridTemplateColumns: post.photos.length > 1 ? "1fr 1fr" : "1fr", gap: 2 }}>{post.photos.map((ph, i) => <img key={i} src={ph} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", filter: imgFilter }} />)}</div>}
            {post.video && <video src={post.video} controls style={{ width: "100%", maxHeight: 300, background: "#000" }} />}
          </>
        )}

        {post.poll && (
          <div style={{ margin: "0 12px 10px", padding: "12px", background: inputBg, borderRadius: 14, border: `1px solid ${border}` }}>
            <p style={{ color: text, fontWeight: 700, fontSize: 14, margin: "0 0 10px" }}>📊 {post.poll.question}</p>
            {post.poll.options.map((opt, idx) => {
              const totalVotes = Object.keys(post.poll.votes || {}).length;
              const optVotes = Object.values(post.poll.votes || {}).filter(v => v === idx).length;
              const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
              const voted = post.poll.votes?.[currentUser?.id] === idx;
              return (
                <div key={idx} onClick={() => !isAdmin && handleVotePoll(post.id, idx)} style={{ marginBottom: 8, cursor: "pointer", position: "relative", borderRadius: 10, overflow: "hidden", border: `1.5px solid ${voted ? "#f97316" : border}` }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: voted ? "rgba(249,115,22,0.2)" : inputBg, transition: "width 0.4s" }} />
                  <div style={{ position: "relative", padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: text, fontSize: 13, fontWeight: voted ? 700 : 400 }}>{opt}</span>
                    <span style={{ color: sub, fontSize: 12 }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
            <p style={{ color: sub, fontSize: 11, margin: "4px 0 0" }}>{Object.keys(post.poll.votes || {}).length} votes</p>
          </div>
        )}

        {post.music && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", background: inputBg, margin: "0 12px 8px", borderRadius: 10 }}>
            <span style={{ fontSize: 18 }}>{post.music.emoji}</span>
            <div><p style={{ color: text, fontSize: 12, fontWeight: 700, margin: 0 }}>{post.music.title}</p><p style={{ color: sub, fontSize: 11, margin: 0 }}>{post.music.artist}</p></div>
            <span style={{ marginLeft: "auto" }}>🎵</span>
          </div>
        )}

        {!isAdmin && (
          <div style={{ padding: "8px 16px 12px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
              <button onClick={() => setShowReactions(r => r === post.id ? null : post.id)} style={{ background: myReaction ? inputBg : "none", border: myReaction ? `1px solid ${border}` : "none", borderRadius: 8, padding: myReaction ? "4px 8px" : "0", color: myReaction ? text : sub, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                {myReaction || "🤍"} {totalReactions > 0 ? totalReactions : ""}
              </button>
              <button onClick={() => setShowComments(s => s === post.id ? null : post.id)} style={{ background: "none", border: "none", color: sub, fontSize: 13, cursor: "pointer" }}>💬 {post.comments.length}</button>
              <button onClick={() => handleSharePost(post.id)} style={{ background: "none", border: "none", color: sub, fontSize: 13, cursor: "pointer" }}>🔄 {post.shares || 0}</button>
              <span style={{ color: sub, fontSize: 12, marginLeft: "auto" }}>👁️ {post.views || 0}</span>
            </div>
            {showReactions === post.id && (
              <div style={{ display: "flex", gap: 8, padding: "10px 14px", background: dark ? "#1a1a2e" : "#fff", borderRadius: 30, border: `1px solid ${border}`, marginBottom: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", flexWrap: "wrap" }}>
                {REACTIONS.map(emoji => <button key={emoji} onClick={() => { handleReaction(post.id, emoji); setShowReactions(null); }} style={{ background: myReaction === emoji ? inputBg : "none", border: "none", fontSize: 24, cursor: "pointer", borderRadius: 8, padding: "4px", transform: myReaction === emoji ? "scale(1.3)" : "scale(1)" }}>{emoji}</button>)}
              </div>
            )}
            {Object.keys(post.reactions || {}).filter(k => post.reactions[k] > 0).length > 0 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                {Object.entries(post.reactions || {}).filter(([, v]) => v > 0).map(([emoji, count]) => <span key={emoji} style={{ background: inputBg, borderRadius: 20, padding: "3px 8px", fontSize: 12, color: text, border: `1px solid ${border}` }}>{emoji} {count}</span>)}
              </div>
            )}
            {showComments === post.id && (
              <>
                {post.comments.map(c => { const cu = users.find(u => u.id === c.userId); return <div key={c.id} style={{ marginBottom: 6, padding: "7px 10px", background: inputBg, borderRadius: 10 }}><span style={{ color: "#f97316", fontWeight: 700, fontSize: 12 }}>{cu?.name}: </span><span style={{ color: text, fontSize: 13 }}>{c.text}</span></div>; })}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input value={newComment[post.id] || ""} onChange={e => setNewComment(c => ({ ...c, [post.id]: e.target.value }))} placeholder="Comment likho..." style={{ ...inputStyle(false), fontSize: 13, padding: "8px 12px" }} />
                  <button onClick={() => handleComment(post.id)} style={{ background: snapifyGradient, border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>➤</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredUsers = users.filter(u => { if (currentUser?.blocked?.includes(u.id)) return false; return u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()); });
  const pendingRequests = (currentUser?.followRequests || []).map(id => users.find(u => u.id === id)).filter(Boolean);
  const userStories = users.filter(u => activeStories.some(s => s.userId === u.id) && u.id !== currentUser?.id && !isBlocked(u.id));
  const myGroups = groups.filter(g => g.members.includes(currentUser?.id));

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Segoe UI', sans-serif", transition: "all 0.3s" }}>
      {msg.text && <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: msg.type === "success" ? "#22c55e" : "#f87171", color: "#fff", padding: "10px 24px", borderRadius: 20, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>{msg.text}</div>}
      {birthdayAlert && <div style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", background: snapifyGradient, color: "#fff", padding: "12px 24px", borderRadius: 20, fontWeight: 700, fontSize: 13, zIndex: 9998, cursor: "pointer" }} onClick={() => setBirthdayAlert(null)}>🎂 {birthdayAlert.map(u => u.name).join(", ")} ka aaj birthday hai! 🎉</div>}

      {/* Story Viewer */}
      {viewingStory && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewingStory(null)}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            {(() => { const bg2 = POST_BG_COLORS.find(b => b.id === viewingStory.bgColor); const poster = users.find(u => u.id === viewingStory.userId); return <div style={{ background: bg2?.bg || "#1a1a2e", borderRadius: 20, overflow: "hidden", minHeight: 500 }}><div style={{ display: "flex", alignItems: "center", gap: 10, padding: 16 }}><Avatar user={poster} size={36} /><NameWithTick user={poster} size={14} /><span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginLeft: "auto" }}>Tap to close</span></div>{viewingStory.photo && <img src={viewingStory.photo} style={{ width: "100%", maxHeight: 350, objectFit: "cover" }} />}{viewingStory.text && <p style={{ color: "#fff", fontSize: 20, fontWeight: 800, textAlign: "center", padding: "20px", margin: 0 }}>{viewingStory.text}</p>}</div>; })()}
          </div>
        </div>
      )}

      {/* DM */}
      {dmUser && currentUser && (
        <div style={{ position: "fixed", inset: 0, background: bg, zIndex: 9997, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: `1px solid ${border}` }}>
            <button onClick={() => setDmUser(null)} style={{ background: "none", border: "none", color: text, fontSize: 22, cursor: "pointer" }}>←</button>
            <Avatar user={dmUser} size={36} />
            <NameWithTick user={dmUser} size={15} weight={800} />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {(messages[[currentUser.id, dmUser.id].sort().join("_")] || []).length === 0 ? <div style={{ textAlign: "center", marginTop: 80, color: sub }}><div style={{ fontSize: 48, marginBottom: 12 }}>💬</div><p>Pehla snap bhejo!</p></div> :
              (messages[[currentUser.id, dmUser.id].sort().join("_")] || []).map(m => (
                <div key={m.id} style={{ display: "flex", justifyContent: m.from === currentUser.id ? "flex-end" : "flex-start" }}>
                  <div style={{ background: m.from === currentUser.id ? snapifyGradient : inputBg, color: m.from === currentUser.id ? "#fff" : text, padding: "10px 14px", borderRadius: m.from === currentUser.id ? "18px 18px 4px 18px" : "18px 18px 18px 4px", maxWidth: "75%", fontSize: 14 }}>
                    <p style={{ margin: 0 }}>{m.text}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 10, opacity: 0.7 }}>{m.time}</p>
                  </div>
                </div>
              ))}
          </div>
          <div style={{ padding: 16, borderTop: `1px solid ${border}`, display: "flex", gap: 8 }}>
            <input value={dmText} onChange={e => setDmText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendDM()} placeholder="Snap bhejo..." style={{ ...inputStyle(false), flex: 1 }} />
            <button onClick={handleSendDM} style={{ background: snapifyGradient, border: "none", borderRadius: 14, padding: "12px 18px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 18 }}>➤</button>
          </div>
        </div>
      )}

      {/* Group Chat */}
      {viewingGroup && (
        <div style={{ position: "fixed", inset: 0, background: bg, zIndex: 9996, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: `1px solid ${border}` }}>
            <button onClick={() => setViewingGroup(null)} style={{ background: "none", border: "none", color: text, fontSize: 22, cursor: "pointer" }}>←</button>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: snapifyGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👥</div>
            <div><p style={{ color: text, fontWeight: 800, fontSize: 15, margin: 0 }}>{viewingGroup.name}</p><p style={{ color: sub, fontSize: 11, margin: 0 }}>{viewingGroup.members.length} members</p></div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {(viewingGroup.messages || []).length === 0 ? <div style={{ textAlign: "center", marginTop: 80, color: sub }}><div style={{ fontSize: 48, marginBottom: 12 }}>👥</div><p>Group mein pehla snap bhejo!</p></div> :
              viewingGroup.messages.map(m => {
                const sender = users.find(u => u.id === m.userId);
                const isMe = m.userId === currentUser?.id;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                    {!isMe && <Avatar user={sender} size={28} />}
                    <div style={{ background: isMe ? snapifyGradient : inputBg, color: isMe ? "#fff" : text, padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", maxWidth: "70%" }}>
                      {!isMe && <p style={{ color: "#f97316", fontSize: 11, fontWeight: 700, margin: "0 0 4px" }}>{sender?.name}</p>}
                      <p style={{ margin: 0, fontSize: 14 }}>{m.text}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 10, opacity: 0.7 }}>{m.time}</p>
                    </div>
                  </div>
                );
              })}
          </div>
          <div style={{ padding: 16, borderTop: `1px solid ${border}`, display: "flex", gap: 8 }}>
            <input value={newGroupMsg} onChange={e => setNewGroupMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleGroupMsg(viewingGroup.id)} placeholder="Group snap..." style={{ ...inputStyle(false), flex: 1 }} />
            <button onClick={() => handleGroupMsg(viewingGroup.id)} style={{ background: snapifyGradient, border: "none", borderRadius: 14, padding: "12px 18px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 18 }}>➤</button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {showNotif && (
        <div style={{ position: "fixed", top: 60, right: 16, width: 290, background: dark ? "#1a1a2e" : "#fff", borderRadius: 20, border: `1px solid ${border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", zIndex: 9995, maxHeight: 400, overflow: "auto", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ color: text, margin: 0, fontSize: 15, fontWeight: 800 }}>🔔 Notifications</h3>
            <button onClick={() => { setNotifications([]); setShowNotif(false); }} style={{ background: "none", border: "none", color: sub, cursor: "pointer", fontSize: 12 }}>Clear</button>
          </div>
          {notifications.length === 0 ? <p style={{ color: sub, fontSize: 13, textAlign: "center" }}>Koi notification nahi</p> :
            notifications.map(n => <div key={n.id} style={{ padding: "8px 10px", background: inputBg, borderRadius: 10, marginBottom: 6 }}><p style={{ color: text, fontSize: 13, margin: 0 }}>{n.text}</p><p style={{ color: sub, fontSize: 11, margin: "2px 0 0" }}>{n.time}</p></div>)}
        </div>
      )}

      {/* Top Bar */}
      {(screen === "home" || screen === "userProfile") && currentUser && (
        <div style={{ position: "sticky", top: 0, zIndex: 100, background: dark ? "rgba(10,10,15,0.95)" : "rgba(240,244,255,0.95)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${border}`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SNAPIFY_LOGO />
            <span style={{ fontWeight: 900, fontSize: 20, background: snapifyGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Snapify</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowNotif(!showNotif)} style={{ position: "relative", background: inputBg, border: `1px solid ${border}`, borderRadius: 12, padding: "8px 12px", color: text, cursor: "pointer", fontSize: 14 }}>🔔{notifications.length > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#f43f5e", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{notifications.length > 9 ? "9+" : notifications.length}</span>}</button>
            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 12, padding: "8px 12px", color: text, cursor: "pointer", fontSize: 14 }}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 80px" }}>

        {/* WELCOME */}
        {screen === "welcome" && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ width: 100, height: 100, borderRadius: 28, background: snapifyGradient, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(249,115,22,0.4)" }}>
              <svg width="56" height="56" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="16" r="9" fill="none" stroke="white" strokeWidth="3" />
                <circle cx="18" cy="16" r="4" fill="white" />
                <circle cx="28" cy="8" r="2.5" fill="white" />
                <line x1="18" y1="25" x2="18" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <line x1="11" y1="32" x2="25" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, margin: 0, background: snapifyGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Snapify</h1>
            <p style={{ color: sub, fontSize: 15, marginTop: 8, marginBottom: 12 }}>📸 Snap. Share. Connect.</p>
            <p style={{ color: sub, fontSize: 13, marginBottom: 40 }}>Apni duniya, apne andaaz mein</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => setScreen("signup")} style={{ padding: "16px", borderRadius: 16, border: "none", background: snapifyGradient, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 30px rgba(249,115,22,0.35)" }}>✨ Join Snapify</button>
              <button onClick={() => setScreen("login")} style={{ padding: "16px", borderRadius: 16, border: `2px solid ${border}`, background: card, color: text, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>🔑 Login Karo</button>
            </div>
            <p style={{ color: sub, fontSize: 11, marginTop: 24 }}>Admin: admin@snapify.com / admin123</p>
          </div>
        )}

        {/* SIGNUP */}
        {screen === "signup" && (
          <div style={{ background: card, borderRadius: 28, padding: 24, border: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setScreen("welcome")} style={{ background: "none", border: "none", color: text, fontSize: 22, cursor: "pointer" }}>←</button>
              <h2 style={{ color: text, margin: 0, fontSize: 20, fontWeight: 800 }}>📝 Join Snapify</h2>
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div onClick={() => fileRef.current.click()} style={{ width: 90, height: 90, borderRadius: "50%", background: inputBg, border: `2px dashed ${border}`, margin: "0 auto", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {form.photo ? <img src={form.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 32 }}>📸</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            </div>
            {[{ label: "Poora Naam", field: "name", placeholder: "Rahul Khan" }, { label: "Email", field: "email", type: "email", placeholder: "rahul@email.com" }, { label: "Password", field: "password", type: "password", placeholder: "6+ characters" }, { label: "Age", field: "age", type: "number", placeholder: "25" }, { label: "Phone", field: "phone", type: "tel", placeholder: "+91 98765 43210" }, { label: "Address", field: "address", placeholder: "Ghar ka address" }, { label: "City", field: "city", placeholder: "Mumbai" }, { label: "Country", field: "country", placeholder: "India" }, { label: "Date of Birth", field: "dob", type: "date" }, { label: "Bio", field: "bio", placeholder: "Apne baare mein likho..." }, { label: "Emergency Contact", field: "emergencyContact", placeholder: "Koi bhi naam" }, { label: "Emergency Phone", field: "emergencyPhone", type: "tel", placeholder: "+91 98765 43210" }].map(({ label, field, type = "text", placeholder }) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>{label}</label>
                <input type={type} value={form[field]} placeholder={placeholder} onChange={e => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: null })); }} style={inputStyle(errors[field])} />
                {errors[field] && <p style={{ color: "#f87171", fontSize: 11, margin: "3px 0 0" }}>⚠️ {errors[field]}</p>}
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>🌈 Theme</label>
              <div style={{ display: "flex", gap: 8 }}>{THEMES.map(t => <div key={t.id} onClick={() => setForm(f => ({ ...f, themeId: t.id }))} style={{ width: 32, height: 32, borderRadius: "50%", background: t.gradient, cursor: "pointer", border: form.themeId === t.id ? "3px solid #fff" : "3px solid transparent" }} />)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: inputBg, borderRadius: 12, marginBottom: 16 }}>
              <span style={{ color: text, fontSize: 14, fontWeight: 600 }}>🔒 Private Account</span>
              <div onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))} style={{ width: 44, height: 24, borderRadius: 12, background: form.isPrivate ? "#f97316" : border, cursor: "pointer", position: "relative" }}>
                <div style={{ position: "absolute", top: 2, left: form.isPrivate ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "all 0.3s" }} />
              </div>
            </div>
            <button onClick={handleSignup} style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", background: snapifyGradient, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>🚀 Snapify Join Karo!</button>
          </div>
        )}

        {/* LOGIN */}
        {screen === "login" && (
          <div style={{ background: card, borderRadius: 28, padding: 24, border: `1px solid ${border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setScreen("welcome")} style={{ background: "none", border: "none", color: text, fontSize: 22, cursor: "pointer" }}>←</button>
              <h2 style={{ color: text, margin: 0, fontSize: 20, fontWeight: 800 }}>🔑 Snapify Login</h2>
            </div>
            {["email", "password"].map(field => (
              <div key={field} style={{ marginBottom: 14 }}>
                <label style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>{field === "email" ? "Email" : "Password"}</label>
                <input type={field} value={loginForm[field]} placeholder={field === "email" ? "email@snapify.com" : "Password"} onChange={e => setLoginForm(f => ({ ...f, [field]: e.target.value }))} style={inputStyle(false)} />
              </div>
            ))}
            {errors.login && <p style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>⚠️ {errors.login}</p>}
            <button onClick={handleLogin} style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", background: snapifyGradient, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>🚀 Login Karo</button>
          </div>
        )}

        {/* HOME */}
        {screen === "home" && currentUser && (
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 16, background: card, borderRadius: 16, padding: 5, border: `1px solid ${border}`, overflowX: "auto" }}>
              {[{ id: "feed", icon: "🏠", label: "Feed" }, { id: "profile", icon: "👤", label: "Profile" }, { id: "search", icon: "🔍", label: "Search" }, { id: "groups", icon: "👥", label: "Groups" }, { id: "leaderboard", icon: "🏆", label: "Top" }, { id: "saved", icon: "🔖", label: "Saved" }, { id: "notes", icon: "📝", label: "Notes" }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flexShrink: 0, padding: "8px 10px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, background: activeTab === tab.id ? snapifyGradient : "transparent", color: activeTab === tab.id ? "#fff" : sub, minWidth: 50 }}>
                  {tab.icon}<br />{tab.label}
                </button>
              ))}
            </div>

            {activeTab === "feed" && (
              <div>
                {/* Stories */}
                <div style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
                  <div style={{ flexShrink: 0, textAlign: "center", cursor: "pointer" }} onClick={() => setShowStoryForm(true)}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: snapifyGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto" }}>➕</div>
                    <p style={{ color: sub, fontSize: 10, margin: "4px 0 0", fontWeight: 600 }}>Story</p>
                  </div>
                  {userStories.map(u => (
                    <div key={u.id} style={{ flexShrink: 0, textAlign: "center", cursor: "pointer" }} onClick={() => { const s = activeStories.find(st => st.userId === u.id); if (s) setViewingStory(s); }}>
                      <Avatar user={u} size={60} />
                      <p style={{ color: text, fontSize: 10, margin: "4px 0 0", fontWeight: 600, maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name.split(" ")[0]}</p>
                    </div>
                  ))}
                </div>

                {showStoryForm && (
                  <div style={{ background: card, borderRadius: 20, padding: 16, border: `1px solid ${border}`, marginBottom: 16 }}>
                    <h3 style={{ color: text, margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>📸 Snap Story</h3>
                    <textarea value={newStory.text} onChange={e => setNewStory(s => ({ ...s, text: e.target.value }))} placeholder="Story mein kuch likho..." style={{ ...inputStyle(false), resize: "none", height: 60, marginBottom: 10 }} />
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>{POST_BG_COLORS.filter(b => b.bg).map(b => <div key={b.id} onClick={() => setNewStory(s => ({ ...s, bgColor: b.id }))} style={{ width: 28, height: 28, borderRadius: 8, background: b.bg, cursor: "pointer", border: newStory.bgColor === b.id ? "2px solid #fff" : "2px solid transparent" }} />)}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => storyFileRef.current.click()} style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "8px 12px", color: text, cursor: "pointer", fontSize: 13 }}>📸</button>
                      <input ref={storyFileRef} type="file" accept="image/*" onChange={handleStoryPhoto} style={{ display: "none" }} />
                      <button onClick={handleAddStory} style={{ flex: 1, padding: "8px", borderRadius: 12, border: "none", background: snapifyGradient, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Add Story</button>
                      <button onClick={() => setShowStoryForm(false)} style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "8px 12px", color: text, cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                )}

                {/* Giveaway */}
                {giveaway && (
                  <div style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(236,72,153,0.15))", borderRadius: 20, padding: 16, border: "1px solid rgba(249,115,22,0.3)", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ color: "#f97316", fontWeight: 800, fontSize: 16, margin: 0 }}>🎁 {giveaway.title}</p>
                        <p style={{ color: text, fontSize: 13, margin: "4px 0" }}>Prize: {giveaway.prize}</p>
                        <p style={{ color: sub, fontSize: 12, margin: 0 }}>End: {giveaway.endDate} • {giveaway.participants?.length || 0} joined</p>
                      </div>
                      <button onClick={() => { if (giveaway.participants?.includes(currentUser.id)) { showMsg("Already join kiya!"); return; } setGiveaway(g => ({ ...g, participants: [...(g.participants || []), currentUser.id] })); showMsg("Giveaway join! 🎁"); }} style={{ background: giveaway.participants?.includes(currentUser.id) ? inputBg : snapifyGradient, border: "none", borderRadius: 12, padding: "10px 16px", color: giveaway.participants?.includes(currentUser.id) ? sub : "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        {giveaway.participants?.includes(currentUser.id) ? "✅ Joined" : "🎁 Join"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Follow Requests */}
                {pendingRequests.length > 0 && (
                  <div style={{ background: card, borderRadius: 20, padding: 16, border: "1px solid rgba(251,191,36,0.3)", marginBottom: 16 }}>
                    <p style={{ color: "#fbbf24", fontWeight: 800, fontSize: 14, margin: "0 0 12px" }}>📨 Follow Requests ({pendingRequests.length})</p>
                    {pendingRequests.map(u => (
                      <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar user={u} size={36} /><NameWithTick user={u} size={13} /></div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleFollowRequest(u.id, true)} style={{ background: "#22c55e", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✅</button>
                          <button onClick={() => handleFollowRequest(u.id, false)} style={{ background: "#f87171", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>❌</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Form */}
                <div style={{ background: card, borderRadius: 20, padding: 16, border: `1px solid ${border}`, marginBottom: 16 }}>
                  {!showPostForm ? (
                    <div style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }} onClick={() => setShowPostForm(true)}>
                      <Avatar user={currentUser} size={40} />
                      <div style={{ flex: 1, padding: "10px 14px", background: inputBg, borderRadius: 12, color: sub, fontSize: 14 }}>Kya snap share karoge? 📸</div>
                    </div>
                  ) : (
                    <div>
                      <textarea value={newPost.text} onChange={e => setNewPost(p => ({ ...p, text: e.target.value }))} placeholder="Kya soch rahe ho?" style={{ ...inputStyle(false), resize: "none", height: 80, marginBottom: 10, fontSize: 14 }} />
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ color: sub, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>🎨 Background</p>
                        <div style={{ display: "flex", gap: 5 }}>{POST_BG_COLORS.map(b => <div key={b.id} onClick={() => setNewPost(p => ({ ...p, bgColor: b.id }))} style={{ width: 26, height: 26, borderRadius: 6, background: b.bg || inputBg, cursor: "pointer", border: newPost.bgColor === b.id ? "2px solid #fff" : `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: sub }}>{b.id === "none" ? "✕" : ""}</div>)}</div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ color: sub, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>📸 Filter</p>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{PHOTO_FILTERS.map(f => <button key={f.id} onClick={() => setNewPost(p => ({ ...p, filter: f.id }))} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${newPost.filter === f.id ? "#f97316" : border}`, background: newPost.filter === f.id ? "rgba(249,115,22,0.15)" : inputBg, color: newPost.filter === f.id ? "#f97316" : sub, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>{f.label}</button>)}</div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ color: sub, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>🎵 Music</p>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          <button onClick={() => setNewPost(p => ({ ...p, music: null }))} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${!newPost.music ? "#f97316" : border}`, background: !newPost.music ? "rgba(249,115,22,0.15)" : inputBg, color: !newPost.music ? "#f97316" : sub, fontSize: 11, cursor: "pointer" }}>None</button>
                          {MUSIC_LIST.map(m => <button key={m.id} onClick={() => setNewPost(p => ({ ...p, music: m }))} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${newPost.music?.id === m.id ? "#f97316" : border}`, background: newPost.music?.id === m.id ? "rgba(249,115,22,0.15)" : inputBg, color: newPost.music?.id === m.id ? "#f97316" : sub, fontSize: 11, cursor: "pointer" }}>{m.emoji} {m.title}</button>)}
                        </div>
                      </div>
                      <input value={newPost.location} onChange={e => setNewPost(p => ({ ...p, location: e.target.value }))} placeholder="📍 Location (optional)" style={{ ...inputStyle(false), marginBottom: 10, fontSize: 13 }} />
                      {showPollForm && (
                        <div style={{ background: inputBg, borderRadius: 14, padding: 12, marginBottom: 10, border: `1px solid ${border}` }}>
                          <input value={pollText.q} onChange={e => setPollText(p => ({ ...p, q: e.target.value }))} placeholder="Poll question..." style={{ ...inputStyle(false), marginBottom: 8, fontSize: 13 }} />
                          {["o1", "o2", "o3"].map((k, i) => <input key={k} value={pollText[k]} onChange={e => setPollText(p => ({ ...p, [k]: e.target.value }))} placeholder={`Option ${i + 1}...`} style={{ ...inputStyle(false), marginBottom: 6, fontSize: 13 }} />)}
                          <button onClick={() => { if (!pollText.q || !pollText.o1 || !pollText.o2) return; setNewPost(p => ({ ...p, poll: { question: pollText.q, options: [pollText.o1, pollText.o2, pollText.o3].filter(Boolean) } })); setShowPollForm(false); showMsg("Poll ready! 📊"); }} style={{ background: snapifyGradient, border: "none", borderRadius: 10, padding: "8px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, width: "100%" }}>✅ Add Poll</button>
                        </div>
                      )}
                      {newPost.photos.length > 0 && <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>{newPost.photos.map((ph, i) => <img key={i} src={ph} style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover" }} />)}</div>}
                      {newPost.video && <div style={{ marginBottom: 10 }}><video src={newPost.video} style={{ width: "100%", maxHeight: 150, borderRadius: 10 }} controls /></div>}
                      {newPost.poll && <div style={{ background: inputBg, borderRadius: 10, padding: 10, marginBottom: 10 }}><p style={{ color: "#f97316", fontSize: 12, fontWeight: 700, margin: 0 }}>📊 {newPost.poll.question}</p></div>}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => postFileRef.current.click()} style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "7px 10px", color: text, cursor: "pointer", fontSize: 13 }}>📸</button>
                          <input ref={postFileRef} type="file" accept="image/*" multiple onChange={handlePostPhotos} style={{ display: "none" }} />
                          <button onClick={() => postVideoRef.current.click()} style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "7px 10px", color: text, cursor: "pointer", fontSize: 13 }}>🎥</button>
                          <input ref={postVideoRef} type="file" accept="video/*" onChange={handlePostVideo} style={{ display: "none" }} />
                          <button onClick={() => setShowPollForm(!showPollForm)} style={{ background: showPollForm ? "rgba(249,115,22,0.15)" : inputBg, border: `1px solid ${showPollForm ? "#f97316" : border}`, borderRadius: 10, padding: "7px 10px", color: showPollForm ? "#f97316" : text, cursor: "pointer", fontSize: 13 }}>📊</button>
                          <div onClick={() => setNewPost(p => ({ ...p, isPrivate: !p.isPrivate }))} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", background: newPost.isPrivate ? "rgba(251,191,36,0.15)" : inputBg, border: `1px solid ${newPost.isPrivate ? "rgba(251,191,36,0.4)" : border}`, borderRadius: 10, padding: "7px 10px" }}>
                            <span style={{ fontSize: 13 }}>{newPost.isPrivate ? "🔒" : "🌍"}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => { setShowPostForm(false); setShowPollForm(false); }} style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 12, padding: "8px 12px", color: text, cursor: "pointer" }}>✕</button>
                          <button onClick={handlePost} style={{ background: snapifyGradient, border: "none", borderRadius: 12, padding: "8px 16px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>📸 Snap!</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <input value={postSearch} onChange={e => setPostSearch(e.target.value)} placeholder="🔍 Snaps search karo..." style={{ ...inputStyle(false), marginBottom: 16, fontSize: 13 }} />

                {posts.filter(p => {
                  if (p.userId === currentUser.id) return true;
                  if (p.isPrivate) return false;
                  const poster = users.find(u => u.id === p.userId);
                  if (isBlocked(poster?.id)) return false;
                  if (poster?.isPrivate && !currentUser.following?.includes(p.userId)) return false;
                  if (postSearch && !p.text?.toLowerCase().includes(postSearch.toLowerCase())) return false;
                  return true;
                }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(post => <PostCard key={post.id} post={post} />)}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <div style={{ height: 120, background: snapifyGradient, borderRadius: "20px 20px 0 0", position: "relative" }}>
                  <div style={{ position: "absolute", bottom: -40, left: 20 }}><Avatar user={currentUser} size={80} /></div>
                </div>
                <div style={{ background: card, borderRadius: "0 0 20px 20px", padding: "52px 20px 20px", border: `1px solid ${border}`, marginBottom: 16 }}>
                  {!editMode ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <NameWithTick user={currentUser} size={22} weight={900} />
                            {currentUser.isPrivate && <span style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>🔒</span>}
                          </div>
                          {currentUser.tick && <span style={{ background: TICKS[currentUser.tick].bg, color: TICKS[currentUser.tick].color, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8, border: `1px solid ${TICKS[currentUser.tick].color}`, marginTop: 6, display: "inline-block" }}>{TICKS[currentUser.tick].icon} {TICKS[currentUser.tick].label}</span>}
                          {currentUser.city && <p style={{ color: sub, fontSize: 13, margin: "6px 0 0" }}>📍 {currentUser.city}{currentUser.country ? `, ${currentUser.country}` : ""}</p>}
                          {currentUser.bio && <p style={{ color: text, fontSize: 14, marginTop: 8 }}>{currentUser.bio}</p>}
                        </div>
                        <button onClick={() => { setEditForm({ ...currentUser }); setEditMode(true); }} style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 12, padding: "8px 14px", color: text, cursor: "pointer", fontSize: 13, height: "fit-content" }}>✏️</button>
                      </div>
                      <div style={{ marginTop: 10, padding: "8px 12px", background: inputBg, borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: sub, fontSize: 12 }}>🔗 Snapify Link</span>
                        <button onClick={() => { navigator.clipboard?.writeText(`snapify.app/user/${currentUser.id}`); showMsg("Link copy ho gaya! 🔗"); }} style={{ background: snapifyGradient, border: "none", borderRadius: 8, padding: "4px 10px", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Copy</button>
                      </div>
                      {currentUser.emergencyContact && <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(239,68,68,0.1)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.3)" }}><p style={{ color: "#f87171", fontSize: 12, fontWeight: 700, margin: "0 0 2px" }}>🚨 Emergency</p><p style={{ color: text, fontSize: 12, margin: 0 }}>{currentUser.emergencyContact} — {currentUser.emergencyPhone}</p></div>}
                      <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                        <div style={{ textAlign: "center" }}><p style={{ color: text, fontWeight: 900, fontSize: 20, margin: 0 }}>{getUserPosts(currentUser.id, false, currentUser.id).length}</p><p style={{ color: sub, fontSize: 12, margin: 0 }}>Snaps</p></div>
                        <div style={{ textAlign: "center" }}><p style={{ color: text, fontWeight: 900, fontSize: 20, margin: 0 }}>{(currentUser.followers || []).length}</p><p style={{ color: sub, fontSize: 12, margin: 0 }}>Followers</p></div>
                        <div style={{ textAlign: "center" }}><p style={{ color: text, fontWeight: 900, fontSize: 20, margin: 0 }}>{(currentUser.following || []).length}</p><p style={{ color: sub, fontSize: 12, margin: 0 }}>Following</p></div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: inputBg, borderRadius: 12, marginTop: 16 }}>
                        <p style={{ color: text, fontSize: 13, fontWeight: 700, margin: 0 }}>{currentUser.isPrivate ? "🔒 Private" : "🌍 Public"}</p>
                        <div onClick={togglePrivacy} style={{ width: 44, height: 24, borderRadius: 12, background: currentUser.isPrivate ? "#f97316" : border, cursor: "pointer", position: "relative" }}>
                          <div style={{ position: "absolute", top: 2, left: currentUser.isPrivate ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "all 0.3s" }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <p style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>🏆 Badges</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{BADGES.filter(b => b.condition(currentUser, posts)).map(b => <div key={b.id} style={{ background: inputBg, borderRadius: 10, padding: "5px 10px", border: `1px solid ${border}`, fontSize: 12, color: text, fontWeight: 600 }}>{b.icon} {b.label}</div>)}</div>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <p style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>🌈 Theme</p>
                        <div style={{ display: "flex", gap: 8 }}>{THEMES.map(t => <div key={t.id} onClick={() => { const u = { ...currentUser, themeId: t.id }; setCurrentUser(u); setUsers(us => us.map(x => x.id === u.id ? u : x)); }} style={{ width: 28, height: 28, borderRadius: "50%", background: t.gradient, cursor: "pointer", border: currentUser.themeId === t.id ? "3px solid #fff" : "3px solid transparent" }} />)}</div>
                      </div>
                      <button onClick={() => { setCurrentUser(null); setScreen("welcome"); }} style={{ marginTop: 20, width: "100%", padding: "12px", borderRadius: 14, border: "none", background: "#f87171", color: "#fff", fontWeight: 700, cursor: "pointer" }}>🚪 Logout</button>
                    </>
                  ) : (
                    <div>
                      <h3 style={{ color: text, marginTop: 0, fontSize: 16, fontWeight: 800 }}>✏️ Profile Edit</h3>
                      {[{ label: "Naam", field: "name" }, { label: "Bio", field: "bio" }, { label: "City", field: "city" }, { label: "Country", field: "country" }, { label: "Phone", field: "phone" }, { label: "Address", field: "address" }, { label: "Emergency Contact", field: "emergencyContact" }, { label: "Emergency Phone", field: "emergencyPhone" }].map(({ label, field }) => (
                        <div key={field} style={{ marginBottom: 12 }}>
                          <label style={{ color: sub, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>{label}</label>
                          <input value={editForm[field] || ""} onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))} style={inputStyle(false)} />
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleSaveEdit} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none", background: snapifyGradient, color: "#fff", fontWeight: 700, cursor: "pointer" }}>💾 Save</button>
                        <button onClick={() => setEditMode(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: `1px solid ${border}`, background: inputBg, color: text, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
                {[...getUserPosts(currentUser.id, false, currentUser.id)].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(post => <PostCard key={post.id} post={post} />)}
              </div>
            )}

            {activeTab === "search" && (
              <div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Snappers dhundo..." style={{ ...inputStyle(false), marginBottom: 16 }} />
                {filteredUsers.filter(u => u.id !== currentUser.id).map(u => (
                  <div key={u.id} style={{ background: card, borderRadius: 16, padding: 14, border: `1px solid ${border}`, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => { setViewingUser(u); setScreen("userProfile"); }}>
                      <Avatar user={u} size={44} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><NameWithTick user={u} size={14} />{u.isPrivate && <span>🔒</span>}</div>
                        <p style={{ color: sub, fontSize: 12, margin: "2px 0 0" }}>{u.city || u.email}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setDmUser(u)} style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "8px 10px", color: text, fontSize: 13, cursor: "pointer" }}>💬</button>
                      <button onClick={() => handleFollowAction(u.id)} style={{ background: isFollowing(u.id) ? inputBg : isPendingRequest(u.id) ? "rgba(251,191,36,0.15)" : snapifyGradient, border: `1px solid ${isFollowing(u.id) ? border : "transparent"}`, borderRadius: 10, padding: "8px 10px", color: isFollowing(u.id) ? text : isPendingRequest(u.id) ? "#fbbf24" : "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                        {isFollowing(u.id) ? "✅" : isPendingRequest(u.id) ? "⏳" : "➕"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "groups" && (
              <div>
                <button onClick={() => setShowGroupForm(!showGroupForm)} style={{ width: "100%", padding: "12px", borderRadius: 14, border: "none", background: snapifyGradient, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 16 }}>👥 Naya Group Banao</button>
                {showGroupForm && (
                  <div style={{ background: card, borderRadius: 20, padding: 16, border: `1px solid ${border}`, marginBottom: 16 }}>
                    <input value={newGroup.name} onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))} placeholder="Group naam..." style={{ ...inputStyle(false), marginBottom: 10 }} />
                    <input value={newGroup.description} onChange={e => setNewGroup(g => ({ ...g, description: e.target.value }))} placeholder="Description..." style={{ ...inputStyle(false), marginBottom: 10 }} />
                    <p style={{ color: sub, fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>Members:</p>
                    {users.filter(u => u.id !== currentUser.id).map(u => (
                      <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar user={u} size={32} /><NameWithTick user={u} size={13} /></div>
                        <div onClick={() => setNewGroup(g => ({ ...g, members: g.members.includes(u.id) ? g.members.filter(id => id !== u.id) : [...g.members, u.id] }))} style={{ width: 24, height: 24, borderRadius: "50%", background: newGroup.members.includes(u.id) ? snapifyGradient : inputBg, border: `1px solid ${border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>
                          {newGroup.members.includes(u.id) ? "✓" : ""}
                        </div>
                      </div>
                    ))}
                    <button onClick={handleCreateGroup} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: snapifyGradient, color: "#fff", fontWeight: 700, cursor: "pointer", marginTop: 10 }}>✅ Group Banao</button>
                  </div>
                )}
                {myGroups.length === 0 ? <div style={{ textAlign: "center", padding: "48px 0", color: sub }}><div style={{ fontSize: 48, marginBottom: 12 }}>👥</div><p>Koi group nahi!</p></div> :
                  myGroups.map(g => (
                    <div key={g.id} style={{ background: card, borderRadius: 16, padding: 14, border: `1px solid ${border}`, marginBottom: 10, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setViewingGroup(g)}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: snapifyGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👥</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: text, fontWeight: 700, fontSize: 14, margin: 0 }}>{g.name}</p>
                        <p style={{ color: sub, fontSize: 12, margin: "2px 0 0" }}>{g.members.length} members • {g.messages.length} messages</p>
                      </div>
                      <span style={{ color: sub, fontSize: 18 }}>→</span>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div>
                <div style={{ background: snapifyGradient, borderRadius: 20, padding: 20, marginBottom: 16, textAlign: "center" }}>
                  <p style={{ color: "#fff", fontSize: 32, margin: 0 }}>🏆</p>
                  <p style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: "4px 0" }}>Snapify Top</p>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>Snaps×5 + Followers×3 + Reactions×2</p>
                </div>
                {getLeaderboard().length === 0 ? <div style={{ textAlign: "center", padding: "48px 0", color: sub }}><div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div><p>Abhi koi nahi!</p></div> :
                  getLeaderboard().map((u, i) => (
                    <div key={u.id} style={{ background: card, borderRadius: 16, padding: 14, border: `1px solid ${i < 3 ? ["rgba(255,215,0,0.4)", "rgba(192,192,192,0.4)", "rgba(205,127,50,0.4)"][i] : border}`, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: i < 3 ? ["linear-gradient(135deg, #ffd700, #ff8c00)", "linear-gradient(135deg, #c0c0c0, #808080)", "linear-gradient(135deg, #cd7f32, #8b4513)"][i] : inputBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 18 : 14, color: "#fff", fontWeight: 900, flexShrink: 0 }}>
                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                      </div>
                      <Avatar user={u} size={40} />
                      <div style={{ flex: 1 }}>
                        <NameWithTick user={u} size={14} weight={800} />
                        <p style={{ color: sub, fontSize: 12, margin: "2px 0 0" }}>{getUserPosts(u.id, true).length} snaps • {(u.followers || []).length} followers</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "#f97316", fontWeight: 900, fontSize: 18, margin: 0 }}>{u.score}</p>
                        <p style={{ color: sub, fontSize: 10, margin: 0 }}>pts</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === "saved" && (
              <div>
                <h3 style={{ color: text, margin: "0 0 16px", fontSize: 16, fontWeight: 800 }}>🔖 Saved Snaps</h3>
                {savedPosts.length === 0 ? <div style={{ textAlign: "center", padding: "48px 0", color: sub }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔖</div><p>Koi saved snap nahi!</p></div> :
                  posts.filter(p => savedPosts.includes(p.id)).map(post => <PostCard key={post.id} post={post} />)}
              </div>
            )}

            {activeTab === "notes" && (
              <div>
                <div style={{ background: card, borderRadius: 20, padding: 16, border: `1px solid ${border}`, marginBottom: 16 }}>
                  <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="📝 Apne liye kuch likho..." style={{ ...inputStyle(false), resize: "none", height: 80, marginBottom: 10 }} />
                  <button onClick={() => { if (!newNote.trim()) return; setNotes(n => [{ id: Date.now(), text: newNote, time: new Date().toLocaleString() }, ...n]); setNewNote(""); showMsg("Note save! 📝"); }} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: snapifyGradient, color: "#fff", fontWeight: 700, cursor: "pointer" }}>💾 Save Note</button>
                </div>
                {notes.map(n => <div key={n.id} style={{ background: card, borderRadius: 16, padding: 14, border: `1px solid ${border}`, marginBottom: 10 }}><p style={{ color: text, fontSize: 14, margin: "0 0 6px" }}>{n.text}</p><div style={{ display: "flex", justifyContent: "space-between" }}><p style={{ color: sub, fontSize: 11, margin: 0 }}>{n.time}</p><button onClick={() => setNotes(ns => ns.filter(x => x.id !== n.id))} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>🗑️</button></div></div>)}
              </div>
            )}
          </div>
        )}

        {screen === "userProfile" && viewingUser && (
          <div>
            <button onClick={() => setScreen("home")} style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: "8px 16px", color: text, cursor: "pointer", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>← Wapas</button>
            <div style={{ height: 120, background: getUserTheme(viewingUser).gradient, borderRadius: "20px 20px 0 0", position: "relative" }}>
              <div style={{ position: "absolute", bottom: -40, left: 20 }}><Avatar user={viewingUser} size={80} /></div>
            </div>
            <div style={{ background: card, borderRadius: "0 0 20px 20px", padding: "52px 20px 20px", border: `1px solid ${border}`, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><NameWithTick user={viewingUser} size={20} weight={900} />{viewingUser.isPrivate && <span style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>🔒</span>}</div>
                  {viewingUser.tick && <span style={{ background: TICKS[viewingUser.tick].bg, color: TICKS[viewingUser.tick].color, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8, border: `1px solid ${TICKS[viewingUser.tick].color}`, marginTop: 6, display: "inline-block" }}>{TICKS[viewingUser.tick].icon} {TICKS[viewingUser.tick].label}</span>}
                  {canViewProfile(viewingUser, false, currentUser?.id) && (<>{viewingUser.city && <p style={{ color: sub, fontSize: 13, margin: "6px 0 0" }}>📍 {viewingUser.city}</p>}{viewingUser.bio && <p style={{ color: text, fontSize: 14, marginTop: 8 }}>{viewingUser.bio}</p>}</>)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {currentUser && viewingUser.id !== currentUser.id && (<>
                    <button onClick={() => handleFollowAction(viewingUser.id)} style={{ background: isFollowing(viewingUser.id) ? inputBg : isPendingRequest(viewingUser.id) ? "rgba(251,191,36,0.15)" : snapifyGradient, border: "none", borderRadius: 12, padding: "8px 14px", color: isFollowing(viewingUser.id) ? text : isPendingRequest(viewingUser.id) ? "#fbbf24" : "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{isFollowing(viewingUser.id) ? "✅ Following" : isPendingRequest(viewingUser.id) ? "⏳" : "➕ Follow"}</button>
                    <button onClick={() => setDmUser(viewingUser)} style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: 12, padding: "8px 14px", color: text, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>💬 Snap</button>
                    <button onClick={() => handleBlock(viewingUser.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "8px 14px", color: "#f87171", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{isBlocked(viewingUser.id) ? "✅ Unblock" : "🚫 Block"}</button>
                  </>)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                <div style={{ textAlign: "center" }}><p style={{ color: text, fontWeight: 900, fontSize: 20, margin: 0 }}>{canViewProfile(viewingUser, false, currentUser?.id) ? getUserPosts(viewingUser.id, false, currentUser?.id).length : "🔒"}</p><p style={{ color: sub, fontSize: 12, margin: 0 }}>Snaps</p></div>
                <div style={{ textAlign: "center" }}><p style={{ color: text, fontWeight: 900, fontSize: 20, margin: 0 }}>{(viewingUser.followers || []).length}</p><p style={{ color: sub, fontSize: 12, margin: 0 }}>Followers</p></div>
                <div style={{ textAlign: "center" }}><p style={{ color: text, fontWeight: 900, fontSize: 20, margin: 0 }}>{(viewingUser.following || []).length}</p><p style={{ color: sub, fontSize: 12, margin: 0 }}>Following</p></div>
              </div>
              {!canViewProfile(viewingUser, false, currentUser?.id) && <div style={{ marginTop: 20, textAlign: "center", padding: "24px", background: inputBg, borderRadius: 16 }}><div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div><p style={{ color: text, fontWeight: 700, fontSize: 15, margin: 0 }}>Private Account</p><p style={{ color: sub, fontSize: 13, marginTop: 6 }}>Follow karo snaps dekhne ke liye</p></div>}
            </div>
            {canViewProfile(viewingUser, false, currentUser?.id) && getUserPosts(viewingUser.id, false, currentUser?.id).map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}

        {screen === "admin" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SNAPIFY_LOGO />
                <span style={{ fontWeight: 900, fontSize: 18, background: snapifyGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Admin Panel</span>
              </div>
              <button onClick={() => setScreen("welcome")} style={{ background: "#f87171", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Logout</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {["stats", "users", "posts", "giveaway"].map(tab => (
                <button key={tab} onClick={() => setAdminTab(tab)} style={{ flex: 1, padding: "10px 6px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, background: adminTab === tab ? snapifyGradient : card, color: adminTab === tab ? "#fff" : text, minWidth: 70 }}>
                  {tab === "stats" ? "📊 Stats" : tab === "users" ? "👥 Users" : tab === "posts" ? "📸 Snaps" : "🎁 Giveaway"}
                </button>
              ))}
            </div>

            {adminTab === "stats" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: "👥", label: "Snappers", val: users.length },
                  { icon: "📸", label: "Snaps", val: posts.length },
                  { icon: "👥", label: "Groups", val: groups.length },
                  { icon: "🔄", label: "Reposts", val: posts.filter(p => p.isRepost).length },
                  { icon: "📊", label: "Polls", val: posts.filter(p => p.poll).length },
                  { icon: "✅", label: "Blue Tick", val: users.filter(u => u.tick === "blue").length },
                  { icon: "⭐", label: "Gold VIP", val: users.filter(u => u.tick === "gold").length },
                  { icon: "🔒", label: "Private", val: users.filter(u => u.isPrivate).length },
                  { icon: "❤️", label: "Reactions", val: posts.reduce((a, p) => a + Object.values(p.reactions || {}).reduce((x, y) => x + y, 0), 0) },
                  { icon: "🔖", label: "Saves", val: savedPosts.length },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{ background: card, borderRadius: 16, padding: 14, border: `1px solid ${border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                    <p style={{ color: text, fontWeight: 900, fontSize: 22, margin: 0 }}>{val}</p>
                    <p style={{ color: sub, fontSize: 11, margin: "2px 0 0" }}>{label}</p>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "users" && (
              <div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Snapper dhundo..." style={{ ...inputStyle(false), marginBottom: 12 }} />
                {filteredUsers.map(u => (
                  <div key={u.id} style={{ background: card, borderRadius: 20, padding: 16, border: `1px solid ${border}`, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <Avatar user={u} size={44} />
                      <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><NameWithTick user={u} size={14} weight={800} />{u.isPrivate && <span style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", fontSize: 10, padding: "2px 6px", borderRadius: 6 }}>🔒</span>}</div><p style={{ color: sub, fontSize: 12, margin: "2px 0 0" }}>{u.email}</p></div>
                      <button onClick={() => { setUsers(us => us.filter(x => x.id !== u.id)); setPosts(ps => ps.filter(p => p.userId !== u.id)); showMsg("Delete! 🗑️"); }} style={{ background: "#f87171", border: "none", borderRadius: 10, padding: "8px 10px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🗑️</button>
                    </div>
                    <div style={{ padding: "10px 12px", background: inputBg, borderRadius: 12 }}>
                      <p style={{ color: sub, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>Tick Do</p>
                      <div style={{ display: "flex", gap: 6 }}>{Object.entries(TICKS).map(([key, tick]) => <button key={key} onClick={() => handleGiveTick(u.id, key)} style={{ flex: 1, padding: "7px 4px", borderRadius: 10, border: `1.5px solid ${u.tick === key ? tick.color : border}`, background: u.tick === key ? tick.bg : "transparent", color: u.tick === key ? tick.color : sub, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{tick.icon} {tick.label}</button>)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <span style={{ color: sub, fontSize: 12 }}>📸 {posts.filter(p => p.userId === u.id).length} snaps</span>
                      <span style={{ color: sub, fontSize: 12 }}>👥 {(u.followers || []).length} followers</span>
                      {u.emergencyContact && <span style={{ color: "#f87171", fontSize: 12 }}>🚨 {u.emergencyContact}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "posts" && (
              <div>
                {posts.length === 0 ? <div style={{ textAlign: "center", padding: "48px 0", color: sub }}><div style={{ fontSize: 48, marginBottom: 12 }}>📭</div><p>Koi snap nahi</p></div> :
                  posts.map(post => <PostCard key={post.id} post={post} isAdmin={true} />)}
              </div>
            )}

            {adminTab === "giveaway" && (
              <div>
                {!giveaway ? (
                  <div>
                    <h3 style={{ color: text, margin: "0 0 16px", fontSize: 16, fontWeight: 800 }}>🎁 Snapify Giveaway</h3>
                    <input value={newGiveaway.title} onChange={e => setNewGiveaway(g => ({ ...g, title: e.target.value }))} placeholder="Giveaway title..." style={{ ...inputStyle(false), marginBottom: 10 }} />
                    <input value={newGiveaway.prize} onChange={e => setNewGiveaway(g => ({ ...g, prize: e.target.value }))} placeholder="Prize kya hai?..." style={{ ...inputStyle(false), marginBottom: 10 }} />
                    <input type="date" value={newGiveaway.endDate} onChange={e => setNewGiveaway(g => ({ ...g, endDate: e.target.value }))} style={{ ...inputStyle(false), marginBottom: 16 }} />
                    <button onClick={() => { if (!newGiveaway.title || !newGiveaway.prize) return; setGiveaway({ ...newGiveaway, id: Date.now(), participants: [] }); showMsg("Giveaway launch! 🎁"); }} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: snapifyGradient, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🎁 Launch Karo!</button>
                  </div>
                ) : (
                  <div style={{ background: card, borderRadius: 20, padding: 20, border: `1px solid ${border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                      <div><p style={{ color: "#f97316", fontWeight: 900, fontSize: 18, margin: 0 }}>🎁 {giveaway.title}</p><p style={{ color: text, fontSize: 14, margin: "6px 0" }}>Prize: {giveaway.prize}</p><p style={{ color: sub, fontSize: 12 }}>End: {giveaway.endDate}</p></div>
                      <button onClick={() => setGiveaway(null)} style={{ background: "#f87171", border: "none", borderRadius: 10, padding: "8px 12px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", height: "fit-content" }}>End</button>
                    </div>
                    <p style={{ color: text, fontWeight: 800, fontSize: 15, marginBottom: 12 }}>👥 Participants ({giveaway.participants?.length || 0})</p>
                    {(giveaway.participants || []).map(id => { const u = users.find(x => x.id === id); return u ? <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><Avatar user={u} size={32} /><NameWithTick user={u} size={13} /></div> : null; })}
                    {giveaway.participants?.length > 0 && <button onClick={() => { const winner = users.find(u => u.id === giveaway.participants[Math.floor(Math.random() * giveaway.participants.length)]); showMsg(`🎉 Winner: ${winner?.name}!`); }} style={{ width: "100%", padding: "12px", marginTop: 12, borderRadius: 14, border: "none", background: snapifyGradient, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🎲 Random Winner!</button>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
