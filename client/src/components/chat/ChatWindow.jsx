import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Users, Search, Sparkles, ChevronLeft, UserPlus } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useChat from '../../hooks/useChat';
import useSocket from '../../hooks/useSocket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import SearchMessages from './SearchMessages';
import SummaryPanel from '../summary/SummaryPanel';
import Avatar from '../common/Avatar';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import { addMember, removeMember } from '../../api/conversations';
import { getUsers } from '../../api/users';

const ChatWindow = () => {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    loadingMessages,
    addMessage,
    loadMoreMessages,
    pagination,
    updateMessageTranscription,
    fetchConversations,
  } = useChat();
  const { socket, joinRoom, leaveRoom, isOnline } = useSocket();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState([]);

  useEffect(() => {
    if (!activeConversation) return;
    joinRoom(activeConversation._id);
    return () => leaveRoom(activeConversation._id);
  }, [activeConversation?._id, joinRoom, leaveRoom]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.conversation === activeConversation?._id) {
        addMessage(message);
      }
    };

    const handleTyping = ({ userId, username, conversationId }) => {
      if (conversationId !== activeConversation?._id) return;
      if (userId === user?._id) return;
      setTypingUsers((prev) => {
        if (prev.some((t) => t.userId === userId)) return prev;
        return [...prev, { userId, username }];
      });
    };

    const handleStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((t) => t.userId !== userId));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, activeConversation?._id, addMessage, user?._id]);

  useEffect(() => {
    if (typingUsers.length === 0) return;
    const timer = setTimeout(() => setTypingUsers([]), 3000);
    return () => clearTimeout(timer);
  }, [typingUsers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    if (messagesContainerRef.current.scrollTop === 0 && pagination?.page < pagination?.pages) {
      loadMoreMessages();
    }
  };

  const handleSearchMembers = async (q) => {
    setMemberSearch(q);
    if (q.length < 2) {
      setMemberResults([]);
      return;
    }
    try {
      const { data } = await getUsers(q);
      const existingIds = activeConversation.participants.map((p) => p._id);
      setMemberResults(data.filter((u) => !existingIds.includes(u._id)));
    } catch {
      setMemberResults([]);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await addMember(activeConversation._id, userId);
      await fetchConversations();
      setShowAddMember(false);
      setMemberSearch('');
      setMemberResults([]);
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMember(activeConversation._id, userId);
      await fetchConversations();
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center telegram-shell text-[#6f8597]">
        <div className="w-20 h-20 rounded-3xl bg-[#17212b] flex items-center justify-center mb-4 border border-[#273746]">
          <Hash size={34} className="text-[#49b8ff]/70" />
        </div>
        <h2 className="text-xl font-semibold text-[#d8e8f4] mb-2">Welcome to SyncTalk</h2>
        <p className="text-sm text-[#7e95a7] max-w-sm text-center">
          Select a conversation to start messaging with your team in a Telegram-style workspace.
        </p>
      </div>
    );
  }

  const isGroup = activeConversation.type === 'group';
  const otherUser = !isGroup
    ? activeConversation.participants?.find((p) => p._id !== user?._id)
    : null;
  const chatName = isGroup ? activeConversation.name : otherUser?.username || 'Unknown';

  return (
    <div className="flex-1 flex flex-col telegram-shell relative">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 telegram-header">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#243342] text-[#9ab0c1]"
          >
            <ChevronLeft size={20} />
          </button>

          {isGroup ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39b9ff] to-[#1f9af5] flex items-center justify-center text-white font-semibold shadow-lg shadow-sky-500/20">
              <Hash size={18} />
            </div>
          ) : (
            <Avatar
              name={chatName}
              src={otherUser?.avatar}
              size="md"
              online={otherUser ? isOnline(otherUser._id) : false}
            />
          )}

          <div className="min-w-0">
            <h2 className="font-semibold text-[#eaf4fc] text-sm truncate">{chatName}</h2>
            <p className="text-xs text-[#8fa5b6]">
              {isGroup
                ? `${activeConversation.participants?.length} members`
                : otherUser && isOnline(otherUser._id)
                ? 'Online'
                : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-[#2a9ceb]/25 text-[#63c6ff]' : 'text-[#90a6b8] hover:bg-[#243342] hover:text-[#d9e8f3]'}`}
            title="Search messages"
          >
            <Search size={18} />
          </button>

          {isGroup && (
            <>
              <button
                onClick={() => setShowSummary(!showSummary)}
                className={`p-2 rounded-lg transition-colors ${showSummary ? 'bg-[#2a9ceb]/25 text-[#63c6ff]' : 'text-[#90a6b8] hover:bg-[#243342] hover:text-[#d9e8f3]'}`}
                title="AI Summary"
              >
                <Sparkles size={18} />
              </button>
              <button
                onClick={() => setShowMembers(!showMembers)}
                className={`p-2 rounded-lg transition-colors ${showMembers ? 'bg-[#2a9ceb]/25 text-[#63c6ff]' : 'text-[#90a6b8] hover:bg-[#243342] hover:text-[#d9e8f3]'}`}
                title="Members"
              >
                <Users size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          {showSearch && (
            <SearchMessages
              conversationId={activeConversation._id}
              onClose={() => setShowSearch(false)}
            />
          )}

          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-1"
            style={{ background: 'linear-gradient(180deg, #0f1823 0%, #0b141a 100%)' }}
          >
            {loadingMessages ? (
              <Loader text="Loading messages..." />
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#7f95a7]">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const showAvatar =
                  !prevMsg ||
                  prevMsg.sender?._id !== msg.sender?._id ||
                  new Date(msg.createdAt) - new Date(prevMsg.createdAt) > 300000;

                return (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isOwn={msg.sender?._id === user?._id}
                    showAvatar={showAvatar}
                    onTranscriptionUpdate={updateMessageTranscription}
                  />
                );
              })
            )}
            <TypingIndicator users={typingUsers} />
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#243240] bg-[#17212b]">
            <MessageInput />
          </div>
        </div>

        {showSummary && isGroup && (
          <SummaryPanel
            conversationId={activeConversation._id}
            onClose={() => setShowSummary(false)}
          />
        )}

        {showMembers && isGroup && (
          <div className="w-72 border-l border-[#243240] bg-[#17212b] overflow-y-auto">
            <div className="p-4 border-b border-[#243240] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#d9e8f3]">
                Members ({activeConversation.participants?.length})
              </h3>
              <button
                onClick={() => setShowAddMember(true)}
                className="p-1.5 rounded-lg hover:bg-[#243342] text-[#63c6ff]"
                title="Add member"
              >
                <UserPlus size={16} />
              </button>
            </div>
            <div className="p-2">
              {activeConversation.participants?.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#223140]"
                >
                  <Avatar
                    name={member.username}
                    src={member.avatar}
                    size="sm"
                    online={isOnline(member._id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#dceaf5] truncate">
                      {member.username}
                      {member._id === user?._id && (
                        <span className="text-[#7f95a7] ml-1">(you)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#7f95a7] truncate">{member.status}</p>
                  </div>
                  {activeConversation.createdBy === user?._id &&
                    member._id !== user?._id && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-xs text-[#8da3b5] hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Member"
      >
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search users..."
            value={memberSearch}
            onChange={(e) => handleSearchMembers(e.target.value)}
            className="input-field text-sm"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {memberResults.map((u) => (
              <button
                key={u._id}
                onClick={() => handleAddMember(u._id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#223140] transition-colors"
              >
                <Avatar name={u.username} size="sm" />
                <p className="text-sm text-[#dceaf5]">{u.username}</p>
                <span className="ml-auto text-xs text-[#63c6ff]">+ Add</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatWindow;
