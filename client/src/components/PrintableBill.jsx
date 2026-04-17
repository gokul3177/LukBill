import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const PrintableBill = ({ bill, darkMode }) => {
    if (!bill) return null;

    const { billTo, billDate, items, bankAccount, grandTotal, _id } = bill;

    const dateObj = billDate ? new Date(billDate) : new Date();
    const isValidDate = !isNaN(dateObj.getTime());
    const safeDate = isValidDate ? dateObj : new Date();

    // Generate invoice number based on timestamp + random suffix
    const invoiceNumber = `INV-${safeDate.getFullYear()}${String(safeDate.getMonth() + 1).padStart(2, '0')}${String(safeDate.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // UPI payment QR — opens GPay/PhonePe/Paytm with amount pre-filled
    const upiId   = import.meta.env.VITE_UPI_ID   || '';
    const upiName = import.meta.env.VITE_UPI_NAME || 'LukBill';
    const amount  = (grandTotal || 0).toFixed(2);

    const qrValue = upiId
        ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceNumber}`)}`
        : (_id ? `lukbill://bill/${_id}` : `lukbill://invoice/${invoiceNumber}`);

    const qrLabel = upiId ? 'Scan to Pay' : 'Scan to verify';

    const textClass = darkMode ? 'text-gray-100' : 'text-gray-800';
    const subtextClass = darkMode ? 'text-gray-400' : 'text-gray-500';
    const borderClass = darkMode ? 'border-gray-600' : 'border-gray-300';
    const rowHoverClass = darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
    const bgClass = darkMode ? 'bg-gray-900' : 'bg-white';

    return (
        <div className={`max-w-4xl mx-auto ${bgClass} ${textClass} p-8 print:p-6 print-bill rounded-xl`}>

            {/* ── Header ── */}
            <div className="mb-8 pb-6 border-b-2 border-blue-600 flex justify-between items-start gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-blue-600 mb-1">INVOICE</h1>
                    <p className={`text-sm font-mono ${subtextClass}`}>{invoiceNumber}</p>
                </div>
                <div className="flex items-start gap-4">
                    <div className="text-right">
                        <h2 className={`text-2xl font-bold ${textClass}`}>LukBill</h2>
                        <p className={`text-sm mt-1 ${subtextClass}`}>Billing System</p>
                    </div>
                    {/* UPI Payment QR Code */}
                    <div className="print:block text-center">
                        <QRCodeCanvas
                            value={qrValue}
                            size={80}
                            bgColor={darkMode ? '#111827' : '#ffffff'}
                            fgColor={darkMode ? '#e5e7eb' : '#1e3a5f'}
                            level="M"
                            includeMargin={false}
                        />
                        <p className={`text-[9px] mt-1 font-semibold ${upiId ? 'text-green-600' : subtextClass}`}>{qrLabel}</p>
                    </div>
                </div>
            </div>

            {/* ── Bill Details ── */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${subtextClass}`}>Bill To</h3>
                    <p className={`text-lg font-semibold ${textClass}`}>{billTo}</p>
                </div>
                <div className="text-right">
                    <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${subtextClass}`}>Invoice Date</h3>
                    <p className={`text-lg font-semibold ${textClass}`}>
                        {safeDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* ── Items Table ── */}
            <div className="mb-8">
                <table className="w-full">
                    <thead>
                        <tr className={`border-b-2 ${borderClass}`}>
                            <th className={`text-left py-3 px-2 text-xs font-semibold uppercase tracking-wide w-10 ${subtextClass}`}>#</th>
                            <th className={`text-left py-3 px-2 text-xs font-semibold uppercase tracking-wide ${subtextClass}`}>Description</th>
                            <th className={`text-center py-3 px-2 text-xs font-semibold uppercase tracking-wide w-20 ${subtextClass}`}>Qty</th>
                            <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wide w-28 ${subtextClass}`}>Rate</th>
                            <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wide w-32 ${subtextClass}`}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items && items.length > 0 ? items.map((item, index) => (
                            <tr key={index} className={`border-b ${borderClass} ${rowHoverClass} transition-colors`}>
                                <td className={`py-4 px-2 text-sm ${subtextClass}`}>{index + 1}</td>
                                <td className={`py-4 px-2 font-medium capitalize ${textClass}`}>{item.name || 'Unknown Item'}</td>
                                <td className={`py-4 px-2 text-center ${textClass}`}>{item.quantity || 0}</td>
                                <td className={`py-4 px-2 text-right ${textClass}`}>₹{(item.price || 0).toFixed(2)}</td>
                                <td className={`py-4 px-2 text-right font-semibold ${textClass}`}>₹{(item.total || 0).toFixed(2)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className={`py-8 text-center ${subtextClass}`}>No items added</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Total ── */}
            <div className="flex justify-end mb-8">
                <div className="w-80">
                    <div className={`border-t-2 ${darkMode ? 'border-gray-400' : 'border-gray-800'} pt-4`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={subtextClass}>Subtotal:</span>
                            <span className={`font-medium ${textClass}`}>₹{(grandTotal || 0).toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between items-center pt-3 border-t ${borderClass}`}>
                            <span className={`text-lg font-bold ${textClass}`}>TOTAL:</span>
                            <span className="text-2xl font-bold text-blue-600">₹{(grandTotal || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Payment Info ── */}
            {bankAccount && (
                <div className={`rounded-lg p-4 mb-6 ${darkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50'}`}>
                    <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${subtextClass}`}>Payment Information</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${textClass}`}>Bank Account:</span>
                        <span className={`text-sm font-mono font-semibold text-blue-500`}>{bankAccount}</span>
                    </div>
                </div>
            )}

            {/* ── Footer ── */}
            <div className={`border-t ${borderClass} pt-6 mt-6`}>
                <p className={`text-center text-sm ${subtextClass}`}>Thank you for your business!</p>
                <p className={`text-center text-xs mt-2 ${subtextClass}`}>This is a computer-generated invoice.</p>
            </div>
        </div>
    );
};

export default PrintableBill;
