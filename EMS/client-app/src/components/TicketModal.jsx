export default function TicketModal({ ticket, onClose }) {
    if (!ticket) return null;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticket.ticketCode)}`;

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '10px', textAlign: 'center', maxWidth: '320px' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginTop: 0 }}>Bilet eveniment</h3>
                <p style={{ fontSize: '14px', color: '#555' }}>{ticket.eventTitle}</p>
                <p style={{ fontSize: '13px' }}>{new Date(ticket.eventDate).toLocaleString('ro-RO')}</p>
                <img src={qrUrl} alt="QR Bilet" style={{ margin: '12px 0' }} />
                <p style={{ fontSize: '11px', color: '#888', wordBreak: 'break-all' }}>{ticket.ticketCode}</p>
                <button type="button" onClick={onClose} style={{ marginTop: '12px', padding: '8px 20px', border: 'none', backgroundColor: '#007bff', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Închide</button>
            </div>
        </div>
    );
}
