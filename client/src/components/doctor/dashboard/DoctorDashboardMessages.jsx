"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Send } from "lucide-react";
import { toast } from "react-toastify";
import { appointmentService } from "@/services/appointmentService";
import { authService } from "@/services/authService";
import { chatService } from "@/services/chatService";
import { chatSocketService } from "@/services/chatSocketService";

const formatTime = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPreviewTime = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const now = new Date();
  const sameDay = parsed.toDateString() === now.toDateString();
  if (sameDay) return formatTime(value);

  return parsed.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

export default function DoctorDashboardMessages() {
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeAppointmentId, setActiveAppointmentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  const filteredConversations = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((item) =>
      item.patientName.toLowerCase().includes(keyword),
    );
  }, [conversations, searchTerm]);

  const activeConversation = useMemo(() => {
    return (
      conversations.find(
        (item) => Number(item.appointmentId) === Number(activeAppointmentId),
      ) || null
    );
  }, [activeAppointmentId, conversations]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);

        const [currentUser, appointments] = await Promise.all([
          authService.getCurrentUser(),
          appointmentService.getMyAppointments(),
        ]);

        const userId = Number(currentUser?.user_id);
        setCurrentUserId(Number.isFinite(userId) ? userId : null);

        const chatEnabledAppointments = (
          Array.isArray(appointments) ? appointments : []
        ).filter((item) =>
          ["confirmed", "completed"].includes(
            String(item.status || "").toLowerCase(),
          ),
        );

        const sortedAppointments = [...chatEnabledAppointments].sort(
          (a, b) =>
            new Date(a.scheduled_at || a.created_at || 0).getTime() -
            new Date(b.scheduled_at || b.created_at || 0).getTime(),
        );

        const conversationsByPatient = new Map();

        sortedAppointments.forEach((item) => {
          const patient = item.patient || {};
          const patientKey =
            patient.user_id ||
            patient.id ||
            patient.email ||
            item.patient_user_id ||
            `patient-${item.appointment_id}`;

          const current = conversationsByPatient.get(patientKey);
          if (!current) {
            conversationsByPatient.set(patientKey, {
              appointmentId: item.appointment_id,
              appointmentIds: [Number(item.appointment_id)],
              patientName: patient.full_name || "Patient",
              subtitle: patient.email || "Lifetime chat thread",
              lastMessage: "",
              lastMessageAt: item.updated_at || item.scheduled_at,
              unread: 0,
            });
            return;
          }

          current.appointmentIds.push(Number(item.appointment_id));

          const currentTime = new Date(current.lastMessageAt || 0).getTime();
          const nextTime = new Date(
            item.updated_at || item.scheduled_at || 0,
          ).getTime();
          if (nextTime > currentTime) {
            current.lastMessageAt = item.updated_at || item.scheduled_at;
          }
        });

        const mapped = Array.from(conversationsByPatient.values());

        setConversations(mapped);
        if (mapped.length > 0) {
          setActiveAppointmentId(mapped[0].appointmentId);
        } else {
          setActiveAppointmentId(null);
        }
      } catch (error) {
        toast.error(error.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeAppointmentId) {
      setMessages([]);
      chatSocketService.disconnect();
      return;
    }

    let mounted = true;

    const updateConversationPreview = (
      appointmentId,
      nextMessage,
      timestamp,
    ) => {
      setConversations((current) =>
        current.map((item) => {
          const appointmentIds = Array.isArray(item.appointmentIds)
            ? item.appointmentIds
            : [Number(item.appointmentId)];

          if (!appointmentIds.includes(Number(appointmentId))) {
            return item;
          }

          return {
            ...item,
            lastMessage: nextMessage,
            lastMessageAt: timestamp,
          };
        }),
      );
    };

    const onNewMessage = async (payload) => {
      const nextMessage = payload?.data;
      if (!nextMessage) return;

      const appointmentId = Number(nextMessage.appointment_id);
      const isActive = Number(activeAppointmentId) === appointmentId;
      const isFromMe =
        Number(nextMessage.sender_user_id) === Number(currentUserId);

      updateConversationPreview(
        appointmentId,
        nextMessage.message,
        nextMessage.created_at,
      );

      if (!isActive) {
        if (!isFromMe) {
          setConversations((current) =>
            current.map((item) => {
              const appointmentIds = Array.isArray(item.appointmentIds)
                ? item.appointmentIds
                : [Number(item.appointmentId)];

              if (!appointmentIds.includes(appointmentId)) {
                return item;
              }

              return {
                ...item,
                unread: Number(item.unread || 0) + 1,
              };
            }),
          );
        }
        return;
      }

      setMessages((current) => {
        if (
          current.some((item) => item.message_id === nextMessage.message_id)
        ) {
          return current;
        }
        return [...current, nextMessage];
      });

      if (!isFromMe) {
        try {
          await chatSocketService.markAsRead(appointmentId);
        } catch {
          // No-op on read sync failure.
        }
      }
    };

    const loadActiveConversation = async () => {
      try {
        setLoadingMessages(true);

        const loadedMessages =
          await chatService.getMessages(activeAppointmentId);
        if (!mounted) return;

        setMessages(Array.isArray(loadedMessages) ? loadedMessages : []);

        const latest = loadedMessages[loadedMessages.length - 1];
        if (latest?.message) {
          updateConversationPreview(
            activeAppointmentId,
            latest.message,
            latest.created_at,
          );
        }

        setConversations((current) =>
          current.map((item) =>
            Number(item.appointmentId) === Number(activeAppointmentId)
              ? { ...item, unread: 0 }
              : item,
          ),
        );

        await chatService.markAsRead(activeAppointmentId);
        await chatSocketService.joinAppointmentChat(activeAppointmentId);
        chatSocketService.on("chat:new_message", onNewMessage);
      } catch (error) {
        if (mounted) {
          toast.error(error.message || "Failed to load messages");
        }
      } finally {
        if (mounted) {
          setLoadingMessages(false);
        }
      }
    };

    loadActiveConversation();

    return () => {
      mounted = false;
      chatSocketService.off("chat:new_message", onNewMessage);
      chatSocketService.disconnect();
    };
  }, [activeAppointmentId, currentUserId]);

  const handleOpenConversation = (appointmentId) => {
    setActiveAppointmentId(appointmentId);
    setShowChatList(false);
  };

  const handleSendMessage = async () => {
    const content = messageInput.trim();
    if (!content || !activeAppointmentId || sending) return;

    try {
      setSending(true);
      await chatSocketService.sendMessage(activeAppointmentId, content);
      setMessageInput("");
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">
          Chat with your patients after confirmed appointments, even after
          completion.
        </p>
      </div>

      <div className="flex h-[calc(100vh-260px)] min-h-125 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div
          className={`w-full border-r border-slate-200 md:w-80 ${
            showChatList ? "flex" : "hidden md:flex"
          } flex-col`}
        >
          <div className="border-b border-slate-200 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search conversations"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#2FA4A9]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                No conversations found.
              </p>
            ) : (
              filteredConversations.map((item) => {
                const isActive =
                  Number(item.appointmentId) === Number(activeAppointmentId);

                return (
                  <button
                    key={item.appointmentId}
                    type="button"
                    onClick={() => handleOpenConversation(item.appointmentId)}
                    className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                      isActive ? "bg-[#2FA4A9]/7" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2FA4A9]/12 text-sm font-semibold text-[#1D7D82]">
                        {item.patientName
                          .split(" ")
                          .map((chunk) => chunk[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {item.patientName}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            {formatPreviewTime(item.lastMessageAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.subtitle}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.lastMessage || "No messages yet"}
                        </p>
                      </div>

                      {item.unread > 0 ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2FA4A9] text-[10px] font-semibold text-white">
                          {item.unread}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div
          className={`flex-1 flex-col ${
            showChatList ? "hidden md:flex" : "flex"
          }`}
        >
          {!activeConversation ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-slate-500">
              No confirmed or completed appointments available for chat.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowChatList(true)}
                  className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 md:hidden"
                >
                  Back
                </button>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2FA4A9]/12 text-sm font-semibold text-[#1D7D82]">
                  {activeConversation.patientName
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {activeConversation.patientName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Lifetime appointment chat
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
                {loadingMessages ? (
                  <p className="text-sm text-slate-500">Loading messages...</p>
                ) : null}

                {!loadingMessages && messages.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No messages yet. Start the conversation.
                  </p>
                ) : null}

                {messages.map((item) => {
                  const isMine =
                    Number(item.sender_user_id) === Number(currentUserId);

                  return (
                    <div
                      key={item.message_id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${
                          isMine
                            ? "bg-[#2FA4A9] text-white"
                            : "border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word">
                          {item.message}
                        </p>
                        <p
                          className={`mt-1 text-[11px] ${
                            isMine ? "text-white/75" : "text-slate-500"
                          }`}
                        >
                          {formatTime(item.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2FA4A9]"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={sending || !messageInput.trim()}
                    className="rounded-xl bg-[#2FA4A9] p-2.5 text-white transition hover:bg-[#248d91] disabled:cursor-not-allowed disabled:opacity-70"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
