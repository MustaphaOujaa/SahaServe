import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGetProfileQuery, useUpdateProfileMutation, useDeleteAccountMutation, useGetUserReservationsQuery } from '../redux/api/apiSlice';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PageLoader } from '../Components/UI/Loading';
import imageCompression from 'browser-image-compression';

const ProfilePage = () => {
  const [activeSection, setActiveSection] = useState('personal-info');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const { data: user, isLoading, isError } = useGetProfileQuery();
  const { data: userReservations = [], isLoading: loadingReservations } = useGetUserReservationsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const { logout } = useAuth();

  const getAvatarUrl = () => {
    if (!user) return null;
    if (user.image && user.image !== 'null' && user.image !== '') {
      return user.image.startsWith('http') 
        ? user.image 
        : `http://localhost:8000/storage/${user.image}`;
    }
    if (user.avatar && user.avatar !== 'null' && user.avatar !== '') {
      return user.avatar;
    }
    return null;
  };
  const avatarUrl = previewImage || getAvatarUrl();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const formData = new FormData();
      formData.append('image', compressedFile);

      const updatePromise = updateProfile(formData).unwrap();
      
      toast.promise(updatePromise, {
        loading: 'Updating profile image...',
        success: 'Profile image updated successfully!',
        error: (err) => err?.data?.message || 'Failed to update profile image',
      });
      
    } catch (error) {
      console.error('Error compressing or uploading image:', error);
      toast.error('Failed to process image');
      setPreviewImage(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone_number: formData.get('phone_number'),
      adress: formData.get('adress'),
    };
    try {
      await updateProfile(data).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    const password = document.getElementById('delete-password').value;
    if (!password) {
      toast.error('Please enter your password to confirm account deletion.');
      return;
    }
    if (window.confirm('Are you absolutely sure you want to delete your account? This cannot be undone.')) {
      try {
        await deleteAccount({ password }).unwrap();
        toast.success('Account deleted successfully.');
        logout();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete account');
      }
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading Profile..." />;
  }

  if (isError) {
    return <div className="min-h-screen bg-cream pt-32 pb-20 px-[5%] flex justify-center items-center text-red-500 font-bold">Failed to load profile data.</div>;
  }

  const orders = [
    { id: '#SH-8842', date: 'May 12, 2026', total: '$45.50', status: 'delivered' },
    { id: '#SH-8721', date: 'May 05, 2026', total: '$28.00', status: 'delivered' },
    { id: '#SH-8655', date: 'Apr 28, 2026', total: '$62.20', status: 'cancelled' },
    { id: '#SH-8501', date: 'Apr 15, 2026', total: '$33.15', status: 'delivered' },
  ];

  const renderSection = () => {
    switch(activeSection) {
      case 'personal-info':
        return (
          <div className="bg-white rounded-[24px] shadow-custom p-8 animate-[fadeUp_0.4s_ease_both]">
            <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark mb-8 pb-4 border-b border-beige flex items-center gap-3">
              <i className="fas fa-id-card text-gold"></i> Personal Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Full Name</label>
                <input name="name" type="text" defaultValue={user?.name || ''} className="px-5 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.95rem] outline-none focus:border-gold focus:bg-white transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Email Address</label>
                <input name="email" type="email" defaultValue={user?.email || ''} className="px-5 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.95rem] outline-none focus:border-gold focus:bg-white transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Phone Number</label>
                <input name="phone_number" type="tel" defaultValue={user?.phone_number || ''} className="px-5 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.95rem] outline-none focus:border-gold focus:bg-white transition-all" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Default Delivery Address</label>
                <textarea name="adress" rows="3" defaultValue={user?.adress || ''} className="px-5 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.95rem] outline-none focus:border-gold focus:bg-white transition-all resize-none"></textarea>
              </div>
              <button type="submit" disabled={isUpdating} className="w-fit px-10 py-3.5 rounded-full bg-gold text-white font-bold text-[0.95rem] shadow-[0_4px_14px_rgba(200,146,42,0.35)] hover:bg-brown transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        );
      case 'order-history':
        return (
          <div className="bg-white rounded-[24px] shadow-custom p-8 animate-[fadeUp_0.4s_ease_both]">
            <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark mb-8 pb-4 border-b border-beige flex items-center gap-3">
              <i className="fas fa-history text-gold"></i> Order History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="bg-cream text-left">
                    <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Order ID</th>
                    <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Date</th>
                    <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Total</th>
                    <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Status</th>
                    <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i} className="border-b border-beige last:border-none">
                      <td className="p-4 font-semibold text-gold">{order.id}</td>
                      <td className="p-4 text-[0.95rem] text-brown-dark">{order.date}</td>
                      <td className="p-4 text-[0.95rem] text-brown-dark font-bold">{order.total}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase ${
                          order.status === 'delivered' ? 'bg-[#e6f7ed] text-[#27ae60]' : 
                          order.status === 'cancelled' ? 'bg-[#fdf2f2] text-[#e74c3c]' : 'bg-[#fff8e6] text-[#f39c12]'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="px-4 py-1.5 rounded-full border border-gold text-gold text-[0.8rem] font-semibold hover:bg-gold hover:text-white transition-all">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'reservations':
        return (
          <div className="bg-white rounded-[24px] shadow-custom p-8 animate-[fadeUp_0.4s_ease_both]">
            <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark mb-8 pb-4 border-b border-beige flex items-center gap-3">
              <i className="fas fa-calendar-check text-gold"></i> My Reservations
            </h2>
            {loadingReservations ? (
              <p className="text-text-mid text-center py-4">Loading reservations...</p>
            ) : userReservations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-gold/50">
                  <i className="fas fa-calendar-times text-2xl"></i>
                </div>
                <p className="text-text-mid mb-4">You have no reservations yet.</p>
                <Link to="/reservation" className="inline-block px-6 py-2 rounded-full border border-gold text-gold font-semibold hover:bg-gold hover:text-white transition-all">
                  Book a Table
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr className="bg-cream text-left">
                      <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Date & Time</th>
                      <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Table</th>
                      <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Guests</th>
                      <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Status</th>
                      <th className="p-4 text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userReservations.map((res, i) => (
                      <tr key={res.id || i} className="border-b border-beige last:border-none">
                        <td className="p-4">
                          <span className="block font-semibold text-brown-dark">{res.reservation_date}</span>
                          <span className="text-[0.8rem] text-text-mid">{res.start_time} - {res.end_time}</span>
                        </td>
                        <td className="p-4 text-[0.95rem] text-brown-dark">{res.table?.name || res.table?.table_number || `Table ${res.table_id}`}</td>
                        <td className="p-4 text-[0.95rem] text-brown-dark font-bold">{res.guests_number} <i className="fas fa-user text-gold/60 ml-1"></i></td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase ${
                            res.status === 'confirmed' ? 'bg-[#e6f7ed] text-[#27ae60]' : 
                            res.status === 'cancelled' ? 'bg-[#fdf2f2] text-[#e74c3c]' : 
                            res.status === 'completed' ? 'bg-[#f0f4f8] text-[#34495e]' : 
                            'bg-[#fff8e6] text-[#f39c12]' // pending
                          }`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button className="px-4 py-1.5 rounded-full border border-gold text-gold text-[0.8rem] font-semibold hover:bg-gold hover:text-white transition-all disabled:opacity-50">
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'track-order':
        return (
          <div className="bg-white rounded-[24px] shadow-custom p-8 animate-[fadeUp_0.4s_ease_both]">
            <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark mb-8 pb-4 border-b border-beige flex items-center gap-3">
              <i className="fas fa-map-location-dot text-gold"></i> Track Your Order
            </h2>
            <div className="flex flex-col gap-6">
              <div className="bg-gold-pale p-5 rounded-[12px] border-l-4 border-gold flex justify-between items-center">
                <div>
                  <span className="font-bold text-brown-dark block text-[1.1rem]">Order #SH-8910</span>
                  <p className="text-[0.85rem] text-text-mid mt-0.5">Currently being delivered by scooter.</p>
                </div>
                <div className="flex items-center gap-2 text-gold font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#27ae60] animate-pulse"></span> Out for Delivery
                </div>
              </div>
              <div className="relative h-[400px] rounded-[24px] overflow-hidden shadow-md">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.8463519391094!2d-7.640656923456!3d33.58334467333642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d2938361074d%3A0x6b2e1b12f2c27b0!2sQuartier%20Gauthier%2C%20Casablanca%2020250%2C%20Morocco!5e0!3m2!1sen!2sma!4v1715850000000!5m2!1sen!2sma" 
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Tracking Map"></iframe>
                <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md p-5 rounded-[12px] shadow-lg flex items-center gap-6">
                  <div className="flex items-center gap-4">
                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80" alt="Courier" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <span className="font-bold text-brown-dark block">Yassine B.</span>
                      <span className="text-[0.8rem] text-text-mid flex items-center gap-1.5"><i className="fas fa-star text-gold"></i> 4.9 Courier</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full border border-beige bg-white text-text-mid flex items-center justify-center hover:text-gold hover:border-gold transition-all"><i className="fas fa-phone"></i></button>
                    <button className="w-10 h-10 rounded-full border border-beige bg-white text-text-mid flex items-center justify-center hover:text-gold hover:border-gold transition-all"><i className="fas fa-message"></i></button>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-[1.2rem] font-bold text-gold block">12 mins</span>
                    <span className="text-[0.7rem] uppercase text-text-mid tracking-wider">Estimated Arrival</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-[24px] shadow-custom p-8 animate-[fadeUp_0.4s_ease_both]">
            <h2 className="font-['Cormorant_Garamond'] text-[1.8rem] font-bold text-brown-dark mb-8 pb-4 border-b border-beige flex items-center gap-3">
              <i className="fas fa-cog text-gold"></i> Account Settings
            </h2>
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Current Password</label>
                  <input type="password" placeholder="••••••••" className="px-5 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.95rem] outline-none focus:border-gold transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">New Password</label>
                  <input type="password" placeholder="Enter new password" className="px-5 py-3 rounded-[12px] border-[1.5px] border-beige bg-cream text-[0.95rem] outline-none focus:border-gold transition-all" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-5 h-5 border-2 border-beige rounded bg-white group-hover:border-gold transition-all"></div>
                    <i className="fas fa-check absolute text-[0.6rem] text-gold left-[4px] opacity-100"></i>
                  </div>
                  <span className="text-text-mid text-[0.9rem]">Receive email notifications for order updates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-5 h-5 border-2 border-beige rounded bg-white group-hover:border-gold transition-all"></div>
                    <i className="fas fa-check absolute text-[0.6rem] text-gold left-[4px] opacity-0"></i>
                  </div>
                  <span className="text-text-mid text-[0.9rem]">Get exclusive promotional offers and discounts</span>
                </label>
              </div>
              <button type="button" className="w-fit px-10 py-3.5 rounded-full bg-gold text-white font-bold text-[0.95rem] shadow-[0_4px_14px_rgba(200,146,42,0.35)] hover:bg-brown transition-all">Save Changes</button>
              
              {/* Delete Account Zone */}
              <div className="flex flex-col gap-1.5 md:col-span-2 mt-8 pt-8 border-t border-beige">
                <h3 className="text-red-600 font-bold mb-2 flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> Danger Zone</h3>
                <label className="text-[0.75rem] font-bold text-text-mid uppercase tracking-wider">Password to confirm deletion</label>
                <input id="delete-password" type="password" placeholder="Enter password to delete account" className="px-5 py-3 rounded-[12px] border-[1.5px] border-red-200 bg-red-50 text-[0.95rem] outline-none focus:border-red-500 transition-all" />
                <button 
                  type="button" 
                  onClick={handleDeleteAccount}
                  className="w-fit mt-3 px-10 py-3.5 rounded-full bg-red-600 text-white font-bold text-[0.95rem] shadow-[0_4px_14px_rgba(220,38,38,0.35)] hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-[5%]">
      <div className="max-w-[1200px] mx-auto">
        {/* Profile Header */}
        <section className="bg-white rounded-[24px] shadow-custom p-10 flex flex-wrap md:flex-nowrap items-center gap-10 mb-10 relative overflow-hidden animate-[fadeUp_0.4s_ease_both]">
          <div className="absolute top-0 right-0 w-[300px] h-full bg-[radial-gradient(circle_at_top_right,rgba(200,146,42,0.05),transparent)] pointer-events-none"></div>
          <div className="relative shrink-0 group">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="User Avatar" 
                className="w-[120px] h-[120px] rounded-full border-4 border-gold-pale object-cover shadow-md transition-opacity group-hover:opacity-90 bg-white" 
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full border-4 border-gold-pale shadow-md transition-opacity group-hover:opacity-90 bg-cream flex items-center justify-center text-gold/60">
                <i className="fas fa-user-circle text-[7.5rem]"></i>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center border-2 border-white text-[0.8rem] hover:scale-110 transition-transform shadow-md cursor-pointer"
              title="Update Profile Picture"
            >
              <i className="fas fa-camera"></i>
            </button>
          </div>
          <div className="flex-1">
            <h1 className="font-['Cormorant_Garamond'] text-[2.8rem] font-bold text-brown-dark leading-tight">{user?.name}</h1>
            <p className="text-text-mid flex items-center gap-2 mt-1">
              <i className="fas fa-envelope text-gold"></i> {user?.email}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
          {/* Sidebar Nav */}
          <aside className="bg-white rounded-[24px] shadow-custom p-6 flex flex-col gap-1.5 animate-[fadeUp_0.4s_0.1s_ease_both]">
            {[
              { id: 'personal-info', icon: 'fa-user', label: 'Personal Info' },
              { id: 'order-history', icon: 'fa-history', label: 'Order History' },
              { id: 'reservations', icon: 'fa-calendar-check', label: 'My Reservations' },
              { id: 'track-order', icon: 'fa-map-location-dot', label: 'Track Your Order' },
              { id: 'settings', icon: 'fa-cog', label: 'Settings' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-[12px] text-[0.95rem] font-medium transition-all ${activeSection === item.id ? 'bg-cream text-gold font-bold' : 'text-text-mid hover:bg-cream/50'}`}
              >
                <i className={`fas ${item.icon} w-5 text-[1.1rem] ${activeSection === item.id ? 'text-gold' : 'text-gold opacity-70'}`}></i>
                {item.label}
              </button>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-3.5 rounded-[12px] text-[0.95rem] font-medium text-[#e74c3c] hover:bg-[#fdf2f2] mt-4 transition-all w-full text-left">
              <i className="fas fa-sign-out-alt w-5 text-[1.1rem]"></i> Logout
            </button>
          </aside>

          {/* Content Area */}
          <div className="flex flex-col gap-10">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
