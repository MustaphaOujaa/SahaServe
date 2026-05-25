import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useGetTablesQuery, useCreateReservationMutation } from '../redux/api/apiSlice';
import { PageLoader } from '../Components/UI/Loading';

const ReservationPage = () => {
  const navigate = useNavigate();
  const { data: tables = [], isLoading: tablesLoading } = useGetTablesQuery(true); // Fetch available tables
  const [createReservation, { isLoading: isSubmitting }] = useCreateReservationMutation();

  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    guests: 1,
    tableId: '',
    specialRequests: ''
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [tableWarning, setTableWarning] = useState('');

  // Update available tables based on guests
  useEffect(() => {
    if (formData.guests > 0 && tables.length > 0) {
      const filtered = tables.filter(t => t.capacity >= formData.guests);
      setAvailableTables(filtered);
      
      const selectedTable = tables.find(t => t.id === Number(formData.tableId));
      if (selectedTable && selectedTable.capacity < formData.guests) {
        setFormData(prev => ({ ...prev, tableId: '' }));
        setTableWarning(`The previously selected table cannot accommodate ${formData.guests} guests.`);
      } else {
        setTableWarning('');
      }
    }
  }, [formData.guests, formData.tableId, tables]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTableSelection = (e) => {
    const tableId = Number(e.target.value);
    setFormData(prev => ({ ...prev, tableId }));
    
    const selected = tables.find(t => t.id === tableId);
    if (selected && selected.capacity < formData.guests) {
      setTableWarning(`Warning: This table has a maximum capacity of ${selected.capacity}.`);
    } else {
      setTableWarning('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.start_time || !formData.end_time || !formData.tableId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.start_time >= formData.end_time) {
      toast.error("End time must be after start time.");
      return;
    }
    
    const selected = tables.find(t => t.id === Number(formData.tableId));
    if (selected && selected.capacity < formData.guests) {
      toast.error(`Table cannot take ${formData.guests} guests! Please choose another table.`);
      return;
    }

    try {
      const payload = {
        table_id: formData.tableId,
        reservation_date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        guests_number: formData.guests
      };
      
      const response = await createReservation(payload).unwrap();
      toast.success(response.message || "Reservation confirmed successfully!");
      navigate('/profile');
    } catch (err) {
      toast.error(err.data?.message || err.data?.errors?.table_id?.[0] || "Failed to make reservation. Time slot might be taken.");
    }
  };

  if (tablesLoading) {
    return <PageLoader label="Loading tables..." />;
  }

  // Get minimum date (today) for date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[rgba(250,245,236,1)] pt-28 pb-20 relative overflow-hidden flex flex-col items-center">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[rgba(200,146,42,0.15)] to-transparent -z-10"></div>
      <div className="absolute top-20 right-[-100px] w-[300px] h-[300px] rounded-full bg-[rgba(200,146,42,0.05)] blur-[50px] -z-10"></div>
      <div className="absolute bottom-20 left-[-100px] w-[400px] h-[400px] rounded-full bg-[rgba(200,146,42,0.05)] blur-[80px] -z-10"></div>

      <div className="w-full max-w-4xl px-4 z-10 flex flex-col items-center">
        
        <div className="text-center mb-12 animate-[fadeDown_0.6s_ease_both]">
          <span className="text-gold text-sm font-bold tracking-widest uppercase mb-2 block">Experience SahaServe</span>
          <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl font-bold text-brown-dark mb-4">Book Your Table</h1>
          <p className="text-text-mid max-w-lg mx-auto text-[0.95rem] leading-relaxed">
            Reserve your spot for an unforgettable dining experience. Select your preferred time, table, and let us take care of the rest.
          </p>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-[rgba(200,146,42,0.1)] overflow-hidden animate-[fadeUp_0.8s_ease_both]">
          <div className="flex flex-col md:flex-row">
            
            {/* Left side info panel */}
            <div className="bg-brown-dark text-white p-8 md:p-12 md:w-[40%] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
              
              <div className="relative z-10">
                <h3 className="font-['Cormorant_Garamond'] text-3xl font-bold mb-6 text-gold">Reservation Details</h3>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[rgba(200,146,42,0.15)] flex items-center justify-center text-gold shrink-0">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[0.9rem] mb-1">Opening Hours</h4>
                    <p className="text-[0.8rem] text-gray-300 opacity-80">Mon-Sun: 11:00 AM - 11:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[rgba(200,146,42,0.15)] flex items-center justify-center text-gold shrink-0">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[0.9rem] mb-1">Location</h4>
                    <p className="text-[0.8rem] text-gray-300 opacity-80">123 Culinary Avenue, Food District</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[rgba(200,146,42,0.15)] flex items-center justify-center text-gold shrink-0">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[0.9rem] mb-1">Contact Us</h4>
                    <p className="text-[0.8rem] text-gray-300 opacity-80">+1 234 567 890</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-12 pt-8 border-t border-[rgba(255,255,255,0.1)]">
                <p className="text-[0.85rem] italic text-gold-light">
                  "Good food is very often, even most often, simple food."
                </p>
              </div>
            </div>

            {/* Right side form */}
            <div className="p-8 md:p-12 md:w-[60%]">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.85rem] font-semibold text-brown-dark uppercase tracking-wider">Date *</label>
                    <div className="relative">
                      <i className="fas fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-gold opacity-70"></i>
                      <input 
                        type="date" 
                        name="date"
                        min={today}
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full pl-10 pr-2 py-3 bg-[rgba(250,245,236,0.5)] border border-[rgba(200,146,42,0.2)] rounded-xl text-text-dark text-[0.85rem] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[0.85rem] font-semibold text-brown-dark uppercase tracking-wider">Start Time *</label>
                    <div className="relative">
                      <i className="fas fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-gold opacity-70"></i>
                      <input 
                        type="time" 
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        className="w-full pl-10 pr-2 py-3 bg-[rgba(250,245,236,0.5)] border border-[rgba(200,146,42,0.2)] rounded-xl text-text-dark text-[0.85rem] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[0.85rem] font-semibold text-brown-dark uppercase tracking-wider">End Time *</label>
                    <div className="relative">
                      <i className="fas fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-gold opacity-70"></i>
                      <input 
                        type="time" 
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleChange}
                        className="w-full pl-10 pr-2 py-3 bg-[rgba(250,245,236,0.5)] border border-[rgba(200,146,42,0.2)] rounded-xl text-text-dark text-[0.85rem] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[0.85rem] font-semibold text-brown-dark uppercase tracking-wider">Number of Guests *</label>
                  <div className="relative flex items-center max-w-[200px]">
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                      className="w-12 h-12 flex items-center justify-center bg-[rgba(200,146,42,0.1)] text-gold rounded-l-xl hover:bg-gold hover:text-white transition-colors"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input 
                      type="number" 
                      name="guests"
                      min="1"
                      max="20"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full h-12 text-center bg-[rgba(250,245,236,0.5)] border-y border-[rgba(200,146,42,0.2)] text-text-dark text-[1.1rem] font-bold focus:outline-none"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, guests: Math.min(20, prev.guests + 1) }))}
                      className="w-12 h-12 flex items-center justify-center bg-[rgba(200,146,42,0.1)] text-gold rounded-r-xl hover:bg-gold hover:text-white transition-colors"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[0.85rem] font-semibold text-brown-dark uppercase tracking-wider">Select Table *</label>
                  <div className="relative">
                    <i className="fas fa-chair absolute left-4 top-1/2 -translate-y-1/2 text-gold opacity-70"></i>
                    <select 
                      name="tableId"
                      value={formData.tableId}
                      onChange={handleTableSelection}
                      className="w-full pl-12 pr-10 py-3 bg-[rgba(250,245,236,0.5)] border border-[rgba(200,146,42,0.2)] rounded-xl text-text-dark text-[0.95rem] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Choose a suitable table</option>
                      {availableTables.map(table => (
                        <option key={table.id} value={table.id}>
                          {table.table_number || table.name || `Table ${table.id}`} - Capacity: {table.capacity}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-text-light text-[0.7rem] pointer-events-none"></i>
                  </div>
                  {availableTables.length === 0 && formData.guests > 0 && (
                    <p className="text-red-500 text-[0.8rem] mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i> No tables available for {formData.guests} guests.
                    </p>
                  )}
                  {tableWarning && (
                    <p className="text-amber-600 text-[0.8rem] mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-triangle"></i> {tableWarning}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[0.85rem] font-semibold text-brown-dark uppercase tracking-wider">Special Requests (Optional)</label>
                  <textarea 
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows="3"
                    placeholder="E.g., Anniversary, Birthday, Allergy information..."
                    className="w-full p-4 bg-[rgba(250,245,236,0.5)] border border-[rgba(200,146,42,0.2)] rounded-xl text-text-dark text-[0.95rem] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={availableTables.length === 0 || isSubmitting}
                  className="mt-4 w-full py-4 rounded-[50px] bg-gold text-white font-bold text-[1rem] tracking-wide shadow-[0_8px_20px_rgba(200,146,42,0.3)] hover:bg-brown hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(200,146,42,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-gold flex justify-center items-center gap-2"
                >
                  {isSubmitting ? 'Confirming...' : (
                    <>Confirm Reservation <i className="fas fa-arrow-right text-[0.9rem]"></i></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReservationPage;
