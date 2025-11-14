import React, { useState, useEffect } from 'react';
// ✨ Service Import ki
import { getVillasWithStats, createVilla, deleteVilla, updateVilla } from '../../services/villaService';

const AdminVillas = () => {
  // ✨ State Inititalization (Empty Array se start karenge)
  const [villas, setVillas] = useState([]);
  const [owners, setOwners] = useState([]); // List of all owners
  const [loading, setLoading] = useState(true); // Loading state

  // Filter & Modal States
  const [filteredVillas, setFilteredVillas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentVilla, setCurrentVilla] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '', location: '', type: '2BHK', price: '', area: '', status: 'Available', description: ''
  });

  const [ownerData, setOwnerData] = useState({
    villaId: '', ownerId: '', agreementStartDate: '', agreementEndDate: ''
  });

  // ✨ 1. API DATA FETCHING (Page Load par)
  useEffect(() => {
    fetchData();
    fetchOwners();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getVillasWithStats();
      if(data.success) {
        // Backend se 'villas' array aa raha hai
        setVillas(data.villas);
        setFilteredVillas(data.villas);
      }
    } catch (error) {
      console.error("Error fetching villas:", error);
      // alert("Failed to load villas");
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/owners', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOwners(data.owners || data || []);
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  // ✨ 2. FILTER LOGIC (Frontend par hi rakha hai for speed)
  useEffect(() => {
    let result = villas;
    
    if (searchTerm) {
      result = result.filter(villa => 
        villa.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        villa.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'All') {
      result = result.filter(villa => villa.status === statusFilter);
    }
    
    setFilteredVillas(result);
  }, [villas, searchTerm, statusFilter]);


  // ✨ 3. ADD VILLA (API Integrated)
  const handleAddVilla = async () => {
    try {
      // Backend ko data bheja
      await createVilla(formData);
      
      // Success hone par list refresh ki
      alert("Villa Created Successfully! 🎉");
      setShowAddModal(false);
      resetFormData();
      fetchData(); // Data wapas mangaya
    } catch (error) {
      alert("Error creating villa");
      console.error(error);
    }
  };

  // ✨ 4. EDIT VILLA (API Integrated)
  const handleEditVilla = async () => {
    try {
      await updateVilla(currentVilla._id, formData); // MongoDB ID (_id) use karein
      
      alert("Villa Updated Successfully!");
      setShowEditModal(false);
      resetFormData();
      fetchData();
    } catch (error) {
      alert("Error updating villa");
    }
  };

  // ✨ 5. DELETE VILLA (API Integrated)
  const handleDeleteVilla = async (id) => {
    if (window.confirm('Are you sure you want to delete this villa?')) {
      try {
        await deleteVilla(id);
        alert("Villa Deleted");
        fetchData();
      } catch (error) {
        alert("Error deleting villa");
      }
    }
  };

  // ✨ 6. ASSIGN OWNER (API Integrated)
  const handleAssignOwner = async () => {
    try {
      if (!ownerData.ownerId) {
        alert("Please select an owner");
        return;
      }

      // Backend ko updated status aur owner ID bheja
      const updateData = {
        status: 'Assigned',
        owner: ownerData.ownerId, // Send the actual owner ID
        agreementStartDate: ownerData.agreementStartDate || null,
        agreementEndDate: ownerData.agreementEndDate || null
      };

      await updateVilla(ownerData.villaId, updateData);

      alert("Owner Assigned Successfully!");
      setShowAssignModal(false);
      resetOwnerData();
      fetchData();
    } catch (error) {
      alert("Error assigning owner");
      console.error(error);
    }
  };

  // ... Baaki Helper Functions ...
  const handleReassignOwner = (villa) => {
    setCurrentVilla(villa);
    setOwnerData({
      villaId: villa._id, // _id use karein
      ownerId: villa.owner?._id || villa.owner || '', // Support both populated and unpopulated owner
      agreementStartDate: villa.agreementStartDate ? villa.agreementStartDate.split('T')[0] : '',
      agreementEndDate: villa.agreementEndDate ? villa.agreementEndDate.split('T')[0] : ''
    });
    setShowAssignModal(true);
  };

  const openEditModal = (villa) => {
    setCurrentVilla(villa);
    setFormData({
      name: villa.name,
      location: villa.location,
      type: villa.type || '2BHK',
      price: villa.price,
      area: villa.area,
      status: villa.status,
      description: villa.description
    });
    setShowEditModal(true);
  };

  const openAssignModal = (villa) => {
    setCurrentVilla(villa);
    setOwnerData({
      villaId: villa._id, // MongoDB ID
      ownerName: '',
      contactNumber: '',
      agreementStartDate: '',
      agreementEndDate: ''
    });
    setShowAssignModal(true);
  };

  const resetFormData = () => {
    setFormData({ name: '', location: '', type: '2BHK', price: '', area: '', status: 'Available', description: '' });
  };

  const resetOwnerData = () => {
    setOwnerData({ villaId: '', ownerId: '', agreementStartDate: '', agreementEndDate: '' });
  };

  const exportToExcel = () => alert('Export to Excel functionality would be implemented here');
  const exportToPDF = () => alert('Export to PDF functionality would be implemented here');


  // --- STYLES OBJECT (Aapka Original Style) ---
  const styles = {
    container: { fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f8fafc', color: '#334155', padding: '24px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' },
    header: { display: 'flex', flexDirection: 'column', marginBottom: '32px', position: 'relative' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    titleContainer: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0', lineHeight: '1.2' },
    subheading: { fontSize: '16px', color: '#64748b', margin: '4px 0 0 0' },
    btnPrimary: { backgroundColor: '#157feb', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '12px 20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(21, 127, 235, 0.3)' },
    btnSecondary: { backgroundColor: '#FFFFFF', color: '#157feb', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' },
    controls: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' },
    searchContainer: { position: 'relative', flex: '1', minWidth: '280px' },
    searchInput: { width: '100%', padding: '12px 16px 12px 44px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', backgroundColor: '#f8fafc', transition: 'all 0.2s ease' },
    searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' },
    filterContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
    filterLabel: { fontSize: '15px', fontWeight: '500', color: '#475569' },
    filterSelect: { padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', backgroundColor: '#f8fafc', minWidth: '150px', cursor: 'pointer' },
    exportContainer: { display: 'flex', gap: '12px', marginLeft: 'auto' },
    statsContainer: { display: 'flex', gap: '16px', marginBottom: '24px' },
    statCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', flex: '1', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' },
    statValue: { fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' },
    statLabel: { fontSize: '14px', color: '#64748b', margin: '0' },
    tableContainer: { backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' },
    tableTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { backgroundColor: '#f8fafc' },
    tableHeaderCell: { padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tableRow: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s ease' },
    tableCell: { padding: '16px 24px', fontSize: '15px', color: '#334155' },
    villaName: { fontWeight: '600', color: '#1e293b' },
    statusBadge: (status) => ({ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', backgroundColor: status === 'Available' ? '#dcfce7' : status === 'Assigned' ? '#dbeafe' : '#fef3c7', color: status === 'Available' ? '#166534' : status === 'Assigned' ? '#1d4ed8' : '#d97706' }),
    statusDot: (status) => ({ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status === 'Available' ? '#22c55e' : status === 'Assigned' ? '#3b82f6' : '#f59e0b', marginRight: '6px' }),
    actions: { display: 'flex', gap: '8px' },
    btnOutlineBase: { background: 'transparent', border: '1px solid', borderRadius: '6px', padding: '5px 12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', },
    btnOutlineView: { borderColor: '#3b82f6', color: '#3b82f6', },
    btnOutlineEdit: { borderColor: '#16a34a', color: '#16a34a', },
    btnOutlineDelete: { borderColor: '#ef4444', color: '#ef4444', },
    modalOverlay: { position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '1000', backdropFilter: 'blur(4px)' },
    modal: { backgroundColor: '#FFFFFF', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #e2e8f0' },
    modalTitle: { fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0' },
    modalBody: { padding: '24px', overflowY: 'auto' },
    formGroup: { marginBottom: '20px' },
    formLabel: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '15px', color: '#374151' },
    formInput: { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', backgroundColor: '#f8fafc', transition: 'all 0.2s ease' },
    formSelect: { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', backgroundColor: '#f8fafc', cursor: 'pointer' },
    formTextarea: { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', backgroundColor: '#f8fafc', resize: 'vertical', minHeight: '100px', transition: 'all 0.2s ease' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b', borderRadius: '8px', padding: '4px', transition: 'all 0.2s ease' },
    emptyState: { padding: '60px 20px', textAlign: 'center' },
    emptyStateIcon: { fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' },
    emptyStateTitle: { fontSize: '20px', fontWeight: '600', color: '#475569', margin: '0 0 8px 0' },
    emptyStateDescription: { fontSize: '16px', color: '#64748b', margin: '0' }
  };

  if (loading) return <div style={styles.container}><h2 style={{textAlign:'center', marginTop:'50px'}}>Loading Villas...</h2></div>;

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>Villas Management</h1>
            <p style={styles.subheading}>Add, edit, and assign owners to villas.</p>
          </div>
          <button style={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
            <span style={{marginRight: '8px'}}>➕</span> Add New Villa
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
         <div style={styles.statCard}>
           <p style={styles.statValue}>{villas.length}</p>
           <p style={styles.statLabel}>Total Villas</p>
         </div>
         <div style={styles.statCard}>
           <p style={styles.statValue}>{villas.filter(v => v.status === 'Available').length}</p>
           <p style={styles.statLabel}>Available</p>
         </div>
         <div style={styles.statCard}>
           <p style={styles.statValue}>{villas.filter(v => v.status === 'Assigned').length}</p>
           <p style={styles.statLabel}>Assigned</p>
         </div>
         <div style={styles.statCard}>
           <p style={styles.statValue}>{villas.filter(v => v.status === 'Under Maintenance').length}</p>
           <p style={styles.statLabel}>Under Maintenance</p>
         </div>
      </div>

      {/* Search and Filter */}
      <div style={styles.controls}>
         <div style={styles.searchContainer}>
           <span style={styles.searchIcon}>🔍</span>
           <input
             type="text"
             placeholder="Search by villa name, location, or owner..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             style={styles.searchInput}
           />
         </div>
         
         <div style={styles.filterContainer}>
           <label style={styles.filterLabel} htmlFor="status-filter">Status:</label>
           <select
             id="status-filter"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             style={styles.filterSelect}
           >
             <option value="All">All</option>
             <option value="Available">Available</option>
             <option value="Assigned">Assigned</option>
             <option value="Under Maintenance">Under Maintenance</option>
           </select>
         </div>
         
         <div style={styles.exportContainer}>
           <button style={styles.btnSecondary} onClick={exportToExcel}>
             <span style={{marginRight: '8px'}}>📊</span> Export Excel
           </button>
           <button style={styles.btnSecondary} onClick={exportToPDF}>
             <span style={{marginRight: '8px'}}>📥</span> Export PDF
           </button>
         </div>
      </div>

      {/* Villas Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Villas</h2>
        </div>
        {filteredVillas.length > 0 ? (
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeaderCell}>#</th>
                <th style={styles.tableHeaderCell}>Villa Name</th>
                <th style={styles.tableHeaderCell}>Location</th>
                <th style={styles.tableHeaderCell}>Type</th>
                <th style={styles.tableHeaderCell}>Price (₹)</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Owner</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVillas.map((villa, index) => (
                <tr key={villa._id || index} style={styles.tableRow}>
                  <td style={styles.tableCell}>{index + 1}</td>
                  <td style={{...styles.tableCell, ...styles.villaName}}>{villa.name}</td>
                  <td style={styles.tableCell}>{villa.location}</td>
                  <td style={styles.tableCell}>{villa.type || '2BHK'}</td>
                  <td style={styles.tableCell}>{villa.price}</td>
                  <td style={styles.tableCell}>
                    <span style={styles.statusBadge(villa.status)}>
                      <span style={styles.statusDot(villa.status)}></span>
                      {villa.status}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{villa.owner?.firstName || villa.owner || '—'}</td>
                  
                  <td style={{...styles.tableCell, ...styles.actions}}>
                    <button 
                      style={{ ...styles.btnOutlineBase, ...styles.btnOutlineEdit }}
                      onClick={() => openEditModal(villa)} 
                      title="Edit"
                    >
                      Edit
                    </button>

                    {villa.status === 'Available' ? (
                      <button 
                        style={{ ...styles.btnOutlineBase, ...styles.btnOutlineView }}
                        onClick={() => openAssignModal(villa)} 
                        title="Assign"
                      >
                        Assign
                      </button>
                    ) : (
                      <button 
                        style={{ ...styles.btnOutlineBase, ...styles.btnOutlineView }}
                        onClick={() => handleReassignOwner(villa)} 
                        title="Reassign"
                      >
                        Reassign
                      </button>
                    )}

                    <button 
                      style={{ ...styles.btnOutlineBase, ...styles.btnOutlineDelete }}
                      onClick={() => handleDeleteVilla(villa._id)} 
                      title="Delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>🏠</div>
            <h3 style={styles.emptyStateTitle}>No villas found</h3>
            <p style={styles.emptyStateDescription}>
              {searchTerm || statusFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first villa.'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Same as before */}
      {(showAddModal || showEditModal) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{showAddModal ? 'Add New Villa' : 'Edit Villa'}</h2>
              <button style={styles.closeBtn} onClick={() => { showAddModal ? setShowAddModal(false) : setShowEditModal(false); resetFormData(); }}>✕</button>
            </div>
            <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="villa-name">Villa Name</label>
                    <input type="text" id="villa-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.formInput} placeholder="Enter villa name" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="location">Location</label>
                    <input type="text" id="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={styles.formInput} placeholder="Enter location" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="type">Type</label>
                    <select id="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={styles.formSelect}>
                      <option value="2BHK">2BHK</option><option value="3BHK">3BHK</option><option value="4BHK">4BHK</option><option value="Duplex">Duplex</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="price">Price</label>
                    <input type="text" id="price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={styles.formInput} placeholder="e.g., 1.25 Cr" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="area">Area (in sq. ft.)</label>
                    <input type="text" id="area" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} style={styles.formInput} placeholder="e.g., 2500" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="status">Status</label>
                    <select id="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={styles.formSelect}>
                      <option value="Available">Available</option><option value="Assigned">Assigned</option><option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel} htmlFor="description">Description</label>
                    <textarea id="description" rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={styles.formTextarea} placeholder="Enter villa description"></textarea>
                  </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnPrimary} onClick={showAddModal ? handleAddVilla : handleEditVilla}>{showAddModal ? 'Save Villa' : 'Update Villa'}</button>
              <button style={styles.btnSecondary} onClick={() => { showAddModal ? setShowAddModal(false) : setShowEditModal(false); resetFormData(); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Owner Modal - Same as before */}
      {showAssignModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Assign Owner</h2>
              <button style={styles.closeBtn} onClick={() => { setShowAssignModal(false); resetOwnerData(); }}>✕</button>
            </div>
            <div style={styles.modalBody}>
                 <div style={styles.formGroup}>
                   <label style={styles.formLabel}>Villa</label>
                   <input type="text" value={currentVilla ? currentVilla.name : ''} readOnly style={styles.formInput} />
                 </div>
                 <div style={styles.formGroup}>
                   <label style={styles.formLabel}>Select Owner *</label>
                   <select
                     value={ownerData.ownerId}
                     onChange={(e) => setOwnerData({...ownerData, ownerId: e.target.value})}
                     style={styles.formSelect}
                     required
                   >
                     <option value="">-- Select an Owner --</option>
                     {owners.map(owner => (
                       <option key={owner._id} value={owner._id}>
                         {owner.firstName || owner.email} - {owner.email}
                       </option>
                     ))}
                   </select>
                 </div>
                 <div style={styles.formGroup}>
                   <label style={styles.formLabel}>Agreement Start Date</label>
                   <input
                     type="date"
                     value={ownerData.agreementStartDate}
                     onChange={(e) => setOwnerData({...ownerData, agreementStartDate: e.target.value})}
                     style={styles.formInput}
                   />
                 </div>
                 <div style={styles.formGroup}>
                   <label style={styles.formLabel}>Agreement End Date</label>
                   <input
                     type="date"
                     value={ownerData.agreementEndDate}
                     onChange={(e) => setOwnerData({...ownerData, agreementEndDate: e.target.value})}
                     style={styles.formInput}
                   />
                 </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnPrimary} onClick={handleAssignOwner}>Assign Owner</button>
              <button style={styles.btnSecondary} onClick={() => { setShowAssignModal(false); resetOwnerData(); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVillas;