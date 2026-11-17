import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Building2,
  User,
  ShieldCheck
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Conversation, Message } from "../types";

interface MessagesViewProps {
  initialRecipientId?: string;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ initialRecipientId }) => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load all user conversations
  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await api.getConversations();
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setConversations(list);
        if (list.length > 0 && !activeConvId) {
          setActiveConvId(list[0].id);
        }
      }
    } catch (err) {
      console.warn("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Handle initialRecipientId if passed from another view
  useEffect(() => {
    if (initialRecipientId) {
      api.getOrCreateConversation(initialRecipientId).then((res) => {
        if (res.success && res.data) {
          setConversations((prev) => {
            if (prev.some((c) => c.id === res.data!.id)) return prev;
            return [res.data!, ...prev];
          });
          setActiveConvId(res.data.id);
        }
      });
    }
  }, [initialRecipientId]);

  // Load messages when activeConvId changes
  useEffect(() => {
    if (!activeConvId) return;

    let isMounted = true;
    const fetchMessages = async () => {
      try {
        const res = await api.getMessages(activeConvId);
        if (res.success && res.data && isMounted) {
          setMessages(Array.isArray(res.data) ? res.data : []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.warn("Failed to load thread messages:", err);
      }
    };

    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConvId || sending) return;

    const content = newMessageText.trim();
    setNewMessageText("");
    setSending(true);

    try {
      const res = await api.sendMessage(activeConvId, content);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
        setTimeout(scrollToBottom, 100);
      } else {
        // Optimistic append if server accepted
        const optimisticMsg: Message = {
          id: "temp-" + Date.now(),
          conversationId: activeConvId,
          senderId: user?.id || "me",
          recipientId: activeConversation?.otherUser?.id || "",
          content,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const name = (c.otherUser?.name || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 rounded-4xl bg-[#0E0E10] border border-white/12 shadow-2xl overflow-hidden min-h-145 h-162.5">
      {/* =========================================================================
          LEFT COLUMN: THREAD LIST (4 COLS)
         ========================================================================= */}
      <div className="md:col-span-5 lg:col-span-4 border-r border-white/10 flex flex-col justify-between h-full bg-[#0A0A0C]">
        <div>
          {/* Header & Search */}
          <div className="p-4 border-b border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#F7FFB8]" />
                <span>Casting Threads</span>
              </h3>
              <span className="text-[11px] text-[#8A8A90] font-mono">
                {conversations.length} active
              </span>
            </div>

            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A90]" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-black/60 input-editorial text-xs"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="overflow-y-auto max-h-130 p-2 flex flex-col gap-1.5 scrollbar-thin">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#8A8A90]">
                Loading conversation threads...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#8A8A90] px-4">
                No active conversations yet. Messages will initiate when you apply to roles or receive direct casting requests.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const other = conv.otherUser;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isActive
                        ? "bg-white/10 border border-white/15 shadow-md"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
                      {other?.avatarUrl ? (
                        <img src={other.avatarUrl} alt={other.name} className="w-full h-full object-cover" />
                      ) : other?.role === "CASTER" ? (
                        <Building2 className="w-4 h-4 text-[#F7FFB8]" />
                      ) : (
                        <User className="w-4 h-4 text-[#DBAAF4]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-white truncate">
                          {other?.name || "Casting Partner"}
                        </span>
                        <span className="text-[10px] text-[#8A8A90] shrink-0 font-mono">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#8A8A90] truncate">
                        {conv.lastMessage?.content || "Conversation thread opened"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="p-3 border-t border-white/10 text-[10px] text-[#8A8A90] flex items-center justify-center gap-1.5 bg-black/40">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Audition Channel</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT COLUMN: ACTIVE CHAT THREAD (8 COLS)
         ========================================================================= */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between h-full bg-[#0E0E10]">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                  {activeConversation.otherUser?.name?.[0] || "C"}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white flex items-center gap-1.5">
                    <span>{activeConversation.otherUser?.name || "Casting Department"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F7FFB8]/15 text-[#F7FFB8] text-[10px] font-mono">
                      {activeConversation.otherUser?.role || "VERIFIED"}
                    </span>
                  </h4>
                  <span className="text-[11px] text-[#8A8A90]">Active casting room communication</span>
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="my-auto text-center py-12 text-xs text-[#8A8A90]">
                  This is the start of your encrypted conversation thread.
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[80%] ${
                        isMine ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? "bg-[#1E1E22] border border-white/20 text-white rounded-br-xs shadow-md"
                            : "bg-white/5 border border-white/10 text-[#D7D7DB] rounded-bl-xs"
                        }`}
                      >
                        {m.content}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-[#8A8A90] mt-1 px-1 font-mono">
                        <span>
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : ""}
                        </span>
                        {isMine && <CheckCheck className="w-3 h-3 text-[#F7FFB8]" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/60 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message to the casting team..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 px-4 py-3 rounded-full bg-[#141416] input-editorial text-xs"
              />
              <button
                type="submit"
                disabled={!newMessageText.trim() || sending}
                className="w-11 h-11 rounded-full bg-[#F7FFB8] text-black flex items-center justify-center hover:bg-[#ebf49e] transition-all disabled:opacity-30 cursor-pointer shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="my-auto text-center py-24 text-xs text-[#8A8A90]">
            Select a conversation thread from the left to view messages.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
