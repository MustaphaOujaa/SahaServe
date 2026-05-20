import React, { useState } from 'react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Order #SH-8910 is out for delivery!",
    description: "Your Royal Lamb Tagine is on its way. Track your order to see the courier's live location.",
    time: "2 mins ago",
    type: "order",
    unread: true,
    icon: "fa-truck"
  },
  {
    id: 2,
    title: "Weekend Special: 20% OFF",
    description: "Enjoy 20% off on all seafood pastillas this weekend. Use code SAHA20 at checkout.",
    time: "3 hours ago",
    type: "promo",
    unread: true,
    icon: "fa-tag"
  },
  {
    id: 3,
    title: "How was your meal?",
    description: "Your order from yesterday has been delivered. We'd love to hear your feedback!",
    time: "Yesterday",
    type: "order",
    unread: false,
    icon: "fa-box-open"
  },
  {
    id: 4,
    title: "New login detected",
    description: "A new login was detected on your account from a Chrome browser on Windows.",
    time: "2 days ago",
    type: "account",
    unread: false,
    icon: "fa-shield-alt"
  }
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIconClass = (type) => {
    switch(type) {
      case 'order': return 'bg-gold-pale text-gold';
      case 'promo': return 'bg-[#e6f7ed] text-[#27ae60]';
      case 'account': return 'bg-[#fdf2f2] text-[#e74c3c]';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-[5%]">
      <div className="max-w-[800px] mx-auto">
        <header className="flex justify-between items-center mb-8 animate-[fadeUp_0.4s_ease_both]">
          <h1 className="font-['Cormorant_Garamond'] text-[2.8rem] font-bold text-brown-dark">
            Recent <em className="text-gold italic not-italic">Notifications</em>
          </h1>
          {notifications.some(n => n.unread) && (
            <button 
              className="text-gold font-semibold text-[0.9rem] flex items-center gap-2 hover:opacity-80 transition-all"
              onClick={markAllAsRead}
            >
              <i className="fas fa-check-double"></i> Mark all as read
            </button>
          )}
        </header>

        <div className="flex flex-col gap-[1.2rem]">
          {notifications.map((notif, index) => (
            <div 
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`group bg-white rounded-[18px] p-6 shadow-custom flex gap-6 items-start relative transition-all duration-300 hover:-translate-y-[3px] hover:shadow-custom-md cursor-pointer border-l-4 ${notif.unread ? 'border-gold bg-[#fffcf7]' : 'border-transparent'} animate-[fadeUp_0.4s_ease_both]`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[1.2rem] shrink-0 ${getIconClass(notif.type)}`}>
                <i className={`fas ${notif.icon}`}></i>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-brown-dark text-[1.05rem] mb-1">{notif.title}</h3>
                <p className="text-[0.9rem] text-text-mid leading-relaxed mb-2.5">{notif.description}</p>
                <span className="text-[0.75rem] text-text-mid opacity-60">{notif.time}</span>
              </div>

              {notif.unread && (
                <div className="absolute top-6 right-6 w-2 h-2 bg-gold rounded-full"></div>
              )}

              <button 
                className="absolute bottom-6 right-6 text-text-mid opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-all text-[0.8rem]"
                onClick={(e) => deleteNotification(e, notif.id)}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-20 animate-[fadeUp_0.4s_ease_both]">
              <i className="fas fa-bell-slash text-[4rem] text-gold-pale mb-6 block"></i>
              <h3 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark mb-2">All caught up!</h3>
              <p className="text-text-mid">You have no new notifications at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
