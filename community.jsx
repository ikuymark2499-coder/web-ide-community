import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { Terminal, Heart, Eye, User, ArrowLeft, Share2, Copy, Code } from 'lucide-react';

// --- Firebase Configuration (MUST MATCH EDITOR) ---
const firebaseConfig = {
  apiKey: "AIzaSyANrna15ivEKuiMbYBnHIuspe1FvcqV8zY",
  authDomain: "my-code-hub.firebaseapp.com",
  projectId: "my-code-hub",
  storageBucket: "my-code-hub.firebasestorage.app",
  messagingSenderId: "613216136098",
  appId: "1:613216136098:web:46da39b2918059d8a120fb",
  measurementId: "G-MV34NCN3X6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'my-code-hub-v1';

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('feed');
  const [selectedPost, setSelectedPost] = useState(null);

  // IMPORTANT: Set your Editor URL here
  const EDITOR_URL = "https://your-editor-app-url.vercel.app";

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleLike = async (postId, e) => {
    e.stopPropagation();
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
    await updateDoc(docRef, { likes: increment(1) });
  };

  const openDetails = async (post) => {
    setSelectedPost(post);
    setView('details');
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', post.id);
    await updateDoc(docRef, { views: increment(1) });
  };

  if (!user) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-blue-400 p-8 text-center">
      <div className="p-4 rounded-full bg-blue-500/10 mb-6 border border-blue-500/20"><Code size={40}/></div>
      <h1 className="text-2xl font-black text-white mb-2">Access Restricted</h1>
      <p className="text-sm opacity-60 mb-6 max-w-xs text-slate-400 font-medium">Please sign in to the Editor application first to access the community hub.</p>
      <button onClick={() => window.location.href = EDITOR_URL} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-600/20 transition-transform active:scale-95">Go to Editor</button>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-300 font-sans flex flex-col overflow-hidden">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="text-blue-500" size={24}/>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase">Code Community</h1>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-bold text-blue-400">{user.email}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {view === 'feed' ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Explore Shared Code</h2>
            <div className="grid gap-4">
              {posts.length === 0 ? (
                <div className="p-20 text-center text-slate-600 border border-dashed border-slate-800 rounded-3xl">No posts yet. Be the first to publish!</div>
              ) : (
                posts.map(post => (
                  <div key={post.id} onClick={() => openDetails(post)} className="bg-[#0f172a] border border-slate-800 p-6 rounded-[1.5rem] hover:border-blue-500 transition-all cursor-pointer group shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{post.title}</h3>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2 mt-1"><User size={12}/> {post.author}</span>
                      </div>
                      <div className="text-[10px] text-slate-600">{new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl text-[11px] font-mono text-blue-300 opacity-40 h-20 overflow-hidden relative mb-4">
                      <pre>{post.code}</pre>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
                    </div>
                    <div className="flex gap-4 text-xs font-bold text-slate-500">
                      <button onClick={(e) => handleLike(post.id, e)} className="flex items-center gap-1.5 hover:text-pink-500 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Heart size={14}/> {post.likes}</button>
                      <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Eye size={14}/> {post.views}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setView('feed')} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-white transition-colors"><ArrowLeft size={18}/> Back to feed</button>
            <div className="bg-[#0f172a] border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedPost.title}</h2>
                    <p className="text-xs text-slate-500 mt-1">Shared by {selectedPost.author}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {navigator.clipboard.writeText(selectedPost.code); alert("Copied!");}} className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Copy size={14}/> Copy
                    </button>
                    <button onClick={() => alert("Ready to reuse!")} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Import to Editor</button>
                  </div>
               </div>
               <div className="p-8 bg-[#020617] overflow-x-auto">
                <pre className="text-sm font-mono text-blue-300 leading-relaxed">{selectedPost.code}</pre>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
      }
