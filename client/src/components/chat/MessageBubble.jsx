import { useMemo } from 'react';
import Avatar from '../common/Avatar';

const formatTime = (dateString) => {
  try {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const MessageBubble = ({ message, isOwn, showAvatar }) => {
  const senderName = useMemo(() => message?.sender?.username || 'User', [message]);
  const content = message?.content || '';
  const time = formatTime(message?.createdAt);

  return (
    <div className={`tg-bubble-row ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="w-8 mr-2 flex-shrink-0">
          {showAvatar ? <Avatar name={senderName} src={message?.sender?.avatar} size="sm" /> : null}
        </div>
      )}

      <div className={`tg-bubble ${isOwn ? 'tg-bubble-own' : 'tg-bubble-other'}`}>
        {!isOwn && (
          <p className="text-[11px] font-semibold text-[#69c8ff] mb-0.5">
            {senderName}
          </p>
        )}

        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{content}</p>

        <div className={`mt-1 text-[10px] ${isOwn ? 'text-sky-100/85' : 'text-slate-400'}`}>
          {time}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
